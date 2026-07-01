// Branding central do Consórcio de Verdade
// REGRA OBRIGATÓRIA — Três versões permitidas da marca:
// 1. LOGO.dark  → fundo claro/off-white: texto escuro + quadrado laranja
// 2. LOGO.light → fundo escuro/preto/grafite: texto branco + quadrado laranja
// 3. LOGO.icon  → favicon/app/símbolo compacto: fundo preto + r. branco + quadrado laranja + cantos arredondados

export const LOGO = {
  // Fundo claro (off-white, branco): texto escuro + quadrado laranja (fundo transparente)
  dark: "/manus-storage/logo-dark-transparent-v2_ddffb323.png",
  // Fundo escuro (preto, grafite): texto branco + quadrado laranja (fundo transparente)
  light: "/manus-storage/logo-light-transparent_ad34c0ca.png",
  // Ícone oficial: fundo preto + r. branco + quadrado laranja + cantos arredondados
  icon: "/manus-storage/icon-512-real_5bd00876.png",
  // Aliases para compatibilidade com componentes existentes
  horizontalDark: "/manus-storage/logo-dark-transparent-v2_ddffb323.png",
  horizontalLight: "/manus-storage/logo-light-transparent_ad34c0ca.png",
  // PDF: versão JPEG para cabeçalhos dos PDFs
  official: "/manus-storage/logo-pdf-v2_dca9a8b9.jpg",
  // Favicons
  favicon: "/manus-storage/favicon-real_1ce8d440.ico",
  favicon16: "/manus-storage/favicon-16-real_95eabd96.png",
  favicon32: "/manus-storage/favicon-32-real_73d8be5f.png",
  appleTouch: "/manus-storage/apple-touch-icon-real_39970f91.png",
  icon192: "/manus-storage/icon-192-real_f27848d5.png",
  icon512: "/manus-storage/icon-512-real_5bd00876.png",
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
