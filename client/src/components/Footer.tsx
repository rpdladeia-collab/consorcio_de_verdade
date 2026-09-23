import { Link } from "wouter";
import { BRAND } from "@/lib/brand";

export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="cv-site-footer">
      <div className="cv-shell">
        <div className="cv-footer-top"><img src="/assets/footer-logo-new.png" alt="Consórcio de Verdade" /><span className="cv-footer-rule" /><p>{BRAND.disclaimer}</p></div>
        <div className="cv-footer-bottom"><span>© {year} · Consórcio de Verdade</span><div><Link href="/termos">Termos</Link><Link href="/privacidade">Privacidade</Link></div><span className="cv-footer-signature">examinar · simular · comparar · revelar</span></div>
      </div>
    </footer>
  );
}
