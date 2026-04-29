import { Button, Tooltip } from '@heroui-v3/react'
import { useBreadcrumbMap } from '@renderer/store/useBreadcrumbMap'
import { CircleQuestionMark } from 'lucide-react'
import { useLocation } from 'react-router-dom'
import YearFilter from '@renderer/pages/document/components/table/Filters/YearFilter'

export default function PageTitle() {
  const breadcrumb = useBreadcrumbMap()
  const { pathname } = useLocation()

  const currentBreadcrumb = breadcrumb[breadcrumb.length - 1]
  const label = currentBreadcrumb?.label
  const descriptionLabel = currentBreadcrumb?.description

  if (
    pathname === '/verify-otp' ||
    pathname.endsWith('/verify-otp') ||
    pathname.includes('/hrm/ngoai-gio') ||
    pathname.includes('/hrm/nghi-phep') ||
    pathname.includes('/thong-bao')
  ) {
    return null
  }

  return (
    <div className="flex items-center gap-2 py-4 px-6">
      <h1 className="text-lg xl:text-xl font-medium text-gray-900 dark:text-gray-100 transition-colors">
        {label}
      </h1>
      {pathname.includes('vanban') && <YearFilter />}
      {descriptionLabel && (
        <Tooltip delay={0}>
          <Button isIconOnly variant="ghost" size="sm">
            <CircleQuestionMark />
          </Button>
          <Tooltip.Content>
            <p>{descriptionLabel}</p>
          </Tooltip.Content>
        </Tooltip>
      )}
    </div>
  )
}
