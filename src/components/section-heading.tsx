export function SectionHeading({
  title,
  lede,
}: {
  title: string;
  lede?: string;
}) {
  return (
    <div className="mb-12 flex flex-wrap items-end gap-5">
      <h2 className="inline-block rounded-md bg-[#B9FF66] px-3 py-1 text-3xl font-medium md:text-4xl">
        {title}
      </h2>
      {lede && <p className="max-w-md text-base text-[#191A23]/70">{lede}</p>}
    </div>
  );
}

export function PageHeading({
  eyebrow,
  title,
  lede,
}: {
  eyebrow?: string;
  title: string;
  lede?: string;
}) {
  return (
    <header className="mx-auto max-w-6xl px-6 pt-10 pb-8 md:pt-16">
      {eyebrow && (
        <p className="mb-4 text-sm font-semibold uppercase tracking-widest text-[#191A23]/50">
          {eyebrow}
        </p>
      )}
      <h1 className="text-4xl font-medium tracking-tight md:text-5xl lg:text-6xl">
        {title}
      </h1>
      {lede && (
        <p className="mt-5 max-w-xl text-lg text-[#191A23]/70">{lede}</p>
      )}
    </header>
  );
}
