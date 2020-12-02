import {login, logout, getInfo, sxfindByID,
    changepassword, diseasesSelect,callEnd, inquirySelect,
    createRecord, startMixStream, notifyShop, sxfinddoc, finddtl, getconfig, stopRecord}          from '@/api/user'
import {getToken, setToken, removeToken} from '@/common/cookie'
// import router, { resetRouter } from '@/router'

const state = {
    token: '',
    name: '',
    avatar: '',
    introduction: '',
    roles: [],
    userInfo: {},
    patientInfo: {},
    prescriptionPic: null,
    loginName: '',
    doctorInfo: {},
    doorInfo: {},
    videoKey: {},
    creadRecord: {},
    Mix: {},
    streamState: '', // 混流状态
    creadState: false, // 录制状态
    realmName: {},
    isinventory:false //是否展示库存
}

const mutations = {
    SET_REALMNAME: (state, realmName) => {
        state.realmName = realmName
    },
    SET_TOKEN: (state, token) => {
        state.token = token
    },
    SET_PICTURE: (state, prescriptionPic) => {
        state.prescriptionPic = prescriptionPic
    },
    SET_USERINFO: (state, userInfo) => {
        state.userInfo = {...userInfo, isLogin: true}
    },
    SET_CREADSTATE: (state, val) => {
        state.creadState = val
    },
    SET_MIX: (state, val) => {
        state.Mix = val
    },
    SET_CREADRECORD: (state, creadRecord) => {
        state.creadRecord = creadRecord
    },
    SET_STREAMSTATE: (state, val) => {
        state.streamState = val
    },
    SET_LOGINNAME: (state, loginName) => {
        state.loginName = loginName
    },
    SET_REMOVERINFO: (state, userInfo) => {
        state.userInfo = {
            isLogin: false,
            loginid: null,
            loginpwd: null,
        }
    },
    SET_DOORINFO: (state, doorInfo) => {
        state.doorInfo = doorInfo
    },
    SET_DOCTORINFO: (state, doctorInfo) => {
        state.doctorInfo = doctorInfo
    },
    SET_PATIENTINFO: (state, patientInfo) => {
        state.patientInfo = patientInfo
    },
    SET_INTRODUCTION: (state, introduction) => {
        state.introduction = introduction
    },
    SET_NAME: (state, name) => {
        state.name = name
    },
    SET_AVATAR: (state, avatar) => {
        state.avatar = avatar
    },
    SET_ROLES: (state, roles) => {
        state.roles = roles
    },
    SET_ISINVENTORY:(state, value)=>{
        state.isinventory = value
    }
}

const actions = {
    getconfig ({commit}, code) {
        return new Promise((resolve, reject) => {
            getconfig(code).then(response => {
                const {data} = response
                commit('SET_REALMNAME', data)
                resolve(data)
            }).catch(error => {
                reject(error)
            })
        })
    },
    // user login
    login({commit}, userInfo) {
        const {loginid, loginpwd} = userInfo
        return new Promise((resolve, reject) => {
            login({loginid: loginid.trim(), loginpwd: loginpwd}).then(response => {
                const {data} = response
                commit('SET_TOKEN', data.token)
                commit('SET_USERINFO', data)
                setToken(data.token)
                resolve()
            }).catch(error => {
                console.log(error)
                reject(error)
            })
        })
    },
    sxfinddoc ({commit}, params){
        return new Promise((resolve, reject) => {
            sxfinddoc(params).then(response => {
                const {data} = response
                resolve(data)
            }).catch(error => {
                reject(error)
            })
        })
    },
    finddtl ({commit}, params){
        return new Promise((resolve, reject) => {
            finddtl(params).then(response => {
                const {data} = response
                resolve(data)
            }).catch(error => {
                reject(error)
            })
        })
    },
    inquirySelect({commit}, params) {
        return new Promise((resolve, reject) => {
            inquirySelect(params).then(response => {
                const {data} = response
                resolve(data)
            }).catch(error => {
                console.log(error);
                reject(error)
            })
        })
    },
    // get user info
    getInfo({commit, state}) {
        return new Promise((resolve, reject) => {
            getInfo(state.token).then(response => {
                const {data} = response

                if (!data) {
                    reject('Verification failed, please Login again.')
                }

                const {roles, name, avatar, introduction} = data

                // roles must be a non-empty array
                if (!roles || roles.length <= 0) {
                    reject('getInfo: roles must be a non-null array!')
                }

                commit('SET_ROLES', roles)
                commit('SET_NAME', name)
                commit('SET_AVATAR', avatar)
                commit('SET_INTRODUCTION', introduction)
                resolve(data)
            }).catch(error => {
                reject(error)
            })
        })
    },
    notifyShop ({commit}, params){
        return new Promise((resolve, reject) => {
            notifyShop(params).then(response => {
                resolve()
            }).catch(error => {
                reject(error)
            })
        })
    },
    createRecord ({commit}, params) {
        return new Promise((resolve, reject) => {
            createRecord(params).then(response => {
                const {data} = response
                commit('SET_CREADRECORD', data)
                commit('SET_CREADSTATE', true)
                resolve()
            }).catch(error => {
                reject(error)
            })
        })
    },
    stopRecord({commit}, params){
        return new Promise((resolve, reject) => {
            stopRecord(params).then(response => {
                const {data} = response
                resolve()
            }).catch(error => {
                reject(error)
            })
        })
    },
    startMixStream ({commit}, params){
        return new Promise((resolve, reject) => {
            startMixStream(params).then(response => {
                const {data} = response
                commit('SET_MIX', data)
                resolve()
            }).catch(error => {
                reject(error)
            })
        })
    },
    logout({commit}, user) {
        console.log(user);
        return new Promise((resolve, reject) => {
            logout({userid: user.userid, companyid: user.companyid}).then((res) => {
                commit('SET_TOKEN', '')
                commit('SET_ROLES', [])
                removeToken()
                resolve(res)
            }).catch(error => {
                reject(error)
            })
        })
    },
    sxfindByID ({commit}, params) {
        return new Promise((resolve, reject) => {
            sxfindByID(params).then(response => {
                const {data} = response
                commit('SET_DOCTORINFO', data)
                resolve(data)
            }).catch(error => {
                console.log(error);
                reject(error)
            })
        })
    },
    changepassword({commit}, params) {
        return new Promise((resolve, reject) => {
            changepassword(params).then(response => {
                resolve()
            }).catch(error => {
                console.log(error);
                reject(error)
            })
        })
    },
    diseasesSelect({commit}, params) {
        return new Promise((resolve, reject) => {
            diseasesSelect(params).then(response => {
                let {data} = response
                resolve(data)
            }).catch(error => {
                reject(error)
            })
        })
    },
    callEnd({commit}, params) {
        return new Promise((resolve, reject) => {
            callEnd(params).then(response => {
                let {data} = response
                resolve(data)
            }).catch(error => {
                reject(error)
            })
        })
    },
    // remove token
    resetToken({commit}) {
        return new Promise(resolve => {
            commit('SET_TOKEN', '')
            commit('SET_ROLES', [])
            removeToken()
            resolve()
        })
    },

    // dynamically modify permissions
    // changeRoles({ commit, dispatch }, role) {
    //     return new Promise(async resolve => {
    //         const token = role + '-token'
    //
    //         commit('SET_TOKEN', token)
    //         setToken(token)
    //
    //         const { roles } = await dispatch('getInfo')
    //
    //         resetRouter()
    //
    //         // generate accessible routes map based on roles
    //         const accessRoutes = await dispatch('permission/generateRoutes', roles, { root: true })
    //
    //         // dynamically add accessible routes
    //         router.addRoutes(accessRoutes)
    //
    //         // reset visited views and cached views
    //         dispatch('tagsView/delAllViews', null, { root: true })
    //
    //         resolve()
    //     })
    // }
}

export default {
    namespaced: true,
    state,
    mutations,
    actions
}
