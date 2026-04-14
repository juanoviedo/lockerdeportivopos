export function SkeletonPulse() {
  return (
    <div className="animate-pulse">
      <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
      <div className="h-4 bg-gray-300 rounded w-1/2"></div>
    </div>
  )
}

export function SkeletonCard() {
  return (
    <div className="bg-white p-4 rounded-lg border border-gray-200 animate-pulse">
      <div className="h-6 bg-gray-300 rounded w-1/2 mb-4"></div>
      <div className="space-y-3">
        <div className="h-4 bg-gray-200 rounded"></div>
        <div className="h-4 bg-gray-200 rounded w-5/6"></div>
        <div className="h-4 bg-gray-200 rounded w-4/6"></div>
      </div>
    </div>
  )
}

export function SkeletonTable() {
  return (
    <div className="animate-pulse">
      <div className="bg-gray-200 h-10 rounded mb-3"></div>
      {[...Array(5)].map((_, i) => (
        <div key={i} className="flex gap-2 mb-2">
          <div className="flex-1 h-8 bg-gray-200 rounded"></div>
          <div className="flex-1 h-8 bg-gray-200 rounded"></div>
          <div className="flex-1 h-8 bg-gray-200 rounded"></div>
        </div>
      ))}
    </div>
  )
}

export function SkeletonDashboardMetrics() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6 animate-pulse">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="h-4 bg-gray-300 rounded w-1/2 mb-2"></div>
          <div className="h-8 bg-gray-300 rounded w-2/3"></div>
        </div>
      ))}
    </div>
  )
}
