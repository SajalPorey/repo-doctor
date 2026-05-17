import RepoUrlForm from "@/components/RepoUrlForm";

export default function HomePage() {
  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-10 sm:px-6">
      <section className="w-full max-w-4xl">
        <div className="mx-auto mb-8 max-w-3xl text-center">
          <div className="mb-5 inline-flex rounded-full border border-zinc-800 bg-zinc-900 px-3 py-1 font-mono text-xs text-violet-300">
            RepoDoctor
          </div>
          <h1 className="text-balance text-4xl font-semibold tracking-normal text-white sm:text-6xl">
            Is your GitHub repo production-ready?
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-zinc-400 sm:text-lg">
            Paste any public repo URL and get an instant health report.
          </p>
        </div>

        <RepoUrlForm />

        <div className="mx-auto mt-10 grid max-w-3xl gap-3 sm:grid-cols-3">
          <SummaryItem value="100" label="point health model" />
          <SummaryItem value="6" label="review categories" />
          <SummaryItem value="21" label="repo checks" />
        </div>
      </section>
    </main>
  );
}

function SummaryItem({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-lg border border-zinc-800 bg-zinc-900/60 p-4 text-center">
      <p className="font-mono text-2xl font-semibold text-white">{value}</p>
      <p className="mt-1 text-xs uppercase tracking-[0.16em] text-zinc-500">{label}</p>
    </div>
  );
}
