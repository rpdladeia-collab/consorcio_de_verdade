import { Link } from "wouter";
import { Instagram, ArrowUpRight } from "lucide-react";
import { LOGO, BRAND } from "@/lib/brand";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="dark bg-[var(--ink)] text-[var(--paper)] w-full max-w-[100vw] m-0 p-0 block">
      {/* Main Footer - Ultra Compact Single Line */}
      <div className="w-full px-4 md:px-5 lg:px-8 py-3">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          
          {/* Left Side: Logo + Acompanhe */}
          <div className="flex items-center gap-4 shrink-0">
            <img src="/assets/footer-logo-new.png" alt="Consórcio de Verdade" className="w-[64px] md:w-[72px] h-auto" />
            
            <div className="h-6 w-px bg-white/10 hidden md:block"></div>
            
            {/* Acompanhe Group */}
            <div className="flex gap-2 text-[10px] items-center">
              <span className="text-white/30 font-semibold uppercase tracking-wider">Acompanhe:</span>
              <a href={BRAND.instagram} target="_blank" rel="noreferrer" aria-label="Instagram"
                className="w-4 h-4 rounded-full border border-white/15 flex items-center justify-center text-white/70 hover:text-[var(--orange)] hover:border-[var(--orange)] transition-colors">
                <Instagram className="w-2.5 h-2.5" />
              </a>
              <span className="text-white/20">·</span>
              <a href={BRAND.whatsapp} target="_blank" rel="noreferrer"
                className="inline-flex items-center gap-1 text-white/70 hover:text-[var(--orange)] transition-colors whitespace-nowrap font-medium">
                <span>Falar com Renatto</span>
                <ArrowUpRight className="w-2.5 h-2.5" />
              </a>
            </div>
          </div>

          {/* Center: Disclaimer (Yellow Text) */}
          <div className="flex-1 max-w-2xl lg:px-6">
            <p className="text-[9px] md:text-[10px] text-yellow-400 font-medium leading-tight text-center lg:text-left italic opacity-90">
              "{BRAND.disclaimer}"
            </p>
          </div>

          {/* Right Side: Legal Group */}
          <div className="flex gap-4 text-[10px] items-center shrink-0">
            <div className="flex gap-2 items-center">
              <span className="text-white/30 font-semibold uppercase tracking-wider">Legal:</span>
              <div className="flex gap-2 text-white/70">
                <Link href="/termos" className="hover:text-[var(--orange)] transition-colors">Termos</Link>
                <span className="text-white/20">·</span>
                <Link href="/privacidade" className="hover:text-[var(--orange)] transition-colors">Privacidade</Link>
              </div>
            </div>
            <div className="h-6 w-px bg-white/10 hidden md:block"></div>
            <span className="text-white/25">© {year}</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
