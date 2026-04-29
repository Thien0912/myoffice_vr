import { Input } from '@heroui-v3/react'
import { Search } from 'lucide-react'
import React from 'react'

export default function InputSearchDocument({ ...props }): React.JSX.Element {
  return (
    <div className="relative flex items-center w-full">
      <Search strokeWidth={1.5} className="absolute left-3 size-5 text-gray-400 pointer-events-none" />
      <Input
        {...props}
        className={`w-full text-gray-700 bg-white border border-gray-300 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary pl-10 h-10 ${props.className || ''}`}
        type="search"
      />
    </div>
  )
}
