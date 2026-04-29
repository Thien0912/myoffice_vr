// socket.js
import { io } from 'socket.io-client'

// Lay URL tu bien moi truong, fallback ve localhost neu khong co
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3000'
console.log('Socket URL:', SOCKET_URL)
export const socket = io(SOCKET_URL, {
  transports: ['websocket'],
  reconnection: true,
})

socket.on('connect', () => {
  console.log('[Socket] Connected:', socket.id)
})

socket.on('connect_error', (err) => {
  console.error('[Socket] Connection Error:', err)
})
