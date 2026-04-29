import { Accordion } from '@heroui-v3/react'
import { date, timeAgo } from '@renderer/utils/formatDate'
import { ChevronRight, CircleCheck, CircleCheckBig, Clock, ClockAlert } from 'lucide-react'

type TimelineItem = {
  code: string
  label: string
  description: string
  icon: string
  class_name: string
  date_time: string
  data:
    | {
        don_vi_xu_ly_chinh?: {
          id_don_vi: string
          ten_don_vi: string
          ngay_tao: string
        }[]
        don_vi_xu_ly_phoi_hop?: {
          id_don_vi: string
          ten_don_vi: string
          ngay_tao: string
        }[]
      }
    | {
        id_don_vi: string
        ten_don_vi: string
        ngay_tao: string
        da_phan_hoi?: boolean
        ngay_bao_bao?: string
      }[]
    | [] // có thể rỗng
}

type ContentTimeLineProps = {
  data?: TimelineItem[]
}

export default function ContentTimeLine({ data }: ContentTimeLineProps) {
  const statusColor = {
    completed: 'bg-green-500 text-green-500',
    progress: 'bg-blue-700 text-blue-700',
    pending: 'bg-gray-300 text-gray-400'
  }
  return (
    <div className="relative p-2 -ml-4 sm:ml-0 flex flex-col">
      {data?.map((item, index) => (
        <div key={index} className="relative flex gap-3 pl-2">
          {/* --- ICON + LINE --- */}
          <div className="relative flex flex-col items-center">
            {/* icon */}
            <div
              className={`z-10 flex items-center justify-center rounded-full ${statusColor[item.class_name]} text-white`}
            >
              <CircleCheck size={24} />
            </div>

            {/* line nối xuống */}
            {index < data.length - 1 && (
              <div
                className={`absolute top-5 bottom-0 w-0.5 ${
                  statusColor[data[index + 1].class_name]
                } opacity-60`}
              />
            )}
          </div>

          {/* --- CONTENT --- */}
          <div className="flex-1 pb-7">
            <div className="text-sm -mt-1 font-medium text-blue-900">{item.label}</div>

            {item.date_time && (
              <div className="text-xs text-gray-500 flex items-center gap-2 mt-0.5">
                <Clock size={14} />
                <span>{date('d/m/Y - H:i:s', item.date_time)}</span>
              </div>
            )}

            <div className="text-sm mt-1">
              <span>{item.description}</span>
              <ContentSnippet data={item.data as object[] | Array<object>} />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

function ContentSnippet({ data }: { data: object[] | Array<object> }) {
  if (!data) return null

  // ✅ Nếu là mảng (case: PHAN_HOI, DON_VI_PHAN_HOI,...)
  if (Array.isArray(data)) {
    if (data.length === 0) return null

    return (
      <div className="[&>div]:px-0 mt-2">
        <Accordion>
          <Accordion.Item
            key="phan-hoi"
            className="[&_button]:p-0 [&_span]:data-[slot=title]:text-xs [&_span]:data-[slot=title]:text-blue-900 [&_button[data-open=true]_svg]:rotate-90"
          >
            <Accordion.Heading>
              <Accordion.Trigger aria-label="Danh sách đơn vị phản hồi">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-blue-900 font-medium">
                    Danh sách đơn vị phản hồi ({data.length})
                  </span>
                  <ChevronRight className="size-4 transition-transform text-blue-900" />
                </div>
              </Accordion.Trigger>
            </Accordion.Heading>
            <Accordion.Panel>
              <Accordion.Body>
                <ul className="list-disc ml-4 text-xs text-gray-600">
              {data.map((dv: any, i: number) => (
                <li key={i} className="flex items-center gap-2">
                  {dv.da_phan_hoi ? (
                    <CircleCheckBig size={12} color="green" />
                  ) : (
                    <ClockAlert size={12} color="orange" />
                  )}
                  <div>
                    {dv.ten_don_vi}
                    {dv.ngay_tao && (
                      <>
                        <span className="ml-1 text-[10px] text-gray-400" title={dv.ngay_tao}>
                          ({timeAgo(dv.ngay_tao)})
                        </span>
                      </>
                    )}
                  </div>
                </li>
              ))}
            </ul>
              </Accordion.Body>
            </Accordion.Panel>
          </Accordion.Item>
        </Accordion>
      </div>
    )
  }

  // ✅ Nếu là object (case: CHUYEN_DON_VI)
  if (typeof data === 'object') {
    const { don_vi_xu_ly_chinh = [], don_vi_xu_ly_phoi_hop = [] } = data

    if (don_vi_xu_ly_chinh.length === 0 && don_vi_xu_ly_phoi_hop.length === 0) return null

    return (
      <div className="[&>div]:px-0 mt-2">
        <Accordion>
          <Accordion.Item
            key="chuyen-don-vi"
            className="[&_button]:p-0 [&_span]:data-[slot=title]:text-xs [&_span]:data-[slot=title]:text-blue-900 [&_button[data-open=true]_svg]:rotate-90"
          >
            <Accordion.Heading>
              <Accordion.Trigger aria-label="Danh sách đơn vị">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-blue-900 font-medium">Danh sách đơn vị</span>
                  <ChevronRight className="size-4 transition-transform text-blue-900" />
                </div>
              </Accordion.Trigger>
            </Accordion.Heading>
            <Accordion.Panel>
              <Accordion.Body>
                {/* Đơn vị xử lý chính */}
            {don_vi_xu_ly_chinh.length > 0 && (
              <div className="mb-3">
                <div className="font-medium text-xs text-gray-700 mb-1">
                  Đơn vị xử lý chính ({don_vi_xu_ly_chinh.length})
                </div>
                <ul className="list-disc ml-4 text-xs text-gray-600">
                  {don_vi_xu_ly_chinh.map((dv: any, i: number) => (
                    <li key={`chinh-${i}`}>
                      {dv.ten_don_vi} <span className="mx-2"></span>
                      <span className="ml-1 text-[10px] text-gray-400" title={dv.ngay_tao}>
                        ({timeAgo(dv.ngay_tao)})
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Đơn vị phối hợp */}
            {don_vi_xu_ly_phoi_hop.length > 0 && (
              <div>
                <div className="font-medium text-xs text-gray-700 mb-1">
                  Đơn vị phối hợp ({don_vi_xu_ly_phoi_hop.length})
                </div>
                <ul className="list-disc ml-4 text-xs text-gray-600">
                  {don_vi_xu_ly_phoi_hop.map((dv: any, i: number) => (
                    <li key={`phoi-${i}`}>
                      {dv.ten_don_vi}
                      <span className="mx-2"></span>
                      <span className="ml-1 text-[10px] text-gray-400" title={dv.ngay_tao}>
                        ({timeAgo(dv.ngay_tao)})
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
              </Accordion.Body>
            </Accordion.Panel>
          </Accordion.Item>
        </Accordion>
      </div>
    )
  }

  return null
}
