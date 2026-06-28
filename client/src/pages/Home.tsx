import { Link } from "wouter";
import { ArrowRight, BarChart2, Search, TrendingUp, Calculator, Clock, Zap, ChevronRight } from "lucide-react";
import { BRAND } from "@/lib/brand";
import { useState } from "react";

// Módulos do Raio-X
const MODULOS = [
  {
    id: 1,
    icon: <Calculator className="w-5 h-5" />,
    title: "Raio-X da Parcela",
    desc: "Gera o fluxo mensal completo com parcela linear ou não linear, reajustes e seguro.",
    href: "/simulador/simule-seu-plano",
  },
  {
    id: 2,
    icon: <TrendingUp className="w-5 h-5" />,
    title: "Raio-X do Lance",
    desc: "Projeta o impacto financeiro da contemplação em diferentes momentos do plano.",
    href: "/simulador/contemplacao",
  },
  {
    id: 3,
    icon: <BarChart2 className="w-5 h-5" />,
    title: "Raio-X do Custo Total",
    desc: "Calcula o custo real do consórcio: taxa de administração, seguro e fundo de reserva.",
    href: "/simulador/custo-da-operacao",
  },
  {
    id: 4,
    icon: <Search className="w-5 h-5" />,
    title: "Raio-X da Eficiência da Taxa",
    desc: "Mostra quanto da parcela é taxa e como isso degrada a eficiência ao longo do tempo.",
    href: "/simulador/proporcao-da-taxa",
  },
  {
    id: 5,
    icon: <Clock className="w-5 h-5" />,
    title: "Raio-X das Correções",
    desc: "Analisa o impacto dos reajustes históricos sobre o saldo devedor e a carta de crédito.",
    href: "/simulador/historico-de-correcoes",
  },
  {
    id: 6,
    icon: <Zap className="w-5 h-5" />,
    title: "Auto pagável?",
    desc: "Verifica se a carta de crédito é capaz de se pagar com rendimento após a contemplação.",
    href: "/simulador/auto-pagavel",
  },
];

// Assuntos do formulário de contato
const ASSUNTOS = ["Dúvida", "Segunda Opinião", "Quero Contratar"];

export default function Home() {
  const [form, setForm] = useState({
    nome: "",
    contato: "",
    assunto: "",
    mensagem: "",
  });
  const [enviado, setEnviado] = useState(false);
  const [enviando, setEnviando] = useState(false);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.nome || !form.contato || !form.assunto || !form.mensagem) return;
    setEnviando(true);
    // Envia via WhatsApp como fallback seguro (sem backend de e-mail)
    const numero = BRAND.whatsapp.replace("https://wa.me/", "");
    const texto = encodeURIComponent(
      `*Contato via Consórcio de Verdade*\n\n*Nome:* ${form.nome}\n*Contato:* ${form.contato}\n*Assunto:* ${form.assunto}\n\n${form.mensagem}`
    );
    window.open(`https://wa.me/${numero}?text=${texto}`, "_blank");
    setEnviando(false);
    setEnviado(true);
  }

  return (
    <main className="w-full overflow-x-hidden">

      {/* ─── HERO ─────────────────────────────────────────────────── */}
      <section className="w-full bg-[var(--paper)] pt-12 pb-16 px-4 md:px-8">
        <div className="max-w-3xl mx-auto">
          {/* Badge — alinhado à esquerda */}
          <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--orange)]/30 bg-[var(--orange)]/8 px-4 py-1.5 text-xs font-semibold text-[var(--orange)] mb-8 tracking-wide">
            Consórcio não é para todo mundo
          </span>

          {/* Título */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-[var(--ink)] leading-[1.05] tracking-tight mb-6">
            Antes de contratar um consórcio,{" "}
            <span className="text-[var(--orange)]">faça a conta.</span>
          </h1>

          {/* Subtítulo — texto exato aprovado */}
          <p className="text-base sm:text-lg text-foreground/75 leading-relaxed max-w-2xl mb-10">
            O mercado de consórcios bate recordes de vendas todos os anos. As análises históricas do Banco Central mostram o outro lado: quase 50% das cotas <strong>NÃO consegue adquirir o bem desejado</strong>. Esta plataforma foi criada para que você compreenda cada cálculo, simule diferentes cenários e tome uma decisão consciente antes de contratar.
          </p>

          {/* Botões */}
          <div className="flex flex-col sm:flex-row items-start gap-4 mb-6">
            <Link
              href="/simuladores"
              className="inline-flex items-center gap-2 rounded-full bg-[var(--orange)] text-white px-8 py-3.5 text-sm font-semibold transition-transform hover:scale-[1.02] active:scale-[0.97] w-full sm:w-auto justify-center"
            >
              Acessar simuladores
              <ArrowRight className="w-4 h-4" />
            </Link>
            <a
              href={BRAND.whatsapp}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-[var(--ink)]/20 bg-white text-[var(--ink)] px-8 py-3.5 text-sm font-semibold transition-transform hover:scale-[1.02] active:scale-[0.97] w-full sm:w-auto justify-center"
            >
              Falar com especialista
            </a>
          </div>

          {/* Disclaimer — contraste corrigido */}
          <p className="text-xs text-gray-600 mt-2">
            Use gratuitamente. Sem cadastro obrigatório. Cálculos auditáveis.
          </p>
        </div>
      </section>

      {/* ─── SEÇÃO SIMULADORES (Raio-X) ─────────────────────────── */}
      <section className="w-full bg-[var(--ink)] py-14 px-4 md:px-8">
        <div className="max-w-5xl mx-auto">
          <p className="eyebrow text-[var(--orange)] mb-4">RAIO X DO CONSÓRCIO</p>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white leading-tight mb-4 max-w-3xl">
            Se você não entende estes pontos, não contrate ainda.
          </h2>
          <p className="text-white/60 text-base leading-relaxed max-w-2xl mb-12">
            O Raio-X do Consórcio reúne <strong className="text-white">todos os módulos essenciais</strong> para analisar uma proposta antes da contratação. Ele mostra fluxo de parcelas, contemplação, custo real, proporção da taxa, correções e viabilidade <strong className="text-[var(--orange)]">E MUITO MAIS ...</strong>
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {MODULOS.map((m) => (
              <Link
                key={m.id}
                href={m.href}
                className="group flex flex-col gap-3 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 hover:border-[var(--orange)]/40 p-5 transition-all duration-200"
              >
                <div className="flex items-center gap-3">
                  <span className="flex items-center justify-center w-9 h-9 rounded-lg bg-[var(--orange)]/15 text-[var(--orange)]">
                    {m.icon}
                  </span>
                  <span className="text-xs font-mono text-white/30 uppercase tracking-widest">
                    Módulo {m.id}
                  </span>
                </div>
                <p className="text-base font-bold text-white group-hover:text-[var(--orange)] transition-colors">
                  {m.title}
                </p>
                <p className="text-sm text-white/55 leading-relaxed">{m.desc}</p>
                <span className="mt-auto flex items-center gap-1 text-xs font-semibold text-[var(--orange)] opacity-0 group-hover:opacity-100 transition-opacity">
                  Abrir módulo <ChevronRight className="w-3.5 h-3.5" />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ─── BLOCO ZONA DE CONTEMPLAÇÃO ───────────────────────────── */}
      <section className="w-full bg-white py-20 px-4 md:px-8 border-b border-border">
        <div className="max-w-5xl mx-auto flex flex-col lg:flex-row items-start lg:items-center gap-10">
          <div className="flex-1">
            <p className="eyebrow text-[var(--orange)] mb-3">ZONA DE CONTEMPLAÇÃO</p>
            <h2 className="text-2xl sm:text-3xl font-black text-[var(--ink)] leading-tight mb-4">
              Entenda a dinâmica do grupo antes de definir sua estratégia de lance.
            </h2>
            <p className="text-foreground/65 text-base leading-relaxed max-w-xl">
              A Zona de Raio-X do Lance permite analisar histórico de lances, pressão competitiva e quantitativo de contemplações de um grupo. O objetivo é entender a dinâmica do grupo antes de definir uma estratégia de lance.
            </p>
          </div>
          <div className="shrink-0">
            <Link
              href="/zona-contemplacao"
              className="inline-flex items-center gap-2 rounded-full bg-[var(--orange)] text-white px-7 py-3.5 text-sm font-semibold transition-transform hover:scale-[1.02] active:scale-[0.97]"
            >
              Abrir Zona de Raio-X do Lance
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ─── BLOCO PANORAMA: DADOS OFICIAIS ───────────────────────── */}
      <section className="w-full bg-[var(--paper)] py-20 px-4 md:px-8 border-b border-border">
        <div className="max-w-5xl mx-auto flex flex-col lg:flex-row items-start lg:items-center gap-10">
          <div className="flex-1">
            <p className="eyebrow text-[var(--orange)] mb-3">PANORAMA: DADOS OFICIAIS</p>
            <h2 className="text-2xl sm:text-3xl font-black text-[var(--ink)] leading-tight mb-4">
              Não é opinião. É o dado oficial.
            </h2>
            <p className="text-foreground/65 text-base leading-relaxed max-w-xl">
              O Panorama reúne dados oficiais para contextualizar o mercado de consórcios: vendas, exclusões, reclamações, contemplações e indicadores relevantes. Apenas dados validados do Banco Central.
            </p>
          </div>
          <div className="shrink-0">
            <Link
              href="/panorama"
              className="inline-flex items-center gap-2 rounded-full bg-[var(--ink)] text-[var(--paper)] px-7 py-3.5 text-sm font-semibold transition-transform hover:scale-[1.02] active:scale-[0.97]"
            >
              Ver dados oficiais
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ─── BLOCO POSICIONAMENTO (antigo "Por que existimos") ────── */}
      <section className="w-full bg-[var(--ink)] py-20 px-4 md:px-8 border-b border-white/10">
        <div className="max-w-3xl mx-auto text-center">
          <p className="eyebrow text-[var(--orange)] mb-4">NOSSO COMPROMISSO</p>
          <h2 className="text-2xl sm:text-3xl font-black text-white leading-tight mb-6">
            Consórcio vendido com análise, transparência e responsabilidade.
          </h2>
          <p className="text-white/65 text-base leading-relaxed mb-4">
            Nós acreditamos na venda consultiva. Nosso compromisso é com a matemática e com a sua decisão. Mostramos os números que o mercado esconde para que você compre com segurança.
          </p>
          <p className="text-white/65 text-base leading-relaxed">
            O consórcio é um produto legítimo. O problema não é o produto — é a venda feita sem análise, sem transparência e sem respeito ao comprador.
          </p>
        </div>
      </section>

      {/* ─── BLOCO SOBRE ──────────────────────────────────────────── */}
      <section className="w-full bg-[var(--paper)] py-20 px-4 md:px-8 border-b border-border">
        <div className="max-w-5xl mx-auto flex flex-col lg:flex-row items-start lg:items-center gap-10">
          <div className="flex-1">
            <p className="eyebrow text-[var(--orange)] mb-3">SOBRE</p>
            <h2 className="text-2xl sm:text-3xl font-black text-[var(--ink)] leading-tight mb-4">
              Vender consórcio da forma correta.
            </h2>
            <p className="text-foreground/65 text-base leading-relaxed max-w-xl">
              O Consórcio de Verdade foi criado para vender consórcio da forma correta: com análise, transparência e decisão consciente antes da contratação.
            </p>
          </div>
          <div className="shrink-0">
            <Link
              href="/sobre"
              className="inline-flex items-center gap-2 rounded-full border border-[var(--ink)]/20 bg-transparent text-[var(--ink)] px-7 py-3.5 text-sm font-semibold transition-transform hover:scale-[1.02] active:scale-[0.97]"
            >
              Conhecer o projeto
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ─── CTA FINAL (antigo bloco laranja) ─────────────────────── */}
      <section className="w-full bg-[var(--orange)] py-20 px-4 md:px-8">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl sm:text-3xl font-black text-white leading-tight mb-4">
            Use os simuladores à vontade.
          </h2>
          <p className="text-white/85 text-base leading-relaxed mb-8 max-w-xl mx-auto">
            Se quiser, traga sua proposta para uma segunda opinião ou construa o seu plano com quem joga limpo.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/simuladores"
              className="inline-flex items-center gap-2 rounded-full bg-white text-[var(--orange)] px-8 py-3.5 text-sm font-semibold transition-transform hover:scale-[1.02] active:scale-[0.97] w-full sm:w-auto justify-center"
            >
              Acessar simuladores
              <ArrowRight className="w-4 h-4" />
            </Link>
            <a
              href={BRAND.whatsapp}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-full border-2 border-white/60 text-white px-8 py-3.5 text-sm font-semibold transition-transform hover:scale-[1.02] active:scale-[0.97] w-full sm:w-auto justify-center"
            >
              Falar com especialista
            </a>
          </div>
        </div>
      </section>

      {/* ─── FORMULÁRIO DE CONTATO ────────────────────────────────── */}
      <section className="w-full bg-[var(--paper)] py-20 px-4 md:px-8 border-t border-border" id="contato">
        <div className="max-w-2xl mx-auto">
          <p className="eyebrow text-[var(--orange)] mb-3">CONTATO</p>
          <h2 className="text-2xl sm:text-3xl font-black text-[var(--ink)] leading-tight mb-2">
            Envie sua mensagem.
          </h2>
          <p className="text-foreground/60 text-sm mb-10">
            Dúvida, segunda opinião ou interesse em contratar — respondo pessoalmente.
          </p>

          {enviado ? (
            <div className="rounded-xl border border-[var(--orange)]/30 bg-[var(--orange)]/8 p-8 text-center">
              <p className="text-lg font-bold text-[var(--ink)] mb-2">Mensagem enviada!</p>
              <p className="text-foreground/60 text-sm">Você será redirecionado para o WhatsApp para concluir o envio.</p>
              <button
                onClick={() => { setEnviado(false); setForm({ nome: "", contato: "", assunto: "", mensagem: "" }); }}
                className="mt-6 text-sm text-[var(--orange)] underline underline-offset-4"
              >
                Enviar outra mensagem
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="nome" className="text-xs font-semibold text-foreground/70 uppercase tracking-wider">
                    Nome
                  </label>
                  <input
                    id="nome"
                    name="nome"
                    type="text"
                    required
                    placeholder="Seu nome completo"
                    value={form.nome}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-border bg-white px-4 py-3 text-sm text-[var(--ink)] placeholder:text-foreground/35 focus:outline-none focus:ring-2 focus:ring-[var(--orange)]/40 transition"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="contato" className="text-xs font-semibold text-foreground/70 uppercase tracking-wider">
                    WhatsApp ou E-mail
                  </label>
                  <input
                    id="contato"
                    name="contato"
                    type="text"
                    required
                    placeholder="(11) 99999-9999 ou email@exemplo.com"
                    value={form.contato}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-border bg-white px-4 py-3 text-sm text-[var(--ink)] placeholder:text-foreground/35 focus:outline-none focus:ring-2 focus:ring-[var(--orange)]/40 transition"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label htmlFor="assunto" className="text-xs font-semibold text-foreground/70 uppercase tracking-wider">
                  Assunto
                </label>
                <select
                  id="assunto"
                  name="assunto"
                  required
                  value={form.assunto}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-border bg-white px-4 py-3 text-sm text-[var(--ink)] focus:outline-none focus:ring-2 focus:ring-[var(--orange)]/40 transition appearance-none cursor-pointer"
                >
                  <option value="">Selecione o assunto</option>
                  {ASSUNTOS.map((a) => (
                    <option key={a} value={a}>{a}</option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label htmlFor="mensagem" className="text-xs font-semibold text-foreground/70 uppercase tracking-wider">
                  Mensagem
                </label>
                <textarea
                  id="mensagem"
                  name="mensagem"
                  required
                  rows={5}
                  placeholder="Descreva sua dúvida, proposta ou situação..."
                  value={form.mensagem}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-border bg-white px-4 py-3 text-sm text-[var(--ink)] placeholder:text-foreground/35 focus:outline-none focus:ring-2 focus:ring-[var(--orange)]/40 transition resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={enviando}
                className="self-start inline-flex items-center gap-2 rounded-full bg-[var(--ink)] text-[var(--paper)] px-8 py-3.5 text-sm font-semibold transition-transform hover:scale-[1.02] active:scale-[0.97] disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {enviando ? "Enviando..." : "Enviar mensagem"}
                {!enviando && <ArrowRight className="w-4 h-4" />}
              </button>
            </form>
          )}
        </div>
      </section>

    </main>
  );
}
