import { Button, Card, Checkbox, Tooltip } from '@heroui/react'
import { mapQuanhuyenxaAxios } from '@renderer/api/danhmuc/dtqgtg'
import { HrAutocomplete, HrDateInput, HrInput, HrTextarea } from '@renderer/components/hero-custom'
import { HrGenderInput } from '@renderer/components/hero-custom/HrGenderInput'
import { useContainerWidth } from '@renderer/hooks/useContainerWidth'
import { getAvatarUrl } from '@renderer/utils/urlUtils'
import { ArrowDownUp, Building2, Camera, CreditCard, Globe, GraduationCap, Home, ScanLine, X } from 'lucide-react'
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Controller, useFieldArray, useFormContext, useWatch } from 'react-hook-form'
import type {
  DanToc,
  DonVi,
  NhansuFormData,
  Phuong,
  QuocGia,
  Tinh,
  TonGiao,
  ViTriCongViec
} from './AddNhansuButton'

import { FormCollapse } from './FormCollapse'
import { NfcScanModal } from './NfcScanModal'
import type { NfcPayload } from './NfcScanModal'
import { toast } from '@heroui-v3/react'
import Step3Work from './Step3Work'

// Dedicated NFC Device Constants
const DEDICATED_NFC_WS_URL = 'ws://localhost:5965/ws'
const DEDICATED_NFC_APP_URL =
  (import.meta.env.VITE_NFC_APP_URL as string | undefined) || 'dncscannfc://open'

type DedicatedNfcTone = 'default' | 'success' | 'warning' | 'error'

interface DedicatedNfcHealthState {
  appReachable: boolean
  cameraConnected: boolean
  cameraHealthy: boolean
  cameraMessage: string
  nfcConnected: boolean
  serialPort: string
  scanState: string
  lastEvent: string
  lastLogLine: string
  parsedCccdNumber: string
  availablePorts: string[]
  message: string
}

const DEFAULT_DEDICATED_NFC_HEALTH: DedicatedNfcHealthState = {
  appReachable: false,
  cameraConnected: false,
  cameraHealthy: false,
  cameraMessage: '',
  nfcConnected: false,
  serialPort: '',
  scanState: 'idle',
  lastEvent: '',
  lastLogLine: '',
  parsedCccdNumber: '',
  availablePorts: [],
  message: 'Chưa phát hiện ứng dụng máy quét NFC.'
}

const DEDICATED_NFC_BUTTON_LABELS = {
  default: 'Quét NFC',
  ready: 'Đã kết nối máy quét NFC chuyên dụng',
  cameraProblem: 'Camera đang có vấn đề',
  readingCard: 'Đang đọc thẻ NFC...',
  authenticatingChip: 'Đang xác thực chip CCCD...',
  ocrBusy: 'Camera đang xử lý OCR...',
  scanning: 'Đang quét NFC...',
  timeout: 'Quét lỗi, đặt lại thẻ',
  cameraLost: 'Camera bị mất kết nối',
  readFail: 'Không đọc được chip CCCD',
  readerDisconnected: 'Đầu đọc NFC bị ngắt',
  scanError: 'Quét NFC gặp lỗi',
  waitingChip: 'Đã đọc MRZ, chờ chip CCCD',
  cameraMissing: 'Camera chưa kết nối',
  nfcMissing: 'NFC chưa kết nối'
} as const

const DEDICATED_NFC_MESSAGES = {
  appMissing: 'Chưa phát hiện ứng dụng máy quét NFC.',
  ready: 'Thiết bị chuyên dụng đã sẵn sàng nhận dữ liệu.',
  allDisconnected: 'Ứng dụng đã mở nhưng camera và đầu đọc NFC đều chưa kết nối.',
  cameraMissing: 'Ứng dụng đã mở nhưng camera chưa kết nối.',
  nfcMissing: 'Ứng dụng đã mở nhưng đầu đọc NFC chưa kết nối.',
  cameraProblem: 'Camera đang có vấn đề, hãy kiểm tra lại.',
  cameraLost: 'Camera bị mất kết nối trong lúc quét. Đang thử kết nối lại.',
  scanningNfc: 'Đã nhận thẻ, đang đọc dữ liệu NFC.',
  scanningChip: 'Đã nhận MRZ, đang xác thực chip CCCD.',
  scanningGeneric: 'Thiết bị chuyên dụng đang quét dữ liệu.',
  errorTimeout: 'Quét thất bại do OCR timeout. Hãy đặt lại thẻ và thử lại.',
  errorCameraLost: 'Quét dừng do camera mất kết nối.',
  errorFail: 'Không đọc được chip CCCD. Hãy giữ thẻ ổn định và thử lại.',
  errorDisconnected: 'Đầu đọc NFC bị ngắt kết nối.',
  errorGeneric: 'Quá trình quét gặp lỗi. Hãy thử lại.',
  waitingChip: 'Đã gửi MRZ, đang chờ đọc chip CCCD.',
  done: 'Đã đọc xong dữ liệu từ thiết bị chuyên dụng.'
} as const

const buildDedicatedNfcMessage = (
  state: Pick<
    DedicatedNfcHealthState,
    | 'appReachable'
    | 'cameraConnected'
    | 'cameraHealthy'
    | 'cameraMessage'
    | 'nfcConnected'
    | 'scanState'
    | 'lastEvent'
  >
) => {
  if (!state.appReachable) {
    return DEDICATED_NFC_MESSAGES.appMissing
  }
  if (state.cameraConnected && state.nfcConnected) {
    if (!state.cameraHealthy) {
      return state.lastEvent === 'CAMERA_LOST'
        ? DEDICATED_NFC_MESSAGES.cameraLost
        : state.cameraMessage || DEDICATED_NFC_MESSAGES.cameraProblem
    }
    if (state.scanState === 'scanning') {
      if (state.lastEvent === 'NFC_DETECTED') return DEDICATED_NFC_MESSAGES.scanningNfc
      if (state.lastEvent === 'CARD_DETECTED') return DEDICATED_NFC_MESSAGES.scanningChip
      return DEDICATED_NFC_MESSAGES.scanningGeneric
    }
    if (state.scanState === 'error') {
      if (state.lastEvent === 'OCR_TIMEOUT') return DEDICATED_NFC_MESSAGES.errorTimeout
      if (state.lastEvent === 'CAMERA_LOST') return DEDICATED_NFC_MESSAGES.errorCameraLost
      if (state.lastEvent === 'FAIL') return DEDICATED_NFC_MESSAGES.errorFail
      if (state.lastEvent === 'DISCONNECTED') return DEDICATED_NFC_MESSAGES.errorDisconnected
      return DEDICATED_NFC_MESSAGES.errorGeneric
    }
    if (state.scanState === 'done') {
      if (state.lastEvent === 'OCR_SENT') return DEDICATED_NFC_MESSAGES.waitingChip
      return DEDICATED_NFC_MESSAGES.done
    }
    return DEDICATED_NFC_MESSAGES.ready
  }
  if (!state.cameraConnected && !state.nfcConnected) {
    return DEDICATED_NFC_MESSAGES.allDisconnected
  }
  if (!state.cameraConnected || !state.cameraHealthy) {
    return state.cameraMessage || DEDICATED_NFC_MESSAGES.cameraMissing
  }
  return DEDICATED_NFC_MESSAGES.nfcMissing
}

const getDedicatedNfcUiState = (
  isConnected: boolean,
  health: DedicatedNfcHealthState
): { label: string; tone: DedicatedNfcTone } => {
  if (isConnected) {
    if (!health.cameraHealthy) {
      return { label: DEDICATED_NFC_BUTTON_LABELS.cameraProblem, tone: 'warning' }
    }
    if (health.scanState === 'scanning') {
      if (health.lastEvent === 'NFC_DETECTED')
        return { label: DEDICATED_NFC_BUTTON_LABELS.readingCard, tone: 'success' }
      if (health.lastEvent === 'CARD_DETECTED')
        return { label: DEDICATED_NFC_BUTTON_LABELS.authenticatingChip, tone: 'success' }
      if (health.lastEvent === 'OCR_BUSY')
        return { label: DEDICATED_NFC_BUTTON_LABELS.ocrBusy, tone: 'success' }
      return { label: DEDICATED_NFC_BUTTON_LABELS.scanning, tone: 'success' }
    }
    if (health.scanState === 'error') {
      if (health.lastEvent === 'OCR_TIMEOUT')
        return { label: DEDICATED_NFC_BUTTON_LABELS.timeout, tone: 'warning' }
      if (health.lastEvent === 'CAMERA_LOST')
        return { label: DEDICATED_NFC_BUTTON_LABELS.cameraLost, tone: 'warning' }
      if (health.lastEvent === 'FAIL')
        return { label: DEDICATED_NFC_BUTTON_LABELS.readFail, tone: 'warning' }
      if (health.lastEvent === 'DISCONNECTED')
        return { label: DEDICATED_NFC_BUTTON_LABELS.readerDisconnected, tone: 'warning' }
      return { label: DEDICATED_NFC_BUTTON_LABELS.scanError, tone: 'warning' }
    }
    if (health.scanState === 'done' && health.lastEvent === 'OCR_SENT') {
      return { label: DEDICATED_NFC_BUTTON_LABELS.waitingChip, tone: 'success' }
    }
    if (
      health.scanState === 'done' &&
      health.lastEvent === 'SCAN_DONE' &&
      health.parsedCccdNumber
    ) {
      return { label: `Đã đọc CCCD ${health.parsedCccdNumber}`, tone: 'success' }
    }
    return { label: DEDICATED_NFC_BUTTON_LABELS.ready, tone: 'success' }
  }
  if (health.appReachable && health.cameraConnected !== health.nfcConnected) {
    return {
      label: !health.cameraConnected
        ? DEDICATED_NFC_BUTTON_LABELS.cameraMissing
        : DEDICATED_NFC_BUTTON_LABELS.nfcMissing,
      tone: 'warning'
    }
  }
  return { label: DEDICATED_NFC_BUTTON_LABELS.default, tone: 'default' }
}

interface Step1BasicProps {
  donVi: DonVi[]
  danToc: DanToc[]
  quocGia: QuocGia[]
  tinh: Tinh[]
  tonGiao: TonGiao[]
  viTriCongViec: ViTriCongViec[]

  onAvatarOpen: () => void
  onFileSelect: (file: File) => void
  hideTitle?: boolean
  hideNfc?: boolean
  hideHKTT?: boolean
  isAddForm?: boolean
}

const Step1Basic: React.FC<Step1BasicProps> = ({
  donVi,
  danToc,
  quocGia,
  tinh,
  tonGiao,
  viTriCongViec,
  onAvatarOpen,
  onFileSelect,
  hideTitle = false,
  hideNfc = false,
  hideHKTT = false,
  isAddForm = false
}) => {
  const { control, setValue } = useFormContext<NhansuFormData>()
  const [isNfcOpen, setIsNfcOpen] = useState(false)

  // Dedicated NFC Device State
  const [isDedicatedNfcConnected, setIsDedicatedNfcConnected] = useState(false)
  const [dedicatedNfcHealth, setDedicatedNfcHealth] = useState<DedicatedNfcHealthState>(
    DEFAULT_DEDICATED_NFC_HEALTH
  )
  const dedicatedNfcSocketRef = useRef<WebSocket | null>(null)
  const dedicatedNfcRetryTimerRef = useRef<number | null>(null)
  const lastHandledNfcPayloadRef = useRef<string | null>(null)

  // Helper: build unique key for NFC payload deduplication
  const buildNfcPayloadKey = useCallback((dg13: any) => {
    if (!dg13) return ''
    return JSON.stringify({
      cccdNumber: dg13.cccdNumber || dg13.cccd_number || '',
      fullName: dg13.fullName || dg13.full_name || '',
      dateOfBirth: dg13.dateOfBirth || dg13.date_of_birth || '',
      dateOfIssue: dg13.dateOfIssue || dg13.date_of_issue || '',
      chipId: dg13.chipId || dg13.chip_id || ''
    })
  }, [])

  // Helper: update dedicated NFC health with auto-generated message
  const updateDedicatedNfcHealth = useCallback((partial: Partial<DedicatedNfcHealthState>) => {
    setDedicatedNfcHealth((prev) => {
      const next = {
        ...prev,
        ...partial
      }
      return {
        ...next,
        message: partial.message ?? buildDedicatedNfcMessage(next)
      }
    })
  }, [])

  const handleNfcReceive = useCallback(
    (data: NfcPayload) => {
      // Chuyển "dd/MM/yyyy" → "yyyy-MM-dd" cho HrDateInput
      const parseViDate = (str?: string): string => {
        if (!str) return ''
        const parts = str.split('/')
        if (parts.length !== 3) return str
        const [d, m, y] = parts
        return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`
      }

      // Deduplicate NFC payloads
      const payloadKey = buildNfcPayloadKey(data.dg13)
      if (payloadKey && lastHandledNfcPayloadRef.current === payloadKey) {
        return
      }
      if (payloadKey) {
        lastHandledNfcPayloadRef.current = payloadKey
      }

      const dg13 = data.dg13
      if (dg13) {
        if (dg13.fullName) setValue('ho_va_ten', dg13.fullName, { shouldDirty: true })
        if (dg13.dateOfBirth)
          setValue('ngay_sinh', parseViDate(dg13.dateOfBirth), { shouldDirty: true })
        if (dg13.gender) {
          const genderMap: Record<string, string> = {
            MALE: '1',
            FEMALE: '2',
            Nam: '1',
            Nữ: '2',
            M: '1',
            F: '2'
          }
          setValue('gioi_tinh', genderMap[dg13.gender] ?? dg13.gender, { shouldDirty: true })
        }
        if (dg13.cccdNumber) setValue('cccd_so', dg13.cccdNumber, { shouldDirty: true })
        if (dg13.dateOfIssue)
          setValue('cccd_ngay_cap', parseViDate(dg13.dateOfIssue), { shouldDirty: true })
        if (dg13.expiryDate)
          setValue('cccd_ngay_het_han', parseViDate(dg13.expiryDate), { shouldDirty: true })
        if (dg13.placeOfBirth) setValue('que_quan', dg13.placeOfBirth, { shouldDirty: true })
        if (dg13.placeOfResidence)
          setValue('hktt_dia_chi', dg13.placeOfResidence, { shouldDirty: true })
        if (dg13.placeOfIssue) setValue('cccd_noi_cap', dg13.placeOfIssue, { shouldDirty: true })
      }

      // Map nationality → id_quoc_tich (tìm theo tên trong danh sách quốc gia)
      const nationalityStr = data.dg13?.nationality || data.nationality
      if (nationalityStr) {
        const match = quocGia.find(
          (q) => q.ten.trim().toLowerCase() === nationalityStr.trim().toLowerCase()
        )
        if (match) setValue('id_quoc_tich', match.id_quoc_gia, { shouldDirty: true })
      }

      // Map ethnicity → id_dan_toc
      const ethnicityStr = data.dg13?.ethnicity
      if (ethnicityStr) {
        const match = danToc.find(
          (d) => d.ten.trim().toLowerCase() === ethnicityStr.trim().toLowerCase()
        )
        if (match) setValue('id_dan_toc', match.id_dan_toc, { shouldDirty: true })
      }

      // Map religion → id_ton_giao
      const religionStr = data.dg13?.religion
      if (religionStr) {
        const match = tonGiao.find(
          (t) => t.ten.trim().toLowerCase() === religionStr.trim().toLowerCase()
        )
        if (match) setValue('id_ton_giao', match.id_ton_giao, { shouldDirty: true })
      }

      // Ảnh chân dung từ chip NFC: convert base64 → File để gửi kèm payload
      if (data.photo && typeof data.photo === 'string') {
        const photoSrc = data.photo.startsWith('data:')
          ? data.photo
          : `data:image/jpeg;base64,${data.photo}`

        // Set preview trong form (base64 data URI)
        setValue('avatar', photoSrc, { shouldDirty: true })

        // Convert base64 → Blob → File để gửi lên server
        try {
          const [header, b64] = photoSrc.split(',')
          const mime = header.match(/:(.*?);/)?.[1] ?? 'image/jpeg'
          const ext = mime.split('/')[1] ?? 'jpg'
          const binary = atob(b64)
          const bytes = new Uint8Array(binary.length)
          for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)
          const blob = new Blob([bytes], { type: mime })
          const file = new File([blob], `nfc_photo_${Date.now()}.${ext}`, { type: mime })
          onFileSelect(file)
        } catch (e) {
          console.warn('[NFC] Convert photo to File failed:', e)
        }
      }

      // Show success toast
      toast.success('Quét dữ liệu từ CCCD thành công!')
    },
    [setValue, quocGia, danToc, tonGiao, onFileSelect, buildNfcPayloadKey]
  )

  // Try connecting to dedicated NFC device
  const tryDedicatedNfc = useCallback((): Promise<boolean> => {
    const currentSocket = dedicatedNfcSocketRef.current
    if (
      currentSocket &&
      (currentSocket.readyState === WebSocket.OPEN ||
        currentSocket.readyState === WebSocket.CONNECTING)
    ) {
      setIsDedicatedNfcConnected(true)
      return Promise.resolve(true)
    }

    return new Promise((resolve) => {
      try {
        const ws = new WebSocket(DEDICATED_NFC_WS_URL)
        const timeout = setTimeout(() => {
          ws.close()
          resolve(false)
        }, 2000)

        ws.onopen = () => {
          ws.send('ping')
        }

        ws.onmessage = async (event) => {
          try {
            const data = JSON.parse(event.data)

            if (data.type === 'ping_response') {
              clearTimeout(timeout)

              const cameraConnected = Boolean(data.camera_connected)
              const nfcConnected = Boolean(data.nfc_connected)
              const isReady = cameraConnected && nfcConnected

              updateDedicatedNfcHealth({
                appReachable: true,
                cameraConnected,
                cameraHealthy: cameraConnected,
                cameraMessage: '',
                nfcConnected
              })

              if (!isReady) {
                setIsDedicatedNfcConnected(false)
                window.setTimeout(() => {
                  if (ws.readyState === WebSocket.OPEN) {
                    ws.send('ping')
                  }
                }, 2000)
                resolve(false)
                return
              }

              console.log('✅ [Dedicated NFC] Connected via dedicated device')
              dedicatedNfcSocketRef.current = ws
              setIsDedicatedNfcConnected(true)

              // Listen for NFC data on the same socket
              ws.onmessage = async (ev) => {
                try {
                  const nextData = JSON.parse(ev.data)

                  if (nextData.type === 'ping_response') {
                    const cameraReady = Boolean(nextData.camera_connected)
                    const nfcReady = Boolean(nextData.nfc_connected)
                    const deviceReady = cameraReady && nfcReady

                    updateDedicatedNfcHealth({
                      appReachable: true,
                      cameraConnected: cameraReady,
                      cameraHealthy: cameraReady,
                      cameraMessage: '',
                      nfcConnected: nfcReady
                    })

                    setIsDedicatedNfcConnected(deviceReady)
                  }

                  // Handle NFC data
                  if (
                    nextData.event === 'direct_data' &&
                    nextData.payload?.status_code === 'NFC_DATA'
                  ) {
                    console.log('📱 [Dedicated NFC] NFC Data received!', nextData.payload)
                    console.log('🔍 [Dedicated NFC] DG13 data:', nextData.payload?.dg13)
                    // Convert payload to expected NfcPayload format
                    const nfcPayload = {
                      dg13: nextData.payload.dg13 || nextData.payload,
                      photo: nextData.payload.photo
                    }
                    await handleNfcReceive(nfcPayload)
                  }

                  // Handle log events for health state
                  if (nextData.type === 'log' && nextData.line) {
                    const line = String(nextData.line)
                    const logHealthPatch: Partial<DedicatedNfcHealthState> = {
                      appReachable: true,
                      lastLogLine: line
                    }

                    if (line.includes('Webcam da san sang')) {
                      logHealthPatch.cameraConnected = true
                      logHealthPatch.cameraHealthy = true
                      logHealthPatch.cameraMessage = ''
                    }
                    if (line.includes('Camera mat ket noi')) {
                      logHealthPatch.cameraHealthy = false
                      logHealthPatch.cameraMessage = 'Camera mất kết nối'
                      logHealthPatch.scanState = 'error'
                      logHealthPatch.lastEvent = 'CAMERA_LOST'
                    }
                    if (line.includes('Camera khong phan hoi')) {
                      logHealthPatch.cameraHealthy = false
                      logHealthPatch.cameraMessage = 'Camera không phản hồi'
                    }
                    if (line.includes('Khong mo duoc webcam')) {
                      logHealthPatch.cameraConnected = false
                      logHealthPatch.cameraHealthy = false
                      logHealthPatch.cameraMessage = 'Không mở được webcam'
                    }
                    if (line.includes('NFC scan done') || line.includes('SCAN_DONE')) {
                      logHealthPatch.scanState = 'done'
                      logHealthPatch.lastEvent = 'SCAN_DONE'
                    }
                    if (line.includes('Reading NFC') || line.includes('NFC_DETECTED')) {
                      logHealthPatch.scanState = 'scanning'
                      logHealthPatch.lastEvent = 'NFC_DETECTED'
                    }
                    if (line.includes('Card detected') || line.includes('CARD_DETECTED')) {
                      logHealthPatch.scanState = 'scanning'
                      logHealthPatch.lastEvent = 'CARD_DETECTED'
                    }
                    if (line.includes('OCR timeout') || line.includes('OCR_TIMEOUT')) {
                      logHealthPatch.scanState = 'error'
                      logHealthPatch.lastEvent = 'OCR_TIMEOUT'
                    }
                    if (line.includes('Read failed') || line.includes('FAIL')) {
                      logHealthPatch.scanState = 'error'
                      logHealthPatch.lastEvent = 'FAIL'
                    }
                    if (line.includes('NFC disconnected') || line.includes('DISCONNECTED')) {
                      logHealthPatch.nfcConnected = false
                      logHealthPatch.scanState = 'error'
                      logHealthPatch.lastEvent = 'DISCONNECTED'
                    }
                    if (line.includes('NFC connected')) {
                      logHealthPatch.nfcConnected = true
                    }
                    if (line.includes('OCR busy') || line.includes('OCR_BUSY')) {
                      logHealthPatch.scanState = 'scanning'
                      logHealthPatch.lastEvent = 'OCR_BUSY'
                    }
                    if (line.includes('OCR sent') || line.includes('OCR_SENT')) {
                      logHealthPatch.scanState = 'done'
                      logHealthPatch.lastEvent = 'OCR_SENT'
                    }

                    updateDedicatedNfcHealth({ ...logHealthPatch })
                  }

                  // Handle serial status
                  if (nextData.type === 'serial_status' && nextData.data) {
                    setDedicatedNfcHealth((prev) => {
                      const updated = {
                        ...prev,
                        nfcConnected: Boolean(nextData.data.connected),
                        serialPort: nextData.data.port || prev.serialPort
                      }
                      return {
                        ...updated,
                        message: buildDedicatedNfcMessage(updated)
                      }
                    })
                  }

                  // Handle camera status
                  if (nextData.type === 'camera_status' && nextData.data) {
                    setDedicatedNfcHealth((prev) => {
                      const updated = {
                        ...prev,
                        cameraConnected: Boolean(nextData.data.connected),
                        cameraHealthy: Boolean(nextData.data.healthy),
                        cameraMessage: nextData.data.message || ''
                      }
                      return {
                        ...updated,
                        message: buildDedicatedNfcMessage(updated)
                      }
                    })
                  }

                  // Handle ports changed
                  if (nextData.type === 'ports_changed' && Array.isArray(nextData.ports)) {
                    setDedicatedNfcHealth((prev) => ({
                      ...prev,
                      availablePorts: nextData.ports
                    }))
                  }

                  // Handle OCR result
                  if (nextData.type === 'ocr_result' && nextData.data) {
                    console.log('📄 [Dedicated NFC] OCR result:', nextData.data)
                    // OCR result might contain MRZ data that will be sent to chip authentication
                  }

                  // Handle scan state changes
                  if (nextData.type === 'scan_state' && nextData.data) {
                    const state = nextData.data.state
                    const event = nextData.data.event

                    setDedicatedNfcHealth((prev) => {
                      const updated = {
                        ...prev,
                        scanState: state || prev.scanState,
                        lastEvent: event || prev.lastEvent
                      }
                      return {
                        ...updated,
                        message: buildDedicatedNfcMessage(updated)
                      }
                    })
                  }

                  // Handle parsed info (auto-fill data to form)
                  if (nextData.type === 'parsed_info' && nextData.data) {
                    console.log('👍 [Dedicated NFC] Parsed info received!', nextData.data)
                    const parsedData = nextData.data
                    const cccdNumber = parsedData.cccd_number || parsedData.cccdNumber

                    if (cccdNumber) {
                      console.log('✅ [Dedicated NFC] CCCD Number:', cccdNumber)
                      setDedicatedNfcHealth((prev) => {
                        const updated = {
                          ...prev,
                          parsedCccdNumber: cccdNumber
                        }
                        return {
                          ...updated,
                          message: buildDedicatedNfcMessage(updated)
                        }
                      })

                      // Auto-fill CCCD number to form
                      setValue('cccd_so', cccdNumber, { shouldDirty: true, shouldValidate: true })
                    }

                    // Fill other fields if available
                    if (parsedData.ho_va_ten || parsedData.fullName || parsedData.full_name) {
                      const fullName =
                        parsedData.ho_va_ten || parsedData.fullName || parsedData.full_name
                      console.log('📝 [Dedicated NFC] Filling full_name:', fullName)
                      setValue('ho_va_ten', fullName, { shouldDirty: true })
                    }
                    if (
                      parsedData.ngay_sinh ||
                      parsedData.dateOfBirth ||
                      parsedData.date_of_birth
                    ) {
                      const dateStr =
                        parsedData.ngay_sinh || parsedData.dateOfBirth || parsedData.date_of_birth
                      console.log('📝 [Dedicated NFC] Filling date_of_birth:', dateStr)
                      // Convert DD/MM/YYYY to YYYY-MM-DD if needed
                      if (dateStr && dateStr.includes('/')) {
                        const parts = dateStr.split('/')
                        if (parts.length === 3) {
                          const [d, m, y] = parts
                          setValue(
                            'ngay_sinh',
                            `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`,
                            { shouldDirty: true }
                          )
                        }
                      } else {
                        setValue('ngay_sinh', dateStr, { shouldDirty: true })
                      }
                    }
                    if (parsedData.gioi_tinh || parsedData.gender) {
                      const genderValue = parsedData.gioi_tinh || parsedData.gender
                      console.log('📝 [Dedicated NFC] Filling gender:', genderValue)
                      const genderMap: Record<string, string> = {
                        MALE: '1',
                        FEMALE: '2',
                        Nam: '1',
                        Nữ: '2',
                        M: '1',
                        F: '2'
                      }
                      setValue('gioi_tinh', genderMap[genderValue] ?? genderValue, {
                        shouldDirty: true
                      })
                    }
                    if (
                      parsedData.cccd_ngay_cap ||
                      parsedData.dateOfIssue ||
                      parsedData.date_of_issue
                    ) {
                      const dateStr =
                        parsedData.cccd_ngay_cap ||
                        parsedData.dateOfIssue ||
                        parsedData.date_of_issue
                      console.log('📝 [Dedicated NFC] Filling date_of_issue:', dateStr)
                      if (dateStr && dateStr.includes('/')) {
                        const parts = dateStr.split('/')
                        if (parts.length === 3) {
                          const [d, m, y] = parts
                          setValue(
                            'cccd_ngay_cap',
                            `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`,
                            { shouldDirty: true }
                          )
                        }
                      } else {
                        setValue('cccd_ngay_cap', dateStr, { shouldDirty: true })
                      }
                    }
                    if (
                      parsedData.cccd_ngay_het_han ||
                      parsedData.expiryDate ||
                      parsedData.date_of_expiry
                    ) {
                      const dateStr =
                        parsedData.cccd_ngay_het_han ||
                        parsedData.expiryDate ||
                        parsedData.date_of_expiry
                      console.log('📝 [Dedicated NFC] Filling date_of_expiry:', dateStr)
                      if (dateStr && dateStr.includes('/')) {
                        const parts = dateStr.split('/')
                        if (parts.length === 3) {
                          const [d, m, y] = parts
                          setValue(
                            'cccd_ngay_het_han',
                            `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`,
                            { shouldDirty: true }
                          )
                        }
                      } else {
                        setValue('cccd_ngay_het_han', dateStr, { shouldDirty: true })
                      }
                    }
                    if (
                      parsedData.que_quan ||
                      parsedData.placeOfBirth ||
                      parsedData.place_of_origin
                    ) {
                      const placeOfBirth =
                        parsedData.que_quan || parsedData.placeOfBirth || parsedData.place_of_origin
                      console.log('📝 [Dedicated NFC] Filling place_of_origin:', placeOfBirth)
                      setValue('que_quan', placeOfBirth, { shouldDirty: true })
                    }
                    if (
                      parsedData.hktt_dia_chi ||
                      parsedData.placeOfResidence ||
                      parsedData.place_of_residence
                    ) {
                      const placeOfResidence =
                        parsedData.hktt_dia_chi ||
                        parsedData.placeOfResidence ||
                        parsedData.place_of_residence
                      console.log(
                        '📝 [Dedicated NFC] Filling place_of_residence:',
                        placeOfResidence
                      )
                      setValue('hktt_dia_chi', placeOfResidence, { shouldDirty: true })
                    }
                    if (
                      parsedData.cccd_noi_cap ||
                      parsedData.placeOfIssue ||
                      parsedData.place_of_issue
                    ) {
                      const placeOfIssue =
                        parsedData.cccd_noi_cap ||
                        parsedData.placeOfIssue ||
                        parsedData.place_of_issue
                      console.log('📝 [Dedicated NFC] Filling place_of_issue:', placeOfIssue)
                      setValue('cccd_noi_cap', placeOfIssue, { shouldDirty: true })
                    }

                    // Map nationality
                    const nationalityStr = parsedData.quoc_tich || parsedData.nationality
                    if (nationalityStr) {
                      console.log('🌍 [Dedicated NFC] Mapping nationality:', nationalityStr)
                      const match = quocGia.find(
                        (q) => q.ten.trim().toLowerCase() === nationalityStr.trim().toLowerCase()
                      )
                      if (match) {
                        console.log('✅ [Dedicated NFC] Found nationality match:', match.ten)
                        setValue('id_quoc_tich', match.id_quoc_gia, { shouldDirty: true })
                      } else {
                        console.log('⚠️ [Dedicated NFC] No nationality match found')
                      }
                    }

                    // Map ethnicity
                    const ethnicityStr = parsedData.dan_toc || parsedData.ethnicity
                    if (ethnicityStr) {
                      console.log('👥 [Dedicated NFC] Mapping ethnicity:', ethnicityStr)
                      const match = danToc.find(
                        (d) => d.ten.trim().toLowerCase() === ethnicityStr.trim().toLowerCase()
                      )
                      if (match) {
                        console.log('✅ [Dedicated NFC] Found ethnicity match:', match.ten)
                        setValue('id_dan_toc', match.id_dan_toc, { shouldDirty: true })
                      } else {
                        console.log('⚠️ [Dedicated NFC] No ethnicity match found')
                      }
                    }

                    // Map religion
                    const religionStr = parsedData.ton_giao || parsedData.religion
                    if (religionStr) {
                      console.log('🙏 [Dedicated NFC] Mapping religion:', religionStr)
                      const match = tonGiao.find(
                        (t) => t.ten.trim().toLowerCase() === religionStr.trim().toLowerCase()
                      )
                      if (match) {
                        console.log('✅ [Dedicated NFC] Found religion match:', match.ten)
                        setValue('id_ton_giao', match.id_ton_giao, { shouldDirty: true })
                      } else {
                        console.log('⚠️ [Dedicated NFC] No religion match found')
                      }
                    }

                    // Handle photo if available
                    const photoData = parsedData.photo_base64 || parsedData.photo
                    if (photoData && typeof photoData === 'string' && photoData.length > 0) {
                      console.log('📸 [Dedicated NFC] Processing photo data...')
                      try {
                        const photoSrc = photoData.startsWith('data:')
                          ? photoData
                          : `data:image/jpeg;base64,${photoData}`

                        // Set preview trong form (base64 data URI)
                        setValue('avatar', photoSrc, { shouldDirty: true })

                        // Convert base64 → Blob → File để gửi lên server
                        const [header, b64] = photoSrc.split(',')
                        const mime = header.match(/:(.*?);/)?.[1] ?? 'image/jpeg'
                        const ext = mime.split('/')[1] ?? 'jpg'
                        const binary = atob(b64)
                        const bytes = new Uint8Array(binary.length)
                        for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)
                        const blob = new Blob([bytes], { type: mime })
                        const file = new File([blob], `nfc_photo_${Date.now()}.${ext}`, {
                          type: mime
                        })
                        onFileSelect(file)
                        console.log('✅ [Dedicated NFC] Photo processed successfully')
                      } catch (e) {
                        console.warn('⚠️ [Dedicated NFC] Convert photo to File failed:', e)
                      }
                    }

                    // Show success notification
                    console.log('🎉 [Dedicated NFC] Auto-fill completed!')
                    toast.success('Đã tự động điền thông tin từ CCCD!')
                  }
                } catch (e) {
                  console.error('❌ [Dedicated NFC] Parse error:', e)
                }
              }

              resolve(true)
            }
          } catch (e) {
            console.error('❌ [Dedicated NFC] Parse error:', e)
          }
        }

        ws.onerror = () => {
          clearTimeout(timeout)
          setIsDedicatedNfcConnected(false)
          setDedicatedNfcHealth({
            appReachable: false,
            cameraConnected: false,
            cameraHealthy: false,
            cameraMessage: '',
            nfcConnected: false,
            serialPort: '',
            scanState: 'idle',
            lastEvent: '',
            lastLogLine: '',
            parsedCccdNumber: '',
            availablePorts: [],
            message: 'Không kết nối được ứng dụng máy quét NFC. Hãy mở ứng dụng trên máy tính.'
          })
          resolve(false)
        }

        ws.onclose = () => {
          clearTimeout(timeout)
          if (dedicatedNfcSocketRef.current === ws) {
            dedicatedNfcSocketRef.current = null
          }
          setIsDedicatedNfcConnected(false)
          setDedicatedNfcHealth((prev) => ({
            ...prev,
            appReachable: false,
            cameraConnected: false,
            cameraHealthy: false,
            cameraMessage: '',
            nfcConnected: false,
            serialPort: '',
            scanState: 'idle',
            lastEvent: '',
            parsedCccdNumber: '',
            availablePorts: [],
            message: 'Mất kết nối tới ứng dụng máy quét NFC.'
          }))
        }
      } catch {
        setIsDedicatedNfcConnected(false)
        setDedicatedNfcHealth({
          appReachable: false,
          cameraConnected: false,
          cameraHealthy: false,
          cameraMessage: '',
          nfcConnected: false,
          serialPort: '',
          scanState: 'idle',
          lastEvent: '',
          lastLogLine: '',
          parsedCccdNumber: '',
          availablePorts: [],
          message: 'Không khởi tạo được kết nối tới ứng dụng máy quét NFC.'
        })
        resolve(false)
      }
    })
  }, [handleNfcReceive, updateDedicatedNfcHealth, setValue, quocGia, danToc, tonGiao, onFileSelect])

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'don_vi_kiem_nhiem'
  })

  // Memoize donVi options to prevent re-creating on every render
  const [phuongOptionsState, setPhuongOptionsState] = useState<Phuong[]>([])
  const prevHkttTinhRef = useRef<string>('')
  const [hkttTinh] = useWatch({ control, name: ['hktt_id_tinh_tp'] }) as [string]
  const [imgError, setImgError] = useState(false)
  const [avatarValue] = useWatch({ control, name: ['avatar'] }) as [string]

  // Container-width responsive layout (works in drawers, not just viewport)
  const [cardRef, isWide] = useContainerWidth(700)

  useEffect(() => {
    setImgError(false)
  }, [avatarValue])

  // Compact: reusable auto-swap for date pairs
  const useAutoSwapDates = (
    issueField: keyof NhansuFormData,
    expiryField: keyof NhansuFormData
  ) => {
    const [issue, expiry] = useWatch({
      control,
      // Casting to any to satisfy tuple typing for dynamic field names
      name: [issueField as any, expiryField as any]
    }) as [string, string]

    useEffect(() => {
      if (!issue || !expiry) return
      const issueDate = new Date(issue)
      const expiryDate = new Date(expiry)
      if (isNaN(issueDate.getTime()) || isNaN(expiryDate.getTime())) return
      if (expiryDate < issueDate) {
        setValue(issueField as any, expiry)
        setValue(expiryField as any, issue)
      }
    }, [issue, expiry, setValue, issueField, expiryField])
  }

  // Apply for CCCD and Passport
  useAutoSwapDates('cccd_ngay_cap', 'cccd_ngay_het_han')
  useAutoSwapDates('ho_chieu_ngay_cap', 'ho_chieu_ngay_het_han')
  const donViOptions = useMemo(
    () => donVi.map((dv) => ({ value: String(dv.id_don_vi), label: dv.ten_don_vi })),
    [donVi]
  )

  const validateAge = (dateStr: string): boolean | string => {
    if (!dateStr) return true // Let required rule handle this
    try {
      const birthDate = new Date(dateStr)
      const today = new Date()
      const age = today.getFullYear() - birthDate.getFullYear()
      const monthDiff = today.getMonth() - birthDate.getMonth()
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        return age - 1 >= 16 ? true : 'Phải từ 16 tuổi trở lên'
      }
      return age >= 16 ? true : 'Phải từ 16 tuổi trở lên'
    } catch {
      return 'Ngày sinh không hợp lệ'
    }
  }

  const validateCCCD = (value: string): boolean | string => {
    if (!value) return true // Let required rule handle this
    return /^\d{12}$/.test(value) ? true : 'CCCD phải có đúng 12 chữ số'
  }

  const danTocOptions = useMemo(
    () => danToc.map((dt) => ({ value: String(dt.id_dan_toc), label: dt.ten })),
    [danToc]
  )

  const quocGiaOptions = useMemo(
    () => quocGia.map((dt) => ({ value: String(dt.id_quoc_gia), label: dt.ten })),
    [quocGia]
  )

  const tonGiaoOptions = useMemo(
    () => tonGiao.map((dt) => ({ value: String(dt.id_ton_giao), label: dt.ten })),
    [tonGiao]
  )

  const viTriOptions = useMemo(
    () =>
      viTriCongViec.map((dt) => ({
        value: String(dt.id_vi_tri_cong_viec),
        label: dt.ten_cong_viec
      })),
    [viTriCongViec]
  )

  const tinhOptions = useMemo(
    () => tinh.map((dt) => ({ value: String(dt.id), label: dt.name })),
    [tinh]
  )
  const phuongOptions = useMemo(
    () => phuongOptionsState.map((dt) => ({ value: String(dt.id), label: dt.name })),
    [phuongOptionsState]
  )

  // Auto compose hktt_dia_chi from labels of province + ward + house number
  const [hkttXaPhuong, hkttSoNha] = useWatch({
    control,
    name: ['hktt_id_xa_phuong', 'hktt_so_nha']
  }) as [string, string]

  // Only recompute full address after user changes province/ward/house number
  const lastAddressPartsRef = useRef({ tinh: hkttTinh, xa: hkttXaPhuong, soNha: hkttSoNha })

  useEffect(() => {
    const changed =
      lastAddressPartsRef.current.tinh !== hkttTinh ||
      lastAddressPartsRef.current.xa !== hkttXaPhuong ||
      lastAddressPartsRef.current.soNha !== hkttSoNha

    if (!changed) return

    const tinhLabel = tinhOptions.find((o) => String(o.value) === String(hkttTinh))?.label || ''
    const phuongLabel =
      phuongOptions.find((o) => String(o.value) === String(hkttXaPhuong))?.label || ''
    const soNha = hkttSoNha || ''
    const composed = [soNha, phuongLabel, tinhLabel].filter(Boolean).join(', ')
    setValue('hktt_dia_chi', composed)
    lastAddressPartsRef.current = { tinh: hkttTinh, xa: hkttXaPhuong, soNha: hkttSoNha }
  }, [hkttTinh, hkttXaPhuong, hkttSoNha, tinhOptions, phuongOptions, setValue])

  const loadPhuong = useCallback(
    async (provinceCode: string, clearSelectionAfterLoad = false) => {
      if (!provinceCode) {
        setPhuongOptionsState([])
        return
      }
      try {
        const wards = await mapQuanhuyenxaAxios(provinceCode)
        const normalized = wards.map((w: any) => ({ id: w.value, name: w.label })) as Phuong[]
        setPhuongOptionsState(normalized)
        if (clearSelectionAfterLoad) {
          setValue('hktt_id_xa_phuong', '')
        }
      } catch (error) {
        console.error('Error loading wards:', error)
        setPhuongOptionsState([])
        if (clearSelectionAfterLoad) {
          setValue('hktt_id_xa_phuong', '')
        }
      }
    },
    [setValue]
  )

  useEffect(() => {
    const isFirstLoad = prevHkttTinhRef.current === ''
    const provinceChanged = !isFirstLoad && !!hkttTinh && hkttTinh !== prevHkttTinhRef.current
    loadPhuong(hkttTinh, provinceChanged)
    prevHkttTinhRef.current = hkttTinh
  }, [hkttTinh, loadPhuong])

  // Auto-connect to dedicated NFC device when component mounts and NFC is not hidden
  useEffect(() => {
    if (hideNfc) {
      // Clean up if NFC is hidden
      if (dedicatedNfcRetryTimerRef.current) {
        window.clearInterval(dedicatedNfcRetryTimerRef.current)
        dedicatedNfcRetryTimerRef.current = null
      }
      setIsDedicatedNfcConnected(false)
      setDedicatedNfcHealth(DEFAULT_DEDICATED_NFC_HEALTH)
      if (
        dedicatedNfcSocketRef.current &&
        (dedicatedNfcSocketRef.current.readyState === WebSocket.OPEN ||
          dedicatedNfcSocketRef.current.readyState === WebSocket.CONNECTING)
      ) {
        dedicatedNfcSocketRef.current.close()
        dedicatedNfcSocketRef.current = null
      }
      return
    }

    let cancelled = false

    const connect = async () => {
      const connected = await tryDedicatedNfc()
      if (cancelled) return
      if (!connected) {
        setIsDedicatedNfcConnected(false)
      }
    }

    connect()

    // Retry connection every 3 seconds if not connected
    dedicatedNfcRetryTimerRef.current = window.setInterval(() => {
      if (
        !dedicatedNfcSocketRef.current ||
        dedicatedNfcSocketRef.current.readyState === WebSocket.CLOSED
      ) {
        void connect()
      }
    }, 3000)

    return () => {
      cancelled = true
      if (dedicatedNfcRetryTimerRef.current) {
        window.clearInterval(dedicatedNfcRetryTimerRef.current)
        dedicatedNfcRetryTimerRef.current = null
      }
      if (
        dedicatedNfcSocketRef.current &&
        (dedicatedNfcSocketRef.current.readyState === WebSocket.OPEN ||
          dedicatedNfcSocketRef.current.readyState === WebSocket.CONNECTING)
      ) {
        dedicatedNfcSocketRef.current.close()
        dedicatedNfcSocketRef.current = null
      }
      setIsDedicatedNfcConnected(false)
      setDedicatedNfcHealth(DEFAULT_DEDICATED_NFC_HEALTH)
    }
  }, [hideNfc, tryDedicatedNfc])

  // Update connection state based on health
  useEffect(() => {
    const dedicatedReady =
      dedicatedNfcHealth.appReachable &&
      dedicatedNfcHealth.cameraConnected &&
      dedicatedNfcHealth.cameraHealthy &&
      dedicatedNfcHealth.nfcConnected

    setIsDedicatedNfcConnected(dedicatedReady)
  }, [dedicatedNfcHealth])

  // Get UI state for dedicated NFC button
  const dedicatedNfcUiState = useMemo(
    () => getDedicatedNfcUiState(isDedicatedNfcConnected, dedicatedNfcHealth),
    [isDedicatedNfcConnected, dedicatedNfcHealth]
  )

  // Handle NFC button press - open app if connected, otherwise show modal
  const handleNfcButtonPress = useCallback(() => {
    if (isDedicatedNfcConnected) {
      // If connected to dedicated device, open the app
      window.open(DEDICATED_NFC_APP_URL, '_blank', 'noopener,noreferrer')
    } else {
      // Otherwise, show the NFC scan modal
      setIsNfcOpen(true)
    }
  }, [isDedicatedNfcConnected])

  return (
    <div className="space-y-2">
      {!hideTitle && (
        <div className="text-center mb-6">
          <h3 className="text-lg font-semibold text-gray-800">Thông tin hồ sơ nhân sự</h3>
          <p className="text-sm text-gray-600">Nhập đầy đủ thông tin cá nhân và hồ sơ</p>
        </div>
      )}

      {/* Thông tin cơ bản */}
      <Card shadow="none" className="px-4 md:px-6 py-4 overflow-visible rounded-none" ref={cardRef}>
        <div className="flex items-center justify-between mb-4 pb-1">
          <h4
            className="font-semibold text-gray-800 text-[17px]"
            style={{ fontFamily: "'Roboto', sans-serif" }}
          >
            Thông tin cơ bản
          </h4>
          {!hideNfc && (
            <Button
              size="sm"
              variant={isDedicatedNfcConnected ? 'solid' : 'bordered'}
              color={
                dedicatedNfcUiState.tone === 'success'
                  ? 'success'
                  : dedicatedNfcUiState.tone === 'warning'
                    ? 'warning'
                    : dedicatedNfcUiState.tone === 'error'
                      ? 'danger'
                      : 'primary'
              }
              startContent={<ScanLine size={15} />}
              onPress={handleNfcButtonPress}
            >
              {dedicatedNfcUiState.label}
            </Button>
          )}
        </div>
        <div className={`grid gap-4 ${isWide ? 'grid-cols-4' : 'grid-cols-1'}`}>
          {/* Left - 3 columns for info */}
          <div className={`${isWide ? 'col-span-3' : ''} grid md:grid-cols-3 gap-4`}>
            <Controller
              name="ma_nhan_vien"
              rules={{
                required: 'Mã nhân sự là bắt buộc'
              }}
              render={({ field, fieldState: { error } }) => (
                <div>
                  <HrInput
                    label="Mã nhân sự"
                    value={field.value || ''}
                    onChange={field.onChange}
                    isRequired
                    // disabled
                    readOnly
                  />
                  {error && <p className="text-red-500 text-xs mt-1">{error.message}</p>}
                </div>
              )}
            />

            <Controller
              name="ho_va_ten"
              control={control}
              rules={{
                required: 'Họ tên là bắt buộc'
              }}
              render={({ field, fieldState: { error } }) => (
                <div>
                  <HrInput
                    label="Họ và tên"
                    value={field.value || ''}
                    onValueChange={field.onChange}
                    onBlur={field.onBlur}
                    isRequired
                    isInvalid={!!error}
                    errorMessage={error?.message}
                  />
                </div>
              )}
            />

            <Controller
              name="email"
              control={control}
              render={({ field }) => (
                <HrInput
                  label="Email"
                  type="email"
                  value={field.value || ''}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                />
              )}
            />

            <Controller
              name="ngay_sinh"
              control={control}
              rules={{
                required: 'Ngày sinh là bắt buộc',
                validate: validateAge
              }}
              render={({ field, fieldState: { error } }) => (
                <div>
                  <HrDateInput
                    label="ngày sinh"
                    isRequired
                    value={field.value || ''}
                    onChangeValue={field.onChange}
                    onBlur={field.onBlur}
                  />
                  {error && <p className="text-red-500 text-xs mt-1">{error.message}</p>}
                </div>
              )}
            />

            <Controller
              name="gioi_tinh"
              control={control}
              render={({ field }) => (
                <HrGenderInput value={String(field.value)} onChange={field.onChange} />
              )}
            />

            <Controller
              name="so_dien_thoai"
              control={control}
              render={({ field }) => (
                <HrInput
                  label="Số điện thoại"
                  type="tel"
                  value={field.value || ''}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                />
              )}
            />

            <Controller
              name="mst_ca_nhan"
              control={control}
              render={({ field }) => (
                <HrInput
                  label="Mã số thuế cá nhân"
                  value={field.value || ''}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  endContent={
                    field.value ? (
                      <Tooltip content="Sao chép sang Số CCCD" placement="top">
                        <button
                          type="button"
                          className="p-1 rounded-md hover:bg-blue-50 text-gray-400 hover:text-blue-600 transition-colors cursor-pointer"
                          onClick={() => {
                            setValue('cccd_so', field.value || '', {
                              shouldDirty: true,
                              shouldValidate: true,
                              shouldTouch: true
                            })
                            toast('Đã sao chép sang Số CCCD', { variant: 'success' })
                          }}
                        >
                          <ArrowDownUp size={14} />
                        </button>
                      </Tooltip>
                    ) : undefined
                  }
                />
              )}
            />

            <Controller
              name="id_don_vi"
              control={control}
              rules={{
                required: 'Đơn vị công tác là bắt buộc'
              }}
              render={({ field, fieldState: { error } }) => (
                <HrAutocomplete
                  label="Đơn vị công tác"
                  isRequired
                  options={donViOptions}
                  value={field.value}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  isInvalid={!!error}
                  errorMessage={error?.message}
                />
              )}
            />

            <Controller
              name="id_vi_tri_cong_viec"
              control={control}
              rules={{
                required: 'Chức vụ là bắt buộc'
              }}
              render={({ field, fieldState: { error } }) => (
                <HrAutocomplete
                  label="Chức vụ"
                  options={viTriOptions}
                  value={field.value}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  isRequired
                  isInvalid={!!error}
                  errorMessage={error?.message}
                />
              )}
            />

            <Controller
              name="id_dan_toc"
              control={control}
              render={({ field }) => (
                <HrAutocomplete
                  label="Dân tộc"
                  options={danTocOptions}
                  value={field.value}
                  onChange={field.onChange}
                />
              )}
            />

            <Controller
              name="id_ton_giao"
              control={control}
              render={({ field }) => (
                <HrAutocomplete
                  label="Tôn giáo"
                  options={tonGiaoOptions}
                  value={field.value}
                  onChange={field.onChange}
                />
              )}
            />

            <Controller
              name="id_quoc_tich"
              control={control}
              render={({ field }) => (
                <HrAutocomplete
                  label="Quốc tịch"
                  options={quocGiaOptions}
                  value={field.value}
                  onChange={field.onChange}
                />
              )}
            />
          </div>

          {/* Right - 1 column for Avatar */}
          <Controller
            name="avatar"
            control={control}
            render={({ field }) => {
              const fileInputRef = React.useRef<HTMLInputElement>(null)

              const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
                const file = e.target.files?.[0]
                if (file) {
                  onFileSelect(file)
                  onAvatarOpen()
                }
                e.target.value = ''
              }

              return (
                <div
                  className={`flex flex-col items-center gap-2 ${isWide ? 'col-span-1' : 'order-first'}`}
                >
                  <label className="text-sm font-medium text-gray-700">Ảnh đại diện</label>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                  <div className="relative group w-40 h-40">
                    {field.value && !imgError ? (
                      <img
                        src={getAvatarUrl(field.value)}
                        alt="Avatar preview"
                        className="w-40 h-40 rounded-full object-cover"
                        onError={() => setImgError(true)}
                      />
                    ) : (
                      <div className="w-40 h-40 rounded-full border bg-gray-100 flex items-center justify-center text-gray-400 text-xs text-center p-2">
                        {imgError ? 'Không thể tải ảnh' : 'Chưa có ảnh'}
                      </div>
                    )}
                    {field.value && (
                      <button
                        type="button"
                        onClick={() => field.onChange('')}
                        className="absolute cursor-pointer top-1 right-1 w-6 h-6 flex items-center justify-center rounded-full bg-black/60 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/80"
                        title="Xóa ảnh"
                      >
                        <X size={14} />
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="absolute bottom-1 right-1 w-9 h-9 flex items-center justify-center rounded-full bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 hover:text-blue-600 transition-colors cursor-pointer"
                      title="Tải ảnh lên"
                    >
                      <Camera size={18} />
                    </button>
                  </div>
                </div>
              )
            }}
          />
        </div>
      </Card>

      <div className="flex flex-col gap-2">
        {/* Căn cước công dân */}
        <FormCollapse title="Căn cước công dân (CCCD)" icon={<CreditCard size={18} />}>
          <div className="grid md:grid-cols-2 form-col-4 gap-4">
            <Controller
              name="cccd_so"
              control={control}
              rules={{
                required: 'CCCD là bắt buộc',
                validate: validateCCCD
              }}
              render={({ field, fieldState: { error } }) => {
                const len = (field.value || '').length
                return (
                  <div>
                    <HrInput
                      label="Số CCCD"
                      isRequired
                      value={field.value || ''}
                      onChange={(val) => {
                        if (typeof val !== 'string') return
                        const digits = val?.replace(/\D/g, '').slice(0, 12)
                        field.onChange(digits)
                      }}
                      onBlur={field.onBlur}
                      endContent={
                        <div className="flex items-center gap-1">
                          {field.value && (
                            <Tooltip content="Sao chép sang Mã số thuế" placement="top">
                              <button
                                type="button"
                                className="p-1 rounded-md hover:bg-blue-50 text-gray-400 hover:text-blue-600 transition-colors cursor-pointer"
                                onClick={() => {
                                  setValue('mst_ca_nhan', field.value || '', {
                                    shouldDirty: true,
                                    shouldValidate: true,
                                    shouldTouch: true
                                  })
                                  toast('Đã sao chép sang Mã số thuế', { variant: 'success' })
                                }}
                              >
                                <ArrowDownUp size={14} />
                              </button>
                            </Tooltip>
                          )}
                          <span
                            className={`text-xs font-medium whitespace-nowrap ${len === 12 ? 'text-green-500' : 'text-gray-400'}`}
                          >
                            {len}/12
                          </span>
                        </div>
                      }
                    />
                    {error && <p className="text-red-500 text-xs mt-1">{error.message}</p>}
                  </div>
                )
              }}
            />
            <Controller
              name="cccd_noi_cap"
              control={control}
              render={({ field }) => (
                <HrInput label="Nơi cấp CCCD" value={field.value || ''} onChange={field.onChange} />
              )}
            />
            <Controller
              name="cccd_ngay_cap"
              control={control}
              render={({ field }) => (
                <HrDateInput
                  label="Ngày cấp CCCD"
                  value={field.value || ''}
                  onChangeValue={field.onChange}
                />
              )}
            />
            <Controller
              name="cccd_ngay_het_han"
              control={control}
              render={({ field }) => (
                <HrDateInput
                  label="Ngày hết hạn CCCD"
                  value={field.value || ''}
                  onChangeValue={field.onChange}
                />
              )}
            />
          </div>
        </FormCollapse>

        {isAddForm && (
          <Step3Work donVi={donVi} tinh={tinh} hideTitle hideInsurance />
        )}

        {/* Đơn vị kiêm nhiệm */}
        <FormCollapse
          title="Đơn vị kiêm nhiệm"
          icon={<Building2 size={18} />}
          count={fields.length}
          onAdd={() => append({ id_don_vi_cong_tac: '', id_vi_tri_cong_viec: '', la_lanh_dao: false })}
        >
          {fields.length > 0 ? (
            <div className="space-y-3">
              {fields.map((field, index) => (
                <div
                  key={field.id}
                  className="relative grid md:grid-cols-[1fr_1fr_auto] gap-3 items-end p-3 pr-10 rounded-lg border border-gray-200"
                >
                  <Controller
                    name={`don_vi_kiem_nhiem.${index}.id_don_vi_cong_tac` as any}
                    control={control}
                    render={({ field: f }) => (
                      <HrAutocomplete
                        label="Đơn vị công tác"
                        options={donViOptions}
                        value={f.value as string}
                        onChange={f.onChange}
                      />
                    )}
                  />
                  <Controller
                    name={`don_vi_kiem_nhiem.${index}.id_vi_tri_cong_viec` as any}
                    control={control}
                    render={({ field: f }) => (
                      <HrAutocomplete
                        label="Vị trí công việc"
                        options={viTriOptions}
                        value={f.value as string}
                        onChange={f.onChange}
                      />
                    )}
                  />
                  <Controller
                    name={`don_vi_kiem_nhiem.${index}.la_lanh_dao` as any}
                    control={control}
                    render={({ field: f }) => (
                      <div className="flex items-center h-12">
                        <Checkbox
                          size="sm"
                          isSelected={f.value === true}
                          onChange={(isSelected) => f.onChange(isSelected)}
                        >
                          <span className="text-sm whitespace-nowrap">Lãnh đạo</span>
                        </Checkbox>
                      </div>
                    )}
                  />
                  <button
                    type="button"
                    onClick={() => remove(index)}
                    className="absolute -top-2 -right-2 flex items-center justify-center w-6 h-6 rounded-full bg-white border border-gray-200 text-red-400 hover:bg-red-50 hover:text-red-600 hover:border-red-300 transition-colors cursor-pointer z-10"
                    title="Xóa"
                  >
                    <X size={16} />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-sm text-gray-400 py-2">Chưa có đơn vị kiêm nhiệm</div>
          )}
        </FormCollapse>

        {/* Hộ chiếu */}
        <FormCollapse title="Hộ chiếu (Passport)" icon={<Globe size={18} />}>
          <div className="grid md:grid-cols-2 form-col-4 gap-4">
            <Controller
              name="ho_chieu_so"
              control={control}
              render={({ field }) => (
                <HrInput label="Số Passport" value={field.value || ''} onChange={field.onChange} />
              )}
            />
            <Controller
              name="ho_chieu_noi_cap"
              control={control}
              render={({ field }) => (
                <HrInput
                  label="Nơi cấp Passport"
                  value={field.value || ''}
                  onChange={field.onChange}
                />
              )}
            />
            <Controller
              name="ho_chieu_ngay_cap"
              control={control}
              render={({ field }) => (
                <HrDateInput
                  label="Ngày cấp Passport"
                  value={field.value || ''}
                  onChangeValue={field.onChange}
                />
              )}
            />
            <Controller
              name="ho_chieu_ngay_het_han"
              control={control}
              render={({ field }) => (
                <HrDateInput
                  label="Ngày hết hạn Passport"
                  value={field.value || ''}
                  onChangeValue={field.onChange}
                />
              )}
            />
          </div>
        </FormCollapse>

        {/* Trình độ/Bằng cấp */}
        <FormCollapse title="Trình độ/Bằng cấp" icon={<GraduationCap size={18} />}>
          <div className="grid md:grid-cols-2 form-col-4 gap-4">
            <Controller
              name="trinh_do_vh"
              control={control}
              render={({ field }) => (
                <HrInput
                  label="Trình độ văn hóa"
                  value={field.value || ''}
                  onChange={field.onChange}
                />
              )}
            />
            <Controller
              name="hoc_ham"
              control={control}
              render={({ field }) => (
                <HrInput label="Học hàm" value={field.value || ''} onChange={field.onChange} />
              )}
            />
            <Controller
              name="trinh_do_dt"
              control={control}
              render={({ field }) => (
                <HrInput
                  label="Trình độ/ Học vị"
                  value={field.value || ''}
                  onChange={field.onChange}
                />
              )}
            />
            <Controller
              name="noi_dt"
              control={control}
              render={({ field }) => (
                <HrInput label="Nơi đào tạo" value={field.value || ''} onChange={field.onChange} />
              )}
            />
            <Controller
              name="nganh_dt"
              control={control}
              render={({ field }) => (
                <HrInput label="Chuyên ngành" value={field.value || ''} onChange={field.onChange} />
              )}
            />
            <Controller
              name="khoa_dt"
              control={control}
              render={({ field }) => (
                <HrInput label="Khóa" value={field.value || ''} onChange={field.onChange} />
              )}
            />
            <Controller
              name="nam_tn"
              control={control}
              render={({ field }) => (
                <HrInput
                  label="Năm tốt nghiệp"
                  type="number"
                  value={field.value || ''}
                  onChange={field.onChange}
                />
              )}
            />
            <Controller
              name="xep_loai_tn"
              control={control}
              render={({ field }) => (
                <HrInput
                  label="Xếp loại tốt nghiệp"
                  value={field.value || ''}
                  onChange={field.onChange}
                />
              )}
            />
          </div>
        </FormCollapse>

        {/* Hộ khẩu thường trú */}
        {!hideHKTT && (
          <FormCollapse title="Hộ khẩu thường trú" icon={<Home size={18} />}>
            <div className="grid md:grid-cols-2 form-col-4 gap-4">
              <Controller
                name="hktt_id_quoc_gia"
                control={control}
                render={({ field }) => (
                  <HrAutocomplete
                    label="Quốc gia"
                    options={quocGiaOptions}
                    value={field.value}
                    onChange={field.onChange}
                  />
                )}
              />
              <Controller
                name="hktt_id_tinh_tp"
                control={control}
                render={({ field }) => (
                  <HrAutocomplete
                    label="Tỉnh/Thành phố"
                    options={tinhOptions}
                    value={field.value}
                    onChange={field.onChange}
                  />
                )}
              />
              <Controller
                name="hktt_id_xa_phuong"
                control={control}
                render={({ field, fieldState: { error } }) => (
                  <div>
                    <HrAutocomplete
                      label="Phường/Xã"
                      options={phuongOptions}
                      value={field.value}
                      onChange={field.onChange}
                      onBlur={field.onBlur}
                    />
                    {error && <p className="text-red-500 text-xs mt-1">{error.message}</p>}
                  </div>
                )}
              />
              <Controller
                name="hktt_so_nha"
                control={control}
                render={({ field }) => (
                  <HrInput
                    label="Số nhà/Tên đường"
                    value={field.value || ''}
                    onChange={field.onChange}
                  />
                )}
              />
              {/*
              <Controller
                name="hktt_so_ho_khau"
                control={control}
                render={({ field }) => (
                  <HrInput label="Số hộ khẩu" value={field.value || ''} onChange={field.onChange} />
                )}
              />
              <Controller
                name="hktt_ma_so_ho_gd"
                control={control}
                render={({ field }) => (
                  <HrInput
                    label="Mã số hộ gia đình"
                    value={field.value || ''}
                    onChange={field.onChange}
                  />
                )}
              />
              */}
              <Controller
                name="hktt_dia_chi"
                control={control}
                render={({ field }) => (
                  <div className="md:col-span-2">
                    <HrTextarea
                      label="Địa chỉ đầy đủ"
                      value={field.value || ''}
                      onChange={field.onChange}
                      minRows={2}
                    />
                  </div>
                )}
              />
              <Controller
                name="hktt_la_chu_ho"
                control={control}
                render={({ field }) => (
                  <div className="md:col-span-2">
                    <Checkbox
                      size="sm"
                      id="hktt_la_chu_ho"
                      isSelected={field.value === true || String(field.value) === '1'}
                      onChange={(isSelected) => field.onChange(isSelected)}
                    >
                      Là chủ hộ
                    </Checkbox>
                  </div>
                )}
              />
            </div>
          </FormCollapse>
        )}
      </div>

      <NfcScanModal
        isOpen={isNfcOpen}
        onClose={() => setIsNfcOpen(false)}
        onReceive={handleNfcReceive}
      />
    </div>
  )
}

export default Step1Basic
