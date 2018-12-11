<template>
    <div style="width: 100%; padding: 10px; max-width: 600px; margin: 0 auto;">
        <mu-list textline="two-line">
            <mu-sub-header style="text-align: left;">游戏列表</mu-sub-header>
            <mu-divider></mu-divider>
            <template v-for="(game, index) in games">
                <mu-list-item avatar :ripple="false" button :key="'01-' + index">
                    <mu-list-item-action>
                        <mu-avatar color="white" size="50">
                            <img :src="game.logo">
                        </mu-avatar>
                    </mu-list-item-action>
                    <mu-list-item-content style="margin-left: 10px;">
                        <mu-list-item-title style="font-size: 19px;margin-bottom: 2px;">{{ game.name }}
                        </mu-list-item-title>
                        <mu-list-item-sub-title style="font-size: 12px;">
                            仅支持
                            <span style="color: #e65100;">{{ game.netName }}</span>
                            链
                        </mu-list-item-sub-title>
                    </mu-list-item-content>
                    <mu-list-item-action style="justify-content: center;">
                        <template v-if="canUse(game)">
                            <mu-icon value="done" color="green700"></mu-icon>
                            <span style="color: #388e3c; font-size: 12px; margin-top: 2px;">可用</span>
                        </template>
                        <template v-else>
                            <mu-icon value="block" color="grey600"></mu-icon>
                            <span style="color: #757575; font-size: 12px; margin-top: 2px;">不可</span>
                        </template>
                    </mu-list-item-action>
                </mu-list-item>
                <mu-divider :key="index"></mu-divider>
            </template>
        </mu-list>
    </div>
</template>

<script>
    /* eslint-disable no-undef */

    export default {
        name: 'GameList',
        data() {
            return {
                configList: configList,
                accounts: [],
                games: [
                    {
                        logo: 'https://muse-ui.org/img/avatar2.eff5aba4.jpg',
                        name: '什么什么游戏',
                        netName: 'MainNet'
                    },
                    {
                        logo: 'https://muse-ui.org/img/avatar3.55182749.jpg',
                        name: '另一个啥游戏',
                        netName: 'NatureToken'
                    },
                    {
                        logo: 'https://muse-ui.org/img/avatar4.9e7d0530.jpg',
                        name: '别的哦啥游戏',
                        netName: 'HpNet'
                    }
                ]
            }
        },
        created: function () {
            let self = this
            self.$emit('setTop', {title: 'DisToken', back: false, add: true, qr: false, path: '3'})
            let hasAccs = self.$cookies.isKey('disTokenAccounts')
            if (hasAccs) {
                let oldTmp = self.$cookies.get('disTokenAccounts')
                self.$cookies.set('disTokenAccounts', oldTmp, '15d')
                let tmp = JSON.parse(oldTmp)
                for (let i in tmp) {
                    self.accounts.push(tmp[i])
                }
            }
        },
        methods: {
            canUse(obj) {
                let self = this
                let res = false
                for (let i in self.accounts) {
                    let tmp = self.accounts[i]
                    if (tmp.netName == obj.netName) {
                        res = true
                        break
                    }
                }
                return res
            }
        }
    }
</script>

<style scoped>

</style>
