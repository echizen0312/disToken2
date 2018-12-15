<template>
    <div style="width: 100%; padding: 10px; max-width: 600px; margin: 0 auto;">
        <mu-paper class="account-item" :z-depth="3" v-for="(game, index) in games"
                  :key="'01_' + index"
                  v-if="configList[game.netId] != undefined"
                  @click="checkGame(game)">
            <div class="account-item-head" :style="{backgroundColor: configList[game.netId].netColor}"></div>
            <div class="account-item-top">
                <div class="account-item-top-center">
                    <div class="net-logo" :style="{backgroundColor: configList[game.netId].netColor}">{{
                        configList[game.netId].netName[0] }}
                    </div>
                    <span>仅支持</span><span style="color: #e65100; margin-left: 5px; margin-right: 5px;">{{ configList[game.netId].netName }}</span><span>链</span>
                </div>
                <div class="account-item-top-right">
                    <!--<mu-icon value="done" color="green700" v-if="canUse(game)"></mu-icon>-->
                    <!--<mu-icon value="block" color="green700" v-else></mu-icon>-->
                </div>
            </div>
            <div class="account-item-center">
                <div class="account-item-center-left">
                    <img style="width: 48px; height: 48px; border-radius: 5px;" :src="game.logo">
                </div>
                <div class="account-item-center-center">
                    <span class="account-name">{{ game.name }}</span>
                </div>
                <div class="account-item-center-right">

                </div>
            </div>
        </mu-paper>
        <mu-dialog title="选择游戏账户" width="600" max-width="80%" :esc-press-close="false"
                   :overlay-close="false" :open.sync="openAlert">
            <mu-form :model="form" label-width="80">
                <mu-form-item prop="input" label="使用账户">
                    <mu-select v-model="form.nowAccountName" full-width>
                        <mu-option v-for="account in nowAccountList" :key="account.id"
                                   :label="account.name"
                                   :value="account.name"></mu-option>
                    </mu-select>
                </mu-form-item>
            </mu-form>
            <mu-button slot="actions" flat color="primary" @click="closeAlertDialog" style="margin-right: 8px;">关闭
            </mu-button>
            <mu-button slot="actions" color="primary" @click="goGame">确定</mu-button>
        </mu-dialog>
    </div>
</template>

<script>
    /* eslint-disable no-undef */

    export default {
        name: 'GameList',
        data() {
            return {
                configList: configList,
                accountList: this.$parent.accountList,
                games: games,
                nowGame: null,
                openAlert: false,
                nowAccountList: [],
                form: {
                    nowAccountName: null
                }
            }
        },
        created: function () {
            let self = this
            self.$emit('setTop', {back: false, add: true, qr: false, path: '2'})
        },
        methods: {
            canUse(obj) {
                let self = this
                let res = false
                for (let i in self.accountList) {
                    let tmp = self.accountList[i]
                    if (tmp.netId == obj.netId) {
                        res = true
                        break
                    }
                }
                return res
            },
            getAccList(gm) {
                let self = this
                let list = []
                for (let i in self.accountList) {
                    let tmp = self.accountList[i]
                    if (tmp.netId == gm.netId) {
                        list.push(tmp)
                    }
                }
                return list
            },
            closeAlertDialog() {
                let self = this
                self.openAlert = false
            },
            checkGame(gm) {
                let self = this
                let can = self.canUse(gm)
                if (can) {
                    self.nowGame = gm
                    self.nowAccountList = self.getAccList(self.nowGame)
                    self.openAlert = true
                } else {
                    self.$alert('钱包没有导入过这条链的账户', '提示', {type: 'error'})
                }
            },
            goGame() {
                let self = this
                if (self.nowGame != null && self.form.nowAccountName != null) {
                    let url = `${self.nowGame.address}?netId=${self.nowGame.netId}&accName=${self.form.nowAccountName}`
                    location.href = url
                }
            }
        }
    }
</script>

<style scoped>
    .account-item {
        margin-bottom: 10px;
        padding: 14px 8px 4px 12px;
        display: flex;
        flex-direction: column;
        justify-content: flex-start;
        align-items: flex-start;
        position: relative;
    }

    .account-item-head {
        width: 100%;
        height: 5px;
        position: absolute;
        left: 0;
        top: 0;
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
        margin-top: 4px;
    }

    .account-item-center-center {
        flex: 1;
        height: 68px;
        display: flex;
        justify-content: flex-start;
        align-items: center;
        padding-left: 15px;
    }

    .account-item-center-left {
        width: 48px;
        height: 68px;
        display: flex;
        justify-content: center;
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
        font-size: 28px;
        font-weight: 400;
        letter-spacing: 2px;
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
