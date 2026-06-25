import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
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

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster />
          <div className="flex flex-col min-h-screen">
            <Header />
            <main className="flex-1">
              <Router />
            </main>
            <Footer />
          </div>
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
