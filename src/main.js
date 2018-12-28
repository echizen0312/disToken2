import Vue from 'vue'
import App from './App.vue'
import router from './router'

import 'material-design-icons/iconfont/material-icons.css'
import 'font-awesome/css/font-awesome.min.css'
import 'roboto-fontface/css/roboto/roboto-fontface.css'
import MuseUI from 'muse-ui'
import 'muse-ui/dist/muse-ui.css'
import Message from 'muse-ui-message'
import 'muse-ui-message/dist/muse-ui-message.css'
import Loading from 'muse-ui-loading'
import 'muse-ui-loading/dist/muse-ui-loading.css'
import VueCookies from 'vue-cookies'
import VueResource from 'vue-resource'
import VueClipboard from 'vue-clipboard2'

Vue.use(MuseUI)
Vue.use(Message)
Vue.use(Loading)
Vue.use(VueCookies)
Vue.use(VueResource)
Vue.use(VueClipboard)

Vue.config.productionTip = false

new Vue({
    router,
    render: h => h(App)
}).$mount('#app')
