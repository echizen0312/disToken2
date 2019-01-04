<template>
    <div id="app">
        <mu-appbar style="width: 100%; height: 56px; position: fixed; top: 0; text-align: center;" color="primary">
            <mu-button icon slot="left" v-show="back" @click="goBack">
                <mu-icon value="chevron_left"></mu-icon>
            </mu-button>
            <mu-button icon slot="left" v-show="list" @click="goList">
                <mu-icon value="menu"></mu-icon>
            </mu-button>
            <mu-button icon slot="left" v-show="!back && !list">
                <mu-icon value=""></mu-icon>
            </mu-button>
            <span @click="test">{{ title }}</span>
            <mu-button icon slot="right" v-show="add" @click="goAdd">
                <mu-icon value="add"></mu-icon>
            </mu-button>
            <mu-button icon slot="right" v-show="qr" @click="goQr">
                <i class="fa fa-qrcode"></i>
            </mu-button>
            <mu-button icon slot="right" v-show="scan" @click="goScan">
                <mu-icon value="crop_free"></mu-icon>
            </mu-button>
            <mu-button icon slot="right" v-show="!add && !qr && !scan">
                <mu-icon value=""></mu-icon>
            </mu-button>
        </mu-appbar>
        <div style="width: 100%; position: fixed; top: 56px; bottom: 56px; overflow: scroll; background-color: #eeeeee;">
            <router-view v-on:setTop="setTopFromChild" ref="child"/>
        </div>
        <mu-bottom-nav style="width: 100%; position: fixed; bottom: 0; border-top: 1px solid #e0e0e0;"
                       @change="handleSelect" :value="path">
            <mu-bottom-nav-item title="钱包" value="1" icon="credit_card"></mu-bottom-nav-item>
            <mu-bottom-nav-item title="游戏" value="2" icon="videogame_asset" v-show="canGame"></mu-bottom-nav-item>
            <mu-bottom-nav-item title="买币" value="3" icon="store" v-show="canOTC"></mu-bottom-nav-item>
            <mu-bottom-nav-item title="创建" value="9" icon="person_add"
                                v-show="!canGame && !canOTC"></mu-bottom-nav-item>
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
                list: false,
                add: false,
                qr: false,
                scan: false,
                canGame: canGame,
                canOTC: canOTC
            }
        },
        mounted() {
            // let self = this
            // 将要给原生调用的方法挂载到 window 上面
            // window.test = self.test
        },
        created() {
            let self = this
            if (self.pullAccounts()) {
                console.log('拉取APP数据')
                let storage = window.localStorage
                if (storage.hasOwnProperty('disToken2Last')) {
                    let lastTmp = storage['disToken2Last']
                    self.$router.replace('/Account/' + lastTmp)
                }
            } else {
                let storage = window.localStorage
                let hasAccs = storage.hasOwnProperty('disToken2Accounts')
                let hasLast = storage.hasOwnProperty('disToken2Last')
                let hasAccsOld = self.$cookies.isKey('disToken2Accounts')
                if (hasAccs) {
                    let oldTmp = storage['disToken2Accounts']
                    let tmp = JSON.parse(oldTmp)
                    for (let i in tmp) {
                        self.accountList.push(tmp[i])
                    }
                    if (hasLast) {
                        let lastTmp = storage['disToken2Last']
                        self.$router.push('/Account/' + lastTmp)
                    }
                } else if (hasAccsOld) {
                    let oldTmp = self.$cookies.get('disToken2Accounts')
                    self.$cookies.remove('disToken2Accounts')
                    storage['disToken2Accounts'] = oldTmp
                    let tmp = JSON.parse(oldTmp)
                    for (let i in tmp) {
                        self.accountList.push(tmp[i])
                    }
                }
            }
            for (let i in configList) {
                let tmp = configList[i]
                if (tmp.pluginTokenUrl.url != '' && !tmp.pluginTokenUrl.isLoaded) {
                    self.$http.get(`${tmp.pluginTokenUrl.url}`, {}).then(res => {
                        let r = res.data
                        for (let j in r) {
                            let o = r[j]
                            tmp.tokenList.push({
                                code: o.account,
                                symbol: o.name,
                                balance: 0
                            })
                        }
                        tmp.pluginTokenUrl.isLoaded = true
                    }, () => {
                        console.log('plugin error')
                    })
                } else {
                    continue
                }
            }
        },
        methods: {
            handleSelect(value) {
                let self = this
                self.path = value
                if (value == '1') {
                    let storage = window.localStorage
                    if (storage.hasOwnProperty('disToken2Last')) {
                        let lastTmp = storage['disToken2Last']
                        self.$router.replace('/Account/' + lastTmp)
                    } else {
                        self.$router.replace('/AccountList')
                    }
                }
                if (value == '2') {
                    self.$router.replace('/GameList')
                }
                if (value == '3') {
                    location.href = 'http://c2c.naturetoken.io/'
                    // self.$router.replace('/Web/0/3')
                }
                if (value == '9') {
                    self.$router.replace('/CreateAccount')
                }
            },
            setTopFromChild(data) {
                let self = this
                // self.title = data.title
                self.back = data.back
                self.list = data.list == undefined ? false : data.list
                self.add = data.add
                self.qr = data.qr
                self.scan = data.scan
                self.path = data.path
            },
            goBack() {
                this.$router.go(-1)
            },
            goList() {
                this.$router.replace('/AccountList')
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
            goScan() {
                let self = this
                if (typeof self.$refs.child.scanClick == 'function') {
                    self.$refs.child.scanClick()
                }
            },
            //=========================== EOS ===========================
            getKeys() {
                return ecc.randomKey()
            },
            privateToPublic(privateKey) {
                return ecc.privateToPublic(privateKey)
            },
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
                    self.$alert('交易密码错误', '提示', {type: 'error'})
                })
            },
            doExportNew(acc, callback) {
                let self = this
                self.$prompt('请输入交易密码', '导出私钥', {inputType: 'password'}).then(data => {
                    if (data.result && data.value != undefined && data.value != '') {
                        let bytes = CryptoJS.AES.decrypt(acc.key, data.value)
                        let plaintext = bytes.toString(CryptoJS.enc.Utf8)
                        // console.log(plaintext)
                        if (plaintext != '') {
                            callback({success: true, msg: '成功导出私钥', result: plaintext})
                        } else {
                            callback({success: false, msg: '交易密码错误', result: false})
                        }
                    }
                }).catch(e => {
                    console.log(e)
                    callback({success: false, msg: '交易密码错误', result: false})
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
            getBalancese(id, tokens, acc, callback) {
                let self = this
                if (self.configList[id] != undefined) {
                    let tmp = self.configList[id]
                    let config = {
                        chainId: tmp.chainId,
                        httpEndpoint: tmp.eosAddress
                    }
                    let eos = Eos.modules.api(config)
                    let ps = []
                    for (let i in tokens) {
                        let token = tokens[i]
                        let p = eos.getCurrencyBalance(token.code, acc.name, token.symbol).then(result => {
                            if (result.length === 0) {
                                token.balance = 0
                            } else {
                                token.balance = Number.parseFloat(result[0].split(` ${token.symbol}`)[0])
                            }
                        }).catch(error => {
                            console.log(error)
                            token.balance = 0
                        })
                        ps.push(p)
                    }
                    Promise.all(ps).then(() => {
                        callback({success: true, msg: '获取成功', result: tokens})
                    }).catch(error => {
                        callback({success: false, msg: '链接口错误', result: error})
                    })
                } else {
                    callback({success: false, msg: '不支持这条链', result: false})
                }
            },
            getTransferList(id, acc, code, symbol, direction, isMain, callback) {
                let self = this
                if (self.configList[id] != undefined) {
                    let tmp = self.configList[id]
                    let config = {
                        chainId: tmp.chainId,
                        httpEndpoint: tmp.eosAddress
                    }
                    let eos = Eos.modules.api(config)
                    if (isMain) {
                        self.$http.get(`${tmp.nodeJsAddress}/eosSak/db/GetActions?account_name=${acc.name}&direction=${direction}&code=${code}&symbol=${symbol}`, {}).then(res => {
                            let data = res.data
                            let sss = []
                            if (data.result.length > 0) {
                                sss = data.result
                            }
                            callback({success: true, msg: '获取成功', result: sss})
                        }, res => {
                            callback({success: false, msg: '链接口错误', result: res})
                        })
                    } else {
                        eos.getActions(acc.name, -1, -100).then(result => {
                            result = result.actions
                            result.reverse()
                            let sss = []
                            for (let i in result) {
                                let obj = result[i]
                                let objA
                                if (obj != undefined && obj.act != undefined) {
                                    objA = obj
                                } else if (obj != undefined && obj.action_trace != undefined) {
                                    objA = obj.action_trace
                                } else {
                                    continue
                                }
                                if (objA.receipt.receiver == acc.name
                                    && objA.act.account == code
                                    && objA.act.name == 'transfer') {
                                    let cache = objA.act.data.quantity.split(' ')
                                    if (cache.length == 2 && cache[1] == symbol) {
                                        if (direction == 'all' && (objA.act.data.to == acc.name || objA.act.data.from == acc.name)) {
                                            sss.push({
                                                trx_id: objA.trx_id,
                                                account: objA.act.account,
                                                name: objA.act.name,
                                                data: objA.act.data,
                                                seq: obj.account_action_seq,
                                                time: obj.block_time
                                            })
                                        } else if (direction == 'in' && objA.act.data.to == acc.name) {
                                            sss.push({
                                                trx_id: objA.trx_id,
                                                account: objA.act.account,
                                                name: objA.act.name,
                                                data: objA.act.data,
                                                seq: obj.account_action_seq,
                                                time: obj.block_time
                                            })
                                        } else if (direction == 'out' && objA.act.data.from == acc.name) {
                                            sss.push({
                                                trx_id: objA.trx_id,
                                                account: objA.act.account,
                                                name: objA.act.name,
                                                data: objA.act.data,
                                                seq: obj.account_action_seq,
                                                time: obj.block_time
                                            })
                                        } else {
                                            continue
                                        }
                                    }
                                    if (sss.length == 10) {
                                        break
                                    }
                                }
                            }
                            callback({success: true, msg: '获取成功', result: sss})
                        }).catch(error => {
                            callback({success: false, msg: '链接口错误', result: error})
                        })
                    }
                } else {
                    callback({success: false, msg: '不支持这条链', result: false})
                }
            },
            queryNewMsg(id, acc, qid, callback) {
                let self = this
                if (self.configList[id] != undefined) {
                    let tmp = self.configList[id]
                    let config = {
                        chainId: tmp.chainId,
                        httpEndpoint: tmp.eosAddress
                    }
                    let eos = Eos.modules.api(config)
                    eos.getActions(acc.name, -1, -10).then(result => {
                        let actions = result.actions
                        let list = []
                        let res = {
                            datas: [],
                            lastId: -1
                        }
                        for (let i in actions) {
                            let tmp = actions[i]
                            if (tmp.action_trace.receipt.receiver == acc.name && tmp.action_trace.act.name == 'transfer' && tmp.action_trace.act.account == 'sakmsg' && tmp.action_trace.act.data.to == acc.name)
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
                                if (data.id > qid || data.id == 0) {
                                    res.datas.push(data)
                                }
                                if (i == list.length - 1) {
                                    res.lastId = data.id
                                }
                            }
                        }
                        callback({success: true, msg: '获取成功', result: res})
                    }).catch(error => {
                        callback({success: false, msg: '链接口错误', result: error})
                    })
                } else {
                    callback({success: false, msg: '不支持这条链', result: false})
                }
            },
            transfer(id, acc, code, quantity, from, to, memo, text, callback) {
                let self = this
                let t = text == '' ? '请输入交易密码' : text
                self.$prompt(t, '提示', {inputType: 'password'}).then(data => {
                    if (data.result && data.value != undefined && data.value != '') {
                        const loading = self.$loading()
                        setTimeout(function () {
                            let bytes = CryptoJS.AES.decrypt(acc.key, data.value)
                            let plaintext = ''
                            try {
                                plaintext = bytes.toString(CryptoJS.enc.Utf8)
                            } catch (e) {
                                loading.close()
                                callback({success: false, msg: '交易密码错误', result: e})
                                return
                            }
                            if (plaintext != '') {
                                if (self.configList[id] != undefined) {
                                    let tmp = self.configList[id]
                                    let config = {
                                        chainId: tmp.chainId,
                                        keyProvider: plaintext,
                                        httpEndpoint: tmp.eosAddress,
                                        authorization: `${from}@active`
                                    }
                                    let eos = Eos(config)
                                    eos.contract(code).then(contract => {
                                        contract.transfer(from, to, quantity, memo).then(result => {
                                            // console.log(result)
                                            loading.close()
                                            if (result.processed != undefined && result.transaction_id != undefined) {
                                                callback({success: true, msg: '转账成功', result: result})
                                            } else {
                                                callback({success: false, msg: '转账失败', result: result.error})
                                            }
                                        }).catch(error => {
                                            // console.log(error)
                                            loading.close()
                                            callback({success: false, msg: '转账失败', result: error})
                                        })
                                    }).catch(error => {
                                        // console.log(error)
                                        loading.close()
                                        callback({success: false, msg: '合约错误', result: error})
                                    })
                                } else {
                                    loading.close()
                                    callback({success: false, msg: '不支持这条链', result: false})
                                }
                            } else {
                                loading.close()
                                callback({success: false, msg: '交易密码错误', result: false})
                            }
                        }, 500)
                    }
                }).catch(e => {
                    callback({success: false, msg: '交易密码错误', result: e})
                })
            },
            transaction(id, acc, tr, text, callback) {
                let self = this
                let t = text == '' ? '请输入交易密码' : text
                self.$prompt(t, '提示', {inputType: 'password'}).then(data => {
                    if (data.result && data.value != undefined && data.value != '') {
                        const loading = self.$loading()
                        setTimeout(function () {
                            let bytes = CryptoJS.AES.decrypt(acc.key, data.value)
                            let plaintext = ''
                            try {
                                plaintext = bytes.toString(CryptoJS.enc.Utf8)
                            } catch (e) {
                                loading.close()
                                callback({success: false, msg: '交易密码错误', result: e})
                                return
                            }
                            if (plaintext != '') {
                                if (self.configList[id] != undefined) {
                                    let tmp = self.configList[id]
                                    let config = {
                                        chainId: tmp.chainId,
                                        keyProvider: plaintext,
                                        httpEndpoint: tmp.eosAddress,
                                        authorization: `${acc.name}@active`
                                    }
                                    let eos = Eos(config)
                                    eos.transaction(tr).then(result => {
                                        // console.log(result)
                                        loading.close()
                                        if (result.processed != undefined && result.transaction_id != undefined) {
                                            callback({success: true, msg: '交易成功', result: result})
                                        } else {
                                            callback({success: false, msg: '交易失败', result: result.error})
                                        }
                                    }).catch(error => {
                                        console.log(error)
                                        loading.close()
                                        callback({success: false, msg: '交易失败', result: error})
                                    })
                                } else {
                                    loading.close()
                                    callback({success: false, msg: '不支持这条链', result: false})
                                }
                            } else {
                                loading.close()
                                callback({success: false, msg: '交易密码错误', result: false})
                            }
                        }, 500)
                    }
                }).catch(e => {
                    callback({success: false, msg: '交易密码错误', result: e})
                })
            },
            //======================== bridge ========================
            pullAccounts() {
                let self = this
                if (window.android_client != undefined) {
                    let obj = window.android_client.pullAccounts()
                    obj = JSON.parse(obj)
                    for (let i in obj) {
                        self.accountList.push(obj[i])
                    }
                    return true
                } else {
                    return false
                }
            },
            saveAccounts(s) {
                if (window.android_client != undefined) {
                    window.android_client.saveAccounts(s)
                }
            },
            scanQRCode() {
                if (window.android_client != undefined) {
                    window.android_client.scanQRCode()
                } else {
                    this.$alert('网页版无法使用扫码', '提示', {type: 'error'})
                }
            },
            //======================== test ========================
            test() {
                // alert(window.android_client.ffTest)
                // if (window.android_client != undefined) {
                //     alert('in')
                //     window.android_client.ffTest('asdf')
                // }
                // this.$router.replace('/Web/0/4')
            }
        }
    }
</script>

<style>
    .mu-dialog {
        position: relative !important;
    }

    .account-item-head {
        width: 100%;
        height: 5px;
        position: absolute;
        left: 0;
        top: 0;
    }
</style>
