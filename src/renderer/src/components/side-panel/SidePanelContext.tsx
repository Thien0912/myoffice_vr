import { createContext, useContext, useState, useCallback, useRef, type ReactNode, type MutableRefObject } from 'react'

interface SidePanelConfig {
  title: string
  content: ReactNode
  onSubmit?: (id: string | number | undefined, formData: FormData) => Promise<any>
  onSubmitSuccess?: (data: any) => void
  formData?: Record<string, any>
  fileGroups?: Record<string, File[]>
  idSubmitApi?: string | number
}

interface SidePanelContextType {
  isOpen: boolean
  isOverlay: boolean
  bridgedToDrawer: boolean
  config: SidePanelConfig | null
  panelWidth: number
  setPanelWidth: (width: number | ((prev: number) => number)) => void
  setIsOverlay: (overlay: boolean) => void
  setBridgedToDrawer: (bridged: boolean) => void
  openPanel: (config: SidePanelConfig) => void
  closePanel: () => void
  updateFormData: (data: Record<string, any>) => void
  updateFileGroups: (groups: Record<string, File[]>) => void
  formDataRef: MutableRefObject<Record<string, any>>
  fileGroupsRef: MutableRefObject<Record<string, File[]>>
}

const SidePanelContext = createContext<SidePanelContextType | null>(null)

export function SidePanelProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)
  const [isOverlay, setIsOverlay] = useState(false)
  const [bridgedToDrawer, setBridgedToDrawer] = useState(false)
  const [config, setConfig] = useState<SidePanelConfig | null>(null)
  const [panelWidth, setPanelWidth] = useState(480)
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const formDataRef = useRef<Record<string, any>>({})
  const fileGroupsRef = useRef<Record<string, File[]>>({})

  const openPanel = useCallback((newConfig: SidePanelConfig) => {
    // Cancel any pending close timer to prevent race condition
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current)
      closeTimerRef.current = null
    }
    // Initialize refs from config
    formDataRef.current = newConfig.formData ?? {}
    fileGroupsRef.current = newConfig.fileGroups ?? {}
    setConfig(newConfig)
    setIsOpen(true)
  }, [])

  const closePanel = useCallback(() => {
    setIsOpen(false)
    closeTimerRef.current = setTimeout(() => {
      setConfig(null)
      formDataRef.current = {}
      fileGroupsRef.current = {}
      closeTimerRef.current = null
    }, 300)
  }, [])

  // Use refs to avoid re-rendering panel content
  const updateFormData = useCallback((data: Record<string, any>) => {
    formDataRef.current = data
  }, [])

  const updateFileGroups = useCallback((groups: Record<string, File[]>) => {
    fileGroupsRef.current = groups
  }, [])

  return (
    <SidePanelContext.Provider value={{ isOpen, isOverlay, bridgedToDrawer, config, panelWidth, setPanelWidth, setIsOverlay, setBridgedToDrawer, openPanel, closePanel, updateFormData, updateFileGroups, formDataRef, fileGroupsRef }}>
      {children}
    </SidePanelContext.Provider>
  )
}

export function useSidePanel() {
  const ctx = useContext(SidePanelContext)
  if (!ctx) throw new Error('useSidePanel must be used within SidePanelProvider')
  return ctx
}
