// Skeleton loading state shown while fetching detail before opening edit form
export default function FormSkeletonLoader({ rows = 4 }: { rows?: number }) {
  return (
    <div className="flex flex-col gap-0 animate-pulse w-full h-full">
      {/* Section card skeleton */}
      {Array.from({ length: rows }).map((_, secIdx) => (
        <div key={secIdx} className="bg-white border-b border-gray-100 px-4 py-4">
          {/* Section header */}
          <div className="flex items-center gap-2 mb-3">
            <div className="h-5 w-5 rounded bg-blue-100" />
            <div className="h-4 bg-gray-200 rounded w-32" />
          </div>
          {/* Field grid */}
          <div className="grid grid-cols-2 gap-3">
            {Array.from({ length: secIdx === 0 ? 6 : 4 }).map((_, i) => (
              <div key={i} className={`flex flex-col gap-1.5 ${i === 0 && secIdx === 0 ? 'col-span-2' : ''}`}>
                <div className="h-3 bg-gray-200 rounded w-1/3" />
                <div className="h-9 bg-gray-100 rounded-lg w-full border border-gray-200" />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
