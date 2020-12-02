import request from '@/common/request'
/*获取签名*/
export function getKey(data) {
    return request({
        url: '/config/getkey',
        method: 'post',
        data
    })
}
// 日志
export function savelog(data) {
    return request({
        url: 'inquiry/savelog',
        method: 'post',
        data
    })
}
