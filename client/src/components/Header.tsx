import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Menu, X, Instagram, Youtube, ChevronDown } from "lucide-react";
import { LOGO, BRAND } from "@/lib/brand";

const RAIOX_SUBMENU = [
  { label: "Raio-X da Proposta", href: "/simulador/estrutura-do-plano#parametros" },
  { label: "Raio-X do Lance", href: "/simulador/estrategia-lance#parametros" },
  { label: "Raio-X da Contemplação", href: "/simulador/zona-contemplacao#hero" },
  { label: "Raio-X da Exclusão", href: "/simulador/custo-cancelamento#parametros" },
  { label: "Raio-X da Alavancagem", href: "/simulador/venda-carta-contemplada#parametros" },
];

const INDUSTRIA_SUBMENU = [
  { label: "Panorama editorial", href: "/panorama#hero" },
  { label: "Panorama Banco Central", href: "/data-lab" },
  { label: "Panorama Administradoras", href: "#", isFuture: true },
];

const R_ICON_URL = "/manus-storage/r_ponto_minimal_transparente_limpo_c867ecfd.png";

export default function Header() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [location] = useLocation();
  const [raioxOpen, setRaioxOpen] = useState(false);
  const [raioxMobileOpen, setRaioxMobileOpen] = useState(false);
  const [industriaOpen, setIndustriaOpen] = useState(false);
  const [industriaMobileOpen, setIndustriaMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setOpen(false);
    setRaioxOpen(false);
    setRaioxMobileOpen(false);
    setIndustriaOpen(false);
    setIndustriaMobileOpen(false);
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
            {/* Logo */}
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
                <button
                  className={`flex items-center gap-1 text-[14px] md:text-[15px] font-normal transition-colors hover:text-[var(--orange)] ${
                    raioxActive ? "text-[var(--orange)]" : "text-[var(--ink)]"
                  }`}
                >
                  <Link href="/simuladores#hero">raio-x do consórcio</Link>
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${raioxOpen ? "rotate-180" : ""}`} />
                </button>

                {raioxOpen && (
                  <div className="absolute top-full left-0 pt-2 z-50">
                    <div className="bg-white border border-border shadow-lg rounded-sm min-w-[240px] py-2">
                      {RAIOX_SUBMENU.map((item) => (
                        <Link
                          key={item.href}
                          href={item.href}
                          className="block px-4 py-2.5 text-[13px] text-[var(--ink)] hover:text-[var(--orange)] hover:bg-[#FAF5EA] transition-colors"
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
                <button
                  className={`flex items-center gap-1 text-[14px] md:text-[15px] font-normal transition-colors hover:text-[var(--orange)] ${
                    panoramaActive ? "text-[var(--orange)]" : "text-[var(--ink)]"
                  }`}
                >
                  <Link href="/panorama#hero">Indústria do Consórcio</Link>
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${industriaOpen ? "rotate-180" : ""}`} />
                </button>

                {industriaOpen && (
                  <div className="absolute top-full left-0 pt-2 z-50">
                    <div className="bg-white border border-border shadow-lg rounded-sm min-w-[240px] py-2">
                      {INDUSTRIA_SUBMENU.map((item) => {
                        if (item.isFuture) {
                          return (
                            <button
                              key={item.label}
                              onClick={() => alert("Em breve")}
                              className="block w-full text-left px-4 py-2.5 text-[13px] text-[var(--ink)] hover:text-[var(--orange)] hover:bg-[#FAF5EA] transition-colors"
                              style={{ filter: "saturate(0.5)", opacity: 0.6 }}
                            >
                              {item.label}
                            </button>
                          );
                        }
                        return (
                          <Link
                            key={item.href}
                            href={item.href}
                            className="block px-4 py-2.5 text-[13px] text-[var(--ink)] hover:text-[var(--orange)] hover:bg-[#FAF5EA] transition-colors"
                          >
                            {item.label}
                          </Link>
                        );
                      })}
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
                aria-label="r. — Consórcio de Verdade"
                className={`transition-colors hover:opacity-80 ${location === "/sobre" ? "opacity-80" : ""}`}
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

              {/* raio-x do consórcio com submenu mobile */}
              <button
                onClick={() => setRaioxMobileOpen((v) => !v)}
                className="py-3 text-base font-medium text-foreground/90 hover:text-[var(--orange)] border-b border-border/60 flex items-center justify-between w-full"
              >
                <span>raio-x do consórcio</span>
                <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${raioxMobileOpen ? "rotate-180" : ""}`} />
              </button>
              {raioxMobileOpen && (
                <div className="flex flex-col gap-0 pl-4 border-b border-border/60">
                  {RAIOX_SUBMENU.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="py-2.5 text-[14px] text-foreground/75 hover:text-[var(--orange)]"
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>
              )}

              {/* Indústria do Consórcio com submenu mobile */}
              <button
                onClick={() => setIndustriaMobileOpen((v) => !v)}
                className="py-3 text-base font-medium text-foreground/90 hover:text-[var(--orange)] border-b border-border/60 flex items-center justify-between w-full"
              >
                <span>Indústria do Consórcio</span>
                <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${industriaMobileOpen ? "rotate-180" : ""}`} />
              </button>
              {industriaMobileOpen && (
                <div className="flex flex-col gap-0 pl-4 border-b border-border/60">
                  {INDUSTRIA_SUBMENU.map((item) => {
                    if (item.isFuture) {
                      return (
                        <button
                          key={item.label}
                          onClick={() => alert("Em breve")}
                          className="py-2.5 text-[14px] text-foreground/75 hover:text-[var(--orange)] text-left"
                          style={{ filter: "saturate(0.5)", opacity: 0.6 }}
                        >
                          {item.label}
                        </button>
                      );
                    }
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className="py-2.5 text-[14px] text-foreground/75 hover:text-[var(--orange)]"
                      >
                        {item.label}
                      </Link>
                    );
                  })}
                </div>
              )}

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
                <Link href="/sobre" className="hover:opacity-80 transition-opacity">
                  <img
                    src={R_ICON_URL}
                    alt="r."
                    className="w-5 h-5 object-contain"
                  />
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
