<template>
    <div class="hello" style="width: 100%; padding: 15px; max-width: 600px; margin: 0 auto; text-align: center;">
        <div v-if="!isOver">
            <h1>出示二维码</h1>
            <!--<el-button @click="getKeys">点我</el-button>-->
            <qrcode-vue v-if="value != ''" :value="value" size="240" level="M" foreground="#212121"
                        style="margin-top: 50px;"></qrcode-vue>
        </div>
        <mu-card
                v-else
                style="width: 100%; margin-bottom: 10px; text-align: left; position: relative;">
            <mu-card-title title="转账成功"></mu-card-title>
            <mu-divider></mu-divider>
            <div style="padding: 10px 15px 5px 15px; ">
                <mu-form :model="form" label-position="top" style="">
                    <mu-form-item label="代币">
                        <mu-text-field :value="symbol" readonly></mu-text-field>
                    </mu-form-item>
                    <mu-form-item label="发送者">
                        <mu-text-field :value="account.name" readonly></mu-text-field>
                    </mu-form-item>
                    <mu-form-item label="接收者">
                        <mu-text-field v-model="form.to" readonly></mu-text-field>
                    </mu-form-item>
                    <mu-form-item label="数量（必须为四位小数数字）">
                        <mu-text-field v-model="form.number" type="number" readonly></mu-text-field>
                    </mu-form-item>
                    <mu-form-item label="备注（可选）">
                        <mu-text-field v-model="form.memo" readonly></mu-text-field>
                    </mu-form-item>
                    <mu-form-item label="交易ID">
                        <mu-text-field v-model="trx_id" readonly></mu-text-field>
                    </mu-form-item>
                    <div style="margin-bottom: 20px; display: flex; justify-content: space-between;">
                        <mu-button color="success" @click="goBack">返回</mu-button>
                        <mu-button color="primary" @click="goTracker">查看</mu-button>
                    </div>
                </mu-form>
            </div>
        </mu-card>
    </div>
</template>

<script>
    /* eslint-disable no-undef */
    import QrcodeVue from 'qrcode.vue'

    export default {
        name: 'QrCode',
        components: {
            QrcodeVue
        },
        data() {
            return {
                configList: configList,
                configObj: null,
                id: null,
                code: null,
                symbol: null,
                account: null,
                form: {
                    to: '',
                    number: '',
                    memo: ''
                },
                isOver: false,
                isTring: false,
                trx_id: '',
                value: '',
                isRun: false,
                T: null,
                lastId: -1
            }
        },
        created: function () {
            let self = this
            self.$emit('setTop', {back: true, add: false, qr: false, path: '1'})
            self.id = self.$route.params.id
            self.account = null
            let tmp = self.$parent.accountList
            for (let i in tmp) {
                if (tmp[i].id == self.id) {
                    self.account = tmp[i]
                }
            }
            if (self.account != null && self.configList[self.account.netId] != undefined) {
                self.configObj = self.configList[self.account.netId]

                let obj = {
                    name: self.account.name,
                    head: 'disToken_QR',
                    type: 'pos_pay'
                }
                self.value = JSON.stringify(obj)

                self.isRun = true
                self.T = setInterval(function () {
                    self.QueryTask()
                }, 1000)
            } else {
                self.$router.replace('/AccountList')
            }
        },
        beforeDestroy: function () {
            let self = this
            if (self.T != null) {
                clearInterval(self.T)
            }
        },
        destroyed: function () {
            let self = this
            if (self.T != null) {
                clearInterval(self.T)
            }
        },
        methods: {
            QueryTask: function () {
                let self = this
                self.QueryNewMsg(self.lastId, function (res) {
                    let datas = res.datas
                    if (datas.length > 0 && self.lastId != -1) {
                        let tmp = datas[datas.length - 1]
                        let key = CryptoJS.enc.Hex.parse('74d811ae023038d5a4036cb6b12e8215467edf56a426f9574632ed79911f2b88')
                        let iv = CryptoJS.enc.Hex.parse('0697327deacb3f7696dc0baafc5810a8')
                        let bytes = CryptoJS.AES.decrypt(tmp.memo, key, {iv: iv})
                        let plaintext = bytes.toString(CryptoJS.enc.Utf8)
                        try {
                            let obj = JSON.parse(plaintext)
                            if (obj.head == 'disToken_MSG' && obj.type == 'pos_pay') {
                                self.token_name = obj.msg.token
                                if (self.token_name == self.sysToken.name) {
                                    self.nowToken = self.sysToken
                                }
                                if (self.pluginToken.length > 0) {
                                    self.userToken = self.userToken.concat(self.pluginToken)
                                }
                                for (let i in self.userToken) {
                                    if (self.userToken[i].name == self.token_name) {
                                        self.nowToken = self.userToken[i]
                                    }
                                }
                                if (self.nowToken.name != '' && self.isRun) {
                                    self.isRun = false
                                    if (self.T != null) {
                                        clearInterval(self.T)
                                    }
                                    self.form.to = obj.msg.to
                                    self.form.number = obj.msg.number
                                    let tempMemo = `order - ${new Date().getTime()}`
                                    if (obj.msg.memo != undefined && obj.msg.memo != '') {
                                        tempMemo = obj.msg.memo
                                    }
                                    self.form.memo = tempMemo
                                    self.transferBalance()
                                }
                            }
                        } catch (e) {
                            console.log(e)
                        }
                    }
                    self.lastId = res.lastId
                })
            },
            QueryNewMsg: function (id, cb) {
                let self = this
                let config = self.config
                let eos = Eos(config)
                let accountName = self.account.name
                let pos = -1
                let offset = -10
                eos.getActions(accountName, pos, offset).then(result => {
                    let actions = result.actions
                    let list = []
                    let res = {
                        datas: [],
                        lastId: -1
                    }
                    for (let i in actions) {
                        let tmp = actions[i]
                        if (tmp.action_trace.receipt.receiver == accountName && tmp.action_trace.act.name == 'transfer' && tmp.action_trace.act.account == 'sakmsg' && tmp.action_trace.act.data.to == accountName)
                            list.push(tmp)
                    }
                    res.lastId = actions.length == 0 ? 0 : actions[actions.length - 1].account_action_seq
                    if (list.length > 0) {
                        for (let i in list) {
                            let obj = list[i]
                            let data = {
                                id: -1,
                                time: '',
                                from: '',
                                memo: ''
                            }
                            data.id = obj.account_action_seq
                            data.time = obj.block_time
                            data.from = obj.action_trace.act.data.from
                            data.memo = obj.action_trace.act.data.memo
                            if (data.id > id || data.id == 0) {
                                res.datas.push(data)
                            }
                            if (i == list.length - 1) {
                                res.lastId = data.id
                            }
                        }
                    }
                    cb(res)
                }).catch(error => {
                    console.log(error)
                })
            },
            transferBalance: function () {
                let self = this
                if (self.account.name != '' && self.form.to !== '' && Number.parseFloat(self.form.number) > 0 && !self.isTring) {
                    self.$prompt(`付款给 ${self.form.to} 金额 ${self.form.number} ${self.nowToken.name}`, '请输入交易密码', {inputType: 'password'}).then(data => {
                        const loading = self.$loading()
                        setTimeout(function () {
                            if (data.result && data.value != undefined && data.value != '') {
                                let bytes = CryptoJS.AES.decrypt(self.account.key, data.value)
                                let plaintext = ''
                                try {
                                    plaintext = bytes.toString(CryptoJS.enc.Utf8)
                                } catch (e) {
                                    loading.close()
                                    self.$alert('交易密码错误', '提示', {type: 'error'})
                                    return
                                }
                                self.isTring = true
                                let config = self.config
                                config.keyProvider = plaintext
                                config.authorization = `${self.account.name}@active`
                                let eos = Eos(config)
                                let quantity = self.form.number.toString() + ' ' + self.nowToken.name
                                if (self.nowToken.isSys) {
                                    eos.transfer(self.account.name, self.form.to, quantity, self.form.memo).then(result => {
                                        let trx_id = result.transaction_id
                                        self.trx_id = trx_id
                                        loading.close()
                                        self.isTring = false
                                        self.isOver = true
                                        self.$alert('转账成功', '提示', {type: 'success'})
                                    }).catch(error => {
                                        loading.close()
                                        console.log(error)
                                        self.isTring = false
                                        self.$alert('转账失败', '提示', {type: 'error'})
                                    })
                                } else {
                                    eos.contract(self.nowToken.account).then(con => {
                                        con.transfer(self.account.name, self.form.to, quantity, self.form.memo).then(result => {
                                            let trx_id = result.transaction_id
                                            self.trx_id = trx_id
                                            loading.close()
                                            self.isTring = false
                                            self.isOver = true
                                            self.$alert('转账成功', '提示', {type: 'success'})
                                        }).catch(error => {
                                            loading.close()
                                            console.log(error)
                                            self.isTring = false
                                            self.$alert('转账失败', '提示', {type: 'error'})
                                        })
                                    }).catch(error => {
                                        loading.close()
                                        console.log(error)
                                        self.isTring = false
                                        self.$alert('转账失败', '提示', {type: 'error'})
                                    })
                                }
                            } else {
                                loading.close()
                            }
                        }, 500)
                    }).catch(e => {
                        console.log(e)
                    })

                }
            },
            goBack() {
                let self = this
                if (self.T != null) {
                    clearInterval(self.T)
                }
                self.$router.go(-1);
            },
            goTracker() {
                window.open(this.trackerAddress + '' + this.trx_id)
            }
        }
    }
</script>

<style scoped>
    h1, h2 {
        font-weight: normal;
    }
</style>
