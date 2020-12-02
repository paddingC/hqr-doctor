<template>
    <div class="historyRecipel">
        <div class="form-serch">
            <el-form :inline="true" class="left" :model="formInline" label-width="80px">
                <el-form-item label="开始时间">
                    <el-date-picker
                        style="width: 268px"
                        v-model="formInline.begindate"
                        type="date"
                        value-format="yyyy-MM-dd HH:mm:ss"
                        placeholder="选择日期">
                    </el-date-picker>
                </el-form-item>
                <el-form-item label="结束时间">
                    <el-date-picker
                        style="width: 268px"
                        v-model="formInline.enddate"
                        type="date"
                        value-format="yyyy-MM-dd HH:mm:ss"
                        placeholder="选择日期">
                    </el-date-picker>
                </el-form-item>
                <el-form-item label="患者姓名">
                    <el-input v-model="formInline.patient" placeholder="患者姓名" style="width: 268px;"></el-input>
                </el-form-item>
                <div>
                    <el-form-item label="科室">
                        <el-input v-model="formInline.department" placeholder="科室" style="width: 268px;"></el-input>
                        <!--<el-select style="width: 268px;" v-model="formInline.stuaus" placeholder="科室">-->
                            <!--<el-option label="是" value="shanghai"></el-option>-->
                            <!--<el-option label="否" value="beijing"></el-option>-->
                        <!--</el-select>-->
                    </el-form-item>
                </div>
            </el-form>
            <el-form class="right">
                <el-form-item class="buttons">
                    <el-button class="search" type="success" @click="search">查询</el-button>
                    <el-button @click="clear">清空</el-button>
                </el-form-item>
            </el-form>
        </div>
        <div class="table">
            <div class="left">
                <div>
                    <span>
                        处方列表共 {{toatal}} 条
                    </span>
                    <div style="margin: 15px 0;"></div>

                    <vxe-table
                        max-height="450px"
                        border
                        ref="tableData"
                        highlight-current-row
                        :data="tableData"
                        :header-cell-style="headClass"
                        highlight-hover-row
                        @current-change="findUrl">
                        <vxe-table-column type="index" title="序号" width="60"></vxe-table-column>
                        <vxe-table-column field="begindate" title="接诊时间" formatter="toDateString"></vxe-table-column>
                        <vxe-table-column field="patient" title="患者姓名"></vxe-table-column>
                        <vxe-table-column field="sex" title="性别"></vxe-table-column>
                        <vxe-table-column field="age" title="年龄"></vxe-table-column>
                        <vxe-table-column field="department" title="科室"></vxe-table-column>
                        <vxe-table-column field="diagnosis" title="病症"></vxe-table-column>
                        <!--<vxe-table-column title="操作">-->
                            <!--<template v-slot="{ row }">-->
                                <!--<template>-->
                                    <!--<div @click="lookEvent(row)"-->
                                         <!--style="color: #00ffff;line-height: 30px;cursor: pointer">查看处方-->
                                    <!--</div>-->
                                <!--</template>-->
                            <!--</template>-->
                        <!--</vxe-table-column>-->
                    </vxe-table>

                    <div class="pagination">
                        <vxe-pager
                        perfect
                        :loading="loading"
                        :current-page="tablePage.currentPage"
                        :page-size="tablePage.pageSize"
                        :total="tablePage.totalResult"
                        :layouts="['PrevPage', 'JumpNumber', 'NextPage', 'FullJump', 'Sizes', 'Total']"
                        @page-change="handlePageChange">
                        </vxe-pager>
                    </div>
                </div>
            </div>
            <div class="right">
                <el-image class="img"
                    style="width: 100%; height: 100%"
                    :src="srcList[0]"
                    :preview-src-list="srcList">
                </el-image>
            </div>
        </div>
    </div>
</template>

<script>
import {mapGetters}    from 'vuex'
export default {
    name: "index",
    data() {
        return {
            tableData: [],
            url: 'https://fuss10.elemecdn.com/e/5d/4a731a90594a4af544c0c25941171jpeg.jpeg',
            srcList: [],
            formInline: {
                patient: '',
                enddate: '',
                begindate: '',
                department: ''
            },
            loading: true,
            tablePage: {
                currentPage: 1,
                pageSize: 10,
                totalResult: 0
            }
        }
    },
    computed: {
        toatal: function () {
            return this.tableData.length
        },
        ...mapGetters([
            'appInfo',
            'userInfo',
            'cfList'
        ])
    },
    mounted () {
        this.getList()
    },
    methods: {
        //查看处方图片
        findUrl({row}){
            let newImg = []
            if (row.imageurl !== undefined) {
                newImg.push(row.imageurl)
                this.srcList = newImg
            } else {
                this.srcList = []
            }
        },
        headClass({row, column, rowIndex, columnIndex}) {
            return 'background:#36c2aa;'
        },
        search() {
            this.getList()
        },
        getList () {
            let needParams = {
                companyid: this.userInfo.companyid,
                begindate: this.formInline.begindate,
                enddate: this.formInline.enddate,
                patient: this.formInline.patient,
                department: this.formInline.department,
                pageIndex: this.tablePage.currentPage,
                pageSize: this.tablePage.pageSize
            }
            this.$store.dispatch('user/inquirySelect', needParams).then((res) => {
                this.loading = false
                this.tableData = res.list
                this.tablePage.totalResult = res.info
            }).catch(err => {
                console.log(err);
                return false
            })
        },
        handlePageChange ({currentPage, pageSize}) {
            this.tablePage.currentPage = currentPage
            this.tablePage.pageSize = pageSize
            this.getList()
        },
        clear (){
            this.formInline = {}
        },
    }
}
</script>

<style>
    .img /deep/ .el-image-viewer__close{
        color: #f00!important;
    }
</style>
<style scoped lang="scss">
    .historyRecipel {
        height: 100%;
        width: 100%;
        display: flex;
        flex-direction: column;
        box-sizing: border-box;

        .form-serch {
            height: 145px;
            display: flex;
            /*flex-wrap: wrap;*/
            justify-content: space-between;
            align-items: center;
            border: 1px solid #c9c9c9;
            padding: 10px;
            box-sizing: border-box;
            margin-bottom: 10px;

            .search {
                color: #FFF;
                background-color: $color-btn;
                border-color: $color-btn;
            }

            .left {

            }

            .right {
                height: 100%;
                .buttons{
                    height: 100%;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                }
            }
        }

        .table {
            flex: 1;
            display: flex;
            flex-direction: row;


            .left {
                width: 80%;
                padding: 5px;
                box-sizing: border-box;
            }

            .right {
                width: 20%;
            }
        }
    }
</style>
