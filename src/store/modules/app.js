import Cookies from 'js-cookie'

import { getKey, savelog} from '@/api/app.js'
const state = {
    sidebar: {
        opened: Cookies.get('sidebarStatus') ? !!+Cookies.get('sidebarStatus') : true,
        withoutAnimation: false
    },
    device: 'desktop',
    appInfo: {
        name1: '药事服务医生端',
        name2: '陕西广济堂医药集团远程药事服务平台',
    },
    videoKey: {
        sdkAppId: null,
        userSig: null,
        userid: null
    },
    activeRouer:null,
    sheBeiNormal: true,
    callFlage: false,
    waitTime: ''
    // size: Cookies.get('size') || 'medium'
}

const mutations = {
    SET_ROUTER:(state,routerNow)=>{
        state.activeRouer=routerNow
    },
    SET_SGEBEI: (state, val) => {
        state.sheBeiNormal = val
    },
    SET_CELLFLASE: (state, flage) => {
        state.callFlage = flage
    },
    TOGGLE_SIDEBAR: state => {
        state.sidebar.opened = !state.sidebar.opened
        state.sidebar.withoutAnimation = false
        if (state.sidebar.opened) {
            // Cookies.set('sidebarStatus', 1)
        } else {
            // Cookies.set('sidebarStatus', 0)
        }
    },
    SET_WAITTIME:(state, val)=>{
        state.waitTime = val
    },
    SET_KEY: (state, videoKey) => {
        state.videoKey = videoKey
    },
    CLOSE_SIDEBAR: (state, withoutAnimation) => {
        // Cookies.set('sidebarStatus', 0)
        state.sidebar.opened = false
        state.sidebar.withoutAnimation = withoutAnimation
    },
    TOGGLE_DEVICE: (state, device) => {
        state.device = device
    },
    SET_SIZE: (state, size) => {
        state.size = size
        // Cookies.set('size', size)
    }
}

const actions = {
    toggleSideBar({commit}) {
        commit('TOGGLE_SIDEBAR')
    },
    savelog({commit}, content) {
        const {userid, msg} = content
        return new Promise((resolve, reject) => {
            savelog({userid, msg}).then(response => {
                resolve()
            }).catch(error => {
                reject(error)
            })
        })
    },
    getKey({commit}, userInfo) {
        const {userid, companyid} = userInfo
        return new Promise((resolve, reject) => {
            getKey({userid, companyid}).then(response => {
                let {data} = response
                commit('SET_KEY', {...data, userid})
                resolve({...data, userid})
            }).catch(error => {
                commit('SET_KEY', {
                    sdkAppId: null,
                    userSig: null,
                    userid: null
                })
                reject(error)
            })
        })
    },
    closeSideBar({commit}, {withoutAnimation}) {
        commit('CLOSE_SIDEBAR', withoutAnimation)
    },
    toggleDevice({commit}, device) {
        commit('TOGGLE_DEVICE', device)
    },
    setSize({commit}, size) {
        commit('SET_SIZE', size)
    }
}

export default {
    namespaced: true,
    state,
    mutations,
    actions
}
