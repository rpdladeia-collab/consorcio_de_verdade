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

const ASSUNTOS = ["Dúvida", "Segunda Opinião", "Quero Contratar"];

export default function Home() {
  const [form, setForm] = useState({ nome: "", contato: "", assunto: "", mensagem: "" });
  const [enviado, setEnviado] = useState(false);
  const [enviando, setEnviando] = useState(false);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.nome || !form.contato || !form.assunto || !form.mensagem) return;
    setEnviando(true);
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
      <section className="w-full bg-[var(--paper)] pt-10 pb-12 px-4 md:px-8">
        <div className="max-w-3xl mx-auto">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--orange)]/30 bg-[var(--orange)]/8 px-3 py-1 text-xs font-semibold text-[var(--orange)] mb-5 tracking-wide">
            Consórcio não é para todo mundo
          </span>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-[var(--ink)] leading-[1.05] tracking-tight mb-4">
            Antes de contratar um consórcio,{" "}
            <span className="text-[var(--orange)]">faça a conta.</span>
          </h1>
          <div className="text-base sm:text-lg text-foreground/75 leading-relaxed max-w-2xl mb-7 space-y-3">
            <p>Eu construí esta plataforma para que você consiga analisar uma proposta de consórcio com mais clareza: parcela, lance, custo total, correções, contemplação e capacidade real de pagamento.</p>
            <p>Os simuladores são gratuitos e foram criados para ajudar você a decidir com menos pressão e mais consciência. E, se mesmo assim quiser uma leitura individual do seu caso, eu posso te ajudar a entender se o consórcio faz sentido para você.</p>
          </div>
          <div className="flex flex-col sm:flex-row items-start gap-3 mb-4">
            <Link
              href="/simuladores"
              className="inline-flex items-center gap-2 rounded-full bg-[var(--orange)] text-white px-7 py-3 text-sm font-semibold transition-transform hover:scale-[1.02] active:scale-[0.97] w-full sm:w-auto justify-center"
            >
              Usar simuladores gratuitamente
              <ArrowRight className="w-4 h-4" />
            </Link>
            <a
              href={BRAND.whatsapp}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-[var(--ink)]/20 bg-white text-[var(--ink)] px-7 py-3 text-sm font-semibold transition-transform hover:scale-[1.02] active:scale-[0.97] w-full sm:w-auto justify-center"
            >
              Pedir análise individual
            </a>
          </div>
          <p className="text-xs text-gray-500">
            Use gratuitamente. Sem cadastro obrigatório. Cálculos auditáveis.
          </p>
        </div>
      </section>

      {/* ─── SEÇÃO SIMULADORES (Raio-X) ─────────────────────────── */}
      <section className="w-full bg-[var(--ink)] py-10 px-4 md:px-8">
        <div className="max-w-5xl mx-auto">
          <p className="eyebrow text-[var(--orange)] mb-3">RAIO X DO CONSÓRCIO</p>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white leading-tight mb-3 max-w-3xl">
            Se você não entende estes pontos, não contrate ainda.
          </h2>
          <p className="text-white/60 text-sm leading-relaxed max-w-2xl mb-8">
            O Raio-X do Consórcio reúne <strong className="text-white">todos os módulos essenciais</strong> para analisar uma proposta antes da contratação.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {MODULOS.map((m) => (
              <Link
                key={m.id}
                href={m.href}
                className="group flex flex-col gap-2.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 hover:border-[var(--orange)]/40 p-4 transition-all duration-200"
              >
                <div className="flex items-center gap-2.5">
                  <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-[var(--orange)]/15 text-[var(--orange)]">
                    {m.icon}
                  </span>
                  <span className="text-xs font-mono text-white/30 uppercase tracking-widest">
                    Módulo {m.id}
                  </span>
                </div>
                <p className="text-sm font-bold text-white group-hover:text-[var(--orange)] transition-colors">
                  {m.title}
                </p>
                <p className="text-xs text-white/55 leading-relaxed">{m.desc}</p>
                <span className="mt-auto flex items-center gap-1 text-xs font-semibold text-[var(--orange)] opacity-0 group-hover:opacity-100 transition-opacity">
                  Abrir módulo <ChevronRight className="w-3.5 h-3.5" />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ─── BLOCO ZONA DE CONTEMPLAÇÃO ───────────────────────────── */}
      <section className="w-full bg-white py-10 px-4 md:px-8 border-b border-border">
        <div className="max-w-5xl mx-auto flex flex-col lg:flex-row items-start lg:items-center gap-6">
          <div className="flex-1">
            <p className="eyebrow text-[var(--orange)] mb-2">ZONA DE CONTEMPLAÇÃO</p>
            <h2 className="text-xl sm:text-2xl font-black text-[var(--ink)] leading-tight mb-3">
              Entenda a dinâmica do grupo antes de definir sua estratégia de lance.
            </h2>
            <p className="text-foreground/65 text-sm leading-relaxed max-w-xl">
              A Zona de Raio-X do Lance permite analisar histórico de lances, pressão competitiva e quantitativo de contemplações de um grupo.
            </p>
          </div>
          <div className="shrink-0">
            <Link
              href="/zona-contemplacao"
              className="inline-flex items-center gap-2 rounded-full bg-[var(--orange)] text-white px-6 py-2.5 text-sm font-semibold transition-transform hover:scale-[1.02] active:scale-[0.97]"
            >
              Abrir Zona de Raio-X do Lance
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ─── BLOCO PANORAMA: DADOS OFICIAIS ───────────────────────── */}
      <section className="w-full bg-[var(--paper)] py-10 px-4 md:px-8 border-b border-border">
        <div className="max-w-5xl mx-auto flex flex-col lg:flex-row items-start lg:items-center gap-6">
          <div className="flex-1">
            <p className="eyebrow text-[var(--orange)] mb-2">PANORAMA: DADOS OFICIAIS</p>
            <h2 className="text-xl sm:text-2xl font-black text-[var(--ink)] leading-tight mb-3">
              Não é opinião. É o dado oficial.
            </h2>
            <p className="text-foreground/65 text-sm leading-relaxed max-w-xl">
              O Panorama reúne dados oficiais do Banco Central para contextualizar o mercado de consórcios: vendas, exclusões, reclamações e contemplações.
            </p>
          </div>
          <div className="shrink-0">
            <Link
              href="/panorama"
              className="inline-flex items-center gap-2 rounded-full bg-[var(--ink)] text-[var(--paper)] px-6 py-2.5 text-sm font-semibold transition-transform hover:scale-[1.02] active:scale-[0.97]"
            >
              Ver dados oficiais
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ─── BLOCO POSICIONAMENTO ─────────────────────────────────── */}
      <section className="w-full bg-[var(--ink)] py-10 px-4 md:px-8 border-b border-white/10">
        <div className="max-w-3xl mx-auto text-center">
          <p className="eyebrow text-[var(--orange)] mb-3">NOSSO COMPROMISSO</p>
          <h2 className="text-xl sm:text-2xl font-black text-white leading-tight mb-4">
            Consórcio vendido com análise, transparência e responsabilidade.
          </h2>
          <p className="text-white/65 text-sm leading-relaxed mb-3">
            Nós acreditamos na venda consultiva. Nosso compromisso é com a matemática e com a sua decisão.
          </p>
          <p className="text-white/65 text-sm leading-relaxed">
            O consórcio é um produto legítimo. O problema não é o produto — é a venda feita sem análise, sem transparência e sem respeito ao comprador.
          </p>
        </div>
      </section>

      {/* ─── BLOCO SOBRE ──────────────────────────────────────────── */}
      <section className="w-full bg-[var(--paper)] py-10 px-4 md:px-8 border-b border-border">
        <div className="max-w-5xl mx-auto flex flex-col lg:flex-row items-start lg:items-center gap-6">
          <div className="flex-1">
            <p className="eyebrow text-[var(--orange)] mb-2">SOBRE</p>
            <h2 className="text-xl sm:text-2xl font-black text-[var(--ink)] leading-tight mb-3">
              Vender consórcio da forma correta.
            </h2>
            <p className="text-foreground/65 text-sm leading-relaxed max-w-xl">
              O Consórcio de Verdade foi criado para vender consórcio da forma correta: com análise, transparência e decisão consciente antes da contratação.
            </p>
          </div>
          <div className="shrink-0">
            <Link
              href="/sobre"
              className="inline-flex items-center gap-2 rounded-full border border-[var(--ink)]/20 bg-transparent text-[var(--ink)] px-6 py-2.5 text-sm font-semibold transition-transform hover:scale-[1.02] active:scale-[0.97]"
            >
              Conhecer o projeto
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ─── CTA FINAL + FORMULÁRIO DE CONTATO (seção laranja) ────── */}
      <section className="w-full bg-[var(--orange)] py-10 px-4 md:px-8" id="contato">
        <div className="max-w-5xl mx-auto flex flex-col lg:flex-row items-start gap-8 lg:gap-12">

          {/* Lado esquerdo: texto + botão simuladores */}
          <div className="flex-1">
            <h2 className="text-xl sm:text-2xl font-black text-white leading-tight mb-3">
              Use os simuladores à vontade.
            </h2>
            <p className="text-white/85 text-sm leading-relaxed mb-5 max-w-sm">
              Se quiser, traga sua proposta para uma segunda opinião ou construa o seu plano com quem joga limpo.
            </p>
            <Link
              href="/simuladores"
              className="inline-flex items-center gap-2 rounded-full bg-white text-[var(--orange)] px-6 py-2.5 text-sm font-semibold transition-transform hover:scale-[1.02] active:scale-[0.97]"
            >
              Usar simuladores gratuitamente
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Lado direito: formulário compacto */}
          <div className="w-full lg:w-[340px] shrink-0 bg-white/10 backdrop-blur-sm rounded-xl p-5 border border-white/20">
            <p className="text-xs font-bold text-white/70 uppercase tracking-widest mb-4">Pedir análise individual</p>

            {enviado ? (
              <div className="text-center py-4">
                <p className="text-white font-bold mb-1">Mensagem enviada!</p>
                <p className="text-white/70 text-xs mb-3">Você será redirecionado para o WhatsApp.</p>
                <button
                  onClick={() => { setEnviado(false); setForm({ nome: "", contato: "", assunto: "", mensagem: "" }); }}
                  className="text-xs text-white underline underline-offset-4"
                >
                  Enviar outra mensagem
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col gap-3">
                <input
                  id="nome"
                  name="nome"
                  type="text"
                  required
                  placeholder="Seu nome"
                  value={form.nome}
                  onChange={handleChange}
                  className="w-full rounded-lg bg-white/20 border border-white/30 px-3 py-2 text-sm text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-white/50 transition"
                />
                <input
                  id="contato"
                  name="contato"
                  type="text"
                  required
                  placeholder="WhatsApp ou e-mail"
                  value={form.contato}
                  onChange={handleChange}
                  className="w-full rounded-lg bg-white/20 border border-white/30 px-3 py-2 text-sm text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-white/50 transition"
                />
                <select
                  id="assunto"
                  name="assunto"
                  required
                  value={form.assunto}
                  onChange={handleChange}
                  className="w-full rounded-lg bg-white/20 border border-white/30 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-white/50 transition appearance-none cursor-pointer"
                >
                  <option value="" className="text-[var(--ink)]">Assunto</option>
                  {ASSUNTOS.map((a) => (
                    <option key={a} value={a} className="text-[var(--ink)]">{a}</option>
                  ))}
                </select>
                <textarea
                  id="mensagem"
                  name="mensagem"
                  required
                  rows={3}
                  placeholder="Sua mensagem..."
                  value={form.mensagem}
                  onChange={handleChange}
                  className="w-full rounded-lg bg-white/20 border border-white/30 px-3 py-2 text-sm text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-white/50 transition resize-none"
                />
                <button
                  type="submit"
                  disabled={enviando}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-white text-[var(--orange)] px-6 py-2.5 text-sm font-semibold transition-transform hover:scale-[1.02] active:scale-[0.97] disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {enviando ? "Enviando..." : "Enviar mensagem"}
                  {!enviando && <ArrowRight className="w-4 h-4" />}
                </button>
              </form>
            )}
          </div>

        </div>
      </section>

    </main>
  );
}
