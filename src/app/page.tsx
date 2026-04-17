export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-zinc-50 px-6 py-24 font-sans dark:bg-black">
      <div className="w-full max-w-md space-y-4 text-center">
        <p className="text-sm uppercase tracking-widest text-zinc-500">
          Tutoring Scheduler
        </p>
        <h1 className="text-3xl font-semibold tracking-tight text-black dark:text-zinc-50 sm:text-4xl">
          Book your next English tutoring session.
        </h1>
        <p className="text-base leading-7 text-zinc-600 dark:text-zinc-400">
          Landing page placeholder. Real availability, teacher bio, and booking
          flow land in upcoming milestones.
        </p>
      </div>
    </main>
  );
}
