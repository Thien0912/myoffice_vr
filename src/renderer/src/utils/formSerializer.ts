/**
 * Validates whether a given object is a File or Blob.
 * Uses duck-typing to avoid `instanceof File` or `instanceof Blob` issues across iframe/Electron contexts.
 */
export const isFileOrBlob = (value: any): value is File | Blob => {
  return (
    (typeof Blob !== 'undefined' && value instanceof Blob) ||
    (value &&
      typeof value === 'object' &&
      typeof value.name === 'string' &&
      typeof value.arrayBuffer === 'function')
  )
}

/**
 * Serializes plain object data and file arrays into a FormData object.
 * Arrays and objects (excluding files) are stringified to JSON.
 * @param formData - The flat or nested key-value record to submit.
 * @param fileGroups - A dictionary of arrays of files mapped by fieldName.
 */
export const serializeToFormData = (
  formData: Record<string, any>,
  fileGroups: Record<string, File[]> = {}
): FormData => {
  const fd = new FormData()

  // 1. Serialize standard fields
  Object.entries(formData).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      if (isFileOrBlob(value)) {
        fd.append(key, value) // Append as binary — JSON.stringify(File) === '{}'
      } else if (Array.isArray(value) || typeof value === 'object') {
        fd.append(key, JSON.stringify(value))
      } else {
        fd.append(key, String(value))
      }
    }
  })

  // 2. Append extra file groups
  Object.entries(fileGroups).forEach(([fieldName, files]) => {
    files.forEach((f) => fd.append(fieldName, f))
  })

  return fd
}
