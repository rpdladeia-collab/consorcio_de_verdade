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
  icon: "/assets/icon-192.png",
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
  domain: "consorciodeverdade.com.br",
  tagline: "Dados. Matemática. Clareza.",
  instagram: "https://instagram.com/consorcio.deverdade",
  linkedin: "https://www.linkedin.com/in/renatoladeia/",
  whatsapp: "https://wa.me/5531996952204",
  email: "contato@consorciodeverdade.com.br",
  founder: "Renato",
  disclaimer:
    "Essa é uma simulação baseada em dados incluídos pelo usuário — apenas com finalidade de conhecer a dinâmica do mercado de consórcio — não deve ser vista como recomendação financeira ou promessa de contemplação.",
} as const;
