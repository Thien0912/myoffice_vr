import { Button, type ButtonProps, cn } from '@heroui/react'

export function HrCancelButton({ children, className, ...props }: ButtonProps) {
  return (
    <Button
      className={cn(
        'h-11 px-6 bg-gray-100 hover:bg-gray-200 active:bg-gray-300 text-gray-700 font-semibold rounded-2xl transition-all duration-250 border-none',
        className
      )}
      {...props}
    >
      {children || 'Hủy'}
    </Button>
  )
}
