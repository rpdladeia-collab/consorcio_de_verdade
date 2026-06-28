// Branding central do Consórcio de Verdade
// Logos hospedadas no storage do projeto (lifecycle do webdev)

export const LOGO = {
  // Logo com letras BRANCAS + fundo transparente — header escuro, footer, hero escuro, seções pretas
  light: "/manus-storage/logo-light-transparent_27451430.png",
  // Logo com letras ESCURAS + fundo transparente — header claro/branco, fundos off-white, PDFs
  dark: "/manus-storage/logo-dark-transparent_4ce4b84a.png",
  // Aliases para compatibilidade com código existente
  horizontalLight: "/manus-storage/logo-light-transparent_27451430.png",
  horizontalDark: "/manus-storage/logo-dark-transparent_4ce4b84a.png",
  // PDF usa versão escura (cabeçalho branco/claro nos PDFs)
  official: "/manus-storage/logo-dark-transparent_4ce4b84a.png",
} as const;

export const BRAND = {
  name: "Consórcio de Verdade",
  domain: "consorciodeverdade.com.br",
  instagram: "https://instagram.com/consorcio.deverdade",
  linkedin: "https://www.linkedin.com/in/renatoladeia/",
  whatsapp: "https://wa.me/5531996952204",
  email: "contato@consorciodeverdade.com.br",
  founder: "Renato",
  disclaimer:
    "O Consórcio de Verdade é uma plataforma independente de informação e análise. Os conteúdos e simuladores têm caráter educativo e não constituem recomendação financeira, jurídica ou comercial.",
} as const;
