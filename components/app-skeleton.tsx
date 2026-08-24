export function AppSkeleton() {
  return (
    <main className="mx-auto min-h-[calc(100dvh-64px)] max-w-[1500px] p-4 pb-24 sm:p-6 lg:p-8" aria-busy="true" aria-label="Loading page">
      <div className="animate-pulse space-y-6">
        <div className="space-y-3">
          <div className="h-3 w-24 rounded bg-white/[.08]" />
          <div className="h-10 w-72 max-w-full rounded bg-white/[.08]" />
          <div className="h-4 w-full max-w-xl rounded bg-white/[.05]" />
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }, (_, index) => <div key={index} className="h-28 rounded-xl border border-white/[.07] bg-white/[.03]" />)}
        </div>
        <div className="h-80 rounded-xl border border-white/[.07] bg-white/[.03]" />
      </div>
    </main>
  );
}
