# Chuẩn hóa Form Components trong Dual Drawer Panel

Chuyển đổi tất cả form trong secondary panel từ các component cũ (`InputFloatingLabel`, `SelectFloatingLabel`, `DateInputFloatingLabel`, `TextareaFloatingLabel`) sang sử dụng HeroUI v3 `Input` + `Label` pattern đồng bộ với `EditNhansuPage`, đồng thời tạo component tái sử dụng và chuẩn hóa button submit.

## Scan Result — Hiện trạng

### Các Form trong Secondary Panel (10 form)

| # | File | Input cũ | Select cũ | Date cũ | Textarea cũ | Khác |
|---|------|----------|-----------|---------|-------------|------|
| 1 | `FormThontingiadinh.tsx` | 5× InputFL | 1× SelectFL | — | — | — |
| 2 | `FormChungchi.tsx` | 2× InputFL | — | 1× DateFL | — | FileUploadBox |
| 3 | `FormBangcap.tsx` | 3× InputFL | 1× SelectFL | — | — | MonthYearPicker, File upload |
| 4 | `FormDanhgia.tsx` | 1× InputFL | 2× SelectFL | — | 1× TextareaFL | — |
| 5 | `FormKinhnghiemlamviec.tsx` | 2× InputFL | 4× SelectFL | — | 1× TextareaFL | Checkbox |
| 6 | `FormQuatrinhcongtac.tsx` | 2× InputFL | 2× SelectFL | 2× DateFL | 1× TextareaFL | — |
| 7 | `FormKhenthuong.tsx` | — | 1× SelectFL | — | — | HeroUI Input/Textarea raw |
| 8 | `FormThoiviec.tsx` | — | 2× SelectFL | 1× DateFL | — | HeroUI Input/Textarea raw, Tabs |
| 9 | `FormQuatrinhdaotao.tsx` | — | 3× SelectFL | 2× DateFL | — | HeroUI Input/Textarea/Checkbox |

### Submit Buttons cần chuẩn hóa

| Vị trí | Hiện tại | Mục tiêu |
|--------|----------|----------|
| `EmployeeEditDrawer.tsx` secondaryFooter | `<Button color="primary">Lưu</Button>` + `<Button variant="light">Hủy</Button>` | HrPrimaryButton + HrCancelButton |
| `SidePanelLayout.tsx` footer | `<Button color="primary">Lưu</Button>` + `<Button variant="light">Hủy</Button>` | HrPrimaryButton + HrCancelButton |
| `AddNhansuButton.tsx` footer | Đã chuẩn hóa ✅ | — |

---

## Proposed Changes

### Phase 1: Tạo component `HrFormField` — Wrapper tái sử dụng

#### [NEW] [HrFormField.tsx](file:///h:/company/office-dnc/fe/src/renderer/src/components/hero-custom/HrFormField.tsx)

Component wrapper kết hợp **Label (stacked trên)** + **Input gốc** từ `@heroui/react` theo HeroUI v3 pattern. Không wrap qua `HrInput` vì `HrInput` đã có custom riêng (floating label inside, gray bg).

```tsx
// Pattern: Label trên, Input dưới (giống hình v3 reference)
import { Input, Label } from '@heroui/react'

<div className="flex flex-col gap-1">
  <Label htmlFor={id} className={labelClasses}>Label</Label>
  <Input id={id} placeholder="..." className={inputClasses} />
</div>
```

**Variants cần hỗ trợ:**
- `HrFormField` — text/number input (default), dùng `Input` gốc
- `HrFormFieldSelect` — select dropdown, dùng `Select` gốc
- `HrFormFieldTextarea` — multiline textarea, dùng `Textarea` gốc
- `HrFormFieldDate` — date input (wrap `HrDateInput` hiện tại)

Custom styling riêng cho form field context (không dùng `sharedInputWrapperClasses` từ `HrInput` — đó là style cho main edit form).

---

### Phase 2: Tạo component `HrCancelButton`

#### [NEW] [HrCancelButton.tsx](file:///h:/company/office-dnc/fe/src/renderer/src/components/hero-custom/HrCancelButton.tsx)

Button "Hủy" với style neutral gray matching `HrPrimaryButton`:
```tsx
// h-11, px-6, rounded-2xl, neutral gray color
```

---

### Phase 3: Chuẩn hóa Submit Buttons

#### [MODIFY] [EmployeeEditDrawer.tsx](file:///h:/company/office-dnc/fe/src/renderer/src/pages/profile/components/EmployeeEditDrawer.tsx)
- Line 201–204: Thay `<Button>Hủy/Lưu</Button>` → `HrCancelButton` + `HrPrimaryButton`

#### [MODIFY] [SidePanelLayout.tsx](file:///h:/company/office-dnc/fe/src/renderer/src/components/side-panel/SidePanelLayout.tsx)
- Line 233–239: Thay `<Button>Hủy/Lưu</Button>` → `HrCancelButton` + `HrPrimaryButton`

---

### Phase 4: Refactor từng Form — Thay thế `InputFloatingLabel` → `HrFormField`

Thực hiện theo thứ tự đơn giản → phức tạp:

#### [MODIFY] [FormThontingiadinh.tsx](file:///h:/company/office-dnc/fe/src/renderer/src/pages/profile/components/elements/FormThontingiadinh.tsx)
- 5× `InputFloatingLabel` → `HrFormField`
- 1× `SelectFloatingLabel` → `HrFormFieldSelect`

#### [MODIFY] [FormChungchi.tsx](file:///h:/company/office-dnc/fe/src/renderer/src/pages/profile/components/elements/FormChungchi.tsx)
- 2× `InputFloatingLabel` → `HrFormField`
- 1× `DateInputFloatingLabel` → `HrFormFieldDate`

#### [MODIFY] [FormBangcap.tsx](file:///h:/company/office-dnc/fe/src/renderer/src/pages/profile/components/elements/FormBangcap.tsx)
- 3× `InputFloatingLabel` → `HrFormField`
- 1× `SelectFloatingLabel` → `HrFormFieldSelect`

#### [MODIFY] [FormDanhgia.tsx](file:///h:/company/office-dnc/fe/src/renderer/src/pages/profile/components/elements/FormDanhgia.tsx)
- 1× `InputFloatingLabel` → `HrFormField`
- 2× `SelectFloatingLabel` → `HrFormFieldSelect`
- 1× `TextareaFloatingLabel` → `HrFormFieldTextarea`

#### [MODIFY] [FormKinhnghiemlamviec.tsx](file:///h:/company/office-dnc/fe/src/renderer/src/pages/profile/components/elements/FormKinhnghiemlamviec.tsx)
- 2× `InputFloatingLabel` → `HrFormField`
- 4× `SelectFloatingLabel` → `HrFormFieldSelect`
- 1× `TextareaFloatingLabel` → `HrFormFieldTextarea`

#### [MODIFY] [FormQuatrinhcongtac.tsx](file:///h:/company/office-dnc/fe/src/renderer/src/pages/profile/components/elements/FormQuatrinhcongtac.tsx)
- 2× `InputFloatingLabel` → `HrFormField`
- 2× `SelectFloatingLabel` → `HrFormFieldSelect`
- 2× `DateInputFloatingLabel` → `HrFormFieldDate`
- 1× `TextareaFloatingLabel` → `HrFormFieldTextarea`

#### [MODIFY] [FormKhenthuong.tsx](file:///h:/company/office-dnc/fe/src/renderer/src/pages/profile/components/elements/FormKhenthuong.tsx)
- 1× `SelectFloatingLabel` → `HrFormFieldSelect`
- Raw HeroUI `Input`/`Textarea` → `HrFormField`/`HrFormFieldTextarea`

#### [MODIFY] [FormThoiviec.tsx](file:///h:/company/office-dnc/fe/src/renderer/src/pages/profile/components/elements/FormThoiviec.tsx)
- 2× `SelectFloatingLabel` → `HrFormFieldSelect`
- 1× `DateInputFloatingLabel` → `HrFormFieldDate`
- Raw HeroUI `Input`/`Textarea` → `HrFormField`/`HrFormFieldTextarea`

#### [MODIFY] [FormQuatrinhdaotao.tsx](file:///h:/company/office-dnc/fe/src/renderer/src/pages/profile/components/elements/FormQuatrinhdaotao.tsx)
- 3× `SelectFloatingLabel` → `HrFormFieldSelect`
- 2× `DateInputFloatingLabel` → `HrFormFieldDate`
- Raw HeroUI `Input`/`Textarea`/`Checkbox` → `HrFormField`/`HrFormFieldTextarea`

---

### Phase 5: Export mới trong index.ts

#### [MODIFY] [index.ts](file:///h:/company/office-dnc/fe/src/renderer/src/components/hero-custom/index.ts)
- Thêm export `HrFormField`, `HrFormFieldSelect`, `HrFormFieldTextarea`, `HrFormFieldDate`, `HrCancelButton`

---

## Design Decisions

> [!NOTE]
> **Label Position:** Đã quyết định dùng **stacked** (Label nằm trên, Input bên dưới) theo HeroUI v3 reference. Dùng `Input` gốc từ `@heroui/react`, không wrap qua `HrInput`.

## Verification Plan

### Automated
- Build check: `npm run build` — không có TypeScript errors
- Mở app → mở drawer → test từng form: Gia đình, Chứng chỉ, Bằng cấp, Đánh giá, Kinh nghiệm, Quá trình công tác, Khen thưởng, Thôi việc, Đào tạo

### Manual
- Visual: Đảm bảo Label + Input style nhất quán giữa tất cả form
- Functional: Submit/Cancel button hoạt động đúng
- Data binding: Form data vẫn bind đúng (controlled inputs)
