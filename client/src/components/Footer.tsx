import { Link } from "wouter";
import { Instagram, ArrowUpRight } from "lucide-react";
import { LOGO, BRAND } from "@/lib/brand";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="dark bg-[var(--ink)] text-[var(--paper)] w-full max-w-[100vw] m-0 p-0 block">
      {/* Disclaimer Section - Yellow Text on Black Background */}
      <div className="w-full px-4 md:px-5 lg:px-8 py-4 border-b border-white/10">
        <p className="text-xs text-yellow-400 font-medium leading-relaxed max-w-4xl">
          {BRAND.disclaimer}
        </p>
      </div>

      {/* Main Footer - Horizontal Compact (Corrected Layout) */}
      <div className="w-full px-4 md:px-5 lg:px-8 py-3">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          
          {/* Left Side: Logo + Acompanhe */}
          <div className="flex items-center gap-6">
            <img src="/assets/footer-logo-new.png" alt="Consórcio de Verdade" className="w-[72px] md:w-[84px] h-auto" />
            
            <div className="h-6 w-px bg-white/10 hidden md:block"></div>
            
            {/* Acompanhe Group */}
            <div className="flex gap-2 text-xs items-center">
              <span className="text-white/30 font-semibold">Acompanhe:</span>
              <a href={BRAND.instagram} target="_blank" rel="noreferrer" aria-label="Instagram"
                className="w-5 h-5 rounded-full border border-white/15 flex items-center justify-center text-white/70 hover:text-[var(--orange)] hover:border-[var(--orange)] transition-colors">
                <Instagram className="w-3 h-3" />
              </a>
              <span className="text-white/20">·</span>
              <a href={BRAND.whatsapp} target="_blank" rel="noreferrer"
                className="inline-flex items-center gap-1 text-white/70 hover:text-[var(--orange)] transition-colors whitespace-nowrap">
                <span>Falar com Renatto</span>
                <ArrowUpRight className="w-3 h-3" />
              </a>
            </div>
          </div>

          {/* Right Side: Legal Group */}
          <div className="flex gap-2 text-xs items-center">
            <span className="text-white/30 font-semibold">Legal:</span>
            <div className="flex gap-2 text-white/70">
              <Link href="/termos" className="hover:text-[var(--orange)] transition-colors">Termos</Link>
              <span className="text-white/20">·</span>
              <Link href="/privacidade" className="hover:text-[var(--orange)] transition-colors">Privacidade</Link>
            </div>
          </div>
        </div>

        {/* Copyright & Tagline */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2 mt-3 pt-3 border-t border-white/10 text-xs text-white/35">
          <p>© {year} {BRAND.name}. Todos os direitos reservados.</p>
          <p className="mono">Independência · Dados · Transparência</p>
        </div>
      </div>
    </footer>
  );
}
