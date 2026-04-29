import { SearchField } from '@heroui-v3/react'

export interface SearchInputProps {
    value?: string
    onChange?: (value: string) => void
    placeholder?: string
    className?: string
    size?: 'sm' | 'md' | 'lg'
}

const sizeClass = {
    sm: 'h-8',
    md: 'h-10',
    lg: 'h-12'
}

export default function SearchInput({
    value,
    onChange,
    placeholder = 'Tìm kiếm...',
    className = 'w-full max-w-md',
    size = 'md'
}: SearchInputProps) {
    return (
        <SearchField
            aria-label={placeholder}
            value={value}
            onChange={onChange}
            className={className}
        >
            <SearchField.Group className={sizeClass[size]}>
                <SearchField.SearchIcon />
                <SearchField.Input placeholder={placeholder} />
                <SearchField.ClearButton />
            </SearchField.Group>
        </SearchField>
    )
}
