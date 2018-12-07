<template>
    <div style="width: 100%; padding: 10px; max-width: 600px; margin: 0 auto;">
        <mu-card
                v-if="configList[account.netId] != undefined"
                style="width: 100%; margin-bottom: 10px; text-align: left; position: relative;">
            <mu-card-title title="账户详情"></mu-card-title>
            <mu-divider></mu-divider>
            <mu-list>
                <mu-list-item button :ripple="false">
                    <mu-list-item-action>
                        <mu-icon value="person"></mu-icon>
                    </mu-list-item-action>
                    <mu-list-item-title style="font-size: 22px; letter-spacing: 1px;">{{ account.name }}
                    </mu-list-item-title>
                    <mu-list-item-action style="flex-direction: row; align-items: center;">
                        <mu-button icon color="info" @click="doCopy">
                            <mu-icon value="filter_none"></mu-icon>
                        </mu-button>
                    </mu-list-item-action>
                </mu-list-item>
                <mu-list-item button :ripple="false">
                    <mu-list-item-action>
                        <mu-icon value="linear_scale"></mu-icon>
                    </mu-list-item-action>
                    <mu-list-item-title style="font-size: 20px; letter-spacing: 1px;">{{
                        configList[account.netId].netName }}
                    </mu-list-item-title>
                    <mu-list-item-action style="flex-direction: row; align-items: center;">
                        <mu-button icon color="info" @click="doExport">
                            <mu-icon value="vpn_key"></mu-icon>
                        </mu-button>
                    </mu-list-item-action>
                </mu-list-item>
            </mu-list>
        </mu-card>
        <mu-card
                style="width: 100%; margin-bottom: 10px; text-align: left; position: relative;">
            <mu-card-title title="代币资产" sub-title=""></mu-card-title>
            <mu-divider></mu-divider>
            <template v-for="(token, index) in tokenList">
                <div class="token-item" :key="token.symbol + index">
                    <!--<div class="left">-->
                        <!--<mu-icon value="style"></mu-icon>-->
                    <!--</div>-->
                    <div class="center">
                        <div style="width: auto; display: flex; flex-direction: column;">
                            <div style="font-size: 18px; color: #263238;">{{token.symbol}}</div>
                            <div style="font-size: 12px;">{{token.code}}</div>
                        </div>
                        <div style="flex: 1; text-align: right; font-size: 18px; color: #263238;">2.0001</div>
                    </div>
                    <div class="right">
                        <mu-button icon color="error">
                            <mu-icon value="swap_horiz"></mu-icon>
                        </mu-button>
                    </div>
                </div>
                <mu-divider inset :key="'d_' + index"></mu-divider>
            </template>

        </mu-card>
        <mu-card
                style="width: 100%; margin-bottom: 10px; text-align: left; position: relative;">
            <mu-card-title title="账户资源" sub-title=""></mu-card-title>
            <mu-divider></mu-divider>
            <mu-list>
                <mu-list-item button :ripple="false">
                    <mu-list-item-action>
                        <mu-icon value="sd_storage"></mu-icon>
                    </mu-list-item-action>
                    <mu-list-item-title>{{ info.ram.ram_usage }} / {{ info.ram.ram_quota }}</mu-list-item-title>
                    <mu-list-item-action>
                        <mu-list-item-after-text>RAM</mu-list-item-after-text>
                    </mu-list-item-action>
                </mu-list-item>
                <mu-divider inset></mu-divider>
                <mu-list-item button :ripple="false">
                    <mu-list-item-action>
                        <mu-icon value="memory"></mu-icon>
                    </mu-list-item-action>
                    <mu-list-item-title>{{ info.cpu.used }} / {{ info.cpu.max }}</mu-list-item-title>
                    <mu-list-item-action>
                        <mu-list-item-after-text>CPU</mu-list-item-after-text>
                    </mu-list-item-action>
                </mu-list-item>
                <mu-divider inset></mu-divider>
                <mu-list-item button :ripple="false">
                    <mu-list-item-action>
                        <mu-icon value="network_check"></mu-icon>
                    </mu-list-item-action>
                    <mu-list-item-title>{{ info.net.used }} / {{ info.net.max }}</mu-list-item-title>
                    <mu-list-item-action>
                        <mu-list-item-after-text>NET</mu-list-item-after-text>
                    </mu-list-item-action>
                </mu-list-item>
            </mu-list>
        </mu-card>
    </div>
</template>

<script>
    /* eslint-disable no-undef */

    export default {
        name: 'Account',
        data() {
            return {
                configList: configList,
                config: null,
                netId: '',
                account_id: null,
                account: {
                    id: 0,
                    name: '',
                    netId: '',
                    key: '',

                },
                info: {
                    ram: {
                        ram_quota: '0',
                        ram_usage: '0'
                    },
                    cpu: {
                        max: '0',
                        available: '0',
                        used: '0'
                    },
                    net: {
                        max: '0',
                        available: '0',
                        used: '0'
                    }
                },
                tokenList: [],
                pluginTokenUrl: {
                    url: '',
                    isLoaded: false
                },
                canQRPay: false
            }
        },
        created() {
            let self = this
            self.account_id = self.$route.params.id
            self.account = null
            let tmp = self.$parent.accountList
            for (let i in tmp) {
                if (tmp[i].id == self.account_id) {
                    self.account = tmp[i]
                }
            }
            if (self.account != null) {
                let configObj = self.configList[self.account.netId]
                if (configObj == undefined) {
                    self.$router.replace('/AccountList')
                } else {
                    self.netId = configObj.netId
                    self.tokenList = configObj.tokenList
                    self.pluginTokenUrl = configObj.pluginTokenUrl
                    self.canQRPay = configObj.canQRPay
                    self.$emit('setTop', {back: true, add: false, qr: self.canQRPay, path: '1'})
                    self.getAccount()
                    self.getBalancese()
                    // if (self.pluginToken.length == 0 && configObj.pluginTokenUrl != '') {
                    //     self.$http.get(`${configObj.pluginTokenUrl}`, {}).then(res => {
                    //         let r = res.data
                    //         configList[self.account.netName].pluginToken = r
                    //         configObj.pluginToken = r
                    //         self.pluginToken = r
                    //         self.userToken = self.userToken.concat(self.pluginToken)
                    //         self.getAccount(self.account)
                    //         self.getSysBalance()
                    //         self.getUserBalance()
                    //     }, () => {
                    //         self.getAccount(self.account)
                    //         self.getSysBalance()
                    //         self.getUserBalance()
                    //     })
                    // } else if (self.pluginToken.length > 0 && configObj.pluginTokenUrl != '') {
                    //     self.userToken = self.userToken.concat(self.pluginToken)
                    //     self.getAccount(self.account)
                    //     self.getSysBalance()
                    //     self.getUserBalance()
                    // } else {
                    //     self.getAccount(self.account)
                    //     self.getSysBalance()
                    //     self.getUserBalance()
                    // }

                }
            } else {
                self.$router.replace('/AccountList')
            }
        },
        methods: {
            getByteSize(net) {
                let len = 2
                let s = ''
                if (net < 1024) {
                    s = net.toFixed(len).toString() + 'B'
                } else {
                    net /= 1024
                    if (net < 1024) {
                        s = net.toFixed(len).toString() + 'KB'
                    } else {
                        net /= 1024
                        if (net < 1024) {
                            s = net.toFixed(len).toString() + 'MB'
                        } else {
                            net /= 1024
                            if (net < 1024) {
                                s = net.toFixed(len).toString() + 'GB'
                            } else {
                                net /= 1024
                                s = net.toFixed(len).toString() + 'TB'
                            }
                        }
                    }
                }
                return s
            },
            getTimeSize(net) {
                let len = 2
                let s = ''
                if (net < 1000) {
                    s = net.toFixed(len).toString() + 'ns'
                } else {
                    net /= 1000
                    if (net < 1000) {
                        s = net.toFixed(len).toString() + 'ms'
                    } else {
                        net /= 1000
                        if (net < 60) {
                            s = net.toFixed(len).toString() + 'sec'
                        } else {
                            net /= 60
                            if (net < 60) {
                                s = net.toFixed(len).toString() + 'min'
                            } else {
                                net /= 60
                                s = net.toFixed(len).toString() + 'hr'
                            }
                        }
                    }
                }
                return s
            },
            getAccount() {
                let self = this
                self.$parent.getAccount(self.netId, self.account, function (r) {
                    if (r.success) {
                        // cpu
                        let cpu = {
                            max: self.getTimeSize(Number.parseFloat(r.result.cpu_limit.max)),
                            available: self.getTimeSize(Number.parseFloat(r.result.cpu_limit.available)),
                            used: self.getTimeSize(Number.parseFloat(r.result.cpu_limit.used))
                        }
                        // net
                        let net = {
                            max: self.getByteSize(Number.parseFloat(r.result.net_limit.max)),
                            available: self.getByteSize(Number.parseFloat(r.result.net_limit.available)),
                            used: self.getByteSize(Number.parseFloat(r.result.net_limit.used))
                        }
                        // ram
                        let ram = {
                            ram_quota: self.getByteSize(r.result.ram_quota),
                            ram_usage: self.getByteSize(r.result.ram_usage)
                        }
                        self.info.cpu = cpu
                        self.info.net = net
                        self.info.ram = ram
                    }
                })
            },
            getBalancese() {
            },
            doCopy() {
                let self = this
                self.$copyText(self.account.name).then(function () {
                    self.$alert('复制成功', '提示', {type: 'success'})
                }, function () {
                    self.$alert('复制失败', '提示', {type: 'error'})
                })
            },
            doExport() {
                let self = this
                self.$parent.doExport(self.account)
            },
            getSysBalance() {
                let self = this
                let config = self.config
                config.keyProvider = self.account.key
                let eos = Eos(config)
                eos.getCurrencyBalance({
                    code: self.sysToken.account,
                    account: self.account.name,
                    symbol: self.sysToken.name
                }).then(result => {
                    if (result.length === 0) {
                        self.sysToken.balance = 0
                    } else {
                        self.sysToken.balance = Number.parseFloat(result[0].split(' EOS')[0])
                    }
                }).catch(error => {
                    console.log(error)
                    self.sysToken.balance = 0
                })
            },
            getUserBalance() {
                let self = this
                let config = self.config
                config.keyProvider = self.account.key
                let eos = Eos(config)
                for (let i in self.userToken) {
                    let token = self.userToken[i]
                    eos.getCurrencyBalance({
                        code: token.account,
                        account: self.account.name,
                        symbol: token.name
                    }).then(result => {
                        if (result.length === 0) {
                            token.balance = 0
                        } else {
                            token.balance = Number.parseFloat(result[0].split(` ${token.name}`)[0])
                        }
                    }).catch(error => {
                        console.log(error)
                        token.balance = 0
                    })
                }
            },
            goTransfer(token) {
                this.$router.push('/Transfer/' + this.account_id + '/' + token.name)
            },
            goTransferList(token) {
                this.$router.push('/TransferList/' + this.account_id + '/' + token.name)
            },
            qrClick() {
                this.$router.push('/QrCode/' + this.account_id)
            }
        }
    }
</script>

<style scoped>
    .token-item {
        /*margin-bottom: 10px;*/
        padding: 2px 4px 2px 16px;
        display: flex;
        flex-direction: row;
        justify-content: flex-start;
        align-items: flex-start;
        position: relative;
    }

    .token-item .left {
        width: 56px;
        height: 48px;
        display: flex;
        justify-content: flex-start;
        align-items: center;
        color: rgba(0, 0, 0, .54);
    }

    .token-item .center {
        flex: 1;
        height: 48px;
        display: flex;
        justify-content: flex-start;
        align-items: center;
        color: rgba(0, 0, 0, .54);
    }

    .token-item .right {
        width: 56px;
        height: 48px;
        display: flex;
        justify-content: flex-end;
        align-items: center;
        color: rgba(0, 0, 0, .54);
    }

    .mu-divider.inset {
        width: auto !important;

    }
</style>
