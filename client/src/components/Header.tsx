import { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "wouter";
import { Menu, X, Instagram, Linkedin, ArrowRight, ChevronDown } from "lucide-react";
import { LOGO, BRAND } from "@/lib/brand";

const RAIOX_ITEMS = [
  { label: "Módulo 1: Simule seu plano", href: "/simulador/simule-seu-plano" },
];

export default function Header() {
  const [open, setOpen] = useState(false);
  const [raioxOpen, setRaioxOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [location] = useLocation();
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setOpen(false);
    setRaioxOpen(false);
  }, [location]);

  // Fechar dropdown ao clicar fora
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setRaioxOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const raioxActive = location.startsWith("/simulador/");

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

            {/* Dropdown: Raio-X do Consórcio */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setRaioxOpen((v) => !v)}
                className={`flex items-center gap-1 text-sm font-medium transition-colors hover:text-[var(--orange)] ${
                  raioxActive ? "text-[var(--orange)]" : "text-foreground/80"
                }`}
              >
                Raio-X do Consórcio
                <ChevronDown
                  className={`w-4 h-4 transition-transform duration-200 ${raioxOpen ? "rotate-180" : ""}`}
                />
              </button>

              {raioxOpen && (
                <div className="absolute top-full left-0 mt-2 w-64 rounded-xl border border-border bg-[var(--paper)] shadow-lg py-1 z-50">
                  <div className="px-3 py-2 border-b border-border/60">
                    <p className="text-[10px] font-semibold tracking-widest text-foreground/40 uppercase">
                      Módulos
                    </p>
                  </div>
                  {RAIOX_ITEMS.map((item) => {
                    const active = location === item.href;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={`block px-4 py-2.5 text-sm transition-colors hover:bg-secondary hover:text-[var(--orange)] ${
                          active ? "text-[var(--orange)] font-medium" : "text-foreground/80"
                        }`}
                      >
                        {item.label}
                      </Link>
                    );
                  })}
                  <div className="px-3 py-2 border-t border-border/60 mt-1">
                    <Link
                      href="/simuladores"
                      className="text-xs text-foreground/50 hover:text-[var(--orange)] transition-colors"
                    >
                      Ver todos os simuladores →
                    </Link>
                  </div>
                </div>
              )}
            </div>

            <Link
              href="/sobre"
              className={`text-sm font-medium transition-colors hover:text-[var(--orange)] ${
                location === "/sobre" ? "text-[var(--orange)]" : "text-foreground/80"
              }`}
            >
              Sobre
            </Link>
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
            <a
              href={BRAND.whatsapp}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-full bg-[var(--ink)] text-[var(--paper)] px-5 py-2.5 text-sm font-semibold transition-transform hover:scale-[1.02]"
            >
              Falar com especialista
              <ArrowRight className="w-4 h-4" />
            </a>
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

            {/* Raio-X do Consórcio (expandível no mobile) */}
            <div>
              <button
                onClick={() => setRaioxOpen((v) => !v)}
                className="w-full flex items-center justify-between py-3 text-base font-medium text-foreground/90 hover:text-[var(--orange)] border-b border-border/60"
              >
                Raio-X do Consórcio
                <ChevronDown
                  className={`w-4 h-4 transition-transform duration-200 ${raioxOpen ? "rotate-180" : ""}`}
                />
              </button>
              {raioxOpen && (
                <div className="pl-4 pb-2 flex flex-col gap-1">
                  {RAIOX_ITEMS.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="py-2 text-sm text-foreground/70 hover:text-[var(--orange)]"
                    >
                      {item.label}
                    </Link>
                  ))}
                  <Link
                    href="/simuladores"
                    className="py-2 text-xs text-foreground/50 hover:text-[var(--orange)]"
                  >
                    Ver todos os simuladores →
                  </Link>
                </div>
              )}
            </div>

            <Link
              href="/sobre"
              className="py-3 text-base font-medium text-foreground/90 hover:text-[var(--orange)] border-b border-border/60"
            >
              Sobre
            </Link>

            <a
              href={BRAND.whatsapp}
              target="_blank"
              rel="noreferrer"
              className="mt-4 inline-flex items-center justify-center gap-2 rounded-full bg-[var(--ink)] text-[var(--paper)] px-5 py-3 text-sm font-semibold"
            >
              Falar com especialista
              <ArrowRight className="w-4 h-4" />
            </a>
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
