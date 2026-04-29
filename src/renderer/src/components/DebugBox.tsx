import React from 'react'

declare global {
  interface Window {
    debug_data?: any
  }
}

type DebugBoxProps = {}

export default function DebugBox({}: DebugBoxProps) {
  return <div className="fixed top-0 left-0">{JSON.stringify(window.debug_data, null, 2)}</div>
}
