import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Menu, X, Instagram, Youtube } from "lucide-react";
import { LOGO, BRAND } from "@/lib/brand";

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

  const raioxActive = location.startsWith("/simulador") || location === "/simuladores";
  const caixapretaActive = location === "/caixa-preta";
  const zonaActive = location === "/zona-contemplacao";
  const panoramaActive = location === "/panorama";

  return (
    <>
      <header
        className="fixed top-0 left-0 right-0 z-50 transition-all duration-300 w-full max-w-[100vw] bg-[var(--paper)] border-b border-border shadow-sm"
      >
        <div className="w-full px-3 md:px-4 lg:px-5 max-w-[100vw]">
          <div className="flex items-center justify-between h-14 md:h-16">
            {/* Logo - Densidade aumentada sem alterar altura do menu */}
            <Link href="/" className="flex items-center shrink-0">
              <img
                src={LOGO.dark}
                alt={BRAND.name}
                className="h-10 md:h-14 w-auto object-contain scale-110 md:scale-100 transition-transform origin-left"
              />
            </Link>

            {/* Nav desktop */}
            <nav className="hidden lg:flex items-center gap-4">
              <Link
                href="/#hero"
                className={`text-[13px] md:text-[14px] font-normal transition-colors hover:text-[var(--orange)] ${
                  location === "/" ? "text-[var(--orange)]" : "text-[var(--ink)]"
                }`}
              >
                Home
              </Link>

              <Link
                href="/simuladores#hero"
                className={`text-[14px] md:text-[15px] font-normal transition-colors hover:text-[var(--orange)] ${
                  raioxActive ? "text-[var(--orange)]" : "text-[var(--ink)]"
                }`}
              >
                Raio-X
              </Link>

              <Link
                href="/zona-contemplacao#hero"
                className={`text-[14px] md:text-[15px] font-normal transition-colors hover:text-[var(--orange)] ${
                  zonaActive ? "text-[var(--orange)]" : "text-[var(--ink)]"
                }`}
              >
                Zona de Contemplação
              </Link>

              <Link
                href="/panorama#hero"
                className={`text-[14px] md:text-[15px] font-normal transition-colors hover:text-[var(--orange)] ${
                  panoramaActive ? "text-[var(--orange)]" : "text-[var(--ink)]"
                }`}
              >
                Panorama: BC
              </Link>

              <Link
                href="/caixa-preta#hero"
                className={`text-[14px] md:text-[15px] font-normal transition-colors hover:text-[var(--orange)] ${
                  caixapretaActive ? "text-[var(--orange)]" : "text-[var(--ink)]"
                }`}
              >
                Caixa-Preta
              </Link>

              <Link
                href="/sobre"
                className={`text-[14px] md:text-[15px] font-medium transition-colors hover:text-[var(--orange)] ${
                  location === "/sobre" ? "text-[var(--orange)]" : "text-foreground/80"
                }`}
              >
                  r.
              </Link>
            </nav>

            {/* Ações desktop — Redes Sociais */}
            <div className="hidden lg:flex items-center gap-4">
              <a
                href={BRAND.instagram}
                target="_blank"
                rel="noreferrer"
                aria-label="Instagram"
                className="text-[var(--orange)] hover:text-[#FFFF00] transition-colors"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a
                href={BRAND.youtube}
                target="_blank"
                rel="noreferrer"
                aria-label="YouTube"
                className="text-[var(--orange)] hover:text-[#FFFF00] transition-colors"
              >
                <Youtube className="w-5 h-5" />
              </a>
            </div>

            {/* Mobile toggle */}
            <button
              className="lg:hidden text-foreground p-2 min-h-[44px] min-w-[44px] flex items-center justify-center"
              onClick={() => setOpen((v) => !v)}
              aria-label="Menu"
            >
              {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {open && (
          <div className="lg:hidden fixed top-16 md:top-20 left-0 right-0 z-40 bg-[var(--paper)] border-b border-border w-full max-w-[100vw]">
            <nav className="w-full px-4 py-4 flex flex-col gap-1">
              <Link
                href="/#hero"
                className="py-3 text-base font-medium text-foreground/90 hover:text-[var(--orange)] border-b border-border/60"
              >
                Home
              </Link>

              <Link
                href="/simuladores#hero"
                className="py-3 text-base font-medium text-foreground/90 hover:text-[var(--orange)] border-b border-border/60"
              >
                Raio-X
              </Link>

              <Link
                href="/zona-contemplacao#hero"
                className="py-3 text-base font-medium text-foreground/90 hover:text-[var(--orange)] border-b border-border/60"
              >
                Zona de Contemplação
              </Link>

              <Link
                href="/panorama#hero"
                className="py-3 text-base font-medium text-foreground/90 hover:text-[var(--orange)] border-b border-border/60"
              >
                Panorama: BC
              </Link>

              <Link
                href="/caixa-preta#hero"
                className="py-3 text-base font-medium text-foreground/90 hover:text-[#FFC93C] border-b border-border/60"
              >
                Caixa-Preta
              </Link>

              <Link
                href="/sobre"
                className="py-3 text-base font-medium text-foreground/90 hover:text-[var(--orange)] border-b border-border/60"
              >
                  r.
              </Link>

              <div className="flex items-center gap-5 mt-4 pb-2">
                <a href={BRAND.instagram} target="_blank" rel="noreferrer" className="text-[var(--orange)] hover:text-[#FFFF00] transition-colors">
                  <Instagram className="w-5 h-5" />
                </a>
                <a href={BRAND.youtube} target="_blank" rel="noreferrer" className="text-[var(--orange)] hover:text-[#FFFF00] transition-colors">
                  <Youtube className="w-5 h-5" />
                </a>
              </div>
            </nav>
          </div>
        )}
      </header>
      
      {/* Spacer para compensar o header fixed */}
      <div className="h-16 md:h-20"></div>
    </>
  );
}
