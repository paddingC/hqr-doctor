<template>
  <div class="chronicDisease">
    <div class="div1">
      <div class="video" id="remote_stream">
        <!-- 远端-->
        <section class="video_local" id="local_stream">
          <!-- 本地 -->
        </section>
      </div>
      <div class="patient-info">
        <h3 class="border-left">患者信息</h3>
        <p>
          <span>姓名</span>:
          <span>{{doorInfo.inquiryRequestInfo.patient}}</span>
        </p>
        <p>
          <span>性别</span>:
          <span>{{doorInfo.inquiryRequestInfo.sex}}</span>
        </p>
        <p>
          <span>年龄</span>:
          <span>{{doorInfo.inquiryRequestInfo.age}}</span>
        </p>
        <p>
          <span>联系电话</span>:
          <span>{{doorInfo.inquiryRequestInfo.telphone}}</span>
        </p>
        <p>
          <span>身份证号</span>:
          <span>{{doorInfo.inquiryRequestInfo.idcardno}}</span>
        </p>
        <p>
          <span>门店</span>:
          <span>{{doorInfo.inquiryRequestInfo.deptname}}</span>
        </p>
      </div>
    </div>
    <div class="div2 patient-info">
      <h3 class="border-left">处方信息</h3>
      <div style="margin-top: 20px; width: 100%">
        <div style="width: 30%;display: inline-block">
          <span style="font-size: 16px;">临床诊断</span>:
          <el-select v-model="diagnosisArr" @change="diagnosisarrchange" placeholder="请选择">
            <el-option
              v-for="item in options"
              :key="item.diseasesid"
              :label="item.diseases"
              :value="item.diseases"
            ></el-option>
          </el-select>
        </div>
        <el-input type="text" v-model="diagnosisStr" style="width: 70%"></el-input>
      </div>
      <h3 class="border-left">处方录入</h3>
      <div class="czBtn" style="margin-top: 12px;margin-bottom: 12px">
        <el-button @click="addRow">新增</el-button>
        <el-button @click="saveDate">保存</el-button>
      </div>
      <div class="radioTable">
        <vxe-table
          ref="formList"
          min-height="320px"
          max-height="400px"
          border
          :header-cell-style="rowClass"
          :data.sync="tableData"
          highlight-current-row
          @current-change="curRow"
          :edit-config="{trigger: 'click', mode: 'row'}"
        >
          <vxe-table-column field="goodsname" title="药品名称"></vxe-table-column>
          <vxe-table-column field="goodstype" title="药品规格" width="120"></vxe-table-column>
          <vxe-table-column field="goodsqty" title="数量" sortable width="180">
            <template scope="scope">
              <el-input-number
                v-if="scope.row.specialdrug == '1'"
                v-model="scope.row.goodsqty"
                :min="1"
                :max="2"
                @focus="getFocus"
                style="width: 140px"
              ></el-input-number>
              <el-input-number
                v-else
                v-model="scope.row.goodsqty"
                :min="1"
                :max="100"
                @focus="getFocus"
                style="width: 140px"
              ></el-input-number>
            </template>
          </vxe-table-column>
          <vxe-table-column field="yfyl" title="用法用量" sortable width="260">
            <template scope="scope">
              <el-autocomplete
                class="inline-input1"
                v-model="scope.row.yfyl"
                filterable
                allow-create
                default-first-option
                :fetch-suggestions="querySearchYfyl"
                @select="yfylChangeEvent"
              ></el-autocomplete>
            </template>
          </vxe-table-column>
          <vxe-table-column field="jl" title="剂量(M)" width="80">
            <template scope="scope">
              <el-input v-model.number="scope.row.jl"></el-input>
            </template>
          </vxe-table-column>
          <vxe-table-column field="pc" title="频次(N)" width="80">
            <template scope="scope">
              <el-input v-model.number="scope.row.pc"></el-input>
            </template>
          </vxe-table-column>
          <vxe-table-column field="goodsunit" title="单位" width="120"></vxe-table-column>
          <vxe-table-column title="操作" fixed="right" width="70">
            <template slot-scope="scope">
              <el-button
                type="danger"
                :disabled="isRemove"
                size="mini"
                @click="removeEvent(scope.row)"
              >删除</el-button>
            </template>
          </vxe-table-column>
        </vxe-table>
      </div>
      <section class="button-end">
        <el-button @click="endGuidance" :disabled="endFlage">结束复诊咨询</el-button>
        <el-button @click="historyRecipe">历史处方</el-button>
        <el-button @click="cancelPatient" v-if="isCancel">取消复诊</el-button>
        <el-button v-else>取消复诊</el-button>
      </section>
    </div>
    <el-dialog title="历史处方" :visible.sync="historyVisible">
      <div class="Doc">
        <vxe-table
          ref="formDoc"
          height="360px"
          border
          :header-cell-style="rowClass"
          :data.sync="docList"
          highlight-current-row
          @cell-dblclick="closedtlEvent"
          @current-change="finddtlEvent"
        >
          <vxe-table-column type="index" width="50"></vxe-table-column>
          <vxe-table-column field="prescriptionno" title="处方编号" sortable></vxe-table-column>
          <vxe-table-column field="inputdate" title="处方日期" sortable></vxe-table-column>
          <vxe-table-column field="diagnosis" title="诊断" sortable></vxe-table-column>
          <vxe-table-column field="doctor" title="医生" sortable></vxe-table-column>
          <vxe-table-column field="approvalstatus" title="审批状态" :formatter="statusUer" sortable></vxe-table-column>
          <vxe-table-column field="reason" title="审批不通过原因" sortable></vxe-table-column>
        </vxe-table>
        <div class="pagination">
          <vxe-pager
            perfect
            :loading="loadingDoc"
            :current-page="pageDoc.currentPage"
            :page-size="pageDoc.pageSize"
            :total="pageDoc.totalResult"
            :layouts="['PrevPage', 'JumpNumber', 'NextPage', 'FullJump', 'Sizes', 'Total']"
            @page-change="handlePageChangeDoc"
          ></vxe-pager>
        </div>
      </div>
      <div class="dtl">
        <vxe-table
          ref="formDtl"
          height="320px"
          border
          :header-cell-style="rowClass"
          :data.sync="dtlList"
          highlight-current-row
        >
          <vxe-table-column type="index" width="50"></vxe-table-column>
          <vxe-table-column field="goodsname" title="药品名" sortable></vxe-table-column>
          <vxe-table-column field="goodstype" title="规格" sortable></vxe-table-column>
          <vxe-table-column field="prodarea" title="产地" sortable></vxe-table-column>
          <vxe-table-column field="goodsunit" title="基本单位" sortable></vxe-table-column>
          <vxe-table-column field="yfyl" title="用法用量" sortable></vxe-table-column>
          <vxe-table-column field="goodsqty" title="数量" sortable></vxe-table-column>
        </vxe-table>
        <div class="pagination">
          <vxe-pager
            perfect
            :loading="loadingDtl"
            :current-page="pageDtl.currentPage"
            :page-size="pageDtl.pageSize"
            :total="pageDtl.totalResult"
            :layouts="['PrevPage', 'JumpNumber', 'NextPage', 'FullJump', 'Sizes', 'Total']"
            @page-change="handlePageChangeDtl"
          ></vxe-pager>
        </div>
      </div>
    </el-dialog>
    <el-dialog title="药品库明细" :visible.sync="drugVisible">
      <div style="margin-top: 10px; margin-bottom: 10px">
        <el-input
          v-model="filterName"
          :autofocus="true"
          @input="filterVal"
          style="width: 268px"
          @keyup.enter.native="diaSearch($event)"
          type="search"
          placeholder="请输入您要搜索的内容"
        ></el-input>
      </div>
      <div v-loading="loading">
        <vxe-table
          ref="formDrug"
          id="getTable"
          border
          :header-cell-style="rowClass"
          :data.sync="drugList"
          highlight-current-row
          :keyboard-config="{isArrow: true, isEnter: true}"
          @cell-dblclick="closeDrug"
        >
          <vxe-table-column type="index" width="50"></vxe-table-column>
          <vxe-table-column field="popularizename"  :visible="false"  title="主推" sortable></vxe-table-column>
          <vxe-table-column field="goodsname" :visible="false"  title="药品名称" sortable></vxe-table-column>
          <vxe-table-column field="goodstype" title="药品规格" width="210" sortable></vxe-table-column>
          <vxe-table-column field="goodsunit" title="药品单位" width="120" sortable></vxe-table-column>
          <vxe-table-column field="prodarea" title="产地" sortable></vxe-table-column>
          <vxe-table-column field="inventory" title="库存" sortable v-if="userInfo.isinventory"></vxe-table-column>
        </vxe-table>
        <div class="pagination">
          <vxe-pager
            perfect
            v-loading="pageDrugLoading"
            :current-page="pageDrug.currentPage"
            :page-size="pageDrug.pageSize"
            :total="pageDrug.totalResult"
            :layouts="['PrevPage', 'JumpNumber', 'NextPage', 'FullJump', 'Sizes', 'Total']"
            @page-change="handlePageChangeDrug"
          ></vxe-pager>
        </div>
      </div>
    </el-dialog>
    <!--录入患者省份证号-->
    <el-dialog
      title="录入患者身份证号"
      :visible.sync="iscardVisible"
      width="620px"
      :close-on-click-modal="false"
      :showClose="false"
    >
      <el-form :model="form" ref="form" :rules="rules" label-width="120px" class="demo-ruleForm">
        <el-form-item required prop="idcardno">
          <el-input
            style="width: 286px;"
            type="idcardno"
            v-model="form.idcardno"
            autocomplete="off"
          ></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="iscardVisible = false">取 消</el-button>
        <el-button type="primary" @click="endEvent('form')" :disabled="oneClick">确定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import XEUtils from "xe-utils";
import RtcClient from "../../common/RtcClient";
import { mapGetters, mapActions } from "vuex";
export default {
  name: "chronicDisease",
  data() {
    var checkId = (rule, value, callback) => {
      if (!value) {
        return callback(new Error("身份证号不能为空"));
      } else {
        const reg = /(^[1-9]\d{5}(18|19|([23]\d))\d{2}((0[1-9])|(10|11|12))(([0-2][1-9])|10|20|30|31)\d{3}[0-9Xx]$)|(^[1-9]\d{5}\d{2}((0[1-9])|(10|11|12))(([0-2][1-9])|10|20|30|31)\d{2}$)/;
        if (reg.test(value)) {
          callback();
        } else {
          return callback(new Error("请输入正确的身份证"));
        }
      }
    };
    return {
      outerVisible: true,
      srcList: [
        "https://fuss10.elemecdn.com/8/27/f01c15bb73e1ef3793e64e6b7bbccjpeg.jpeg",
        "https://fuss10.elemecdn.com/1/8e/aeffeb4de74e2fde4bd74fc7b4486jpeg.jpeg"
      ],
      value1: "2012-08-01",
      input: "",
      innerVisible: false,
      tableData: [],
      rtc: null,
      diagnosisArr: [],
      options: [],
      diagnosisStr: "",
      diagnosis: [],
      roleList: [{ label: "模板1" }, { label: "模板2" }],
      testvalue: "",
      currow: {}, // 当前行
      historyVisible: false,
      docList: [],
      loadingDoc: false,
      pageDoc: {
        currentPage: 1,
        pageSize: 10,
        totalResult: 0
      },
      dtlList: [],
      loadingDtl: false,
      pageDtl: {
        currentPage: 1,
        pageSize: 10,
        totalResult: 0
      },
      isRemove: false,
      getDocid: "",
      endFlage: true,
      drugVisible: false,
      pageDrug: {
        currentPage: 1,
        pageSize: 10,
        totalResult: 0
      },
      pageDrugLoading: false,
      loading: false,
      drugList: [],
      needDrugList: [],
      tableCopyTableList: [],
      drugItemIndex: -1,
      filterName: "",
      keyCodeflage: false,
      isCancel: true,
      iscardVisible: false,
      oneClick: false,
      form: { idcardno: "" },
      rules: {
        idcardno: [{ validator: checkId, trigger: "blur" }]
      },
    //   columns: []
        isManageInventory: ''
    };
  },
  sockets: {
    connect: function() {
      console.log("socket 链接成功--------------------");
      this.$socket.emit(
        "login",
        JSON.stringify({
          userid: this.userInfo.userid,
          companyid: this.userInfo.companyid
        })
      );
    },
    connecting: function() {
      console.log("正在连接");
    },
    connect_failed: function() {
      console.log("连接失败");
    },
    disconnect: function() {
      console.log("断开连接");
    },
    error: function() {
      console.log("错误发生，并且无法被其他事件类型所处理");
    }
  },
  computed: {
    ...mapGetters(["doorInfo", "userInfo", "videoKey", "sheBeiNormal","creadRecord", "Mix"])
  },
  mounted() {
    this.isManageInventory = sessionStorage.getItem("isinventory")
    this.$store.commit("app/SET_CELLFLASE", true);
    this.getDiseases();
    this.$nextTick(() => {
      this.join();
    });
    this.enterRoom("医生进入视频界面");
    if (this.keyCodeflage) {
      let that = this;
      document.onkeydown = function(e) {
        var ev = window.event || e;
        var code = ev.keyCode || ev.which;
        if (code == 13) {
          that.drugVisible = false;
          that.$refs.formList.insertAt(row, -1).then(({}) => {});
          this.keyCodeflage = false;
        }
        if (code == 38) {
          console.log("上键");
        }
        if (code == 40) {
          console.log("下键");
        }
      };
    }

  },
  methods: {
    ...mapActions({
      dosageList: "goods/usageanddosageSelect",
      goodList: "goods/goodsFind"
    }),
    enterRoom(msg) {
      const that = this;
      that.$socket.emit(
        "enterVideoRoom",
        JSON.stringify({
          userid: this.userInfo.userid,
          msg: msg
        })
      );
    },
    diagnosisarrchange(e) {
      let isexist = false;
      for (var i = 0; i < this.diagnosis.length; i++) {
        if (e == this.diagnosis[i]) {
          isexist = true;
          break;
          //return false
        }
      }
      if (isexist) {
        return false;
      }
      this.diagnosis.push(e);
      if (this.diagnosis.length == 1) {
        this.diagnosisStr = e;
      } else {
        this.diagnosisStr += "、" + e;
      }
    },
    filterVal(e) {
      this.$store
        .dispatch("goods/goodsFind", {
          companyid: this.userInfo.companyid,
          pageIndex: this.pageDrug.currentPage,
          pageSize: this.pageDrug.pageSize,
          deptid: this.doorInfo.inquiryRequestInfo.deptid,
          key: e,
            usestatus:1
        }).then(res => {
          this.drugList = res.list;
          this.pageDrug.totalResult = res.info;
        })
        .catch(err => {
          console.log(err);
        });
    },
    join() {
      this.rtc = null;
      if (this.rtc) return;
      this.rtc = new RtcClient({
        userId: this.userInfo.userid,
        roomId: this.doorInfo.roomid,
        sdkAppId: this.videoKey.sdkAppId,
        userSig: this.videoKey.userSig,
        record: {
          userid1: this.doorInfo.mduserid,
          companyid: this.userInfo.companyid,
          userid2: this.userInfo.userid,
          roomid: this.doorInfo.roomid,
          billtype: 3,
          billid: this.doorInfo.inquiryRequestInfo.inquiryid
        }
      });

      this.rtc.join();
    },
    getDiseases() {
      this.$store
        .dispatch("user/diseasesSelect", {
          companyid: this.userInfo.companyid,
          key: ""
        })
        .then(res => {
          let resVal = res;
          this.options = resVal.list;
        })
        .catch(err => {
          console.log(err);
        });
    },
    historyRecipe() {
      this.historyVisible = true;
      this.$store
        .dispatch("user/sxfinddoc", {
          companyid: this.userInfo.companyid,
          patient: this.doorInfo.inquiryRequestInfo.patient,
          insiderphone: this.doorInfo.inquiryRequestInfo.telphone,
          pageIndex: this.pageDoc.currentPage,
          pageSize: this.pageDoc.pageSize
        })
        .then(res => {
          this.docList = res.list;
          this.pageDoc.totalResult = res.info;
        })
        .catch(err => {
          console.log(err);
        });
    },
    finddtlEvent({ row }) {
      this.getDocid = row.prescriptionid;
      this.$store
        .dispatch("user/finddtl", {
          prescriptionid: row.prescriptionid,
          pageIndex: this.pageDtl.currentPage,
          pageSize: this.pageDtl.pageSize
        })
        .then(res => {
          this.dtlList = res.list;
          this.pageDtl.totalResult = res.info;
        })
        .catch(err => {
          console.log(err);
        });
    },
    closedtlEvent() {
      let records = this.dtlList;
      let idx = -1;
      this.$refs.formList.insertAt(records, idx).then(({}) => {
        // xTable.setActiveRow(aa)
      });
      this.endFlage = true;
      this.historyVisible = false;
    },
    endGuidance() {
      // 结束指导
      let getTableData = this.$refs.formList.getTableData();
      if (this.diagnosisStr === "") {
        this.$message.warning("请在选择常见病和录入处方后提交");
        return false;
      }
      if (getTableData.fullData.length === 0) {
        this.$message.warning("请至少录入一条数据");
        return false;
      }
      let isSpecialdrug = false;
      getTableData.fullData.forEach(item => {
        if (item.specialdrug == "1") {
          isSpecialdrug = true;
        }
      });

      if (!this.doorInfo.inquiryRequestInfo.idcardno && isSpecialdrug) {
        this.iscardVisible = true;
        return false;
      }
      this.endFlage = true;
      this.getEnd(getTableData);
    },
    endEvent(formName) {
      this.$refs[formName].validate(valid => {
        if (valid) {
          this.oneClick = true;
          let getTableData = this.$refs.formList.getTableData();
          this.getEnd(getTableData);
        } else {
          this.$message.warning("请输入患者的省份证号");
          return false;
        }
      });
    },
    getEnd(getTableData) {
      let newObject = {
        inquiryid: this.doorInfo.doctorInfo.inquiryid,
        doctorid: this.userInfo.doctorid,
        mduserid: this.doorInfo.mduserid,
        diagnosis: this.diagnosisStr,
        dtllist: getTableData.fullData,
        userid: this.userInfo.userid,
        companyid: this.userInfo.companyid,
        cancelType: 1,
        idcardno: this.form.idcardno
      };
        this.endStoraaa()
      this.$store
        .dispatch("user/callEnd", newObject)
        .then(res => {
          this.rtc.leave();
          this.$store.commit("app/SET_WAITTIME", "saveOk");
          this.$store.commit("app/SET_CELLFLASE", false);
          this.enterRoom("医生点击结束用药指导- saveok");
            this.$router.replace({
                path: "/home/accountOverview/information"
            });
        })
        .catch(err => {
          console.log(err);
          this.oneClick = false;
          this.endFlage = false;
        });
    },
      endStoraaa() {
          // 结束录制
          this.$store.dispatch("user/stopRecord", {
              companyid: this.userInfo.companyid,
              taskid: this.creadRecord.taskid,
              streamid: this.creadRecord.streamid,
              mixStream_sessionid: this.Mix.mixStream_sessionid,
              output_streamid: this.Mix.mixStream_sessionid
          }).then(()=>{
              console.log('结束录制成功');
          })
      },
    cancelPatient() {
      let newObject = {
        inquiryid: this.doorInfo.doctorInfo.inquiryid,
        doctorid: this.userInfo.doctorid,
        mduserid: this.doorInfo.mduserid,
        userid: this.userInfo.userid,
        companyid: this.userInfo.companyid,
        cancelType: 2
      };
      this.isCancel = false;
      this.$store
        .dispatch("user/callEnd", newObject)
        .then(res => {
          this.$store.commit("app/SET_WAITTIME", "saveOk");
          this.$store.commit("app/SET_CELLFLASE", false);
          this.enterRoom("医生点击取消复诊- saveOk");
          this.rtc.leave();
          this.$router.push({
            path: "/home/accountOverview/information"
          });
        })
        .catch(err => {
          console.log(err);
          this.isCancel = true;
        });
        this.endStoraaa()
    },
    curRow({ row }) {
      this.currow = row;
    },
    getFocus(e) {
      console.log(e);
      this.endFlage = true;
    },
    async querySearchYfyl(queryString, cb) {
      this.endFlage = true;
      const yfyl = await this.dosageList({
        companyid: this.userInfo.companyid,
        key: queryString
      });
      var d = yfyl.map(item => {
        return {
          value: item.usageanddosage,
          usageanddosageid: item.usageanddosageid
        };
      });
      clearTimeout(this.timeout);
      cb(d);
      // this.timeout = setTimeout(() => {
      //     cb(d);
      // }, 10 * Math.random());
    },
    addRow() {
      this.endFlage = true;
      this.drugVisible = true;
      this.filterName = "";
      this.drugList = [];
      this.pageDrugLoading = true;
      this.pageDrug.currentPage = 1
      setTimeout(() => {
        this.pageDrug.totalResult = 0;
        this.pageDrugLoading = false;
      }, 500);
    },
    saveDate() {
      let getTableData = this.$refs.formList.getTableData();
      let isNaN = false;
      let warnData = ''
      if (getTableData.fullData.length == 0) {
        this.$message.warning("请录入处方信息后保存！");
        return false;
      }
      getTableData.fullData.forEach((item, idx) => {
        if (
          item.yfyl == null ||
          item.yfyl == "" ||
          item.goodsname == null ||
          item.goodsname == "" ||
          item.goodsqty == null ||
          item.goodsqty == ""
        ) {
          this.$message.warning("请输入药品名、数量、用法用量后保存！");
          isNaN = true;
          return false;
        } else {
          if (
            item.yfyl.includes("M") === true &&
            item.yfyl.includes("N") === true
          ) {
            if (
              item.jl == null ||
              item.jl == "" ||
              item.pc == null ||
              item.pc == ""
            ) {
              this.$message.warning("请输入剂量、频次后保存！");
              isNaN = true;
              return false;
            }
          }
        }
        if (this.isManageInventory === 'true') {// 是否控制库存
            if (item.goodsqty > item.inventory) {// 数量不能大于库存
                warnData += ('货品名称为' + item.goodsname + '的库存剩余' + item.inventory + '，')
                return false
            }
        }

      });
      if (warnData != '') {
          this.$message.warning(warnData + '请修改当前数量。')
      }
      if (!isNaN) {
        this.sendMsg();
        this.endFlage = false;
      }
    },
    yfylChangeEvent(item) {
      console.log(item);
    },
    removeEvent(row) {
      this.endFlage = true;
      this.$refs.formList.remove(row);
    },
    // 实时发送
    sendMsg() {
      let getTableData = this.$refs.formList.getTableData();
      getTableData.fullData.forEach((item, idx) => {
        // jl 剂量 pc 频次 yfyl 用法用量
        if (item.yfyl !== "" || item.yfyl !== null) {
          if (
            item.yfyl.includes("M") === true &&
            item.yfyl.includes("N") === true
          ) {
            item.yfyl = item.yfyl.replace("M", item.jl);
            item.yfyl = item.yfyl.replace("N", item.pc);
          }
        }
      });
      this.$socket.emit(
        "sendMsgToUser",
        JSON.stringify({
          type: "1",
          companyid: this.userInfo.companyid,
          userid: this.userInfo.userid,
          touserid: this.doorInfo.mduserid,
          msg: {
            diagnosis: this.diagnosisStr,
            list: getTableData.fullData
          }
        })
      );
    },
    handlePageChangeDoc({ currentPage, pageSize }) {
      this.pageDoc.currentPage = currentPage;
      this.pageDoc.pageSize = pageSize;
      this.historyRecipe();
    },
    handlePageChangeDtl({ currentPage, pageSize }) {
      this.pageDtl.currentPage = currentPage;
      this.pageDtl.pageSize = pageSize;
      this.finddtlEvent(this.getDocid);
    },
    // 获取药品名称
    diaSearch(event) {
      event.target.blur();
      this.$nextTick(() => {
        this.$refs.formDrug.setCurrentRow(this.drugList[0]);
      });
    },
    closeDrug({ row }) {
      let status = false;
      let getTableData = this.$refs.formList.getTableData();
      getTableData.fullData.forEach(item => {
        if (item.pkid == row.pkid) {
          status = true;
        }
      });
      if (this.isManageInventory === 'true') {
          if (row.inventory === 0) {
              this.$message.warning("当前库存不足");
              return false
          }
      }
      if (status) {
        this.$message.warning("此货品已选择, 请修改数量即可");
        return false;
      } else {
        this.drugVisible = false;
        this.$refs.formList.insertAt(row, -1).then(({}) => {});
      }
    },
    findDrug(e) {
      this.$store
        .dispatch("goods/goodsFind", {
          companyid: this.userInfo.companyid,
          pageIndex: this.pageDrug.currentPage,
          pageSize: this.pageDrug.pageSize,
          deptid: this.doorInfo.inquiryRequestInfo.deptid,
          key: e,
          usestatus:1
        })
        .then(res => {
          this.drugList = res.list;
          this.pageDrug.totalResult = res.info;
        })
        .catch(err => {
          console.log(err);
        });
    },
    handlePageChangeDrug({ currentPage, pageSize }) {
      this.pageDrug.currentPage = currentPage;
      this.pageDrug.pageSize = pageSize;
      this.findDrug(this.filterName);
    },
    rowClass({ row, column, rowIndex, columnIndex }) {
      return "background:#36c2aa;";
    },
    statusUer({ row, column, rowIndex, columnIndex }) {
      if (row.approvalstatus == 1) {
        return "通过";
      } else if (row.approvalstatus == 2) {
        return "拒绝";
      }
    }
  }
};
</script>

<style scoped lang="scss">
.chronicDisease {
  .search {
    color: #fff;
    background-color: $color-btn;
    border-color: $color-btn;
  }

  height: 100%;
  width: 100%;
  bottom: 0px;
  display: -webkit-box;
  display: flex;
  display: -ms-flex;
  display: -webkit-flex;
  font-size: 18px;

  .div1,
  .div2,
  .div3 {
    padding: 5px;

    /*flex: 1;*/
    /*-ms-flex: 1;*/
    /*-webkit-flex: 1;*/
    /*-webkit-box-flex: 1;*/
    position: relative;
    height: 100%;

    .border-left {
      line-height: 30px;
      border-left: 3px solid #36c2aa;
      font-size: 22px;
      margin: 10px 0;
      padding-left: 15px;
    }
  }

  .div1 {
    width: 25%;
    .video {
      position: relative;
      height: 50%;
      background-color: #f0f8fa !important;
      background: url("../../assets/img/videoIcon.png") no-repeat;
      background-position:center;
    }

    .video_local {
      position: absolute;
      width: 30%;
      height: 120px;
      background: #f0f8fa;
      bottom: 0px;
      right: 0px;
      z-index: 999;
    }

    .patient-info {
      height: 50%;

      p {
        line-height: 40px;
        font-size: 16px;

        & span:first-child {
          display: inline-block;
          text-align-last: justify;
          text-align: justify;
          text-justify: distribute-all-lines; // 这行必加，兼容ie浏览器
          width: 80px;
        }

        & span:last-child {
          display: inline-block;
          padding: 0 10px;
          color: #909399;
        }
      }
    }
  }

  .div2 {
    width: 70%;
    .recipel-info {
      height: 50%;

      h3 {
        line-height: 30px;
        border-left: 3px solid #36c2aa;
        font-size: 22px;
        margin: 10px 0;
        padding-left: 15px;
      }

      p {
        line-height: 40px;
        font-size: 16px;

        & span:first-child {
          display: inline-block;
          text-align-last: justify;
          text-align: justify;
          text-justify: distribute-all-lines; // 这行必加，兼容ie浏览器
          width: 80px;
        }

        & span:last-child {
          display: inline-block;
          padding: 0 10px;
          color: #909399;
        }
      }
    }

    .recipel-picture {
      height: 50%;
    }
  }

  .div3 {
    p {
      line-height: 40px;
      font-size: 16px;

      & span:first-child {
        display: inline-block;
        text-align-last: justify;
        text-align: justify;
        text-justify: distribute-all-lines; // 这行必加，兼容ie浏览器
        width: 80px;
      }

      & span:last-child {
        display: inline-block;
        padding: 0 10px;
        color: #909399;
      }
    }
  }

  /deep/ .el-dialog__body {
    padding: 15px 15px;
  }

  .main-content {
    height: 500px;
    display: flex;
    flex-direction: column;

    .border-left {
      line-height: 25px;
      border-left: 3px solid #36c2aa;
      font-size: 22px;
      margin: 5px 0;
      padding-left: 15px;
    }

    .img {
      flex: 1;

      .img-box {
        height: calc(100% - 35px);
      }
    }

    .info {
      height: 200px;

      .info-box {
        height: calc(100% - 35px);
        padding: 10px;
      }
    }
  }

  .button-end {
    height: 100px;
    line-height: 100px;
  }
}
</style>
