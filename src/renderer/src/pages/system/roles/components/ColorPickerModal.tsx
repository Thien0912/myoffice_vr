import { useState, useRef, useEffect, useCallback } from 'react'
import { Button, cn, Modal } from '@heroui-v3/react'
import { Check } from 'lucide-react'

interface ColorPickerModalProps {
  isOpen: boolean
  onClose: () => void
  onSelectColor: (colorHex: string) => void
}

export function ColorPickerModal({ isOpen, onClose, onSelectColor }: ColorPickerModalProps) {
  const [hue, setHue] = useState(50)
  const [saturation, setSaturation] = useState(100)
  const [brightness, setBrightness] = useState(50)
  const [isDragging, setIsDragging] = useState(false)
  const gradientRef = useRef<HTMLDivElement>(null)

  // 👉 NEW: hex input state
  const [hexInput, setHexInput] = useState('#ffcc00')

  // HSV → HEX
  const hsvToHex = useCallback((h: number, s: number, v: number) => {
    s /= 100
    v /= 100
    const c = v * s
    const x = c * (1 - Math.abs(((h / 60) % 2) - 1))
    const m = v - c
    let r = 0, g = 0, b = 0

    if (h < 60) [r, g, b] = [c, x, 0]
    else if (h < 120) [r, g, b] = [x, c, 0]
    else if (h < 180) [r, g, b] = [0, c, x]
    else if (h < 240) [r, g, b] = [0, x, c]
    else if (h < 300) [r, g, b] = [x, 0, c]
    else [r, g, b] = [c, 0, x]

    const toHex = (n: number) => {
      const hex = Math.round((n + m) * 255).toString(16)
      return hex.length === 1 ? '0' + hex : hex
    }

    return `#${toHex(r)}${toHex(g)}${toHex(b)}`
  }, [])

  // 👉 NEW: HEX → HSV
  const hexToHsv = (hex: string) => {
    const cleaned = hex.replace('#', '')
    if (cleaned.length !== 6) return null

    const r = parseInt(cleaned.substring(0, 2), 16) / 255
    const g = parseInt(cleaned.substring(2, 4), 16) / 255
    const b = parseInt(cleaned.substring(4, 6), 16) / 255

    const max = Math.max(r, g, b)
    const min = Math.min(r, g, b)
    const d = max - min

    let h = 0
    if (d !== 0) {
      if (max === r) h = ((g - b) / d) % 6
      else if (max === g) h = (b - r) / d + 2
      else h = (r - g) / d + 4
      h *= 60
      if (h < 0) h += 360
    }

    const s = max === 0 ? 0 : d / max
    const v = max

    return {
      h: Math.round(h),
      s: Math.round(s * 100),
      v: Math.round(v * 100)
    }
  }

  const currentColor = hsvToHex(hue, saturation, brightness)

  // 👉 sync khi kéo màu
  useEffect(() => {
    setHexInput(currentColor)
  }, [currentColor])

  const updateFromPosition = useCallback((clientX: number, clientY: number) => {
    if (!gradientRef.current) return
    const rect = gradientRef.current.getBoundingClientRect()
    const x = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width))
    const y = Math.max(0, Math.min(1, (clientY - rect.top) / rect.height))
    setSaturation(Math.round(x * 100))
    setBrightness(Math.round((1 - y) * 100))
  }, [])

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging) return
    updateFromPosition(e.clientX, e.clientY)
  }, [isDragging, updateFromPosition])

  const handleMouseUp = useCallback(() => setIsDragging(false), [])

  useEffect(() => {
    if (!isDragging) return

    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isDragging, handleMouseMove, handleMouseUp])

  const handleApply = useCallback(() => {
    onSelectColor(currentColor)
    onClose()
  }, [currentColor, onSelectColor, onClose])

  return (
    <Modal.Backdrop isOpen={isOpen} onOpenChange={onClose}>
      <Modal.Container size="sm" placement="center" className="max-w-sm! w-full">
        <Modal.Dialog className="rounded-2xl! overflow-hidden p-0">
          <Modal.Header className="px-5 py-4!">
            <Modal.Heading className="text-lg font-semibold">Chọn màu</Modal.Heading>
          </Modal.Header>

          <Modal.Body className="py-4 px-5! space-y-4">
            {/* Gradient */}
            <div
              ref={gradientRef}
              className="relative w-full h-48 rounded-xl cursor-crosshair"
              style={{
                background: `linear-gradient(to top, #000, transparent), linear-gradient(to right, #fff, hsl(${hue}, 100%, 50%))`
              }}
              onMouseDown={(e) => {
                setIsDragging(true)
                updateFromPosition(e.clientX, e.clientY)
              }}
            >
              <div
                className="absolute w-5 h-5 -ml-2.5 -mt-2.5 rounded-full border-2 border-white"
                style={{
                  left: `${saturation}%`,
                  top: `${100 - brightness}%`,
                  backgroundColor: currentColor
                }}
              />
            </div>

            {/* Hue */}
            <div
              className="h-4 rounded-full cursor-pointer"
              style={{
                background: 'linear-gradient(to right, red, yellow, lime, cyan, blue, magenta, red)'
              }}
              onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect()
                const x = (e.clientX - rect.left) / rect.width
                setHue(Math.round(x * 360))
              }}
            />

            {/* 👉 INPUT HEX */}
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
              <div
                className="w-10 h-10 rounded-lg border"
                style={{ backgroundColor: currentColor }}
              />

              <input
                value={hexInput}
                onChange={(e) => {
                  let val = e.target.value
                  setHexInput(val)

                  if (!val.startsWith('#')) val = '#' + val

                  if (/^#[0-9A-Fa-f]{6}$/.test(val)) {
                    const hsv = hexToHsv(val)
                    if (hsv) {
                      setHue(hsv.h)
                      setSaturation(hsv.s)
                      setBrightness(hsv.v)
                    }
                  }
                }}
                className="flex-1 text-xs font-mono px-2 py-1 border rounded-md"
                placeholder="#FFFFFF"
              />
            </div>
          </Modal.Body>

          <Modal.Footer className="px-5 py-4!">
            <div className="flex justify-between w-full">
              <button onClick={onClose}>Hủy</button>
              <button onClick={handleApply}>
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