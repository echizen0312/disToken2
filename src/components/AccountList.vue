<template>
    <div style="width: 100%; padding: 10px; max-width: 600px; margin: 0 auto;">
        <template v-if="accountList.length == 0">
            <div style="text-align: center;margin-top: 30px;">
                <div style="font-size: 25px; margin: 0;">欢迎</div>
                <div style="font-size: 17px; margin: 0;" v-text="`使用${title}`"></div>
                <p style="font-size: 15px; margin: 40px 0 20px 0;">您可以：</p>
            </div>
            <mu-paper class="account-item" :z-depth="3" style="padding: 12px;" @click="addClick">
                <div class="account-item-center">
                    <div class="account-item-center-center" style="justify-content: center;">
                        <span style="font-size: 18px;">导入账户</span>
                    </div>
                </div>
            </mu-paper>
            <mu-paper class="account-item" :z-depth="3" style="padding: 12px;" @click="createClick">
                <div class="account-item-center">
                    <div class="account-item-center-center" style="justify-content: center;">
                        <span style="font-size: 18px;">创建账户</span>
                    </div>
                </div>
            </mu-paper>
        </template>
        <mu-paper class="account-item" :z-depth="3" v-for="(account, index) in accountList"
                  :key="account.id + '_' + index"
                  v-if="configList[account.netId] != undefined"
                  @click="accountClick(account)">
            <div class="account-item-head" :style="{backgroundColor: configList[account.netId].netColor}"></div>
            <div class="account-item-top">
                <div class="account-item-top-center">
                    <div class="net-logo" :style="{backgroundColor: configList[account.netId].netColor}">{{
                        configList[account.netId].netName[0] }}
                    </div>
                    <span>所在链</span><span style="color: #e65100; margin-left: 5px;">{{ configList[account.netId].netName }}</span>
                </div>
                <div class="account-item-top-right">
                    <mu-icon value="close" color="red500" @click.stop="confirm(account)"></mu-icon>
                </div>
            </div>
            <div class="account-item-center">
                <div class="account-item-center-center">
                    <span class="account-name">{{ account.name }}</span>

                </div>
                <div class="account-item-center-right">

                </div>
            </div>
        </mu-paper>
        <div v-for="(account, index) in accountList" :key="account.key + index" style=" display: none;"/>
        <mu-dialog title="导入明文私钥" width="600" max-width="80%" :esc-press-close="false"
                   :overlay-close="false" :open.sync="openAlert">
            <mu-form :model="form" label-width="80">
                <mu-form-item prop="input" label="目标链">
                    <mu-select v-model="form.netId" full-width>
                        <mu-option v-for="configObj in configList" :key="configObj.netName"
                                   :label="configObj.netName"
                                   :value="configObj.netId"></mu-option>
                    </mu-select>
                </mu-form-item>
                <mu-form-item prop="input" label="明文私钥">
                    <mu-text-field v-model="form.privateKey"></mu-text-field>
                </mu-form-item>
                <mu-form-item prop="input" label="交易密码">
                    <mu-text-field v-model="form.aesKey" type="password"></mu-text-field>
                </mu-form-item>
            </mu-form>
            <!--<mu-button slot="actions" textColor="error" @click="closeAlertDialog">关闭-->
            <!--</mu-button>-->
            <mu-button slot="actions" textColor="primary" @click="createClick">创建账户
            </mu-button>
            <mu-button slot="actions" color="primary" @click="submitAlertDialog">确定</mu-button>
            <mu-button style="position: absolute; right: 5px; top: 5px;" icon color="red500" @click="closeAlertDialog">
                <mu-icon value="close"></mu-icon>
            </mu-button>
        </mu-dialog>
    </div>
</template>

<script>
    /* eslint-disable no-undef */

    let CryptoJS = require("crypto-js")

    export default {
        name: 'AccountList',
        data() {
            return {
                title: title,
                configList: configList,
                accountList: this.$parent.accountList,
                openAlert: false,
                form: {
                    netId: '',
                    privateKey: '',
                    aesKey: ''
                }
            }
        },
        created() {
            let self = this
            self.$emit('setTop', {back: false, add: true, qr: false, scan: false, path: '1'})
        },
        methods: {
            addClick() {
                let self = this
                self.form.netId = ''
                self.form.privateKey = ''
                self.form.aesKey = ''
                self.openAlert = true
            },
            closeAlertDialog() {
                let self = this
                self.openAlert = false
            },
            submitAlertDialog() {
                let self = this
                if (self.form.netId != '' && self.form.privateKey != '' && self.form.aesKey != '') {
                    self.$parent.getAccountNameFromPK(self.form.netId, self.form.privateKey, function (r) {
                        if (r.success) {
                            let ciphertext = CryptoJS.AES.encrypt(self.form.privateKey, self.form.aesKey);
                            let aesR = ciphertext.toString()
                            let acc = {
                                id: new Date().getTime(),
                                name: r.result,
                                netId: self.form.netId,
                                key: aesR
                            }
                            self.$parent.accountList.push(acc)
                            // self.$cookies.set('disToken2Accounts', JSON.stringify(self.$parent.accountList), '15d')
                            let obj = JSON.stringify(self.$parent.accountList)
                            self.$parent.saveAccounts(obj)
                            let storage = window.localStorage
                            storage['disToken2Accounts'] = obj
                            self.closeAlertDialog()
                            self.$alert('导入成功', '提示', {type: 'success'})
                        } else {
                            self.$alert(r.msg, '提示', {type: 'error'})
                        }
                    })
                }
            },
            confirm(acc) {
                let self = this
                self.$confirm('确定要删除？', '提示', {
                    type: 'warning'
                }).then(({result}) => {
                    if (result) {
                        self.removeAccount(acc)
                    }
                })
            },
            removeAccount(acc) {
                let self = this
                for (let i in self.$parent.accountList) {
                    let obj = self.$parent.accountList[i]
                    if (obj.id === acc.id) {
                        self.$parent.accountList.splice(i, 1)
                    }
                }
                // self.$cookies.set('disToken2Accounts', JSON.stringify(self.$parent.accountList))
                let obj = JSON.stringify(self.$parent.accountList)
                self.$parent.saveAccounts(obj)
                let storage = window.localStorage
                storage['disToken2Accounts'] = obj
            },
            // removeAccountAll() {
            //     let self = this
            //     self.$parent.accountList.splice(0, self.$parent.accountList.length)
            // },
            accountClick(acc) {
                let self = this
                self.$router.replace('/Account/' + acc.id)
            },
            createClick() {
                let self = this
                self.$router.push('/CreateAccount')
            }
        }
    }
</script>

<style scoped>
    .account-item {
        margin-bottom: 10px;
        padding: 14px 8px 8px 12px;
        display: flex;
        flex-direction: column;
        justify-content: flex-start;
        align-items: flex-start;
        position: relative;
    }

    .account-item-top {
        width: 100%;
        display: flex;
        justify-content: flex-start;
        align-items: flex-start;
    }

    .account-item-top-center {
        flex: 1;
        height: 24px;
        display: flex;
        justify-content: flex-start;
        align-items: center;
        font-size: 12px;
    }

    .account-item-top-right {
        width: 24px;
        height: 24px;
        display: flex;
        justify-content: center;
        align-items: center;
    }

    .account-item-center {
        width: 100%;
        display: flex;
        justify-content: flex-start;
        align-items: flex-start;
    }

    .account-item-center-center {
        flex: 1;
        height: 62px;
        display: flex;
        justify-content: flex-start;
        align-items: center;
    }

    .account-item-center-right {
        width: 36px;
        height: 36px;
        display: flex;
        justify-content: center;
        align-items: center;
    }

    .account-name {
        font-size: 32px;
        font-weight: 300;
        letter-spacing: 4px;
    }

    .net-logo {
        width: 22px;
        height: 22px;
        display: flex;
        justify-content: center;
        align-items: center;
        border-radius: 4px;
        font-size: 16px;
        font-weight: bolder;
        color: #ffffff;
        margin-right: 10px;
    }
</style>
