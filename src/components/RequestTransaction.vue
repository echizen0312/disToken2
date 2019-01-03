<template>
    <div class="hello" style="width: 100%; padding: 15px; max-width: 600px; margin: 0 auto; text-align: left;">
        <mu-card
                style="width: 100%; margin-bottom: 10px; text-align: left; position: relative;">
            <mu-card-title title="请求交易"></mu-card-title>
            <mu-divider></mu-divider>
            <div class="account-item-head" :style="{backgroundColor: configObj.netColor}"></div>
            <div style="padding: 10px 18px 18px 18px;" v-if="account != null">
                <mu-text-field v-model="configObj.netName" label="目标链" readonly full-width></mu-text-field>
                <mu-text-field v-model="account.name" label="签名账户" readonly full-width></mu-text-field>
                <!--<mu-text-field v-model="JSON.stringify(tr, null, 4)" label="交易体" readonly multi-line :rows="6"-->
                <!--full-width></mu-text-field>-->
                <mu-flex justify-content="center" align-items="center" style="margin-bottom: 35px;">
                    <mu-button full-width color="blueGrey300" @click="open = true">点击显示交易体</mu-button>
                </mu-flex>
                <div style="display: flex; justify-content: space-between;">
                    <mu-button color="primary" @click="back">返回</mu-button>
                    <mu-button color="success" @click="submit">确定</mu-button>
                </div>
            </div>
        </mu-card>
        <mu-bottom-sheet :open.sync="open" :overlay-close="false">
            <div style="padding: 10px 18px 18px 18px;" v-if="account != null">
                <mu-text-field v-model="JSON.stringify(tr, null, 4)" label="交易体" readonly multi-line :rows="14"
                               full-width></mu-text-field>
                <div style="display: flex; justify-content: space-between;">
                    <mu-button color="blueGrey300" @click="open = false">隐藏</mu-button>
                    <mu-button color="success" @click="submit">确定交易</mu-button>
                </div>
            </div>
        </mu-bottom-sheet>
    </div>
</template>

<script>
    /* eslint-disable no-undef */

    export default {
        name: 'RequestTransaction',
        data() {
            return {
                configList: configList,
                configObj: null,
                account: null,
                netId: null,
                accName: null,
                tr: null,
                form: {
                    privateKey: '',
                    publicKey: '',
                    accountName: '',
                    netId: '',
                    aesKey: ''
                },
                open: false
            }
        },
        created() {
            let self = this
            self.$emit('setTop', {back: false, add: false, qr: false, scan: false, path: '1'})
            self.netId = self.$route.params.netId
            self.accName = self.$route.params.accName
            self.tr = JSON.parse(self.$route.params.tr)
            if (self.netId != null && self.accName != null && self.tr != null && self.configList[self.netId] != undefined) {
                self.configObj = self.configList[self.netId]
                self.account = self.checkAccount(self.netId, self.accName)
                if (self.account != null) {
                    console.log('收到请求')
                } else {
                    self.$alert('没有导入过这个账户', '提示', {
                        type: 'error'
                    }).then(() => {
                        self.$router.replace('/AccountList')
                    })
                }
            } else {
                self.$alert('参数错误，请返回原页面', '提示', {
                    type: 'error'
                }).then(() => {
                    history.back()
                })
            }
            // console.log(self.netId, self.accName, self.tr)
            // self.$parent.transaction(self.netId, self.accName, self.tr, '', function (r) {
            //     console.log(r)
            // })
        },
        methods: {
            checkAccount(id, accName) {
                let self = this
                let acc = null
                for (let i in self.$parent.accountList) {
                    let tmp = self.$parent.accountList[i]
                    if (tmp.netId == id && tmp.name == accName) {
                        acc = tmp
                    }
                }
                return acc
            },
            back() {
                history.back()
            },
            submit() {
                let self = this
                self.$parent.transaction(self.netId, self.account, self.tr, '', function (r) {
                    if (r.success) {
                        self.$alert('交易成功，将跳转回原页面', '提示', {type: 'success'}).then(() => {
                            history.back()
                        })
                    } else {
                        self.$alert(r.msg, '提示', {type: 'error'})
                    }
                })
            }
        }
    }
</script>

<style scoped>

</style>
