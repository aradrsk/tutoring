import { readFileSync } from "node:fs";
import path from "node:path";
import type { Metadata } from "next";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { SiteNav } from "@/components/site-nav";
import { SiteFooter } from "@/components/site-footer";

export const metadata: Metadata = {
  title: "Brainstorm",
  description:
    "A sketchpad of UX + architecture ideas for the tutoring app. Not shipped, not decisions — just directions to consider.",
  robots: { index: false, follow: false },
};

export const dynamic = "force-static";

function loadBrainstorm(): string {
  const file = path.join(process.cwd(), "docs", "brainstorm.md");
  try {
    return readFileSync(file, "utf8");
  } catch {
    return "# Brainstorm\n\nNothing written yet. Ask Claude to draft one.";
  }
}

export default function BrainstormPage() {
  const md = loadBrainstorm();

  return (
    <main className="min-h-screen bg-white">
      <SiteNav />

      <section className="mx-auto max-w-3xl px-6 pt-10 pb-16 md:pt-16">
        <p className="mb-4 text-sm font-semibold uppercase tracking-widest text-[#191A23]/50">
          Internal · sketchpad
        </p>
        <h1 className="text-4xl font-medium tracking-tight md:text-5xl">
          Brain
          <span className="inline-block -rotate-[1deg] rounded-md bg-[#B9FF66] px-3 py-0.5">
            storm
          </span>
          .
        </h1>
        <p className="mt-5 max-w-xl text-lg text-[#191A23]/70">
          Not decisions. Not a roadmap. A working sketchpad of UX + architecture
          moves to consider. Read, cross things out, fight with me.
        </p>

        <article className="prose mt-12 max-w-none text-[15px] leading-relaxed text-[#191A23]/85 [&_a]:text-[#191A23] [&_a]:underline [&_code]:rounded [&_code]:bg-zinc-100 [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:font-mono [&_code]:text-[0.85em] [&_h1]:hidden [&_h2]:mb-3 [&_h2]:mt-14 [&_h2]:inline-block [&_h2]:rounded-md [&_h2]:bg-[#B9FF66] [&_h2]:px-3 [&_h2]:py-1 [&_h2]:text-2xl [&_h2]:font-medium [&_h3]:mb-2 [&_h3]:mt-8 [&_h3]:text-lg [&_h3]:font-semibold [&_hr]:my-14 [&_hr]:border-[#191A23]/10 [&_li]:my-1.5 [&_p]:my-4 [&_strong]:font-semibold [&_ul]:my-4 [&_ul]:list-disc [&_ul]:space-y-1 [&_ul]:pl-6">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{md}</ReactMarkdown>
        </article>
      </section>

      <SiteFooter />
    </main>
  );
}
