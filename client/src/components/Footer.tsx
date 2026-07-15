import { Link } from "wouter";
import { BRAND } from "@/lib/brand";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="dark bg-[var(--ink)] text-[var(--paper)] w-full max-w-[100vw] m-0 p-0 block">
      {/* Main Footer */}
      <div className="w-full px-4 md:px-5 lg:px-8 py-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          
          {/* Left Side: Logo */}
          <div className="flex items-center justify-center lg:justify-start shrink-0">
            <img src="/assets/footer-logo-new.png" alt="Consórcio de Verdade" className="w-[100px] md:w-[115px] h-auto" />
          </div>

          {/* Center: Disclaimer (White Text, Justified, -10% size) */}
          <div className="flex-1 max-w-4xl lg:px-10">
            <p className="text-[11.7px] md:text-[12.6px] text-white font-medium leading-relaxed text-justify italic opacity-80 tracking-wide">
              "{BRAND.disclaimer}"
            </p>
          </div>

          {/* Right Side: Legal Group */}
          <div className="flex flex-col sm:flex-row gap-4 text-[10px] items-center shrink-0">
            <div className="flex gap-2 items-center">
              <span className="text-white/30 font-semibold uppercase tracking-wider">Legal:</span>
              <div className="flex gap-2 text-white/70">
                <Link href="/termos" className="hover:text-[var(--orange)] transition-colors">Termos</Link>
                <span className="text-white/20">·</span>
                <Link href="/privacidade" className="hover:text-[var(--orange)] transition-colors">Privacidade</Link>
              </div>
            </div>
            <span className="text-white/25">© {year}</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
