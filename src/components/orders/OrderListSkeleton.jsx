export default function OrderListSkeleton({ count = 4 }) {
  return (
    <div className="divide-y animate-pulse">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="py-2 flex justify-between items-center text-sm"
        >
          <div className="space-y-1.5">
            <div className="h-3.5 w-16 bg-gray-200 rounded" />
            <div className="h-3 w-20 bg-gray-100 rounded" />
          </div>
          <div className="space-y-1.5 text-right">
            <div className="h-3.5 w-14 bg-gray-200 rounded ml-auto" />
            <div className="h-3 w-12 bg-gray-100 rounded ml-auto" />
          </div>
        </div>
      ))}
    </div>
  );
}