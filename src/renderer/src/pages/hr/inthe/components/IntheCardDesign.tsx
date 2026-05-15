import { useState, useRef, useEffect } from 'react'
import { Button, Input, Slider, Divider, cn } from '@heroui/react'
import { QRCodeSVG } from 'qrcode.react'
import { Printer, RefreshCw, Type, User, Download, Upload, Camera, CreditCard } from 'lucide-react'
import domtoimage from 'dom-to-image'
import { jsPDF } from 'jspdf'
import { useReactToPrint } from 'react-to-print'
import bgCard from '@renderer/assets/images/idcard/id card nhan vien ver 5_Folder/id card nhan vien 6.png'
import { getAvatarUrl } from '@renderer/utils/urlUtils'
import { toast } from "@heroui-v3/react";

interface IntheCardDesignProps {
  employee: any
}

export default function IntheCardDesign({ employee: initialEmployee }: IntheCardDesignProps) {
  const [employee, setEmployee] = useState({
    ma_nhan_vien: initialEmployee?.ma_nhan_vien || '',
    ho_va_ten: initialEmployee?.ho_va_ten || '',
    hoc_ham: initialEmployee?.hoc_ham || '',
    ten_cong_viec: initialEmployee?.ten_chuc_vu || '',
    ten_don_vi: initialEmployee?.ten_don_vi || '',
    avatar: getAvatarUrl(initialEmployee?.avatar) || ''
  })

  const [fontSizes, setFontSizes] = useState({
    idLabel: 6,
    idValue: 7,
    nameLabel: 6,
    name: 9,
    academicLabel: 6,
    academic: 7,
    positionLabel: 6,
    position: 7,
    unitLabel: 6,
    unit: 7
  })

  // Position offsets (in px or %)
  const [positions, setPositions] = useState({
    qrTop: -1,
    qrRight: -0.15,
    qrSize: 40,
    contentTop: 56,
    contentLeft: 11,
    avatarTop: 16,
    infoTop: 5,
    infoLeft: 2.1,
    infoPaddingLeft: 10,
    idTop: 8.6,
    idLeft: 7,
    nameTop: 26.5,
    nameLeft: 7,
    academicTop: 47,
    academicLeft: 7,
    positionTop: 62.2,
    positionLeft: 7,
    unitTop: 90,
    unitLeft: 7
  })

  const cardRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [containerWidth, setContainerWidth] = useState(0)

  useEffect(() => {
    if (!containerRef.current) return
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setContainerWidth(entry.contentRect.width)
      }
    })
    observer.observe(containerRef.current)
    return () => observer.disconnect()
  }, [])

  const isStacked = containerWidth > 0 && containerWidth < 950

  const handlePrint = useReactToPrint({
    contentRef: cardRef,
    documentTitle: `${employee.ho_va_ten}_the_nhan_vien`
  })

  useEffect(() => {
    if (initialEmployee) {
      setEmployee({
        ma_nhan_vien: initialEmployee.ma_nhan_vien || '',
        ho_va_ten: initialEmployee.ho_va_ten || '',
        hoc_ham: initialEmployee.hoc_ham || '',
        ten_cong_viec: initialEmployee.ten_chuc_vu || initialEmployee.ten_cong_viec || '',
        ten_don_vi: initialEmployee.ten_don_vi || '',
        avatar: getAvatarUrl(initialEmployee.avatar) || ''
      })
    }
  }, [initialEmployee])

  // Hàm làm sạch oklch khỏi CSS
  const sanitizeOklch = (doc: Document) => {
    const allElements = doc.querySelectorAll('*')
    allElements.forEach((el) => {
      const element = el as HTMLElement
      // Reset tất cả inline styles có thể chứa oklch
      element.style.cssText = element.style.cssText.replace(/oklch\([^)]+\)/g, '#000000')
    })

    // Xóa tất cả external stylesheets
    const stylesheets = doc.querySelectorAll('link[rel="stylesheet"]')
    stylesheets.forEach((sheet) => sheet.remove())

    // Xóa tất cả style tags
    const styleTags = doc.querySelectorAll('style')
    styleTags.forEach((tag) => tag.remove())
  }

  const handleDownloadPDF = async () => {
    if (!cardRef.current) return

    try {
      toast('Đang xử lý', { description: 'Vui lòng chờ trong giây lát...', variant: 'default' })
      
      const dataUrl = await domtoimage.toPng(cardRef.current, {
        quality: 1,
        width: 84.68 * 3.78 * 2,
        height: 53.2 * 3.78 * 2,
        style: {
          transform: 'scale(2)',
          transformOrigin: 'top left',
          width: '84.68mm',
          height: '53.2mm'
        }
      })

      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: [84.68, 53.2]
      })

      pdf.addImage(dataUrl, 'PNG', 0, 0, 84.68, 53.2)
      pdf.save(`${employee.ho_va_ten}_the_nhan_vien.pdf`)

      toast('Thành công', { description: 'Đã tải xuống file PDF', variant: 'success' })
    } catch (error) {
      console.error('Lỗi khi xuất PDF:', error)
      toast('Lỗi', { description: 'Không thể tạo file PDF', variant: 'danger' })
    }
  }

  const handleReset = () => {
    setEmployee({
      ma_nhan_vien: initialEmployee?.ma_nhan_vien || '',
      ho_va_ten: initialEmployee?.ho_va_ten || '',
      hoc_ham: initialEmployee?.hoc_ham || '',
      ten_cong_viec: initialEmployee?.ten_chuc_vu || initialEmployee?.ten_cong_viec || '',
      ten_don_vi: initialEmployee?.ten_don_vi || '',
      avatar: getAvatarUrl(initialEmployee?.avatar) || ''
    })
    setFontSizes({
      idLabel: 6,
      idValue: 7,
      nameLabel: 6,
      name: 9,
      academicLabel: 6,
      academic: 7,
      positionLabel: 6,
      position: 7,
      unitLabel: 6,
      unit: 7
    })
    setPositions({
      qrTop: -1,
      qrRight: -0.15,
      qrSize: 40,
      contentTop: 56,
      contentLeft: 11,
      avatarTop: 16,
      infoTop: 5,
      infoLeft: 2.1,
      infoPaddingLeft: 10,
      idTop: 8.6,
      idLeft: 7,
      nameTop: 26.5,
      nameLeft: 7,
      academicTop: 47,
      academicLeft: 7,
      positionTop: 62.2,
      positionLeft: 7,
      unitTop: 90,
      unitLeft: 7
    })
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const url = URL.createObjectURL(file)
      setEmployee((prev) => ({ ...prev, avatar: url }))
    }
  }

  return (
    <div
      ref={containerRef}
      className={cn(
        'flex h-full overflow-hidden bg-white dark:bg-gray-800',
        isStacked ? 'flex-col divide-y' : 'flex-row lg:divide-x divide-divider'
      )}
    >
      {/* Styles for Printing */}
      <style>{`
        @media print {
            @page {
                size: 84.68mm 53.2mm;
                margin: 0;
            }
            body {
                margin: 0;
            }
            .no-print {
                display: none !important;
            }
            .print-area {
                position: absolute;
                top: 0;
                left: 0;
                width: 84.68mm !important;
                height: 53.2mm !important;
                transform: none !important;
                box-shadow: none !important;
                margin: 0 !important;
            }
        }
    `}</style>
        
      {/* Cột 1: Hiển thị thẻ và Nút in */}
      <div
        className={cn(
          'shrink-0 flex flex-col gap-4 p-4 lg:p-6 bg-gray-50/50 dark:bg-gray-900/30 overflow-y-auto custom-scrollbar transition-all',
          isStacked ? 'w-full' : 'w-[600px]'
        )}
      >
        <h4 className="text-sm font-bold text-blue-500 uppercase flex items-center gap-2">
          <CreditCard size={16} className="text-blue-500" /> Xem trước thẻ
        </h4>

        <div className={cn("flex flex-col items-center gap-6 lg:gap-10 w-full", !isStacked && "flex-1")}>
          <div className="flex justify-center items-center p-4 lg:p-8 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-none no-print w-full overflow-x-auto custom-scrollbar flex-1">
            <div
              ref={cardRef}
              className="relative shadow-2xl overflow-hidden print-area bg-white shrink-0"
              style={{
                width: '84.68mm',
                height: '53.2mm',
              }}
            >
              <img
                src={bgCard}
                alt="Card Background"
                crossOrigin="anonymous"
                className="absolute inset-0 w-full h-full object-cover z-0"
              />

              <div
                className="absolute w-[18%] h-[28%] z-10 flex justify-center items-center"
                style={{ top: `${positions.qrTop}%`, right: `${positions.qrRight}%` }}
              >
                <QRCodeSVG
                  value={`https://myoffice.nctu.edu.vn/profile/code/${employee.ma_nhan_vien}`}
                  size={positions.qrSize}
                  fgColor="#111111"
                  level="L"
                  includeMargin={false}
                />
              </div>

              <div
                className="relative z-10 flex w-full h-full"
                style={{
                  padding: '11px',
                  paddingTop: `${positions.contentTop}px`,
                  paddingLeft: `${positions.contentLeft}px`
                }}
              >
                {/* Avatar */}
                <div
                  className="w-[76px] h-[114px] bg-white border border-gray-100 overflow-hidden shrink-0 rounded-[4px]"
                  style={{ marginTop: `${positions.avatarTop}px`,
                  transform: `translate(-2.5px, -4.5px)`}}
                >
                  {employee.avatar ? (
                    <img src={employee.avatar} crossOrigin="anonymous" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-300">
                      <User size={40} />
                    </div>
                  )}
                </div>

                {/* Info Area */}
                <div
                  className="flex-1 relative"
                  style={{
                    marginLeft: `${positions.infoLeft}px`,
                    marginTop: `${positions.infoTop}px`,
                    paddingLeft: `${positions.infoPaddingLeft}px`
                  }}
                >
                  {/* Employee ID */}
                  <div
                    className="absolute text-[#111111]"
                    style={{
                      top: `${positions.idTop - 20}px`,
                      left: `${positions.idLeft}px`
                    }}
                  >
                    <span style={{ fontSize: `${fontSizes.idLabel}pt`, fontFamily: 'Acumin Pro', display: 'inline-block',
                      transform: 'scaleY(1.1)',
                      transformOrigin: 'bottom'
                      }}>Mã số / ID:</span>{' '}
                    <span style={{ fontSize: `${fontSizes.idValue}pt`, fontFamily: 'Acumin Pro', fontWeight: 'bold', position: 'relative', top: '0.5px', display: 'inline-block',
                      transform: 'scaleY(1.1)',
                      transformOrigin: 'bottom' }}>
                      {employee.ma_nhan_vien}
                    </span>
                  </div>

                  {/* Name label */}
                  <div
                    className="absolute"
                    style={{
                      top: `${positions.nameTop - 20}px`,
                      left: `${positions.nameLeft}px`
                    }}
                  >
                    <span
                      style={{
                        fontSize: `${fontSizes.nameLabel}pt`,
                        fontFamily: 'Acumin Pro',
                        color: '#111111',
                        display: 'inline-block',
                        transform: 'scaleY(1.1)',
                        transformOrigin: 'bottom'
                      }}
                    >
                      Họ và tên / Full name:
                    </span>
                  </div>

                  {/* Name value */}
                  <div
                    className="absolute text-[#ed3235]"
                    style={{
                      fontSize: `${fontSizes.name}pt`,
                      fontWeight: 'bold',
                      fontFamily: 'Acumin Pro',
                      top: `${positions.nameTop}px`,
                      left: `${positions.nameLeft}px`,
                      display: 'inline-block',
                      transform: 'scaleY(1.2)',
                      transformOrigin: 'bottom'
                    }}
                  >
                    {employee.ho_va_ten}
                  </div>

                  {/* Academic label */}
                  <div
                    className="absolute"
                    style={{
                      top: `${positions.academicTop - 6}px`,
                      left: `${positions.academicLeft}px`
                    }}
                  >
                    <span
                      style={{
                        fontSize: `${fontSizes.academicLabel}pt`,
                        fontFamily: 'Acumin Pro',
                        color: '#111111',
                        display: 'inline-block',
                        transform: 'scaleY(1.1)',
                        transformOrigin: 'bottom'
                      }}
                    >
                      HH & HV /
                      <span style={{ fontSize: `${fontSizes.academicLabel * 0.85}pt` }}>
                        {' '}Academic title:
                      </span>
                    </span>
                  </div>

                  {/* Academic value (DB) */}
                  <div
                    className="absolute text-[#111111]"
                    style={{
                      fontSize: `${fontSizes.academic}pt`,
                      top: `${positions.academicTop + 12}px`,
                      left: `${positions.academicLeft}px`,
                      fontWeight: '600',
                      fontFamily: 'Acumin Pro',
                      display: 'inline-block',
                      transform: 'scaleY(1.1)',
                      transformOrigin: 'bottom'
                    }}
                  >
                    {employee.hoc_ham || '--'}
                  </div>

                  {/* Position label */}
                  <div
                    className="absolute absolute text-[#111111]"
                    style={{
                      top: `${positions.positionTop + 7}px`,
                      left: `${positions.positionLeft}px`
                    }}
                  >
                    <span
                      style={{
                        fontSize: `${fontSizes.positionLabel}pt`,
                        fontFamily: 'Acumin Pro',
                        color: '#111111',
                        display: 'inline-block',
                        transform: 'scaleY(1.1)',
                        transformOrigin: 'bottom'
                      }}
                    >
                      Chức vụ /
                      <span style={{ fontSize: `${fontSizes.positionLabel * 0.85}pt` }}>
                        {' '}Position:
                      </span>
                    </span>
                  </div>

                  {/* Position value (DB) */}
                  <div
                    className="absolute text-[#111111]"
                    style={{
                      fontSize: `${fontSizes.position}pt`,
                      top: `${positions.positionTop + 25}px`,
                      left: `${positions.positionLeft}px`,
                      display: 'inline-block',
                      transform: 'scaleY(1.1)',
                      transformOrigin: 'bottom',
                      fontWeight: '600',
                      fontFamily: 'Acumin Pro'
                    }}
                  >
                    {employee.ten_cong_viec || '--'}
                  </div>

                  {/* Unit label */}
                  <div
                    className="absolute text-[#111111]"
                    style={{
                      top: `${positions.unitTop + 8}px`,
                      left: `${positions.unitLeft}px`
                    }}
                  >
                    <span
                      style={{
                        fontSize: `${fontSizes.unitLabel}pt`,
                        fontFamily: 'Acumin Pro',
                        color: '#111111',
                        display: 'inline-block',
                        transform: 'scaleY(1.1)',
                        transformOrigin: 'bottom',
                      }}
                    >
                      Đơn vị /
                      <span style={{ fontSize: `${fontSizes.unitLabel * 0.85}pt` }}>
                        {' '}Department:
                      </span>
                    </span>
                  </div>

                  {/* Unit value (DB) */}
                  <div
                    className="absolute text-[#111111]"
                    style={{
                      fontSize: `${fontSizes.unit}pt`,
                      top: `${positions.unitTop + 25}px`,
                      left: `${positions.unitLeft}px`,
                      fontWeight: '600',
                      fontFamily: 'Acumin Pro',
                      display: 'inline-block',
                      transform: 'scaleY(1.1)'
                    }}
                  >
                    {employee.ten_don_vi || '--'}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div
            className={cn(
              "flex justify-center gap-2 w-full no-print",
              !isStacked && "mt-auto"
            )}
          >
            <Button
              variant="flat"
              color="primary"
              className="font-bold h-12"
              startContent={<Download size={18} />}
              onClick={handleDownloadPDF}
            >
              PDF
            </Button>

            <Button
              color="primary"
              className="font-bold h-12 shadow-lg shadow-blue-500/20"
              startContent={<Printer size={18} />}
              onClick={() => handlePrint()}
            >
              In thẻ
            </Button>
          </div>
        </div>
      </div>

      {/* Cột 2: Hình ảnh, thông tin trong thẻ */}
      <div className="flex-1 p-6 overflow-y-auto custom-scrollbar space-y-8 no-print bg-white dark:bg-gray-800">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold text-blue-500 uppercase flex items-center gap-2">
              <Camera size={16} />
              Ảnh & Thông tin nền
            </h4>

            <Button
              size="sm"
              variant="flat"
              color="danger"
              className="font-semibold"
              startContent={<RefreshCw size={14} />}
              onClick={handleReset}
            >
              Reset
            </Button>
          </div>
          <div className="flex items-center gap-4 p-4 bg-blue-50/30 dark:bg-blue-900/10 rounded-2xl border border-blue-100/50 dark:border-blue-800/20">
            <div className="w-16 h-20 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden shrink-0 shadow-sm">
              {employee.avatar ? (
                <img src={employee.avatar} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-300">
                  <User size={24} />
                </div>
              )}
            </div>
            <div className="flex-1 space-y-3">
              <p className="text-[11px] text-gray-500 dark:text-gray-400">
                Thay đổi ảnh hồ sơ trên thẻ nhân viên.
              </p>
              <Button
                variant="solid"
                color="primary"
                size="sm"
                className="font-bold rounded-lg"
                startContent={<Upload size={16} />}
                onClick={() => fileInputRef.current?.click()}
              >
                Chọn ảnh mới
              </Button>
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={handleFileChange}
              />
            </div>
          </div>
        </div>

        <Divider />

        <div className="space-y-4">
          <h4 className="text-sm font-bold text-blue-500 uppercase flex items-center gap-2">
            <Type size={16} /> Nội dung văn bản & Cỡ chữ
          </h4>

          <div className="space-y-5">
            <div className="p-4 bg-gray-50/50 dark:bg-gray-900/50 rounded-2xl border border-gray-100 dark:border-gray-800 space-y-4">
              <Input
                label="Họ và tên"
                value={employee.ho_va_ten}
                onValueChange={(val) => setEmployee((prev) => ({ ...prev, ho_va_ten: val }))}
                variant="bordered"
              />
              <div className="space-y-2">
                <div className="flex justify-between items-center text-[10px] font-bold text-gray-400 uppercase">
                  <span>Cỡ chữ:</span> <span>{fontSizes.name}pt</span>
                </div>
                <Slider
                  step={0.1}
                  maxValue={24}
                  minValue={8}
                  value={fontSizes.name}
                  onChange={(val) => setFontSizes((prev) => ({ ...prev, name: val as number }))}
                  size="sm"
                  color="primary"
                />
              </div>
            </div>

            {[
              {
                key: 'hoc_ham',
                label: 'Học hàm',
                fontKey: 'academic',
                labelFontKey: 'academicLabel'
              },
              {
                key: 'ten_cong_viec',
                label: 'Chức vụ',
                fontKey: 'position',
                labelFontKey: 'positionLabel'
              },
              { key: 'ten_don_vi', label: 'Đơn vị', fontKey: 'unit', labelFontKey: 'unitLabel' }
            ].map((item) => (
              <div
                key={item.key}
                className="p-4 bg-gray-50/50 dark:bg-gray-900/50 rounded-2xl border border-gray-100 dark:border-gray-800 space-y-5"
              >
                <Input
                  label={item.label}
                  value={employee[item.key as keyof typeof employee]}
                  onValueChange={(val) => setEmployee((prev) => ({ ...prev, [item.key]: val }))}
                  variant="bordered"
                  size="sm"
                />
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-[10px] font-bold text-gray-400 uppercase">
                      <span>Tiêu đề ({item.label}):</span>{' '}
                      <span>{fontSizes[item.labelFontKey as keyof typeof fontSizes]}pt</span>
                    </div>
                    <Slider
                      step={0.1}
                      maxValue={24}
                      minValue={4}
                      value={fontSizes[item.labelFontKey as keyof typeof fontSizes]}
                      onChange={(val) =>
                        setFontSizes((prev) => ({ ...prev, [item.labelFontKey]: val as number }))
                      }
                      size="sm"
                      color="primary"
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-[10px] font-bold text-gray-400 uppercase">
                      <span>Nội dung:</span>{' '}
                      <span>{fontSizes[item.fontKey as keyof typeof fontSizes]}pt</span>
                    </div>
                    <Slider
                      step={0.1}
                      maxValue={24}
                      minValue={4}
                      value={fontSizes[item.fontKey as keyof typeof fontSizes]}
                      onChange={(val) =>
                        setFontSizes((prev) => ({ ...prev, [item.fontKey]: val as number }))
                      }
                      size="sm"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
          <Divider />

          <div className="space-y-4">
            <h4 className="text-sm font-bold text-blue-500 uppercase flex-col items-start gap-1">
              <div className="flex items-center gap-2">
                <RefreshCw size={16} /> Vị trí & Khoảng cách khối nội dung
              </div>
            </h4>

            <div className="p-4 bg-gray-50/50 dark:bg-gray-900/50 rounded-2xl border border-gray-100 dark:border-gray-800 space-y-6">
              <div className="space-y-2">
                <div className="flex justify-between text-[10px] text-gray-400 font-bold uppercase">
                  <span>Khoảng cách với Ảnh (Margin Left):</span>{' '}
                  <span>{positions.infoLeft}px</span>
                </div>
                <Slider
                  step={0.1}
                  maxValue={50}
                  minValue={0}
                  value={positions.infoLeft}
                  onChange={(val) => setPositions((prev) => ({ ...prev, infoLeft: val as number }))}
                  size="sm"
                  color="primary"
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-[10px] text-gray-400 font-bold uppercase">
                  <span>Padding Left (Thụt lề nội dung):</span>{' '}
                  <span>{positions.infoPaddingLeft}px</span>
                </div>
                <Slider
                  step={1}
                  maxValue={50}
                  minValue={0}
                  value={positions.infoPaddingLeft}
                  onChange={(val) =>
                    setPositions((prev) => ({ ...prev, infoPaddingLeft: val as number }))
                  }
                  size="sm"
                  color="primary"
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-[10px] text-gray-400 font-bold uppercase">
                  <span>Căn lề trên (Margin Top):</span> <span>{positions.infoTop}px</span>
                </div>
                <Slider
                  step={1}
                  maxValue={50}
                  minValue={-50}
                  value={positions.infoTop}
                  onChange={(val) => setPositions((prev) => ({ ...prev, infoTop: val as number }))}
                  size="sm"
                  color="primary"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}