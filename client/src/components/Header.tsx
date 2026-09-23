import { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import { ChevronDown, Instagram, Menu, X, Youtube } from "lucide-react";
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
  const isDarkSurface = location === "/" || location === "/caixa-preta" || location === "/panorama" || location === "/data-lab" || location === "/sobre";
  const lightMode = isDarkSurface && !scrolled;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setOpen(false);
    setRaioxOpen(false);
    setIndustriaOpen(false);
  }, [location]);

  const raioxActive = location.startsWith("/simulador") || location === "/simuladores";
  const caixapretaActive = location === "/caixa-preta";
  const panoramaActive = location === "/panorama" || location === "/data-lab";
  const navClass = lightMode ? "cv-header-nav-light" : "cv-header-nav-dark";
  const flyoutClass = lightMode ? "cv-nav-flyout cv-nav-flyout-dark" : "cv-nav-flyout";

  return (
    <>
      <header className={`cv-site-header ${scrolled ? "is-scrolled" : ""} ${lightMode ? "is-over-dark" : ""}`}>
        <div className="cv-shell cv-header-inner">
          <Link href="/" className="cv-brand-link" aria-label="Consórcio de Verdade, início"><img src={lightMode ? LOGO.light : LOGO.dark} alt={BRAND.name} /></Link>
          <nav className={`cv-desktop-nav ${navClass}`} aria-label="Navegação principal">
            <Link href="/#hero" className={location === "/" ? "is-active" : ""}>Home</Link>
            <div className="cv-nav-group" onMouseEnter={() => setRaioxOpen(true)} onMouseLeave={() => setRaioxOpen(false)}>
              <Link href="/simuladores#hero" className={raioxActive ? "is-active" : ""}>Raio-X <ChevronDown /></Link>
              {raioxOpen && <div className={flyoutClass}>{RAIOX_SUBMENU.map((item) => <Link key={item.label} href={item.href}>{item.label}<span>→</span></Link>)}</div>}
            </div>
            <div className="cv-nav-group" onMouseEnter={() => setIndustriaOpen(true)} onMouseLeave={() => setIndustriaOpen(false)}>
              <Link href="/panorama#hero" className={panoramaActive ? "is-active" : ""}>Indústria <ChevronDown /></Link>
              {industriaOpen && <div className={flyoutClass}>{INDUSTRIA_SUBMENU.map((item) => item.isFuture ? <button key={item.label} type="button" onClick={() => alert("Em breve")} className="is-future">{item.label}<span>em breve</span></button> : <Link key={item.label} href={item.href}>{item.label}<span>→</span></Link>)}</div>}
            </div>
            <Link href="/caixa-preta#hero" className={caixapretaActive ? "is-active" : ""}>Caixa-Preta</Link>
          </nav>
          <div className={`cv-header-actions ${navClass}`}>
            <a href={BRAND.instagram} target="_blank" rel="noreferrer" aria-label="Instagram"><Instagram /></a>
            <a href={BRAND.youtube} target="_blank" rel="noreferrer" aria-label="YouTube"><Youtube /></a>
            <Link href="/sobre" aria-label="Sobre a marca"><img src={R_ICON_URL} alt="r." /></Link>
          </div>
          <button type="button" className={`cv-mobile-trigger ${lightMode ? "is-light" : ""}`} onClick={() => setOpen((value) => !value)} aria-label={open ? "Fechar menu" : "Abrir menu"}>{open ? <X /> : <Menu />}</button>
        </div>
        {open && <div className="cv-mobile-menu"><div className="cv-shell"><Link href="/#hero">Home</Link><div className="cv-mobile-group"><Link href="/simuladores#hero">Raio-X do Consórcio</Link>{RAIOX_SUBMENU.map((item) => <Link key={item.label} href={item.href}>{item.label}</Link>)}</div><div className="cv-mobile-group"><Link href="/panorama#hero">Indústria do Consórcio</Link>{INDUSTRIA_SUBMENU.map((item) => item.isFuture ? <button type="button" key={item.label} onClick={() => alert("Em breve")}>{item.label} · em breve</button> : <Link key={item.label} href={item.href}>{item.label}</Link>)}</div><Link href="/caixa-preta#hero">Caixa-Preta</Link><div className="cv-mobile-socials"><a href={BRAND.instagram} target="_blank" rel="noreferrer"><Instagram /></a><a href={BRAND.youtube} target="_blank" rel="noreferrer"><Youtube /></a><Link href="/sobre"><img src={R_ICON_URL} alt="r." /></Link></div></div></div>}
      </header>
      <div className={`cv-header-spacer ${location === "/" ? "is-home" : ""}`} aria-hidden="true" />
    </>
  );
}
