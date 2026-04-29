import { Modal, Tabs, Button } from '@heroui-v3/react'
import { Check, Monitor, Moon, Sun } from 'lucide-react'
import React from 'react'
import { ThemeColor, useThemeStore } from '@renderer/store/useThemeStore'

type SystemConfigModalProps = {
  isOpen: boolean
  onClose: () => void
}

export default function SystemConfigModal({ isOpen, onClose }: SystemConfigModalProps) {
  const { mode, themeColor, setMode, setThemeColor } = useThemeStore()

  const colors: { value: ThemeColor; label: string; class: string }[] = [
    { value: 'blue', label: 'Xanh dương', class: 'bg-blue-500' },
    { value: 'indigo', label: 'Xanh chàm', class: 'bg-indigo-500' },
    { value: 'green', label: 'Xanh lá', class: 'bg-green-500' },
    { value: 'orange', label: 'Cam', class: 'bg-orange-500' },
    { value: 'rose', label: 'Hồng', class: 'bg-rose-500' }
  ]

  return (
    <Modal.Backdrop isOpen={isOpen} onOpenChange={(open) => !open && onClose()} variant="blur">
      <Modal.Container size="lg" placement="center" scroll="inside">
        <Modal.Dialog>
          <Modal.Header className="flex flex-col gap-1">
            <Modal.Heading>Cấu hình hệ thống</Modal.Heading>
          </Modal.Header>
          <Modal.Body className="pb-6">
            <Tabs aria-label="Options" defaultSelectedKey="appearance">
              <Tabs.List>
                <Tabs.Tab id="appearance">
                  <div className="flex items-center space-x-2">
                    <Monitor size={18} />
                    <span>Giao diện</span>
                  </div>
                </Tabs.Tab>
                <Tabs.Tab id="notifications">
                  <div className="flex items-center space-x-2">
                    <span>Thông báo</span>
                  </div>
                </Tabs.Tab>
              </Tabs.List>

              <Tabs.Panel id="appearance">
                <div className="py-4 space-y-6">
                  {/* Chế độ Sáng / Tối */}
                  <div className="space-y-3">
                    <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                      Chế độ hiển thị
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                      <Button
                        variant={mode === 'light' ? 'primary' : 'outline'}
                        className="h-auto p-4 flex flex-col gap-3 rounded-xl"
                        onPress={() => setMode('light')}
                      >
                        <div className="p-3 bg-white rounded-full shadow-sm text-orange-500">
                          <Sun size={24} />
                        </div>
                        <span className="font-medium text-sm">Chế độ Sáng</span>
                      </Button>

                      <Button
                        isDisabled
                        variant="outline"
                        className="h-auto p-4 flex flex-col gap-3 rounded-xl opacity-50"
                      >
                        <div className="p-3 bg-gray-800 rounded-full shadow-sm text-blue-400">
                          <Moon size={24} />
                        </div>
                        <span className="font-medium text-sm">Chế độ Tối (Đang bảo trì)</span>
                      </Button>
                    </div>
                  </div>

                  {/* Màu chủ đạo */}
                  <div className="space-y-3">
                    <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                      Màu chủ đạo
                    </h3>
                    <div className="flex flex-wrap gap-3">
                      {colors.map((color) => (
                        <Button
                          key={color.value}
                          isDisabled
                          variant="ghost"
                          className={`min-w-0 w-12 h-12 p-0 rounded-full flex items-center justify-center opacity-50 ${color.class} ${
                            themeColor === color.value ? 'ring-2 ring-offset-2 ring-blue-500' : ''
                          }`}
                        >
                          {themeColor === color.value && <Check className="text-white" size={20} />}
                        </Button>
                      ))}
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      * Màu chủ đạo sẽ được áp dụng cho các nút, liên kết và các thành phần nổi bật
                      khác.
                    </p>
                  </div>
                </div>
              </Tabs.Panel>

              <Tabs.Panel id="notifications">
                <div className="py-4 text-center text-gray-500">Tính năng đang phát triển...</div>
              </Tabs.Panel>
            </Tabs>
          </Modal.Body>
        </Modal.Dialog>
      </Modal.Container>
    </Modal.Backdrop>
  )
}
