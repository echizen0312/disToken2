<template>
    <div style="width: 100%; padding: 10px; max-width: 600px; margin: 0 auto;">
        <!--<mu-card v-if="!isOver && configObj.eosAddress == 'http://39.105.44.204:8888' && symbol == 'NXT'" style="width: 100%; margin-bottom: 10px; text-align: left; position: relative;">-->
        <mu-card v-if="!isOver && configObj.netId == '999' && (symbol == 'NXT' || symbol == 'EOS')"
                 style="width: 100%; margin-bottom: 10px; text-align: left; position: relative;">
            <mu-card-title title="主链转到NatureToken"></mu-card-title>
            <mu-divider></mu-divider>
            <div class="account-item-head" :style="{backgroundColor: configObj.netColor}"></div>
            <div style="padding: 10px 15px 5px 15px; ">
                <mu-form :model="form" label-position="top" style="">
                    <mu-form-item label="代币">
                        <mu-text-field :value="symbol" readonly></mu-text-field>
                    </mu-form-item>
                    <mu-form-item label="发送者（主链）">
                        <mu-text-field :value="account.name" readonly></mu-text-field>
                    </mu-form-item>
                    <mu-form-item label="接收者（NatureToken链）">
                        <mu-text-field v-model="form.to"></mu-text-field>
                    </mu-form-item>
                    <mu-form-item label="数量（必须为四位小数数字）">
                        <mu-text-field v-model="form.number" type="number"></mu-text-field>
                    </mu-form-item>
                    <mu-form-item label="备注（可选）">
                        <mu-text-field v-model="form.memo"></mu-text-field>
                    </mu-form-item>
                    <div style="margin-bottom: 20px; display: flex; justify-content: flex-end;">
                        <mu-button color="error" @click="transferBalance">提交</mu-button>
                    </div>
                </mu-form>
            </div>
        </mu-card>
        <mu-card
                v-if="!isOver && configObj.netId == '002' && (symbol == 'NXT' || symbol == 'EOS')"
                style="width: 100%; margin-bottom: 10px; text-align: left; position: relative;">
            <mu-card-title title="NatureToken转到主链"></mu-card-title>
            <mu-divider></mu-divider>
            <div class="account-item-head" :style="{backgroundColor: configObj.netColor}"></div>
            <div style="padding: 10px 15px 5px 15px; ">
                <mu-form :model="form" label-position="top" style="">
                    <mu-form-item label="代币">
                        <mu-text-field :value="symbol" readonly></mu-text-field>
                    </mu-form-item>
                    <mu-form-item label="发送者（NatureToken链）">
                        <mu-text-field :value="account.name" readonly></mu-text-field>
                    </mu-form-item>
                    <mu-form-item label="接收者（主链）">
                        <mu-text-field v-model="form.to"></mu-text-field>
                    </mu-form-item>
                    <mu-form-item label="数量（必须为四位小数数字）">
                        <mu-text-field v-model="form.number" type="number"></mu-text-field>
                    </mu-form-item>
                    <mu-form-item label="备注（可选）">
                        <mu-text-field v-model="form.memo"></mu-text-field>
                    </mu-form-item>
                    <div style="margin-bottom: 20px; display: flex; justify-content: flex-end;">
                        <mu-button color="error" @click="transferBalance">提交</mu-button>
                    </div>
                </mu-form>
            </div>
        </mu-card>

    </div>
</template>

<script>
    /* eslint-disable no-undef */

    export default {
        name: 'Change',
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
                trx_id: ''
            }
        },
        created() {
            let self = this
            self.$emit('setTop', {back: true, add: false, qr: false, scan: false, path: '1'})
            self.id = self.$route.params.id
            self.code = self.$route.params.code
            self.symbol = self.$route.params.symbol
            self.account = null
            let tmp = self.$parent.accountList
            for (let i in tmp) {
                if (tmp[i].id == self.id) {
                    self.account = tmp[i]
                }
            }
            if (self.account != null && self.id != null && self.code != null && self.symbol != null && self.configList[self.account.netId] != undefined) {
                self.configObj = self.configList[self.account.netId]
            } else {
                self.$router.replace('/AccountList')
            }
        },
        methods: {
            transferBalance: function () {
                let self = this
                let reg = /^\d+(\.\d{1,4})?$/
                let isNum = reg.test(self.form.number)
                let f = Number.parseFloat(self.form.number)
                let s = f.toFixed(4)
                if (self.account.name != '' && self.form.to !== '' && isNum && f > 0 && !self.isTring) {
                    if (self.form.memo.split('@').length > 1) {
                        self.$alert('跨链备注禁止出现 @ 字符', '提示', {type: 'error'})
                    } else {
                        self.form.number = s
                        let quantity = s + ' ' + self.symbol
                        let t_to = ''
                        let t_memo = ''
                        // if (configObj.eosAddress == 'http://39.105.44.204:8888') {configObj.netId == '999'
                        if (self.configObj.netId == '999') {
                            t_to = 'naturetokenp'
                            t_memo = self.form.to + '@NatureToken@' + self.form.memo

                        }
                        // if (configObj.eosAddress == 'http://39.105.44.204:8888') {
                        if (self.configObj.netId == '002') {
                            t_to = 'naturetokenc'
                            t_memo = self.form.to + '@MainNet@' + self.form.memo
                        }

                        self.$parent.transfer(self.configObj.netId, self.account, self.code, quantity, self.account.name, t_to, t_memo, '', function (r) {
                            if (r.success) {
                                // console.log(r)
                                let trx_id = r.result.transaction_id
                                self.trx_id = trx_id
                                self.isTring = false
                                self.isOver = true
                                self.$alert('转账成功', '提示', {type: 'success'}).then(() => {
                                    self.$router.go(-2);
                                })
                            } else {
                                self.$alert(r.msg, '提示', {type: 'error'})
                            }
                        })

                        // self.$prompt('请输入交易密码', '提示', {inputType: 'password'}).then(data => {
                        //     const loading = self.$loading()
                        //     setTimeout(function () {
                        //         if (data.result && data.value != undefined && data.value != '') {
                        //             let bytes = CryptoJS.AES.decrypt(self.account.key, data.value)
                        //             let plaintext = bytes.toString(CryptoJS.enc.Utf8)
                        //             self.isTring = true
                        //             let config = self.config
                        //             config.keyProvider = plaintext
                        //             config.authorization = `${self.account.name}@active`
                        //             let eos = Eos(config)
                        //             let quantity = s + ' ' + self.nowToken.name
                        //             let t_to = ''
                        //             let t_memo = ''
                        //             if (config.httpEndpoint == 'http://39.105.44.204:8888') {
                        //                 t_to = 'naturetokenp'
                        //                 t_memo = self.form.to + '@NatureToken@' + self.form.memo
                        //             } else {
                        //                 t_to = 'naturetokenc'
                        //                 t_memo = self.form.to + '@MainNet@' + self.form.memo
                        //             }
                        //             eos.contract(self.nowToken.account).then(con => {
                        //                 con.transfer(self.account.name, t_to, quantity, t_memo).then(result => {
                        //                     let trx_id = result.transaction_id
                        //                     self.trx_id = trx_id
                        //                     loading.close()
                        //                     self.isTring = false
                        //                     self.isOver = true
                        //                     self.$alert('转账成功', '提示', {type: 'success'}).then(() => {
                        //                         self.$router.go(-2);
                        //                     })
                        //                 }).catch(error => {
                        //                     loading.close()
                        //                     console.log(error)
                        //                     self.isTring = false
                        //                     self.$alert('转账失败', '提示', {type: 'error'})
                        //                 })
                        //             }).catch(error => {
                        //                 loading.close()
                        //                 console.log(error)
                        //                 self.isTring = false
                        //                 self.$alert('转账失败', '提示', {type: 'error'})
                        //             })
                        //         } else {
                        //             loading.close()
                        //         }
                        //     }, 500)
                        // }).catch(e => {
                        //     console.log(e)
                        // })
                    }
                }
            },
            goBack() {
                this.$router.go(-1);
            },
            goTracker() {
                window.open(this.trackerAddress + '' + this.trx_id)
            }
        }
    }
</script>

<style scoped>

</style>
