import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import { useEffect } from "react";
import NavBar from "@/components/NavBar";
import HomePage from "@/pages/HomePage";
import ConfigPage from "@/pages/ConfigPage";
import CertificatesPage from "@/pages/CertificatesPage";
import VerifyPage from "@/pages/VerifyPage";

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const isVerifyPage = location.pathname.startsWith("/verify");
  return (
    <div className="min-h-screen flex flex-col bg-cert-cream">
      {!isVerifyPage && <NavBar />}
      <main className="flex-1">
        {children}
      </main>
      {!isVerifyPage && (
        <footer className="border-t border-cert-gold/10 py-6 mt-12">
          <div className="max-w-7xl mx-auto px-4 text-center text-xs text-cert-ink/40">
            培训证书管理系统 · 专业可信赖的证书解决方案
          </div>
        </footer>
      )}
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <ScrollToTop />
      <Layout>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/config" element={<ConfigPage />} />
          <Route path="/certificates" element={<CertificatesPage />} />
          <Route path="/verify/:certNumber" element={<VerifyPage />} />
          <Route path="*" element={<HomePage />} />
        </Routes>
      </Layout>
    </Router>
  );
}
