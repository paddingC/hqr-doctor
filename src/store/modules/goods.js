import {goodsFind, usageanddosageSelect, getconfig} from '@/api/goods'
const state = {

}
const mutations = {

}
const actions = {
    usageanddosageSelect({commit}, companyid) {
        return new Promise((resolve, reject) => {
            usageanddosageSelect(companyid).then((res) => {
                const data = res.data
                resolve(data)
            }).catch(error => {
                reject(error)
            })
        })
    },
    goodsFind({commit}, companyid){
        return new Promise((resolve, reject) => {
            goodsFind(companyid).then((res) => {
                const data = res.data
                resolve(data)
            }).catch(error => {
                reject(error)
            })
        })
    },
    getconfig({commit}, params){
        return new Promise((resolve, reject) => {
            getconfig(params).then((res) => {
                const data = res.data
                resolve(data)
            }).catch(error => {
                reject(error)
            })
        })
    }
}

export default {
    namespaced: true,
    state,
    mutations,
    actions
}
