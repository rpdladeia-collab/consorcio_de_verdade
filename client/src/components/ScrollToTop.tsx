import { useEffect } from "react";
import { useLocation } from "wouter";

export default function ScrollToTop() {
  const [location] = useLocation();

  useEffect(() => {
    // Se não houver hash na URL, rola para o topo
    if (!window.location.hash) {
      window.scrollTo(0, 0);
    } else {
      // Se houver hash, aguarda um pouco para o elemento renderizar e rola para ele
      const id = window.location.hash.replace("#", "");
      setTimeout(() => {
        const element = document.getElementById(id);
        if (element) {
          element.scrollIntoView({ behavior: "smooth" });
        }
      }, 100);
    }
  }, [location]);

  return null;
}
