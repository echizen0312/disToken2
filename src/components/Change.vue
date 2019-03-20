<template>
    <div style="width: 100%; padding: 10px; max-width: 600px; margin: 0 auto;">
        <mu-card
                v-if="!isOver && configObj.netId == '999' && (symbol == 'NXT' || symbol == 'EOS' || symbol == 'THK' || symbol == 'TMP' || symbol == 'RBCT' || symbol == 'RDCT')"
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
                v-if="!isOver && configObj.netId == '002' && (symbol == 'NXT' || symbol == 'EOS' || symbol == 'THK' || symbol == 'TMP' || symbol == 'RBCT' || symbol == 'RDCT')"
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
                        if (self.configObj.netId == '999') {
                            t_to = 'naturetokenp'
                            t_memo = self.form.to + '@NatureToken@' + self.form.memo

                        }
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
