import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/hooks/use-toast";
import { Wallet, Plus, Upload, Download, Key, Eye, EyeOff, Copy, Check, Shield, AlertTriangle, QrCode } from "lucide-react";
import { gscBlockchainService, GSCWallet } from "@/services/gscBlockchain";
import QRCode from "@/components/ui/qr-code";

interface GSCWalletManagerProps {
  activeWallet: string | null;
  onWalletChange: (walletName: string | null) => void;
}

const GSCWalletManager = ({ activeWallet, onWalletChange }: GSCWalletManagerProps) => {
  const [wallets, setWallets] = useState<GSCWallet[]>([]);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [newWalletName, setNewWalletName] = useState("");
  const [newWalletPassphrase, setNewWalletPassphrase] = useState("");
  const [importWalletName, setImportWalletName] = useState("");
  const [importPrivateKey, setImportPrivateKey] = useState("");
  const [showPrivateKey, setShowPrivateKey] = useState(false);
  const [blockchainFile, setBlockchainFile] = useState<File | null>(null);
  const [walletBackupFile, setWalletBackupFile] = useState<File | null>(null);
  const [createdWallet, setCreatedWallet] = useState<GSCWallet | null>(null);
  const [mnemonic, setMnemonic] = useState<string[]>([]);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [mnemonicImport, setMnemonicImport] = useState("");
  const [showQRCode, setShowQRCode] = useState(false);

  useEffect(() => {
    loadWallets();
  }, []);

  const loadWallets = () => {
    // Force refresh wallet balances from blockchain data
    gscBlockchainService.refreshWalletBalances();
    
    const loadedWallets = gscBlockchainService.getWallets();
    
    // Update balances to ensure they're current
    const updatedWallets = loadedWallets.map(wallet => ({
      ...wallet,
      balance: gscBlockchainService.getWalletBalance(wallet.address)
    }));
    setWallets(updatedWallets);
  };

  const handleCreateWallet = async () => {
    if (!newWalletName.trim()) {
      toast({
        title: "Error",
        description: "Please enter a wallet name",
        variant: "destructive",
      });
      return;
    }

    // Validate wallet name length and characters
    if (newWalletName.trim().length < 3) {
      toast({
        title: "Error",
        description: "Wallet name must be at least 3 characters long",
        variant: "destructive",
      });
      return;
    }

    if (!/^[a-zA-Z0-9_\-\s]+$/.test(newWalletName.trim())) {
      toast({
        title: "Error",
        description: "Wallet name can only contain letters, numbers, spaces, hyphens, and underscores",
        variant: "destructive",
      });
      return;
    }

    setIsCreating(true);
    try {
      // Generate mnemonic first
      const generatedMnemonic = gscBlockchainService.generateMnemonic();
      setMnemonic(generatedMnemonic);
      
      // Create wallet with enhanced security
      const wallet = await gscBlockchainService.createWallet(
        newWalletName.trim(), 
        newWalletPassphrase.trim() || undefined
      );
      
      setCreatedWallet(wallet);
      loadWallets();
      onWalletChange(wallet.name);
      
      // Don't show toast here as we'll show the detailed dialog
      // toast({
      //   title: "Wallet Created Successfully",
      //   description: `Wallet "${wallet.name}" created with enhanced security. Please backup your seed phrase!`,
      // });
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to create wallet: ${error}`,
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  const handleImportWallet = async () => {
    if (!importWalletName.trim() || !importPrivateKey.trim()) {
      toast({
        title: "Error",
        description: "Please enter wallet name and private key",
        variant: "destructive",
      });
      return;
    }

    // Validate wallet name
    if (importWalletName.trim().length < 3) {
      toast({
        title: "Error",
        description: "Wallet name must be at least 3 characters long",
        variant: "destructive",
      });
      return;
    }

    try {
      const wallet = await gscBlockchainService.importWallet(
        importWalletName.trim(), 
        importPrivateKey.trim()
      );
      loadWallets();
      onWalletChange(wallet.name);
      setIsImportDialogOpen(false);
      setImportWalletName("");
      setImportPrivateKey("");
      
      toast({
        title: "Wallet Imported Successfully",
        description: `Wallet "${wallet.name}" imported with balance: ${wallet.balance.toFixed(8)} GSC`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to import wallet: ${error}`,
        variant: "destructive",
      });
    }
  };

  const handleImportWalletBackup = async () => {
    if (!walletBackupFile) {
      toast({
        title: "Error",
        description: "Please select a wallet backup file",
        variant: "destructive",
      });
      return;
    }

    try {
      const wallet = await gscBlockchainService.importWalletFromBackup(walletBackupFile);
      loadWallets();
      onWalletChange(wallet.name);
      setIsImportDialogOpen(false);
      setWalletBackupFile(null);
    } catch (error) {
      // Error already handled in service
    }
  };

  const handleImportFromMnemonic = async () => {
    if (!importWalletName.trim() || !mnemonicImport.trim()) {
      toast({
        title: "Error",
        description: "Please enter wallet name and mnemonic phrase",
        variant: "destructive",
      });
      return;
    }

    try {
      const mnemonicWords = mnemonicImport.trim().split(/\s+/);
      if (mnemonicWords.length !== 12) {
        throw new Error("Mnemonic must be exactly 12 words");
      }

      // Generate address from mnemonic
      const { address, privateKey } = await gscBlockchainService.generateAddressFromMnemonic(mnemonicWords);
      
      // Import the wallet
      const wallet = await gscBlockchainService.importWallet(importWalletName.trim(), privateKey);
      
      loadWallets();
      onWalletChange(wallet.name);
      setIsImportDialogOpen(false);
      setImportWalletName("");
      setMnemonicImport("");
      
      toast({
        title: "Wallet Restored Successfully",
        description: `Wallet "${wallet.name}" restored from mnemonic phrase`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to restore wallet: ${error}`,
        variant: "destructive",
      });
    }
  };

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
    toast({ 
      title: "Copied", 
      description: `${field} copied to clipboard` 
    });
  };

  const resetCreateDialog = () => {
    setIsCreateDialogOpen(false);
    setNewWalletName("");
    setNewWalletPassphrase("");
    setCreatedWallet(null);
    setMnemonic([]);
    setCopiedField(null);
    setShowQRCode(false);
    setShowPrivateKey(false);
  };

  const handleImportBlockchain = async () => {
    if (!blockchainFile) {
      toast({
        title: "Error",
        description: "Please select a blockchain file",
        variant: "destructive",
      });
      return;
    }

    const success = await gscBlockchainService.importBlockchain(blockchainFile);
    if (success) {
      loadWallets();
      setBlockchainFile(null);
    }
  };

  const handleExportBlockchain = () => {
    const blockchainData = gscBlockchainService.exportBlockchain();
    const blob = new Blob([blockchainData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `gsc_blockchain_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: "Success",
      description: "Blockchain exported successfully",
    });
  };

  const handleExportWalletBackup = (walletName: string) => {
    try {
      const backupData = gscBlockchainService.exportWalletBackup(walletName);
      const blob = new Blob([backupData], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${walletName}_backup_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast({
        title: "Success",
        description: `Wallet backup exported successfully`,
      });
    } catch (error) {
      toast({
        title: "Export Failed",
        description: `Failed to export wallet backup: ${error}`,
        variant: "destructive",
      });
    }
  };

  const getActiveWalletData = () => {
    return wallets.find(w => w.name === activeWallet);
  };

  return (
    <div className="space-y-4">
      {/* Wallet Selection and Actions */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <Label htmlFor="wallet-select">Active Wallet</Label>
          <Select value={activeWallet || ""} onValueChange={onWalletChange}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select Wallet" />
            </SelectTrigger>
            <SelectContent 
              className="max-h-[300px] overflow-y-auto"
              style={{ maxHeight: '300px', overflowY: 'auto' }}
              position="popper"
              sideOffset={5}
            >
              {wallets.map((wallet) => (
                <SelectItem key={wallet.name} value={wallet.name}>
                  <div className="flex flex-col">
                    <span className="font-medium">{wallet.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {wallet.address.substring(0, 20)}... 
                      ({wallet.balance.toFixed(4)} GSC)
                    </span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex gap-2">
          <Dialog open={isCreateDialogOpen} onOpenChange={(open) => {
            if (!open) {
              resetCreateDialog();
            } else {
              setIsCreateDialogOpen(open);
            }
          }}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Create
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Wallet className="w-5 h-5" />
                  Create New GSC Wallet
                </DialogTitle>
              </DialogHeader>
              
              {!createdWallet ? (
                <div className="space-y-4">
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Shield className="w-4 h-4 text-blue-600" />
                      <span className="text-sm font-medium text-blue-800">Enhanced Security</span>
                    </div>
                    <p className="text-xs text-blue-700">
                      Your wallet will be created with cryptographically secure private keys and a 12-word recovery phrase.
                    </p>
                  </div>
                  
                  <div>
                    <Label htmlFor="wallet-name">Wallet Name *</Label>
                    <Input
                      id="wallet-name"
                      value={newWalletName}
                      onChange={(e) => setNewWalletName(e.target.value)}
                      placeholder="Enter wallet name (min 3 characters)"
                      className="mt-1"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Use letters, numbers, spaces, hyphens, and underscores only
                    </p>
                  </div>
                  
                  <div>
                    <Label htmlFor="wallet-passphrase">Encryption Passphrase (Optional)</Label>
                    <Input
                      id="wallet-passphrase"
                      type="password"
                      value={newWalletPassphrase}
                      onChange={(e) => setNewWalletPassphrase(e.target.value)}
                      placeholder="Enter passphrase for additional encryption"
                      className="mt-1"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Optional: Adds an extra layer of security to your private key
                    </p>
                  </div>
                  
                  <Button 
                    onClick={handleCreateWallet} 
                    className="w-full" 
                    disabled={isCreating}
                  >
                    {isCreating ? "Creating Wallet..." : "Create Wallet"}
                  </Button>
                </div>
              ) : (
                <div className="space-y-0">
                  {/* Success Header */}
                  <div className="text-center py-3 bg-gray-200 border-b border-gray-400">
                    <h2 className="text-lg font-semibold text-gray-800">
                      Wallet '{createdWallet.name}' Created Successfully!
                    </h2>
                  </div>

                  {/* Wallet Details Section */}
                  <div className="bg-gray-200 p-4">
                    <h3 className="font-semibold text-gray-800 mb-3">Wallet Details</h3>
                    
                    <div className="space-y-3">
                      <div>
                        <Label className="text-sm font-semibold text-gray-800">Address:</Label>
                        <Input 
                          value={createdWallet.address} 
                          readOnly 
                          className="font-mono text-xs bg-white mt-1 border-gray-400" 
                        />
                      </div>
                      
                      <div>
                        <Label className="text-sm font-semibold text-gray-800">Private Key:</Label>
                        <Input 
                          value={createdWallet.private_key} 
                          readOnly 
                          type="password"
                          className="font-mono text-xs bg-white mt-1 border-gray-400" 
                        />
                      </div>
                      
                      <div>
                        <Label className="text-sm font-semibold text-gray-800">Public Key:</Label>
                        <Input 
                          value={createdWallet.public_key} 
                          readOnly 
                          className="font-mono text-xs bg-white mt-1 border-gray-400" 
                        />
                      </div>
                      
                      <div>
                        <Label className="text-sm font-semibold text-gray-800">Starting Balance:</Label>
                        <p className="text-sm font-semibold text-gray-800 mt-1">{createdWallet.balance.toFixed(8)} GSC</p>
                      </div>
                    </div>
                  </div>

                  {/* Important Backup Section */}
                  <div className="bg-gray-200 p-4 border-t border-gray-400">
                    <div className="mb-3">
                      <span className="text-sm font-semibold text-gray-800">IMPORTANT: Backup Seed Phrase</span>
                    </div>
                    
                    <div className="bg-white border border-gray-400 rounded p-3">
                      <div className="text-sm font-mono text-gray-800 leading-relaxed">
                        {mnemonic.join(' ')}
                      </div>
                    </div>
                    
                    <p className="text-sm text-red-600 mt-2 text-center font-semibold">
                      Keep this seed phrase safe - it's needed to recover your wallet!
                    </p>
                  </div>

                  {/* QR Code Display */}
                  {showQRCode && (
                    <div className="bg-gray-200 p-4 border-t border-gray-400">
                      <div className="bg-white border border-gray-400 rounded p-4 text-center">
                        <QRCode 
                          value={createdWallet.address} 
                          size={200} 
                          className="mx-auto mb-2"
                        />
                        <p className="text-xs font-mono text-gray-600 break-all">
                          {createdWallet.address}
                        </p>
                      </div>
                    </div>
                  )}
                  
                  {/* Action Buttons */}
                  <div className="bg-gray-200 p-4 flex gap-2 justify-center border-t border-gray-400">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowQRCode(!showQRCode)}
                      className="bg-gray-300 border-gray-500 text-gray-800 hover:bg-gray-400"
                    >
                      {showQRCode ? 'Hide QR Code' : 'Show QR Code'}
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(createdWallet.address, 'Address')}
                      className="bg-gray-300 border-gray-500 text-gray-800 hover:bg-gray-400"
                    >
                      Copy Address
                    </Button>
                    
                    <Button 
                      onClick={resetCreateDialog} 
                      size="sm"
                      className="bg-gray-500 hover:bg-gray-600 text-white border-gray-600"
                    >
                      Close
                    </Button>
                  </div>
                </div>
              )}
            </DialogContent>
          </Dialog>

          <Dialog open={isImportDialogOpen} onOpenChange={setIsImportDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Key className="w-4 h-4 mr-2" />
                Import
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Import GSC Wallet</DialogTitle>
              </DialogHeader>
              <Tabs defaultValue="wallet" className="space-y-4">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="wallet">Private Key</TabsTrigger>
                  <TabsTrigger value="mnemonic">Recovery Phrase</TabsTrigger>
                  <TabsTrigger value="backup">Backup File</TabsTrigger>
                  <TabsTrigger value="blockchain">Blockchain</TabsTrigger>
                </TabsList>
                
                <TabsContent value="wallet" className="space-y-4">
                  <div>
                    <Label htmlFor="import-wallet-name">Wallet Name</Label>
                    <Input
                      id="import-wallet-name"
                      value={importWalletName}
                      onChange={(e) => setImportWalletName(e.target.value)}
                      placeholder="Enter wallet name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="import-private-key">Private Key</Label>
                    <div className="relative">
                      <Input
                        id="import-private-key"
                        type={showPrivateKey ? "text" : "password"}
                        value={importPrivateKey}
                        onChange={(e) => setImportPrivateKey(e.target.value)}
                        placeholder="Enter private key"
                        className="pr-10"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3"
                        onClick={() => setShowPrivateKey(!showPrivateKey)}
                      >
                        {showPrivateKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </Button>
                    </div>
                  </div>
                  <Button onClick={handleImportWallet} className="w-full">
                    Import Wallet
                  </Button>
                </TabsContent>
                
                <TabsContent value="mnemonic" className="space-y-4">
                  <div>
                    <Label htmlFor="import-wallet-name-mnemonic">Wallet Name</Label>
                    <Input
                      id="import-wallet-name-mnemonic"
                      value={importWalletName}
                      onChange={(e) => setImportWalletName(e.target.value)}
                      placeholder="Enter wallet name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="mnemonic-phrase">12-Word Recovery Phrase</Label>
                    <Input
                      id="mnemonic-phrase"
                      value={mnemonicImport}
                      onChange={(e) => setMnemonicImport(e.target.value)}
                      placeholder="Enter your 12-word recovery phrase separated by spaces"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Enter all 12 words separated by spaces
                    </p>
                  </div>
                  <Button onClick={handleImportFromMnemonic} className="w-full">
                    <Key className="w-4 h-4 mr-2" />
                    Restore from Recovery Phrase
                  </Button>
                </TabsContent>
                
                <TabsContent value="backup" className="space-y-4">
                  <div>
                    <Label htmlFor="wallet-backup-file">Wallet Backup File</Label>
                    <Input
                      id="wallet-backup-file"
                      type="file"
                      accept=".json,.backup"
                      onChange={(e) => setWalletBackupFile(e.target.files?.[0] || null)}
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Select a GSC wallet backup file (.json or .backup)
                    </p>
                  </div>
                  <Button onClick={handleImportWalletBackup} className="w-full">
                    <Upload className="w-4 h-4 mr-2" />
                    Import from Backup
                  </Button>
                </TabsContent>
                
                <TabsContent value="blockchain" className="space-y-4">
                  <div>
                    <Label htmlFor="blockchain-file">Blockchain File</Label>
                    <Input
                      id="blockchain-file"
                      type="file"
                      accept=".json"
                      onChange={(e) => setBlockchainFile(e.target.files?.[0] || null)}
                    />
                  </div>
                  <Button onClick={handleImportBlockchain} className="w-full">
                    <Upload className="w-4 h-4 mr-2" />
                    Import Blockchain
                  </Button>
                </TabsContent>
              </Tabs>
            </DialogContent>
          </Dialog>

          <Button variant="outline" size="sm" onClick={handleExportBlockchain}>
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Active Wallet Info */}
      {getActiveWalletData() && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wallet className="w-5 h-5" />
              {getActiveWalletData()?.name}
            </CardTitle>
            <CardDescription>GSC Blockchain Wallet</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium">Balance</Label>
                <p className="text-2xl font-bold text-green-600">
                  {getActiveWalletData()?.balance.toFixed(8)} GSC
                </p>
              </div>
              <div>
                <Label className="text-sm font-medium">Address</Label>
                <p className="font-mono text-xs break-all">
                  {getActiveWalletData()?.address}
                </p>
              </div>
            </div>
            <div>
              <Label className="text-sm font-medium">Created</Label>
              <p className="text-sm text-muted-foreground">
                {new Date(getActiveWalletData()?.created || "").toLocaleDateString()}
              </p>
            </div>
            <div className="flex gap-2 pt-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => handleExportWalletBackup(getActiveWalletData()?.name || "")}
              >
                <Download className="w-4 h-4 mr-2" />
                Export Backup
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Blockchain Stats */}
      <Card>
        <CardHeader>
          <CardTitle>GSC Blockchain Stats</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold">{gscBlockchainService.getBlockchainStats().totalBlocks}</p>
              <p className="text-sm text-muted-foreground">Total Blocks</p>
            </div>
            <div>
              <p className="text-2xl font-bold">{gscBlockchainService.getBlockchainStats().totalWallets}</p>
              <p className="text-sm text-muted-foreground">Total Wallets</p>
            </div>
            <div>
              <p className="text-2xl font-bold">{gscBlockchainService.getBlockchainStats().pendingTransactions}</p>
              <p className="text-sm text-muted-foreground">Pending TXs</p>
            </div>
            <div>
              <p className="text-2xl font-bold">21.75T</p>
              <p className="text-sm text-muted-foreground">Total Supply</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default GSCWalletManager;
