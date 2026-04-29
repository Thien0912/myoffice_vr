import React from 'react';
import {
    cn,
    Dropdown,
    DropdownItem,
    DropdownMenu,
    DropdownSection,
    DropdownTrigger,
} from '@heroui/react';
import { Activity, CheckCircle2, ChevronDown, Pencil } from 'lucide-react';
import { Candidate, filterOptionsMap, statusOptionsByGroup } from '../../constants/recruitmentConstants';

type StatusDropdownCellProps = {
    row: Candidate;
    onStatusChange: (row: Candidate, newStatus: string) => void;
    onEditStatuses: () => void;
};

const StatusDropdownCell = React.memo(({ row, onStatusChange, onEditStatuses }: StatusDropdownCellProps) => {
    const option = filterOptionsMap.status.find(opt => opt.label === row.status);
    const Icon = option?.icon || Activity;

    return (
        <Dropdown>
            <DropdownTrigger>
                <button className="flex items-center gap-1.5 cursor-pointer hover:bg-gray-50 rounded-md px-1.5 py-1 -mx-1.5 -my-1 transition-colors group outline-none border-none bg-transparent text-left">
                    <Icon size={14} className={option?.color || 'text-gray-500'} strokeWidth={2.5} />
                    <span className="text-xs font-medium text-gray-900">{row.status}</span>
                    <ChevronDown size={12} className="text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
            </DropdownTrigger>
            <DropdownMenu
                aria-label="Chọn trạng thái"
                className="w-[220px]"
                classNames={{ base: "p-1" }}
                topContent={
                    <div className="flex items-center justify-between px-2 py-1.5 mb-1">
                        <span className="text-sm font-bold text-gray-800">Chọn trạng thái</span>
                        <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); onEditStatuses(); }} className="text-blue-500 hover:text-blue-600 outline-none border-none bg-transparent">
                            <Pencil size={14} />
                        </button>
                    </div>
                }
                onAction={(key) => {
                    const selected = filterOptionsMap.status.find(s => s.value === key);
                    if (selected) {
                        onStatusChange(row, selected.label);
                    }
                }}
            >
                {statusOptionsByGroup.map(({ group, options }) => (
                    <DropdownSection key={group} title={group} classNames={{ heading: "text-[10px] font-bold text-gray-400 tracking-wider px-2" }}>
                        {options.map(s => {
                            const SIcon = s.icon || Activity;
                            const isActive = s.label === row.status;
                            return (
                                <DropdownItem
                                    key={s.value}
                                    className={cn("rounded-lg", isActive && "bg-blue-50")}
                                    startContent={<SIcon size={14} className={s.color || 'text-gray-400'} strokeWidth={2.5} />}
                                    endContent={isActive ? <CheckCircle2 size={14} className="text-blue-500" /> : null}
                                >
                                    <span className={cn("text-xs font-medium", isActive ? "text-blue-600" : "text-gray-700")}>{s.label}</span>
                                </DropdownItem>
                            );
                        })}
                    </DropdownSection>
                ))}
            </DropdownMenu>
        </Dropdown>
    );
});

StatusDropdownCell.displayName = 'StatusDropdownCell';

export default StatusDropdownCell;
