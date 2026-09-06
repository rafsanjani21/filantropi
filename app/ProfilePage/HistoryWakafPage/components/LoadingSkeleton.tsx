export default function LoadingSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm animate-pulse flex flex-col gap-3">
          <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          <div className="h-3 bg-gray-100 rounded w-1/2"></div>
          <div className="h-8 bg-gray-100 rounded-lg w-full mt-2"></div>
        </div>
      ))}
    </div>
  );
}