<template>
    <div style="width: 100%; padding: 10px; max-width: 600px; margin: 0 auto;">
        <mu-card
                v-if="!isOver"
                style="width: 100%; margin-bottom: 10px; text-align: left; position: relative;">
            <mu-card-title title="代币转账"></mu-card-title>
            <mu-divider></mu-divider>
            <div class="account-item-head" :style="{backgroundColor: configObj.netColor}"></div>
            <div style="padding: 10px 15px 5px 15px; ">
                <mu-form :model="form" label-position="top" style="">
                    <mu-form-item label="代币">
                        <!--<mu-text-field :value="symbol + ' - ' + code + ''" readonly></mu-text-field>-->
                        <mu-text-field :value="symbol" readonly></mu-text-field>
                    </mu-form-item>
                    <mu-form-item label="发送者">
                        <mu-text-field :value="account.name" readonly></mu-text-field>
                    </mu-form-item>
                    <mu-form-item label="接收者">
                        <mu-text-field v-model="form.to"></mu-text-field>
                    </mu-form-item>
                    <mu-form-item label="数量（必须为四位小数数字）">
                        <mu-text-field v-model="form.number" type="number"></mu-text-field>
                    </mu-form-item>
                    <mu-form-item label="备注（可选）">
                        <mu-text-field v-model="form.memo"></mu-text-field>
                    </mu-form-item>
                    <div style="margin-bottom: 20px; display: flex; justify-content: space-between;">
                        <mu-button color="primary" @click="goTransferList">转账记录</mu-button>
                        <mu-button color="purple" @click="goChange"
                                   v-if="(symbol == 'NXT' || symbol == 'EOS') && configObj.canChange">
                            跨链转账
                        </mu-button>
                        <mu-button color="success" @click="transferBalance">提交</mu-button>
                    </div>
                </mu-form>
            </div>
        </mu-card>
        <mu-card
                v-else
                style="width: 100%; margin-bottom: 10px; text-align: left; position: relative;">
            <mu-card-title title="转账成功"></mu-card-title>
            <mu-divider></mu-divider>
            <div class="account-item-head" :style="{backgroundColor: configObj.netColor}"></div>
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
                        <mu-button color="" @click="goBack">返回</mu-button>
                        <mu-button color="primary" @click="goTracker">查看</mu-button>
                    </div>
                </mu-form>
            </div>
        </mu-card>
    </div>
</template>

<script>
    /* eslint-disable no-undef */

    export default {
        name: 'Transfer',
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
        mounted() {
            let self = this
            //将要给原生调用的方法挂载到 window 上面
            window.natureTokenScanResult = self.natureTokenScanResult
        },
        created: function () {
            let self = this
            self.$emit('setTop', {back: true, add: false, qr: false, scan: true, path: '1'})
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
                    self.form.number = s
                    let quantity = s + ' ' + self.symbol
                    self.$parent.transfer(self.configObj.netId, self.account, self.code, quantity, self.account.name, self.form.to, self.form.memo, '', function (r) {
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
            goBack() {
                this.$router.go(-1);
            },
            goTransferList() {
                this.$router.push('/TransferList/' + this.id + '/' + this.code + '/' + this.symbol)
            },
            goChange() {
                this.$router.push('/Change/' + this.id + '/' + this.code + '/' + this.symbol)
            },
            goTracker() {
                window.open(this.configObj.trackerAddress + '' + this.trx_id)
            },
            //======================== bridge ========================
            scanClick() {
                this.$parent.scanQRCode()
            },
            natureTokenScanResult(s) {
                let self = this
                try {
                    // s = JSON.parse(s)
                    if (s.head != undefined && s.name != undefined && s.head == 'disToken_QR') {
                        self.form.to = s.name
                    } else {
                        console.log('非法二维码')
                    }
                } catch (e) {
                    console.log(e)
                }
            }
        }
    }
</script>

<style scoped>

</style>
