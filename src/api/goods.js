import request from '@/common/request'
// 用法用量
export function usageanddosageSelect(data) {
    return request({
        url: '/usageanddosage/select',
        method: 'post',
        data
    })
}
// 药品
export function goodsFind(data) {
    return request({
        url: '/goods/find',
        method: 'post',
        data
    })
}
/* 电话 */
export function getconfig(data) {
    return request({
        url: '/config/getconfig',
        method: 'post',
        data
    })
}
