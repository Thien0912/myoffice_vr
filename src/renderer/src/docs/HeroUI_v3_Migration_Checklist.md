# HeroUI v2 -> v3 Migration Checklist

## Muc tieu

- Giữ app build được trong suốt quá trình migrate.
- Chuyển toàn bộ renderer từ HeroUI v2 sang v3 theo từng cụm file.
- Hoàn tất migration hạ tầng trước khi đổi dependency chính thức.

## Quy uoc tag

- `infra`: hạ tầng, provider, theme, CSS, dependency.
- `overlay`: modal, drawer, popover, flow dùng `useDisclosure`.
- `collection`: `DropdownItem`, `SelectItem`, `AutocompleteItem`, `AccordionItem`, `Tab`, collection identity `id`/`textValue`.
- `table`: bảng, sort, selection, pagination.
- `rename`: component hoặc API bị đổi tên trong v3.
- `wrapper`: shared component/wrapper nên migrate sớm để giảm blast radius.
- `toast`: `toast`, `ToastProvider`.
- `theme`: Tailwind/HeroUI styles, slot overrides.

## Breaking changes canh gác trong suot checklist

- [ ] Bỏ `HeroUIProvider`.
- [ ] Bỏ `heroui()` plugin khỏi Tailwind config.
- [ ] Bỏ file plugin `src/renderer/src/hero.ts`.
- [ ] Đổi CSS sang `@import "@heroui/styles"` sau `@import "tailwindcss"`.
- [ ] Rà lại toàn bộ flow `useDisclosure` -> pattern overlay mới của v3.
- [ ] Với collection items, thêm `id` và `textValue` khi cần.
- [ ] Rà các rename chính: `Divider` -> `Separator`, `Progress` -> `ProgressBar`, `DateInput` -> `DateField`, `Listbox` -> `ListBox`.
- [ ] Rà các component bị remove hoặc đổi pattern mạnh như `User`.

## Phase 0 - Infrastructure cutover

- [ ] `infra` [package.json](c:/xampp/htdocs/myoffice_vr/package.json): chốt chiến lược incremental, chưa bump thẳng dependency lên v3 trước khi code sẵn sàng.
- [ ] `infra` [tailwind.config.js](c:/xampp/htdocs/myoffice_vr/tailwind.config.js): gỡ `heroui()` plugin và chuyển cấu hình theme theo cách v3 hỗ trợ.
- [ ] `infra` [src/renderer/src/assets/main.css](c:/xampp/htdocs/myoffice_vr/src/renderer/src/assets/main.css): thay `@plugin "../hero.ts"` và `@source` kiểu v2 bằng import styles v3; kiểm tra lại toàn bộ override `data-slot`.
- [ ] `infra theme` [src/renderer/src/hero.ts](c:/xampp/htdocs/myoffice_vr/src/renderer/src/hero.ts): xóa hoặc ngừng dùng hoàn toàn.
- [ ] `infra toast` [src/renderer/src/main.tsx](c:/xampp/htdocs/myoffice_vr/src/renderer/src/main.tsx): bỏ `HeroUIProvider`, xác thực `ToastProvider` còn đúng API v3.

## Phase 1 - Shared wrappers and core layout

### Shared API and shell

- [ ] `toast` [src/renderer/src/api/auth/SSOCallback.tsx](c:/xampp/htdocs/myoffice_vr/src/renderer/src/api/auth/SSOCallback.tsx): kiểm tra `toast` import/source trong v3.
- [ ] `wrapper overlay rename` [src/renderer/src/components/ApproveModal.tsx](c:/xampp/htdocs/myoffice_vr/src/renderer/src/components/ApproveModal.tsx): modal + textarea + input otp.
- [ ] `wrapper overlay` [src/renderer/src/components/ConfirmModal.tsx](c:/xampp/htdocs/myoffice_vr/src/renderer/src/components/ConfirmModal.tsx): chuẩn hóa modal actions theo v3.
- [ ] `wrapper collection` [src/renderer/src/components/ContextMenu.tsx](c:/xampp/htdocs/myoffice_vr/src/renderer/src/components/ContextMenu.tsx): dropdown/menu item identity.
- [ ] `wrapper toast` [src/renderer/src/components/CopyToClipboardButton.tsx](c:/xampp/htdocs/myoffice_vr/src/renderer/src/components/CopyToClipboardButton.tsx): nút + toast API.
- [ ] `wrapper rename` [src/renderer/src/components/CustomDatePicker.tsx](c:/xampp/htdocs/myoffice_vr/src/renderer/src/components/CustomDatePicker.tsx): `DatePicker` props và slots.
- [ ] `wrapper rename` [src/renderer/src/components/DateInputFloatingLabel.tsx](c:/xampp/htdocs/myoffice_vr/src/renderer/src/components/DateInputFloatingLabel.tsx): `DateInput`/`DatePicker` pattern mới.
- [ ] `wrapper rename` [src/renderer/src/components/DateRangePickerFloatingLabel.tsx](c:/xampp/htdocs/myoffice_vr/src/renderer/src/components/DateRangePickerFloatingLabel.tsx): rà props, classes, floating label.
- [ ] `wrapper rename` [src/renderer/src/components/DateRangeSelector.tsx](c:/xampp/htdocs/myoffice_vr/src/renderer/src/components/DateRangeSelector.tsx): date range API v3.
- [ ] `wrapper overlay` [src/renderer/src/components/DraggableModal.tsx](c:/xampp/htdocs/myoffice_vr/src/renderer/src/components/DraggableModal.tsx): modal composition và drag behavior.
- [ ] `wrapper overlay toast` [src/renderer/src/components/DrawerCommon.tsx](c:/xampp/htdocs/myoffice_vr/src/renderer/src/components/DrawerCommon.tsx): drawer + tooltip + toast.
- [ ] `wrapper overlay` [src/renderer/src/components/DrawerCustom.tsx](c:/xampp/htdocs/myoffice_vr/src/renderer/src/components/DrawerCustom.tsx): wrapper drawer tùy biến.
- [ ] `wrapper collection` [src/renderer/src/components/EmployeeListModal.tsx](c:/xampp/htdocs/myoffice_vr/src/renderer/src/components/EmployeeListModal.tsx): input + list/filter.
- [ ] `wrapper overlay` [src/renderer/src/components/FilePreviewModal.tsx](c:/xampp/htdocs/myoffice_vr/src/renderer/src/components/FilePreviewModal.tsx): modal + spinner.
- [ ] `wrapper toast` [src/renderer/src/components/GlobalCompose.tsx](c:/xampp/htdocs/myoffice_vr/src/renderer/src/components/GlobalCompose.tsx): toast usage.
- [ ] `wrapper rename collection` [src/renderer/src/components/hero-custom/HrAutocomplete.tsx](c:/xampp/htdocs/myoffice_vr/src/renderer/src/components/hero-custom/HrAutocomplete.tsx): `Autocomplete` -> `ComboBox` nếu cần, rà `AutocompleteItem`.
- [ ] `wrapper rename` [src/renderer/src/components/hero-custom/HrDateInput.tsx](c:/xampp/htdocs/myoffice_vr/src/renderer/src/components/hero-custom/HrDateInput.tsx): `DateInput` -> `DateField` hoặc `DatePicker` tùy semantics.
- [ ] `wrapper overlay` [src/renderer/src/components/hero-custom/HrDrawer.tsx](c:/xampp/htdocs/myoffice_vr/src/renderer/src/components/hero-custom/HrDrawer.tsx): drawer compound pattern.
- [ ] `wrapper` [src/renderer/src/components/hero-custom/HrGenderInput.tsx](c:/xampp/htdocs/myoffice_vr/src/renderer/src/components/hero-custom/HrGenderInput.tsx): radio/radio group API.
- [ ] `wrapper` [src/renderer/src/components/hero-custom/HrInput.tsx](c:/xampp/htdocs/myoffice_vr/src/renderer/src/components/hero-custom/HrInput.tsx): input props và slot classes.
- [ ] `wrapper collection` [src/renderer/src/components/hero-custom/HrSelect.tsx](c:/xampp/htdocs/myoffice_vr/src/renderer/src/components/hero-custom/HrSelect.tsx): `SelectItem`, selected keys, `id`/`textValue`.
- [ ] `wrapper rename` [src/renderer/src/components/hero-custom/HrTextarea.tsx](c:/xampp/htdocs/myoffice_vr/src/renderer/src/components/hero-custom/HrTextarea.tsx): `Textarea`/`TextArea` API v3.
- [ ] `wrapper overlay` [src/renderer/src/components/ImportModal.tsx](c:/xampp/htdocs/myoffice_vr/src/renderer/src/components/ImportModal.tsx): modal API.
- [ ] `wrapper collection` [src/renderer/src/components/InputFloatingEndLabel.tsx](c:/xampp/htdocs/myoffice_vr/src/renderer/src/components/InputFloatingEndLabel.tsx): `DropdownMenu`/`DropdownItem` item identity, `onAction`, `textValue`.
- [ ] `wrapper` [src/renderer/src/components/InputFloatingLabel.tsx](c:/xampp/htdocs/myoffice_vr/src/renderer/src/components/InputFloatingLabel.tsx): input styles và slot changes.
- [ ] `wrapper` [src/renderer/src/components/ItemComment.tsx](c:/xampp/htdocs/myoffice_vr/src/renderer/src/components/ItemComment.tsx): tooltip API.
- [ ] `wrapper rename` [src/renderer/src/components/LoadingOverlay.tsx](c:/xampp/htdocs/myoffice_vr/src/renderer/src/components/LoadingOverlay.tsx): spinner package import.
- [ ] `wrapper` [src/renderer/src/components/MiddleTruncate.tsx](c:/xampp/htdocs/myoffice_vr/src/renderer/src/components/MiddleTruncate.tsx): `cn` source và utility compatibility.
- [ ] `wrapper` [src/renderer/src/components/MinimizedDock.tsx](c:/xampp/htdocs/myoffice_vr/src/renderer/src/components/MinimizedDock.tsx): button + tooltip.
- [ ] `wrapper collection` [src/renderer/src/components/MinimizedMore.tsx](c:/xampp/htdocs/myoffice_vr/src/renderer/src/components/MinimizedMore.tsx): dropdown items.
- [ ] `wrapper collection` [src/renderer/src/components/Preview.tsx](c:/xampp/htdocs/myoffice_vr/src/renderer/src/components/Preview.tsx): button + dropdown.
- [ ] `wrapper collection` [src/renderer/src/components/RecipientInput.tsx](c:/xampp/htdocs/myoffice_vr/src/renderer/src/components/RecipientInput.tsx): chip list + scroll shadow.
- [ ] `wrapper overlay collection` [src/renderer/src/components/RichTextEditor.tsx](c:/xampp/htdocs/myoffice_vr/src/renderer/src/components/RichTextEditor.tsx): popover composition.
- [ ] `wrapper` [src/renderer/src/components/SelectDropdown.tsx](c:/xampp/htdocs/myoffice_vr/src/renderer/src/components/SelectDropdown.tsx): utility classes và select semantics.
- [ ] `wrapper collection` [src/renderer/src/components/SelectFloatingLabel.tsx](c:/xampp/htdocs/myoffice_vr/src/renderer/src/components/SelectFloatingLabel.tsx): select item identity.
- [ ] `wrapper toast` [src/renderer/src/components/side-panel/SidePanelLayout.tsx](c:/xampp/htdocs/myoffice_vr/src/renderer/src/components/side-panel/SidePanelLayout.tsx): button + toast.
- [ ] `toast` [src/renderer/src/components/SocketManager.tsx](c:/xampp/htdocs/myoffice_vr/src/renderer/src/components/SocketManager.tsx): toast API.
- [ ] `wrapper` [src/renderer/src/components/StatCard.tsx](c:/xampp/htdocs/myoffice_vr/src/renderer/src/components/StatCard.tsx): card/radius/token compatibility.
- [ ] `collection table` [src/renderer/src/components/table/TableColumnVisibility.tsx](c:/xampp/htdocs/myoffice_vr/src/renderer/src/components/table/TableColumnVisibility.tsx): dropdown items, selected keys, item `id`.
- [ ] `table collection rename` [src/renderer/src/components/table/TableCustom.tsx](c:/xampp/htdocs/myoffice_vr/src/renderer/src/components/table/TableCustom.tsx): `Selection`, `SortDescriptor`, table API, `Divider` -> `Separator`, menu items, pagination header.
- [ ] `table` [src/renderer/src/components/table/TableHr.tsx](c:/xampp/htdocs/myoffice_vr/src/renderer/src/components/table/TableHr.tsx): core table rendering.
- [ ] `table` [src/renderer/src/components/table/TableHrRow.tsx](c:/xampp/htdocs/myoffice_vr/src/renderer/src/components/table/TableHrRow.tsx): row selection/cell slots.
- [ ] `table` [src/renderer/src/components/table/TablePagination.tsx](c:/xampp/htdocs/myoffice_vr/src/renderer/src/components/table/TablePagination.tsx): pagination API.
- [ ] `table` [src/renderer/src/components/table/TableSorting.tsx](c:/xampp/htdocs/myoffice_vr/src/renderer/src/components/table/TableSorting.tsx): `SortDescriptor` source.
- [ ] `wrapper rename` [src/renderer/src/components/TextareaFloatingLabel.tsx](c:/xampp/htdocs/myoffice_vr/src/renderer/src/components/TextareaFloatingLabel.tsx): textarea semantics và styles.
- [ ] `wrapper` [src/renderer/src/components/UserAvatar.tsx](c:/xampp/htdocs/myoffice_vr/src/renderer/src/components/UserAvatar.tsx): avatar props.
- [ ] `wrapper overlay` [src/renderer/src/components/UserInfoPopover.tsx](c:/xampp/htdocs/myoffice_vr/src/renderer/src/components/UserInfoPopover.tsx): popover composition.
- [ ] `wrapper overlay rename toast` [src/renderer/src/components/VerifyPinModal.tsx](c:/xampp/htdocs/myoffice_vr/src/renderer/src/components/VerifyPinModal.tsx): modal + input otp + toast.

### Core layouts

- [ ] `wrapper toast` [src/renderer/src/layouts/header/components/AccountSettingsSection.tsx](c:/xampp/htdocs/myoffice_vr/src/renderer/src/layouts/header/components/AccountSettingsSection.tsx): button + toast.
- [ ] `wrapper collection` [src/renderer/src/layouts/header/components/OnlineUserGroup.tsx](c:/xampp/htdocs/myoffice_vr/src/renderer/src/layouts/header/components/OnlineUserGroup.tsx): avatar group + popover.
- [ ] `wrapper` [src/renderer/src/layouts/header/components/PersonalInfoSection.tsx](c:/xampp/htdocs/myoffice_vr/src/renderer/src/layouts/header/components/PersonalInfoSection.tsx): button và shared layout primitives.
- [ ] `rename` [src/renderer/src/layouts/header/components/ProfileSidebar.tsx](c:/xampp/htdocs/myoffice_vr/src/renderer/src/layouts/header/components/ProfileSidebar.tsx): rà component `User` nếu có dependency gián tiếp.
- [ ] `overlay rename toast` [src/renderer/src/layouts/header/components/RegisterPinModal.tsx](c:/xampp/htdocs/myoffice_vr/src/renderer/src/layouts/header/components/RegisterPinModal.tsx): modal + input otp.
- [ ] `toast` [src/renderer/src/layouts/header/components/SyncTabContent.tsx](c:/xampp/htdocs/myoffice_vr/src/renderer/src/layouts/header/components/SyncTabContent.tsx): input + button + toast.
- [ ] `collection overlay toast` [src/renderer/src/layouts/header/Header.tsx](c:/xampp/htdocs/myoffice_vr/src/renderer/src/layouts/header/Header.tsx): breadcrumbs, popover, button, toast.
- [ ] `collection overlay` [src/renderer/src/layouts/header/NotificationDropdown.tsx](c:/xampp/htdocs/myoffice_vr/src/renderer/src/layouts/header/NotificationDropdown.tsx): dropdown/popover/list items.
- [ ] `overlay rename` [src/renderer/src/layouts/header/ProfileModal.tsx](c:/xampp/htdocs/myoffice_vr/src/renderer/src/layouts/header/ProfileModal.tsx): modal + chip + tooltip + skeleton.
- [ ] `collection overlay` [src/renderer/src/layouts/header/SystemConfigModal.tsx](c:/xampp/htdocs/myoffice_vr/src/renderer/src/layouts/header/SystemConfigModal.tsx): modal + `Tab`/`Tabs`.
- [ ] `wrapper` [src/renderer/src/layouts/MainLayout.tsx](c:/xampp/htdocs/myoffice_vr/src/renderer/src/layouts/MainLayout.tsx): skeleton/tooltip compatibility.
- [ ] `collection rename` [src/renderer/src/layouts/sidebar/Sidebar.tsx](c:/xampp/htdocs/myoffice_vr/src/renderer/src/layouts/sidebar/Sidebar.tsx): `AccordionItem`, `DropdownItem`, `selectedKeys`, item `id`, `textValue`.

## Phase 2 - Auth and entry flows

- [ ] `wrapper` [src/renderer/src/pages/auth/components/LoginRequired.tsx](c:/xampp/htdocs/myoffice_vr/src/renderer/src/pages/auth/components/LoginRequired.tsx): button compatibility.
- [ ] `toast` [src/renderer/src/pages/auth/LoginGoogleCallback.tsx](c:/xampp/htdocs/myoffice_vr/src/renderer/src/pages/auth/LoginGoogleCallback.tsx): toast usage.
- [ ] `rename` [src/renderer/src/pages/auth/LoginPage.tsx](c:/xampp/htdocs/myoffice_vr/src/renderer/src/pages/auth/LoginPage.tsx): `Divider` -> `Separator`, button imports hợp nhất.
- [ ] `rename` [src/renderer/src/pages/auth/LoginPage1.tsx](c:/xampp/htdocs/myoffice_vr/src/renderer/src/pages/auth/LoginPage1.tsx): `Divider` -> `Separator`, button imports hợp nhất.
- [ ] `toast` [src/renderer/src/pages/auth/LoginZaloCallback.tsx](c:/xampp/htdocs/myoffice_vr/src/renderer/src/pages/auth/LoginZaloCallback.tsx): toast usage.
- [ ] `overlay rename toast` [src/renderer/src/pages/auth/VerifyOtpPage.tsx](c:/xampp/htdocs/myoffice_vr/src/renderer/src/pages/auth/VerifyOtpPage.tsx): card + input otp + toast.

## Phase 3 - Category module

- [ ] `overlay rename` [src/renderer/src/pages/category/BaoMatPage.tsx](c:/xampp/htdocs/myoffice_vr/src/renderer/src/pages/category/BaoMatPage.tsx): `useDisclosure`, modal/dialog flows.
- [ ] `overlay rename` [src/renderer/src/pages/category/CaLamViecPage.tsx](c:/xampp/htdocs/myoffice_vr/src/renderer/src/pages/category/CaLamViecPage.tsx): `useDisclosure`, list/table interactions.
- [ ] `wrapper` [src/renderer/src/pages/category/components/FormCaLamViec.tsx](c:/xampp/htdocs/myoffice_vr/src/renderer/src/pages/category/components/FormCaLamViec.tsx): form controls.
- [ ] `wrapper` [src/renderer/src/pages/category/components/FormDonvi.tsx](c:/xampp/htdocs/myoffice_vr/src/renderer/src/pages/category/components/FormDonvi.tsx): form controls.
- [ ] `wrapper` [src/renderer/src/pages/category/components/FormLoaiNghiPhep.tsx](c:/xampp/htdocs/myoffice_vr/src/renderer/src/pages/category/components/FormLoaiNghiPhep.tsx): form controls.
- [ ] `overlay rename` [src/renderer/src/pages/category/CoQuanPage.tsx](c:/xampp/htdocs/myoffice_vr/src/renderer/src/pages/category/CoQuanPage.tsx): overlays.
- [ ] `wrapper` [src/renderer/src/pages/category/DanhmucPage.tsx](c:/xampp/htdocs/myoffice_vr/src/renderer/src/pages/category/DanhmucPage.tsx): shared tabs/navigation nếu có.
- [ ] `overlay rename` [src/renderer/src/pages/category/DaoTaoPage.tsx](c:/xampp/htdocs/myoffice_vr/src/renderer/src/pages/category/DaoTaoPage.tsx): overlays.
- [ ] `overlay rename` [src/renderer/src/pages/category/DonviPage.tsx](c:/xampp/htdocs/myoffice_vr/src/renderer/src/pages/category/DonviPage.tsx): overlays.
- [ ] `overlay rename` [src/renderer/src/pages/category/HinhThucPage.tsx](c:/xampp/htdocs/myoffice_vr/src/renderer/src/pages/category/HinhThucPage.tsx): overlays.
- [ ] `overlay rename` [src/renderer/src/pages/category/LoaiNghiPhepPage.tsx](c:/xampp/htdocs/myoffice_vr/src/renderer/src/pages/category/LoaiNghiPhepPage.tsx): overlays.
- [ ] `overlay rename` [src/renderer/src/pages/category/LoaiVanBanPage.tsx](c:/xampp/htdocs/myoffice_vr/src/renderer/src/pages/category/LoaiVanBanPage.tsx): overlays.
- [ ] `overlay rename` [src/renderer/src/pages/category/TinhChatPage.tsx](c:/xampp/htdocs/myoffice_vr/src/renderer/src/pages/category/TinhChatPage.tsx): overlays.
- [ ] `overlay rename` [src/renderer/src/pages/category/ViTriCongViecPage.tsx](c:/xampp/htdocs/myoffice_vr/src/renderer/src/pages/category/ViTriCongViecPage.tsx): overlays + `Divider` rename.

## Phase 4 - Dashboard and generic display pages

- [ ] `wrapper` [src/renderer/src/pages/dashboard/components/CreateDocumentWidgets.tsx](c:/xampp/htdocs/myoffice_vr/src/renderer/src/pages/dashboard/components/CreateDocumentWidgets.tsx): cards/buttons.
- [ ] `wrapper` [src/renderer/src/pages/dashboard/components/CreateHrWidgets.tsx](c:/xampp/htdocs/myoffice_vr/src/renderer/src/pages/dashboard/components/CreateHrWidgets.tsx): cards/buttons.
- [ ] `wrapper` [src/renderer/src/pages/dashboard/components/LeaveRegistrationWidget.tsx](c:/xampp/htdocs/myoffice_vr/src/renderer/src/pages/dashboard/components/LeaveRegistrationWidget.tsx): cards/buttons.
- [ ] `wrapper` [src/renderer/src/pages/dashboard/components/NotificationCard.tsx](c:/xampp/htdocs/myoffice_vr/src/renderer/src/pages/dashboard/components/NotificationCard.tsx): card/chip.
- [ ] `wrapper` [src/renderer/src/pages/dashboard/components/StatCard.tsx](c:/xampp/htdocs/myoffice_vr/src/renderer/src/pages/dashboard/components/StatCard.tsx): card token compatibility.
- [ ] `rename` [src/renderer/src/pages/error/NotFoundPage.tsx](c:/xampp/htdocs/myoffice_vr/src/renderer/src/pages/error/NotFoundPage.tsx): `Divider` -> `Separator`.

## Phase 5 - Document module

- [ ] `wrapper` [src/renderer/src/pages/document/Chitietvanbanden.tsx](c:/xampp/htdocs/myoffice_vr/src/renderer/src/pages/document/Chitietvanbanden.tsx): rà imports HeroUI chính.
- [ ] `wrapper` [src/renderer/src/pages/document/components/BoxSearchFile.tsx](c:/xampp/htdocs/myoffice_vr/src/renderer/src/pages/document/components/BoxSearchFile.tsx): input/button.
- [ ] `wrapper` [src/renderer/src/pages/document/components/content/ContentButPhe.tsx](c:/xampp/htdocs/myoffice_vr/src/renderer/src/pages/document/components/content/ContentButPhe.tsx): chip/badge/content display.
- [ ] `wrapper` [src/renderer/src/pages/document/components/content/ContentDonvixuly.tsx](c:/xampp/htdocs/myoffice_vr/src/renderer/src/pages/document/components/content/ContentDonvixuly.tsx): collection display.
- [ ] `wrapper` [src/renderer/src/pages/document/components/content/ContentHistoryLog.tsx](c:/xampp/htdocs/myoffice_vr/src/renderer/src/pages/document/components/content/ContentHistoryLog.tsx): list/timeline display.
- [ ] `wrapper` [src/renderer/src/pages/document/components/content/ContentThongtinbanhanh.tsx](c:/xampp/htdocs/myoffice_vr/src/renderer/src/pages/document/components/content/ContentThongtinbanhanh.tsx): field display.
- [ ] `wrapper` [src/renderer/src/pages/document/components/content/ContentTimeLine.tsx](c:/xampp/htdocs/myoffice_vr/src/renderer/src/pages/document/components/content/ContentTimeLine.tsx): timeline and status chips.
- [ ] `overlay` [src/renderer/src/pages/document/components/drawer/DrawerDocument.tsx](c:/xampp/htdocs/myoffice_vr/src/renderer/src/pages/document/components/drawer/DrawerDocument.tsx): drawer composition.
- [ ] `overlay wrapper` [src/renderer/src/pages/document/components/form/FormButPheLanhDao.tsx](c:/xampp/htdocs/myoffice_vr/src/renderer/src/pages/document/components/form/FormButPheLanhDao.tsx): modal/form controls.
- [ ] `overlay wrapper` [src/renderer/src/pages/document/components/form/FormChuyendonvixuly.tsx](c:/xampp/htdocs/myoffice_vr/src/renderer/src/pages/document/components/form/FormChuyendonvixuly.tsx): selects/listboxes.
- [ ] `overlay wrapper` [src/renderer/src/pages/document/components/form/FormPhanhoi.tsx](c:/xampp/htdocs/myoffice_vr/src/renderer/src/pages/document/components/form/FormPhanhoi.tsx): inputs + modal.
- [ ] `overlay wrapper` [src/renderer/src/pages/document/components/form/FormVanbanden.tsx](c:/xampp/htdocs/myoffice_vr/src/renderer/src/pages/document/components/form/FormVanbanden.tsx): form fields and date controls.
- [ ] `overlay wrapper` [src/renderer/src/pages/document/components/form/FormVanbandi.tsx](c:/xampp/htdocs/myoffice_vr/src/renderer/src/pages/document/components/form/FormVanbandi.tsx): form fields and date controls.
- [ ] `overlay wrapper` [src/renderer/src/pages/document/components/form/FormVanbandidonvi.tsx](c:/xampp/htdocs/myoffice_vr/src/renderer/src/pages/document/components/form/FormVanbandidonvi.tsx): form fields and date controls.
- [ ] `overlay wrapper` [src/renderer/src/pages/document/components/form/FormVanbannoibo.tsx](c:/xampp/htdocs/myoffice_vr/src/renderer/src/pages/document/components/form/FormVanbannoibo.tsx): form fields and date controls.
- [ ] `overlay wrapper` [src/renderer/src/pages/document/components/form/FormViewDonvixuly.tsx](c:/xampp/htdocs/myoffice_vr/src/renderer/src/pages/document/components/form/FormViewDonvixuly.tsx): collection items.
- [ ] `wrapper collection` [src/renderer/src/pages/document/components/form/TabContentBanhanh.tsx](c:/xampp/htdocs/myoffice_vr/src/renderer/src/pages/document/components/form/TabContentBanhanh.tsx): tabs, selects, dates.
- [ ] `wrapper collection` [src/renderer/src/pages/document/components/form/TabContentBanhanhDonVi.tsx](c:/xampp/htdocs/myoffice_vr/src/renderer/src/pages/document/components/form/TabContentBanhanhDonVi.tsx): tabs, selects, dates.
- [ ] `wrapper collection` [src/renderer/src/pages/document/components/form/TabContentGioiHanDoc.tsx](c:/xampp/htdocs/myoffice_vr/src/renderer/src/pages/document/components/form/TabContentGioiHanDoc.tsx): tabs/list selection.
- [ ] `wrapper` [src/renderer/src/pages/document/components/InputPhanhoi.tsx](c:/xampp/htdocs/myoffice_vr/src/renderer/src/pages/document/components/InputPhanhoi.tsx): input props.
- [ ] `wrapper` [src/renderer/src/pages/document/components/InputSearchDocument.tsx](c:/xampp/htdocs/myoffice_vr/src/renderer/src/pages/document/components/InputSearchDocument.tsx): search input.
- [ ] `rename collection` [src/renderer/src/pages/document/components/ListBox/ListBoxCompose.tsx](c:/xampp/htdocs/myoffice_vr/src/renderer/src/pages/document/components/ListBox/ListBoxCompose.tsx): `Listbox` -> `ListBox`, item identity.
- [ ] `rename collection` [src/renderer/src/pages/document/components/ListBox/ListBoxNavigation.tsx](c:/xampp/htdocs/myoffice_vr/src/renderer/src/pages/document/components/ListBox/ListBoxNavigation.tsx): `Listbox` -> `ListBox`, item identity.
- [ ] `overlay table` [src/renderer/src/pages/document/components/modal/HistoryLogModal.tsx](c:/xampp/htdocs/myoffice_vr/src/renderer/src/pages/document/components/modal/HistoryLogModal.tsx): modal + table.
- [ ] `overlay` [src/renderer/src/pages/document/components/modal/ModalCompose.tsx](c:/xampp/htdocs/myoffice_vr/src/renderer/src/pages/document/components/modal/ModalCompose.tsx): modal API.
- [ ] `collection` [src/renderer/src/pages/document/components/sideLeft/SideLeftCompose.tsx](c:/xampp/htdocs/myoffice_vr/src/renderer/src/pages/document/components/sideLeft/SideLeftCompose.tsx): list/nav items.
- [ ] `collection` [src/renderer/src/pages/document/components/sideLeft/SideLeftNavigation.tsx](c:/xampp/htdocs/myoffice_vr/src/renderer/src/pages/document/components/sideLeft/SideLeftNavigation.tsx): list/nav items.
- [ ] `collection` [src/renderer/src/pages/document/components/sideLeft/SideLeftToggle.tsx](c:/xampp/htdocs/myoffice_vr/src/renderer/src/pages/document/components/sideLeft/SideLeftToggle.tsx): button/toggle.
- [ ] `wrapper` [src/renderer/src/pages/document/components/table/FileChip.tsx](c:/xampp/htdocs/myoffice_vr/src/renderer/src/pages/document/components/table/FileChip.tsx): chip compatibility.
- [ ] `collection` [src/renderer/src/pages/document/components/table/Filters/BoxFilter.tsx](c:/xampp/htdocs/myoffice_vr/src/renderer/src/pages/document/components/table/Filters/BoxFilter.tsx): filter controls.
- [ ] `overlay collection` [src/renderer/src/pages/document/components/table/Filters/PopupFilter.tsx](c:/xampp/htdocs/myoffice_vr/src/renderer/src/pages/document/components/table/Filters/PopupFilter.tsx): popover/filter controls.
- [ ] `collection` [src/renderer/src/pages/document/components/table/Filters/YearFilter.tsx](c:/xampp/htdocs/myoffice_vr/src/renderer/src/pages/document/components/table/Filters/YearFilter.tsx): select/date items.
- [ ] `table collection` [src/renderer/src/pages/document/components/table/RowActionCheckbox.tsx](c:/xampp/htdocs/myoffice_vr/src/renderer/src/pages/document/components/table/RowActionCheckbox.tsx): checkbox/table action.
- [ ] `table collection` [src/renderer/src/pages/document/components/table/TableDocument copy.tsx](c:/xampp/htdocs/myoffice_vr/src/renderer/src/pages/document/components/table/TableDocument%20copy.tsx): quyết định xóa hoặc migrate nếu còn dùng.
- [ ] `table collection` [src/renderer/src/pages/document/components/table/TableDocument.tsx](c:/xampp/htdocs/myoffice_vr/src/renderer/src/pages/document/components/table/TableDocument.tsx): table API, sort, selection.
- [ ] `table` [src/renderer/src/pages/document/components/TableVanbanden.tsx](c:/xampp/htdocs/myoffice_vr/src/renderer/src/pages/document/components/TableVanbanden.tsx): table wrapper.
- [ ] `wrapper` [src/renderer/src/pages/document/layout/DocumentRow.tsx](c:/xampp/htdocs/myoffice_vr/src/renderer/src/pages/document/layout/DocumentRow.tsx): row styling.
- [ ] `collection` [src/renderer/src/pages/document/layout/FilterVanban.tsx](c:/xampp/htdocs/myoffice_vr/src/renderer/src/pages/document/layout/FilterVanban.tsx): filters, selects, popovers.
- [ ] `wrapper` [src/renderer/src/pages/document/layout/SideRightVanban.tsx](c:/xampp/htdocs/myoffice_vr/src/renderer/src/pages/document/layout/SideRightVanban.tsx): spinner and side panel.
- [ ] `overlay toast` [src/renderer/src/pages/document/Vanbandaxoa.tsx](c:/xampp/htdocs/myoffice_vr/src/renderer/src/pages/document/Vanbandaxoa.tsx): buttons, chips, tooltip, toast.
- [ ] `overlay rename toast` [src/renderer/src/pages/document/VanbandendonviPage.tsx](c:/xampp/htdocs/myoffice_vr/src/renderer/src/pages/document/VanbandendonviPage.tsx): heavy `useDisclosure` page.
- [ ] `overlay rename toast` [src/renderer/src/pages/document/VanbandenPage.tsx](c:/xampp/htdocs/myoffice_vr/src/renderer/src/pages/document/VanbandenPage.tsx): heavy `useDisclosure` page.
- [ ] `overlay rename toast` [src/renderer/src/pages/document/VanbandidonviPage.tsx](c:/xampp/htdocs/myoffice_vr/src/renderer/src/pages/document/VanbandidonviPage.tsx): heavy `useDisclosure` page.
- [ ] `overlay rename toast` [src/renderer/src/pages/document/VanbandiPage.tsx](c:/xampp/htdocs/myoffice_vr/src/renderer/src/pages/document/VanbandiPage.tsx): heavy `useDisclosure` page.
- [ ] `overlay rename toast` [src/renderer/src/pages/document/VanbannoiboPage.tsx](c:/xampp/htdocs/myoffice_vr/src/renderer/src/pages/document/VanbannoiboPage.tsx): heavy `useDisclosure` page.

## Phase 6 - HR module

### Contract

- [ ] `collection` [src/renderer/src/pages/hr/contract/BoxFilter.tsx](c:/xampp/htdocs/myoffice_vr/src/renderer/src/pages/hr/contract/BoxFilter.tsx): filter controls.
- [ ] `wrapper` [src/renderer/src/pages/hr/contract/components/BoxSearchFile.tsx](c:/xampp/htdocs/myoffice_vr/src/renderer/src/pages/hr/contract/components/BoxSearchFile.tsx): search input.
- [ ] `overlay wrapper` [src/renderer/src/pages/hr/contract/FormPhuluc.tsx](c:/xampp/htdocs/myoffice_vr/src/renderer/src/pages/hr/contract/FormPhuluc.tsx): form controls.
- [ ] `overlay collection` [src/renderer/src/pages/hr/contract/HopdongFilterPopover.tsx](c:/xampp/htdocs/myoffice_vr/src/renderer/src/pages/hr/contract/HopdongFilterPopover.tsx): popover filters.
- [ ] `overlay rename` [src/renderer/src/pages/hr/contract/HopdongPage.tsx](c:/xampp/htdocs/myoffice_vr/src/renderer/src/pages/hr/contract/HopdongPage.tsx): heavy `useDisclosure`, drawer/modal flow.
- [ ] `overlay rename` [src/renderer/src/pages/hr/contract/HopdongPage_old.tsx](c:/xampp/htdocs/myoffice_vr/src/renderer/src/pages/hr/contract/HopdongPage_old.tsx): quyết định giữ hay xóa; nếu giữ phải migrate.
- [ ] `overlay rename` [src/renderer/src/pages/hr/contract/ViewPhulucModal.tsx](c:/xampp/htdocs/myoffice_vr/src/renderer/src/pages/hr/contract/ViewPhulucModal.tsx): drawer/modal flow.

### In the / badges

- [ ] `wrapper` [src/renderer/src/pages/hr/inthe/components/IntheCardDesign.tsx](c:/xampp/htdocs/myoffice_vr/src/renderer/src/pages/hr/inthe/components/IntheCardDesign.tsx): card/avatar/layout.
- [ ] `table` [src/renderer/src/pages/hr/inthe/components/IntheTable.tsx](c:/xampp/htdocs/myoffice_vr/src/renderer/src/pages/hr/inthe/components/IntheTable.tsx): table compatibility.
- [ ] `collection` [src/renderer/src/pages/hr/inthe/components/IntheToolbar.tsx](c:/xampp/htdocs/myoffice_vr/src/renderer/src/pages/hr/inthe/components/IntheToolbar.tsx): toolbar filters.
- [ ] `table` [src/renderer/src/pages/hr/inthe/hooks/useInthe.ts](c:/xampp/htdocs/myoffice_vr/src/renderer/src/pages/hr/inthe/hooks/useInthe.ts): selection/sort types nếu dùng HeroUI types.

### Leave

- [ ] `table` [src/renderer/src/pages/hr/leave/columns.tsx](c:/xampp/htdocs/myoffice_vr/src/renderer/src/pages/hr/leave/columns.tsx): table cell renderers.
- [ ] `overlay wrapper` [src/renderer/src/pages/hr/leave/components/CreateLeaveRequestModal.tsx](c:/xampp/htdocs/myoffice_vr/src/renderer/src/pages/hr/leave/components/CreateLeaveRequestModal.tsx): modal/form.
- [ ] `overlay wrapper` [src/renderer/src/pages/hr/leave/components/CreateLeaveTypeModal.tsx](c:/xampp/htdocs/myoffice_vr/src/renderer/src/pages/hr/leave/components/CreateLeaveTypeModal.tsx): modal/form.
- [ ] `rename` [src/renderer/src/pages/hr/leave/components/DateRangeSelector.tsx](c:/xampp/htdocs/myoffice_vr/src/renderer/src/pages/hr/leave/components/DateRangeSelector.tsx): date range API.
- [ ] `wrapper` [src/renderer/src/pages/hr/leave/components/EmployeeLeaveQuota.tsx](c:/xampp/htdocs/myoffice_vr/src/renderer/src/pages/hr/leave/components/EmployeeLeaveQuota.tsx): cards/progress.
- [ ] `overlay` [src/renderer/src/pages/hr/leave/components/ExportLeaveByDepartmentModal.tsx](c:/xampp/htdocs/myoffice_vr/src/renderer/src/pages/hr/leave/components/ExportLeaveByDepartmentModal.tsx): modal.
- [ ] `overlay` [src/renderer/src/pages/hr/leave/components/ExportNghiPhepModal.tsx](c:/xampp/htdocs/myoffice_vr/src/renderer/src/pages/hr/leave/components/ExportNghiPhepModal.tsx): modal.
- [ ] `overlay` [src/renderer/src/pages/hr/leave/components/ImportNghiPhepModal.tsx](c:/xampp/htdocs/myoffice_vr/src/renderer/src/pages/hr/leave/components/ImportNghiPhepModal.tsx): modal.
- [ ] `wrapper` [src/renderer/src/pages/hr/leave/components/LeaveApprovalActions.tsx](c:/xampp/htdocs/myoffice_vr/src/renderer/src/pages/hr/leave/components/LeaveApprovalActions.tsx): buttons/chips.
- [ ] `wrapper` [src/renderer/src/pages/hr/leave/components/LeaveApprovalLogs.tsx](c:/xampp/htdocs/myoffice_vr/src/renderer/src/pages/hr/leave/components/LeaveApprovalLogs.tsx): table/list logs.
- [ ] `wrapper` [src/renderer/src/pages/hr/leave/components/LeaveApprovalProcess.tsx](c:/xampp/htdocs/myoffice_vr/src/renderer/src/pages/hr/leave/components/LeaveApprovalProcess.tsx): process/timeline display.
- [ ] `wrapper` [src/renderer/src/pages/hr/leave/components/LeaveApprovalTimeline.tsx](c:/xampp/htdocs/myoffice_vr/src/renderer/src/pages/hr/leave/components/LeaveApprovalTimeline.tsx): timeline.
- [ ] `wrapper` [src/renderer/src/pages/hr/leave/components/LeaveDaysForm.tsx](c:/xampp/htdocs/myoffice_vr/src/renderer/src/pages/hr/leave/components/LeaveDaysForm.tsx): form fields.
- [ ] `wrapper` [src/renderer/src/pages/hr/leave/components/LeaveDetailHeader.tsx](c:/xampp/htdocs/myoffice_vr/src/renderer/src/pages/hr/leave/components/LeaveDetailHeader.tsx): badges/chips/buttons.
- [ ] `wrapper` [src/renderer/src/pages/hr/leave/components/LeaveEmployeeInfo.tsx](c:/xampp/htdocs/myoffice_vr/src/renderer/src/pages/hr/leave/components/LeaveEmployeeInfo.tsx): card/display.
- [ ] `wrapper` [src/renderer/src/pages/hr/leave/components/LeaveRequestFormContent.tsx](c:/xampp/htdocs/myoffice_vr/src/renderer/src/pages/hr/leave/components/LeaveRequestFormContent.tsx): form inputs/selects/dates.
- [ ] `table` [src/renderer/src/pages/hr/leave/components/LeaveTable.tsx](c:/xampp/htdocs/myoffice_vr/src/renderer/src/pages/hr/leave/components/LeaveTable.tsx): table compatibility.
- [ ] `overlay collection rename` [src/renderer/src/pages/hr/leave/components/NghiPhepToolbar.tsx](c:/xampp/htdocs/myoffice_vr/src/renderer/src/pages/hr/leave/components/NghiPhepToolbar.tsx): filters, popovers, `useDisclosure`.
- [ ] `wrapper` [src/renderer/src/pages/hr/leave/components/statistics/ThongKeDonViTab.tsx](c:/xampp/htdocs/myoffice_vr/src/renderer/src/pages/hr/leave/components/statistics/ThongKeDonViTab.tsx): stats cards/charts container.
- [ ] `overlay` [src/renderer/src/pages/hr/leave/components/SupplementMinhChungModal.tsx](c:/xampp/htdocs/myoffice_vr/src/renderer/src/pages/hr/leave/components/SupplementMinhChungModal.tsx): modal.
- [ ] `table` [src/renderer/src/pages/hr/leave/DangKyNghiPhepPage.tsx](c:/xampp/htdocs/myoffice_vr/src/renderer/src/pages/hr/leave/DangKyNghiPhepPage.tsx): page-level HeroUI state.
- [ ] `toast` [src/renderer/src/pages/hr/leave/hooks/useCreateLeaveRequest.ts](c:/xampp/htdocs/myoffice_vr/src/renderer/src/pages/hr/leave/hooks/useCreateLeaveRequest.ts): toast source.
- [ ] `table collection` [src/renderer/src/pages/hr/leave/hooks/useNghiPhep.ts](c:/xampp/htdocs/myoffice_vr/src/renderer/src/pages/hr/leave/hooks/useNghiPhep.ts): selection/sort/filter types.
- [ ] `table` [src/renderer/src/pages/hr/leave/NghiPhepPage.tsx](c:/xampp/htdocs/myoffice_vr/src/renderer/src/pages/hr/leave/NghiPhepPage.tsx): page-level table patterns.

### Employee self-update, propose HR, resign

- [ ] `overlay` [src/renderer/src/pages/hr/nhanvientucapnhat/components/ModalDetailYeuCau.tsx](c:/xampp/htdocs/myoffice_vr/src/renderer/src/pages/hr/nhanvientucapnhat/components/ModalDetailYeuCau.tsx): modal.
- [ ] `collection overlay` [src/renderer/src/pages/hr/nhanvientucapnhat/components/NhanVienTuCapNhatToolbar.tsx](c:/xampp/htdocs/myoffice_vr/src/renderer/src/pages/hr/nhanvientucapnhat/components/NhanVienTuCapNhatToolbar.tsx): filters and actions.
- [ ] `overlay rename` [src/renderer/src/pages/hr/nhanvientucapnhat/NhanVienTuCapNhatPage.tsx](c:/xampp/htdocs/myoffice_vr/src/renderer/src/pages/hr/nhanvientucapnhat/NhanVienTuCapNhatPage.tsx): heavy `useDisclosure`.
- [ ] `overlay rename` [src/renderer/src/pages/hr/propose/PinCodeApproval.tsx](c:/xampp/htdocs/myoffice_vr/src/renderer/src/pages/hr/propose/PinCodeApproval.tsx): input otp/approval flow.
- [ ] `overlay` [src/renderer/src/pages/hr/thoiviec/AddProcedureModal.tsx](c:/xampp/htdocs/myoffice_vr/src/renderer/src/pages/hr/thoiviec/AddProcedureModal.tsx): modal.
- [ ] `overlay` [src/renderer/src/pages/hr/thoiviec/AddThoiviecModal.tsx](c:/xampp/htdocs/myoffice_vr/src/renderer/src/pages/hr/thoiviec/AddThoiviecModal.tsx): modal.
- [ ] `overlay` [src/renderer/src/pages/hr/thoiviec/ManageProceduresModal.tsx](c:/xampp/htdocs/myoffice_vr/src/renderer/src/pages/hr/thoiviec/ManageProceduresModal.tsx): modal.
- [ ] `overlay collection` [src/renderer/src/pages/hr/thoiviec/ThoiviecFilterPopover.tsx](c:/xampp/htdocs/myoffice_vr/src/renderer/src/pages/hr/thoiviec/ThoiviecFilterPopover.tsx): popover filters.
- [ ] `table` [src/renderer/src/pages/hr/thoiviec/ThoiviecPage.tsx](c:/xampp/htdocs/myoffice_vr/src/renderer/src/pages/hr/thoiviec/ThoiviecPage.tsx): page-level table and filters.
- [ ] `wrapper` [src/renderer/src/pages/hr/thoiviec/ThoiviecProcedures.tsx](c:/xampp/htdocs/myoffice_vr/src/renderer/src/pages/hr/thoiviec/ThoiviecProcedures.tsx): buttons/list display.
- [ ] `wrapper` [src/renderer/src/pages/hr/thoiviec/ThoiviecStats.tsx](c:/xampp/htdocs/myoffice_vr/src/renderer/src/pages/hr/thoiviec/ThoiviecStats.tsx): cards.

## Phase 7 - Notify module

- [ ] `overlay collection rename` [src/renderer/src/pages/notify/components/NotificationFilters.tsx](c:/xampp/htdocs/myoffice_vr/src/renderer/src/pages/notify/components/NotificationFilters.tsx): input/date/popup filters.
- [ ] `wrapper` [src/renderer/src/pages/notify/components/NotificationItem.tsx](c:/xampp/htdocs/myoffice_vr/src/renderer/src/pages/notify/components/NotificationItem.tsx): checkbox/item display.
- [ ] `wrapper` [src/renderer/src/pages/notify/components/NotificationList.tsx](c:/xampp/htdocs/myoffice_vr/src/renderer/src/pages/notify/components/NotificationList.tsx): spinner/list.
- [ ] `collection` [src/renderer/src/pages/notify/components/NotificationListHeader.tsx](c:/xampp/htdocs/myoffice_vr/src/renderer/src/pages/notify/components/NotificationListHeader.tsx): tabs, checkbox, buttons.
- [ ] `toast collection` [src/renderer/src/pages/notify/hooks/useNotifications.ts](c:/xampp/htdocs/myoffice_vr/src/renderer/src/pages/notify/hooks/useNotifications.ts): toast API + selected tab state.
- [ ] `wrapper rename` [src/renderer/src/pages/notify/ThongBaoPage.tsx](c:/xampp/htdocs/myoffice_vr/src/renderer/src/pages/notify/ThongBaoPage.tsx): `Alert` API và page filters.

## Phase 8 - Profile module

- [ ] `overlay rename` [src/renderer/src/pages/profile/AddNhansuPage.tsx](c:/xampp/htdocs/myoffice_vr/src/renderer/src/pages/profile/AddNhansuPage.tsx): heavy `useDisclosure` and modal flows.
- [ ] `overlay rename` [src/renderer/src/pages/profile/components/AddNhansuButton.tsx](c:/xampp/htdocs/myoffice_vr/src/renderer/src/pages/profile/components/AddNhansuButton.tsx): modal trigger flow.
- [ ] `wrapper` [src/renderer/src/pages/profile/components/CardThongKe.tsx](c:/xampp/htdocs/myoffice_vr/src/renderer/src/pages/profile/components/CardThongKe.tsx): card metrics.
- [ ] `rename` [src/renderer/src/pages/profile/components/DateInputFloating.tsx](c:/xampp/htdocs/myoffice_vr/src/renderer/src/pages/profile/components/DateInputFloating.tsx): date field migration.
- [ ] `overlay rename` [src/renderer/src/pages/profile/components/elements/Bangcap.tsx](c:/xampp/htdocs/myoffice_vr/src/renderer/src/pages/profile/components/elements/Bangcap.tsx): `useDisclosure`.
- [ ] `overlay rename` [src/renderer/src/pages/profile/components/elements/Chungchi.tsx](c:/xampp/htdocs/myoffice_vr/src/renderer/src/pages/profile/components/elements/Chungchi.tsx): `useDisclosure`.
- [ ] `overlay rename` [src/renderer/src/pages/profile/components/elements/Danhgia.tsx](c:/xampp/htdocs/myoffice_vr/src/renderer/src/pages/profile/components/elements/Danhgia.tsx): `useDisclosure`.
- [ ] `wrapper` [src/renderer/src/pages/profile/components/elements/FormKhenthuong.tsx](c:/xampp/htdocs/myoffice_vr/src/renderer/src/pages/profile/components/elements/FormKhenthuong.tsx): tabs, input, textarea, checkbox.
- [ ] `wrapper` [src/renderer/src/pages/profile/components/elements/FormKinhnghiemlamviec.tsx](c:/xampp/htdocs/myoffice_vr/src/renderer/src/pages/profile/components/elements/FormKinhnghiemlamviec.tsx): checkbox and form fields.
- [ ] `wrapper` [src/renderer/src/pages/profile/components/elements/FormQuatrinhdaotao.tsx](c:/xampp/htdocs/myoffice_vr/src/renderer/src/pages/profile/components/elements/FormQuatrinhdaotao.tsx): tabs, input, textarea, checkbox.
- [ ] `wrapper` [src/renderer/src/pages/profile/components/elements/FormThoiviec.tsx](c:/xampp/htdocs/myoffice_vr/src/renderer/src/pages/profile/components/elements/FormThoiviec.tsx): tabs, inputs, textarea.
- [ ] `overlay rename remove` [src/renderer/src/pages/profile/components/elements/Hopdong.tsx](c:/xampp/htdocs/myoffice_vr/src/renderer/src/pages/profile/components/elements/Hopdong.tsx): `User` component bị remove; `useDisclosure`.
- [ ] `overlay rename` [src/renderer/src/pages/profile/components/elements/Khenthuong.tsx](c:/xampp/htdocs/myoffice_vr/src/renderer/src/pages/profile/components/elements/Khenthuong.tsx): `useDisclosure`.
- [ ] `overlay rename` [src/renderer/src/pages/profile/components/elements/Kinhnghiemlamviec.tsx](c:/xampp/htdocs/myoffice_vr/src/renderer/src/pages/profile/components/elements/Kinhnghiemlamviec.tsx): `useDisclosure`.
- [ ] `overlay rename` [src/renderer/src/pages/profile/components/elements/Quatrinhcongtac.tsx](c:/xampp/htdocs/myoffice_vr/src/renderer/src/pages/profile/components/elements/Quatrinhcongtac.tsx): `useDisclosure`.
- [ ] `overlay rename` [src/renderer/src/pages/profile/components/elements/Quatrinhdaotao.tsx](c:/xampp/htdocs/myoffice_vr/src/renderer/src/pages/profile/components/elements/Quatrinhdaotao.tsx): `useDisclosure`.
- [ ] `wrapper` [src/renderer/src/pages/profile/components/elements/Step4ThongTinGiaDinh.tsx](c:/xampp/htdocs/myoffice_vr/src/renderer/src/pages/profile/components/elements/Step4ThongTinGiaDinh.tsx): card/chip display.
- [ ] `overlay rename` [src/renderer/src/pages/profile/components/elements/ThoiViec.tsx](c:/xampp/htdocs/myoffice_vr/src/renderer/src/pages/profile/components/elements/ThoiViec.tsx): `useDisclosure`.
- [ ] `overlay rename` [src/renderer/src/pages/profile/components/elements/Thongtingiadinh.tsx](c:/xampp/htdocs/myoffice_vr/src/renderer/src/pages/profile/components/elements/Thongtingiadinh.tsx): `useDisclosure`.
- [ ] `collection` [src/renderer/src/pages/profile/components/FloatingLabelSelect.tsx](c:/xampp/htdocs/myoffice_vr/src/renderer/src/pages/profile/components/FloatingLabelSelect.tsx): select identity.
- [ ] `rename` [src/renderer/src/pages/profile/components/FloatingLabelTextarea.tsx](c:/xampp/htdocs/myoffice_vr/src/renderer/src/pages/profile/components/FloatingLabelTextarea.tsx): textarea API.
- [ ] `collection` [src/renderer/src/pages/profile/components/HosonhansuFilterDrawer.tsx](c:/xampp/htdocs/myoffice_vr/src/renderer/src/pages/profile/components/HosonhansuFilterDrawer.tsx): tabs/filter controls.
- [ ] `collection` [src/renderer/src/pages/profile/components/HosonhansuFilterPopover.tsx](c:/xampp/htdocs/myoffice_vr/src/renderer/src/pages/profile/components/HosonhansuFilterPopover.tsx): popover/filter controls.
- [ ] `table` [src/renderer/src/pages/profile/components/HosonhansuTable.tsx](c:/xampp/htdocs/myoffice_vr/src/renderer/src/pages/profile/components/HosonhansuTable.tsx): selection/table types.
- [ ] `collection table` [src/renderer/src/pages/profile/components/HosonhansuToolbar.tsx](c:/xampp/htdocs/myoffice_vr/src/renderer/src/pages/profile/components/HosonhansuToolbar.tsx): filters, dropdowns, sort.
- [ ] `wrapper` [src/renderer/src/pages/profile/components/InputFloatingLabel.tsx](c:/xampp/htdocs/myoffice_vr/src/renderer/src/pages/profile/components/InputFloatingLabel.tsx): input styles.
- [ ] `overlay` [src/renderer/src/pages/profile/components/NfcScanModal.tsx](c:/xampp/htdocs/myoffice_vr/src/renderer/src/pages/profile/components/NfcScanModal.tsx): modal.
- [ ] `collection rename` [src/renderer/src/pages/profile/components/NhansuFilter.tsx](c:/xampp/htdocs/myoffice_vr/src/renderer/src/pages/profile/components/NhansuFilter.tsx): dropdown + `DateInput`/`Select` migration.
- [ ] `collection` [src/renderer/src/pages/profile/components/SearchableSelect.tsx](c:/xampp/htdocs/myoffice_vr/src/renderer/src/pages/profile/components/SearchableSelect.tsx): `cn`/theme utility và select semantics.
- [ ] `wrapper` [src/renderer/src/pages/profile/components/Step1Basic.tsx](c:/xampp/htdocs/myoffice_vr/src/renderer/src/pages/profile/components/Step1Basic.tsx): button/card/checkbox/tooltip.
- [ ] `wrapper` [src/renderer/src/pages/profile/components/Step1Basic_old.tsx](c:/xampp/htdocs/myoffice_vr/src/renderer/src/pages/profile/components/Step1Basic_old.tsx): quyết định giữ hay xóa; nếu giữ phải migrate.
- [ ] `wrapper` [src/renderer/src/pages/profile/components/Step2Contact.tsx](c:/xampp/htdocs/myoffice_vr/src/renderer/src/pages/profile/components/Step2Contact.tsx): checkbox.
- [ ] `wrapper` [src/renderer/src/pages/profile/components/Step3Work.tsx](c:/xampp/htdocs/myoffice_vr/src/renderer/src/pages/profile/components/Step3Work.tsx): card/checkbox.
- [ ] `table` [src/renderer/src/pages/profile/components/TableNhansu.tsx](c:/xampp/htdocs/myoffice_vr/src/renderer/src/pages/profile/components/TableNhansu.tsx): table compatibility.
- [ ] `overlay rename` [src/renderer/src/pages/profile/EditNhansuPage.tsx](c:/xampp/htdocs/myoffice_vr/src/renderer/src/pages/profile/EditNhansuPage.tsx): heavy `useDisclosure`.
- [ ] `wrapper` [src/renderer/src/pages/profile/EditProfile.tsx](c:/xampp/htdocs/myoffice_vr/src/renderer/src/pages/profile/EditProfile.tsx): page-level control usage.
- [ ] `table collection` [src/renderer/src/pages/profile/hooks/useHosonhansu.ts](c:/xampp/htdocs/myoffice_vr/src/renderer/src/pages/profile/hooks/useHosonhansu.ts): `Selection` types.
- [ ] `table` [src/renderer/src/pages/profile/hooks/useHosonhansuColumns.tsx](c:/xampp/htdocs/myoffice_vr/src/renderer/src/pages/profile/hooks/useHosonhansuColumns.tsx): chip renderers.
- [ ] `table wrapper` [src/renderer/src/pages/profile/HosonhansuPage.tsx](c:/xampp/htdocs/myoffice_vr/src/renderer/src/pages/profile/HosonhansuPage.tsx): page-level toolbar/table integration.
- [ ] `overlay rename` [src/renderer/src/pages/profile/UpdateProfilePage.tsx](c:/xampp/htdocs/myoffice_vr/src/renderer/src/pages/profile/UpdateProfilePage.tsx): heavy `useDisclosure`.

## Phase 9 - Propose module

- [ ] `wrapper` [src/renderer/src/pages/propose/components/ApproverSection.tsx](c:/xampp/htdocs/myoffice_vr/src/renderer/src/pages/propose/components/ApproverSection.tsx): buttons and layout.
- [ ] `overlay` [src/renderer/src/pages/propose/components/CreateProposeModal.tsx](c:/xampp/htdocs/myoffice_vr/src/renderer/src/pages/propose/components/CreateProposeModal.tsx): modal composition.
- [ ] `overlay` [src/renderer/src/pages/propose/components/DrawerAllComments.tsx](c:/xampp/htdocs/myoffice_vr/src/renderer/src/pages/propose/components/DrawerAllComments.tsx): drawer/spinner.
- [ ] `overlay collection` [src/renderer/src/pages/propose/components/DrawerPropose.tsx](c:/xampp/htdocs/myoffice_vr/src/renderer/src/pages/propose/components/DrawerPropose.tsx): drawer + collection items.
- [ ] `rename` [src/renderer/src/pages/propose/components/FileUploadGmail.tsx](c:/xampp/htdocs/myoffice_vr/src/renderer/src/pages/propose/components/FileUploadGmail.tsx): `Progress` -> `ProgressBar`.
- [ ] `toast wrapper` [src/renderer/src/pages/propose/components/FileUploadSimple.tsx](c:/xampp/htdocs/myoffice_vr/src/renderer/src/pages/propose/components/FileUploadSimple.tsx): button + toast.
- [ ] `collection` [src/renderer/src/pages/propose/components/list/ProposeListHeader.tsx](c:/xampp/htdocs/myoffice_vr/src/renderer/src/pages/propose/components/list/ProposeListHeader.tsx): tabs/filters/selection.
- [ ] `wrapper` [src/renderer/src/pages/propose/components/list/ProposeListItem.tsx](c:/xampp/htdocs/myoffice_vr/src/renderer/src/pages/propose/components/list/ProposeListItem.tsx): checkbox/chip/tooltip.
- [ ] `collection` [src/renderer/src/pages/propose/components/MinimizedMorePropose.tsx](c:/xampp/htdocs/myoffice_vr/src/renderer/src/pages/propose/components/MinimizedMorePropose.tsx): dropdown items.
- [ ] `toast wrapper` [src/renderer/src/pages/propose/components/ProposeCommentInput.tsx](c:/xampp/htdocs/myoffice_vr/src/renderer/src/pages/propose/components/ProposeCommentInput.tsx): input/button/toast.
- [ ] `collection toast` [src/renderer/src/pages/propose/components/ProposeCommentList.tsx](c:/xampp/htdocs/myoffice_vr/src/renderer/src/pages/propose/components/ProposeCommentList.tsx): chip/popover/input/toast.
- [ ] `overlay` [src/renderer/src/pages/propose/components/ProposeDetailModal.tsx](c:/xampp/htdocs/myoffice_vr/src/renderer/src/pages/propose/components/ProposeDetailModal.tsx): modal details.
- [ ] `table` [src/renderer/src/pages/propose/components/ProposeListView.tsx](c:/xampp/htdocs/myoffice_vr/src/renderer/src/pages/propose/components/ProposeListView.tsx): selection/skeleton.
- [ ] `wrapper` [src/renderer/src/pages/propose/components/ProposeStatus.tsx](c:/xampp/htdocs/myoffice_vr/src/renderer/src/pages/propose/components/ProposeStatus.tsx): chip compatibility.
- [ ] `table` [src/renderer/src/pages/propose/components/ProposeTable.tsx](c:/xampp/htdocs/myoffice_vr/src/renderer/src/pages/propose/components/ProposeTable.tsx): button/tooltip/table interactions.
- [ ] `collection table` [src/renderer/src/pages/propose/components/ProposeToolbar.tsx](c:/xampp/htdocs/myoffice_vr/src/renderer/src/pages/propose/components/ProposeToolbar.tsx): filters, tabs, sort.
- [ ] `wrapper` [src/renderer/src/pages/propose/components/ProposeWorkflowTimeline.tsx](c:/xampp/htdocs/myoffice_vr/src/renderer/src/pages/propose/components/ProposeWorkflowTimeline.tsx): tooltip timeline.
- [ ] `collection` [src/renderer/src/pages/propose/components/RecipientSelector.tsx](c:/xampp/htdocs/myoffice_vr/src/renderer/src/pages/propose/components/RecipientSelector.tsx): select/list identity.
- [ ] `overlay collection` [src/renderer/src/pages/propose/components/SelectRecipientsModal.tsx](c:/xampp/htdocs/myoffice_vr/src/renderer/src/pages/propose/components/SelectRecipientsModal.tsx): modal + collection items.
- [ ] `overlay collection` [src/renderer/src/pages/propose/components/SelectUsersModal.tsx](c:/xampp/htdocs/myoffice_vr/src/renderer/src/pages/propose/components/SelectUsersModal.tsx): modal + collection items.
- [ ] `collection` [src/renderer/src/pages/propose/components/SideLeftPropose.tsx](c:/xampp/htdocs/myoffice_vr/src/renderer/src/pages/propose/components/SideLeftPropose.tsx): nav/filter list.
- [ ] `overlay` [src/renderer/src/pages/propose/components/WorkflowPreviewModal.tsx](c:/xampp/htdocs/myoffice_vr/src/renderer/src/pages/propose/components/WorkflowPreviewModal.tsx): modal.
- [ ] `toast` [src/renderer/src/pages/propose/hooks/useCreatePropose.ts](c:/xampp/htdocs/myoffice_vr/src/renderer/src/pages/propose/hooks/useCreatePropose.ts): toast source.
- [ ] `table collection toast` [src/renderer/src/pages/propose/ProposePage.tsx](c:/xampp/htdocs/myoffice_vr/src/renderer/src/pages/propose/ProposePage.tsx): page-level tabs, table/list view, action flows.

## Phase 10 - System module

- [ ] `wrapper` [src/renderer/src/pages/system/components/SystemSidebar.tsx](c:/xampp/htdocs/myoffice_vr/src/renderer/src/pages/system/components/SystemSidebar.tsx): tooltip and button display.
- [ ] `overlay table remove` [src/renderer/src/pages/system/modals/LoginHistoryModal.tsx](c:/xampp/htdocs/myoffice_vr/src/renderer/src/pages/system/modals/LoginHistoryModal.tsx): modal/table pagination; `User` component bị remove.
- [ ] `overlay` [src/renderer/src/pages/system/modals/RoleModal.tsx](c:/xampp/htdocs/myoffice_vr/src/renderer/src/pages/system/modals/RoleModal.tsx): modal form.
- [ ] `overlay collection` [src/renderer/src/pages/system/modals/UserModal.tsx](c:/xampp/htdocs/myoffice_vr/src/renderer/src/pages/system/modals/UserModal.tsx): modal form, roles selection.
- [ ] `toast` [src/renderer/src/pages/system/roles/components/RoleDetailInfo.tsx](c:/xampp/htdocs/myoffice_vr/src/renderer/src/pages/system/roles/components/RoleDetailInfo.tsx): button/skeleton/toast.
- [ ] `collection` [src/renderer/src/pages/system/roles/components/RoleDetailMembers.tsx](c:/xampp/htdocs/myoffice_vr/src/renderer/src/pages/system/roles/components/RoleDetailMembers.tsx): input/chip/list selection.
- [ ] `collection` [src/renderer/src/pages/system/roles/components/RoleDetailPermissions.tsx](c:/xampp/htdocs/myoffice_vr/src/renderer/src/pages/system/roles/components/RoleDetailPermissions.tsx): collection identity.
- [ ] `table collection` [src/renderer/src/pages/system/roles/components/RoleTable.tsx](c:/xampp/htdocs/myoffice_vr/src/renderer/src/pages/system/roles/components/RoleTable.tsx): role table.
- [ ] `collection` [src/renderer/src/pages/system/roles/components/RoleToolbar.tsx](c:/xampp/htdocs/myoffice_vr/src/renderer/src/pages/system/roles/components/RoleToolbar.tsx): dropdowns and filters.
- [ ] `collection` [src/renderer/src/pages/system/roles/components/SideLeftRole.tsx](c:/xampp/htdocs/myoffice_vr/src/renderer/src/pages/system/roles/components/SideLeftRole.tsx): scroll shadow/list nav.
- [ ] `toast table` [src/renderer/src/pages/system/roles/hooks/useRoleLogic.ts](c:/xampp/htdocs/myoffice_vr/src/renderer/src/pages/system/roles/hooks/useRoleLogic.ts): toast + selection types.
- [ ] `toast table` [src/renderer/src/pages/system/roles/hooks/useRoleMemberLogic.ts](c:/xampp/htdocs/myoffice_vr/src/renderer/src/pages/system/roles/hooks/useRoleMemberLogic.ts): toast + `Selection` types.
- [ ] `toast` [src/renderer/src/pages/system/roles/hooks/useRolePermissionLogic.ts](c:/xampp/htdocs/myoffice_vr/src/renderer/src/pages/system/roles/hooks/useRolePermissionLogic.ts): toast source.
- [ ] `collection` [src/renderer/src/pages/system/roles/RolePage.tsx](c:/xampp/htdocs/myoffice_vr/src/renderer/src/pages/system/roles/RolePage.tsx): `Tabs`/`Tab` migration.
- [ ] `table toast` [src/renderer/src/pages/system/tabs/UserTab.tsx](c:/xampp/htdocs/myoffice_vr/src/renderer/src/pages/system/tabs/UserTab.tsx): page-level table/toast integration.
- [ ] `collection` [src/renderer/src/pages/system/users/components/UserFilterPopover.tsx](c:/xampp/htdocs/myoffice_vr/src/renderer/src/pages/system/users/components/UserFilterPopover.tsx): popover filters.
- [ ] `table` [src/renderer/src/pages/system/users/components/UserTable.tsx](c:/xampp/htdocs/myoffice_vr/src/renderer/src/pages/system/users/components/UserTable.tsx): table integration.
- [ ] `collection table` [src/renderer/src/pages/system/users/components/UserToolbar.tsx](c:/xampp/htdocs/myoffice_vr/src/renderer/src/pages/system/users/components/UserToolbar.tsx): dropdowns, spinner, filters.
- [ ] `table toast` [src/renderer/src/pages/system/users/UserPage.tsx](c:/xampp/htdocs/myoffice_vr/src/renderer/src/pages/system/users/UserPage.tsx): page-level table/modal/history flow.

## Phase 11 - Utility follow-up

- [ ] `wrapper` [src/renderer/src/utils/string.ts](c:/xampp/htdocs/myoffice_vr/src/renderer/src/utils/string.ts): rà các exported HeroUI prop types như `ChipProps`.

## Final verification

- [ ] Chạy `npm run typecheck` sau mỗi batch lớn.
- [ ] Chạy `npm run dev` và kiểm tra không còn lỗi runtime từ HeroUI imports.
- [ ] Kiểm tra keyboard navigation cho dropdown, select, tabs, accordion, table selection.
- [ ] Kiểm tra tất cả modal/drawer có focus trap đúng sau khi bỏ `useDisclosure`.
- [ ] Kiểm tra các CSS override `data-slot` còn hiệu lực với HeroUI v3.
- [ ] Gỡ dependency HeroUI v2 còn sót trong [package.json](c:/xampp/htdocs/myoffice_vr/package.json) sau khi code đã migrate xong.
