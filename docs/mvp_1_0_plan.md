# Plano Técnico para o MVP 1.0 da Plataforma Consórcio de Verdade (Versão Final)

Este documento detalha o plano técnico final para a implementação do MVP 1.0 da plataforma Consórcio de Verdade, incorporando todas as diretrizes estratégicas e funcionais. O objetivo é entregar uma plataforma coesa, com todos os simuladores existentes sob o novo padrão visual e estrutural de auditoria, garantindo a proteção da lógica matemática no backend, uma experiência de usuário consistente e responsiva, e uma forte identidade institucional.

## 1. Lista Completa dos Simuladores para o MVP 1.0

Conforme o escopo revisado, todos os simuladores existentes serão implementados no MVP 1.0:

| Simulador                 | Descrição                                                                                             | Status da Lógica Backend | Endpoint Proposto (`/api/consorcio/...`) |
| :------------------------ | :---------------------------------------------------------------------------------------------------- | :----------------------- | :--------------------------------------- |
| **Lance Embutido**        | Calcula o impacto do lance embutido no crédito líquido e na eficiência econômica.                      | Lógica Extraída          | `/raio-x`                                |
| **Zona de Contemplação**  | Diagnostica a saúde do grupo e a probabilidade de contemplação.                                       | Lógica Extraída          | `/zona`                                  |
| **Lance Livre**           | Analisa cenários de lance livre.                                                                      | A Desenvolver            | `/lance-livre`                           |
| **Lance Fixo**            | Avalia a estratégia de lance fixo.                                                                    | A Desenvolver            | `/lance-fixo`                            |
| **Saúde do Grupo**        | Avalia a saúde financeira e operacional de um grupo de consórcio.                                     | A Desenvolver            | `/saude-grupo`                           |
| **Exclusão**              | Calcula o valor a ser restituído em caso de exclusão do consórcio.                                   | A Desenvolver            | `/exclusao`                              |
| **Consórcio x Financiamento** | Compara a viabilidade econômica entre consórcio e financiamento.                                      | A Desenvolver            | `/comparativo-financiamento`             |
| **Consórcio x Investimentos** | Compara o consórcio com outras opções de investimento.                                                | A Desenvolver            | `/comparativo-investimentos`             |
| **Eficiência Econômica**  | Avalia a eficiência econômica de um consórcio.                                                       | A Desenvolver            | `/eficiencia-economica`                  |
| **Diagnóstico de Propostas** | Analisa e diagnostica a viabilidade e os riscos de uma proposta de consórcio.                         | A Desenvolver            | `/diagnostico-propostas`                 |

**Observação:** Para os simuladores com status "A Desenvolver", a lógica matemática será implementada em Route Handlers TypeScript no backend, seguindo o mesmo padrão de proteção de propriedade intelectual já estabelecido para o Lance Embutido e Zona de Contemplação.

## 2. Componentes Reutilizáveis

Para garantir consistência visual, agilidade no desenvolvimento e facilidade de manutenção, serão criados os seguintes componentes reutilizáveis, baseados no Design System e Manual Visual:

*   **Header Padrão:** Com a nova logomarca, navegação principal (Home, Central de Simuladores) e links para redes sociais (Instagram, LinkedIn).
*   **Footer Institucional:** Com logomarca, domínio, links para Simuladores, Sobre, Contato, Termos de Uso, Política de Privacidade, redes sociais e aviso educativo.
*   **Card de Simulador (Central):** Componente para exibir cada simulador na Central, com título, breve descrição e link.
*   **Hero de Página de Simulador:** Título central, subtítulo e área para a pergunta principal.
*   **Formulário de Entrada de Dados (Simples):** Componente genérico para campos de input (texto, número, percentual) com validação básica e opção "Usar dados da análise anterior" quando aplicável.
*   **Botão de Ação (Calcular, Gerar PDF):** Componente para CTAs primários e secundários.
*   **Card de Diagnóstico Executivo:** Para exibir o veredito (🟢/🟠/🔴) e a conclusão narrativa.
*   **Card de Resultado Interpretado:** Para exibir KPIs humanizados e suas explicações.
*   **Bloco "O que isso significa":** Componente para explicações detalhadas e contextualizadas.
*   **Simulador Avançado (Acordeão/Collapse):** Componente para ocultar/exibir campos adicionais e memória de cálculo.
*   **Área de Vídeo:** Componente para incorporar vídeos explicativos.
*   **Botão Gerar PDF:** Componente padronizado para acionar a geração do Relatório de Auditoria.
*   **Bloco de Fontes e Metodologia:** Componente para exibir a transparência dos cálculos e referências.
*   **Componentes de Tipografia:** Estilos padronizados para títulos (H1, H2, H3), parágrafos, destaques, etc.
*   **Paleta de Cores:** Variáveis CSS/Tailwind para as cores preto, branco/off-white e laranja estratégico.
*   **Botões de Compartilhamento:** Para relatórios ou simuladores.

## 3. Ordem de Desenvolvimento Recomendada

A ordem de desenvolvimento visa construir a base da plataforma e, em seguida, integrar os simuladores de forma eficiente, priorizando aqueles com lógica já extraída e, posteriormente, os que necessitam de desenvolvimento de backend.

1.  **Configuração do Projeto e Design System:**
    *   Configuração do Next.js, Tailwind CSS, TypeScript e Jest (já feito na Fase 0).
    *   Implementação do Header e Footer padrão, incluindo logomarca, navegação e links para redes sociais.
    *   Criação dos componentes básicos do Design System (tipografia, paleta de cores, botões, formulários).
2.  **Home Page, Central de Simuladores e Página "Sobre":**
    *   Implementação da Home Page simples e profissional.
    *   Criação da Central de Simuladores, utilizando o `Card de Simulador` reutilizável.
    *   Implementação da página "Sobre" com o conteúdo institucional definido.
3.  **Simulador de Lance Embutido (Modelo) com Sessão de Análise:**
    *   Implementação completa da página de Lance Embutido, servindo como modelo visual e estrutural para os demais.
    *   Integração com o Route Handler `/api/consorcio/raio-x`.
    *   Implementação da funcionalidade "Usar dados da análise anterior" para simuladores relacionados.
    *   Implementação da geração de PDF (Relatório de Auditoria).
4.  **Simulador de Zona de Contemplação com Sessão de Análise:**
    *   Implementação completa da página de Zona de Contemplação, seguindo o padrão do Lance Embutido.
    *   Integração com o Route Handler `/api/consorcio/zona`.
    *   Implementação da funcionalidade "Usar dados da análise anterior" para simuladores relacionados.
    *   Implementação da geração de PDF.
5.  **Desenvolvimento e Implementação dos Simuladores Restantes:**
    *   Para cada simulador restante ("Lance Livre", "Lance Fixo", "Saúde do Grupo", "Exclusão", "Consórcio x Financiamento", "Consórcio x Investimentos", "Eficiência Econômica", "Diagnóstico de Propostas"):
        *   Desenvolvimento da lógica matemática no backend (Route Handler TypeScript).
        *   Criação de testes Jest para a nova lógica.
        *   Implementação da interface de usuário, reutilizando os componentes existentes.
        *   Integração com o respectivo Route Handler.
        *   Implementação da funcionalidade "Usar dados da análise anterior" quando aplicável.
        *   Implementação da geração de PDF.

## 4. Critério Funcional de Conclusão de Cada Simulador

Nenhum simulador será considerado pronto se não atender a estes critérios, garantindo uma experiência de usuário superior e a credibilidade da plataforma:

*   **Usabilidade para Leigos:** Um usuário leigo consegue usar o simulador sem treinamento prévio, com preenchimento intuitivo e linguagem não técnica.
*   **Compreensão Rápida do Resultado:** O resultado principal é compreendido rapidamente, sem a necessidade de conhecimento técnico aprofundado.
*   **Diagnóstico Objetivo:** O diagnóstico responde objetivamente à dúvida principal do usuário, com clareza e sem ambiguidades.
*   **PDF Claro e Independente:** O "Relatório de Auditoria Independente" em PDF é claro o suficiente para ser entendido por terceiros, reforçando a transparência e a autoridade da plataforma.
*   **Funcionalidade:** A lógica matemática no backend está implementada e testada, e o simulador retorna resultados corretos.
*   **Interface de Usuário:** A página segue o padrão visual e estrutural definido (pergunta central, modo simples, resultado interpretado, diagnóstico executivo, modo avançado recolhido, memória de cálculo, áreas para PDF e vídeo, fontes e metodologia).
*   **Responsividade:** A página é totalmente responsiva e funcional em dispositivos móveis e desktop.
*   **Integração Backend:** O simulador se comunica corretamente com seu Route Handler correspondente.
*   **Geração de PDF:** O botão de PDF gera um "Relatório de Auditoria Independente" com os dados da simulação.
*   **Consistência Visual:** Todos os componentes utilizados estão alinhados com o Design System e a identidade visual da marca (nova logomarca, paleta de cores, tipografia).

## 5. Estrutura Padrão de Resultado para Todos os Simuladores

Todos os simuladores devem apresentar os resultados na seguinte ordem, para garantir consistência e clareza na interpretação:

1.  **Resultado Principal:** O dado mais relevante e impactante para a dúvida do usuário.
2.  **Diagnóstico Executivo:** O veredito (🟢/🟠/🔴) e a conclusão narrativa que responde à pergunta central.
3.  **O que isso significa:** Uma explicação humanizada do resultado e do diagnóstico.
4.  **Pontos Positivos:** Aspectos favoráveis da análise.
5.  **Pontos de Atenção:** Riscos, limitações ou considerações importantes.
6.  **Memória de Cálculo:** Detalhamento dos cálculos realizados (recolhido por padrão no modo simples).
7.  **Fontes e Metodologia:** Transparência sobre as bases dos cálculos e informações.
8.  **Relatório de Auditoria Independente em PDF:** Botão para gerar o documento completo.

## 6. Identidade Institucional e Contato

O domínio oficial do projeto será `consorciodeverdade.com.br`. A plataforma conterá uma área institucional clara, mas discreta, que reforça a credibilidade e a acessibilidade:

*   **Página "Sobre":** Conforme detalhado na Seção 7.
*   **Apresentação do Projeto:** Breve descrição da missão e visão do Consórcio de Verdade.
*   **Apresentação Pessoal do Fundador:** Nome, foto profissional, link para LinkedIn.
*   **Botão de Contato:** Direcionando para WhatsApp ou formulário de contato.
*   **E-mail Profissional:** `contato@consorciodeverdade.com.br` (exemplo).

## 7. Página "Sobre"

A página "Sobre" será um pilar da identidade institucional, com um tom profissional, humano e independente.

*   **Conteúdo:**
    *   **Por que o Consórcio de Verdade existe:** A motivação por trás da plataforma.
    *   **Declaração de Independência:** Reforçando que a plataforma não vende consórcios e não tem vínculos comerciais.
    *   **Proposta de Valor:** Detalhando a oferta de dados, matemática, simuladores e análises independentes.
    *   **Quem é o Fundador:** Apresentação do fundador, sua experiência no mercado financeiro e sua paixão por transparência.
    *   **Compromisso:** Reafirmação do compromisso com a transparência, educação e empoderamento do consumidor.

## 8. Rodapé Institucional

Todas as páginas terão um rodapé consistente e informativo:

*   **Logomarca:** Nova logomarca oficial.
*   **Domínio:** `consorciodeverdade.com.br`.
*   **Links Essenciais:** Simuladores, Sobre, Contato, Termos de Uso e Política de Privacidade.
*   **Redes Sociais:** Ícones para Instagram, LinkedIn (e futura possibilidade de YouTube).
*   **Aviso Educativo:** Conforme Seção 9.

## 9. Aviso Padrão (Educativo)

Um aviso institucional será incluído em local discreto, mas visível, em todas as páginas:

> "O Consórcio de Verdade é uma plataforma independente de informação e análise. Os conteúdos e simuladores têm caráter educativo e não constituem recomendação financeira, jurídica ou comercial."

## 10. Integração com Redes Sociais

A integração com redes sociais será estratégica para disseminar o conteúdo e a missão da plataforma:

*   **Header/Footer/Área Institucional:** Ícones para Instagram oficial e LinkedIn.
*   **Compartilhamento:** Botões de compartilhamento para os relatórios de auditoria e páginas de simuladores, facilitando a disseminação de informações relevantes.
*   **Futuro:** Preparação para integração com YouTube para vídeos explicativos e análises.

## 11. Critério de Sucesso do MVP 1.0

O MVP 1.0 será considerado um sucesso quando:

*   O usuário conseguir acessar a Home Page e navegar para a Central de Simuladores.
*   A Central de Simuladores exibir todos os simuladores listados na Seção 1.
*   O usuário conseguir escolher **qualquer simulador existente**, preencher os dados de entrada (com a opção de "Usar dados da análise anterior" quando aplicável), e o sistema calcular e exibir um resultado claro, interpretado e responsivo, seguindo a `Estrutura Padrão de Resultado`.
*   Todos os simuladores apresentarem o **diagnóstico executivo** e o **resultado interpretado** de forma consistente e compreensível para um usuário leigo.
*   A nova logomarca estiver presente em todas as telas e o design geral estiver alinhado com a identidade visual (preto, branco/off-white, laranja estratégico).
*   A lógica matemática de todos os simuladores estiver protegida no backend (Route Handlers).
*   A plataforma for totalmente responsiva para celular e desktop.
*   A página "Sobre" e a área institucional estiverem implementadas, comunicando a missão e a independência da plataforma.
*   O rodapé institucional e o aviso padrão estiverem presentes em todas as páginas.
*   Os botões de compartilhamento de redes sociais estiverem funcionais.
