/**
 * Ícone estilizado "r." — segue o mesmo padrão visual dos ícones lucide-react
 * (stroke 2, viewBox 24x24, strokeLinecap round, strokeLinejoin round)
 * Representa a marca "r." do Consórcio de Verdade:
 * letra r em minúscula + ponto laranja forte
 */
export default function RIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {/* Letra "r" estilizada — traço descendente + arco + perna */}
      <path d="M7 20 V10 a4 4 0 0 1 8 0 v10" />
      <path d="M7 14 a4 4 0 0 1 8 0" />
      {/* Ponto após o r */}
      <circle cx="19" cy="18" r="1.5" fill="currentColor" stroke="none" />
    </svg>
  );
}
