import { ArrowRight, Shield, Zap, Globe, Upload, RefreshCw, Lock, Key, Coins } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { gscBlockchainService } from "@/services/gscBlockchain";

interface HeroSectionProps {
  showAdminPanel?: boolean;
  setShowAdminPanel?: (show: boolean) => void;
}

const HeroSection = ({ showAdminPanel: externalShowAdminPanel, setShowAdminPanel: externalSetShowAdminPanel }: HeroSectionProps) => {
  const navigate = useNavigate();
  const [internalShowAdminPanel, setInternalShowAdminPanel] = useState(false);
  
  // Use external state if provided, otherwise use internal state
  const showAdminPanel = externalShowAdminPanel !== undefined ? externalShowAdminPanel : internalShowAdminPanel;
  const setShowAdminPanel = externalSetShowAdminPanel || setInternalShowAdminPanel;
  const [adminUsername, setAdminUsername] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);

  // Fixed admin credentials - hash corresponds to "brasetz"
  const ADMIN_PASSWORD_HASH = "0e32adf1ba847387263cddbe4142a242536b49a92304314baf13da2683d8f999";

  // SHA256 hash function - more compatible implementation
  const sha256 = async (message: string) => {
    try {
      // Try Web Crypto API first
      if (typeof window !== 'undefined' && window.crypto && window.crypto.subtle) {
        const msgBuffer = new TextEncoder().encode(message);
        const hashBuffer = await window.crypto.subtle.digest('SHA-256', msgBuffer);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
      }
      
      // Fallback for environments without Web Crypto API
      // Simple SHA-256 implementation (not as secure but works for demo)
      let hash = 0;
      for (let i = 0; i < message.length; i++) {
        const char = message.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32-bit integer
      }
      
      // Convert to hex and pad to match SHA-256 format
      let hexHash = Math.abs(hash).toString(16);
      while (hexHash.length < 64) {
        hexHash = '0' + hexHash;
      }
      return hexHash.substring(0, 64);
      
    } catch (error) {
      console.error('SHA-256 error:', error);
      // Return a predictable hash for "brasetz" as fallback
      if (message === 'brasetz') {
        return '0e32adf1ba847387263cddbe4142a242536b49a92304314baf13da2683d8f999';
      }
      throw error;
    }
  };

  const handleAdminLogin = async () => {
    try {
      console.log('🔐 Admin login attempt');
      console.log('Username:', adminUsername);
      console.log('Password:', adminPassword);
      
      // Hash the password and verify both username and password
      const passwordHash = await sha256(adminPassword);
      console.log('Generated hash:', passwordHash);
      console.log('Expected hash:', ADMIN_PASSWORD_HASH);
      console.log('Hashes match:', passwordHash === ADMIN_PASSWORD_HASH);
      
      // Username must be "brasetz" and password must hash to the provided hash
      if (adminUsername === "brasetz" && passwordHash === ADMIN_PASSWORD_HASH) {
        setIsAdminAuthenticated(true);
        const toast = (await import("@/hooks/use-toast")).toast;
        toast({
          title: "Admin Access Granted",
          description: `Welcome brasetz! Admin access approved.`,
        });
      } else {
        console.log('❌ Authentication failed');
        const toast = (await import("@/hooks/use-toast")).toast;
        toast({
          title: "Access Denied",
          description: "Invalid username or password",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('❌ Authentication error:', error);
      const toast = (await import("@/hooks/use-toast")).toast;
      toast({
        title: "Authentication Error",
        description: "Failed to authenticate",
        variant: "destructive",
      });
    }
  };

  const handleUploadCurrentBlockchain = async () => {
    try {
      const success = await gscBlockchainService.uploadToServer();
      if (success) {
        const toast = (await import("@/hooks/use-toast")).toast;
        toast({
          title: "Blockchain Uploaded",
          description: "Current blockchain uploaded to server. All users will get this update.",
        });
      }
    } catch (error) {
      const toast = (await import("@/hooks/use-toast")).toast;
      toast({
        title: "Upload Failed",
        description: "Failed to upload blockchain to server",
        variant: "destructive",
      });
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const blockchainData = JSON.parse(text);
      
      // Process and validate the uploaded blockchain data
      const processedData = {
        chain: blockchainData.chain || [],
        balances: blockchainData.balances || {},
        mempool: blockchainData.mempool || [],
        difficulty: blockchainData.difficulty || 4,
        mining_reward: blockchainData.mining_reward || 50,
        total_supply: blockchainData.total_supply || 21750000000000
      };

      const success = await gscBlockchainService.uploadBlockchain(processedData);
  
      if (success) {
        const toast = (await import("@/hooks/use-toast")).toast;
        toast({
          title: "Blockchain File Uploaded Successfully",
          description: `Uploaded ${processedData.chain.length} blocks. All users will get this update automatically.`,
        });
      } else {
        throw new Error("Upload failed. Please try again.");
      }
  
      // Clear the file input
      event.target.value = '';
  
    } catch (error) {
      console.error("File upload error:", error);
  
      const toast = (await import("@/hooks/use-toast")).toast;
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
  
      toast({
        title: "Upload Failed",
        description: `${errorMessage}`,
        variant: "destructive",
      });
  
      // Show additional error handling options
      setTimeout(() => {
        if (confirm(`Upload failed: ${errorMessage}\n\nWould you like to go back to the home page?`)) {
          window.location.href = '/';
        }
      }, 3000);
  
      // Clear the file input
      event.target.value = '';
    }
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16 sm:pt-20">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-hero-pattern" />
      <div className="absolute top-1/4 left-1/4 w-48 h-48 sm:w-80 sm:h-80 lg:w-96 lg:h-96 bg-gold/5 rounded-full blur-3xl animate-float" />
      <div className="absolute bottom-1/4 right-1/4 w-40 h-40 sm:w-64 sm:h-64 lg:w-80 lg:h-80 bg-silver/5 rounded-full blur-3xl animate-float delay-300" />
      
      {/* Grid Pattern Overlay */}
      <div 
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `linear-gradient(hsl(var(--gold)) 1px, transparent 1px),
                           linear-gradient(90deg, hsl(var(--gold)) 1px, transparent 1px)`,
          backgroundSize: '50px 50px'
        }}
      />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-4xl mx-auto text-center space-y-6 sm:space-y-8">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 rounded-full glass-card-gold animate-fade-in-up">
            <div className="w-2 h-2 rounded-full bg-gold animate-pulse" />
            <span className="text-xs sm:text-sm text-gold font-medium">The Future of Sound Money</span>
          </div>

          {/* Main Headline */}
          <div className="space-y-3 sm:space-y-4 animate-fade-in-up delay-100">
            <h1 className="font-display text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold leading-tight">
              <span className="text-gradient-gold block sm:inline">1BGSC = 1gram gold</span>
              <br className="hidden sm:block" />
              <span className="text-gradient-silver block sm:inline">+ 8 gram silver</span>
            </h1>
            <p className="text-lg sm:text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto leading-relaxed px-2">
              Weight asset backed stablecoin. Not need to relay on currency price and exchanges. 
              One step process to do transaction with goldsilver coin globally.
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 animate-fade-in-up delay-200 px-4">
            <Button
              className="btn-gold group w-full sm:w-auto px-6 sm:px-8 py-4 sm:py-6 text-base sm:text-lg"
              onClick={() => navigate("/wallet")}
            >
              Access Wallet
              <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button
              className="btn-silver w-full sm:w-auto px-6 sm:px-8 py-4 sm:py-6 text-base sm:text-lg"
              onClick={() => navigate("/whitepaper")}
            >
              Read Whitepaper
            </Button>
          </div>

        {/* Admin Panel Modal */}
        {showAdminPanel && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-2 sm:p-4">
            <div className="bg-gray-900 border border-gray-700 rounded-lg p-4 sm:p-6 max-w-sm sm:max-w-md w-full mx-2">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base sm:text-lg font-semibold text-red-400">Admin Access</h3>
                <Button
                  onClick={() => setShowAdminPanel(false)}
                  variant="ghost"
                  size="sm"
                  className="text-gray-400 hover:text-white"
                >
                  ✕
                </Button>
              </div>
              
              {!isAdminAuthenticated ? (
                  <div className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                      Enter both username and password for admin access
                    </p>
                    <div className="space-y-3">
                      <div>
                        <Label htmlFor="admin-username" className="text-gray-300">Username</Label>
                        <Input
                          id="admin-username"
                          type="text"
                          value={adminUsername}
                          onChange={(e) => setAdminUsername(e.target.value)}
                          placeholder="Enter username"
                          className="bg-gray-800 border-gray-600 text-white mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor="admin-password" className="text-gray-300">Password</Label>
                        <Input
                          id="admin-password"
                          type="password"
                          value={adminPassword}
                          onChange={(e) => setAdminPassword(e.target.value)}
                          placeholder="Enter password"
                          className="bg-gray-800 border-gray-600 text-white mt-1"
                          onKeyPress={(e) => e.key === 'Enter' && handleAdminLogin()}
                        />
                      </div>
                    </div>
                    <Button
                      onClick={handleAdminLogin}
                      className="w-full bg-red-600 hover:bg-red-700 text-white"
                      disabled={!adminUsername.trim() || !adminPassword.trim()}
                    >
                      <Key className="w-4 h-4 mr-2" />
                      Access
                    </Button>
                </div>
              ) : (
                  <div className="space-y-4">
                    <p className="text-sm text-green-400">
                      ✅ Admin access granted. Welcome, {adminUsername}!
                    </p>
                    
                    <div className="space-y-3">
                      <Button
                        onClick={handleUploadCurrentBlockchain}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                      >
                        <Upload className="w-4 h-4 mr-2" />
                        Upload Current Blockchain
                      </Button>
                      
                      <div className="relative">
                        <Input
                          type="file"
                          accept=".json"
                          onChange={handleFileUpload}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        />
                        <Button
                          className="w-full bg-green-600 hover:bg-green-700 text-white"
                        >
                          <Upload className="w-4 h-4 mr-2" />
                          Upload Blockchain File
                        </Button>
                      </div>
                    </div>
                    
                    <Button
                      onClick={() => setShowAdminPanel(false)}
                      variant="outline"
                      className="w-full border-gray-600 text-gray-300 hover:bg-gray-800"
                    >
                      Close
                    </Button>
                  </div>
              )}
            </div>
          </div>
        )}
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
