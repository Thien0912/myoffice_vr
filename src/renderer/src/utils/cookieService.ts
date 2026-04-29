import Cookies from 'js-cookie'
import pako from 'pako'

interface AccessUrl {
  ql_quyen_icon: string | null
  ql_quyen_loai_module: string
  ql_quyen_ten: string
  ql_quyen_ten_tieng_anh: string | null
  ql_quyen_thu_tu_hien_thi_chuc_nang: string | null
  ql_quyen_url: string
}

function encodeAccessUrls(data: any): string {
  const json = JSON.stringify(data)
  const compressed = pako.deflate(json)
  const base64 = btoa(String.fromCharCode(...compressed))
  return base64
}

// set cookie
export const setCookiesAuth = (
  accessUrls: AccessUrl[],
  permissionKeys: string[],
  token: string,
  user: object,
  roleCode?: string[]
) => {
  const options = { expires: 7, domain: import.meta.env.VITE_COOKIE_DOMAIN, path: '/' }

  const filteredAccessUrls = accessUrls.map((item: any) => ({
    ql_quyen_ten: item.ql_quyen_ten,
    ql_quyen_url: item.ql_quyen_url,
    ql_quyen_loai_module: item.ql_quyen_loai_module
    // ql_quyen_thu_tu_hien_thi_chuc_nang: item.ql_quyen_thu_tu_hien_thi_chuc_nang
  }))

  const encodedAccessUrls = encodeAccessUrls(filteredAccessUrls)
  const permissionKeysEncode = encodeAccessUrls(permissionKeys)

  Cookies.set('access_urls', JSON.stringify(encodedAccessUrls), options)
  Cookies.set('permission_keys', JSON.stringify(permissionKeysEncode), options)
  Cookies.set('token', token, options)
  Cookies.set('user', JSON.stringify(user), options)
  Cookies.set('role_code', JSON.stringify(roleCode ?? []), options)
}

// // get cookie
// export const getCookieAuth = (name: string) => {
//   const value = Cookies.get(name)
//   try {
//     return value ? JSON.parse(value) : value
//   } catch {
//     return value
//   }
// }

// get
export const getCookieAuth = (name: string) => {
  const value = Cookies.get(name)
  try {
    if (name === 'access_urls') {
      return value
        ? pako.inflate(
            Uint8Array.from(atob(value), (c) => c.charCodeAt(0)),
            { to: 'string' }
          )
        : null
    }
    return value ? JSON.parse(value) : value
  } catch {
    return value
  }
}

// remove all cookies
export const clearCookiesAuth = () => {
  const removeOptions = { domain: import.meta.env.VITE_COOKIE_DOMAIN, path: '/' }

  Cookies.remove('access_urls', removeOptions)
  Cookies.remove('permission_keys', removeOptions)
  Cookies.remove('public_key', removeOptions)
  Cookies.remove('tags', removeOptions)
  Cookies.remove('token', removeOptions)
  Cookies.remove('user', removeOptions)
  Cookies.remove('role_code', removeOptions)
  Cookies.remove('lang', removeOptions)
}

export const CookieService = {
  set: (name: string, value: string, days: number = 7) => {
    let expires = ''

    const date = new Date()
    date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000)
    expires = '; expires=' + date.toUTCString()

    document.cookie = `${name}=${value || ''}${expires}; path=/`
  },
  get: (name: string) => {
    const nameEQ = name + '='
    const ca = document.cookie.split(';')
    for (let i = 0; i < ca.length; i++) {
      let c = ca[i]
      while (c.charAt(0) === ' ') c = c.substring(1, c.length)
      if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length)
    }
    return null
  },
  clearAll: () => {
    const cookies = document.cookie.split(';')
    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i]
      const eqPos = cookie.indexOf('=')
      const name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie
      document.cookie = name + '=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/'
    }
  }
}
