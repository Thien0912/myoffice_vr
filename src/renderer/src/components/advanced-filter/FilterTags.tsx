import React from 'react';
import { Chip, Popover, PopoverTrigger, PopoverContent } from '@heroui/react';

interface FilterTagsProps {
    filters: Record<string, string[]>;
    optionsMap: Record<string, { value: string; label: string }[]>;
    tabs?: { id: string; label: string }[];
    onRemoveFilter: (key: string, value: string) => void;
    onClearAll: () => void;
}

export const FilterTags: React.FC<FilterTagsProps> = ({ filters, optionsMap, tabs, onRemoveFilter, onClearAll }) => {
    const activeFilters = Object.entries(filters).flatMap(([key, values]) => {
        if (!values || values.length === 0) return [];
        const tab = tabs?.find(t => t.id === key);
        
        if (key === 'time') {
            let label = '';
            if (values.length === 1 && !values[0].includes('-')) {
                label = values[0];
            } else {
                const from = values[0] && values[0].includes('-') ? new Date(values[0]).toLocaleDateString('vi-VN') : '';
                const to = values[1] && values[1].includes('-') ? new Date(values[1]).toLocaleDateString('vi-VN') : '';
                if (from && to) label = `${from} - ${to}`;
                else if (from) label = `Từ ${from}`;
                else if (to) label = `Đến ${to}`;
                else label = 'Thời gian tùy chỉnh';
            }
            return [{
                key,
                value: 'time_range',
                label,
                tabLabel: tab ? tab.label : ''
            }];
        }

        return values.map(value => {
            const option = optionsMap[key]?.find(opt => opt.value === value);
            return {
                key,
                value,
                label: option ? option.label : value,
                tabLabel: tab ? tab.label : ''
            };
        });
    });

    if (activeFilters.length === 0) return null;

    const visibleFilters = activeFilters.slice(0, 5);
    const hiddenFilters = activeFilters.slice(5);

    return (
        <div className="flex flex-wrap items-center gap-2 mb-4">
            <span className="text-xs font-medium text-gray-500 mr-1">Đang lọc:</span>
            {visibleFilters.map((filter) => (
                <Chip
                    key={`${filter.key}-${filter.value}`}
                    onClose={() => onRemoveFilter(filter.key, filter.value)}
                    variant="flat"
                    size="sm"
                    className="bg-gray-100 text-gray-700 border border-gray-200"
                    classNames={{ closeButton: "text-gray-400 hover:text-gray-600" }}
                >
                    {filter.tabLabel && <span className="font-semibold mr-1">{filter.tabLabel}:</span>}
                    {filter.label}
                </Chip>
            ))}

            {hiddenFilters.length > 0 && (
                <Popover placement="bottom">
                    <PopoverTrigger>
                        <button className="text-[11px] font-medium text-gray-700 bg-gray-100 border border-gray-200 px-2 py-0.5 rounded-full hover:bg-gray-200 transition-colors cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-gray-500">
                            +{hiddenFilters.length}
                        </button>
                    </PopoverTrigger>
                    <PopoverContent className="p-3 border border-gray-200 shadow-lg rounded-lg bg-white max-w-[400px]">
                        <div className="flex flex-wrap gap-2 outline-none">
                            {hiddenFilters.map((filter) => (
                                <Chip
                                    key={`${filter.key}-${filter.value}`}
                                    onClose={() => onRemoveFilter(filter.key, filter.value)}
                                    variant="flat"
                                    size="sm"
                                    className="bg-gray-100 text-gray-700 border border-gray-200"
                                    classNames={{ closeButton: "text-gray-400 hover:text-gray-600" }}
                                >
                                    {filter.tabLabel && <span className="font-semibold mr-1">{filter.tabLabel}:</span>}
                                    {filter.label}
                                </Chip>
                            ))}
                        </div>
                    </PopoverContent>
                </Popover>
            )}

            <button
                onClick={onClearAll}
                className="text-[11px] font-medium text-gray-500 hover:text-red-500 transition-colors ml-2 underline underline-offset-2 cursor-pointer"
            >
                Xóa tất cả
            </button>
        </div>
    );
};
