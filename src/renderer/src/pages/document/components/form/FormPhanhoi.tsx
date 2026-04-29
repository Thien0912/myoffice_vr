import { Separator } from '@heroui-v3/react'
import { vanbandenAxios } from '@renderer/api/documents/vanbandenAxios'
import { vanbandendonviAxios } from '@renderer/api/documents/vanbandendonviAxios'
import ItemComment from '@renderer/components/ItemComment'
import { PhanHoi, VanBanData } from '@renderer/shared/CommonInterface'
import { useQuery } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
type FormPhanhoiProps = {
  id?: string | number
  onFilesChange?: (name: string, files: File[]) => void
  type?: 'vanbanden' | 'vanbandendonvi'
}

export default function FormPhanhoi({ id, type = 'vanbandendonvi' }: FormPhanhoiProps) {
  const [dataVanban, setDataVanban] = useState<VanBanData | null>(null)
  const [dataPhanhoi, setDataPhanhoi] = useState<PhanHoi[]>([])
  if (!id) {
    return <div>Không có ID văn bản</div>
  }

  const { data, isLoading } = useQuery({
    queryKey: ['detail_phanhoi', id, type],
    queryFn: async () => {
      // await new Promise((resolve) => setTimeout(resolve, 2000)) // ⏱ delay 2s
      if (type === 'vanbanden') {
        return vanbandenAxios.show(id)
      }
      return vanbandendonviAxios.show(id)
    }
  })
  useEffect(() => {
    if (data) {
      setDataVanban(data?.data)
      setDataPhanhoi(data?.data.phan_hoi ?? [])
    }
  }, [data])
  if (isLoading) return <div>Đang tải dữ liệu...</div>
  if (!data) return <div>Không tìm thấy dữ liệu</div>

  return (
    <div className="space-y-2 text-sm">
      <div>
        <span>Số hiệu:</span>
        <h5 className="text-slate-500 text-lg font-bold">{dataVanban?.so_hieu_van_ban}</h5>
      </div>
      <div className="flex items-center gap-5 h-5">
        <div className="flex items-center gap-2">
          <span className="mr-10 text-gray-500">Số đến:</span>
          <span className="text-slate-500 text-sm font-bold">{dataVanban?.so_van_ban ?? '-'} </span>
        </div>
        <Separator orientation="vertical" />{' '}
        <div className="flex items-center gap-2">
          <span className="text-gray-500">Loại văn bản:</span>
          <h5 className="text-slate-500 text-sm font-bold">{dataVanban?.ten_loai}</h5>
        </div>
      </div>
      <div>
        <span className="text-gray-500 mr-8">Trích yếu: </span>
        <span className="text-sm">{dataVanban?.trich_yeu ?? '-'} </span>
      </div>
      <hr className="m-3 text-slate-300" />
      <div className="max-h-96 overflow-y-scroll">
        <ItemComment data={dataPhanhoi} />
      </div>
    </div>
  )
}
