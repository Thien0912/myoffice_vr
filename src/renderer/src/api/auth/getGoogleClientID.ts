import api from '@renderer/api'

const getGoogleClientID = async (): Promise<string> => {
  const response = await api.get('/authentication/getGoogleClientID')
  console.log('✅ Lấy Google Client ID thành công:', response.data)
  return response.data
}

export default getGoogleClientID
