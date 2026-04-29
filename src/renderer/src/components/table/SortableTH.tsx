import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import React from 'react'

interface SortableTHProps {
  id: string
  disabled?: boolean
  style?: React.CSSProperties
  className?: string
  children: (props: {
    attributes: any
    listeners: any
    isDragging: boolean
  }) => React.ReactNode
  'data-col-uid'?: string
  'data-last-left'?: boolean
  'data-first-right'?: boolean
}

export function SortableTH({ id, disabled, style, className, children, ...props }: SortableTHProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id,
    disabled
  })

  const combinedStyle: React.CSSProperties = {
    ...style,
    transform: CSS.Translate.toString(transform),
    transition,
    ...(isDragging ? { opacity: 0.3, zIndex: 100 } : {})
  }

  return (
    <th ref={setNodeRef} style={combinedStyle} className={className} {...props}>
      {children({ attributes, listeners, isDragging })}
    </th>
  )
}
