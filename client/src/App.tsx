import { Toaster } from "@/components/ui/sonner";
import React from 'react';
import { TooltipProvider } from "@/components/ui/tooltip";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ScrollToTop from "@/components/ScrollToTop";
import NotFound from "@/pages/NotFound";
import { Route, Switch, useLocation } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import Simuladores from "./pages/Simuladores";
import CaixaPreta from "./pages/CaixaPreta";
import Sobre from "./pages/Sobre";
import Contato from "./pages/Contato";
import Termos from "./pages/Termos";
import Privacidade from "./pages/Privacidade";

import SimuladorZonaContemplacao from "./pages/SimuladorZonaContemplacao";
import SimuladorLanceLivre from "./pages/SimuladorLanceLivre";
import SimuladorProporcaoTaxa from "./pages/SimuladorProporcaoTaxa";

import SimuladorAutoPagavel from "./pages/SimuladorAutoPagavel";
import SimuladorEstrategiaLance from "./pages/SimuladorEstrategiaLance";
import SimuladorVendaCartaContemplada from "./pages/SimuladorVendaCartaContemplada";
import SimuladorCancelamento from "./pages/SimuladorCancelamento";
import EstruturaDoPlano from "./pages/EstruturaDoPlano";

import Panorama from "./pages/Panorama";
// ZonaContemplacao antiga substituída pela versão nativa (SimuladorZonaContemplacao)

function Router() {
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path={"/simuladores"} component={Simuladores} />
      <Route path={"/caixa-preta"} component={CaixaPreta} />

      <Route path={"/simulador/zona-contemplacao"} component={SimuladorZonaContemplacao} />
      <Route path={"/simulador/lance-livre"} component={SimuladorLanceLivre} />
      <Route path={"/simulador/proporcao-taxa"} component={SimuladorProporcaoTaxa} />
      <Route path={"/simulador/auto-pagavel"} component={SimuladorAutoPagavel} />
      <Route path={"/simulador/estrategia-lance"} component={SimuladorEstrategiaLance} />
      <Route path={"/simulador/venda-carta-contemplada"} component={SimuladorVendaCartaContemplada} />
      <Route path={"/simulador/custo-cancelamento"} component={SimuladorCancelamento} />
      <Route path={"/simulador/estrutura-do-plano"} component={EstruturaDoPlano} />

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
  
  // Rastreamento de páginas com Google Analytics
  React.useEffect(() => {
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('config', 'G-RKXSPKS9M8', {
        page_path: location,
        page_title: document.title,
      });
    }
  }, [location]);
  
  return (
    <div className="flex flex-col min-h-screen">
      <ScrollToTop />
      <Header />
      <main
        className="flex-1 m-0 p-0"
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
