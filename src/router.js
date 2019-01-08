import Vue from 'vue'
import Router from 'vue-router'
import AccountList from './components/AccountList.vue'
import Account from './components/Account.vue'
import CreateAccount from './components/CreateAccount.vue'
import TransferList from './components/TransferList.vue'
import Transfer from './components/Transfer.vue'
import Change from './components/Change.vue'
import QrCode from './components/QrCode.vue'
import GameList from './components/GameList.vue'
import RequestTransaction from './components/RequestTransaction.vue'
import RequestTransfer from './components/RequestTransfer.vue'
import Web from './components/Web.vue'

Vue.use(Router)

export default new Router({
    routes: [
        {path: '/', name: 'Home', component: AccountList},
        {path: '/AccountList', name: 'AccountList', component: AccountList},
        {path: '/Account/:id', name: 'Account', component: Account},
        {path: '/CreateAccount', name: 'CreateAccount', component: CreateAccount},
        {path: '/TransferList/:id/:code/:symbol', name: 'TransferList', component: TransferList},
        {path: '/Transfer/:id/:code/:symbol', name: 'Transfer', component: Transfer},
        {path: '/Change/:id/:code/:symbol', name: 'Change', component: Change},
        {path: '/QrCode/:id', name: 'QrCode', component: QrCode},
        {path: '/GameList', name: 'GameList', component: GameList},
        {path: '/RequestTransaction/:netId/:accName/:tr', name: 'RequestTransaction', component: RequestTransaction},
        {
            path: '/RequestTransfer/:netId/:code/:symbol/:to/:number/:memo',
            name: 'RequestTransfer',
            component: RequestTransfer
        },
        {path: '/Web/:id/:path', name: 'Web', component: Web},
    ]
})
