export type FloatingLabelSize = 'sm' | 'md' | 'lg'
export type FloatingLabelRadius = 'none' | 'sm' | 'md' | 'lg' | 'xl' | 'full'

export const radiusStyles: Record<FloatingLabelRadius, string> = {
  none: 'rounded-none',
  sm: 'rounded-sm',
  md: 'rounded-md',
  lg: 'rounded-lg',
  xl: 'rounded-xl',
  full: 'rounded-full'
}

export const sizeStyles = {
  sm: {
    input: 'h-8 text-xs',
    inputMin: 'min-h-8 text-xs',
    textarea: 'text-xs p-2',
    label: 'text-xs',
    labelFloating: 'text-[10px]',
    // Date specific
    dateLabel: 'text-xs',
    dateLabelFloating: 'text-[10px]',
    dateWrapper: 'h-8 min-h-8'
  },
  md: {
    input: 'h-[42px] text-sm',
    inputMin: 'min-h-[42px] text-sm',
    textarea: 'text-sm p-3',
    label: 'text-sm',
    labelFloating: 'text-[13px]',
    // Date specific
    dateLabel: 'text-sm',
    dateLabelFloating: 'text-[13px]',
    dateWrapper: 'h-[42px] min-h-[42px]'
  },
  lg: {
    input: 'h-12 text-base',
    inputMin: 'min-h-12 text-base',
    textarea: 'text-base p-4',
    label: 'text-base',
    labelFloating: 'text-sm',
    // Date specific
    dateLabel: 'text-base',
    dateLabelFloating: 'text-sm',
    dateWrapper: 'h-12 min-h-12'
  }
}

export const commonInputClasses =
  'border border-gray-200 dark:border-gray-700 hover:border-blue-400 dark:hover:border-blue-500 focus:!border-blue-600 dark:focus:!border-blue-500 focus-within:!border-blue-600 dark:focus-within:!border-blue-500 outline-none shadow-none transition-colors'
