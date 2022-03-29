<template>
 <div>
     <Row :gutter="16">
         <Col span="12">
             <Row :gutter="16" style="margin-bottom: 16px">
             <Col span="8">
                 <Input v-model="current.database" placeholder="database">
                     <Icon type="ios-home" slot="prepend"></Icon>
                 </Input>
             </Col>
             <Col span="8">
                 <Input  v-model="current.table" placeholder="table">
                     <span slot="prepend">Table</span>
                 </Input>
             </Col>
             </Row>
             <option-block>
                 <FormItem>
                     <Checkbox v-model="current.autowrap">自动换行</Checkbox>
                     <Checkbox v-model="current.ignoreNull">忽略NULL</Checkbox>
                     <Checkbox v-model="current.ignoreValue">忽略空值</Checkbox>
                     <Checkbox v-model="current.timetonow">更新时间</Checkbox>
                     <Button type="primary" @click="getText()">确定</Button>
                     <Button type="primary" @click="export_result()">复制结果</Button>
                 </FormItem>

             </option-block>
             <Input v-model="current.dbstring" :rows="14" type="textarea" placeholder="MySQL [database]> select * from table limit 1 \G
*************************** 1. row ***************************
        key1: value1
        time: 2022-03-01 00:00:00
"></Input>
         </Col>
         <Col span="12">
             <Input v-model="output" :rows="19" type="textarea" placeholder="insert into database.table set key1 = 'value1', time=now();"></Input>
         </Col>
     </Row>
 </div>
</template>

<script>
    import axios from 'axios'
    export default {
        name: "dbinsert",
        computed: {
            output() {
                return this.getText();
            },
        },
        data() {
            return {
                current: {
                    dbstring: "",
                    text: "",
                    database:"",
                    table: "",
                    autowrap: true,
                    ignoreNull: true,
                    ignoreValue: true,
                    timetonow: false
                }
            }
        },
        created() {
            this.current = Object.assign(this.current, this.$getToolData());
        },
        methods: {
            /**
             * 示例(一般为从DB中查出来的结果 直接复制粘贴):
             * FOfferID: 1019885135
             * FAppID: 1019885135
             * FMerchantID: 99679153
             * 期望结果:
             * insert into table set FOfferID='1019885135', FAppID='1019885135', FMerchantID='99679153';
             * */
            getText(){
                var kvalues = new Array();
                kvalues = this.current.dbstring.split(`\n`);
                console.log(kvalues.length);
                if(kvalues.length === 1 && kvalues[0] === ''){
                    return '';
                }
                let res_sql='insert into ';
                let ftable  = this.current.database.length !==0 ? `${this.current.database}.${this.current.table}`: `${this.current.table}`;
                // console.log(ftable);
                if ( ftable === '' ){
                    // 包含MySQL [order_center]> select * from t_table where fcolomn="value" 时,要识别到表名
                    let table_reg=new RegExp('from\\s+([0-9a-zA-Z_]+?)(\\s+|;|\\\\G|$)', "gi");
                    console.log(table_reg);
                    for (let i=0; i < kvalues.length; i++ ){
                        console.log('---'+i);
                        let kvalue_string = kvalues[i].trim();
                        if (kvalue_string === '') continue;
                        let arr = table_reg.exec(kvalue_string);
                        if ( arr ){
                            console.log(arr);
                            ftable=arr[1];
                            console.log(ftable);

                            break;
                        }
                    }
                }

                res_sql += ftable;
                res_sql += ' set ';

                for (let i=0; i < kvalues.length; i++ ){
                    let kvalue_string = kvalues[i].trim();
                    let kvalue_arr = new Array();
                    if (kvalue_string === '') continue;
                    kvalue_arr=kvalue_string.split(': ');
                    console.log('------'+kvalue_arr[0]+'----'+kvalue_arr[1]);
                    // 通过': '分割,没有value的值
                    if ( kvalue_arr.length === 1){
                        // if (kvalues.length === 1 ) return '';
                        // console.log(kvalue_arr.length);
                        kvalue_arr[0] = kvalue_arr[0].substring(0, kvalue_arr[0].length - 1);
                        kvalue_arr[1] = '';
                    }
                    // kvalue_arr[1] = kvalue_arr[1].trim();
                    //检测时间字段,key值带有time,将value转换为 now()
                    var reg = RegExp(/[Tt][Ii][Mm][Ee]/);
                    var reg_timeout = RegExp(/[Tt][Ii][Mm][Ee][Oo][Uu][Tt]/);
                    var reg_key = RegExp(/^[a-zA-Z][0-9a-zA-Z_]*$/);
                    let insert_kv='';
                    // 判断key值是否合法
                    if ( ! kvalue_arr[0].match(reg_key) ) {
                        continue;
                    }

                    // if (i === 0 ) insert_kv += 'set ';
                    // 时间戳转换为now() key中带有time并且不是timeout
                    if ( kvalue_arr[0].match(reg) && ! kvalue_arr[0].match(reg_timeout) ){
                        insert_kv += this.current.timetonow?`${kvalue_arr[0]} = now(), `:`${kvalue_arr[0]} = '${kvalue_arr[1]}', `;
                    // 值为NULL的情况例如 comment:NULL
                    }else if ( kvalue_arr[1] === 'NULL'){
                        //如果忽略NULL值的
                        insert_kv += this.current.ignoreNull ?'':`${kvalue_arr[0]} = '', `;
                    // 值为空的情况    例如 comment:
                    }else if ( this.current.ignoreValue && kvalue_arr[1] ==='' ){
                        continue;
                    }else {
                        insert_kv += `${kvalue_arr[0]} = '${kvalue_arr[1]}', `;
                    }

                    // if(this.current.autowrap && insert_kv !== '' ) res_sql += `${insert_kv}\n`;
                    if (insert_kv !== '') res_sql += this.current.autowrap?`${insert_kv}\n`:`${insert_kv}`;
                }
                if (this.current.autowrap) {
                    res_sql = res_sql.substring(0, res_sql.length - 3);
                }else{
                    res_sql = res_sql.substring(0, res_sql.length - 2);
                }
                res_sql += ';';

                this.$saveToolData(this.current);
                return res_sql;
                // return this.dbstring;
            },
            export_result(){
                this.$clipboardCopy(this.getText());

            }
        }
    }
</script>

<style scoped>

</style>
