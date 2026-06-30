// Branding central do Consórcio de Verdade
// Logos hospedadas no storage do projeto (lifecycle do webdev)

export const LOGO = {
  // Logomarca oficial — fundo preto, r. branco + quadrado laranja
  light: "/manus-storage/logo-512_b615a51e.png",
  dark: "/manus-storage/logo-512_b615a51e.png",
  // Aliases para compatibilidade com código existente
  horizontalLight: "/manus-storage/logo-512_b615a51e.png",
  horizontalDark: "/manus-storage/logo-512_b615a51e.png",
  // PDF usa versão JPEG (sem transparência, fundo preto)
  official: "/manus-storage/logo-pdf_03e08f7d.jpg",
  // Ícones PWA
  icon192: "/manus-storage/logo-192_6c388de9.png",
  icon512: "/manus-storage/logo-512_b615a51e.png",
  appleTouch: "/manus-storage/apple-touch-icon_3208144c.png",
  favicon: "/manus-storage/favicon_6f80f926.ico",
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
    "Essa é uma simulação baseada em dados incluídos pelo usuário - apenas com finalidade de conhecer a dinâmica do mercado de consórcio - não deve ser vista como recomendação financeira ou promessa de contemplação.",
} as const;
