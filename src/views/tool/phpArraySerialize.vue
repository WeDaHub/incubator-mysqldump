<template>
    <div>
        <Input v-model="current.input" :rows="7" type="textarea" placeholder="内容"></Input>
        <option-block>
            <FormItem>
                <Select v-model="current.source" style="width:200px">
                    <Option v-for="v in type" :value="v" :key="v">源数据:{{ v }}</Option>
                </Select>
            </FormItem>
            <FormItem>
                <Select v-model="current.target" style="width:200px">
                    <Option v-for="v in type" :value="v" :key="v">目标数据:{{ v }}</Option>
                </Select>
            </FormItem>
            <FormItem>
                <ButtonGroup>
                    <Button type="primary" @click="handle()">转换</Button>
                </ButtonGroup>
            </FormItem>
        </option-block>
        <Input v-model="current.output" :rows="7" type="textarea" placeholder="结果"></Input>
    </div>
</template>
<script>
    import jsonToPhpArray from "phparr"
    import phpArrayToJson from "php-array-reader"
    import phpSerialize from "serialize-php"

    export default {
        created() {
            this.current = Object.assign(this.current, this.$getToolData("input"))
        },
        methods: {
            handle() {
                if (this.current.input) {
                    let target = "";
                    let source = {};
                    try {
                        switch (this.current.source) {
                            case "phpArray":
                                source = phpArrayToJson.fromString(this.current.input);
                                break;
                            case "phpSerialize":
                                source = phpSerialize.unserialize(this.current.input);
                                break;
                            case "jsJson":
                                source = JSON.parse(this.current.input);
                                break;
                            case "String":
                                // td.html(dat._source.body);
                                source = JSON.parse(this.current.input);
                                console.log(source);
                                break;
                            default:
                                return;
                        }
                    }
                    catch (e) {
                        this.$Message.error("源数据解析错误:"+e.message);
                        return;
                    }
                    try {
                        switch (this.current.target) {
                            case "phpArray":
                                target = jsonToPhpArray(source);
                                break;
                            case "phpSerialize":
                                target = phpSerialize.serialize(source);
                                break;
                            case "jsJson":
                                target = JSON.stringify(source);
                                break;
                            case "String":
                                target = source;
                                break;
                            default:
                                return;
                        }
                    }
                    catch (e) {
                        this.$Message.error("目标数据转换错误:"+e.message);
                        return;
                    }
                    this.current.output = target;
                    this.$clipboardCopy(this.current.output);
                    this.$saveToolData(this.current);
                }
            },
            paramsEncode(param, key, encode) {
                if (param==null) return '';
                let paramStr = '';
                let t = typeof (param);
                let paramArr = Array();
                if (t === 'string' || t === 'number' || t === 'boolean') {
                    paramStr += '&' + key + '='  + ((encode==null||encode) ? encodeURIComponent(param) : param);
                } else {

                    for (let i in param) {
                        paramArr.push(  key == null? i: i + '=' + (encode===null? param[i] :this.url_encode(param[i]))    );
                        // let k = key == null ? i : key + (param instanceof Array ? '[' + i + ']' : '.' + i);
                        // paramStr += this.url_encode(param[i])
                    }
                }
                paramStr = paramArr.join('&');
                // console.log(paramStr);
                return paramStr;

            },
            url_encode (str) {
                str = (str + '').toString();

                return encodeURIComponent(str).replace(/!/g, '%21').replace(/'/g, '%27').replace(/\(/g, '%28').
                replace(/\)/g, '%29').replace(/\*/g, '%2A').replace(/%20/g, '+');
                // return str;
            }
        },
        data() {
            return {
                current: {
                    input: "",
                    output: "",
                    source: "phpArray",
                    target: "jsJson"
                },
                type: ["phpArray", "phpSerialize", "jsJson", "String"],
            }
        },
    }
</script>