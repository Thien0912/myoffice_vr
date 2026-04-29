import {
    Activity,
    Award,
    Briefcase,
    Building,
    Calendar,
    Clock,
    ClipboardList,
    FileSearch,
    FileText,
    Inbox,
    MessageCircle,
    UserCheck,
    XCircle
} from 'lucide-react';

// ──────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────

export type FilterOption = {
    value: string;
    label: string;
    group?: string;
    iconStyle?: 'ring' | 'dotted' | 'icon';
    color?: string;
    bg?: string;
    icon?: any;
    isEditable?: boolean;
};

export type CandidateNote = {
    author: string;
    avatar: string;
    time: string;
    content: string;
};

export type Candidate = {
    id: string;
    mshOnline: string;
    date: string;
    email: string;
    fullName: string;
    avatar: string;
    position: string;
    phone: string;
    dob: string;
    educationLevel: string;
    university: string;
    major: string;
    currentJob: string;
    docs: { resume: boolean; idCard: boolean; degree: boolean; englishCert: boolean };
    status: string;
    statusColor: string;
    aiMatch: number;
    notes: CandidateNote[];
};

export type RecruitmentFilters = {
    position: string[];
    department: string[];
    status: string[];
    time: string[];
};

// ──────────────────────────────────────────────
// Filter Tabs
// ──────────────────────────────────────────────

export const filterTabs = [
    { id: 'time', label: 'Thời gian', icon: Calendar },
    { id: 'position', label: 'Vị trí', icon: Briefcase },
    { id: 'department', label: 'Phòng ban', icon: Building },
    { id: 'status', label: 'Trạng thái', icon: Activity },
];

// ──────────────────────────────────────────────
// Filter Options Map
// ──────────────────────────────────────────────

export const filterOptionsMap: Record<string, FilterOption[]> = {
    position: [
        { value: 'frontend', label: 'Frontend Developer' },
        { value: 'backend', label: 'Backend Developer' },
        { value: 'uiux', label: 'UI/UX Designer' },
        { value: 'ba', label: 'Business Analyst' },
        { value: 'pm', label: 'Product Manager' }
    ],
    department: [
        { value: 'it', label: 'Công nghệ thông tin' },
        { value: 'design', label: 'Thiết kế' },
        { value: 'product', label: 'Sản phẩm' }
    ],
    status: [
        { value: 'new', label: 'Mới ứng tuyển', group: 'TIẾP NHẬN', iconStyle: 'icon', color: 'text-blue-500', icon: Inbox, isEditable: false },
        { value: 'screening', label: 'Đang sàng lọc CV', group: 'TIẾP NHẬN', iconStyle: 'icon', color: 'text-amber-500', icon: FileSearch, isEditable: true },
        { value: 'interview_wait', label: 'Chờ phỏng vấn', group: 'PHỎNG VẤN', iconStyle: 'icon', color: 'text-purple-500', icon: Clock, isEditable: true },
        { value: 'evaluating', label: 'Đang đánh giá', group: 'PHỎNG VẤN', iconStyle: 'icon', color: 'text-amber-500', icon: ClipboardList, isEditable: true },
        { value: 'offer_pending', label: 'Đang chốt Offer', group: 'OFFER', iconStyle: 'icon', color: 'text-purple-500', icon: Award, isEditable: true },
        { value: 'hired', label: 'Đã tuyển', group: 'KẾT QUẢ', iconStyle: 'icon', color: 'text-green-500', icon: UserCheck, isEditable: false },
        { value: 'rejected', label: 'Bị loại', group: 'KẾT QUẢ', iconStyle: 'icon', color: 'text-gray-400', icon: XCircle, isEditable: false }
    ]
};

// ──────────────────────────────────────────────
// Candidate Detail Tabs
// ──────────────────────────────────────────────

export const CANDIDATE_TABS = [
    { id: 'info', title: 'Thông tin chung', icon: FileText },
    { id: 'history', title: 'Lịch sử ứng tuyển', icon: Clock },
    { id: 'notes', title: 'Ghi chú', icon: MessageCircle },
];

// ──────────────────────────────────────────────
// Table Column Config
// ──────────────────────────────────────────────

export const TABLE_CONFIG_COLUMNS = [
    { uid: 'mshOnline', name: 'MSH Online' },
    { uid: 'status', name: 'Trạng thái' },
    { uid: 'fullName', name: 'Họ và tên' },
    { uid: 'position', name: 'Vị trí ứng tuyển' },
    { uid: 'date', name: 'Ngày nộp' },
    { uid: 'dob', name: 'Ngày sinh' },
    { uid: 'phone', name: 'Số điện thoại' },
    { uid: 'email', name: 'Email' },
    { uid: 'currentJob', name: 'Công việc hiện tại' },
    { uid: 'education', name: 'Học vấn' },
    { uid: 'docs', name: 'Hồ sơ đính kèm' },
    { uid: 'notes', name: 'Ghi chú' },
];

export const DEFAULT_VISIBLE_COLUMNS = new Set([
    'mshOnline', 'status', 'fullName', 'position', 'date', 'dob',
    'phone', 'email', 'currentJob', 'education', 'docs', 'notes'
]);

export const DEFAULT_COLUMN_ORDER = [
    'selection', 'mshOnline', 'status', 'fullName', 'position', 'date',
    'dob', 'phone', 'email', 'currentJob', 'education', 'docs', 'notes', 'actions'
];

export const INITIAL_FILTERS: RecruitmentFilters = {
    position: [],
    department: [],
    status: [],
    time: []
};

// ──────────────────────────────────────────────
// Mock Data Generator
// ──────────────────────────────────────────────

const generateMockCandidates = (count: number): Candidate[] => {
    const positions = ['Frontend Developer', 'Backend Developer', 'UI/UX Designer', 'Business Analyst', 'Product Manager'];
    const statuses = ['Mới ứng tuyển', 'Đang sàng lọc CV', 'Chờ phỏng vấn', 'Đang đánh giá', 'Đang chốt Offer', 'Đã tuyển', 'Bị loại'];

    return Array.from({ length: count }).map((_, i) => ({
        id: `${i + 1}`,
        mshOnline: Math.random().toString(36).substring(2, 7).toUpperCase(),
        date: `2${(i % 5) + 1}/04/2026`,
        email: `candidate${i + 1}@email.com`,
        fullName: `Ứng viên ${i + 1}`,
        avatar: `https://i.pravatar.cc/150?u=${(i % 50) + 10}`,
        position: positions[i % positions.length],
        phone: `0901234${(i % 999).toString().padStart(3, '0')}`,
        dob: `12/05/19${80 + (i % 20)}`,
        educationLevel: i % 3 === 0 ? 'Thạc sĩ' : 'Đại học',
        university: 'ĐH Công nghệ',
        major: i % 2 === 0 ? 'Công nghệ thông tin' : 'Thiết kế đồ họa',
        currentJob: 'Developer',
        docs: { resume: true, idCard: i % 2 === 0, degree: i % 3 === 0, englishCert: i % 4 === 0 },
        status: statuses[i % statuses.length],
        statusColor: i % 7 === 0 ? 'primary' : i % 7 === 1 ? 'warning' : i % 7 === 2 ? 'secondary' : i % 7 === 3 ? 'warning' : i % 7 === 4 ? 'secondary' : i % 7 === 5 ? 'success' : 'default',
        aiMatch: 50 + (i % 50),
        notes: i % 4 === 0
            ? [
                { author: 'Trần Trung Kiên', avatar: 'https://i.pravatar.cc/150?u=1', time: '13/03 14:45', content: 'Ứng viên có kinh nghiệm reactjs khá tốt.\nCần pv thêm về nextjs.' },
                { author: 'Trần Mai Lộc', avatar: 'https://i.pravatar.cc/150?u=2', time: '13/03 15:00', content: 'Thái độ tốt' },
                { author: 'Nguyễn Văn Thiện', avatar: 'https://i.pravatar.cc/150?u=3', time: '14/03 09:15', content: 'Mức lương deal hơi cao, xem xét lại budget.' }
            ]
            : i % 3 === 0
                ? [
                    { author: 'Trần Mai Lộc', avatar: 'https://i.pravatar.cc/150?u=2', time: '13/03 15:00', content: 'Nhắn gọi điện thoại mà không nghe máy.' },
                    { author: 'Nguyễn Văn Thiện', avatar: 'https://i.pravatar.cc/150?u=3', time: '14/03 09:15', content: 'Đã hẹn PV lúc 2h chiều nay.' }
                ]
                : []
    }));
};

export const allCandidates = generateMockCandidates(100);

// ──────────────────────────────────────────────
// Date Utility
// ──────────────────────────────────────────────

export const getQuickSelectDates = (quick: string): string[] => {
    const today = new Date();
    let start = new Date(today);
    let end = new Date(today);

    const formatDate = (d: Date) => {
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    if (quick === 'Hôm qua') {
        start.setDate(today.getDate() - 1);
        end.setDate(today.getDate() - 1);
    } else if (quick === 'Tuần này') {
        const day = today.getDay();
        const diff = today.getDate() - day + (day === 0 ? -6 : 1);
        start.setDate(diff);
    } else if (quick === 'Tháng này') {
        start.setDate(1);
        end.setMonth(today.getMonth() + 1, 0);
    } else if (quick === 'Năm nay') {
        start.setMonth(0, 1);
        end.setFullYear(today.getFullYear(), 11, 31);
    }
    return [formatDate(start), formatDate(end)];
};

// ──────────────────────────────────────────────
// Pre-computed status groups (avoid IIFE in render)
// ──────────────────────────────────────────────

export const statusGroups = [...new Set(filterOptionsMap.status.map(s => s.group))];

export const statusOptionsByGroup = statusGroups.map(group => ({
    group: group!,
    options: filterOptionsMap.status.filter(s => s.group === group)
}));
