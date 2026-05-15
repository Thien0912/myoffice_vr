import { useState, useRef, useEffect, useCallback } from 'react'
import { Button, cn, Modal } from '@heroui-v3/react'
import { Check } from 'lucide-react'

interface ColorPickerModalProps {
  isOpen: boolean
  onClose: () => void
  onSelectColor: (colorHex: string) => void
}

export function ColorPickerModal({ isOpen, onClose, onSelectColor }: ColorPickerModalProps) {
  const [hue, setHue] = useState(50) // 0-360
  const [saturation, setSaturation] = useState(100) // 0-100
  const [brightness, setBrightness] = useState(50) // 0-100
  const [isDragging, setIsDragging] = useState(false)
  const gradientRef = useRef<HTMLDivElement>(null)

  // Convert HSV to Hex
  const hsvToHex = useCallback((h: number, s: number, v: number) => {
    s /= 100
    v /= 100
    const c = v * s
    const x = c * (1 - Math.abs(((h / 60) % 2) - 1))
    const m = v - c
    let r = 0, g = 0, b = 0

    if (h >= 0 && h < 60) { r = c; g = x; b = 0 }
    else if (h >= 60 && h < 120) { r = x; g = c; b = 0 }
    else if (h >= 120 && h < 180) { r = 0; g = c; b = x }
    else if (h >= 180 && h < 240) { r = 0; g = x; b = c }
    else if (h >= 240 && h < 300) { r = x; g = 0; b = c }
    else { r = c; g = 0; b = x }

    const toHex = (n: number) => {
      const hex = Math.round((n + m) * 255).toString(16)
      return hex.length === 1 ? '0' + hex : hex
    }

    return `#${toHex(r)}${toHex(g)}${toHex(b)}`
  }, [])

  const currentColor = hsvToHex(hue, saturation, brightness)

  const updateFromPosition = useCallback((clientX: number, clientY: number) => {
    if (!gradientRef.current) return
    const rect = gradientRef.current.getBoundingClientRect()
    const x = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width))
    const y = Math.max(0, Math.min(1, (clientY - rect.top) / rect.height))
    setSaturation(Math.round(x * 100))
    setBrightness(Math.round((1 - y) * 100))
  }, [])

  const handleGradientClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    updateFromPosition(e.clientX, e.clientY)
  }, [updateFromPosition])

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging) return
    e.preventDefault()
    updateFromPosition(e.clientX, e.clientY)
  }, [isDragging, updateFromPosition])

  const handleMouseUp = useCallback(() => {
    setIsDragging(false)
  }, [])

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove)
      window.addEventListener('mouseup', handleMouseUp)
      return () => {
        window.removeEventListener('mousemove', handleMouseMove)
        window.removeEventListener('mouseup', handleMouseUp)
      }
    }
  }, [isDragging, handleMouseMove, handleMouseUp])

  const handleApply = useCallback(() => {
    const finalColor = hsvToHex(hue, saturation, brightness)
    if (onSelectColor) {
      onSelectColor(finalColor)
    }
    onClose()
  }, [hsvToHex, hue, saturation, brightness, onSelectColor, onClose])

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setHue(50)
      setSaturation(100)
      setBrightness(50)
      setIsDragging(false)
    }
  }, [isOpen])

  return (
    <Modal.Backdrop isOpen={isOpen} onOpenChange={onClose}>
      <Modal.Container size="sm" placement="center" className="max-w-sm! w-full">
        <Modal.Dialog className="rounded-2xl! overflow-hidden shadow-[0_24px_48px_-12px_rgba(25,28,29,0.15)] p-0">
          <Modal.Header className="px-5 py-4! border-b-0">
            <Modal.Heading className="text-lg font-semibold">Chọn màu tùy chỉnh</Modal.Heading>
          </Modal.Header>
          
          <Modal.Body className="py-4 px-5!">
            <div className="space-y-4">
              {/* Gradient picker */}
              <div
                ref={gradientRef}
                className="relative w-full h-48 rounded-xl cursor-crosshair overflow-hidden select-none"
                style={{
                  background: `linear-gradient(to top, #000, transparent), linear-gradient(to right, #fff, hsl(${hue}, 100%, 50%))`
                }}
                onClick={handleGradientClick}
                onMouseDown={() => setIsDragging(true)}
              >
                {/* Selection circle */}
                <div
                  className="absolute w-5 h-5 -ml-2.5 -mt-2.5 rounded-full border-2 border-white shadow-md pointer-events-none"
                  style={{
                    left: `${saturation}%`,
                    top: `${100 - brightness}%`,
                    backgroundColor: currentColor
                  }}
                />
              </div>

              {/* Hue slider */}
              <div className="space-y-2">
                <div className="text-sm text-gray-600">Màu sắc</div>
                <div
                  className="relative w-full h-4 rounded-full cursor-pointer select-none"
                  style={{
                    background: 'linear-gradient(to right, #ff0000, #ffff00, #00ff00, #00ffff, #0000ff, #ff00ff, #ff0000)'
                  }}
                  onClick={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect()
                    const x = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width))
                    setHue(Math.round(x * 360))
                  }}
                >
                  <div
                    className="absolute top-0 w-4 h-4 -mt-0 rounded-full border-2 border-white shadow-md"
                    style={{
                      left: `calc(${(hue / 360) * 100}% - 8px)`,
                      backgroundColor: `hsl(${hue}, 100%, 50%)`
                    }}
                  />
                </div>
              </div>

              {/* Color preview */}
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                <div
                  className="w-10 h-10 rounded-lg shadow-sm border border-gray-200"
                  style={{ backgroundColor: currentColor }}
                />
                <div className="flex-1">
                  <div className="text-sm font-medium text-gray-700">Màu đã chọn</div>
                  <div className="text-xs text-gray-500 uppercase font-mono">{currentColor}</div>
                </div>
              </div>
            </div>
          </Modal.Body>

          <Modal.Footer className="px-5 py-4! border-t border-gray-100">
            <div className="flex items-center gap-2 w-full justify-end">
              <button
                type="button"
                className="h-10 px-5 bg-gray-100 hover:bg-gray-200 active:bg-gray-300 text-gray-700 font-semibold rounded-2xl transition-all duration-250 border-none"
                onClick={onClose}
              >
                Hủy
              </button>
              <button
                type="button"
                className="h-10 px-5 bg-[#C2E7FF] hover:bg-[#b5dffa] active:bg-[#99c8e8] text-[#001D35] font-semibold rounded-2xl transition-all duration-250 border-none flex items-center gap-2"
                onClick={handleApply}
              >
                <Check size={16} />
                Áp dụng
              </button>
            </div>
          </Modal.Footer>
        </Modal.Dialog>
      </Modal.Container>
    </Modal.Backdrop>
  )
}

export default ColorPickerModal
