import { Button, type ButtonProps, cn } from '@heroui/react'

/**
 * HrPrimaryButton - A reusable primary action button with MD3 aesthetic.
 * Extends standard HeroUI ButtonProps to allow full customization.
 */
export function HrPrimaryButton({ children, className, ...props }: ButtonProps) {
  return (
    <Button
      className={cn(
        'h-11 px-6 bg-[#C2E7FF] hover:bg-[#b5dffa] active:bg-[#99c8e8] text-[#001D35] font-semibold rounded-2xl transition-all duration-250 shadow-sm hover:shadow-md border-none',
        className
      )}
      {...props}
    >
      {children}
    </Button>
  )
}
