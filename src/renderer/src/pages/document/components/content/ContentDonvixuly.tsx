import {
  Building2,
  CalendarDays,
  ChevronRight,
  Eye,
  MessageSquare,
  User,
  Users2
} from 'lucide-react'
import { Item } from '../drawer/DrawerDocument'
import { date } from '@renderer/utils/formatDate'
import { Accordion, Popover } from '@heroui-v3/react'
import { DonViXuLy, NguoiXem, XuLy } from '@renderer/shared/CommonInterface'
type ContentDonvixulyProps = {
  data?: XuLy
}
type DonViXuLyProps = {
  title: string
  icon: React.ReactNode
  data: Array<DonViXuLy> | null
}

type NguoiXemProps = {
  data: NguoiXem[] | null
}

export default function ContentDonvixuly({ data }: ContentDonvixulyProps) {
  return (
    <div className="p-4 space-y-2 text-sm text-gray-700">
      <Item icon={<User size={14} />} label="Người duyệt" value={data?.nguoi_duyet} />
      <Item
        icon={<CalendarDays size={14} />}
        label="Ngày duyệt"
        value={data?.ngay_duyet ? date('d/m/Y', data.ngay_duyet) : undefined}
      />
      <Item icon={<MessageSquare size={14} />} label="Ghi chú" value={data?.ghi_chu_duyet} />

      <div className="flex flex-col gap-1">
        <RenderItemDonvi
          title="Đơn vị xử lý chính"
          icon={<Building2 size={16} strokeWidth={1.5} />}
          data={data?.don_vi_xu_ly_chinh || null}
        />
        <RenderItemDonvi
          title="Đơn vị phối hợp"
          icon={<Users2 size={16} strokeWidth={1.5} />}
          data={data?.don_vi_xu_ly_phoi_hop || null}
        />
      </div>
    </div>
  )
}

function RenderItemDonvi({ title, icon, data }: DonViXuLyProps) {
  return (
    <div className="[&>div]:px-0 mt-2">
      <Accordion>
        <Accordion.Item
          key="chuyen-don-vi"
          className="[&_button]:p-0 [&_span]:data-[slot=title]:text-xs [&_button[data-open=true]_div:not(.shrink-0)_svg]:rotate-90"
        >
          <Accordion.Heading>
            <Accordion.Trigger aria-label={title}>
              <div className="flex items-center gap-2 cursor-pointer hover:text-blue-600">
                {icon ? <div className="shrink-0">{icon}</div> : null}
                <span className="text-sm">{title}</span>
                <span title={`Số lượng đơn vị được phân công ${data?.length || 0}`}>
                  [{data?.length || 0}]
                </span>
                <ChevronRight className="size-4 transition-transform" />
              </div>
            </Accordion.Trigger>
          </Accordion.Heading>
          <Accordion.Panel>
            <Accordion.Body>
              <ul className="list-decimal ml-8">
                {data && data.length > 0 ? (
                  data.map((dv: DonViXuLy, i: number) => (
                    <li key={i} className="mb-1">
                      <div className="flex items-center gap-2">
                        <span>{dv.ten_don_vi}</span>
                        <RenderUserView data={dv.nguoi_xem || null} />
                      </div>
                    </li>
                  ))
                ) : (
                  <li className="text-gray-400 italic">Không có đơn vị</li>
                )}
              </ul>
            </Accordion.Body>
          </Accordion.Panel>
        </Accordion.Item>
      </Accordion>
    </div>
  )
}

function RenderUserView({ data }: NguoiXemProps) {
  if (!data || data.length === 0) return null
  const count = data.length

  return (
    <Popover>
      <Popover.Trigger>
        <div
          className="flex items-center gap-1 text-xs px-2 py-0.5 rounded border border-gray-200 cursor-pointer
                    bg-white hover:bg-blue-500 text-blue-500 hover:text-white transition-colors"
        >
          <Eye size={12} />
          <small>{count}</small>
        </div>
      </Popover.Trigger>

      <Popover.Content className="min-w-[300px] p-0 rounded-none shadow-sm">
        <div className="flex flex-col gap-2 w-full max-h-[50vh] overflow-y-auto py-3 px-4">
          <h4 className="text-sm font-semibold mb-1">Người đã xem</h4>
          {data.map((u) => (
            <div
              key={u.id_don_vi_xu_ly_da_xem}
              className="flex items-center gap-3 p-1 hover:bg-gray-50 w-full"
            >
              {/* Avatar */}
              <div className="w-8 h-8 bg-blue-500 text-white flex items-center justify-center rounded-full text-xs">
                {u.ql_nguoi_dung_ho_ten?.charAt(0).toUpperCase()}
              </div>

              {/* Info */}
              <div className="flex flex-col text-sm">
                <span className="font-medium">{u.ql_nguoi_dung_ho_ten}</span>
                <span className="text-gray-500 text-xs">{u.ql_nguoi_dung_email}</span>
                <span className="text-gray-400 text-[11px]">
                  {date('H:i:s - d/m/Y', u.ngay_xem)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </Popover.Content>
    </Popover>
  )
}
