import JSEncrypt from 'jsencrypt'

/**
 * Mã hóa dữ liệu sử dụng RSA public key
 * @param data - Dữ liệu cần mã hóa
 * @param publicKey - Public key từ backend
 * @returns Chuỗi đã được mã hóa base64
 */
export const encryptRSA = (data: string, publicKey: string): string | false => {
  try {
    const encrypt = new JSEncrypt()
    encrypt.setPublicKey(publicKey)
    const encrypted = encrypt.encrypt(data)
    return encrypted
  } catch (error) {
    console.error('RSA Encryption Error:', error)
    return false
  }
}

/**
 * Mã hóa PIN code để gửi lên server
 * @param pinCode - Mã PIN cần mã hóa
 * @param publicKey - Public key từ backend
 * @returns Chuỗi PIN đã được mã hóa hoặc false nếu có lỗi
 */
export const encryptPinCode = (pinCode: string, publicKey: string): string | false => {
  if (!pinCode || !publicKey) {
    console.error('PIN code hoặc public key không hợp lệ')
    return false
  }
  return encryptRSA(pinCode, publicKey)
}

/**
 * Mã hóa password để gửi lên server
 * @param password - Mật khẩu cần mã hóa
 * @param publicKey - Public key từ backend
 * @returns Chuỗi password đã được mã hóa hoặc false nếu có lỗi
 */
export const encryptPassword = (password: string, publicKey: string): string | false => {
  if (!password || !publicKey) {
    console.error('Password hoặc public key không hợp lệ')
    return false
  }
  return encryptRSA(password, publicKey)
}
