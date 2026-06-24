import { Link } from 'wouter';
import { Instagram, Linkedin } from 'lucide-react';

export default function Header() {
  return (
    <header className="sticky top-0 z-50 bg-background border-b border-border">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <img 
              src="/manus-storage/logo_consorcio_de_verdade_transparente_4cb863bb.png" 
              alt="Consórcio de Verdade" 
              className="h-10 w-auto"
            />
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <Link href="/" className="text-foreground hover:text-accent transition-colors font-medium">
              Home
            </Link>
            <Link href="/simuladores" className="text-foreground hover:text-accent transition-colors font-medium">
              Simuladores
            </Link>
            <Link href="/sobre" className="text-foreground hover:text-accent transition-colors font-medium">
              Sobre
            </Link>
          </nav>

          {/* Social Links */}
          <div className="flex items-center gap-4">
            <a 
              href="https://instagram.com/consorcio.deverdade" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-foreground hover:text-accent transition-colors"
              aria-label="Instagram"
            >
              <Instagram size={20} />
            </a>
            <a 
              href="https://linkedin.com/company/consorcio-de-verdade" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-foreground hover:text-accent transition-colors"
              aria-label="LinkedIn"
            >
              <Linkedin size={20} />
            </a>
          </div>
        </div>
      </div>
    </header>
  );
}
