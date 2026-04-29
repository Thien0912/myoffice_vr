import { useState, useMemo, memo } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  Card,
  CardHeader,
  CardBody,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Avatar,
  Chip,
  Button,
  Spinner,
  Input,
  Progress,
  Tabs,
  Tab,
  Select,
  SelectItem
} from '@heroui/react'
import { loginLogsAxios } from '@renderer/api/admin/loginLogsAxios'
import { Users, Building2, TrendingUp, Calendar, Clock, BarChart3, Download, PieChart } from 'lucide-react'
import {
  BarChart,
  Bar,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts'

// Memoized Date Range Filter Component
const DateRangeFilter = memo(({ 
  activeFilter, 
  startDate, 
  endDate,
  setToday,
  setLast7Days,
  setLast30Days,
  setThisMonth,
  setLastMonth,
  handleSetStartDate,
  handleSetEndDate,
  handleResetDateRange
}: {
  activeFilter: string
  startDate: string
  endDate: string
  setToday: () => void
  setLast7Days: () => void
  setLast30Days: () => void
  setThisMonth: () => void
  setLastMonth: () => void
  handleSetStartDate: (date: string) => void
  handleSetEndDate: (date: string) => void
  handleResetDateRange: () => void
}) => {
  return (
    <Card className="border border-gray-200 shadow-sm">
      <CardBody className="p-4">
        <div className="flex items-center gap-3 flex-wrap">
          <span className="text-sm font-medium text-gray-700">Bộ lọc thời gian:</span>
          
          {/* Preset Buttons */}
          <Button 
            size="sm" 
            variant={activeFilter === 'today' ? 'solid' : 'flat'}
            color={activeFilter === 'today' ? 'primary' : 'default'}
            onPress={setToday}
          >
            Hôm nay
          </Button>
          <Button 
            size="sm" 
            variant={activeFilter === '7days' ? 'solid' : 'flat'}
            color={activeFilter === '7days' ? 'primary' : 'default'}
            onPress={setLast7Days}
          >
            7 ngày
          </Button>
          <Button 
            size="sm" 
            variant={activeFilter === '30days' ? 'solid' : 'flat'}
            color={activeFilter === '30days' ? 'primary' : 'default'}
            onPress={setLast30Days}
          >
            30 ngày
          </Button>
          <Button 
            size="sm" 
            variant={activeFilter === 'thisMonth' ? 'solid' : 'flat'}
            color={activeFilter === 'thisMonth' ? 'primary' : 'default'}
            onPress={setThisMonth}
          >
            Tháng này
          </Button>
          <Button 
            size="sm" 
            variant={activeFilter === 'lastMonth' ? 'solid' : 'flat'}
            color={activeFilter === 'lastMonth' ? 'primary' : 'default'}
            onPress={setLastMonth}
          >
            Tháng trước
          </Button>

          <div className="h-6 w-px bg-gray-300"></div>

          {/* Custom Date Inputs */}
          <Input
            type="date"
            label="Từ ngày"
            value={startDate}
            onChange={(e) => handleSetStartDate(e.target.value)}
            className="w-40"
            variant="bordered"
            size="sm"
          />
          <Input
            type="date"
            label="Đến ngày"
            value={endDate}
            onChange={(e) => handleSetEndDate(e.target.value)}
            className="w-40"
            variant="bordered"
            size="sm"
          />
          
          {(startDate || endDate) && (
            <Button size="sm" variant="light" color="danger" onPress={handleResetDateRange}>
              Xóa bộ lọc
            </Button>
          )}
        </div>
      </CardBody>
    </Card>
  )
})

DateRangeFilter.displayName = 'DateRangeFilter'

export default function LoginAnalyticsPage() {
  const [startDate, setStartDate] = useState<string>('')
  const [endDate, setEndDate] = useState<string>('')
  const [selectedTab, setSelectedTab] = useState<string>('overview')
  const [activeFilter, setActiveFilter] = useState<string>('all') // 'all', 'today', '7days', '30days', 'thisMonth', 'lastMonth', 'custom'

  const { data, isLoading } = useQuery({
    queryKey: ['loginStatistics', startDate, endDate],
    queryFn: async () => {
      const response = await loginLogsAxios.getStatistics({
        start_date: startDate || undefined,
        end_date: endDate || undefined
      })
      return response.data // Access data property from API response
    }
  })

  const handleResetDateRange = () => {
    setStartDate('')
    setEndDate('')
    setActiveFilter('all')
  }

  const handleSetStartDate = (date: string) => {
    setStartDate(date)
    setActiveFilter('custom')
  }

  const handleSetEndDate = (date: string) => {
    setEndDate(date)
    setActiveFilter('custom')
  }

  // Preset date ranges
  const setToday = () => {
    const today = new Date().toISOString().split('T')[0]
    setStartDate(today)
    setEndDate(today)
    setActiveFilter('today')
  }

  const setLast7Days = () => {
    const end = new Date()
    const start = new Date(end.getTime() - 6 * 24 * 60 * 60 * 1000)
    setStartDate(start.toISOString().split('T')[0])
    setEndDate(end.toISOString().split('T')[0])
    setActiveFilter('7days')
  }

  const setLast30Days = () => {
    const end = new Date()
    const start = new Date(end.getTime() - 29 * 24 * 60 * 60 * 1000)
    setStartDate(start.toISOString().split('T')[0])
    setEndDate(end.toISOString().split('T')[0])
    setActiveFilter('30days')
  }

  const setThisMonth = () => {
    const now = new Date()
    const start = new Date(now.getFullYear(), now.getMonth(), 1)
    const end = new Date()
    setStartDate(start.toISOString().split('T')[0])
    setEndDate(end.toISOString().split('T')[0])
    setActiveFilter('thisMonth')
  }

  const setLastMonth = () => {
    const now = new Date()
    const start = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    const end = new Date(now.getFullYear(), now.getMonth(), 0)
    setStartDate(start.toISOString().split('T')[0])
    setEndDate(end.toISOString().split('T')[0])
    setActiveFilter('lastMonth')
  }

  // Format date range text
  const dateRangeText = useMemo(() => {
    if (!startDate && !endDate) return 'Tất cả thời gian'
    if (startDate && !endDate) return `Từ ${new Date(startDate).toLocaleDateString('vi-VN')}`
    if (!startDate && endDate) return `Đến ${new Date(endDate).toLocaleDateString('vi-VN')}`
    return `${new Date(startDate).toLocaleDateString('vi-VN')} - ${new Date(endDate).toLocaleDateString('vi-VN')}`
  }, [startDate, endDate])

  // Tính toán thời lượng trung bình (giả sử mỗi session 15 phút)
  const avgSessionDuration = useMemo(() => {
    if (!data?.summary?.total_logins) return 0
    return Math.round((data.summary.total_logins * 15) / data.summary.total_users)
  }, [data])

  // Tính tổng thời gian
  const totalDuration = useMemo(() => {
    if (!data?.summary?.total_logins) return 0
    return Math.round((data.summary.total_logins * 15) / 60) // hours
  }, [data])

  // Prepare pie chart data with validation
  const pieChartData = useMemo(() => {
    if (!data?.by_department) return []
    return data.by_department
      .slice(0, 10)
      .filter((dept: any) => dept.login_count > 0)
      .map((dept: any) => ({
        don_vi: dept.don_vi || 'Chưa xác định',
        login_count: parseInt(dept.login_count) || 0,
        user_count: parseInt(dept.user_count) || 0
      }))
  }, [data?.by_department])

  if (isLoading) {
    return (
      <div className="flex h-[calc(100vh-200px)] items-center justify-center">
        <Spinner size="lg" label="Đang tải thống kê..." />
      </div>
    )
  }

  const statistics = data

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Báo cáo đăng nhập</h1>
          <p className="mt-1 text-sm text-gray-500">
            Thống kê lượt truy cập hệ thống • <span className="font-medium text-primary">{dateRangeText}</span>
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button size="sm" color="primary" startContent={<Download size={16} />}>
            Xuất Excel
          </Button>
        </div>
      </div>

      {/* Date Range Filter */}
      <DateRangeFilter
        activeFilter={activeFilter}
        startDate={startDate}
        endDate={endDate}
        setToday={setToday}
        setLast7Days={setLast7Days}
        setLast30Days={setLast30Days}
        setThisMonth={setThisMonth}
        setLastMonth={setLastMonth}
        handleSetStartDate={handleSetStartDate}
        handleSetEndDate={handleSetEndDate}
        handleResetDateRange={handleResetDateRange}
      />

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border border-gray-200 shadow-sm">
          <CardBody className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium uppercase text-gray-500">Tổng hồ sơ</p>
                <h3 className="mt-2 text-3xl font-bold text-blue-600">
                  {statistics?.summary?.total_logins?.toLocaleString() || '0'}
                </h3>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-50">
                <TrendingUp className="h-6 w-6 text-blue-500" />
              </div>
            </div>
          </CardBody>
        </Card>

        <Card className="border border-gray-200 shadow-sm">
          <CardBody className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium uppercase text-gray-500">Số người dùng</p>
                <h3 className="mt-2 text-3xl font-bold text-green-600">
                  {statistics?.summary?.total_users?.toLocaleString() || '0'}
                </h3>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-50">
                <Users className="h-6 w-6 text-green-500" />
              </div>
            </div>
          </CardBody>
        </Card>

        <Card className="border border-gray-200 shadow-sm">
          <CardBody className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium uppercase text-gray-500">Thời lượng TB</p>
                <h3 className="mt-2 text-3xl font-bold text-purple-600">{avgSessionDuration} phút</h3>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-purple-50">
                <Clock className="h-6 w-6 text-purple-500" />
              </div>
            </div>
          </CardBody>
        </Card>

        <Card className="border border-gray-200 shadow-sm">
          <CardBody className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium uppercase text-gray-500">Tổng thời gian</p>
                <h3 className="mt-2 text-3xl font-bold text-orange-600">{totalDuration}h</h3>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-orange-50">
                <BarChart3 className="h-6 w-6 text-orange-500" />
              </div>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs
        selectedKey={selectedTab}
        onSelectionChange={(key) => setSelectedTab(key as string)}
        variant="underlined"
        classNames={{
          tabList: 'gap-6 border-b border-gray-200',
          cursor: 'bg-primary',
          tab: 'px-0',
          tabContent: 'text-gray-600 group-data-[selected=true]:text-primary'
        }}
      >
        <Tab key="overview" title="Tổng quan" />
        <Tab key="department" title="Theo đơn vị" />
        <Tab key="users" title="Người dùng" />
        <Tab key="timeline" title="Theo thời gian" />
      </Tabs>

      {/* Tab Content */}
      <div className="mt-4">
        {selectedTab === 'overview' && (
          <>
          <div className="grid grid-cols-1 gap-2 lg:grid-cols-2">
            {/* Thống kê theo đơn vị - Bar Chart Style */}
            <Card className="border border-gray-200 shadow-sm">
              <CardHeader className="border-b border-gray-100 px-6 py-4">
                <div className="flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-primary" />
                  <h2 className="text-lg font-semibold">Truy cập theo đơn vị</h2>
                </div>
              </CardHeader>
              <CardBody className="p-6">
                <div className="space-y-4">
                  {statistics?.by_department?.slice(0, 10).map((dept, index) => {
                    const maxCount = statistics.by_department[0]?.login_count || 1
                    const percentage = (dept.login_count / maxCount) * 100
                    return (
                      <div key={index} className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="font-medium text-gray-700">
                            {dept.don_vi || 'Chưa xác định'}
                          </span>
                          <div className="flex items-center gap-3">
                            <span className="text-xs text-gray-500">{dept.user_count} người</span>
                            <Chip size="sm" variant="flat" color="primary" className="font-semibold">
                              {dept.login_count} lần
                            </Chip>
                          </div>
                        </div>
                        <Progress
                          value={percentage}
                          size="sm"
                          color="primary"
                          className="max-w-full"
                        />
                      </div>
                    )
                  }) || []}
                </div>
              </CardBody>
            </Card>

            {/* Top người dùng */}
            <Card className="border border-gray-200 shadow-sm">
              <CardHeader className="border-b border-gray-100 px-6 py-4">
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-success" />
                  <h2 className="text-lg font-semibold">Top người dùng</h2>
                </div>
              </CardHeader>
              <CardBody className="p-0">
                <div className="divide-y divide-gray-100">
                  {statistics?.top_users?.slice(0, 10).map((user, index) => (
                    <div key={user.ql_nguoi_dung_id} className="flex items-center gap-4 p-4">
                      <div
                        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
                          index === 0
                            ? 'bg-yellow-100 text-yellow-700'
                            : index === 1
                              ? 'bg-gray-100 text-gray-700'
                              : index === 2
                                ? 'bg-orange-100 text-orange-700'
                                : 'bg-blue-50 text-blue-600'
                        }`}
                      >
                        {index + 1}
                      </div>
                      <Avatar
                        src={user.ql_nguoi_dung_avatar}
                        name={user.ql_nguoi_dung_ho_ten}
                        size="sm"
                        showFallback
                        className="shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="truncate font-medium text-sm">
                          {user.ql_nguoi_dung_ho_ten}
                        </div>
                        <div className="truncate text-xs text-gray-500">{user.don_vi || '-'}</div>
                      </div>
                      <Chip
                        size="sm"
                        variant="flat"
                        color={index < 3 ? 'success' : 'default'}
                        className="shrink-0 font-semibold"
                      >
                        {user.login_count}
                      </Chip>
                    </div>
                  )) || []}
                </div>
              </CardBody>
            </Card>

            {/* Biểu đồ cột - Thống kê theo ngày */}
            <Card className="border border-gray-200 shadow-sm lg:col-span-2">
              <CardHeader className="border-b border-gray-100 px-6 py-4">
                <div className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-blue-600" />
                  <h2 className="text-lg font-semibold">Thống kê truy cập theo ngày</h2>
                </div>
              </CardHeader>
              <CardBody className="p-6">
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={statistics?.daily_stats || []}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis
                      dataKey="date"
                      tick={{ fontSize: 12 }}
                      tickFormatter={(value) => {
                        const date = new Date(value)
                        return `${date.getDate()}/${date.getMonth() + 1}`
                      }}
                    />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'white',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                      }}
                      labelFormatter={(value) => {
                        const date = new Date(value)
                        return `Ngày ${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`
                      }}
                    />
                    <Legend />
                    <Bar dataKey="login_count" name="Lượt truy cập" fill="#3b82f6" radius={[8, 8, 0, 0]} />
                    <Bar dataKey="user_count" name="Số người dùng" fill="#10b981" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardBody>
            </Card>
          </div>

          {/* Grid 2 cột cho Biểu đồ tròn và Biểu đồ Area */}
          <div className="grid grid-cols-1 gap-2 lg:grid-cols-12 mt-2">
            {/* Biểu đồ tròn - Phân bổ theo đơn vị */}
            <Card className="border border-gray-200 shadow-sm lg:col-span-6">
              <CardHeader className="border-b border-gray-100 px-6 py-4">
                <div className="flex items-center gap-2">
                  <PieChart className="h-5 w-5 text-purple-600" />
                  <h2 className="text-lg font-semibold">Phân bổ truy cập theo đơn vị</h2>
                </div>
              </CardHeader>
              <CardBody className="p-6">
                {pieChartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={400}>
                    <RechartsPieChart>
                      <Pie
                        data={pieChartData}
                        dataKey="login_count"
                        nameKey="don_vi"
                        cx="50%"
                        cy="50%"
                        innerRadius={0}
                        outerRadius={120}
                        fill="#8884d8"
                        paddingAngle={2}
                        label={({ name, percent }: any) => {
                          if (!name || percent === undefined) return ''
                          return `${(percent * 100).toFixed(0)}%`
                        }}
                        labelLine={false}
                      >
                        {pieChartData.map((_, index) => {
                          const colors = [
                            '#3b82f6', // blue
                            '#10b981', // green
                            '#f59e0b', // amber
                            '#ef4444', // red
                            '#8b5cf6', // purple
                            '#06b6d4', // cyan
                            '#ec4899', // pink
                            '#84cc16', // lime
                            '#f97316', // orange
                            '#6366f1'  // indigo
                          ]
                          return <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                        })}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'white',
                          border: '1px solid #e5e7eb',
                          borderRadius: '8px',
                          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                        }}
                      />
                      <Legend
                        verticalAlign="bottom"
                        height={36}
                        wrapperStyle={{ fontSize: '12px' }}
                      />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex h-[400px] items-center justify-center text-gray-400">
                    <div className="text-center">
                      <PieChart className="mx-auto h-12 w-12 mb-3 opacity-50" />
                      <p className="text-sm">Chưa có dữ liệu thống kê theo đơn vị</p>
                    </div>
                  </div>
                )}
              </CardBody>
            </Card>

            {/* Biểu đồ Area - Xu hướng truy cập */}
            <Card className="border border-gray-200 shadow-sm lg:col-span-6">
              <CardHeader className="border-b border-gray-100 px-6 py-4">
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-blue-600" />
                    <h2 className="text-lg font-semibold">Xu hướng truy cập theo thời gian</h2>
                  </div>
                </div>
              </CardHeader>
              <CardBody className="p-6">
                {statistics?.daily_stats && statistics.daily_stats.length > 0 ? (
                  <ResponsiveContainer width="100%" height={400}>
                    <AreaChart data={statistics.daily_stats}>
                      <defs>
                        <linearGradient id="colorLogins" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                          <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis
                        dataKey="date"
                        tick={{ fontSize: 12 }}
                        tickFormatter={(value) => {
                          const date = new Date(value)
                          return `${date.getDate()}/${date.getMonth() + 1}`
                        }}
                      />
                      <YAxis tick={{ fontSize: 12 }} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'white',
                          border: '1px solid #e5e7eb',
                          borderRadius: '8px',
                          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                        }}
                        labelFormatter={(value) => {
                          const date = new Date(value)
                          const dayNames = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7']
                          return `${dayNames[date.getDay()]}, ${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`
                        }}
                      />
                      <Area
                        type="monotone"
                        dataKey="login_count"
                        name="Lượt truy cập"
                        stroke="#3b82f6"
                        strokeWidth={2}
                        fillOpacity={1}
                        fill="url(#colorLogins)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex h-[400px] items-center justify-center text-gray-400">
                    <div className="text-center">
                      <TrendingUp className="mx-auto h-12 w-12 mb-3 opacity-50" />
                      <p className="text-sm">Chưa có dữ liệu xu hướng</p>
                    </div>
                  </div>
                )}
              </CardBody>
            </Card>
          </div>
          </>
        )}

        {selectedTab === 'department' && (
          <Card className="border border-gray-200 shadow-sm">
            <CardHeader className="border-b border-gray-100 px-6 py-4">
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-primary" />
                  <h2 className="text-lg font-semibold">Chi tiết theo đơn vị</h2>
                </div>
                <Button size="sm" variant="flat" startContent={<Download size={16} />}>
                  Xuất báo cáo
                </Button>
              </div>
            </CardHeader>
            <CardBody className="p-0">
              <Table
                aria-label="Thống kê theo đơn vị"
                removeWrapper
                classNames={{
                  th: 'bg-gray-50 text-xs font-semibold uppercase',
                  td: 'border-b border-gray-100'
                }}
              >
                <TableHeader>
                  <TableColumn>STT</TableColumn>
                  <TableColumn>TÊN ĐƠN VỊ</TableColumn>
                  <TableColumn align="center">SỐ NGƯỜI DÙNG</TableColumn>
                  <TableColumn align="center">LƯỢT TRUY CẬP</TableColumn>
                  <TableColumn align="center">TỶ LỆ</TableColumn>
                </TableHeader>
                <TableBody emptyContent="Chưa có dữ liệu">
                  {statistics?.by_department?.map((dept, index) => {
                    const totalLogins = statistics.summary.total_logins || 1
                    const percentage = ((dept.login_count / totalLogins) * 100).toFixed(1)
                    return (
                      <TableRow key={index}>
                        <TableCell>
                          <span className="font-medium text-gray-600">{index + 1}</span>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">{dept.don_vi || 'Chưa xác định'}</div>
                        </TableCell>
                        <TableCell>
                          <div className="flex justify-center">
                            <Chip size="sm" variant="flat" color="primary">
                              {dept.user_count} người
                            </Chip>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex justify-center">
                            <Chip size="sm" variant="flat" color="secondary">
                              {dept.login_count} lần
                            </Chip>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center justify-center gap-2">
                            <Progress
                              value={parseFloat(percentage)}
                              size="sm"
                              color="success"
                              className="max-w-[100px]"
                            />
                            <span className="text-xs font-medium text-gray-600">
                              {percentage}%
                            </span>
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  }) || []}
                </TableBody>
              </Table>
            </CardBody>
          </Card>
        )}

        {selectedTab === 'users' && (
          <Card className="border border-gray-200 shadow-sm">
            <CardHeader className="border-b border-gray-100 px-6 py-4">
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-success" />
                  <h2 className="text-lg font-semibold">Danh sách người dùng truy cập</h2>
                </div>
                <Select
                  size="sm"
                  placeholder="Lọc theo đơn vị"
                  className="max-w-xs"
                  variant="bordered"
                >
                  <SelectItem key="all">
                    Tất cả
                  </SelectItem>
                  {statistics?.by_department?.map((dept, index) => (
                    <SelectItem key={index}>
                      {dept.don_vi}
                    </SelectItem>
                  )) || []}
                </Select>
              </div>
            </CardHeader>
            <CardBody className="p-0">
              <Table
                aria-label="Danh sách người dùng"
                removeWrapper
                classNames={{
                  th: 'bg-gray-50 text-xs font-semibold uppercase',
                  td: 'border-b border-gray-100'
                }}
              >
                <TableHeader>
                  <TableColumn>XẾP HẠNG</TableColumn>
                  <TableColumn>NGƯỜI DÙNG</TableColumn>
                  <TableColumn>ĐƠN VỊ</TableColumn>
                  <TableColumn align="center">SỐ LẦN ĐĂNG NHẬP</TableColumn>
                  <TableColumn align="center">THỜI LƯỢNG ƯỚC TÍNH</TableColumn>
                </TableHeader>
                <TableBody emptyContent="Chưa có dữ liệu">
                  {statistics?.top_users?.map((user, index) => {
                    const estimatedTime = user.login_count * 15 // minutes
                    return (
                      <TableRow key={user.ql_nguoi_dung_id}>
                        <TableCell>
                          <div
                            className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold ${
                              index === 0
                                ? 'bg-yellow-100 text-yellow-700'
                                : index === 1
                                  ? 'bg-gray-100 text-gray-700'
                                  : index === 2
                                    ? 'bg-orange-100 text-orange-700'
                                    : 'bg-blue-50 text-blue-600'
                            }`}
                          >
                            {index + 1}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar
                              src={user.ql_nguoi_dung_avatar}
                              name={user.ql_nguoi_dung_ho_ten}
                              size="sm"
                              showFallback
                            />
                            <div>
                              <div className="font-medium">{user.ql_nguoi_dung_ho_ten}</div>
                              <div className="text-xs text-gray-500">
                                {user.ql_nguoi_dung_email}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm text-gray-600">{user.don_vi || '-'}</span>
                        </TableCell>
                        <TableCell>
                          <div className="flex justify-center">
                            <Chip
                              size="sm"
                              variant="flat"
                              color={index < 3 ? 'success' : 'default'}
                              className="font-semibold"
                            >
                              {user.login_count} lần
                            </Chip>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex justify-center">
                            <Chip size="sm" variant="flat" color="secondary">
                              {estimatedTime >= 60
                                ? `${Math.round(estimatedTime / 60)}h ${estimatedTime % 60}p`
                                : `${estimatedTime}p`}
                            </Chip>
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  }) || []}
                </TableBody>
              </Table>
            </CardBody>
          </Card>
        )}

        {selectedTab === 'timeline' && (
          <Card className="border border-gray-200 shadow-sm">
            <CardHeader className="border-b border-gray-100 px-6 py-4">
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-warning" />
                <h2 className="text-lg font-semibold">Thống kê theo thời gian</h2>
              </div>
            </CardHeader>
            <CardBody className="p-0">
              <div className="max-h-[600px] overflow-y-auto">
                <Table
                  aria-label="Thống kê theo ngày"
                  removeWrapper
                  classNames={{
                    th: 'bg-gray-50 sticky top-0 z-10 text-xs font-semibold uppercase',
                    td: 'border-b border-gray-100'
                  }}
                >
                  <TableHeader>
                    <TableColumn>NGÀY</TableColumn>
                    <TableColumn>THỨ</TableColumn>
                    <TableColumn align="center">SỐ NGƯỜI DÙNG</TableColumn>
                    <TableColumn align="center">LƯỢT TRUY CẬP</TableColumn>
                    <TableColumn align="center">THỜI LƯỢNG ƯỚC TÍNH</TableColumn>
                  </TableHeader>
                  <TableBody>
                    {statistics?.daily_stats?.map((stat, index) => {
                      const date = new Date(stat.date)
                      const estimatedHours = Math.round((stat.login_count * 15) / 60)
                      const dayName = date.toLocaleDateString('vi-VN', { weekday: 'long' })
                      return (
                        <TableRow key={index}>
                          <TableCell>
                            <span className="font-medium">
                              {date.toLocaleDateString('vi-VN', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric'
                              })}
                            </span>
                          </TableCell>
                          <TableCell>
                            <span className="text-sm text-gray-600 capitalize">{dayName}</span>
                          </TableCell>
                          <TableCell>
                            <div className="flex justify-center">
                              <Chip size="sm" variant="flat" color="primary">
                                {stat.user_count} người
                              </Chip>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex justify-center">
                              <Chip size="sm" variant="flat" color="secondary">
                                {stat.login_count} lần
                              </Chip>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex justify-center">
                              <Chip size="sm" variant="flat" color="warning">
                                {estimatedHours}h
                              </Chip>
                            </div>
                          </TableCell>
                        </TableRow>
                      )
                    }) || []}
                  </TableBody>
                </Table>
              </div>
            </CardBody>
          </Card>
        )}
      </div>
    </div>
  )
}
