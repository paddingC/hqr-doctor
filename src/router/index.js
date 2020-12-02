import Vue            from 'vue'
import Router         from 'vue-router'
import {getToken, setToken, removeToken} from '@/common/cookie'
import {getloginInfo} from '@/common/cookie'
// 正常加载
// import Home from '../views/home'
// import About from '../views/About'
import store          from '../store'

console.log(store)
// 按需（懒）加载（vue实现）
const Login = () => import( /* webpackChunkName: "login" */ '../views/login')
const Layouts = () => import( /* webpackChunkName: "index" */ '../layouts/index')

Vue.use(Router)

let base = `${process.env.BASE_URL}` // 动态获取二级目录

const router = new Router({
    mode: 'history',
    base: base,
    routes: [
        {
            path: '/',
            name: 'login',
            component: Login
        },
        {
            path: '/home',
            name: 'home',
            component: Layouts,
            children: [
                {
                    path: 'userSeting',
                    name: 'userSeting',
                    meta: {
                        title: '账户管理',
                    },
                    component: resolve => require([ '@/views/userSeting/index.vue' ], resolve),
                },
                {
                    path: 'historyRecipel',
                    name: 'historyRecipel',
                    meta: {
                        title: '接诊记录',
                    },
                    component: resolve => require([ '@/views/historyRecipel/index.vue' ], resolve),
                },
                {
                    path: 'accountOverview',
                    name: 'accountOverview',
                    meta: {
                        title: '账户总览'
                    },
                    component: resolve => require([ '@/views/accountOverview/index.vue' ], resolve),
                    children: [
                        {
                            path: 'information',
                            name: 'information',
                            meta: {
                                title: '医生简介'
                            },
                            component: resolve => require([ '@/views/accountOverview/information.vue' ], resolve),
                        },
                        {
                            path: 'chronicDisease',
                            name: 'chronicDisease',
                            meta: {
                                title: '接诊视频通话'
                            },
                            component: resolve => require([ '@/views/accountOverview/chronicDisease.vue' ], resolve),
                        },
                    ]
                },
            ]
        },
        {
            path: '*',
            redirect: '/'
        },
    ],
    scrollBehavior(to, from, savedPosition) {
        if (savedPosition) {
            return savedPosition
        } else {
            return {
                x: 0,
                y: 0
            }
        }
    }
})
router.beforeEach((to, from, next) => {
    if (to.meta.title) {
        document.title = to.meta.title
    }
    checkInfo()
    const loginStatus = sessionStorage.getItem('isLogin')
    if (to.path === '/') {
        next()
    } else {
        if (loginStatus < 1) {
            // 如果访问非登录界面，且户会话信息不存在，代表未登录，则跳转到登录界面
            next({path: '/'})
        } else {
            // 加载动态菜单和路由
            next()
        }
    }
})
function checkInfo() {
    if (!sessionStorage.getItem('companyUrl') || sessionStorage.getItem('companyUrl') == '') {
        let uls = window.location.href.split('/')
        if (uls.length > 3){
            store.dispatch('user/getconfig', {companycode: uls[3]}).then(res => {
            }).catch(err => {
                console.log(err);
            })
        }
    }
}
export default router
