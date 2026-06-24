import { Link } from 'wouter';
import { Instagram, Linkedin } from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-card border-t border-border mt-16">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div className="col-span-1">
            <img 
              src="/manus-storage/logo_consorcio_de_verdade_transparente_4cb863bb.png" 
              alt="Consórcio de Verdade" 
              className="h-8 w-auto mb-4"
            />
            <p className="text-sm text-muted-foreground">
              consorciodeverdade.com.br
            </p>
          </div>

          {/* Navigation */}
          <div>
            <h4 className="font-semibold mb-4 text-foreground">Navegação</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/" className="text-muted-foreground hover:text-accent transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/simuladores" className="text-muted-foreground hover:text-accent transition-colors">
                  Simuladores
                </Link>
              </li>
              <li>
                <Link href="/sobre" className="text-muted-foreground hover:text-accent transition-colors">
                  Sobre
                </Link>
              </li>
              <li>
                <Link href="/contato" className="text-muted-foreground hover:text-accent transition-colors">
                  Contato
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-semibold mb-4 text-foreground">Legal</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/termos" className="text-muted-foreground hover:text-accent transition-colors">
                  Termos de Uso
                </Link>
              </li>
              <li>
                <Link href="/privacidade" className="text-muted-foreground hover:text-accent transition-colors">
                  Política de Privacidade
                </Link>
              </li>
            </ul>
          </div>

          {/* Social */}
          <div>
            <h4 className="font-semibold mb-4 text-foreground">Redes Sociais</h4>
            <div className="flex gap-4">
              <a 
                href="https://instagram.com/consorcio.deverdade" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-accent transition-colors"
                aria-label="Instagram"
              >
                <Instagram size={20} />
              </a>
              <a 
                href="https://linkedin.com/company/consorcio-de-verdade" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-accent transition-colors"
                aria-label="LinkedIn"
              >
                <Linkedin size={20} />
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-border pt-8">
          <div className="bg-muted/50 rounded-lg p-4 mb-6 text-sm text-muted-foreground">
            <p>
              <strong>Aviso Educativo:</strong> O Consórcio de Verdade é uma plataforma independente de informação e análise. Os conteúdos e simuladores têm caráter educativo e não constituem recomendação financeira, jurídica ou comercial.
            </p>
          </div>

          <div className="flex flex-col md:flex-row justify-between items-center text-sm text-muted-foreground">
            <p>&copy; {currentYear} Consórcio de Verdade. Todos os direitos reservados.</p>
            <p>Desenvolvido com transparência e dados</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
