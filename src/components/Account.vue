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
                        <div class="net-logo" :style="{backgroundColor: configList[account.netId].netColor}">{{
                            configList[account.netId].netName[0] }}
                        </div>
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
                    <div class="center" @click="goTransfer(token)">
                        <div style="width: auto; display: flex; flex-direction: column;">
                            <div style="font-size: 18px; color: #263238;">{{token.symbol}}</div>
                            <div style="font-size: 12px;">{{token.code}}</div>
                        </div>
                        <div style="flex: 1; text-align: right; font-size: 21px; color: #263238;">{{token.balance}}
                        </div>
                    </div>
                    <div class="right">
                        <!--<mu-button icon color="error" @click="goTransfer(token)">-->
                        <!--<mu-icon value="swap_horiz"></mu-icon>-->
                        <!--</mu-button>-->
                        <div v-if="$parent.canOTC" class="otc-button" @click="goOTC">购买</div>
                        <div v-else class="otc-button" @click="goTransfer(token)">转账</div>
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
                netId: '',
                id: null,
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
        watch: {
            tokenList: function () {
                let self = this
                self.getBalancese()
            }
        },
        created() {
            let self = this
            self.id = self.$route.params.id
            self.account = null
            let tmp = self.$parent.accountList
            for (let i in tmp) {
                if (tmp[i].id == self.id) {
                    self.account = tmp[i]
                }
            }
            if (self.account != null && self.configList[self.account.netId] != undefined) {
                let configObj = self.configList[self.account.netId]
                if (configObj == undefined) {
                    self.$router.replace('/AccountList')
                } else {
                    self.netId = configObj.netId
                    self.tokenList = configObj.tokenList
                    self.canQRPay = configObj.canQRPay
                    self.$emit('setTop', {back: true, add: false, qr: self.canQRPay, path: '1'})
                    self.getAccount()
                    self.getBalancese()
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
                let self = this
                self.$parent.getBalancese(self.netId, self.tokenList, self.account, function () {
                    // console.log(r)
                })
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
            goTransfer(token) {
                this.$router.push('/Transfer/' + this.id + '/' + token.code + '/' + token.symbol)
            },
            goTransferList(token) {
                this.$router.push('/TransferList/' + this.id + '/' + token.code + '/' + token.symbol)
            },
            qrClick() {
                this.$router.push(`/QrCode/${this.id}`)
            },
            goOTC() {
                location.href = 'http://c2c.naturetoken.io/'
            },
        }
    }
</script>

<style scoped>
    .token-item {
        /*margin-bottom: 10px;*/
        padding: 3px 4px 3px 16px;
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

    .net-logo {
        width: 24px;
        height: 24px;
        display: flex;
        justify-content: center;
        align-items: center;
        border-radius: 4px;
        font-size: 16px;
        font-weight: bolder;
        color: #ffffff;
        margin-right: 10px;
    }

    .otc-button {
        font-size: 12px;
        margin-right: 6px;
        padding: 2px 8px 2px 8px;
        border-radius: 5px;
        color: white;
        background-color: #2095f2;
    }
</style>
