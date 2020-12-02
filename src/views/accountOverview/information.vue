<template>
    <div class="information">
        <div class="left-BOX">
            <el-row :gutter="20">
                <el-col :span="6">
                    <div class="col-title">
                        医生信息
                    </div>
                </el-col>
                <el-col :span="18">
                    <div class=" col-title">
                        <el-switch
                            @change="switchChange"
                            v-model="form.workstatus"
                            active-color="#13ce66"
                            inactive-color="#ff4949">
                        </el-switch>
                    </div>
                </el-col>

            </el-row>
            <el-row :gutter="20" style="height: 242px;">
                <el-col :span="6">
                    <div class="user-img">
                        <el-avatar shape="square" style="background:#fff;
                        height: 5.3cm;
                        width: 3.5cm;
                        border-radius: 0px" :fit="fit" :src="form.headimage"></el-avatar>
                    </div>
                </el-col>
                <el-col :span="18">
                    <ul>
                        <li class="store-name">{{form.doctorname}}</li>
                        <li class="store-name">{{form.positionaltitles}}</li>
                        <li class="store-name">咨询数：{{form.consultationnum}}</li>
                    </ul>
                </el-col>
            </el-row>
            <div class="card cardTel">
                <p>网络部维护电话：{{tel.wlwhb}}</p>
                <p>医护中心电话：{{tel.yhzx}}</p>
                <p>远程审方室电话：{{tel.ycsf}}</p>
            </div>

        </div>
        <div class="right-Box">
            <div class="chart-box">
                <div class="chart-left">
                    我的接诊
                </div>
                <div class="chart-right">
                    <ve-line :data="chartData" :settings="chartSettings"></ve-line>
                </div>
            </div>
        </div>

        <el-dialog
            title="提示"
            :visible.sync="dialogVisible"
            :close-on-click-modal="false"
            :showClose="false"
            width="30%">
            <span>有患者向您发起视频问诊,您是否加入?</span>
            <span slot="footer" class="dialog-footer">
                <el-button @click="videoNoCall" :disabled="unclick1">拒 绝</el-button>
                <el-button class="search" @click="videoCall" :disabled="unclick2">确 定</el-button>
            </span>
        </el-dialog>
        <div class="tipMenu">
            <audio id="sound-bgm">
                <source src="@/assets/defsound.wav">
            </audio>
        </div>
    </div>
</template>

<script>
import $ from 'jquery';
import VeLine from 'v-charts/lib/line.common'
import {mapGetters}    from 'vuex'
import dayjs                    from 'dayjs'
export default {
    components: {VeLine},
    data() {
        this.chartSettings = {
            labelMap: {
                'num': '',
            },
        }
        return {
            dialogVisible: false,
            value: true,
            fit: 'fill',
            chartData: {
                columns: [ 'date', 'num' ],
                rows: []
            },
            placepointInfo: {},
            form: {},
            weekWork: {
                companyid: '',
                begindate: '',
                enddate: '',
                doctorid: ''
            },
            tel: {},
            unclick1: false,
            unclick2: false
        }

    },
    sockets: {
        connect: function () {
            this.$socket.emit('login', JSON.stringify({
                userid: this.userInfo.userid, companyid: this.userInfo.companyid
            }))
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
        // 收到门店请求
        inquiryRequest: function (data) {
            console.log('收到门店请求--------------------')
            this.unclick1 = false
            this.unclick2 = false
            $('#sound-bgm')[0].play()
            this.placepointInfo = data
            this.$store.commit('user/SET_DOORINFO', data)
            // 获取签名
            this.enterRoom('医生收到门店请求')
            this.getKey(data.roomid)
        },
        shopCancelCall: function () {
            this.dialogVisible = false
        },
        doctorVideoResultsBack: function (data) {
            if (data.status == 200) {
                this.dialogVisible = false
                this.$router.push({
                    path: '/home/accountOverview/chronicDisease'
                })
            } else {
                this.$message.warning(data.msg)
            }
        }
    },
    computed: {
        ...mapGetters([
            'userInfo',
            'doctorInfo',
            'waitTime'
        ])
    },
    mounted () {
        this.$store.commit('app/SET_CELLFLASE', false)
        this.$nextTick(() => {
            this.getInfo()
            this.getconfig()
        })
    },
    methods: {
        enterRoom (msg) {
            const that = this
            that.$socket.emit('enterVideoRoom', JSON.stringify({
                userid: this.userInfo.userid,
                msg: msg
            }))
        },
        getconfig(){
            this.$store.dispatch('goods/getconfig', {
                companyid: this.userInfo.companyid
            }).then(res=>{
                this.tel = {
                    wlwhb: res.wlwhb,
                    ycsf: res.ycsf,
                    yhzx: res.yhzx
                }
            })
        },
        getInfo () {
            let date1 = new Date();
            let date2 = new Date(date1);
            date2.setDate(date1.getDate()-7);
            this.weekWork = {
                begindate: dayjs(date2).format('YYYY-MM-DD HH:mm:ss'),
                enddate: dayjs().format('YYYY-MM-DD HH:mm:ss'),
                doctorid: this.userInfo.doctorid
            }
            if (this.waitTime == 'loginOk' || this.waitTime == 'saveOk'){
                this.$socket.emit('changeDoctorStatus', JSON.stringify({
                    userid: this.userInfo.userid,
                    companyid: this.userInfo.companyid,
                    pharmacistid: this.userInfo.pharmacistid,
                    workstatus: 0
                }))
                this.$store.commit('app/SET_WAITTIME', '')
            }
            setTimeout(() => {
                this.$store.dispatch('user/sxfindByID', this.weekWork).then((res) => {
                    this.form = this.doctorInfo
                    if (this.form.workstatus ===  '0') {
                        this.form.workstatus = true
                    } else {
                        this.form.workstatus = false
                    }
                    this.chartData.rows = res.workload
                }).catch(err => {
                    console.log(err);
                })
            }, 500)
        },
        videoCall() {
            this.unclick2 = true
            this.enterRoom('医生接听当前门店请求')
            this.$socket.emit('doctorVideoRequestBack', JSON.stringify({
                type: 1,
                companyid: this.userInfo.companyid,
                mduserid: this.placepointInfo.mduserid,
                userid: this.userInfo.userid
            }))
        },
        videoNoCall () {
            this.unclick1 = true
            this.enterRoom('医生拒绝当前门店请求')
            this.$socket.emit('doctorVideoRequestBack', JSON.stringify({
                type: 2,
                companyid: this.userInfo.companyid,
                mduserid: this.placepointInfo.mduserid,
                userid: this.userInfo.userid
            }))
            this.dialogVisible = false
            this.form.workstatus = false
        },
        switchChange (e) {
            if (e === false) { e = 1 } else { e = 0 }
            this.$socket.emit('changeDoctorStatus', JSON.stringify({
                userid: this.userInfo.userid,
                companyid: this.userInfo.companyid,
                workstatus: e,
                type: 1
            }))
        },

        getKey(rooID) {
            this.$store.dispatch('app/getKey', {userid: this.userInfo.userid,  companyid: this.userInfo.companyid})
                .then(res => {
                    let parms = res
                    parms.rooID = rooID
                    console.log(parms)
                    this.$nextTick(() => {
                        this.dialogVisible = true
                    })
                })
                .catch(err => {
                    this.$message.warning('获取视频配置信息失败')
                    console.log(err)
                })
        },
    },
    created() {
        let path = this.$route.path
        this.$store.commit('app/SET_ROUTER', path)
    }
}
</script>

<style scoped lang="scss">
    .cardTel p{
        height: 68px;
        line-height: 68px;
        text-indent: 24px;
    }
    .information {
        .search {
            color: #FFF;
            background-color: $color-btn;
            border-color: $color-btn;
        }

        height: 100%;
        width: 100%;
        display: flex;
        flex-direction: row;
        justify-content: space-around;

        .left-BOX {
            width: 600px;
            height: 100%;
            box-shadow: 0 2px 4px rgba(0, 0, 0, .12), 0 0 6px rgba(0, 0, 0, .04);
            padding: 10px;
            font-size: 16px;

            .col-title {
                font-size: 26px;
                line-height: 60px;
            }

            .user-img {
                height: 130px;
            }

            li {
                line-height: 45px;
                font-size: 16px;
            }

            .store-name {
                font-size: 20px;
                color: #36C2AA;
            }

            .timer .time1, .timer .time2 {
                line-height: 70px;
            }

            .card {
                box-shadow: 0 8px 4px rgba(0, 0, 0, .12), 0 0 6px rgba(0, 0, 0, .04);
                display: flex;
                flex-direction: column;
                justify-content: center;
                /*align-items: center;*/
                width: 80%;
                margin-left: 10%;

                .item {
                    height: 200px;
                    width: 100%;
                    font-size: 18px;

                    span {
                        text-align: center;
                        display: inline-block;
                        width: 33.3333%;

                    }
                }

                .item1 {
                    display: flex;
                    justify-content: center;
                    align-items: center;
                }

                .border-L {
                    border-left: 1px solid skyblue;
                }


            }


        }

        .right-Box {
            padding: 10px;
            box-shadow: 0 2px 4px rgba(0, 0, 0, .12), 0 0 6px rgba(0, 0, 0, .04);
            flex: 1;
            height: 100%;
            margin-left: 10px;
            display: flex;
            flex-direction: column;

            .col-title {
                font-size: 26px;
            }

            .card {
                margin-top: 10px;
                box-shadow: 0 8px 4px rgba(0, 0, 0, .12), 0 0 6px rgba(0, 0, 0, .04);
                display: flex;
                flex-direction: column;
                justify-content: center;
                align-items: center;
                width: 40%;

                .title {
                    line-height: 40px;
                    font-size: 20px;
                    padding: 5px;
                    box-sizing: border-box;
                }

                .item {
                    height: 60px;
                    width: 100%;
                    font-size: 18px;

                    span {
                        text-align: center;
                        display: inline-block;
                        width: 33.3333%;

                    }
                }

                .item1 {
                    display: flex;
                    justify-content: center;
                    align-items: center;
                }

                .border-L {
                    border-left: 1px solid skyblue;
                }


            }

            .chart-box {
                padding: 20px 0px;
                display: flex;
                flex: 1;
                /*justify-content: center;*/

                .chart-left {
                    font-size: 26px;
                    width: 130px;
                }

                .chart-right {
                    flex: 1;
                    height: 100%;
                }
            }
        }
    }
</style>
