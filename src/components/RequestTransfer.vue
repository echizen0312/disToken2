<template>
    <div class="hello" style="width: 100%; padding: 15px; max-width: 600px; margin: 0 auto; text-align: left;">
        <mu-card
                v-if="configObj != null"
                style="width: 100%; margin-bottom: 10px; text-align: left; position: relative;">
            <mu-card-title title="请求转账"></mu-card-title>
            <mu-divider></mu-divider>
            <div class="account-item-head" :style="{backgroundColor: configObj.netColor}"></div>
            <div style="padding: 10px 15px 5px 15px; ">
                <mu-form :model="form" label-position="top" style="">
                    <mu-form-item label="代币">
                        <!--<mu-text-field :value="symbol + ' - ' + code + ''" readonly></mu-text-field>-->
                        <mu-text-field :value="symbol" readonly></mu-text-field>
                    </mu-form-item>
                    <mu-form-item label="发送者">
                        <mu-select v-model="form.accountName" full-width @change="change">
                            <mu-option v-for="account in getAccList(netId)" :key="account.id"
                                       :label="account.name"
                                       :value="account.name"></mu-option>
                        </mu-select>
                    </mu-form-item>
                    <mu-form-item label="接收者">
                        <mu-text-field v-model="to" readonly></mu-text-field>
                    </mu-form-item>
                    <mu-form-item label="数量（必须为四位小数数字）">
                        <mu-text-field v-model="number" readonly type="number"></mu-text-field>
                    </mu-form-item>
                    <mu-form-item label="备注（可选）">
                        <mu-text-field v-model="memo" readonly></mu-text-field>
                    </mu-form-item>
                    <div style="margin-bottom: 20px; display: flex; justify-content: space-between;">
                        <mu-button color="primary" @click="back">返回</mu-button>
                        <mu-button color="success" @click="transferBalance">确定</mu-button>
                    </div>
                </mu-form>
            </div>
        </mu-card>
    </div>
</template>

<script>
    /* eslint-disable no-undef */

    export default {
        name: 'RequestTransfer',
        data() {
            return {
                configList: configList,
                accountList: this.$parent.accountList,
                configObj: null,
                account: null,
                netId: null,
                code: null,
                symbol: null,
                to: null,
                number: null,
                memo: null,
                form: {
                    accountName: ''
                }
            }
        },
        created() {
            let self = this
            self.$emit('setTop', {back: false, add: false, qr: false, scan: false, path: '1'})
            self.netId = self.$route.params.netId
            self.code = self.$route.params.code
            self.symbol = self.$route.params.symbol
            self.to = self.$route.params.to
            self.number = self.$route.params.number
            self.memo = self.$route.params.memo
            if (self.netId != null && self.code != null && self.symbol != null && self.to != null && self.number != null && self.memo != null && self.configList[self.netId] != undefined) {
                self.configObj = self.configList[self.netId]
            } else {
                self.$alert('参数错误，请返回原页面', '提示', {
                    type: 'error'
                }).then(() => {
                    history.back()
                })
            }
        },
        methods: {
            getAccList() {
                let self = this
                let list = []
                for (let i in self.accountList) {
                    let tmp = self.accountList[i]
                    if (tmp.netId == self.netId) {
                        list.push(tmp)
                    }
                }
                return list
            },
            change(value) {
                let self = this
                let acc = null
                for (let i in self.accountList) {
                    let tmp = self.accountList[i]
                    if (tmp.netId == self.netId && tmp.name == value) {
                        acc = tmp
                    }
                }
                self.account = acc
            },
            back() {
                history.back()
            },
            transferBalance: function () {
                let self = this
                let reg = /^\d+(\.\d{1,4})?$/
                let isNum = reg.test(self.number)
                let f = Number.parseFloat(self.number)
                let s = f.toFixed(4)
                if (self.account != null && isNum && f > 0) {
                    self.number = s
                    let quantity = s + ' ' + self.symbol
                    self.$parent.transfer(self.configObj.netId, self.account, self.code, quantity, self.form.accountName, self.to, self.memo, '', function (r) {
                        if (r.success) {
                            // console.log(r)
                            self.$alert('转账成功，将跳转回原页面', '提示', {type: 'success'}).then(() => {
                                history.back()
                            })
                        } else {
                            self.$alert(r.msg, '提示', {type: 'error'})
                        }
                    })
                } else {
                    self.$alert('必须选择发送者', '提示', {type: 'error'})
                }
            }
        }
    }
</script>

<style scoped>

</style>
