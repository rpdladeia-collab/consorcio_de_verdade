// Branding central do Consórcio de Verdade
// REGRA OBRIGATÓRIA — Três versões permitidas da marca:
// 1. LOGO.dark  → fundo claro/off-white: texto escuro + quadrado laranja
// 2. LOGO.light → fundo escuro/preto/grafite: texto branco + quadrado laranja
// 3. LOGO.icon  → favicon/app/símbolo compacto: fundo preto + r. branco + quadrado laranja + cantos arredondados

export const LOGO = {
  // Fundo claro (off-white, branco): texto escuro + quadrado laranja (fundo transparente)
  dark: "/assets/logo-dark.png",
  // Fundo escuro (preto, grafite): texto branco + quadrado laranja (fundo transparente)
  light: "/assets/logo-light.png",
  // Ícone oficial: fundo preto + r. branco + quadrado laranja + cantos arredondados
  icon: "/assets/logo-dark.png",
  // Aliases para compatibilidade com componentes existentes
  horizontalDark: "/assets/logo-dark.png",
  horizontalLight: "/assets/logo-light.png",
  // PDF: versão JPEG para cabeçalhos dos PDFs
  official: "/assets/logo-dark.png",
  // Favicons
  favicon: "/assets/favicon.svg",
  favicon16: "/assets/favicon.svg",
  favicon32: "/assets/favicon.svg",
  appleTouch: "/assets/icon-192.png",
  icon192: "/assets/icon-192.png",
  icon512: "/assets/icon-192.png",
} as const;

export const BRAND = {
  name: "Consórcio de Verdade",
  logoTextSize: "text-lg md:text-xl",
  domain: "consorciodeverdade.com.br",
  tagline: "Dados. Matemática. Clareza.",
  instagram: "https://instagram.com/consorcio.deverdade",
  youtube: "https://youtube.com/@consorciodeverdade?si=LdNv-k12LI6pzUep",
  linkedin: "https://www.linkedin.com/in/renatoladeia/",
  whatsapp: "https://wa.me/5531996952204",
  email: "contato@consorciodeverdade.com.br",
  founder: "Renato",
  disclaimer:
    "As informações, análises e ferramentas disponibilizadas neste site possuem caráter exclusivamente informativo e educacional. Os cálculos são baseados em parâmetros informados pelo usuário, não constituindo recomendação financeira, oferta de investimento ou garantia de contemplação futura.",
} as const;
