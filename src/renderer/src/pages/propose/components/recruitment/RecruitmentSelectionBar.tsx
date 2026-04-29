import React from 'react';
import {
    Button,
    Dropdown,
    DropdownItem,
    DropdownMenu,
    DropdownSection,
    DropdownTrigger,
} from '@heroui/react';
import { Activity, CheckCircle2, Eye, FileText, Pencil, X } from 'lucide-react';
import { allCandidates, Candidate, statusOptionsByGroup } from '../../constants/recruitmentConstants';

type RecruitmentSelectionBarProps = {
    selectedKeys: any;
    selectedCount: number | string;
    onClearSelection: () => void;
    onOpenStatusModal: () => void;
    onOpenCandidateDrawer: (candidate: Candidate) => void;
};

const RecruitmentSelectionBar = React.memo(({
    selectedKeys,
    selectedCount,
    onClearSelection,
    onOpenStatusModal,
    onOpenCandidateDrawer,
}: RecruitmentSelectionBarProps) => (
    <div className="w-full">
        <div className="animate-in fade-in slide-in-from-top-1 duration-200">
            <div className="flex items-center justify-between h-11 px-4 bg-[#f2f6ff] w-full border-y border-blue-100/50">
                <div className="flex items-center gap-1">
                    <div className="flex items-center gap-2 pl-2 pr-1">
                        <div className="min-w-[20px] h-5 px-1 rounded-full bg-[#1b64f2] text-white flex items-center justify-center text-[11px] font-bold">
                            {selectedCount}
                        </div>
                        <span className="text-sm font-semibold text-[#1b64f2] whitespace-nowrap">Đã chọn {selectedCount} mục</span>
                    </div>
                    <div className="w-px h-5 bg-[#d1e0ff] mx-3" />
                    <div className="flex items-center gap-1">
                        <Dropdown>
                            <DropdownTrigger>
                                <Button variant="light" startContent={<CheckCircle2 size={16} className="text-[#1b64f2]" />} className="h-8 px-3 bg-transparent hover:bg-blue-100/50 text-[#1b64f2] font-medium text-sm rounded-md min-w-max">
                                    Trạng thái
                                </Button>
                            </DropdownTrigger>
                            <DropdownMenu
                                aria-label="Chọn trạng thái"
                                className="w-[220px]"
                                classNames={{ base: "p-1" }}
                                topContent={
                                    <div className="flex items-center justify-between px-2 py-1.5 mb-1">
                                        <span className="text-sm font-bold text-gray-800">Chọn trạng thái</span>
                                        <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); onOpenStatusModal(); }} className="text-blue-500 hover:text-blue-600 outline-none border-none bg-transparent">
                                            <Pencil size={14} />
                                        </button>
                                    </div>
                                }
                            >
                                {statusOptionsByGroup.map(({ group, options }) => (
                                    <DropdownSection key={group} title={group} classNames={{ heading: "text-[10px] font-bold text-gray-400 tracking-wider px-2" }}>
                                        {options.map(s => {
                                            const SIcon = s.icon || Activity;
                                            return (
                                                <DropdownItem
                                                    key={s.value}
                                                    className="rounded-lg"
                                                    startContent={<SIcon size={14} className={s.color || 'text-gray-400'} strokeWidth={2.5} />}
                                                >
                                                    <span className="text-xs font-medium text-gray-700">{s.label}</span>
                                                </DropdownItem>
                                            );
                                        })}
                                    </DropdownSection>
                                ))}
                            </DropdownMenu>
                        </Dropdown>
                        {(selectedCount === 1 || selectedCount === 'tất cả') && (
                            <>
                                <Button
                                    variant="light"
                                    startContent={<Eye size={16} className="text-[#1b64f2]" />}
                                    className="h-8 px-3 bg-transparent hover:bg-blue-100/50 text-[#1b64f2] font-medium text-sm rounded-md min-w-max"
                                    onPress={() => {
                                        const selectedIds = Array.from(selectedKeys);
                                        if (selectedIds.length > 0) {
                                            const candidate = allCandidates.find(c => c.id === selectedIds[0] || (selectedIds[0] === 'all' && true));
                                            if (candidate) {
                                                onOpenCandidateDrawer(candidate);
                                            }
                                        }
                                    }}
                                >
                                    Xem chi tiết
                                </Button>
                                <Button variant="light" startContent={<FileText size={16} className="text-[#1b64f2]" />} className="h-8 px-3 bg-transparent hover:bg-blue-100/50 text-[#1b64f2] font-medium text-sm rounded-md min-w-max">Sửa hồ sơ</Button>
                            </>
                        )}
                    </div>
                </div>
                <Button isIconOnly variant="light" radius="full" size="sm" onPress={onClearSelection} className="text-[#1b64f2] hover:bg-blue-100/50 mr-1 w-8 h-8 min-w-8">
                    <X size={18} />
                </Button>
            </div>
        </div>
    </div>
));

RecruitmentSelectionBar.displayName = 'RecruitmentSelectionBar';

export default RecruitmentSelectionBar;
