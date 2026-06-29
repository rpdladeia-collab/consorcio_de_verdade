import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import NotFound from "@/pages/NotFound";
import { Route, Switch, useLocation } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import Simuladores from "./pages/Simuladores";
import Sobre from "./pages/Sobre";
import Contato from "./pages/Contato";
import Termos from "./pages/Termos";
import Privacidade from "./pages/Privacidade";
import SimuladorLanceEmbutido from "./pages/SimuladorLanceEmbutido";
import SimuladorZonaContemplacao from "./pages/SimuladorZonaContemplacao";
import SimuladorLanceLivre from "./pages/SimuladorLanceLivre";
import SimuladorSimulePlano from "./pages/SimuladorSimulePlano";
import SimuladorContemplacao from "./pages/SimuladorContemplacao";
import SimuladorCustoOperacao from "./pages/SimuladorCustoOperacao";
import SimuladorProporcaoTaxa from "./pages/SimuladorProporcaoTaxa";
import SimuladorHistoricoCorrecoes from "./pages/SimuladorHistoricoCorrecoes";
import SimuladorAutoPagavel from "./pages/SimuladorAutoPagavel";
import Panorama from "./pages/Panorama";
// ZonaContemplacao antiga substituída pela versão nativa (SimuladorZonaContemplacao)

function Router() {
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path={"/simuladores"} component={Simuladores} />
      <Route path={"/simulador/lance-embutido"} component={SimuladorLanceEmbutido} />
      <Route path={"/simulador/zona-contemplacao"} component={SimuladorZonaContemplacao} />
      <Route path={"/simulador/lance-livre"} component={SimuladorLanceLivre} />
      <Route path={"/simulador/simule-seu-plano"} component={SimuladorSimulePlano} />
      <Route path={"/simulador/contemplacao"} component={SimuladorContemplacao} />
      <Route path={"/simulador/custo-operacao"} component={SimuladorCustoOperacao} />
      <Route path={"/simulador/proporcao-taxa"} component={SimuladorProporcaoTaxa} />
      <Route path={"/simulador/historico-correcoes"} component={SimuladorHistoricoCorrecoes} />
      <Route path={"/simulador/auto-pagavel"} component={SimuladorAutoPagavel} />
      <Route path={"/zona-contemplacao"} component={SimuladorZonaContemplacao} />
      <Route path={"/panorama"} component={Panorama} />
      <Route path={"/sobre"} component={Sobre} />
      <Route path={"/contato"} component={Contato} />
      <Route path={"/termos"} component={Termos} />
      <Route path={"/privacidade"} component={Privacidade} />
      <Route path={"/404"} component={NotFound} />
      {/* Final fallback route */}
      <Route component={NotFound} />
    </Switch>
  );
}

// Rotas com fundo escuro (bg-ink) — o main herda o fundo para preencher o flex-1
const DARK_ROUTES = ["/sobre", "/panorama"];

function AppLayout() {
  const [location] = useLocation();
  const isDark = DARK_ROUTES.some((r) => location === r || location.startsWith(r + "/"));
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main
        className="flex-1"
        style={isDark ? { backgroundColor: 'var(--ink)' } : undefined}
      >
        <Router />
      </main>
      <Footer />
    </div>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster />
          <AppLayout />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
