import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { RefreshCw, AlertTriangle, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import GSCFullWallet from "@/components/wallet/GSCFullWalletNew";
import ErrorBoundary from "@/components/ErrorBoundary";

const WalletPage = () => {
  const [isInitialized, setIsInitialized] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    // Check if wallet can be initialized
    try {
      // Basic checks for wallet functionality
      if (!localStorage) {
        throw new Error("Local storage not available");
      }
      
      // Test if we can access the blockchain service
      const testData = localStorage.getItem('gsc_blockchain_data');
      if (testData) {
        JSON.parse(testData); // Test if data is valid JSON
      }
      
      setIsInitialized(true);
    } catch (error) {
      console.error("Wallet initialization error:", error);
      setHasError(true);
      setErrorMessage(error instanceof Error ? error.message : "Failed to initialize wallet");
      setIsInitialized(false);
    }
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <div className="fixed inset-0 bg-hero-pattern pointer-events-none" />
      <div className="fixed top-1/4 left-1/4 w-96 h-96 bg-gold/5 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <header className="relative z-10 border-b border-border bg-midnight/80 backdrop-blur-xl">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16">
            <Link to="/" className="flex items-center gap-2 sm:gap-3">
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-gold flex items-center justify-center">
                <span className="font-display font-bold text-midnight text-xs sm:text-sm">G</span>
              </div>
              <span className="font-display font-bold text-base sm:text-lg text-gradient-gold">GSC</span>
            </Link>
            <div className="flex items-center gap-2 sm:gap-4">
              <span className="text-xs sm:text-sm text-muted-foreground">
                <span className="text-gold">GSC Wallet</span>
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        {/* Top Bar */}
        <div className="flex flex-col gap-2 sm:gap-4 mb-4 sm:mb-6">
          <div className="text-center sm:text-left">
            <h1 className="font-display text-xl sm:text-2xl font-bold">
              <span className="text-gradient-gold">GSC</span> Wallet
            </h1>
            <p className="text-muted-foreground text-xs sm:text-sm">GSC Blockchain Wallet - Production Grade</p>
          </div>
        </div>

        {/* GSC Wallet Full Interface */}
        {hasError ? (
          <div className="flex items-center justify-center min-h-[50vh] px-4">
            <div className="max-w-sm sm:max-w-md w-full text-center space-y-4 sm:space-y-6">
              <div className="flex justify-center">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-red-500/10 rounded-full flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6 sm:w-8 sm:h-8 text-red-500" />
                </div>
              </div>
              
              <div className="space-y-2">
                <h2 className="text-lg sm:text-xl font-bold text-foreground">Wallet Error</h2>
                <p className="text-muted-foreground text-sm sm:text-base">
                  {errorMessage || "Failed to initialize wallet. Please try refreshing or go back to home."}
                </p>
              </div>

              <div className="flex flex-col gap-3 justify-center">
                <Button
                  onClick={() => window.location.reload()}
                  className="bg-blue-600 hover:bg-blue-700 text-white w-full"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Refresh Page
                </Button>
                
                <Button
                  onClick={() => window.location.href = '/'}
                  variant="outline"
                  className="border-gold/30 text-gold hover:bg-gold/10 w-full"
                >
                  <Home className="w-4 h-4 mr-2" />
                  Go to Home
                </Button>
              </div>
            </div>
          </div>
        ) : isInitialized ? (
          <ErrorBoundary>
            <GSCFullWallet />
          </ErrorBoundary>
        ) : (
          <div className="flex items-center justify-center min-h-[50vh]">
            <div className="text-center px-4">
              <RefreshCw className="w-6 h-6 sm:w-8 sm:h-8 mx-auto animate-spin text-gold mb-4" />
              <p className="text-muted-foreground text-sm sm:text-base">Initializing GSC blockchain...</p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default WalletPage;
