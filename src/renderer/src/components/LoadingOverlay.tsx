import { Spinner } from '@heroui-v3/react'

type LoadingOverlayProps = {
  visible?: boolean
}

export default function LoadingOverlay({ visible = false }: LoadingOverlayProps) {
  if (!visible) return null

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-white/40 backdrop-blur-sm">
      <Spinner size="lg" />
    </div>
  )
}
