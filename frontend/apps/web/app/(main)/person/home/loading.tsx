export default function Loading() {
  return (
    <div className="p-6 md:p-8 lg:p-12 space-y-6">
      <div className="h-32 rounded-lg bg-gray-200 animate-pulse" />
      <div className="grid grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-24 rounded-lg bg-gray-200 animate-pulse" />
        ))}
      </div>
      <div className="h-64 rounded-lg bg-gray-200 animate-pulse" />
    </div>
  );
}