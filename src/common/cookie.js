import Cookies from 'js-cookie'

const TokenKey = 'Admin-Token'

export function getToken() {
    return Cookies.get(TokenKey)
}

export function setToken(token) {
    return Cookies.set(TokenKey, token)
}

export function removeToken() {
    return Cookies.remove(TokenKey)
}

export function getloginInfo() {
    const info = JSON.parse(Cookies.get('LoginInfo'))
    return info
}

export function setloginInfo(loginInfo) {
    return Cookies.set('LoginInfo', loginInfo, {expires: 7})
}

export function removeloginInfo() {
    return Cookies.remove('LoginInfo')
}

