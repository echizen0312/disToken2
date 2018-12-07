<template>
    <div id="app">
        <mu-appbar style="width: 100%; height: 56px; position: fixed; top: 0; text-align: center;" color="primary">
            <mu-button icon slot="left" v-show="back" @click="goBack">
                <mu-icon value="chevron_left"></mu-icon>
            </mu-button>
            <mu-button icon slot="left" v-show="!back">
                <mu-icon value=""></mu-icon>
            </mu-button>
            <span>{{ title }}</span>
            <mu-button icon slot="right" v-show="add" @click="goAdd">
                <mu-icon value="add"></mu-icon>
            </mu-button>
            <mu-button icon slot="right" v-show="qr" @click="goQr">
                <i class="fa fa-qrcode"></i>
            </mu-button>
            <mu-button icon slot="right" v-show="!add && !qr">
                <mu-icon value=""></mu-icon>
            </mu-button>
        </mu-appbar>
        <div style="width: 100%; position: fixed; top: 56px; bottom: 56px; overflow: scroll; background-color: #eeeeee;">
            <router-view v-on:setTop="setTopFromChild" ref="child"/>
        </div>
        <mu-bottom-nav style="width: 100%; position: fixed; bottom: 0; border-top: 1px solid #e0e0e0;"
                       @change="handleSelect" :value="path">
            <mu-bottom-nav-item title="钱包" value="1" icon="credit_card"></mu-bottom-nav-item>
            <mu-bottom-nav-item title="游戏" value="2" icon="videogame_asset"></mu-bottom-nav-item>
            <mu-bottom-nav-item title="创建" value="9" icon="person_add"></mu-bottom-nav-item>
        </mu-bottom-nav>
    </div>
</template>

<script>
    /* eslint-disable no-undef */

    let Eos = require('eosjs')
    let ecc = require('eosjs-ecc')
    let CryptoJS = require("crypto-js")

    export default {
        name: 'App',
        data() {
            return {
                configList: configList,
                accountList: [],
                path: '1',
                title: title,
                back: false,
                add: false,
                qr: false
            }
        },
        created() {
            let self = this
            let hasAccs = self.$cookies.isKey('disToken2Accounts')
            if (hasAccs) {
                let oldTmp = self.$cookies.get('disToken2Accounts')
                self.$cookies.set('disToken2Accounts', JSON.stringify([]))
                self.$cookies.set('disToken2Accounts', oldTmp, '15d')
                let tmp = JSON.parse(oldTmp)
                for (let i in tmp) {
                    self.accountList.push(tmp[i])
                }
            }
            // self.$router.replace('/AccountList')
        },
        methods: {
            handleSelect(value) {
                let self = this
                self.path = value
                if (value == '1') {
                    self.$router.replace('/AccountList')
                }
                if (value == '2') {
                    self.$router.replace('/GameList')
                }
                if (value == '9') {
                    self.$router.replace('/CreateAccount')
                }
            },
            setTopFromChild(data) {
                let self = this
                // self.title = data.title
                self.back = data.back
                self.add = data.add
                self.qr = data.qr
                self.path = data.path
            },
            goBack() {
                this.$router.go(-1)
            },
            goAdd() {
                let self = this
                if (typeof self.$refs.child.addClick == 'function') {
                    self.$refs.child.addClick()
                }
            },
            goQr() {
                let self = this
                if (typeof self.$refs.child.qrClick == 'function') {
                    self.$refs.child.qrClick()
                }
            },
            //=========================== EOS ===========================
            getAccountNameFromPK(id, pk, callback) {
                let self = this
                if (self.configList[id] != undefined) {
                    let tmp = self.configList[id]
                    let config = {
                        chainId: tmp.chainId,
                        httpEndpoint: tmp.eosAddress
                    }
                    let eos = Eos.modules.api(config)
                    let pub = ''
                    try {
                        pub = ecc.privateToPublic(pk)
                    }
                    catch {
                        callback({success: false, msg: '秘钥不正确', result: false})
                        return
                    }
                    eos.getKeyAccounts(pub).then(result => {
                        let ss = result.account_names
                        if (ss !== undefined && ss.length === 1) {
                            let accountName = ss[0]
                            callback({success: true, msg: '获取成功', result: accountName})
                        } else {
                            callback({success: false, msg: '秘钥可能不正确', result: false})
                        }
                    }).catch(error => {
                        callback({success: false, msg: '链接口错误', result: error})
                    })
                } else {
                    callback({success: false, msg: '不支持这条链', result: false})
                }
            },
            doExport(acc) {
                let self = this
                self.$prompt('请输入交易密码', '导出私钥', {inputType: 'password'}).then(data => {
                    if (data.result && data.value != undefined && data.value != '') {
                        let bytes = CryptoJS.AES.decrypt(acc.key, data.value)
                        let plaintext = bytes.toString(CryptoJS.enc.Utf8)
                        // console.log(plaintext)
                        if (plaintext != '') {
                            self.$copyText(plaintext).then(function () {
                                self.$alert('成功导出私钥到剪贴板', '提示', {type: 'success'})
                            }, function () {
                                self.$alert('导出私钥失败', '提示', {type: 'error'})
                            })
                        } else {
                            self.$alert('交易密码错误', '提示', {type: 'error'})
                        }
                    }
                }).catch(e => {
                    console.log(e)
                })
            },
            getAccount(id, acc, callback) {
                let self = this
                if (self.configList[id] != undefined) {
                    let tmp = self.configList[id]
                    let config = {
                        chainId: tmp.chainId,
                        httpEndpoint: tmp.eosAddress
                    }
                    let eos = Eos.modules.api(config)
                    eos.getAccount(acc.name).then(result => {
                        callback({success: true, msg: '获取成功', result: result})
                    }).catch(error => {
                        callback({success: false, msg: '链接口错误', result: error})
                    })
                } else {
                    callback({success: false, msg: '不支持这条链', result: false})
                }
            },
            transfer(id, pk, code, quantity, from, to, memo, callback) {
                let self = this
                if (self.configList[id] != undefined) {
                    let tmp = self.configList[id]
                    let config = {
                        chainId: tmp.chainId,
                        keyProvider: pk,
                        httpEndpoint: tmp.eosAddress,
                        authorization: `${from}@active`
                    }
                    let eos = Eos(config)
                    eos.contract(code).then(contract => {
                        contract.transfer(from, to, quantity, memo).then(result => {
                            console.log(result)
                            callback({success: true, msg: '转账成功', result: result})
                        }).catch(error => {
                            console.log(error)
                            callback({success: false, msg: '转账失败', result: error})
                        })
                    }).catch(error => {
                        console.log(error)
                        callback({success: false, msg: '合约错误', result: error})
                    })
                } else {
                    callback({success: false, msg: '不支持这条链', result: false})
                }
            }
        }
    }
</script>

<style>

</style>
