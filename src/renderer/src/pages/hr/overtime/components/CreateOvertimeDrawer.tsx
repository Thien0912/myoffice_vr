import { useEffect } from 'react'
import { HrDrawer } from '@renderer/components/hero-custom/HrDrawer'
import OvertimeCalendarCore from './OvertimeCalendarCore'

interface CreateOvertimeDrawerProps {
  isOpen: boolean
  initialAutoOpenForm?: boolean
  onClose: () => void
  onSuccess?: () => void
}

export default function CreateOvertimeDrawer({
  isOpen,
  initialAutoOpenForm,
  onClose,
  onSuccess
}: CreateOvertimeDrawerProps) {
  // ESC key handler
  useEffect(() => {
    if (!isOpen) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [isOpen, onClose])

  const DEFAULT_WIDTH = typeof window !== 'undefined' ? Math.min(window.innerWidth * 0.9, 1400) : 1200

  return (
    <HrDrawer
      isOpen={isOpen}
      onClose={onClose}
      resizable
      defaultWidth={DEFAULT_WIDTH}
      minWidth={1200}
      maxWidth={window.innerWidth}
      classNames={{ base: '!rounded-tl-4xl !rounded-bl-4xl' }}
    >
      <OvertimeCalendarCore
        variant="drawer"
        onClose={onClose}
        initialAutoOpenForm={initialAutoOpenForm}
        onSuccess={onSuccess}
        isActive={isOpen}
      />
    </HrDrawer>
  )
}
