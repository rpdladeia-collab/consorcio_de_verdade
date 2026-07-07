import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Menu, X, Instagram } from "lucide-react";
import IconR from "../assets/icon_r.png";
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
  const zonaActive = location === "/zona-contemplacao";
  const panoramaActive = location === "/panorama";

  return (
    <>
      <header
        className="fixed top-0 left-0 right-0 z-50 transition-all duration-300 w-full max-w-[100vw] bg-[var(--paper)] border-b border-border shadow-sm"
      >
        <div className="w-full px-4 md:px-5 lg:px-6 max-w-[100vw]">
          <div className="flex items-center justify-between h-16 md:h-20">
            {/* Logo */}
            <Link href="/" className="flex items-center shrink-0">
              <img
                src={LOGO.dark}
                alt={BRAND.name}
                className="h-14 md:h-20 w-auto object-contain"
              />
            </Link>

            {/* Nav desktop */}
            <nav className="hidden lg:flex items-center gap-5">
              <Link
                href="/"
                className={`text-sm font-medium transition-colors hover:text-[var(--orange)] ${
                  location === "/" ? "text-[var(--orange)]" : "text-foreground/80"
                }`}
              >
                Home
              </Link>

              <Link
                href="/simuladores"
                className={`text-sm font-medium transition-colors hover:text-[var(--orange)] ${
                  raioxActive ? "text-[var(--orange)]" : "text-foreground/80"
                }`}
              >
                Raio-X do Consórcio
              </Link>

              <Link
                href="/zona-contemplacao"
                className={`text-sm font-medium transition-colors hover:text-[var(--orange)] ${
                  zonaActive ? "text-[var(--orange)]" : "text-foreground/80"
                }`}
              >
                Zona de Contemplação
              </Link>

              <Link
                href="/panorama"
                className={`text-sm font-medium transition-colors hover:text-[var(--orange)] ${
                  panoramaActive ? "text-[var(--orange)]" : "text-foreground/80"
                }`}
              >
                Panorama: BC
              </Link>

              <Link
                href="/sobre"
                className={`text-sm font-medium transition-colors hover:text-[var(--orange)] ${
                  location === "/sobre" ? "text-[var(--orange)]" : "text-foreground/80"
                }`}
              >
                  <img src={IconR} alt="r." className="h-5 w-auto" />
              </Link>
            </nav>

            {/* Ações desktop — apenas Instagram */}
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
                href="/"
                className="py-3 text-base font-medium text-foreground/90 hover:text-[var(--orange)] border-b border-border/60"
              >
                Home
              </Link>

              <Link
                href="/simuladores"
                className="py-3 text-base font-medium text-foreground/90 hover:text-[var(--orange)] border-b border-border/60"
              >
                Raio-X do Consórcio
              </Link>

              <Link
                href="/zona-contemplacao"
                className="py-3 text-base font-medium text-foreground/90 hover:text-[var(--orange)] border-b border-border/60"
              >
                Zona de Contemplação
              </Link>

              <Link
                href="/panorama"
                className="py-3 text-base font-medium text-foreground/90 hover:text-[var(--orange)] border-b border-border/60"
              >
                Panorama: BC
              </Link>

              <Link
                href="/sobre"
                className="py-3 text-base font-medium text-foreground/90 hover:text-[var(--orange)] border-b border-border/60"
              >
                  <img src={IconR} alt="r." className="h-6 w-auto" />
              </Link>

              <div className="flex items-center gap-5 mt-4 pb-2">
                <a href={BRAND.instagram} target="_blank" rel="noreferrer" className="text-foreground/60 hover:text-[var(--orange)] transition-colors">
                  <Instagram className="w-5 h-5" />
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
