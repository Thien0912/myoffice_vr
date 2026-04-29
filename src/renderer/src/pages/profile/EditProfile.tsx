import {
  Avatar,
  Button,
  Card,
  CardBody,
  CardHeader,
  DateInput,
  Divider,
  Input,
  Select,
  SelectItem,
  Tab,
  Tabs,
  Textarea
} from '@heroui/react'
import { Briefcase, Camera, Mail, MapPin, Phone, Save, User, UserCircle } from 'lucide-react'
import { useState } from 'react'
import Hopdong from './components/elements/Hopdong'

export default function EditProfile() {
  const [selectedTab, setSelectedTab] = useState('personal')

  return (
    <div className="flex flex-col gap-4 h-full p-4 bg-slate-50 overflow-y-auto">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">Hồ sơ nhân viên</h1>
        <div className="flex gap-2">
          <Button color="primary" startContent={<Save size={18} />}>
            Lưu thay đổi
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Left Column: Avatar & Short Info */}
        <div className="md:col-span-4 lg:col-span-3 space-y-4">
          <Card className="w-full">
            <CardBody className="flex flex-col items-center gap-4 py-8">
              <div className="relative group">
                <Avatar
                  src="https://i.pravatar.cc/150?u=a042581f4e29026704d"
                  className="w-32 h-32 text-large"
                />
                <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                  <Camera className="text-white" />
                </div>
              </div>
              <div className="text-center">
                <h2 className="text-xl font-bold text-gray-800">Nguyễn Văn A</h2>
                <p className="text-gray-500 text-sm">Nhân viên IT</p>
                <div className="mt-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  Đang làm việc
                </div>
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardHeader className="pb-0 pt-4 px-4 flex-col items-start">
              <h4 className="font-bold text-large">Thông tin liên hệ</h4>
            </CardHeader>
            <CardBody className="py-4 space-y-3">
              <div className="flex items-center gap-3 text-gray-600">
                <Mail size={18} />
                <span className="text-sm">nguyenvana@example.com</span>
              </div>
              <div className="flex items-center gap-3 text-gray-600">
                <Phone size={18} />
                <span className="text-sm">0901234567</span>
              </div>
              <div className="flex items-center gap-3 text-gray-600">
                <MapPin size={18} />
                <span className="text-sm">Hà Nội, Việt Nam</span>
              </div>
            </CardBody>
          </Card>
        </div>

        {/* Right Column: Detailed Form */}
        <div className="md:col-span-8 lg:col-span-9">
          <Card className="h-full">
            <CardBody className="p-0">
              <Tabs
                aria-label="Profile Options"
                selectedKey={selectedTab}
                onSelectionChange={(key) => setSelectedTab(key as string)}
                classNames={{
                  tabList: 'p-4 w-full justify-start gap-4',
                  cursor: 'w-full bg-primary',
                  tab: 'max-w-fit px-4 h-10',
                  tabContent: 'group-data-[selected=true]:text-primary font-medium'
                }}
                variant="underlined"
              >
                <Tab
                  key="personal"
                  title={
                    <div className="flex items-center gap-2">
                      <UserCircle size={18} />
                      <span>Thông tin cá nhân</span>
                    </div>
                  }
                >
                  <div className="p-6 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <Input
                        label="Họ và tên"
                        placeholder="Nhập họ và tên"
                        labelPlacement="outside"
                        defaultValue="Nguyễn Văn A"
                        startContent={<User size={18} className="text-gray-400" />}
                      />
                      <Input
                        label="Mã nhân viên"
                        placeholder="Nhập mã nhân viên"
                        labelPlacement="outside"
                        defaultValue="NV001"
                        isReadOnly
                      />
                      <Input
                        label="Email"
                        placeholder="Nhập email"
                        type="email"
                        labelPlacement="outside"
                        defaultValue="nguyenvana@example.com"
                        startContent={<Mail size={18} className="text-gray-400" />}
                      />
                      <Input
                        label="Số điện thoại"
                        placeholder="Nhập số điện thoại"
                        labelPlacement="outside"
                        defaultValue="0901234567"
                        startContent={<Phone size={18} className="text-gray-400" />}
                      />
                      <DateInput label="Ngày sinh" labelPlacement="outside" />
                      <Select
                        label="Giới tính"
                        labelPlacement="outside"
                        placeholder="Chọn giới tính"
                      >
                        <SelectItem key="nam">Nam</SelectItem>
                        <SelectItem key="nu">Nữ</SelectItem>
                        <SelectItem key="khac">Khác</SelectItem>
                      </Select>
                      <Input
                        label="CCCD/CMND"
                        placeholder="Nhập số CCCD/CMND"
                        labelPlacement="outside"
                      />
                      <DateInput label="Ngày cấp" labelPlacement="outside" />
                      <Input
                        label="Nơi cấp"
                        placeholder="Nhập nơi cấp"
                        labelPlacement="outside"
                        className="md:col-span-2"
                      />
                      <Textarea
                        label="Địa chỉ thường trú"
                        placeholder="Nhập địa chỉ thường trú"
                        labelPlacement="outside"
                        className="md:col-span-2"
                      />
                    </div>
                  </div>
                </Tab>

                <Tab
                  key="work"
                  title={
                    <div className="flex items-center gap-2">
                      <Briefcase size={18} />
                      <span>Công việc</span>
                    </div>
                  }
                >
                  <div className="p-6 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <Select
                        label="Phòng ban"
                        labelPlacement="outside"
                        placeholder="Chọn phòng ban"
                      >
                        <SelectItem key="it">Phòng IT</SelectItem>
                        <SelectItem key="hr">Phòng Nhân sự</SelectItem>
                        <SelectItem key="sales">Phòng Kinh doanh</SelectItem>
                      </Select>
                      <Select
                        label="Vị trí / Chức vụ"
                        labelPlacement="outside"
                        placeholder="Chọn vị trí"
                      >
                        <SelectItem key="dev">Developer</SelectItem>
                        <SelectItem key="manager">Manager</SelectItem>
                        <SelectItem key="staff">Staff</SelectItem>
                      </Select>
                      <DateInput label="Ngày bắt đầu làm việc" labelPlacement="outside" />
                      <Select
                        label="Trạng thái làm việc"
                        labelPlacement="outside"
                        placeholder="Chọn trạng thái"
                        defaultSelectedKeys={['working']}
                      >
                        <SelectItem key="working">Đang làm việc</SelectItem>
                        <SelectItem key="probation">Thử việc</SelectItem>
                        <SelectItem key="resigned">Đã nghỉ việc</SelectItem>
                      </Select>
                      <Select
                        label="Loại hợp đồng"
                        labelPlacement="outside"
                        placeholder="Chọn loại hợp đồng"
                      >
                        <SelectItem key="official">Chính thức</SelectItem>
                        <SelectItem key="parttime">Bán thời gian</SelectItem>
                        <SelectItem key="intern">Thực tập</SelectItem>
                      </Select>
                    </div>

                    <Divider className="my-4" />
                    <Hopdong />
                  </div>
                </Tab>
              </Tabs>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  )
}
