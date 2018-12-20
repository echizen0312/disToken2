// NXT_03
export default {
    NXT_GetAccount: function () {
        let path = location.href
        let arr = path.split('?')
        let acc = null
        if (arr.length > 1) {
            let tmp = arr[arr.length - 1]
            arr = tmp.split('&')
            if (arr.length == 2) {
                let a = arr[0].split('=')
                let b = arr[1].split('=')
                if (a.length == 2 && b.length == 2 && a[0] == 'netId' && b[0] == 'accName') {
                    acc = {
                        netId: a[1],
                        name: b[1]
                    }
                }
            }
        }
        return acc
    },
    NXT_RequestTransaction: function (account, tr) {
        if (account != null && account.netId != undefined && account.name != undefined) {
            let isTest = false
            let address = isTest ? 'http://10.255.1.25:8080/disToken' : 'https://w.naturetoken.io/nxt_w'
            let url = `${address}/#/RequestTransaction/${account.netId}/${account.name}/${JSON.stringify(tr)}`
            location.href = url
        } else {
            return false
        }
    }
}
