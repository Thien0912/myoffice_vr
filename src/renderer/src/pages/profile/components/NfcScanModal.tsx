import { Button, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader } from '@heroui/react'
import { DotLottieReact } from '@lottiefiles/dotlottie-react'
import { QRCodeSVG } from 'qrcode.react'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import lottieNfc from '../../../assets/Mobile Payments Lottie Animation.lottie?url'

/** Payload nhận được từ thiết bị NFC qua WebSocket */
export interface Dg13 {
    cccdNumber?: string
    fullName?: string
    dateOfBirth?: string     // dd/MM/yyyy
    gender?: string          // "Nam" | "Nữ"
    nationality?: string
    ethnicity?: string
    religion?: string
    placeOfBirth?: string
    placeOfResidence?: string
    placeOfIssue?: string    // Nơi cấp CCCD
    personalIdentification?: string
    dateOfIssue?: string     // dd/MM/yyyy
    expiryDate?: string      // dd/MM/yyyy
    fatherName?: string
    motherName?: string
    oldIdNumber?: string
    chipId?: string
}

export interface NfcPayload {
    status_code?: string     // "CONNECT_OK" | "NFC_DATA"
    docNumber?: string
    name?: string
    birthDate?: string
    gender?: string
    expiryDate?: string
    nationality?: string
    photo?: string           // base64 string
    dg13?: Dg13
    [key: string]: unknown
}

interface NfcScanModalProps {
    isOpen: boolean
    onClose: () => void
    onReceive: (data: NfcPayload) => void
}

const WS_URL = 'wss://dkxettuyen.nctu.edu.vn/ws'
const SESSION_KEY = 'nfc_client_code'

function generateClientCode(): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
    return Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
}


type Phase = 'connecting' | 'waiting_scan' | 'waiting_nfc' | 'received' | 'error' | 'closed'


/* ─── Illustration: Chờ kết nối (QR phase) ───────────────────────────── */
const ConnectingIllustration: React.FC = () => (
    <svg width="56" height="56" viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="28" cy="28" r="28" fill="#EFF6FF" />
        <path d="M18 28 Q28 18 38 28" stroke="#3B82F6" strokeWidth="2.5" strokeLinecap="round" fill="none" />
        <path d="M13 33 Q28 13 43 33" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.5" />
        <circle cx="28" cy="35" r="3" fill="#3B82F6" />
    </svg>
)

export const NfcScanModal: React.FC<NfcScanModalProps> = ({ isOpen, onClose, onReceive }) => {
    const [clientCode, setClientCode] = useState<string>(generateClientCode)
    const [phase, setPhase] = useState<Phase>('connecting')
    const [resetKey, setResetKey] = useState(0)   // tăng để trigger reconnect mới
    const wsRef = useRef<WebSocket | null>(null)

    // Callback refs: luôn giữ phiên bản mới nhất mà KHÔNG trigger lại WebSocket effect
    const onCloseRef = useRef(onClose)
    const onReceiveRef = useRef(onReceive)
    useEffect(() => { onCloseRef.current = onClose }, [onClose])
    useEffect(() => { onReceiveRef.current = onReceive }, [onReceive])

    const closeWs = useCallback(() => {
        if (wsRef.current) {
            wsRef.current.onopen = null
            wsRef.current.onmessage = null
            wsRef.current.onerror = null
            wsRef.current.onclose = null
            wsRef.current.close()
            wsRef.current = null
        }
    }, [])

    /** Hủy kết nối: xóa session, tạo mã mới, quay về QR — KHÔNG đóng modal */
    const handleDisconnect = useCallback(() => {
        sessionStorage.removeItem(SESSION_KEY)
        closeWs()
        setResetKey(k => k + 1)  // trigger useEffect chạy lại → QR mới
    }, [closeWs])

    useEffect(() => {
        if (!isOpen) {
            closeWs()
            setPhase('connecting')
            return
        }

        // Nếu có session (đã connect, chưa hủy) → dùng lại code, vào thẳng NFC screen
        // Nếu không có (lần đầu mở hoặc sau khi hủy) → tạo mã mới, hiện QR
        const existingCode = sessionStorage.getItem(SESSION_KEY)
        const hasExisting = !!existingCode
        const code = existingCode ?? generateClientCode()

        setClientCode(code)
        setPhase('connecting')

        const ws = new WebSocket(WS_URL)
        wsRef.current = ws

        ws.onopen = () => {
            ws.send(JSON.stringify({ action: 'register', clientCode: code }))
            // Có session → vào thẳng NFC screen; chưa có → chờ quét QR
            setPhase(hasExisting ? 'waiting_nfc' : 'waiting_scan')
        }

        ws.onmessage = (event) => {
            try {
                const msg = JSON.parse(event.data as string)
                if (msg.event === 'direct_data' && msg.payload) {
                    const payload = msg.payload as NfcPayload

                    if (payload.status_code === 'CONNECT_OK') {
                        sessionStorage.setItem(SESSION_KEY, code) // ← lưu session khi ghép nối thành công
                        setPhase('waiting_nfc')
                        return
                    }

                    if (payload.status_code === 'NFC_DATA') {
                        setPhase('received')
                        onReceiveRef.current(payload)
                        setTimeout(() => onCloseRef.current(), 900)
                    }
                }
            } catch { /* ignore */ }
        }

        ws.onerror = () => setPhase('error')
        ws.onclose = () => { if (wsRef.current) setPhase('closed') }

        return () => closeWs()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen, resetKey, closeWs])

    /* ── Helpers ── */
    const isQrPhase = phase === 'connecting' || phase === 'waiting_scan'
    const isNfcPhase = phase === 'waiting_nfc'
    const isReceived = phase === 'received'
    const isError = phase === 'error' || phase === 'closed'

    const titleMap: Record<Phase, string> = {
        connecting: 'GHÉP NỐI THIẾT BỊ',
        waiting_scan: 'GHÉP NỐI THIẾT BỊ',
        waiting_nfc: 'ĐANG QUÉT NFC...',
        received: 'HOÀN THÀNH',
        error: 'LỖI KẾT NỐI',
        closed: 'MẤT KẾT NỐI',
    }

    const titleColorMap: Record<Phase, string> = {
        connecting: 'text-gray-500',
        waiting_scan: 'text-blue-600',
        waiting_nfc: 'text-blue-600',
        received: 'text-emerald-600',
        error: 'text-red-500',
        closed: 'text-gray-500',
    }

    return (
        <Modal
            isOpen={isOpen}
            onOpenChange={(open) => { if (!open) onClose() }}
            size="sm"
            backdrop="opaque"
            placement="center"
            classNames={{ base: 'rounded-2xl shadow-2xl', header: 'pb-0', footer: 'pt-2' }}
            isDismissable={false}
        >
            <ModalContent>
                {() => (
                    <>
                        <ModalHeader className="flex-col items-center gap-0 pt-7 pb-1">
                            <span className={`text-[17px] font-extrabold tracking-widest uppercase ${titleColorMap[phase]}`}>
                                {titleMap[phase]}
                            </span>
                        </ModalHeader>

                        <ModalBody className="flex flex-col items-center gap-4 py-4 px-6">

                            {/* ── Phase 1: Quét QR ── */}
                            {isQrPhase && (
                                <>
                                    {phase === 'connecting' ? (
                                        <div className="flex flex-col items-center gap-3 py-2">
                                            <ConnectingIllustration />
                                            <p className="text-sm text-gray-400 animate-pulse">Đang kết nối...</p>
                                        </div>
                                    ) : (
                                        <>
                                            <div className="p-3 border-2 border-gray-100 rounded-2xl shadow-sm bg-white">
                                                <QRCodeSVG
                                                    value={clientCode}
                                                    size={172}
                                                    level="M"
                                                    bgColor="#ffffff"
                                                    fgColor="#111827"
                                                />
                                            </div>
                                            <div className="text-center">
                                                <p className="text-xs text-gray-400 mb-1">Mã ghép nối (6 ký tự)</p>
                                                <p className="text-[28px] font-extrabold tracking-[0.22em] text-blue-600 font-mono leading-none">
                                                    {clientCode}
                                                </p>
                                            </div>
                                            <p className="text-center text-xs text-gray-400 leading-relaxed max-w-[220px]">
                                                Mở ứng dụng quét trên điện thoại và quét mã QR hoặc nhập mã code vào thiết bị chuyên dụng để bắt đầu.
                                            </p>
                                        </>
                                    )}
                                </>
                            )}

                            {/* ── Phase 2: Thiết bị đã kết nối, chờ quét NFC ── */}
                            {isNfcPhase && (
                                <>
                                    <DotLottieReact
                                        src={lottieNfc}
                                        loop
                                        autoplay
                                        style={{ width: 180, height: 180 }}
                                    />

                                    {/* Badge mã thiết bị */}
                                    <div className="w-full bg-green-50 border border-green-200 rounded-xl px-4 py-3 text-center">
                                        <span className="text-sm text-gray-500">Mã thiết bị đã kết nối:&nbsp;</span>
                                        <span className="text-[18px] font-extrabold tracking-[0.18em] text-green-600 font-mono">
                                            {clientCode}
                                        </span>
                                    </div>

                                    <p className="text-center text-sm text-gray-500 leading-relaxed max-w-[240px]">
                                        Vui lòng đặt thẻ CCCD gần thiết bị đọc NFC để thực hiện quét thông tin.
                                    </p>
                                </>
                            )}

                            {/* ── Phase 3: Đã nhận dữ liệu ── */}
                            {isReceived && (
                                <div className="flex flex-col items-center gap-3 py-4">
                                    <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center">
                                        <svg className="w-9 h-9 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                                        </svg>
                                    </div>
                                    <p className="text-base font-semibold text-emerald-600">Đã nhận dữ liệu thành công!</p>
                                    <p className="text-xs text-gray-400">Thông tin đang được điền vào form...</p>
                                </div>
                            )}

                            {/* ── Phase lỗi ── */}
                            {isError && (
                                <div className="flex flex-col items-center gap-3 py-4">
                                    <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center">
                                        <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                                        </svg>
                                    </div>
                                    <p className="text-sm text-gray-500 text-center">Không thể kết nối.<br />Vui lòng thử lại.</p>
                                </div>
                            )}

                            {/* Dot status */}
                            {!isReceived && (
                                <div className="flex items-center gap-2 text-xs text-gray-400">
                                    <span className={`inline-block w-2 h-2 rounded-full flex-shrink-0 ${phase === 'connecting' ? 'bg-yellow-400 animate-pulse' :
                                        phase === 'waiting_scan' ? 'bg-green-500 animate-pulse' :
                                            phase === 'waiting_nfc' ? 'bg-blue-500 animate-pulse' :
                                                phase === 'error' ? 'bg-red-500' :
                                                    'bg-gray-400'
                                        }`} />
                                    {phase === 'connecting' && 'Đang kết nối WebSocket...'}
                                    {phase === 'waiting_scan' && 'Chờ thiết bị quét mã QR'}
                                    {phase === 'waiting_nfc' && 'Thiết bị đã kết nối'}
                                    {phase === 'error' && 'Mất kết nối'}
                                    {phase === 'closed' && 'Kết nối đã đóng'}
                                </div>
                            )}
                        </ModalBody>

                        <ModalFooter className="flex-col gap-2 pb-6 px-6">
                            {/* Hủy ghép nối — chỉ hiện ở hình 2 (đã có kết nối cũ) */}
                            {isNfcPhase && (
                                <Button
                                    variant="bordered"
                                    color="danger"
                                    className="w-full font-bold tracking-widest"
                                    onPress={handleDisconnect}
                                >
                                    HỦY GHÉP NỐI
                                </Button>
                            )}

                            {/* ĐÓNG — luôn hiện (trừ lúc received tự đóng) */}
                            {!isReceived && (
                                <Button
                                    variant="bordered"
                                    color="primary"
                                    className="w-full font-semibold tracking-widest"
                                    onPress={onClose}
                                >
                                    ĐÓNG
                                </Button>
                            )}
                        </ModalFooter>
                    </>
                )}
            </ModalContent>
        </Modal>
    )
}
