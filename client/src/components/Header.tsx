import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Menu, X, Instagram, Youtube, ChevronDown } from "lucide-react";
import { LOGO, BRAND } from "@/lib/brand";

const RAIOX_SUBMENU = [
  { label: "Raio-X da Proposta", href: "/simuladores#cat-01" },
  { label: "Raio-X do Lance", href: "/simuladores#cat-02" },
  { label: "Raio-X da Contemplação", href: "/simuladores#cat-03" },
  { label: "Raio-X da Exclusão", href: "/simuladores#cat-04" },
  { label: "Raio-X da Alavancagem", href: "/simuladores#cat-05" },
];

const INDUSTRIA_SUBMENU = [
  { label: "Panorama editorial", href: "/panorama#hero" },
  { label: "Panorama Banco Central", href: "/data-lab" },
  { label: "Panorama Administradoras", href: "#", isFuture: true },
];

const R_ICON_URL = "/assets/r-icon.png";

export default function Header() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [location] = useLocation();
  const [raioxOpen, setRaioxOpen] = useState(false);
  const [industriaOpen, setIndustriaOpen] = useState(false);

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
  const panoramaActive = location === "/panorama" || location === "/data-lab";

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

              {/* raio-x do consórcio com submenu */}
              <div
                className="relative"
                onMouseEnter={() => setRaioxOpen(true)}
                onMouseLeave={() => setRaioxOpen(false)}
              >
                <Link
                  href="/simuladores#hero"
                  className={`text-[14px] md:text-[15px] font-normal transition-colors hover:text-[var(--orange)] flex items-center gap-1 ${
                    raioxActive ? "text-[var(--orange)]" : "text-[var(--ink)]"
                  }`}
                >
                  raio-x do consórcio
                  <ChevronDown className="w-3 h-3" />
                </Link>
                {raioxOpen && (
                  <div className="absolute top-full left-0 pt-2 z-50">
                    <div className="bg-[var(--paper)] border border-border rounded-md shadow-lg py-2 min-w-[220px]">
                      {RAIOX_SUBMENU.map((item) => (
                        <Link
                          key={item.label}
                          href={item.href}
                          className="block px-4 py-2 text-[13px] text-[var(--ink)] hover:text-[var(--orange)] hover:bg-[var(--orange)]/5 transition-colors"
                        >
                          {item.label}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Indústria do Consórcio com submenu */}
              <div
                className="relative"
                onMouseEnter={() => setIndustriaOpen(true)}
                onMouseLeave={() => setIndustriaOpen(false)}
              >
                <Link
                  href="/panorama#hero"
                  className={`text-[14px] md:text-[15px] font-normal transition-colors hover:text-[var(--orange)] flex items-center gap-1 ${
                    panoramaActive ? "text-[var(--orange)]" : "text-[var(--ink)]"
                  }`}
                >
                  Indústria do Consórcio
                  <ChevronDown className="w-3 h-3" />
                </Link>
                {industriaOpen && (
                  <div className="absolute top-full left-0 pt-2 z-50">
                    <div className="bg-[var(--paper)] border border-border rounded-md shadow-lg py-2 min-w-[220px]">
                      {INDUSTRIA_SUBMENU.map((item) =>
                        item.isFuture ? (
                          <button
                            key={item.label}
                            onClick={(e) => {
                              e.preventDefault();
                              alert("Em breve");
                            }}
                            className="block w-full text-left px-4 py-2 text-[13px] text-[var(--ink)] hover:bg-[var(--orange)]/5 transition-colors"
                            style={{ filter: "saturate(0.5)", opacity: 0.6 }}
                          >
                            {item.label}
                          </button>
                        ) : (
                          <Link
                            key={item.label}
                            href={item.href}
                            className="block px-4 py-2 text-[13px] text-[var(--ink)] hover:text-[var(--orange)] hover:bg-[var(--orange)]/5 transition-colors"
                          >
                            {item.label}
                          </Link>
                        )
                      )}
                    </div>
                  </div>
                )}
              </div>

              <Link
                href="/caixa-preta#hero"
                className={`text-[14px] md:text-[15px] font-normal transition-colors hover:text-[var(--orange)] ${
                  caixapretaActive ? "text-[var(--orange)]" : "text-[var(--ink)]"
                }`}
              >
                Caixa-Preta
              </Link>
            </nav>

            {/* Ações desktop — Redes Sociais + ícone r. */}
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
              <Link
                href="/sobre"
                className={`transition-colors hover:text-[var(--orange)] ${
                  location === "/sobre" ? "text-[var(--orange)]" : "text-foreground/80"
                }`}
                aria-label="r."
              >
                <img
                  src={R_ICON_URL}
                  alt="r."
                  className="w-5 h-5 object-contain"
                />
              </Link>
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

              {/* raio-x do consórcio — mobile accordion */}
              <div className="border-b border-border/60">
                <Link
                  href="/simuladores#hero"
                  className="py-3 text-base font-medium text-foreground/90 hover:text-[var(--orange)] flex items-center justify-between"
                >
                  raio-x do consórcio
                </Link>
                <div className="pb-2 pl-4 flex flex-col gap-1">
                  {RAIOX_SUBMENU.map((item) => (
                    <Link
                      key={item.label}
                      href={item.href}
                      className="py-2 text-[14px] text-foreground/70 hover:text-[var(--orange)]"
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>
              </div>

              {/* Indústria do Consórcio — mobile accordion */}
              <div className="border-b border-border/60">
                <Link
                  href="/panorama#hero"
                  className="py-3 text-base font-medium text-foreground/90 hover:text-[var(--orange)] flex items-center justify-between"
                >
                  Indústria do Consórcio
                </Link>
                <div className="pb-2 pl-4 flex flex-col gap-1">
                  {INDUSTRIA_SUBMENU.map((item) =>
                    item.isFuture ? (
                      <button
                        key={item.label}
                        onClick={(e) => {
                          e.preventDefault();
                          alert("Em breve");
                        }}
                        className="py-2 text-[14px] text-left text-foreground/70"
                        style={{ filter: "saturate(0.5)", opacity: 0.6 }}
                      >
                        {item.label}
                      </button>
                    ) : (
                      <Link
                        key={item.label}
                        href={item.href}
                        className="py-2 text-[14px] text-foreground/70 hover:text-[var(--orange)]"
                      >
                        {item.label}
                      </Link>
                    )
                  )}
                </div>
              </div>

              <Link
                href="/caixa-preta#hero"
                className="py-3 text-base font-medium text-foreground/90 hover:text-[#FFC93C] border-b border-border/60"
              >
                Caixa-Preta
              </Link>

              <div className="flex items-center gap-5 mt-4 pb-2">
                <a href={BRAND.instagram} target="_blank" rel="noreferrer" className="text-[var(--orange)] hover:text-[#FFFF00] transition-colors">
                  <Instagram className="w-5 h-5" />
                </a>
                <a href={BRAND.youtube} target="_blank" rel="noreferrer" className="text-[var(--orange)] hover:text-[#FFFF00] transition-colors">
                  <Youtube className="w-5 h-5" />
                </a>
                <Link href="/sobre" className="text-[var(--orange)] hover:text-[#FFFF00] transition-colors">
                  <img src={R_ICON_URL} alt="r." className="w-5 h-5 object-contain" />
                </Link>
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
