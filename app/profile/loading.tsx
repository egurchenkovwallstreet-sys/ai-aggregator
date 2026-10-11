export default function ProfileLoading() {
  return (
    <div className="mx-auto w-full max-w-lg flex-1 px-4 py-12 sm:py-16">
      <div className="h-8 w-40 animate-pulse rounded-md bg-zinc-200" />
      <div className="mt-3 h-4 w-64 animate-pulse rounded-md bg-zinc-100" />
      <div className="mt-8 h-40 animate-pulse rounded-xl bg-zinc-100" />
    </div>
  );
}
