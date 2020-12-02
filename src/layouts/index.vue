<template>
    <div class="layout" style="height: 100%">
        <el-container style="height: 100%;">
            <el-header class="el-header-box">
                <div class="left" v-if="realmName!=null && realmName != ''">
                    {{realmName.companysortname}}药事服务医生端
                </div>
                <div class="left" v-else>
                    药事服务医生端
                </div>
                <ul class="center">
                    <li :class="{active:item.to===activeRouer}" v-for="(item ,index) in routerList1"
                        @click="setRoute(item.to)"
                        tag="li" :key="index">
                        <img :src="item.classimg">
                        <span>{{item.name}}</span>
                    </li>
                </ul>
            </el-header>
            <el-main class="login-main">
                <slot>
                    <router-view/>
                </slot>
            </el-main>
            <el-footer class="login-footer" v-if="realmName!=null && realmName != ''">
                {{realmName.companyname}}远程药事服务平台
            </el-footer>
            <el-footer class="login-footer" v-else>
                远程药事服务平台
            </el-footer>
        </el-container>
    </div>
</template>

<script>
import {mapGetters} from 'vuex'
import zhzl from '@/assets/img/zhzl.png'
import cfgl from '@/assets/img/cfgl.png'
import zhgl from '@/assets/img/zhgl.png'
import tcdl from '@/assets/img/tcdl.png'
export default {
    name: "Layout",
    data() {
        return {
            routerList1: [
                {
                    to: '/home/accountOverview/information',
                    className: 'el-icon-user-solid',
                    classimg: zhzl,
                    name: '开始接诊'

                },
                {
                    to: '/home/historyRecipel',
                    className: 'el-icon-user-solid',
                    classimg: cfgl,
                    name: '接诊记录'
                },
                {
                    to: '/home/userSeting',
                    className: 'el-icon-user-solid',
                    classimg: zhgl,
                    name: '账户管理'
                },
                {
                    to: '/logout',
                    className: 'el-icon-user-solid',
                    classimg: tcdl,
                    name: '退出登录'
                },
            ],
            routerList2: [
                {
                    to: '/logout',
                    className: 'el-icon-user-solid',
                    name: '退出登录'
                },
                {
                    to: '/home/userSeting',
                    className: 'el-icon-user-solid',
                    name: '账户设置'
                },
                {
                    to: '/dashboard',
                    className: '',
                    name: '返回首页'
                }
            ],
        }
    },
    components: {},
    computed: {
        // 使用对象展开运算符将 getter 混入 computed 对象中
        ...mapGetters([
            'appInfo',
            'userInfo',
            'activeRouer',
            'callFlage',
            'realmName'
        ])
    },
    sockets: {
        connect: function () {
            console.log('链接成功')
        },
        connecting: function () {
            console.log('正在连接')
        },
        connect_failed: function () {
            console.log('连接失败')
        },
        disconnect: function () {
            console.log('断开连接')
        },
        error: function () {
            console.log('错误发生，并且无法被其他事件类型所处理')
        },
        otheruserlogin: function (data) {
            if (data.status === 400) {
                this.$message.warning(data.msg)
                setTimeout(() => {
                    this.$store.commit('user/SET_REMOVERINFO')
                    this.$socket.disconnect()
                    this.$router.push({
                        path: '/'
                    })
                }, 1000)
            }
        }
    },
    methods: {
        setRoute(path) {
            if (this.callFlage) {
                this.$message.warning('请在结束视频通话后进行本操作')
                return false
            }
            if (path === '/logout') {
                console.log('tu------------------------');
                this.$store.dispatch('user/logout', this.userInfo).then((res) => {
                    this.$message.success('退出成功')
                    this.$store.commit('user/SET_REMOVERINFO')
                    this.$socket.disconnect()
                    this.$router.replace({
                        path: '/'
                    })
                }).catch(() => {
                    console.log(this.$store.getters.userInfo)
                })
                return false
            }
            if (path === '/home/accountOverview/information') {
                this.$socket.emit('changeDoctorStatus', JSON.stringify({
                    userid: this.userInfo.userid,
                    companyid: this.userInfo.companyid,
                    workstatus: 0
                }))
            } else {
                this.$socket.emit('changeDoctorStatus', JSON.stringify({
                    userid: this.userInfo.userid,
                    companyid: this.userInfo.companyid,
                    workstatus: 1
                }))
                // if(path === '/home/historyRecipel') {
                //     this.$message.warning('开发中...')
                //     return false
                // }
            }
            this.$router.push({
                path: path
            })
            this.$store.commit('app/SET_ROUTER', path)
        }
    },
    mounted() {
    },
    beforeDestroy(){
        window.location.reload()
    }
}
</script>
<style lang="scss" scoped>
    $bg: #2d3a4b;
    $dark_gray: #889aa4;
    $light_gray: #eee;
    .active {
        color: red;
    }

    .layout {
        width: 100%;
        background-color: $color-common;;

        font-family: 'Arial Negreta', 'Arial Normal', 'Arial';

        .el-header-box {
            height: 100px !important;
            background: inherit;
            background-color: rgba(240, 248, 250, 1);
            border: none;
            border-radius: 0px;
            line-height: 100px;
            display: flex;
            justify-content: space-between;


            .left {
                font-weight: 700;
                font-style: normal;
                font-size: 28px;
                color: #36C2AA;
            }

            .center {
                flex: 1;
                text-align: right;
                padding-left: 125px;
                font-style: normal;
                font-size: 20px;
                color: #36C2AA;
                display: flex;
                justify-content: flex-start;

                li {
                    height: 100%;
                    display: flex;
                    justify-content: space-around;
                    align-items: center;
                    flex-direction: column;
                    width: 150px;

                    img{
                        margin-top: 10px;
                        width: 40px;
                        height: 40px;
                    }
                    i {
                        font-size: 60px;
                        height: 70px;
                        width: 70px;
                        text-align: center;
                        line-height: 70px;
                    }

                    span {

                        font-size: 16px;
                        line-height: 30px;
                    }

                    &:hover {
                        cursor: pointer;
                    }
                }
            }

            .right {
                font-style: normal;
                font-size: 18px;
                color: #36C2AA;
                display: flex;
                align-items: center;
                justify-content: center;
                flex-direction: column;

                li {
                    text-align: right;
                    width: 150px;
                    height: 30px;
                    line-height: 30px;

                    i {
                        font-size: 18px;
                    }

                    span {
                        padding-left: 10px;
                        font-size: 16px;
                    }

                    &:hover {
                        cursor: pointer;
                    }
                }
            }
        }

        .login-main {
            /*background: url("~@/assets/img/login-bg.jpg") no-repeat;*/
            /*-webkit-background-size: 100% 100%;*/
            /*background-size: 100% 100%;*/
            background-color: #ffffff;
            overflow: hidden;
            color: #454545;
        }

        .login-footer {
            text-align: center;
            height: 70px !important;
            background: inherit;
            background-color: rgba(240, 248, 250, 1);
            border: none;
            border-radius: 0px;
            line-height: 70px;
            font-style: normal;
            font-size: 28px;
            color: #36C2AA;
        }


        @media only screen and (max-width: 470px) {
            .thirdparty-button {
                display: none;
            }
        }
    }

    .el-input {
        background-color: #fff !important;
    }
</style>
