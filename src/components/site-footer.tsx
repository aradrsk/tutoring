import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="bg-[#191A23] text-white">
      <div className="mx-auto max-w-6xl px-6 py-14">
        <div className="grid gap-10 md:grid-cols-[1.5fr_1fr_1fr_1fr]">
          <div>
            <p className="flex items-center gap-2 text-xl font-bold">
              <span className="inline-block h-5 w-5 rounded-sm bg-[#B9FF66]" />
              tutor<span className="text-[#B9FF66]">.</span>
            </p>
            <p className="mt-4 max-w-xs text-sm text-white/60">
              1:1 English tutoring for K-12 students. In-person in Toronto. No DMs.
            </p>
          </div>

          <FooterCol
            title="Product"
            links={[
              { href: "/#services", label: "Sessions" },
              { href: "/#how", label: "How it works" },
              { href: "/#pricing", label: "Pricing" },
              { href: "/updates", label: "Updates" },
            ]}
          />
          <FooterCol
            title="Account"
            links={[
              { href: "/signup", label: "Sign up" },
              { href: "/login", label: "Log in" },
              { href: "/account/bookings", label: "Dashboard" },
            ]}
          />
          <FooterCol
            title="Elsewhere"
            links={[
              { href: "/privacy", label: "Privacy" },
              { href: "/terms", label: "Terms" },
              { href: "https://aradrsk.com", label: "aradrsk.com", external: true },
              { href: "https://github.com/aradrsk/tutoring", label: "GitHub", external: true },
            ]}
          />
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-3 border-t border-white/10 pt-6 text-xs text-white/40 md:flex-row">
          <p>© 2026 · Built as a free prototype · America/Toronto</p>
          <p>Made by Arad · <Link href="https://aradrsk.com" className="underline hover:text-[#B9FF66]">aradrsk.com</Link></p>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({
  title,
  links,
}: {
  title: string;
  links: { href: string; label: string; external?: boolean }[];
}) {
  return (
    <div>
      <p className="mb-4 text-sm font-semibold uppercase tracking-widest text-white/50">
        {title}
      </p>
      <ul className="space-y-2 text-sm">
        {links.map((l) => (
          <li key={l.href}>
            <Link
              href={l.href}
              target={l.external ? "_blank" : undefined}
              rel={l.external ? "noopener noreferrer" : undefined}
              className="text-white/80 hover:text-[#B9FF66]"
            >
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
