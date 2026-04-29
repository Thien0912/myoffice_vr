import { useWatch, Control } from 'react-hook-form'
import { useMemo } from 'react'

interface TotalDaysDisplayProps {
  control: Control<any>
  className?: string
  labelClassName?: string
  valueClassName?: string
  showLabel?: boolean
}

export const TotalDaysDisplay = ({ 
  control, 
  className = '', 
  labelClassName = '', 
  valueClassName = '',
  showLabel = true 
}: TotalDaysDisplayProps) => {
  const watchedDays = useWatch({
    control,
    name: 'days'
  })

  const total = useMemo(() => {
    if (!watchedDays) return 0
    return watchedDays.reduce((acc: number, day: any) => {
      let count = 0
      if (day.sang) count += 0.5
      if (day.chieu) count += 0.5
      return acc + count
    }, 0)
  }, [watchedDays])

  return (
    <div className={className}>
      {showLabel && (
        <span className={labelClassName}>
          Tổng cộng:
        </span>
      )}
      <span className={valueClassName}>
        {total} ngày
      </span>
    </div>
  )
}
