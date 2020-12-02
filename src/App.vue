<template>
    <div id="app">
        <!--		<Layout>-->
        <router-view/>
        <!--		</Layout>-->
    </div>
</template>

<script>
import Layout from "@/layouts"

import {mapGetters}    from 'vuex'
export default {
    name: "App",
    components: {
        Layout
    },
    created() {
        try {
            document.body.removeChild(document.getElementById('appLoading'))
            setTimeout(function () {
                document.getElementById('app').style.display = 'block'
            }, 500)
        } catch (e) {

        }
    },
    computed: {
        ...mapGetters([
            'userInfo'
            // ...
        ])
    },
    sockets: {
        connect: function () {
            console.log('socket 链接成功--------------------')
            this.$socket.emit('login', JSON.stringify({
                userid: this.userInfo.userid,
                companyid: this.userInfo.companyid,
                pharmacistid: this.userInfo.pharmacistid
            }));
        },
        connecting: function () {
            console.log('正在连接')
        },
        connect_failed: function () {
            console.log('连接失败')
        },
        error: function () {
            console.log('错误发生，并且无法被其他事件类型所处理')
        },

    },
}
</script>

<style lang="scss">
    @import "./style/normalize.scss";
    @import "./style/reset.scss";
    @import "./style/common.scss";
    @import "~@/assets/iconfont/iconfont.css";

    #app {
        font-size: $font-size-base;
        color: $color-common;
        font-family: -apple-system, BlinkMacSystemFont, "PingFang SC", "SF UI Text",
        "Helvetica Neue", STHeiti, "Microsoft Yahei", Tahoma, Simsun, sans-serif;
        min-width: 1320px;
        height: 100vh;
        box-sizing: border-box;
        overflow: auto;
    }

    .el-main {
        padding: 10px !important;
    }
</style>
