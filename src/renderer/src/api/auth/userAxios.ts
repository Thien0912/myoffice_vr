import { callApi } from '../callApi'
import { encryptPinCode } from '@renderer/utils/encryption'

// Helper function để lấy public key từ localStorage
const getPublicKey = (): string | null => {
  try {
    const authData = localStorage.getItem('auth')
    if (!authData) return null
    const auth = JSON.parse(authData)
    return auth?.state?.user?.public_key || null
  } catch (error) {
    console.error('Error getting public key from localStorage:', error)
    return null
  }
}

export const userAxios = {
  find: (payload?: object) => {
    return callApi('authentication/checkEmail', {
      method: 'POST',
      data: payload
    })
  },
  me: () => {
    return callApi('authentication/me', {
      method: 'POST'
    })
  },
  sendHeartbeat: () => {
    return callApi('authentication/heartbeat', { method: 'POST' })
  },
  getOnlineUsers: (type: 'count' | 'list' = 'list') => {
    return callApi('authentication/online_users', {
      method: 'GET',
      data: { type }
    })
  },
  validatePin: (pin: string) => {
    // Lấy public key từ localStorage
    const publicKey = getPublicKey()
    if (!publicKey) {
      return Promise.reject(new Error('Public key không tồn tại'))
    }

    // Mã hóa PIN code trước khi gửi lên server
    const encryptedPin = encryptPinCode(pin, publicKey)
    if (!encryptedPin) {
      return Promise.reject(new Error('Không thể mã hóa PIN code'))
    }

    return callApi('authentication/pin_code_verify', {
      method: 'POST',
      data: { pin_code: encryptedPin }
    })
  },
  registerPin: (pin: string) => {
    // Lấy public key từ localStorage
    const publicKey = getPublicKey()
    if (!publicKey) {
      return Promise.reject(new Error('Public key không tồn tại'))
    }

    // Mã hóa PIN code trước khi gửi lên server
    const encryptedPin = encryptPinCode(pin, publicKey)
    if (!encryptedPin) {
      return Promise.reject(new Error('Không thể mã hóa PIN code'))
    }

    return callApi('authentication/pin_register', {
      method: 'POST',
      data: { pin_code: encryptedPin }
    })
  },
  sendPinCodeApprovalEmail: (id: string | number, proposeId?: string, view?: string) => {
    let url = `authentication/sendPinCodeApprovalEmail/${id}`
    const params = new URLSearchParams()
    if (proposeId) params.append('id_de_xuat', proposeId)
    if (view) params.append('view', view)

    if (params.toString()) {
      url += `?${params.toString()}`
    }

    return callApi(url, {
      method: 'GET'
    })
  },
  activatePinCode: (token: string) => {
    return callApi('authentication/activate_pin_code', {
      method: 'POST',
      data: { token }
    })
  },
  verifyOtp: (otp: string) => {
    return callApi('authentication/verify_otp', {
      method: 'POST',
      data: { otp_code: otp }
    })
  },
  sendOtp: () => {
    return callApi('authentication/send_otp', {
      method: 'POST'
    })
  },
  changeRole: (payload: { ql_vai_tro_id?: string | number; ql_vai_tro_nguoi_dung_id?: string | number }) => {
    return callApi('authentication/change_role', {
      method: 'POST',
      data: payload
    })
  }
}
