<template>
    <div style="width: 100%; padding: 10px; max-width: 600px; margin: 0 auto;">
        <!--<mu-button fab color="red" style="position: fixed; bottom: 75px; right: 20px; z-index: 999;"-->
        <!--@click="goTransfer">-->
        <!--<mu-icon value="swap_horiz"></mu-icon>-->
        <!--</mu-button>-->
        <!--<mu-button v-if="symbol == 'NXT' && configObj.canChange" fab color="purple"-->
        <!--style="position: fixed; bottom: 75px; left: 20px; z-index: 999;"-->
        <!--@click="goChange">-->
        <!--<mu-icon value="cached"></mu-icon>-->
        <!--</mu-button>-->
        <mu-card
                style="width: 100%; margin-bottom: 80px; text-align: left; position: relative;">
            <mu-card-title :title="symbol + ' 转账记录（近10条）'"></mu-card-title>
            <mu-divider></mu-divider>
            <div class="account-item-head" :style="{backgroundColor: configObj.netColor}"></div>
            <div style="padding: 10px 15px 5px 15px; ">
                <mu-tabs :value.sync="active1" inverse color="secondary" text-color="rgba(0, 0, 0, .54)" full-width
                         @change="change">
                    <mu-tab>全部</mu-tab>
                    <mu-tab>转出</mu-tab>
                    <mu-tab>转入</mu-tab>
                </mu-tabs>
                <div v-if="active1 === 0">
                    <mu-list v-loading="loading3" data-mu-loading-size="24">
                        <template v-for="(transfer, index) in allList">
                            <mu-divider :key="'0_' + index" v-if="index > 0"></mu-divider>
                            <mu-list-item button :ripple="false" :key="'0_' + index + index"
                                          @click="showTransferInfo(transfer)">
                                <mu-list-item-action>
                                    <mu-icon value="unarchive" color="orange800"
                                             v-if="transfer.data.from == account.name"></mu-icon>
                                    <mu-icon value="archive" color="green600" v-else></mu-icon>
                                </mu-list-item-action>
                                <!--<mu-list-item-content>-->
                                <div style="flex: 1; display: flex; flex-direction: row;">
                                    <mu-list-item-title v-if="transfer.data.from == account.name">{{ transfer.data.to
                                        }}
                                    </mu-list-item-title>
                                    <mu-list-item-title v-else>{{ transfer.data.from }}</mu-list-item-title>
                                    <mu-list-item-sub-title style="text-align: right;">{{ transfer.data.quantity }}
                                    </mu-list-item-sub-title>
                                </div>
                                <!--</mu-list-item-content>-->
                            </mu-list-item>
                        </template>
                        <mu-list-item button :ripple="false" v-if="allList.length == 0">
                            <mu-list-item-title style="text-align: center; margin-top: 8px;">没有记录</mu-list-item-title>
                        </mu-list-item>
                    </mu-list>
                </div>
                <div v-if="active1 === 1">
                    <mu-list v-loading="loading1" data-mu-loading-size="24">
                        <template v-for="(transfer, index) in outList">
                            <mu-divider :key="'1_' + index" v-if="index > 0"></mu-divider>
                            <mu-list-item button :ripple="false" :key="'1_' + index + index"
                                          @click="showTransferInfo(transfer)">
                                <mu-list-item-action>
                                    <mu-icon value="unarchive" color="orange800"></mu-icon>
                                </mu-list-item-action>
                                <!--<mu-list-item-content>-->
                                <div style="flex: 1; display: flex; flex-direction: row;">
                                    <mu-list-item-title>{{ transfer.data.to }}</mu-list-item-title>
                                    <mu-list-item-sub-title style="text-align: right;">{{ transfer.data.quantity }}
                                    </mu-list-item-sub-title>
                                </div>
                                <!--</mu-list-item-content>-->
                            </mu-list-item>
                        </template>
                        <mu-list-item button :ripple="false" v-if="outList.length == 0">
                            <mu-list-item-title style="text-align: center; margin-top: 8px;">没有记录</mu-list-item-title>
                        </mu-list-item>
                    </mu-list>
                </div>
                <div v-if="active1 === 2">
                    <mu-list v-loading="loading2" data-mu-loading-size="24">
                        <template v-for="(transfer, index) in inList">
                            <mu-divider :key="'2_' + index" v-if="index > 0"></mu-divider>
                            <mu-list-item button :ripple="false" :key="'2_' + index + index"
                                          @click="showTransferInfo(transfer)">
                                <mu-list-item-action>
                                    <mu-icon value="archive" color="green600"></mu-icon>
                                </mu-list-item-action>
                                <!--<mu-list-item-content>-->
                                <div style="flex: 1; display: flex; flex-direction: row;">
                                    <mu-list-item-title>{{ transfer.data.from }}</mu-list-item-title>
                                    <mu-list-item-sub-title style="text-align: right;">{{ transfer.data.quantity }}
                                    </mu-list-item-sub-title>
                                </div>
                                <!--</mu-list-item-content>-->
                            </mu-list-item>
                        </template>
                        <mu-list-item button :ripple="false" v-if="inList.length == 0">
                            <mu-list-item-title style="text-align: center; margin-top: 8px;">没有记录</mu-list-item-title>
                        </mu-list-item>
                    </mu-list>
                </div>
            </div>
        </mu-card>
        <mu-dialog title="转账详情" width="600" max-width="80%" :esc-press-close="false"
                   :overlay-close="false" :open.sync="openAlert">
            <mu-list style="padding: 0;">
                <mu-list-item button :ripple="false" @click="goTracker(nowData.trx_id)">
                    <mu-list-item-action>
                        trx_id
                    </mu-list-item-action>
                    <mu-list-item-title style="text-align: right;">{{ nowData.trx_id }}</mu-list-item-title>
                </mu-list-item>
                <mu-divider></mu-divider>
                <mu-list-item button :ripple="false">
                    <mu-list-item-action>
                        from
                    </mu-list-item-action>
                    <mu-list-item-title style="text-align: right;">{{ nowData.from }}</mu-list-item-title>
                </mu-list-item>
                <mu-divider></mu-divider>
                <mu-list-item button :ripple="false">
                    <mu-list-item-action>
                        to
                    </mu-list-item-action>
                    <mu-list-item-title style="text-align: right;">{{ nowData.to }}</mu-list-item-title>
                </mu-list-item>
                <mu-divider></mu-divider>
                <mu-list-item button :ripple="false">
                    <mu-list-item-action>
                        quantity
                    </mu-list-item-action>
                    <mu-list-item-title style="text-align: right;">{{ nowData.quantity }}</mu-list-item-title>
                </mu-list-item>
                <mu-divider></mu-divider>
                <mu-list-item button :ripple="false">
                    <mu-list-item-action>
                        time
                    </mu-list-item-action>
                    <mu-list-item-title style="text-align: right;">{{ GetMoment(nowData.time) }}</mu-list-item-title>
                </mu-list-item>
                <mu-divider></mu-divider>
            </mu-list>
            <div style="display: flex; flex-direction: row;">
                <div style="width: 56px; height: 48px; line-height: 48px; margin-left: 16px;">memo</div>
                <div style="flex: 1; padding-top: 13px; margin-left: 24px; margin-right: 16px; text-align: right; line-height: 22px; word-break:break-all; word-wrap:break-word;">
                    {{ nowData.memo }}
                </div>
            </div>
            <mu-button slot="actions" flat color="primary" @click="closeTransferInfo">关闭</mu-button>
        </mu-dialog>
    </div>
</template>

<script>
    /* eslint-disable no-undef */
    import * as moment from 'moment'

    export default {
        name: 'TransferList',
        data() {
            return {
                configList: configList,
                configObj: null,
                id: null,
                code: null,
                symbol: null,
                account: null,
                active1: 0,
                token_code: null,
                token_symbol: null,
                outList: [],
                inList: [],
                allList: [],
                loading1: false,
                loading2: false,
                loading3: false,
                openAlert: false,
                nowData: {
                    from: '',
                    to: '',
                    quantity: '',
                    memo: ''
                }
            }
        },
        created: function () {
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
                self.change(0)
            } else {
                self.$router.replace('/AccountList')
            }
        },
        methods: {
            GetMoment(date) {
                return moment(date).utcOffset(480).format('YYYY-MM-DD HH:mm:ss')
            },
            change(value) {
                let self = this
                let isMain = false
                if (self.configObj.eosAddress == 'http://39.105.44.204:8888') {
                    isMain = false
                } else {
                    isMain = false
                }
                if (value == 1) {
                    self.getAccountTransfersOut(isMain)
                }
                if (value == 2) {
                    self.getAccountTransfersIn(isMain)
                }
                if (value == 0) {
                    self.getAccountTransfersAll(isMain)
                }
            },
            getAccountTransfersOut(isMain) {
                let self = this
                let direction = 'out'
                self.loading1 = true
                self.$parent.getTransferList(self.configObj.netId, self.account, self.code, self.symbol, direction, isMain, function (r) {
                    if (r.success) {
                        self.outList = r.result
                        self.loading1 = false
                    } else {
                        self.loading1 = false
                    }
                })
            },
            getAccountTransfersIn(isMain) {
                let self = this
                let direction = 'in'
                self.loading2 = true
                self.$parent.getTransferList(self.configObj.netId, self.account, self.code, self.symbol, direction, isMain, function (r) {
                    if (r.success) {
                        self.inList = r.result
                        self.loading2 = false
                    } else {
                        self.loading2 = false
                    }
                })
            },
            getAccountTransfersAll(isMain) {
                let self = this
                let direction = 'all'
                self.loading3 = true
                self.$parent.getTransferList(self.configObj.netId, self.account, self.code, self.symbol, direction, isMain, function (r) {
                    if (r.success) {
                        self.allList = r.result
                        self.loading3 = false
                    } else {
                        self.loading3 = false
                    }
                })
            },
            showTransferInfo(trx) {
                this.nowData = trx.data
                this.nowData.time = trx.time
                this.nowData.trx_id = trx.trx_id
                this.openAlert = true
            },
            closeTransferInfo() {
                this.openAlert = false
            },
            goTransfer() {
                this.$router.push('/Transfer/' + this.id + '/' + this.code + '/' + this.symbol)
            },
            goChange() {
                this.$router.push('/Change/' + this.id + '/' + this.code + '/' + this.symbol)
            },
            goTracker(trx_id) {
                window.open(this.configObj.trackerAddress + '' + trx_id)
            }
        }
    }
</script>

<style scoped>

</style>
