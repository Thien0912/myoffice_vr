import './patch' // Phải luôn nằm đầu tiên để apply cấu hình locale 
import './assets/main.css'

import { createRoot } from 'react-dom/client'
import { Toast } from '@heroui-v3/react'
import { HeroUIProvider } from '@heroui/react'
import { I18nProvider } from '@react-aria/i18n'
import { QueryClientProvider } from '@tanstack/react-query'

import { queryClient } from './lib/queryClient'
import App from './App'

// React Grab - development tool for copying UI element context
if (import.meta.env.DEV) {
    import('react-grab')
}

// Tự động reload trang khi gặp lỗi tải module (thường xảy ra sau khi deploy phiên bản mới)
window.addEventListener('error', (e) => {
    if (e.message.includes('Failed to fetch dynamically imported module')) {
        window.location.reload()
    }
})

window.addEventListener('unhandledrejection', (e) => {
    if (e.reason?.message?.includes('Failed to fetch dynamically imported module')) {
        window.location.reload()
    }
})

createRoot(document.getElementById('root')!).render(
    <I18nProvider locale="en-GB">
        <HeroUIProvider locale="en-GB">
            <Toast.Provider placement="top" className="z-[9999]" />
            <QueryClientProvider client={queryClient}>
                <App />
            </QueryClientProvider>
        </HeroUIProvider>
    </I18nProvider>
)
