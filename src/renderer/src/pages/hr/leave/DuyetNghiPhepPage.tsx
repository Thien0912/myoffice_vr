import { useParams, useNavigate } from 'react-router-dom'
import { useEffect } from 'react'
import { useAuthStore } from '@renderer/store/useAuthStore'
import { useAfterRedirect } from '@renderer/hooks/useAfterRedirect'

export default function DuyetNghiPhepPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuthStore()

  useEffect(() => {
    if (user && id) {
      // Nếu đã đăng nhập, chuyển về trang nghỉ phép kèm uuid để tự mở modal
      navigate(`/hrm/nghi-phep?uuid=${id}`, { replace: true })
    } else if (!user) {
      // Nếu chưa đăng nhập, lưu lại path hiện tại và chuyển thẳng sang trang login
      useAfterRedirect.set()
      navigate('/login', { replace: true })
    }
  }, [user, id, navigate])

  return null
}
