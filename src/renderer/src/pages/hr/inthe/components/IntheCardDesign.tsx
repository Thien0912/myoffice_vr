import { useState, useRef, useEffect } from 'react'
import { Button, Input, Slider, Divider, cn } from '@heroui/react'
import { QRCodeSVG } from 'qrcode.react'
import { Printer, RefreshCw, Type, User, Download, Upload, Camera, CreditCard } from 'lucide-react'
import domtoimage from 'dom-to-image'
import { jsPDF } from 'jspdf'
import { useReactToPrint } from 'react-to-print'
import bgCard from '@renderer/assets/images/idcard/id card nhan vien ver 5_Folder/id card nhan vien ver 5-03.png'
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
    id: 9,
    name: 12,
    academicLabel: 9.3,
    academic: 9.3,
    positionLabel: 9.3,
    position: 9.3,
    unitLabel: 9.3,
    unit: 9.3
  })

  // Position offsets (in px or %)
  const [positions, setPositions] = useState({
    qrTop: 2,
    qrRight: 1.67,
    qrSize: 45.03,
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
      id: 9,
      name: 12,
      academicLabel: 9.3,
      academic: 9.3,
      positionLabel: 9.3,
      position: 9.3,
      unitLabel: 9.3,
      unit: 9.3
    })
    setPositions({
      qrTop: 2,
      qrRight: 1.67,
      qrSize: 45.03,
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

        <div className="flex flex-col items-center gap-6 lg:gap-10">
          <div className="flex justify-center items-center p-4 lg:p-8 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-none no-print w-full overflow-x-auto custom-scrollbar">
            <div
              ref={cardRef}
              className="relative shadow-2xl overflow-hidden print-area bg-white shrink-0"
              style={{
                width: '84.68mm',
                height: '53.2mm'
              }}
            >
              <img
                src={bgCard}
                alt="Card Background"
                className="absolute inset-0 w-full h-full object-cover z-0"
              />

              <div
                className="absolute w-[18%] h-[28%] z-10 flex justify-center items-center"
                style={{ top: `${positions.qrTop}%`, right: `${positions.qrRight}%` }}
              >
                <QRCodeSVG
                  value={`https://myoffice.nctu.edu.vn/profile/code/${employee.ma_nhan_vien}`}
                  size={positions.qrSize}
                  fgColor="#005b9f"
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
                  className="w-[79px] h-[105px] bg-white border border-gray-100 overflow-hidden shrink-0"
                  style={{ marginTop: `${positions.avatarTop}px` }}
                >
                  {employee.avatar ? (
                    <img src={employee.avatar} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-300">
                      <User size={40} />
                    </div>
                  )}
                </div>

                {/* Info Area */}
                <div
                  className="flex-1 relative bg-white"
                  style={{
                    marginLeft: `${positions.infoLeft}px`,
                    marginTop: `${positions.infoTop}px`,
                    paddingLeft: `${positions.infoPaddingLeft}px`
                  }}
                >
                  {/* Employee ID */}
                  <div
                    className="absolute font-semibold text-gray-800"
                    style={{
                      fontSize: `${fontSizes.id * 1.33}px`,
                      top: `${positions.idTop}px`,
                      left: `${positions.idLeft}px`
                    }}
                  >
                    ID: {employee.ma_nhan_vien}
                  </div>
                  {/* Name */}
                  <div
                    className="absolute font-semibold text-[#ee3235]"
                    style={{
                      fontSize: `${fontSizes.name * 1.33}px`,
                      lineHeight: 1.1,
                      top: `${positions.nameTop}px`,
                      left: `${positions.nameLeft}px`
                    }}
                  >
                    {employee.ho_va_ten}
                  </div>

                  {/* Academic Title */}
                  <div
                    className="absolute flex items-center gap-1"
                    style={{
                      top: `${positions.academicTop}px`,
                      left: `${positions.academicLeft}px`
                    }}
                  >
                    <span
                      className="text-gray-700 font-normal whitespace-nowrap"
                      style={{
                        fontSize: `${fontSizes.academicLabel * 1.33}px`,
                        lineHeight: 1.1,
                        fontFamily: 'Montserrat'
                      }}
                    >
                      Học hàm:
                    </span>
                    <span
                      className="text-gray-800 font-semibold"
                      style={{ fontSize: `${fontSizes.academic * 1.33}px`, lineHeight: 1.1 }}
                    >
                      {employee.hoc_ham || ''}
                    </span>
                  </div>

                  {/* Position */}
                  <div
                    className="absolute flex flex-col items-start"
                    style={{
                      top: `${positions.positionTop}px`,
                      left: `${positions.positionLeft}px`
                    }}
                  >
                    <span
                      className="text-gray-700 font-normal whitespace-nowrap"
                      style={{
                        fontSize: `${fontSizes.positionLabel * 1.33}px`,
                        lineHeight: 1.1,
                        fontFamily: 'Montserrat'
                      }}
                    >
                      Chức vụ:
                    </span>
                    <span
                      className="text-gray-800 font-semibold"
                      style={{ fontSize: `${fontSizes.position * 1.33}px`, lineHeight: 1.1 }}
                    >
                      {employee.ten_cong_viec || '--'}
                    </span>
                  </div>

                  {/* Unit */}
                  <div
                    className="absolute flex flex-col items-start"
                    style={{ top: `${positions.unitTop}px`, left: `${positions.unitLeft}px` }}
                  >
                    <span
                      className="text-gray-700 font-normal whitespace-nowrap"
                      style={{
                        fontSize: `${fontSizes.unitLabel * 1.33}px`,
                        lineHeight: 1.1,
                        fontFamily: 'Montserrat'
                      }}
                    >
                      Đơn vị:
                    </span>
                    <span
                      className="text-gray-800 font-semibold"
                      style={{ fontSize: `${fontSizes.unit * 1.33}px`, lineHeight: 1.1 }}
                    >
                      {employee.ten_don_vi || '--'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 w-full no-print">
            <Button
              variant="flat"
              color="danger"
              className="font-bold h-12"
              startContent={<RefreshCw size={18} />}
              onClick={handleReset}
            >
              Reset
            </Button>
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
          <h4 className="text-sm font-bold text-blue-500 uppercase flex items-center gap-2">
            <Camera size={16} /> Ảnh & Thông tin nền
          </h4>

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
