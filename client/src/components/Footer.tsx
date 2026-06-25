import { Link } from "wouter";
import { Instagram, Linkedin, ArrowUpRight } from "lucide-react";
import { LOGO, BRAND } from "@/lib/brand";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="dark bg-[var(--ink)] text-[var(--paper)] mt-24">
      <div className="container-wide px-5 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10">
          {/* Brand */}
          <div className="md:col-span-5">
            <img src={LOGO.horizontalLight} alt={BRAND.name} className="h-10 w-auto mb-5" />
            <p className="text-sm text-white/60 max-w-sm leading-relaxed">
              Plataforma independente de inteligência sobre consórcios. Dados,
              matemática e análise sem conflito de interesse.
            </p>
            <p className="mono text-xs text-[var(--orange)] mt-5 tracking-wide">
              {BRAND.domain}
            </p>
          </div>

          {/* Navegação */}
          <div className="md:col-span-2">
            <h4 className="eyebrow text-white/40 mb-4">Plataforma</h4>
            <ul className="space-y-3 text-sm">
              <li><Link href="/" className="text-white/75 hover:text-[var(--orange)] transition-colors">Home</Link></li>
              <li><Link href="/simuladores" className="text-white/75 hover:text-[var(--orange)] transition-colors">Simuladores</Link></li>
              <li><Link href="/sobre" className="text-white/75 hover:text-[var(--orange)] transition-colors">Sobre</Link></li>
              <li><Link href="/contato" className="text-white/75 hover:text-[var(--orange)] transition-colors">Contato</Link></li>
            </ul>
          </div>

          {/* Legal */}
          <div className="md:col-span-2">
            <h4 className="eyebrow text-white/40 mb-4">Legal</h4>
            <ul className="space-y-3 text-sm">
              <li><Link href="/termos" className="text-white/75 hover:text-[var(--orange)] transition-colors">Termos de Uso</Link></li>
              <li><Link href="/privacidade" className="text-white/75 hover:text-[var(--orange)] transition-colors">Privacidade</Link></li>
            </ul>
          </div>

          {/* Social / contato */}
          <div className="md:col-span-3">
            <h4 className="eyebrow text-white/40 mb-4">Acompanhe</h4>
            <div className="flex gap-3 mb-5">
              <a href={BRAND.instagram} target="_blank" rel="noreferrer" aria-label="Instagram"
                className="w-10 h-10 rounded-full border border-white/15 flex items-center justify-center text-white/75 hover:text-[var(--orange)] hover:border-[var(--orange)] transition-colors">
                <Instagram className="w-4 h-4" />
              </a>
              <a href={BRAND.linkedin} target="_blank" rel="noreferrer" aria-label="LinkedIn"
                className="w-10 h-10 rounded-full border border-white/15 flex items-center justify-center text-white/75 hover:text-[var(--orange)] hover:border-[var(--orange)] transition-colors">
                <Linkedin className="w-4 h-4" />
              </a>
            </div>
            <a href={BRAND.whatsapp} target="_blank" rel="noreferrer"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-white/90 hover:text-[var(--orange)] transition-colors">
              Falar com o especialista
              <ArrowUpRight className="w-4 h-4" />
            </a>
          </div>
        </div>

        {/* Aviso educativo */}
        <div className="mt-14 pt-8 border-t border-white/10">
          <p className="text-xs text-white/45 leading-relaxed max-w-3xl">
            {BRAND.disclaimer}
          </p>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2 mt-6 text-xs text-white/40">
            <p>© {year} {BRAND.name}. Todos os direitos reservados.</p>
            <p className="mono">Independência · Dados · Transparência</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
