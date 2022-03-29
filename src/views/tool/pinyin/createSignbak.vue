<template>
    <div>
        <Row :gutter="16">
            <Col span="8" style="margin-bottom: 16px;">
                <Input v-model="current.offerid" placeholder="OfferID eg:midas_conf_release.t_offer FOfferID">
                    <Icon type="ios-globe" slot="prepend"></Icon>
                </Input>
            </Col>
            <Col span="8">
                <Input v-model="current.appKey" placeholder="AppKey midas_conf_release.t_offer FSecretKey">
                    <Icon type="ios-person" slot="prepend"></Icon>
                </Input>
            </Col>
            <Col span="8">
                <Input v-model="current.cgi" placeholder="cgi path  eg: /cgi-bin/coupons_info.fcg">
                    <Icon type="ios-person" slot="prepend"></Icon>
                </Input>
            </Col>
        </Row>
        <Input v-model="current.input" :rows="7" type="textarea" placeholder="请求串 eg: action=query_valid_sp_coupons&curpage=1&pagesize=3&query_type=plat&req_from=backend&ts=1565080622&user_id=20190099" style="margin-bottom: 16px;"></Input>
        <Input v-model="current.privateKey" :rows="7" type="textarea" placeholder="私钥 eg: midas_conf_release.t_permission FOrderPrivateKey"></Input>
        <option-block>
            <FormItem>
                <ButtonGroup>
                    <Button type="primary" @click="handle()">复制结果</Button>
                    <!--<Button type="primary" @click="handle()">证书格式化</Button>-->
                </ButtonGroup>
            </FormItem>
            <FormItem>
                <Checkbox v-model="current.autoupdateTs">自动更新ts</Checkbox>
            </FormItem>
        </option-block>
        <Input v-model="autogetReqParams" :rows="7" type="textarea" placeholder="结果"></Input>
    </div>
</template>
<script>
    import jsrsasign from 'jsrsasign';
    export default {
        computed:{
            autogetReqParams(){
                let inparams = this.current.input.split('&');
                let obj = {};
                for (let i of inparams){
                    obj[i.split("=")[0]] = i.split("=")[1];
                }
                let ts = parseInt(((new Date()).getTime() - 8 * 60 * 60 * 1000) / 1000 );
                if (this.current.autoupdateTs === true){
                    obj.ts = ts;
                }
                delete obj.sign;
                delete obj.sign_type;
                delete obj.from_https;
                delete obj.mid;
                delete obj.ver;
                delete obj.app_ip;
                delete obj.offer_id;

                const sortKey = Object.keys(obj).sort();
                let newObj = {};//创建一个新的对象，用于存放排好序的键值对
                for (var i = 0; i < sortKey.length; i++) {//遍历newkey数组
                    newObj[sortKey[i]] = obj[sortKey[i]];//向新创建的对象中按照排好的顺序依次增加键值对
                }
                console.log(newObj);
                let strtosign = this.paramsEncode(newObj,'&');
                let sign = this.getSign(strtosign+this.current.appKey);

                newObj.sign = sign;
                let res = 'curl -d ';
                res += `'from_https=1&mid=r&ver=v1&app_ip=127.0.0.1&offer_id=${this.current.offerid}&`+strtosign+'&sign='+this.url_encode(sign)+'\'';
                // res = sign === ''? '证书错误': res + "   \"http://127.0.0.1:8085/cgi-bin/\"";
                res = sign === ''? '证书错误': res + ` "http://127.0.0.1:8085/${this.current.cgi}"`;
                console.log(res);
                console.log(newObj);

                // this.current.output=res;
                // this.$clipboardCopy(this.current.output);
                this.$saveToolData(this.current);

                return res;
            },
        },
        created() {
            this.current = Object.assign(this.current,this.$getToolData("input"))
        },
        methods: {
            handle() {
                this.$clipboardCopy(this.current.output);
                this.$saveToolData(this.current);
            },
            getSign(strtoSign){
                console.log('Str to create sign:'+strtoSign);
                let rsa = new jsrsasign.RSAKey();
                let k = `-----BEGIN PRIVATE KEY-----\n${this.current.privateKey}\n-----END PRIVATE KEY-----`;
                let sign='';

                try {
                    rsa = jsrsasign.KEYUTIL.getKey(k);
                    let sig = new jsrsasign.KJUR.crypto.Signature({"alg": "SHA256withRSA"});
                    // 初始化
                    sig.init(rsa);
                    // 传入待加密字符串
                    // let str = this.current.input + this.current.appKey;
                    sig.updateString(strtoSign);
                    // 生成密文
                    sign = jsrsasign.hextob64(sig.sign());
                    // 对加密后内容进行URI编码
                    // sign = encodeURIComponent(sign);
                }catch (err) {
                    sign="";
                }
                console.log(sign);
                // this.current.output=sign;
                return sign;
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
                        paramArr.push(  key == null? i: i + '=' + (encode===null? param[i] :param[i])    );
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
            }
        },
        data() {
            return {
                current:{
                    input: "",
                    offerid:"",
                    appKey:"",
                    cgi:"",
                    privateKey: "",
                    output: "",
                    operation:"",
                    autoupdateTs: true,
                },
            }
        },
    }
</script>