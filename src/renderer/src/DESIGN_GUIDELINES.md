# Quy chuẩn Thiết kế UI/UX (Design Standards)

Dựa trên phong cách đã thực hiện tại trang `ThongBaoPage`, dưới đây là các quy chuẩn thiết kế cần áp dụng cho toàn bộ dự án để đảm bảo sự đồng bộ và thẩm mỹ.

## 1. Màu sắc & Giao diện (Colors & Theme)
- **Nền trang (Page Background)**:
  - Light: `bg-gray-50/50`
  - Dark: `dark:bg-gray-900`
- **Nền thẻ/Container (Card Background)**:
  - Light: `bg-white`
  - Dark: `dark:bg-gray-800`
- **Đường viền (Borders)**:
  - Light: `border-gray-100` hoặc `border-gray-200`
  - Dark: `dark:border-gray-700`
- **Màu chủ đạo (Primary Color)**: Blue (Xanh dương)
  - Text: `text-blue-600`
  - Background: `bg-blue-50` (cho trạng thái active/hover nhẹ)
  - Badge/Highlight: `border-blue-500`
- **Lưu ý quan trọng**:
  - **KHÔNG SỬ DỤNG MÀU TÍM (PURPLE/VIOLET)** trong toàn bộ dự án.
  - Các component mặc định có màu tím (ví dụ: `color="secondary"` trong HeroUI/NextUI) phải được chuyển sang `color="primary"` (Blue) hoặc các màu trung tính khác (Gray/Slate).

## 2. Component Styles
- **Bo góc (Border Radius)**:
  - **Container**: Sử dụng `rounded-lg` (radius="lg").
  - **Button, Input, Select, Textarea**: Sử dụng `rounded-sm` (radius="sm") để tạo cảm giác hiện đại, gọn gàng.
  - Tránh dùng `rounded-2xl` hoặc `rounded-3xl` trừ khi có yêu cầu đặc biệt.
- **Components không bóng (Flat Design)**:
  - Thay vì `shadow-sm`, sử dụng border `border-gray-100 dark:border-gray-700` để tách biệt các khối.
  - **Filter/Toolbar**: Không sử dụng background container (bg-slate-50), để phẳng trên nền trắng.
- **Inputs, Selects, Textareas & DatePickers**:
  - Radius: `sm`
  - Background: `bg-white` (Light) / `dark:bg-gray-900` (Dark).
  - Border: `border-gray-200` (Light) / `dark:border-gray-700` (Dark).
  - Class tham khảo: `inputWrapper: "bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 shadow-sm"`
- **Tabs**:
  - Variant: `underlined`
  - Styling: Border dưới mỏng, text-gray-500 khi chưa chọn, text-blue-600 khi chọn.

## 3. Typography (Font chữ)
- **Tiêu đề trang (Page Title)**: `text-3xl font-bold tracking-tight text-gray-900 dark:text-white`
- **Tiêu đề Section/Box**: `text-base font-bold text-gray-900 dark:text-white` (nhỏ gọn, không dùng text-3xl cho tiêu đề box con)
- **Sub-headers**: `text-sm font-semibold`
- **Nội dung chính**: `text-sm` với `font-normal` (trọng lượng bình thường) để dễ đọc.
- **Labels**: `text-xs font-medium text-gray-500`

## 4. Hiệu ứng (Animations)
- Sử dụng thư viện: `framer-motion` hoặc `tailwindcss-animate`
- **Hiệu ứng xuất hiện danh sách**:
  - Trượt từ phải sang trái: `x: 50` -> `x: 0`
  - Độ mờ: `opacity: 0` -> `opacity: 1`
  - Stagger (so le): `delay: index * 0.05`
  ```tsx
  <motion.div 
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
  />
  ```

## 5. Bố cục (Layout)
- **Trang 2 cột (Sidebar - Content)**:
  - Margin: `mt-4 md:mt-6`, `mx-0` (không dùng padding-x cho container chính).
  - Gap: `gap-3 md:gap-4` (khoảng cách vừa phải, tinh tế).
  - Sidebar: Sticky `md:sticky md:top-6`.
  - Content Box: `flex-1`, `rounded-lg`, `border`, `p-6`.

## 6. Localization (Đa ngôn ngữ)
- **Ngôn ngữ**: Tiếng Việt (Vietnamese)
- **Định dạng ngày**: `DD/MM/YYYY` (Sử dụng thư viện `moment` hoặc quy chuẩn tương đương)

## 7. Pattern: Dynamic Tab Layout (Layout Tabs Động)
Áp dụng cho các trang quản lý hệ thống hoặc trang setting có nhiều mục con. Sử dụng mô hình cấu hình hóa (Configuration-driven) thay vì hard-code.

### Cấu trúc triển khai
```tsx
// 1. Định nghĩa Interface cho Tab Items (Thường đặt ở Component Sidebar atau types.ts)
export interface SystemTabItem {
  id: string
  label: string
  icon: LucideIcon
  description: string
  component: React.ReactNode // Component được render tương ứng
}

// 2. Khai báo mảng cấu hình (trong Page chính)
const TAB_CONFIG: SystemTabItem[] = useMemo(() => [
  {
    id: 'general',
    label: 'Cài đặt chung',
    icon: Settings,
    description: 'Các thiết lập cơ bản',
    component: <GeneralSettingsTab />
  },
  {
    id: 'security',
    label: 'Bảo mật',
    icon: Shield,
    description: 'Mật khẩu và 2FA',
    component: <SecurityTab />
  },
], [])

// 3. Render
// Container chính sử dụng margin-top và gap nhỏ
<div className="flex flex-col md:flex-row gap-3 md:gap-4 items-start mt-4 md:mt-6">
    
    // Sidebar nhận danh sách tabs
    <Sidebar tabs={TAB_CONFIG} activeTab={activeTab} onTabChange={setActiveTab} />

    // Content Area với border và rounded-lg
    <div className="flex-1 w-full bg-white dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-700 min-h-[600px] p-6">
      
      // Tiêu đề nhỏ gọn (text-base)
      <h2 className="text-base font-bold ... mb-6">
        {TAB_CONFIG.find(tab => tab.id === activeTab)?.label}
      </h2>

      // Animation khi switch tab
      <div key={activeTab} className="animate-in fade-in slide-in-from-right-4 duration-300">
        {TAB_CONFIG.find(tab => tab.id === activeTab)?.component}
      </div>
    </div>
</div>
```

### Lợi ích
- **Tách biệt (Separation of Concerns)**: Logic chuyển tab và hiển thị được tách rời.
- **Dễ bảo trì (Maintainable)**: Thêm/Sửa/Xóa tab chỉ cần thao tác trên mảng cấu hình.
- **Thẩm mỹ (Aesthetics)**: Layout phẳng (flat), khoảng cách (gap) tinh tế, tiêu đề không quá khổ.
