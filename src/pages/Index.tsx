import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import AboutSection from "@/components/AboutSection";
import PhasesSection from "@/components/PhasesSection";
import NotificationsSection from "@/components/NotificationsSection";
import Footer from "@/components/Footer";
import ErrorBoundary from "@/components/ErrorBoundary";

const Index = () => {
  const [showAdminPanel, setShowAdminPanel] = useState(false);

  const handleAdminClick = () => {
    setShowAdminPanel(true);
  };

  // Run error handling tests in development
  // Removed development test runners to clean up production UI

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-background">
        <ErrorBoundary>
          <Navbar />
        </ErrorBoundary>
        <main>
          <ErrorBoundary>
            <HeroSection 
              showAdminPanel={showAdminPanel} 
              setShowAdminPanel={setShowAdminPanel} 
            />
          </ErrorBoundary>
          <ErrorBoundary>
            <AboutSection />
          </ErrorBoundary>
          <ErrorBoundary>
            <PhasesSection />
          </ErrorBoundary>
          <ErrorBoundary>
            <NotificationsSection />
          </ErrorBoundary>
        </main>
        <ErrorBoundary>
          <Footer onAdminClick={handleAdminClick} />
        </ErrorBoundary>
      </div>
    </ErrorBoundary>
  );
};

export default Index;
