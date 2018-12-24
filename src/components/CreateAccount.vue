<template>
    <div class="hello" style="width: 100%; padding: 15px; max-width: 600px; margin: 0 auto; text-align: left;">
        <mu-card
                style="width: 100%; margin-bottom: 10px; text-align: left; position: relative;">
            <mu-card-title title="创建账户"></mu-card-title>
            <mu-divider></mu-divider>
            <div style="padding-top: 10px; padding-bottom: 50px;">
                <mu-stepper :active-step="vactiveStep" orientation="vertical">
                    <mu-step>
                        <mu-step-label>
                            生成秘钥对
                        </mu-step-label>
                        <mu-step-content>
                            <p>
                                点击按钮，将在本地生成你的公钥和私钥
                            </p>
                            <mu-button class="demo-step-button" @click="submitStep1" color="primary">下一步</mu-button>
                        </mu-step-content>
                    </mu-step>
                    <mu-step>
                        <mu-step-label>
                            创建账户
                        </mu-step-label>
                        <mu-step-content>
                            <p>
                                先输入账户名称，然后选择目标链，最后点击按钮，将用生成的秘钥对在目标链上尝试创建账户
                            </p>
                            <mu-text-field v-model="form.accountName" label="账户名（12位，只包含a-z和1-5）"
                                           full-width></mu-text-field>
                            <br/>
                            <mu-select label="目标链" v-model="form.netId" full-width>
                                <mu-option v-for="configObj in configList" :key="configObj.netId"
                                           v-if="configObj.canCreate"
                                           :label="configObj.netName"
                                           :value="configObj.netId"></mu-option>
                            </mu-select>
                            <mu-button class="demo-step-button" @click="submitStep2" color="primary">下一步</mu-button>
                            <mu-button flat class="demo-step-button" @click="vhandlePrev" style="margin-left: 10px;">上一步
                            </mu-button>
                        </mu-step-content>
                    </mu-step>
                    <mu-step>
                        <mu-step-label>
                            记住你的私钥
                        </mu-step-label>
                        <mu-step-content>
                            <p class="text">
                                {{ form.privateKey }}
                            </p>
                            <p>
                                <mu-button flat color="primary" @click="doCopy">
                                    点击复制
                                </mu-button>
                                <!--<mu-button flat color="primary" @click="doImport"-->
                                <!--style="margin-left: 10px;">-->
                                <!--直接导入-->
                                <!--</mu-button>-->
                            </p>
                            <p>
                                &nbsp;
                            </p>
                            <mu-button v-show="false" class="demo-step-button" @click="submitStep3" color="primary">完成
                            </mu-button>
                        </mu-step-content>
                    </mu-step>
                </mu-stepper>
            </div>
        </mu-card>

    </div>
</template>

<script>
    /* eslint-disable no-undef */

    export default {
        name: 'Other',
        data() {
            return {
                configList: configList,
                nodeJsAddress: '',
                msg: '创建账户',
                form: {
                    privateKey: '',
                    publicKey: '',
                    accountName: '',
                    netId: '',
                    aesKey: ''
                },
                vactiveStep: 0
            }
        },
        created() {
            let self = this
            self.$emit('setTop', {back: true, add: false, qr: false, scan: false, path: '9'})
        },
        computed: {
            vfinished() {
                return this.vactiveStep == 3;
            }
        },
        methods: {
            doCopy() {
                let self = this
                self.$copyText(self.form.privateKey).then(function () {
                    self.$alert('复制成功', '提示', {type: 'success'})
                }, function () {
                    self.$alert('复制失败', '提示', {type: 'error'})
                })
            },
            getKeys(cb) {
                let self = this
                const loading = self.$loading()
                setTimeout(function () {
                    self.$parent.getKeys().then(privateKey => {
                        loading.close()
                        self.form.privateKey = privateKey
                        self.form.publicKey = self.$parent.privateToPublic(privateKey)
                        cb()
                    }).catch(() => {
                        loading.close()
                        cb('error')
                    })
                }, 500)
            },
            createAccount(cb) {
                let self = this
                const loading = self.$loading()
                setTimeout(function () {
                    self.$http.post(`${self.nodeJsAddress}/eosSak/CreateSysAccount`, {
                        accountName: self.form.accountName,
                        pk: self.form.publicKey
                    }, {emulateJSON: true}).then((res) => {
                        let data = res.data
                        if (data.success) {
                            loading.close()
                            cb()
                        } else {
                            loading.close()
                            cb('error')
                        }
                    }, () => {
                        loading.close()
                        cb('error')
                    })
                }, 500)
            },
            submitStep1() {
                let self = this
                self.getKeys(function (e) {
                    if (e == 'error') {
                        self.$alert('秘钥生成失败', '提示', {type: 'error'})
                    } else {
                        self.vactiveStep = 1
                    }
                })
            },
            submitStep2() {
                let self = this
                let reg = /^[a-z1-5]{12}$/
                if (!reg.test(self.form.accountName)) {
                    self.$alert('账户名格式不对', '提示', {type: 'error'})
                } else if (self.form.netId == '') {
                    self.$alert('必须选择目标链', '提示', {type: 'error'})
                } else {
                    // console.log(self.form)
                    let configObj = self.configList[self.form.netId]
                    self.nodeJsAddress = configObj.nodeJsAddress
                    self.createAccount(function (e) {
                        if (e == 'error') {
                            self.$alert('账户创建失败', '提示', {type: 'error'})
                        } else {
                            self.vactiveStep = 2
                        }
                    })
                }
            },
            submitStep3() {
                let self = this
                self.vactiveStep = 3
            },
            vhandlePrev() {
                this.vactiveStep--;
            },
            // doImport() {
            //     let CryptoJS = require("crypto-js")
            //     let self = this
            //     self.$prompt('请输入交易密码', '提示', {inputType: 'password'}).then(({result, value}) => {
            //         if (result) {
            //             if (value != undefined && value != '') {
            //                 let hasAccs = self.$cookies.isKey('disTokenAccounts')
            //                 let tmp
            //                 if (hasAccs) {
            //                     let oldTmp = self.$cookies.get('disTokenAccounts')
            //                     tmp = JSON.parse(oldTmp)
            //                 } else {
            //                     tmp = []
            //                 }
            //                 self.form.aesKey = value
            //                 let ciphertext = CryptoJS.AES.encrypt(self.form.privateKey, self.form.aesKey);
            //                 let aesR = ciphertext.toString()
            //                 let acc = {
            //                     id: new Date().getTime(),
            //                     name: self.form.accountName,
            //                     netName: self.form.netName,
            //                     key: aesR,
            //                     ram: {
            //                         ram_quota: '0',
            //                         ram_usage: '0'
            //                     },
            //                     cpu: {
            //                         max: '0',
            //                         available: '0',
            //                         used: '0'
            //                     },
            //                     net: {
            //                         max: '0',
            //                         available: '0',
            //                         used: '0'
            //                     }
            //                 }
            //                 tmp.push(acc)
            //                 self.$cookies.set('disTokenAccounts', JSON.stringify(tmp), '15d')
            //                 self.$router.replace('/AccountList')
            //             }
            //         }
            //     })
            // }
        }
    }
</script>

<style scoped>
    h1, h2 {
        font-weight: normal;
    }

    .text {
        word-break: break-all;
    }
</style>
