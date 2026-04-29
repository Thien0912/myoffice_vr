import { cn } from '@heroui-v3/react'

interface MiddleTruncateProps {
  text: string
  className?: string
}

export default function MiddleTruncate({ text, className = '' }: MiddleTruncateProps) {
  const dotIndex = text.lastIndexOf('.')

  // Nếu có phần mở rộng (đuôi file)
  if (dotIndex !== -1 && dotIndex > 0) {
    const name = text.slice(0, dotIndex)
    const ext = text.slice(dotIndex)

    return (
      <span className={cn('flex min-w-0 max-w-full items-center', className)} title={text}>
        <span className="truncate inline-block">{name}</span>
        <span className="shrink-0">{ext}</span>
      </span>
    )
  }

  // Fallback cho file không có đuôi hoặc trường hợp khác
  return (
    <span className={cn('truncate inline-block max-w-full', className)} title={text}>
      {text}
    </span>
  )
}
