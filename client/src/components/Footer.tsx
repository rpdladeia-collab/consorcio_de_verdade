import { Link } from "wouter";
import { Instagram, Linkedin, ArrowUpRight } from "lucide-react";
import { LOGO, BRAND } from "@/lib/brand";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="dark bg-[var(--ink)] text-[var(--paper)] w-full max-w-[100vw]">
      <div className="w-full px-4 md:px-5 lg:px-8 py-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-12 gap-6">
          {/* Brand */}
          <div className="md:col-span-5">
            <img src="/assets/logo-renatto.png" alt="r.enatto" className="h-9 w-auto mb-3" />
            <p className="text-xs text-white/60 max-w-sm leading-relaxed">
              Plataforma de simulação e análise de consórcios. Dados, matemática
              e clareza para você decidir com consciência.
            </p>
            <p className="text-xs text-[var(--orange)] mt-3 tracking-wide font-mono">
              {BRAND.domain}
            </p>
          </div>

          {/* Navegação */}
          <div className="md:col-span-2">
            <h4 className="eyebrow text-white/40 mb-2">Plataforma</h4>
            <ul className="space-y-2 text-xs">
              <li><Link href="/" className="text-white/75 hover:text-[var(--orange)] transition-colors">Home</Link></li>
              <li><Link href="/simuladores" className="text-white/75 hover:text-[var(--orange)] transition-colors">Simuladores</Link></li>
              <li><Link href="/sobre" className="text-white/75 hover:text-[var(--orange)] transition-colors">Sobre</Link></li>
              <li><Link href="/contato" className="text-white/75 hover:text-[var(--orange)] transition-colors">Contato</Link></li>
            </ul>
          </div>

          {/* Legal */}
          <div className="md:col-span-2">
            <h4 className="eyebrow text-white/40 mb-2">Legal</h4>
            <ul className="space-y-2 text-xs">
              <li><Link href="/termos" className="text-white/75 hover:text-[var(--orange)] transition-colors">Termos de Uso</Link></li>
              <li><Link href="/privacidade" className="text-white/75 hover:text-[var(--orange)] transition-colors">Privacidade</Link></li>
            </ul>
          </div>

          {/* Social / contato */}
          <div className="md:col-span-3">
            <h4 className="eyebrow text-white/40 mb-2">Acompanhe</h4>
            <div className="flex gap-2 mb-3">
              <a href={BRAND.instagram} target="_blank" rel="noreferrer" aria-label="Instagram"
                className="w-8 h-8 rounded-full border border-white/15 flex items-center justify-center text-white/75 hover:text-[var(--orange)] hover:border-[var(--orange)] transition-colors">
                <Instagram className="w-4 h-4" />
              </a>
              <a href={BRAND.linkedin} target="_blank" rel="noreferrer" aria-label="LinkedIn"
                className="w-8 h-8 rounded-full border border-white/15 flex items-center justify-center text-white/75 hover:text-[var(--orange)] hover:border-[var(--orange)] transition-colors">
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
        <div className="mt-6 pt-5 border-t border-white/10">
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
