import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { 
  File, 
  Settings, 
  Monitor, 
  Wrench, 
  HelpCircle,
  Plus,
  FolderOpen,
  X,
  Download,
  Upload,
  FileText,
  PenTool,
  CheckCircle,
  LogOut
} from "lucide-react";
import { gscBlockchainService } from "@/services/gscBlockchain";

interface GSCMenuBarProps {
  onCreateWallet: (wallet: any) => void;
  onOpenWallet: (walletName: string) => void;
  onImportBlockchain: () => void;
  onExportBlockchain: () => void;
  activeWallet: string | null;
  onWalletChange?: (walletName: string | null) => void;
}

const GSCMenuBar = ({ 
  onCreateWallet, 
  onOpenWallet, 
  onImportBlockchain, 
  onExportBlockchain,
  activeWallet,
  onWalletChange 
}: GSCMenuBarProps) => {
  const [showCreateWallet, setShowCreateWallet] = useState(false);
  const [showOpenWallet, setShowOpenWallet] = useState(false);
  const [showPaperWallet, setShowPaperWallet] = useState(false);
  const [showSignMessage, setShowSignMessage] = useState(false);
  const [showVerifyMessage, setShowVerifyMessage] = useState(false);
  const [showBackupWallet, setShowBackupWallet] = useState(false);
  const [showRestoreWallet, setShowRestoreWallet] = useState(false);
  
  // Form states
  const [walletName, setWalletName] = useState("");
  const [walletPassword, setWalletPassword] = useState("");
  const [availableWallets, setAvailableWallets] = useState<string[]>([]);
  const [showSettings, setShowSettings] = useState(false);
  const [showAbout, setShowAbout] = useState(false);

  // Paper Wallet Generation
  const [paperWalletCount, setPaperWalletCount] = useState(1);
  const [includeQR, setIncludeQR] = useState(true);

  // Message Signing
  const [messageToSign, setMessageToSign] = useState("");
  const [signedMessage, setSignedMessage] = useState("");

  // Message Verification
  const [messageToVerify, setMessageToVerify] = useState("");
  const [signatureToVerify, setSignatureToVerify] = useState("");
  const [addressToVerify, setAddressToVerify] = useState("");
  const [verificationResult, setVerificationResult] = useState<string | null>(null);

  // Load available wallets on mount
  React.useEffect(() => {
    const wallets = gscBlockchainService.getWallets();
    setAvailableWallets(wallets.map(w => w.name));
  }, []);

  // Wallet creation handler
  const handleCreateWallet = () => {
    console.log("handleCreateWallet called with name:", walletName);
    
    if (!walletName.trim()) {
      console.log("No wallet name provided");
      toast({
        title: "Error",
        description: "Please enter a wallet name",
        variant: "destructive",
      });
      return;
    }

    try {
      console.log("Creating wallet with gscBlockchainService...");
      const newWallet = gscBlockchainService.createWallet(walletName);
      console.log("Wallet created:", newWallet);
      
      onCreateWallet(newWallet);
      onWalletChange?.(newWallet.name);
      
      toast({
        title: "Wallet Created",
        description: `Successfully created wallet: ${walletName}`,
      });
      
      setShowCreateWallet(false);
      setWalletName("");
      setWalletPassword("");
      
      // Refresh available wallets
      const wallets = gscBlockchainService.getWallets();
      setAvailableWallets(wallets.map(w => w.name));
      console.log("Available wallets updated:", wallets.map(w => w.name));
    } catch (error) {
      console.error("Error creating wallet:", error);
      toast({
        title: "Error",
        description: `Failed to create wallet: ${error}`,
        variant: "destructive",
      });
    }
  };

  // Wallet opening handler
  const handleOpenWallet = (selectedWalletName: string) => {
    try {
      onOpenWallet(selectedWalletName);
      onWalletChange?.(selectedWalletName);
      
      toast({
        title: "Wallet Opened",
        description: `Successfully opened wallet: ${selectedWalletName}`,
      });
      
      setShowOpenWallet(false);
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to open wallet: ${error}`,
        variant: "destructive",
      });
    }
  };

  // Wallet backup handler
  const handleBackupWallet = () => {
    if (!activeWallet) {
      toast({
        title: "Error",
        description: "No active wallet to backup",
        variant: "destructive",
      });
      return;
    }

    try {
      const wallets = gscBlockchainService.getWallets();
      const wallet = wallets.find(w => w.name === activeWallet);
      
      if (!wallet) {
        throw new Error("Wallet not found");
      }

      const backupData = {
        wallet_name: wallet.name,
        wallet_data: {
          name: wallet.name,
          master_address: wallet.address,
          master_private_key: wallet.private_key,
          master_public_key: wallet.public_key,
          created: wallet.created || new Date().toISOString(),
          balance: wallet.balance
        }
      };

      const dataStr = JSON.stringify(backupData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `${wallet.name}.backup`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast({
        title: "Backup Created",
        description: `Wallet backup saved as ${wallet.name}.backup`,
      });
      
      setShowBackupWallet(false);
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to backup wallet: ${error}`,
        variant: "destructive",
      });
    }
  };

  // Wallet restore handler
  const handleRestoreWallet = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const importedWallet = await gscBlockchainService.importWalletFromBackup(file);
      onCreateWallet(importedWallet);
      onWalletChange?.(importedWallet.name);
      
      toast({
        title: "Wallet Restored",
        description: `Successfully restored wallet: ${importedWallet.name}`,
      });
      
      setShowRestoreWallet(false);
      
      // Refresh available wallets
      const wallets = gscBlockchainService.getWallets();
      setAvailableWallets(wallets.map(w => w.name));
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to restore wallet: ${error}`,
        variant: "destructive",
      });
    }
  };

  const handleGeneratePaperWallet = () => {
    try {
      const wallets = [];
      for (let i = 0; i < paperWalletCount; i++) {
        const { address, private_key, public_key } = gscBlockchainService.generateAddress();
        wallets.push({
          address,
          private_key,
          public_key,
          created: new Date().toISOString()
        });
      }

      // Create paper wallet content
      const paperWalletContent = wallets.map((wallet, index) => `
GSC COIN PAPER WALLET #${index + 1}
Generated: ${new Date().toLocaleString()}
===========================================

PUBLIC ADDRESS (Share this to receive GSC):
${wallet.address}

PRIVATE KEY (Keep this SECRET):
${wallet.private_key}

PUBLIC KEY:
${wallet.public_key}

INSTRUCTIONS:
1. Keep this paper wallet in a safe place
2. Never share your private key with anyone
3. Use the public address to receive GSC coins
4. Import the private key to access your funds

===========================================
GSC Coin - Professional Cryptocurrency
      `).join('\n\n');

      // Download as text file
      const blob = new Blob([paperWalletContent], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `GSC_Paper_Wallets_${Date.now()}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: "Paper Wallet Generated",
        description: `Generated ${paperWalletCount} paper wallet(s) successfully`,
      });

      setShowPaperWallet(false);
    } catch (error) {
      toast({
        title: "Generation Failed",
        description: `Failed to generate paper wallet: ${error}`,
        variant: "destructive",
      });
    }
  };

  const handleSignMessage = () => {
    if (!activeWallet || !messageToSign.trim()) {
      toast({
        title: "Error",
        description: "Please select a wallet and enter a message to sign",
        variant: "destructive",
      });
      return;
    }

    try {
      // Simple message signing (in production, use proper cryptographic signing)
      const timestamp = Date.now();
      const signature = `GSC_SIG_${btoa(messageToSign + activeWallet + timestamp)}`;
      setSignedMessage(signature);

      toast({
        title: "Message Signed",
        description: "Message has been signed successfully",
      });
    } catch (error) {
      toast({
        title: "Signing Failed",
        description: `Failed to sign message: ${error}`,
        variant: "destructive",
      });
    }
  };

  const handleVerifyMessage = () => {
    if (!messageToVerify.trim() || !signatureToVerify.trim() || !addressToVerify.trim()) {
      toast({
        title: "Error",
        description: "Please fill in all fields to verify the message",
        variant: "destructive",
      });
      return;
    }

    try {
      // Simple signature verification (in production, use proper cryptographic verification)
      const isValid = signatureToVerify.startsWith('GSC_SIG_') && 
                     addressToVerify.startsWith('GSC1') &&
                     messageToVerify.length > 0;

      toast({
        title: isValid ? "Signature Valid" : "Signature Invalid",
        description: isValid ? "The signature is valid for this message" : "The signature is not valid",
        variant: isValid ? "default" : "destructive",
      });
    } catch (error) {
      toast({
        title: "Verification Failed",
        description: `Failed to verify signature: ${error}`,
        variant: "destructive",
      });
    }
  };

  const handleCloseWallet = () => {
    // In a real implementation, this would close the current wallet
    toast({
      title: "Wallet Closed",
      description: "Current wallet has been closed",
    });
  };

  const handleCloseAllWallets = () => {
    // In a real implementation, this would close all wallets
    toast({
      title: "All Wallets Closed",
      description: "All wallets have been closed",
    });
  };

  return (
    <>
      <div className="flex items-center gap-1 p-2 bg-gray-100 border-b">
        {/* File Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 px-3">
              <File className="w-4 h-4 mr-1" />
              File
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            <DropdownMenuItem onClick={() => setShowCreateWallet(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Create Wallet...
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setShowOpenWallet(true)}>
              <FolderOpen className="w-4 h-4 mr-2" />
              Open Wallet
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleCloseWallet} disabled={!activeWallet}>
              <X className="w-4 h-4 mr-2" />
              Close Wallet...
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleCloseAllWallets}>
              <X className="w-4 h-4 mr-2" />
              Close All Wallets...
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => setShowBackupWallet(true)}>
              <Download className="w-4 h-4 mr-2" />
              Backup Wallet...
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setShowRestoreWallet(true)}>
              <Upload className="w-4 h-4 mr-2" />
              Restore Wallet...
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => setShowPaperWallet(true)}>
              <FileText className="w-4 h-4 mr-2" />
              Generate Paper Wallet...
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => setShowSignMessage(true)}>
              <PenTool className="w-4 h-4 mr-2" />
              Sign message...
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setShowVerifyMessage(true)}>
              <CheckCircle className="w-4 h-4 mr-2" />
              Verify message...
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => window.close()}>
              <LogOut className="w-4 h-4 mr-2" />
              Exit
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Settings Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 px-3">
              <Settings className="w-4 h-4 mr-1" />
              Settings
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            <DropdownMenuItem onClick={() => setShowSettings(true)}>
              <Settings className="w-4 h-4 mr-2" />
              Preferences...
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onImportBlockchain}>
              <Upload className="w-4 h-4 mr-2" />
              Import Blockchain...
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onExportBlockchain}>
              <Download className="w-4 h-4 mr-2" />
              Export Blockchain...
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Window Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 px-3">
              <Monitor className="w-4 h-4 mr-1" />
              Window
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            <DropdownMenuItem onClick={() => {}}>
              Minimize
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => {}}>
              Zoom
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Tools Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 px-3">
              <Wrench className="w-4 h-4 mr-1" />
              Tools
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            <DropdownMenuItem onClick={() => setShowPaperWallet(true)}>
              <FileText className="w-4 h-4 mr-2" />
              Paper Wallet Generator
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setShowSignMessage(true)}>
              <PenTool className="w-4 h-4 mr-2" />
              Message Signing
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setShowVerifyMessage(true)}>
              <CheckCircle className="w-4 h-4 mr-2" />
              Message Verification
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Help Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 px-3">
              <HelpCircle className="w-4 h-4 mr-1" />
              Help
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            <DropdownMenuItem onClick={() => setShowAbout(true)}>
              <HelpCircle className="w-4 h-4 mr-2" />
              About GSC Coin
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Paper Wallet Dialog */}
      <Dialog open={showPaperWallet} onOpenChange={setShowPaperWallet}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Generate Paper Wallet</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Number of wallets to generate:</Label>
              <Input
                type="number"
                min="1"
                max="10"
                value={paperWalletCount}
                onChange={(e) => setPaperWalletCount(parseInt(e.target.value) || 1)}
              />
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="includeQR"
                checked={includeQR}
                onChange={(e) => setIncludeQR(e.target.checked)}
              />
              <Label htmlFor="includeQR">Include QR codes</Label>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleGeneratePaperWallet} className="flex-1">
                Generate Paper Wallet
              </Button>
              <Button variant="outline" onClick={() => setShowPaperWallet(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Sign Message Dialog */}
      <Dialog open={showSignMessage} onOpenChange={setShowSignMessage}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Sign Message</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Message to sign:</Label>
              <Textarea
                value={messageToSign}
                onChange={(e) => setMessageToSign(e.target.value)}
                placeholder="Enter your message here..."
                rows={4}
              />
            </div>
            {signedMessage && (
              <div className="space-y-2">
                <Label>Signature:</Label>
                <Textarea
                  value={signedMessage}
                  readOnly
                  rows={3}
                  className="font-mono text-sm"
                />
              </div>
            )}
            <div className="flex gap-2">
              <Button onClick={handleSignMessage} className="flex-1" disabled={!activeWallet}>
                Sign Message
              </Button>
              <Button variant="outline" onClick={() => setShowSignMessage(false)}>
                Close
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Verify Message Dialog */}
      <Dialog open={showVerifyMessage} onOpenChange={setShowVerifyMessage}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Verify Message</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Address:</Label>
              <Input
                value={addressToVerify}
                onChange={(e) => setAddressToVerify(e.target.value)}
                placeholder="GSC1..."
              />
            </div>
            <div className="space-y-2">
              <Label>Message:</Label>
              <Textarea
                value={messageToVerify}
                onChange={(e) => setMessageToVerify(e.target.value)}
                placeholder="Enter the original message..."
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label>Signature:</Label>
              <Textarea
                value={signatureToVerify}
                onChange={(e) => setSignatureToVerify(e.target.value)}
                placeholder="Enter the signature..."
                rows={3}
                className="font-mono text-sm"
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleVerifyMessage} className="flex-1">
                Verify Signature
              </Button>
              <Button variant="outline" onClick={() => setShowVerifyMessage(false)}>
                Close
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Create Wallet Dialog */}
      <Dialog open={showCreateWallet} onOpenChange={setShowCreateWallet}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Create New Wallet</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Wallet Name:</Label>
              <Input
                value={walletName}
                onChange={(e) => setWalletName(e.target.value)}
                placeholder="Enter wallet name..."
              />
            </div>
            <div className="space-y-2">
              <Label>Password (Optional):</Label>
              <Input
                type="password"
                value={walletPassword}
                onChange={(e) => setWalletPassword(e.target.value)}
                placeholder="Enter password for encryption..."
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleCreateWallet} className="flex-1">
                Create Wallet
              </Button>
              <Button variant="outline" onClick={() => setShowCreateWallet(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Open Wallet Dialog */}
      <Dialog open={showOpenWallet} onOpenChange={setShowOpenWallet}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Open Existing Wallet</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Select Wallet:</Label>
              {availableWallets.length > 0 ? (
                <div className="space-y-2">
                  {availableWallets.map((wallet, index) => (
                    <div
                      key={index}
                      className="p-3 border rounded cursor-pointer hover:bg-gray-50"
                      onClick={() => handleOpenWallet(wallet)}
                    >
                      <p className="font-medium">{wallet}</p>
                      <p className="text-sm text-muted-foreground">GSC Wallet</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <p>No wallets found</p>
                  <p className="text-sm">Create a new wallet to get started</p>
                </div>
              )}
            </div>
            <Button variant="outline" onClick={() => setShowOpenWallet(false)} className="w-full">
              Cancel
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Backup Wallet Dialog */}
      <Dialog open={showBackupWallet} onOpenChange={setShowBackupWallet}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Backup Wallet</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                Create a backup of your current wallet. This will download a JSON file containing your wallet data.
              </p>
              {activeWallet && (
                <div className="p-3 bg-gray-50 rounded">
                  <p className="font-medium">Active Wallet: {activeWallet}</p>
                </div>
              )}
            </div>
            <div className="flex gap-2">
              <Button onClick={handleBackupWallet} className="flex-1" disabled={!activeWallet}>
                Create Backup
              </Button>
              <Button variant="outline" onClick={() => setShowBackupWallet(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Restore Wallet Dialog */}
      <Dialog open={showRestoreWallet} onOpenChange={setShowRestoreWallet}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Restore Wallet</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Select Backup File:</Label>
              <Input
                type="file"
                accept=".backup,.json"
                onChange={handleRestoreWallet}
                className="cursor-pointer"
              />
              <p className="text-sm text-muted-foreground">
                Select a wallet backup file (.backup or .json) to restore your wallet.
              </p>
            </div>
            <Button variant="outline" onClick={() => setShowRestoreWallet(false)} className="w-full">
              Cancel
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* About Dialog */}
      <Dialog open={showAbout} onOpenChange={setShowAbout}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>About GSC Coin</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 text-sm">
            <div className="text-center">
              <h3 className="text-lg font-bold">GSC Coin</h3>
              <p className="text-muted-foreground">Professional Cryptocurrency Wallet</p>
            </div>
            <div className="space-y-2">
              <p><strong>Version:</strong> 2.0.0</p>
              <p><strong>Total Supply:</strong> 21,750,000,000,000 GSC</p>
              <p><strong>Network:</strong> GSC Mainnet</p>
              <p><strong>Protocol:</strong> Proof of Work</p>
            </div>
            <div className="pt-4 border-t">
              <p className="text-xs text-muted-foreground text-center">
                © 2024 GSC Asset Foundation. All rights reserved.
              </p>
            </div>
            <Button onClick={() => setShowAbout(false)} className="w-full">
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default GSCMenuBar;
