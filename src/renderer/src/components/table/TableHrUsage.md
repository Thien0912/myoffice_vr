# Hướng dẫn sử dụng TableHr Component

`TableHr` là một component bảng dữ liệu mạnh mẽ, hỗ trợ nhiều tính năng nâng cao như ghim cột, thay đổi kích thước cột, sắp xếp, và menu ngữ cảnh tùy chỉnh.

## 1. Tính năng Ghim Cột (Column Pinning)

Có hai cách để kích hoạt tính năng ghim cột:

### Cách 1: Kích hoạt đơn giản (Local State)
Chỉ cần truyền `true` vào prop `onPinColumn`. Trạng thái ghim sẽ được quản lý nội bộ bởi `TableHr` và sẽ mất khi tải lại trang.

```tsx
<TableHr
  // ... các props khác
  onPinColumn={true}
/>
```

### Cách 2: Quản lý trạng thái từ bên ngoài (Persistent State)
Truyền một hàm xử lý vào prop `onPinColumn`. Hàm này sẽ nhận `uid` của cột và trạng thái ghim (`'left'`, `'right'`, hoặc `undefined`). Cách này hữu ích khi bạn muốn lưu trạng thái ghim vào `localStorage` hoặc `store`.

```tsx
const handlePinColumn = (uid: string, pin: 'left' | 'right' | undefined) => {
  // Cập nhật store hoặc state của bạn
  updatePinnedState(uid, pin);
}

<TableHr
  // ... các props khác
  onPinColumn={handlePinColumn}
/>
```

## 2. Tùy chỉnh Menu Tiêu đề Cột (Header Context Menu)

Bạn có thể thêm các mục tùy chỉnh vào menu chuột phải (hoặc menu ghim) trên tiêu đề cột bằng prop `headerMenuItems`.

### Interface
```typescript
interface TablePinningMenuItem {
  label: string;
  icon?: React.ReactNode;
  onClick?: () => void;
}
```

### Cách sử dụng
Prop `headerMenuItems` chấp nhận một mảng các mục menu HOẶC một hàm trả về mảng các mục menu (cho phép tùy chỉnh theo từng cột).

**Ví dụ:**

```tsx
import { EyeOff, Filter } from 'lucide-react';

// ...

const getExtraHeaderItems = (columnUid: string) => [
  {
    label: 'Ẩn cột này',
    icon: <EyeOff size={16} />,
    onClick: () => {
      console.log(`Ẩn cột: ${columnUid}`);
      // Gọi hàm xử lý ẩn cột của bạn
    }
  },
  {
    label: 'Lọc theo giá trị',
    icon: <Filter size={16} />,
    onClick: () => {
      console.log(`Lọc cột: ${columnUid}`);
      // Mở modal lọc hoặc xử lý logic lọc
    }
  }
];

return (
  <TableHr
    // ... các props khác
    onPinColumn={true} // Kích hoạt menu ghim mặc định
    headerMenuItems={getExtraHeaderItems} // Thêm các mục tùy chỉnh
  />
);
```

Các mục tùy chỉnh sẽ hiển thị bên dưới các tùy chọn ghim mặc định (nếu có), được ngăn cách bởi một đường kẻ ngang.

## 3. Các Props quan trọng khác

| Prop | Kiểu dữ liệu | Mô tả |
| :--- | :--- | :--- |
| `columns` | `TableColumnType[]` | Định nghĩa các cột của bảng. |
| `data` | `T[]` | Dữ liệu hiển thị trong bảng. |
| `columnWidths` | `Record<string, number>` | Độ rộng của các cột (được quản lý từ bên ngoài). |
| `onColumnResize` | `(uid: string, width: number) => void` | Callback khi người dùng thay đổi kích thước cột. |
| `enableStickyScrollbar` | `boolean` | Bật thanh cuộn ngang dính ở đáy màn hình (mặc định: `false`). |
