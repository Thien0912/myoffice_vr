import React, { useCallback, useMemo } from 'react';
import {
    Checkbox,
    cn,
    Tooltip,
} from '@heroui/react';
import {
    Calendar,
    CreditCard,
    ExternalLink,
    FileText,
    GraduationCap,
    Languages,
} from 'lucide-react';
import TableHr from '../../../../components/table/TableHr';
import { TableColumnType } from '../../../../components/table/TableTypes';
import { Candidate } from '../../constants/recruitmentConstants';
import StatusDropdownCell from './StatusDropdownCell';
import NotesPopoverCell from './NotesPopoverCell';

type RecruitmentTableProps = {
    paginatedCandidates: Candidate[];
    selectedKeys: any;
    onSelectionChange: (keys: any) => void;
    visibleColumns: Set<string>;
    columnOrder: string[];
    onColumnOrderChange?: (order: string[]) => void;
    tableContainerRef: React.RefObject<HTMLDivElement | null>;
    tableHeight: number | undefined;
    onOpenCandidateDrawer: (candidate: Candidate) => void;
    onOpenStatusModal: () => void;
};

const RecruitmentTable = React.memo(({
    paginatedCandidates,
    selectedKeys,
    onSelectionChange,
    visibleColumns,
    columnOrder,
    onColumnOrderChange,
    tableContainerRef,
    tableHeight,
    onOpenCandidateDrawer,
    onOpenStatusModal,
}: RecruitmentTableProps) => {
    // Stable handler for status changes
    const handleStatusChange = useCallback((row: Candidate, newStatus: string) => {
        row.status = newStatus;
        // Force re-render by creating a new Set from current selection
        onSelectionChange((prev: any) => new Set(prev));
    }, [onSelectionChange]);

    // ── Column definitions (memoized) ──
    const columns: TableColumnType<any>[] = useMemo(() => [
        {
            uid: 'selection',
            name: '',
            width: 40,
            render: (_: any, row: Candidate) => {
                const rowIdStr = String(row.id);
                const isSelected = selectedKeys === 'all' || (selectedKeys instanceof Set && selectedKeys.has(rowIdStr));
                return (
                    <div className="flex items-center justify-center w-full h-full" onClick={(e) => e.stopPropagation()}>
                        <Checkbox
                            size="sm"
                            className="m-0 p-0"
                            classNames={{ wrapper: "m-0 before:border-gray-300" }}
                            isSelected={isSelected}
                            onValueChange={(checked) => {
                                const newSet = new Set(selectedKeys instanceof Set ? selectedKeys : []);
                                if (checked) {
                                    newSet.add(rowIdStr);
                                } else {
                                    newSet.delete(rowIdStr);
                                }
                                onSelectionChange(newSet);
                            }}
                        />
                    </div>
                );
            }
        },
        {
            uid: 'mshOnline',
            name: 'MSH Online',
            width: 100,
            render: (_: any, row: Candidate) => (
                <div className="flex items-center justify-between w-full pr-2">
                    <span
                        className="text-xs font-semibold text-gray-700 group-hover/cell:text-blue-600 transition-colors cursor-pointer"
                        onClick={() => onOpenCandidateDrawer(row)}
                    >
                        {row.mshOnline}
                    </span>
                    <button
                        className="opacity-0 group-hover/cell:opacity-100 p-1 hover:bg-blue-50 rounded-md transition-all cursor-pointer text-gray-400 hover:text-blue-600"
                        onClick={() => onOpenCandidateDrawer(row)}
                    >
                        <ExternalLink size={13} strokeWidth={2.5} />
                    </button>
                </div>
            )
        },
        {
            uid: 'status',
            name: 'Trạng thái',
            width: 180,
            render: (_: any, row: Candidate) => (
                <StatusDropdownCell
                    row={row}
                    onStatusChange={handleStatusChange}
                    onEditStatuses={onOpenStatusModal}
                />
            )
        },
        {
            uid: 'fullName',
            name: 'Họ và tên',
            width: 160,
            render: (_: any, row: Candidate) => <span className="text-sm font-semibold text-gray-900">{row.fullName}</span>
        },
        {
            uid: 'position',
            name: 'Vị trí ứng tuyển',
            width: 150,
            render: (_: any, row: Candidate) => <span className="text-xs font-medium text-gray-800">{row.position}</span>
        },
        {
            uid: 'date',
            name: 'Ngày nộp',
            width: 120,
            render: (_: any, row: Candidate) => (
                <div className="flex items-center gap-2">
                    <Calendar className="text-gray-400" size={14} />
                    <span className="text-xs font-medium text-gray-800">{row.date}</span>
                </div>
            )
        },
        {
            uid: 'dob',
            name: 'Ngày sinh',
            width: 100,
            render: (_: any, row: Candidate) => <span className="text-xs text-gray-600">{row.dob}</span>
        },
        {
            uid: 'phone',
            name: 'Số điện thoại',
            width: 120,
            render: (_: any, row: Candidate) => <span className="text-xs text-gray-600">{row.phone}</span>
        },
        {
            uid: 'email',
            name: 'Email',
            width: 200,
            render: (_: any, row: Candidate) => <span className="text-xs text-gray-600">{row.email}</span>
        },
        {
            uid: 'currentJob',
            name: 'Công việc hiện tại',
            width: 160,
            render: (_: any, row: Candidate) => <span className="text-xs text-gray-800">{row.currentJob}</span>
        },
        {
            uid: 'education',
            name: 'Học vấn',
            width: 240,
            render: (_: any, row: Candidate) => (
                <div className="flex flex-col justify-center">
                    <span className="text-xs font-medium text-gray-900">{row.major}</span>
                    <span className="text-[11px] text-gray-500 mt-0.5">{row.educationLevel} - {row.university}</span>
                </div>
            )
        },
        {
            uid: 'docs',
            name: 'Hồ sơ đính kèm',
            width: 150,
            render: (_: any, row: Candidate) => (
                <div className="flex items-center gap-1.5 justify-center w-full">
                    <Tooltip content="Hồ sơ CV" classNames={{ content: "text-[10px] font-medium" }} placement="top">
                        <div className={cn("p-1.5 rounded-md border cursor-help transition-colors", row.docs.resume ? "border-amber-200 bg-amber-50 text-amber-600" : "border-gray-100 bg-gray-50 text-gray-300")}>
                            <FileText size={12} />
                        </div>
                    </Tooltip>
                    <Tooltip content="CCCD" classNames={{ content: "text-[10px] font-medium" }} placement="top">
                        <div className={cn("p-1.5 rounded-md border cursor-help transition-colors", row.docs.idCard ? "border-amber-200 bg-amber-50 text-amber-600" : "border-gray-100 bg-gray-50 text-gray-300")}>
                            <CreditCard size={12} />
                        </div>
                    </Tooltip>
                    <Tooltip content="Bằng cấp" classNames={{ content: "text-[10px] font-medium" }} placement="top">
                        <div className={cn("p-1.5 rounded-md border cursor-help transition-colors", row.docs.degree ? "border-amber-200 bg-amber-50 text-amber-600" : "border-gray-100 bg-gray-50 text-gray-300")}>
                            <GraduationCap size={12} />
                        </div>
                    </Tooltip>
                    <Tooltip content="Chứng chỉ Tiếng Anh" classNames={{ content: "text-[10px] font-medium" }} placement="top">
                        <div className={cn("p-1.5 rounded-md border cursor-help transition-colors", row.docs.englishCert ? "border-amber-200 bg-amber-50 text-amber-600" : "border-gray-100 bg-gray-50 text-gray-300")}>
                            <Languages size={12} />
                        </div>
                    </Tooltip>
                </div>
            )
        },
        {
            uid: 'notes',
            name: 'Ghi chú',
            width: 200,
            render: (_: any, row: Candidate) => <NotesPopoverCell row={row} />
        },
    ], [selectedKeys, onSelectionChange, onOpenCandidateDrawer, handleStatusChange, onOpenStatusModal]);

    // ── Filter columns by visibility ──
    const filteredColumns = useMemo(() => {
        if (visibleColumns.size === 0) return columns;
        return columns.filter(c => c.uid === 'selection' || c.uid === 'actions' || visibleColumns.has(c.uid));
    }, [columns, visibleColumns]);

    // ── Ensure ordered array for TableHr ──
    const tableColumnOrder = useMemo(() => {
        if (!columnOrder || columnOrder.length === 0) return columns.map(c => c.uid);
        const ordered = ['selection'];
        for (const uid of columnOrder) {
            if (uid !== 'selection' && uid !== 'actions') ordered.push(uid);
        }
        for (const col of columns) {
            if (col.uid !== 'selection' && col.uid !== 'actions' && !ordered.includes(col.uid)) {
                ordered.push(col.uid);
            }
        }
        // Force actions to the end if it exists
        if (columns.some(c => c.uid === 'actions')) {
            ordered.push('actions');
        }
        return ordered;
    }, [columnOrder, columns]);

    const handleColumnOrderChange = useCallback((newOrder: string[]) => {
        onColumnOrderChange?.(newOrder.filter(uid => uid !== 'selection' && uid !== 'actions'));
    }, [onColumnOrderChange]);

    return (
        <div
            ref={tableContainerRef}
            className="bg-white overflow-hidden shadow-sm border-t border-gray-100"
            style={tableHeight ? { height: tableHeight } : undefined}
        >
            <TableHr
                columns={filteredColumns}
                data={paginatedCandidates}
                primaryKey="id"
                selectedKeys={selectedKeys}
                onSelectionChange={onSelectionChange}
                selectionMode="multiple"
                enableResizing={true}
                enableSorting={false}
                enablePinning={true}
                enableColumnReorder={true}
                columnOrder={tableColumnOrder}
                onColumnOrderChange={handleColumnOrderChange}
                className="h-full overflow-y-auto custom-scrollbar"
            />
        </div>
    );
});

RecruitmentTable.displayName = 'RecruitmentTable';

export default RecruitmentTable;
