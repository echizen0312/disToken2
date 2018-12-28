<template>
    <div class="hello" style="width: 100%; padding: 15px; max-width: 600px; margin: 0 auto; text-align: center;">
        <mu-paper v-if="!isOver" :z-depth="3">
            <div v-if="configObj != null" class="account-info" :z-depth="3"
                 :style="{backgroundColor: configObj.netColor}">
                <div class="account-info-row" style="height: 42px;">
                    <div style="flex: 1; font-size: 30px; font-weight: 500; letter-spacing: 4px;">{{ account.name }}
                    </div>
                    <!--<div style="width: 48px; height: 48px; display: flex; justify-content: center; align-items: center;">-->
                    <!--<mu-button icon small @click="doCopy">-->
                    <!--<mu-icon value="filter_none"></mu-icon>-->
                    <!--</mu-button>-->
                    <!--</div>-->
                </div>
                <div class="account-info-row" style="height: 32px;">
                    <div style="flex: 1; font-size: 14px; font-weight: 400; letter-spacing: 2px;">
                        所在链 <span style="font-size: 14px;">{{configObj.netName}}</span>
                    </div>
                </div>
            </div>
            <div style="padding-top: 30px; padding-bottom: 40px;">
                <qrcode-vue v-if="value != ''" :value="value" size="240" level="L" foreground="#212121"></qrcode-vue>
            </div>
        </mu-paper>
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

    let CryptoJS = require("crypto-js")

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
            self.$emit('setTop', {back: true, add: false, qr: false, scan: false, path: '1'})
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

                self.lastId = -1
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
                                self.code = obj.msg.code
                                self.symbol = obj.msg.symbol
                                if (self.code != '' && self.symbol != '' && self.isRun) {
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
                self.$parent.queryNewMsg(self.configObj.netId, self.account, id, function (r) {
                    if (r.success) {
                        cb(r.result)
                    } else {
                        // cb(false)
                    }
                })
            },
            transferBalance: function () {
                let self = this
                if (self.account.name != '' && self.form.to !== '' && Number.parseFloat(self.form.number) > 0 && !self.isTring) {
                    let text = `交易给 ${self.form.to} 代币 ${self.form.number} ${self.symbol}`
                    let quantity = self.form.number.toString() + ' ' + self.symbol
                    self.$parent.transfer(self.configObj.netId, self.account, self.code, quantity, self.account.name, self.form.to, self.form.memo, text, function (r) {
                        if (r.success) {
                            // console.log(r)
                            let trx_id = r.result.transaction_id
                            self.trx_id = trx_id
                            self.isTring = false
                            self.isOver = true
                            self.$alert('转账成功', '提示', {type: 'success'})
                        } else {
                            self.$alert(r.msg, '提示', {type: 'error'})
                        }
                    })
                }
            },
            doCopy() {
                let self = this
                self.$copyText(self.account.name).then(function () {
                    self.$alert('复制成功', '提示', {type: 'success'})
                }, function () {
                    self.$alert('复制失败', '提示', {type: 'error'})
                })
            },
            goBack() {
                let self = this
                if (self.T != null) {
                    clearInterval(self.T)
                }
                self.$router.go(-1);
            },
            goTracker() {
                window.open(this.configObj.trackerAddress + '' + this.trx_id)
            }
        }
    }
</script>

<style scoped>
    .account-info {
        margin-top: 8px;
        margin-bottom: 16px;
        padding: 8px 8px 8px 24px;
        display: flex;
        flex-direction: column;
        justify-content: flex-start;
        align-items: flex-start;
        position: relative;
        color: white;
    }

    .account-info-row {
        width: 100%;
        display: flex;
        justify-content: flex-start;
        align-items: center;
    }
</style>
