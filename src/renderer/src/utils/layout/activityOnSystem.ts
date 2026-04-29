// Danh sách các công việc cần chạy khi user Active
const tasks: any[] = []
let isActive = true
let inactivityTimer: NodeJS.Timeout | null = null

// Định nghĩa thời gian chờ (5 phút)
const INACTIVITY_LIMIT = 5 * 60 * 1000

// Hàm để nơi khác đăng ký công việc (Ví dụ: Heartbeat đăng ký vào đây)
export const registerActiveTask = (callback: () => void, timeMs: number) => {
  // 1. Tạo object task
  const task = {
    callback,
    timeMs,
    timerId: null as NodeJS.Timeout | null
  }

  // 2. Nếu đang active thì cho chạy ngay
  if (isActive) {
    task.callback()
    task.timerId = setInterval(task.callback, task.timeMs)
  }

  // 3. Lưu vào danh sách
  tasks.push(task)

  // 4. Trả về hàm để hủy đăng ký (nếu cần)
  return () => {
    if (task.timerId) clearInterval(task.timerId)
    const index = tasks.indexOf(task)
    if (index > -1) tasks.splice(index, 1)
  }
}

// Hàm xử lý khi user không hoạt động -> Tắt hết các task
const setSystemInactive = () => {
  console.log('User nghỉ ngơi - Tắt các tác vụ ngầm')
  isActive = false
  tasks.forEach((task) => {
    if (task.timerId) {
      clearInterval(task.timerId)
      task.timerId = null
    }
  })
}

// Hàm xử lý khi user quay lại -> Bật lại các task
const setSystemActive = () => {
  console.log('User quay lại - Bật lại các tác vụ ngầm')
  isActive = true
  tasks.forEach((task) => {
    if (!task.timerId) {
      // Chỉ bật nếu đang tắt
      task.callback()
      task.timerId = setInterval(task.callback, task.timeMs)
    }
  })
}

// Hàm lắng nghe sự kiện chuột/phím
const resetInactivityTimer = () => {
  // Nếu đang ngủ mà có event -> Đánh thức dậy
  if (!isActive) {
    setSystemActive()
  }

  // Reset đếm ngược 5 phút
  if (inactivityTimer) clearTimeout(inactivityTimer)

  inactivityTimer = setTimeout(() => {
    setSystemInactive()
  }, INACTIVITY_LIMIT)
}

// Gắn sự kiện lắng nghe (Chạy ngay khi file được import)
const events = ['click', 'mousemove', 'keydown', 'scroll', 'touchstart']
events.forEach((evt) => window.addEventListener(evt, resetInactivityTimer))
resetInactivityTimer() // Khởi động ban đầu
