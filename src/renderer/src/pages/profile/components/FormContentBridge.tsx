import React, { cloneElement, forwardRef, isValidElement, useCallback, useEffect, useImperativeHandle, useState } from 'react'

export interface FormContentBridgeHandle {
  getFormData: () => Record<string, any>
}

/**
 * Bridge that clones config.content with live formData state.
 * Solves the stale-props issue where openPanel() freezes formData in the JSX element.
 * Exposes latest formData via ref to avoid per-keystroke context updates.
 */
const FormContentBridge = forwardRef<
  FormContentBridgeHandle,
  {
    content: React.ReactNode
    initialFormData: Record<string, any>
  }
>(function FormContentBridge({ content, initialFormData }, ref) {
  const [localFormData, setLocalFormData] = useState<Record<string, any>>(initialFormData)

  // Sync when parent passes new initialFormData (e.g., user clicked edit on a different item)
  useEffect(() => {
    setLocalFormData(initialFormData)
  }, [initialFormData])

  // Expose latest formData to parent via ref — no context re-renders
  useImperativeHandle(ref, () => ({ getFormData: () => localFormData }), [localFormData])

  const handleSetFormData: React.Dispatch<React.SetStateAction<Record<string, any>>> = useCallback(
    (action) => {
      setLocalFormData((prev) => (typeof action === 'function' ? action(prev) : action))
    },
    []
  )

  // Clone the content element, overriding formData + setFormData props
  if (isValidElement(content) && content.props) {
    return (
      <div className="px-2">
        {cloneElement(content as React.ReactElement<any>, {
          formData: localFormData,
          setFormData: handleSetFormData
        })}
      </div>
    )
  }
  return <div className="px-2">{content}</div>
})

export default FormContentBridge
