import { CalendarDays, Clock, CheckCircle, XCircle } from 'lucide-react'
import StatCard from '@renderer/components/StatCard'

interface OvertimeStatsProps {
  show: boolean
  total: number
  pending: number
  approved: number
  rejected: number
}

export default function OvertimeStats({
  show,
  total,
  pending,
  approved,
  rejected
}: OvertimeStatsProps) {
  return (
    <>
      {show && (
        <div className="flex flex-col gap-2 flex-none px-0">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 px-0">
            <div className="flex">
              <StatCard
                title="Tổng đơn"
                icon={<CalendarDays />}
                data={[{ label: 'Tổng', value: total }]}
                color="primary"
                className="w-full"
              />
            </div>
            <div className="flex">
              <StatCard
                title="Chờ duyệt"
                icon={<Clock />}
                data={[{ label: 'Chờ duyệt', value: pending }]}
                color="warning"
                className="w-full"
              />
            </div>
            <div className="flex">
              <StatCard
                title="Đã duyệt"
                icon={<CheckCircle />}
                data={[{ label: 'Đã duyệt', value: approved }]}
                color="success"
                className="w-full"
              />
            </div>
            <div className="flex">
              <StatCard
                title="Từ chối"
                icon={<XCircle />}
                data={[{ label: 'Từ chối', value: rejected }]}
                color="danger"
                className="w-full"
              />
            </div>
          </div>
        </div>
      )}
    </>
  )
}
