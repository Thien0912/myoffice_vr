import React, { useCallback, useState } from 'react'
import Cropper from 'react-easy-crop'

interface AvatarCropperProps {
  src?: string
  onChange: (dataUrl: string) => void
  aspect?: number
  className?: string
}

function getCroppedImg(
  imageSrc: string,
  pixelCrop: { x: number; y: number; width: number; height: number }
): Promise<string> {
  return new Promise((resolve, reject) => {
    const image = new Image()
    image.crossOrigin = 'anonymous'
    image.src = imageSrc
    image.onload = () => {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      if (!ctx) {
        reject(new Error('Canvas context not available'))
        return
      }
      canvas.width = pixelCrop.width
      canvas.height = pixelCrop.height
      ctx.drawImage(
        image,
        pixelCrop.x,
        pixelCrop.y,
        pixelCrop.width,
        pixelCrop.height,
        0,
        0,
        pixelCrop.width,
        pixelCrop.height
      )
      resolve(canvas.toDataURL('image/png'))
    }
    image.onerror = (e) => reject(e)
  })
}

export const AvatarCropper: React.FC<AvatarCropperProps> = ({
  src,
  onChange,
  aspect = 1,
  className
}) => {
  const [imageSrc, setImageSrc] = useState<string | undefined>(src)
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [isDragging, setIsDragging] = useState(false)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<{
    x: number
    y: number
    width: number
    height: number
  } | null>(null)
  const fileInputRef = React.useRef<HTMLInputElement>(null)

  // Update imageSrc when src prop changes
  React.useEffect(() => {
    if (src) {
      setImageSrc(src)
    }
  }, [src])

  const onFileSelect = useCallback((file?: File) => {
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => setImageSrc(reader.result as string)
    reader.readAsDataURL(file)
  }, [])

  const onCropComplete = useCallback(
    (_croppedArea: any, croppedPixels: { x: number; y: number; width: number; height: number }) => {
      setCroppedAreaPixels(croppedPixels)
    },
    []
  )

  const handleSave = useCallback(async () => {
    if (!imageSrc || !croppedAreaPixels) return
    try {
      const dataUrl = await getCroppedImg(imageSrc, croppedAreaPixels)
      onChange(dataUrl)
    } catch (e) {
      console.error(e)
    }
  }, [imageSrc, croppedAreaPixels, onChange])

  return (
    <div className={className}>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => onFileSelect(e.target.files?.[0])}
      />

      {imageSrc ? (
        <div
          className="relative w-full bg-gray-900 rounded-lg overflow-hidden"
          style={{ aspectRatio: '1' }}
        >
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            cropSize={{ width: 380, height: 380 }}
            cropShape="round"
            showGrid={isDragging}
            objectFit="horizontal-cover"
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={onCropComplete}
            onInteractionStart={() => setIsDragging(true)}
            onInteractionEnd={() => setIsDragging(false)}
          />
        </div>
      ) : (
        <div
          className="relative group w-full bg-gray-900 rounded-lg flex items-center justify-center text-gray-400 text-xs"
          style={{ aspectRatio: '1' }}
        >
          <span>Chưa có ảnh</span>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="absolute inset-0 flex items-center justify-center rounded-lg bg-black/40 text-white text-sm opacity-0 group-hover:opacity-100 transition-opacity"
            title="Tải ảnh lên"
          >
            Tải ảnh lên
          </button>
        </div>
      )}

      <div className="flex items-center justify-between mt-4">
        <div className="flex items-center gap-3 flex-1">
          <span className="text-xs text-gray-500 whitespace-nowrap">Zoom</span>
          <input
            type="range"
            min={1}
            max={3}
            step={0.1}
            value={zoom}
            onChange={(e) => setZoom(Number(e.target.value))}
            className="flex-1 accent-blue-600"
          />
        </div>
        <button
          type="button"
          onClick={handleSave}
          className="ml-4 px-5 py-2 cursor-pointer rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium transition-colors"
        >
          Lưu ảnh
        </button>
      </div>
    </div>
  )
}

export default AvatarCropper
