import { Button, Dropdown, DropdownItem, DropdownMenu, DropdownTrigger } from '@heroui/react'
import { download, preview } from '@renderer/utils/documents/userPreview'
import { ArrowDownToLine, Ellipsis } from 'lucide-react'
import { useEffect, useRef } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'

export default function Preview() {
  const { encodedUrl } = useParams()
  const [searchParams] = useSearchParams()
  const iframeRef = useRef<HTMLIFrameElement>(null)

  const decodedUrl = preview(decodeURIComponent(encodedUrl || ''))
  const title = decodeURIComponent(searchParams.get('title') || 'Document Preview')
  const type = decodeURIComponent(searchParams.get('type') || '')

  useEffect(() => {
    document.title = title
  }, [title])

  const handleButtonClick = () => {
    const url = decodedUrl.split('/').pop() || 'download'
    download(url)
  }

  let fileContent: React.JSX.Element
  switch (type) {
    case 'pdf':
      fileContent = (
        <iframe
          ref={iframeRef}
          src={decodedUrl}
          title={title}
          className="w-full h-screen border-0"
        />
      )
      break
    case 'doc':
    case 'docx':
    case 'xls':
    case 'xlsx':
      // const url =
      //   type === 'doc' || type === 'docx'
      //     ? 'https://myofficeapi.nctu.edu.vn/api/api/v1/fileaccess/view/MDAwMDAwMDAwMDAwMDAwMEkzeFM3dzhKWG9ad3k2YWhoS0tvYnd2a0JBd2pMOFlsbkp4cU5jWXNkdmthN29Vc3pTOW1FZ2JnNTZ6bFhxQiszYXZ4S3Bqd1gzV3o5eSs4N2dvRkRCK0xCeGhUc3RuVHZXOE9qMDBwTEJ2ZWIxL083YWc5Y2N1YSs3VVFlTTJ2NHgySG1oUDU4aENOU0REY043S3E2L01SVmVGUVRmWTNQdTdDUytlcWV6b1dzUnhEZUt2M04yYXcvQjNaSEFhSlpzeHVuZjJ4MXpPZmZPbGJvaEVJVTlTUkdQYko1d1hxcTBzSGVPRGYwL2dMaDN4di9GdnZkK3JJemUwNitHcFFLZGx2ZUYyWEZPYUt5SGhk'
      //     : 'https://myoffice.sandboxnctu.qzz.io/api/api/v1/fileaccess/view/MDAwMDAwMDAwMDAwMDAwMEkzeFM3dzhKWG9ad3k2YWhoS0tvYnd2a0JBd2pMOFlsbkp4cU5jWXNkdmthN29Vc3pTOW1FZ2JnNTZ6bFhxQiszYXZ4S3Bqd1gzV3o5eSs4N2dvRkRSKytCeGhUc3RuNXYyOGtqM29ERmh2ekN3Ykx4WWtEWWNqc2dMVVFlTTJ2NHh5SG1oUDU4MjZOU0RpV0JwbVk2L0JNVmVWVVRmWTNQdTdDUytlcWV6b1dzUnhEZXEvbGRIdTh0VVRPRXczWEpzTnJsTmFlMnp2SEF1d2ZsSGhFZitMYktiU3owbDNMZ2djTVhxenl2N05VcFZ4NHZ3bXhQZkxjMGJGbXZpQlBjdEptZVhyQ0JQQ0JoeE1ZZld5NDRBMWxlUT09'

      const officeUrl = `https://view.officeapps.live.com/op/view.aspx?src=${decodedUrl}`
      fileContent = <iframe src={officeUrl} title={title} className="w-full h-screen border-0" />
      break
    case 'png':
    case 'jpg':
    case 'jpeg':
    case 'gif':
      fileContent = <img src={decodedUrl} alt={title} className="w-full h-screen object-contain" />
      break
    case 'zip':
    case 'rar':
    case '7z':
      fileContent = (
        <div className="p-6 text-center">
          <div>File nén không hỗ trợ xem trực tiếp.</div>
          <Button onPress={handleButtonClick} size="sm" variant="faded">
            Tải về
          </Button>
        </div>
      )
      break

    default:
      fileContent = (
        <div className="p-6 text-center text-gray-500">Không hỗ trợ loại tài liệu này</div>
      )
  }

  return (
    <div>
      {!['pdf', 'xls', 'xlsx'].includes(type) && (
        <div className="flex justify-end items-center gap-2 px-5 py-1">
          <Dropdown placement="bottom-end" radius="none" shadow="sm" className="p-0">
            <DropdownTrigger>
              <Button variant="bordered" className="border-1" isIconOnly size="sm" radius="none">
                <Ellipsis strokeWidth={1.5} color="blue" />
              </Button>
            </DropdownTrigger>
            <DropdownMenu aria-label="Action event example">
              <DropdownItem
                key="download"
                className="rounded-none"
                startContent={<ArrowDownToLine size={18} />}
                onClick={() => handleButtonClick()}
              >
                Tải về
              </DropdownItem>
            </DropdownMenu>
          </Dropdown>
        </div>
      )}
      {fileContent}
    </div>
  )
}
