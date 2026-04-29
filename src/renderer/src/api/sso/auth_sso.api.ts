import axios from 'axios'

export const ssoApi = {
  getToken: async function (params: any) {
    // Must use URLSearchParams for application/x-www-form-urlencoded
    const body = new URLSearchParams(params)
    const { data } = await axios.post(
      `${import.meta.env.VITE_APP_SSO_ENDPOINT}/oauth2/token`,
      body,
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    )
    return data
  },
  getInfo: async function (token: string | undefined) {
    const { data } = await axios.get(`${import.meta.env.VITE_APP_SSO_ENDPOINT}/oauth2/userinfo`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
    return data
  }
}
