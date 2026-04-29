import { useCallback, useMemo, useState } from 'react';
import {
    allCandidates,
    Candidate,
    DEFAULT_COLUMN_ORDER,
    DEFAULT_VISIBLE_COLUMNS,
    filterOptionsMap,
    filterTabs,
    INITIAL_FILTERS,
    RecruitmentFilters,
} from '../constants/recruitmentConstants';

export function useRecruitment() {
    // ── Selection ──
    const [selectedKeys, setSelectedKeys] = useState<any>(new Set([]));

    // ── UI toggles ──
    const [showStats, setShowStats] = useState(false);
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [isPopoverOpen, setIsPopoverOpen] = useState(false);
    const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
    const [isNotesDrawerOpen, setIsNotesDrawerOpen] = useState(false);
    const [isHistoryDrawerOpen, setIsHistoryDrawerOpen] = useState(false);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);

    // ── Candidate detail ──
    const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);

    // ── Pagination ──
    const [page, setPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(50);

    // ── Filters ──
    const [activeTabId, setActiveTabId] = useState('position');
    const [filters, setFilters] = useState<RecruitmentFilters>(INITIAL_FILTERS);

    // ── Column config ──
    const [visibleColumns, setVisibleColumns] = useState<Set<string>>(new Set(DEFAULT_VISIBLE_COLUMNS));
    const [columnOrder, setColumnOrder] = useState<string[]>([...DEFAULT_COLUMN_ORDER]);

    // ── Derived: active filter count ──
    const activeFilterCount = useMemo(
        () => Object.values(filters).reduce((acc, val) => acc + val.length, 0),
        [filters]
    );

    // ── Derived: tabs with filter state ──
    const tabsWithState = useMemo(() => {
        return filterTabs.map(tab => {
            const selectedValues = filters[tab.id as keyof RecruitmentFilters];
            const hasFilter = selectedValues.length > 0;
            let subtitle: string | undefined = undefined;

            if (hasFilter) {
                if (tab.id === 'time') {
                    if (selectedValues.length === 1 && !selectedValues[0].includes('-')) {
                        subtitle = selectedValues[0];
                    } else {
                        const from = selectedValues[0] && selectedValues[0].includes('-') ? new Date(selectedValues[0]).toLocaleDateString('vi-VN') : '';
                        const to = selectedValues[1] && selectedValues[1].includes('-') ? new Date(selectedValues[1]).toLocaleDateString('vi-VN') : '';
                        if (from && to) subtitle = `${from} - ${to}`;
                        else if (from) subtitle = `Từ ${from}`;
                        else if (to) subtitle = `Đến ${to}`;
                        else subtitle = 'Thời gian tùy chỉnh';
                    }
                } else {
                    const labels = selectedValues.map(val => {
                        const opt = filterOptionsMap[tab.id]?.find(o => o.value === val);
                        return opt ? opt.label : val;
                    });
                    subtitle = labels.join(', ');
                }
            }

            return { ...tab, hasFilter, subtitle };
        });
    }, [filters]);

    // ── Derived: filtered & paginated candidates ──
    // Note: actual filtering by `filters` can be implemented later
    const filteredCandidates = allCandidates;

    const totalPages = useMemo(
        () => Math.ceil(filteredCandidates.length / rowsPerPage),
        [filteredCandidates.length, rowsPerPage]
    );

    const paginatedCandidates = useMemo(() => {
        const start = (page - 1) * rowsPerPage;
        const end = start + rowsPerPage;
        return filteredCandidates.slice(start, end);
    }, [page, rowsPerPage, filteredCandidates]);

    // ── Derived: selection info ──
    const hasSelection = selectedKeys === 'all' || (selectedKeys instanceof Set && selectedKeys.size > 0);
    const selectedCount = selectedKeys === 'all' ? 'tất cả' : (selectedKeys as Set<React.Key>).size;

    // ── Handlers (stable with useCallback) ──
    const handleFilterChange = useCallback((tabId: string, values: string[]) => {
        setFilters(prev => ({ ...prev, [tabId]: values }));
    }, []);

    const removeFilter = useCallback((key: string, value: string) => {
        if (key === 'time') {
            setFilters(prev => ({ ...prev, [key]: [] }));
        } else {
            setFilters(prev => ({
                ...prev,
                [key]: prev[key as keyof RecruitmentFilters].filter(v => v !== value)
            }));
        }
    }, []);

    const clearAllFilters = useCallback(() => {
        setFilters(INITIAL_FILTERS);
    }, []);

    const toggleStats = useCallback(() => {
        setShowStats(prev => !prev);
    }, []);

    const openCandidateDrawer = useCallback((candidate: Candidate) => {
        setSelectedCandidate(candidate);
        setIsDrawerOpen(true);
    }, []);

    const closeCandidateDrawer = useCallback(() => {
        setIsDrawerOpen(false);
    }, []);

    const handleRowsPerPageChange = useCallback((value: number) => {
        setRowsPerPage(value);
        setPage(1);
    }, []);

    const clearSelection = useCallback(() => {
        setSelectedKeys(new Set());
    }, []);

    return {
        // State
        selectedKeys,
        setSelectedKeys,
        showStats,
        isFilterOpen,
        setIsFilterOpen,
        isPopoverOpen,
        setIsPopoverOpen,
        isStatusModalOpen,
        setIsStatusModalOpen,
        isNotesDrawerOpen,
        setIsNotesDrawerOpen,
        isHistoryDrawerOpen,
        setIsHistoryDrawerOpen,
        isDrawerOpen,
        selectedCandidate,
        page,
        setPage,
        rowsPerPage,
        activeTabId,
        setActiveTabId,
        filters,
        visibleColumns,
        setVisibleColumns,
        columnOrder,
        setColumnOrder,

        // Derived
        activeFilterCount,
        tabsWithState,
        filteredCandidates,
        totalPages,
        paginatedCandidates,
        hasSelection,
        selectedCount,

        // Handlers
        handleFilterChange,
        removeFilter,
        clearAllFilters,
        toggleStats,
        openCandidateDrawer,
        closeCandidateDrawer,
        handleRowsPerPageChange,
        clearSelection,
    };
}

export type UseRecruitmentReturn = ReturnType<typeof useRecruitment>;
