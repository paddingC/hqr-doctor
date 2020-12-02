<template>
    <div class="userSeting">
        <el-tabs type="border-card" v-model="activeName">
            <el-tab-pane label="账户管理" name="first">
                <div class="content">
                    <div class="left">
                        <el-avatar shape="square" style="background:#fff;
                        height: 5.3cm;
                        width: 3.5cm;
                        border-radius: 0px" :src="doctorInfo.headimage"></el-avatar>
                        <p> {{doctorInfo.companyname}}</p>
                    </div>
                    <div class="right">
                        <ul>
                            <li><span class="names">用户名</span>: <span class="middle-span">{{doctorInfo.doctorname}}</span></li>
                            <li><span class="names">手机号</span>: <span class="middle-span">{{doctorInfo.phonenum}}</span></li>
                            <li><span class="names">密码</span>:<span class="middle-span">******</span>
                                <el-button type="primary" class="search"
                                           style="margin-left: 30px;"
                                           @click="dialogFormVisible=true">修改
                                </el-button>
                            </li>
                            <li><span class="names">身份证号</span>: <span class="middle-span">{{doctorInfo.idcardno}}</span></li>
                        </ul>
                    </div>
                </div>
            </el-tab-pane>
        </el-tabs>

        <el-dialog title="编辑" :visible.sync="dialogFormVisible">
            <el-form :model="ruleForm" status-icon :rules="rules" ref="ruleForm" label-width="100px"
                     class="demo-ruleForm">
                <el-form-item required label="原密码" prop="oldpwd">
                    <el-input style="width: 400px" v-model="ruleForm.oldpwd"></el-input>
                </el-form-item>
                <el-form-item required label="新密码" prop="newpwd">
                    <el-input style="width: 400px" type="password" v-model="ruleForm.newpwd"
                              autocomplete="off"></el-input>
                </el-form-item>
                <el-form-item required label="确认新密码" prop="againpwd">
                    <el-input type="password" style="width: 400px" v-model="ruleForm.againpwd"
                              autocomplete="off"></el-input>
                </el-form-item>

                <el-form-item>
                    <el-button type="primary" class="search" @click="submitForm('ruleForm')">提交</el-button>
                    <el-button @click="resetForm('ruleForm')">重置</el-button>
                </el-form-item>
            </el-form>
        </el-dialog>
    </div>
</template>

<script>
import {mapGetters} from 'vuex'

export default {
    name: "index",
    data() {
        var checkPassOld = (rule, value, callback) => {
            if (!value) {
                callback(new Error('请输入密码'))
            }
            setTimeout(() => {
                callback()
            }, 1000)
        }
        var validatePass = (rule, value, callback) => {
            if (value === '') {
                callback(new Error('请输入密码'))
            } else {
                if (this.ruleForm.checkPass !== '') {
                    this.$refs.ruleForm.validateField('checkPass')
                }
                callback()
            }
        }
        var validatePass2 = (rule, value, callback) => {
            if (value === '') {
                callback(new Error('请再次输入密码'))
            } else if (value !== this.ruleForm.newpwd) {
                callback(new Error('两次输入密码不一致!'))
            } else {
                callback()
            }
        }
        return {
            dialogFormVisible: false,
            appMsg: {},
            myInfo: {},
            activeName: 'first',
            ruleForm: {
                loginid: '',
                newpwd: '',
                againpwd: '',
                oldpwd: ''
            },
            rules: {
                newpwd: [
                    {validator: validatePass, trigger: 'blur'}
                ],
                againpwd: [
                    {validator: validatePass2, trigger: 'blur'}
                ],
                oldpwd: [
                    {validator: checkPassOld, trigger: 'blur'}
                ]
            }
        }
    },
    computed: {
        ...mapGetters([
            'userInfo',
            'doctorInfo',
            'loginName'
            // ...
        ])
    },
    mounted () {
    },
    methods: {
        submitForm(formName) {
            this.$refs[ formName ].validate((valid) => {
                if (valid) {
                    this.ruleForm.loginid = this.loginName
                    this.$store.dispatch('user/changepassword', this.ruleForm).then(() => {
                        this.$message.success('修改密码成功')
                        this.dialogFormVisible = false
                    }).catch(err => {
                        console.log(err);
                    })
                } else {
                    console.log('error submit!!')
                    return false
                }
            })
        },
        resetForm(formName) {
            this.$refs[ formName ].resetFields()
        }
    },
    created() {
        // this.appMsg = this.appInfo
        let obj1 = {a: 0, b: {c: 0}}
        let obj2 = {d: 0, g: {c: 0}}
        obj2 = Object.assign(obj2, obj1)
        console.log(obj2)
        // this.userMag = this.userInfo
        // /      console.log(this.userMag)
        let path = this.$route.path
        this.$store.commit('app/SET_ROUTER', path)
    }
}
</script>

<style lang="scss" scoped>
    .userSeting {
        width: 100%;
        height: 100%;

        & /deep/ .el-tabs {
            height: 100%;

            & /deep/ .el-tabs__item {
                color: #36C2AA;
            }
        }

        & /deep/ .el-tabs__content, /deep/ .el-tab-pane {
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100%;
            width: 100%;
        }

        .form-inline {
            width: 900px;
            display: flex;
            flex-wrap: wrap;
            /*justify-content: center;*/
            /*align-items: center;*/
            .inputL {
                width: 300px;
            }
        }

        .search {
            color: #FFF;
            background-color: $color-btn;
            border-color: $color-btn;
        }

        .content {
            width: 50%;
            height: 60%;
            display: flex;
            padding: 10px;
            box-shadow: 0 2px 4px rgba(0, 0, 0, .12), 0 0 6px rgba(0, 0, 0, .04);
            align-items: center;

            .left {
                width: 300px;
                padding: 15px;
                display: flex;
                flex-direction: column;
                align-items: center;
                font-size: 20px;

                p {
                    line-height: 50px;
                    text-align: center;
                    color: #36C2AA;

                }
            }

            .right {
                flex: 1;
                line-height: 50px;

                li {
                    font-size: 18px;

                    span {
                        display: inline-block;
                    }

                    .middle-span {
                        padding: 0 10px 0 10px;
                    }

                    .names {
                        text-align-last: justify;
                        text-align: justify;
                        text-justify: distribute-all-lines; // 这行必加，兼容ie浏览器
                        width: 150px;
                    }
                }
            }
        }
    }
</style>
