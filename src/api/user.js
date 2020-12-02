import request from '@/common/request'

export function login(data) {
    return request({
        url: 'dzsf/user/login',
        method: 'post',
        data
    })
}

export function login2(data) {
    return request({
        url: '/roleqyweb/webuser/role/user/login',
        method: 'get',
        params:data
    })
}

export function getInfo(token) {
    return request({
        url: '/user/info',
        method: 'get',
        params: {token}
    })
}

export function logout(data) {
    return request({
        url: '/doctor/logout',
        method: 'post',
        data
    })
}
// 修改密码
export function changepassword(data) {
    return request({
        url: '/user/changepassword',
        method: 'post',
        data
    })
}
/*获取医生信息*/
export function sxfindByID(data) {
    return request({
        url: '/doctor/sxfindByID',
        method: 'post',
        data
    })
}
/*常见病*/
export function diseasesSelect(data) {
    return request({
        url: '/diseases/select',
        method: 'post',
        data
    })
}
/*结束  */
export function callEnd(data) {
    return request({
        url: '/inquiry/callEnd',
        method: 'post',
        data
    })
}
/*接诊记录*/
export function inquirySelect(data) {
    return request({
        url: '/inquiry/select',
        method: 'post',
        data
    })
}

// 创建录制任务
export function createRecord(data) {
    return request({
        url: '/tencentcloud/createRecord',
        method: 'post',
        data
    })
}
// 终止录制任务
export function stopRecord(data) {
    return request({
        url: '/tencentcloud/stopRecord',
        method: 'post',
        data
    })
}
// 混流
export function startMixStream(data) {
    return request({
        url: '/tencentcloud/startMixStream',
        method: 'post',
        data
    })
}

// 门店端断流提醒
export function notifyShop(data) {
    return request({
        url: '/prescription/notifyShop',
        method: 'post',
        data
    })
}

/*历史处方总单*/
export function sxfinddoc(data) {
    return request({
        url: '/prescription/sxfinddoc',
        method: 'post',
        data
    })
}

/*历史处方细单*/
export function finddtl(data) {
    return request({
        url: '/prescription/finddtl',
        method: 'post',
        data
    })
}
// 获取企业logo 识别标识
export function getconfig(data) {
    return request({
        url: '/config/interf/getconfig',
        method: 'post',
        data
    })
}
