<template>
    <!--<div class="scroll-wrapper">-->
    <!--<iframe v-if="url != ''"-->
    <!--:src="url"-->
    <!--scrolling="no"-->
    <!--frameborder="0"/>-->
    <!--</div>-->
    <iframe v-if="url != ''"
            :src="url"
            scrolling="auto"
            frameborder="0"/>
</template>

<script>
    /* eslint-disable no-undef */

    export default {
        name: 'Web',
        data() {
            return {
                configList: configList,
                configObj: null,
                id: null,
                path: 8,
                back: true,
                account: null,
                url: ''
            }
        },
        created: function () {
            let self = this
            self.id = self.$route.params.id
            self.path = self.$route.params.path
            if (self.path == 3) {
                self.back = false
                self.url = 'http://c2c.naturetoken.io/'
            }
            if (self.path == 4) {
                self.url = ''
            }
            self.$emit('setTop', {back: self.back, add: false, qr: false, scan: false, path: self.path + ''})
            self.account = null
            let tmp = self.$parent.accountList
            for (let i in tmp) {
                if (tmp[i].id == self.id) {
                    self.account = tmp[i]
                }
            }
            if (self.account != null && self.configList[self.account.netId] != undefined) {
                self.configObj = self.configList[self.account.netId]
            } else {
                console.log('no acc')
            }
        },
        methods: {
            goBack() {
                let self = this
                self.$router.go(-1);
            }
        }
    }
</script>

<style scoped>
    .scroll-wrapper {
        -webkit-overflow-scrolling: touch;
        /*overflow-x: scroll;*/
        overflow-y: scroll;
        width: 100%;
        height: 100%;
    }

    iframe {
        width: 1px;
        height: 100%;
        min-width: 100%;
        *width: 100%;
    }

</style>
