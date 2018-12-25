/* eslint-disable no-unused-vars */
let title = 'DisToken2'
let canGame = true
let canOTC = true
let configList = {
    '001': {
        netId: '001',
        netName: 'testNet',
        netColor: '#78909c',
        netLogo: '',
        chainId: 'cf057bbfb72640471fd910bcb67639c22df9f92470936cddc1ade0e2f2e7dc4f',
        eosAddress: 'http://10.255.1.225:8888',
        nodeJsAddress: 'http://10.255.1.225:3000',
        trackerAddress: 'http://10.255.1.225:3000/disTokenTracker/#/Transaction/',
        tokenList: [
            {
                code: 'eosio.token',
                symbol: 'TOK',
                balance: 0
            },
            {
                code: 'naturetokenc',
                symbol: 'NXT',
                balance: 0
            },
            {
                code: 'naturetokenc',
                symbol: 'EOS',
                balance: 0
            }
        ],
        pluginTokenUrl: {
            // url: 'https://easy-mock.com/mock/5a3725e4f082ee7632fbec44/hzg/GetPluginTokens',
            url: '',
            isLoaded: false
        },
        canQRPay: true,
        canCreate: true,
        canChange: false
    },
    '002': {
        netId: '002',
        netName: 'NatureToken',
        netColor: '#009688',
        netLogo: '',
        chainId: '6ee2cb8ac547446108eecb942d7167f181cef7af2aa96c9086f14e01aee5b2ff',
        // eosAddress: 'http://112.74.52.242:8888',
        // nodeJsAddress: 'http://112.74.52.242',
        eosAddress: 'https://node.naturetoken.io',
        nodeJsAddress: 'https://node.naturetoken.io',
        trackerAddress: 'http://tracker.distoken.io/tracker/#/Transaction/',
        tokenList: [
            {
                code: 'eosio.token',
                symbol: 'TOK',
                balance: 0
            },
            {
                code: 'naturetokenc',
                symbol: 'NXT',
                balance: 0
            },
            {
                code: 'naturetokenc',
                symbol: 'EOS',
                balance: 0
            },
            {
                code: 'sakuya',
                symbol: 'SAK',
                balance: 0
            }
        ],
        pluginTokenUrl: {
            url: '',
            isLoaded: false
        },
        canQRPay: true,
        canCreate: true,
        canChange: true
    },
    '003': {
        netId: '003',
        netName: 'HpNet',
        netColor: '#039be5',
        netLogo: '',
        chainId: '6ee2cb8ac547446108eecb942d7167f181cef7af2aa96c9086f14e01aee5b2ff',
        eosAddress: 'http://59.110.220.75:8888',
        nodeJsAddress: 'http://59.110.220.75',
        trackerAddress: 'http://hp.distoken.io/hp/#/Transaction/',
        tokenList: [
            {
                code: 'eosio.token',
                symbol: 'TOK',
                balance: 0
            },
            {
                code: 'expo111111ma',
                symbol: 'EXP',
                balance: 0
            },
            {
                code: 'qbguu1master',
                symbol: 'QBGG',
                balance: 0
            },
            {
                code: 'qbguu2master',
                symbol: 'CVC',
                balance: 0
            }
        ],
        pluginTokenUrl: {
            url: 'http://119.23.40.164/capc/api/coins',
            isLoaded: false
        },
        canQRPay: false,
        canCreate: false,
        canChange: false
    },
    '999': {
        netId: '999',
        netName: 'MainNet',
        netColor: '#f44336',
        netLogo: '',
        chainId: 'aca376f206b8fc25a6ed44dbdc66547c36c6c33e3a119ffbeaef943642f0e906',
        // eosAddress: 'http://39.105.44.204:8888',
        eosAddress: 'https://eos.greymass.com',
        nodeJsAddress: 'http://112.74.52.242',
        trackerAddress: 'https://eospark.com/MainNet/tx/',
        tokenList: [
            {
                code: 'eosio.token',
                symbol: 'EOS',
                balance: 0
            },
            {
                code: 'naturetokenc',
                symbol: 'NXT',
                balance: 0
            }
        ],
        pluginTokenUrl: {
            url: '',
            isLoaded: false
        },
        canQRPay: false,
        canCreate: false,
        canChange: true
    }
}
