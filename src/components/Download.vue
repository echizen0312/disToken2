<template>
    <div style="width: 100%; padding: 15px; max-width: 600px; margin: 0 auto; text-align: center;">
        <mu-paper :z-depth="3">
            <div style="padding: 45px;">
                <mu-button class="dld" full-width color="info" @click="downloadIOS">IOS APP 下载</mu-button>
                <mu-button class="dld" full-width color="info" @click="downloadAndroid">Android APP 下载</mu-button>
            </div>
        </mu-paper>
    </div>
</template>

<script>
    export default {
        name: 'Download',
        data() {
            return {
                path: 8,
                back: true
            }
        },
        created: function () {
            let self = this
            self.$emit('setTop', {back: self.back, add: false, qr: false, scan: false, path: self.path + ''})
        },
        methods: {
            goBack() {
                let self = this
                self.$router.go(-1)
            },
            downloadIOS() {
                // window.open('NaturePay.ipa')
                window.open('https://fir.im/wgyz')
            },
            downloadAndroid() {
                window.open('NaturePay.apk')
            }
        }
    }
</script>

<style scoped>
    .dld {
        /*width: 168px;*/
        /*height: 128px;*/
        margin-bottom: 45px;
    }

    .dld:last-child {
        margin-bottom: 0;
    }
</style>
