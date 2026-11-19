import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-16 text-center">
      <h1 className="text-xl font-semibold">Page not found</h1>
      <p className="mt-2 text-muted">That path does not exist.</p>
      <Link href="/" prefetch={false} className="mt-6 inline-block min-h-[44px] py-2 text-accent underline">
        Back to the start
      </Link>
    </main>
  );
}
