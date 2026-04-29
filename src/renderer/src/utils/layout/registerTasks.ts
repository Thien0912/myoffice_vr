import { registerActiveTask } from './activityOnSystem'
import { userAxios } from '@renderer/api/auth/userAxios'
import { useAuthStore } from '@renderer/store/useAuthStore'


// Hàm này sẽ được gọi 1 lần khi App khởi động để đăng ký các background tasks
// Hàm này sẽ được gọi 1 lần khi App khởi động để đăng ký các background tasks
// Hàm này sẽ được gọi 1 lần khi App khởi động để đăng ký các background tasks
export const initAppTasks = (router?: any): (() => void) => {
  // All periodic tasks (Heartbeat, Notifications) have been moved to SocketManager.tsx
  // This function is kept to maintain the hook structure but performs no operations.

  return () => {
    // Cleanup if needed in future
  }
}
