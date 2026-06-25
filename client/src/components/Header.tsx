import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Menu, X, Instagram, Linkedin, ArrowRight } from "lucide-react";
import { LOGO, BRAND } from "@/lib/brand";

const NAV = [
  { label: "Simuladores", href: "/simuladores" },
  { label: "Sobre", href: "/sobre" },
];

export default function Header() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [location] = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [location]);

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-[var(--paper)]/90 backdrop-blur-md border-b border-border"
          : "bg-transparent border-b border-transparent"
      }`}
    >
      <div className="container-wide px-5 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center shrink-0">
            <img
              src={LOGO.horizontalDark}
              alt={BRAND.name}
              className="h-9 md:h-11 w-auto"
            />
          </Link>

          {/* Nav desktop */}
          <nav className="hidden lg:flex items-center gap-8">
            <Link
              href="/"
              className={`text-sm font-medium transition-colors hover:text-[var(--orange)] ${
                location === "/" ? "text-[var(--orange)]" : "text-foreground/80"
              }`}
            >
              Home
            </Link>
            {NAV.map((item) => {
              const active = location === item.href || location.startsWith(item.href + "/");
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`text-sm font-medium transition-colors hover:text-[var(--orange)] ${
                    active ? "text-[var(--orange)]" : "text-foreground/80"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Ações desktop */}
          <div className="hidden lg:flex items-center gap-4">
            <a
              href={BRAND.instagram}
              target="_blank"
              rel="noreferrer"
              aria-label="Instagram"
              className="text-foreground/60 hover:text-[var(--orange)] transition-colors"
            >
              <Instagram className="w-5 h-5" />
            </a>
            <a
              href={BRAND.linkedin}
              target="_blank"
              rel="noreferrer"
              aria-label="LinkedIn"
              className="text-foreground/60 hover:text-[var(--orange)] transition-colors"
            >
              <Linkedin className="w-5 h-5" />
            </a>
            <Link
              href="/sobre"
              className="inline-flex items-center gap-2 rounded-full bg-[var(--ink)] text-[var(--paper)] px-5 py-2.5 text-sm font-semibold transition-transform hover:scale-[1.02]"
            >
              Falar com especialista
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Mobile toggle */}
          <button
            className="lg:hidden text-foreground p-2"
            onClick={() => setOpen((v) => !v)}
            aria-label="Menu"
          >
            {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="lg:hidden bg-[var(--paper)] border-b border-border">
          <nav className="container-wide px-5 py-4 flex flex-col gap-1">
            <Link
              href="/"
              className="py-3 text-base font-medium text-foreground/90 hover:text-[var(--orange)] border-b border-border/60"
            >
              Home
            </Link>
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="py-3 text-base font-medium text-foreground/90 hover:text-[var(--orange)] border-b border-border/60"
              >
                {item.label}
              </Link>
            ))}
            <Link
              href="/sobre"
              className="mt-4 inline-flex items-center justify-center gap-2 rounded-full bg-[var(--ink)] text-[var(--paper)] px-5 py-3 text-sm font-semibold"
            >
              Falar com especialista
              <ArrowRight className="w-4 h-4" />
            </Link>
            <div className="flex items-center gap-5 mt-4 pb-2">
              <a href={BRAND.instagram} target="_blank" rel="noreferrer" className="text-foreground/60">
                <Instagram className="w-5 h-5" />
              </a>
              <a href={BRAND.linkedin} target="_blank" rel="noreferrer" className="text-foreground/60">
                <Linkedin className="w-5 h-5" />
              </a>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
