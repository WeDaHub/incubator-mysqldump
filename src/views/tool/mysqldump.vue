<template>
    <div>
        <Row :gutter="16">
            <Col span="16">
                <Input  v-model="current.exampleMsSQLCmd" placeholder="输入MySQL连接命令,如mysql -uroot -p123456 -h127.0.0.1 -P3306 --default-character-set=utf8">
                    <span slot="prepend">自动填写</span>
                </Input>
                <option-block>
                    <FormItem>
                        <Button type="primary" @click="handle()">确定</Button>
                    </FormItem>
                </option-block>
                <Row :gutter="16">
                    <Col span="8" style="margin-bottom: 16px;">
                        <Input v-model="current.host" placeholder="Host">
                             <Icon type="ios-globe" slot="prepend"></Icon>

                        </Input>
                    </Col>
                    <Col span="8">
                        <Input v-model="current.user" placeholder="user">
                             <Icon type="ios-person" slot="prepend"></Icon>
                        </Input>
                    </Col>
                    <Col span="8">
                        <Input v-model="current.passwd" placeholder="password">
                             <Icon type="ios-lock" slot="prepend"></Icon>
                        </Input>
                    </Col>
                </Row>
                <Row :gutter="16" style="margin-bottom: 16px">
                    <Col span="8">
                        <Input v-model="current.database" placeholder="database">
                             <Icon type="ios-home" slot="prepend"></Icon>
                        </Input>
                    </Col>
                    <Col span="8">
                        <Input v-model="current.table" placeholder="table">
                             <Icon type="ios-keypad" slot="prepend"></Icon>
                        </Input>
                    </Col>
                    <Col span="8">
                        <Input v-model="current.port" placeholder="port">
                             <Icon type="ios-sync" slot="prepend"></Icon>
                        </Input>
                    </Col>
                </Row>
                <Row :gutter="16" >
                    <Col span="16">
                        <Input v-model="current.where" placeholder="where条件">
                             <Icon type="ios-pulse" slot="prepend"></Icon>
                        </Input>
                    </Col>
                    <Col span="8">
                        <Input v-model="current.charset" placeholder="字符集">
                             <Icon type="md-code" slot="prepend"></Icon>
                        </Input>
                    </Col>
                </Row>
                <option-block>
                    <FormItem>
                        <Checkbox v-model="current.onlyStruct">仅结构</Checkbox>
                    </FormItem>
                    <FormItem>
                        <Checkbox v-model="current.onlyData">仅数据</Checkbox>
                    </FormItem>
                    <FormItem>
                        <Checkbox v-model="current.replacesql">Replace</Checkbox>
                    </FormItem>
                    <FormItem>
                        <Checkbox  v-model="current.skipLockDB">避免锁库</Checkbox>
                    </FormItem>
                    <FormItem>
                        <Checkbox  v-model="current.hasColomn">列名称</Checkbox>
                    </FormItem>
                    <FormItem>
                        <Checkbox  v-model="current.simple">去注释</Checkbox>
                    </FormItem>
                </option-block>
                <Input v-model="output" :rows="12" type="textarea" placeholder="结果"></Input>
            </Col>

            <Col span="8">
                <Tabs value="example">
                    <TabPane label="例子" name="example">
                        <Table stripe size="small" height="474" :columns="example.columns" :data="example.data"></Table>
                    </TabPane>
                </Tabs>
            </Col>
        </Row>
    </div>
</template>
<script>

    import config from "../../tool/config";
    import { Base64 } from 'js-base64';
    export default {
        computed: {
            output() {
                if(this.current.onlyStruct){
                    this.current.onlyData=false;
                }

                let result = `mysqldump -h${this.current.host} -u${this.current.user} -p${this.current.passwd} -P${this.current.port} --default-character-set=${this.current.charset} --hex-blob --skip-extended-insert `
                result += this.current.onlyStruct?' --no-data ':'';
                result += this.current.onlyData?' --no-create-info ':'';
                result += this.current.replacesql?' --replace ':'';
                result += this.current.skipLockDB?' --skip-lock-tables ':'';
                result += this.current.hasColomn?' --complete-insert ':'';
                result += this.current.simple?' --skip-tz-utc  --compact  ':'';
                result += `${this.current.database.trim()} ${this.current.table.trim()}`;
                result += this.current.where?` --where "${this.current.where}"`:'';
                //默认显示result.sql,如果存在database名 显示为databse.sql,如果存在表名,显示database.table.sql
                result += this.current.table.trim()?` > ${this.current.database.trim()}\.${this.current.table.trim()}`:this.current.database.trim()?` > ${this.current.database.trim()}`:' > result';
                result += this.current.onlyStruct?'.struct':'';
                result += this.current.onlyData?'.data':'';
                result += '.sql';
                this.$saveToolData(this.current);
                return result;
            },
        },
        created() {
            this.current = Object.assign(this.current, this.$getToolData());
        },
        methods: {
            handle() {
                var regexTest = function(regex,content,res_index){
                var result = '';
                var reg = new RegExp(regex,'g');
                var arr = reg.exec(content);
                // console.log(arr);
                    if(arr){
                        result = arr[res_index];
                    }
                    return result;
                };
                
                this.current.host = regexTest('-h[ \f\n\r\t\v]{0,}([^ \f\n\r\t\v]{1,})[ \f\n\r\t\v]{0,1}', this.current.exampleMsSQLCmd, 1);
                this.current.user = regexTest('-u[ \f\n\r\t\v]{0,}([^ \f\n\r\t\v]{1,})[ \f\n\r\t\v]{0,1}', this.current.exampleMsSQLCmd, 1);
                this.current.passwd = regexTest('-p[ \f\n\r\t\v]{0,}([^ \f\n\r\t\v]{1,})[ \f\n\r\t\v]{0,1}', this.current.exampleMsSQLCmd, 1);
                this.current.port = regexTest('-P[ \f\n\r\t\v]{0,}([^ \f\n\r\t\v]{1,})[ \f\n\r\t\v]{0,1}', this.current.exampleMsSQLCmd, 1);
                this.current.charset = regexTest('set=[ \f\n\r\t\v]{0,}([^ \f\n\r\t\v]{1,})[ \f\n\r\t\v]{0,1}', this.current.exampleMsSQLCmd, 1);
                if (this.current.charset === ''){
                    this.current.charset='utf8';
                }

                this.$saveToolData(this.current);
            },
        },
        
        data() {
            return {
                current: {
                    exampleMsSQLCmd: "",
                    host: "",
                    user: "",
                    passwd: "",
                    database: "",
                    table: "",
                    where: "",
                    port: "3306",
                    charset: "utf8",
                    onlyStruct: false,
                    onlyData: false,
                    skipLockDB: true,
                    hasColomn: true,
                    simple: true,
                    replacesql: false
                },
                example: {
                    columns: [
                        {title: '参数', key: 'example', width: 180},
                        {title: '说明', key: 'text'},
                    ],
                    data: [
                        {example: "--all-databases  , -A", text: "导出全部数据库"},
                        {example: "--add-drop-database", text: "每个数据库创建之前添加drop数据库语句"},
                        {example: "--compact", text: "去除注释信息,参数参数会去掉时区参数配置,导致timestamp类型字段时间不准,需要与--skip-tz-utc 一起使用"},
                        {example: "--skip-extended-insert", text: "insert 语句分按条导出"},
                        {example: "--complete-insert,  -c", text: "使用完整的insert语句(包含列名称)"},
                        {example: "--databases,  -B", text: "导出的DB"},
                        {example: "--hex-blob", text: "将BINARY、VARBINARY、BLOG和BIT列类型备份为16进制的格式，mysqldump到处的文件一般是文本文件，但是如果有上述类型，在文本模式下可能有些字符不可见。"},
                        {example: "--ignore-table", text: "忽略指定表。指定忽略多个表时，需要重复多次，每次一个表。每个表必须同时指定数据库和表名。例如：--ignore-table=database.table1 --ignore-table=database.table2 ……"},
                        {example: "--replace", text: "使用REPLACE INTO 取代INSERT INTO"},
                        {example: "--single-transaction", text: "保证数据一致性:在导出数据之前提交一个BEGIN SQL语句，BEGIN 不会阻塞任何应用程序且能保证导出时数据库的一致性状态。它只适用于多版本存储引擎，仅InnoDB。本选项和--lock-tables 选项是互斥的，因为LOCK  TABLES 会使任何挂起的事务隐含提交。要想导出大表的话，应结合使用--quick 选项。"},
                        {example: "--tz-utc", text: "在导出顶部设置时区TIME_ZONE='+00:00' ，以保证在不同时区导出的TIMESTAMP 数据或者数据被移动其他时区时的正确性。"},
                    ]
                }
            }
        }
    }
</script>