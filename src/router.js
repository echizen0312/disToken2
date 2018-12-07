import Vue from 'vue'
import Router from 'vue-router'
import AccountList from './components/AccountList.vue'
import Account from './components/Account.vue'

Vue.use(Router)

export default new Router({
    routes: [
        {path: '/', name: 'Home', component: AccountList},
        {path: '/AccountList', name: 'AccountList', component: AccountList},
        {path: '/Account/:id', name: 'Account', component: Account},
    ]
})
