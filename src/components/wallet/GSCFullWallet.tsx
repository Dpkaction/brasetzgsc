import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import { 
  ChevronDown, 
  Copy, 
  Send, 
  Download, 
  Upload,
  Key,
  FileText,
  Plus,
  Check
} from "lucide-react";
import { gscBlockchainService, GSCWallet } from "@/services/gscBlockchain";

const GSCFullWallet = () => {
  const [wallets, setWallets] = useState<GSCWallet[]>([]);
  const [selectedWallet, setSelectedWallet] = useState<string | null>(null);
  const [showCreateWallet, setShowCreateWallet] = useState(false);
  const [showOpenWallet, setShowOpenWallet] = useState(false);
  const [showBackupWallet, setShowBackupWallet] = useState(false);
  const [showRestoreWallet, setShowRestoreWallet] = useState(false);
  const [showPaperWallet, setShowPaperWallet] = useState(false);
  const [showPrivateKey, setShowPrivateKey] = useState(false);
  const [showNameConflict, setShowNameConflict] = useState(false);
  const [conflictWalletName, setConflictWalletName] = useState("");
  const [newWalletName, setNewWalletName] = useState("");
  const [pendingRestoreFile, setPendingRestoreFile] = useState<File | null>(null);
  
  // Form states
  const [walletName, setWalletName] = useState("");
  const [sendAddress, setSendAddress] = useState("");
  const [sendAmount, setSendAmount] = useState("");
  const [sendFee, setSendFee] = useState("0.1");

  useEffect(() => {
    loadWallets();
  }, []);

  const loadWallets = () => {
    const loadedWallets = gscBlockchainService.getWallets();
    setWallets(loadedWallets);
  };

  const getActiveWallet = (): GSCWallet | null => {
    return wallets.find(w => w.name === selectedWallet) || null;
  };

  const handleCreateWallet = () => {
    if (!walletName.trim()) {
      toast({
        title: "Error",
        description: "Please enter a wallet name",
        variant: "destructive",
      });
      return;
    }

    try {
      const newWallet = gscBlockchainService.createWallet(walletName);
      setWallets(prev => [...prev, newWallet]);
      setSelectedWallet(newWallet.name);
      
      toast({
        title: "Wallet Created",
        description: `Successfully created wallet: ${walletName}`,
      });
      
      setShowCreateWallet(false);
      setWalletName("");
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to create wallet: ${error}`,
        variant: "destructive",
      });
    }
  };

  const handleSendTransaction = () => {
    const wallet = getActiveWallet();
    if (!wallet) {
      toast({
        title: "Error",
        description: "No wallet selected",
        variant: "destructive",
      });
      return;
    }

    if (!sendAddress.trim() || !sendAmount.trim()) {
      toast({
        title: "Error",
        description: "Please enter recipient address and amount",
        variant: "destructive",
      });
      return;
    }

    const success = gscBlockchainService.sendTransaction(wallet, sendAddress, parseFloat(sendAmount));
    if (success) {
      setSendAddress("");
      setSendAmount("");
      loadWallets();
    }
  };

  const copyAddress = () => {
    const wallet = getActiveWallet();
    if (wallet) {
      navigator.clipboard.writeText(wallet.address);
      toast({
        title: "Copied",
        description: "Address copied to clipboard",
      });
    }
  };

  const blockchainStats = gscBlockchainService.getBlockchainStats();
  const transactions = getActiveWallet() ? 
    gscBlockchainService.getTransactionHistory(getActiveWallet()!.address) : [];

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700 p-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">VAGS Wallet</h1>
            <p className="text-sm text-gray-400">Production-Grade Blockchain Wallet</p>
          </div>
          
          <div className="flex items-center gap-4">
            {/* Active Wallet Display */}
            {selectedWallet && (
              <div className="text-right">
                <p className="text-sm text-gray-400">Active Wallet</p>
                <p className="text-white font-medium">{selectedWallet}</p>
                <p className="text-xs text-yellow-400">
                  Balance: {getActiveWallet()?.balance?.toFixed(8) || "0.00000000"} GSC
                </p>
              </div>
            )}
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="border-yellow-500/30 hover:bg-yellow-500/10 text-yellow-400">
                  {selectedWallet ? "Wallet Options" : "Select Wallet"}
                  <ChevronDown className="w-4 h-4 ml-2" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-gray-800 border-gray-700 w-64">
                {/* Available Wallets Section */}
                {wallets.length > 0 && (
                  <>
                    <div className="px-2 py-1 text-xs text-gray-400 font-medium">Available Wallets</div>
                    {wallets.map((wallet, index) => (
                      <DropdownMenuItem 
                        key={index}
                        onClick={() => setSelectedWallet(wallet.name)}
                        className={`text-white hover:bg-gray-700 flex flex-col items-start py-3 ${
                          selectedWallet === wallet.name ? 'bg-gray-700' : ''
                        }`}
                      >
                        <div className="flex items-center justify-between w-full">
                          <span className="font-medium">{wallet.name}</span>
                          {selectedWallet === wallet.name && (
                            <Check className="w-4 h-4 text-green-400" />
                          )}
                        </div>
                        <div className="text-xs text-gray-400 mt-1">
                          {wallet.address.substring(0, 20)}...
                        </div>
                        <div className="text-xs text-yellow-400">
                          {wallet.balance.toFixed(8)} GSC
                        </div>
                      </DropdownMenuItem>
                    ))}
                    <DropdownMenuSeparator className="bg-gray-600" />
                  </>
                )}
                
                {/* Wallet Actions */}
                <div className="px-2 py-1 text-xs text-gray-400 font-medium">Wallet Actions</div>
                <DropdownMenuItem onClick={() => setShowCreateWallet(true)} className="text-white hover:bg-gray-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Create New Wallet
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setShowRestoreWallet(true)} className="text-white hover:bg-gray-700">
                  <Upload className="w-4 h-4 mr-2" />
                  Import/Restore Wallet
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-gray-600" />
                <DropdownMenuItem onClick={() => setShowBackupWallet(true)} className="text-white hover:bg-gray-700" disabled={!selectedWallet}>
                  <Download className="w-4 h-4 mr-2" />
                  Backup Wallet
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setShowPrivateKey(true)} className="text-white hover:bg-gray-700" disabled={!selectedWallet}>
                  <Key className="w-4 h-4 mr-2" />
                  Check Private Key
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setShowPaperWallet(true)} className="text-white hover:bg-gray-700">
                  <FileText className="w-4 h-4 mr-2" />
                  Generate Paper Wallet
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Login ID Display */}
        {selectedWallet && (
          <div className="mt-4 p-3 bg-gray-700 rounded">
            <div className="text-sm text-gray-300">Your Login ID (DID)</div>
            <div className="font-mono text-xs text-white break-all">
              {getActiveWallet()?.address || "No wallet selected"}
            </div>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="p-6">
        {selectedWallet && getActiveWallet() ? (
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="bg-gray-800 border-gray-700">
              <TabsTrigger value="overview" className="data-[state=active]:bg-gray-600">Overview</TabsTrigger>
              <TabsTrigger value="send" className="data-[state=active]:bg-gray-600">Send</TabsTrigger>
              <TabsTrigger value="receive" className="data-[state=active]:bg-gray-600">Receive</TabsTrigger>
              <TabsTrigger value="statistics" className="data-[state=active]:bg-gray-600">Statistics</TabsTrigger>
              <TabsTrigger value="blockchain" className="data-[state=active]:bg-gray-600">Blockchain</TabsTrigger>
              <TabsTrigger value="explorer" className="data-[state=active]:bg-gray-600">TX Explorer</TabsTrigger>
              <TabsTrigger value="bc-explorer" className="data-[state=active]:bg-gray-600 text-yellow-400">BC Explorer</TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="bg-gray-800 border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-white">Available Balance</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-green-400">
                      {getActiveWallet()?.balance.toFixed(8)} GSC
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gray-800 border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-white">Send GSC Coins</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label className="text-gray-300">Recipient Address:</Label>
                      <Input
                        value={sendAddress}
                        onChange={(e) => setSendAddress(e.target.value)}
                        placeholder="GSC1..."
                        className="bg-gray-700 border-gray-600 text-white"
                      />
                    </div>
                    <div>
                      <Label className="text-gray-300">Amount:</Label>
                      <Input
                        type="number"
                        value={sendAmount}
                        onChange={(e) => setSendAmount(e.target.value)}
                        placeholder="1.0"
                        className="bg-gray-700 border-gray-600 text-white"
                      />
                    </div>
                    <Button onClick={handleSendTransaction} className="w-full">
                      <Send className="w-4 h-4 mr-2" />
                      Send Transaction
                    </Button>
                  </CardContent>
                </Card>
              </div>

              {/* Transaction History */}
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white">Recent Transactions</CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[300px]">
                    {transactions.length > 0 ? (
                      <div className="space-y-2">
                        {transactions.slice(0, 10).map((tx, index) => (
                          <div key={index} className="flex justify-between items-center p-3 bg-gray-700 rounded">
                            <div>
                              <div className="text-sm font-medium text-white">
                                {tx.sender === getActiveWallet()?.address ? "Sent" : "Received"}
                              </div>
                              <div className="text-xs text-gray-400">{new Date(tx.timestamp * 1000).toLocaleString()}</div>
                            </div>
                            <div className={`font-mono ${tx.sender === getActiveWallet()?.address ? "text-red-400" : "text-green-400"}`}>
                              {tx.sender === getActiveWallet()?.address ? "-" : "+"}{tx.amount.toFixed(8)} GSC
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center text-gray-400 py-8">No transactions found</div>
                    )}
                  </ScrollArea>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Send Tab */}
            <TabsContent value="send" className="space-y-6">
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white">Send GSC Coins</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label className="text-gray-300">Pay To:</Label>
                    <Input
                      value={sendAddress}
                      onChange={(e) => setSendAddress(e.target.value)}
                      placeholder="GSC1..."
                      className="bg-gray-700 border-gray-600 text-white"
                    />
                  </div>
                  <div>
                    <Label className="text-gray-300">Amount:</Label>
                    <Input
                      type="number"
                      value={sendAmount}
                      onChange={(e) => setSendAmount(e.target.value)}
                      placeholder="0.00000000"
                      className="bg-gray-700 border-gray-600 text-white"
                    />
                  </div>
                  <div>
                    <Label className="text-gray-300">Fee:</Label>
                    <Input
                      type="number"
                      value={sendFee}
                      onChange={(e) => setSendFee(e.target.value)}
                      className="bg-gray-700 border-gray-600 text-white"
                    />
                  </div>
                  <Button onClick={handleSendTransaction} className="w-full">
                    <Send className="w-4 h-4 mr-2" />
                    Send
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Receive Tab */}
            <TabsContent value="receive" className="space-y-6">
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white">Your Address</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 bg-gray-700 rounded font-mono text-sm break-all text-white">
                    {getActiveWallet()?.address}
                  </div>
                  <Button onClick={copyAddress} className="w-full">
                    <Copy className="w-4 h-4 mr-2" />
                    Copy Address
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Statistics Tab */}
            <TabsContent value="statistics" className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <Card className="bg-gray-800 border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-white">Network Statistics</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-gray-300">Total Blocks:</span>
                      <span className="text-white">{blockchainStats.totalBlocks}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300">Total Supply:</span>
                      <span className="text-white">{blockchainStats.totalSupply.toLocaleString()} GSC</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300">Network Status:</span>
                      <Badge className="bg-green-600">Online</Badge>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Blockchain Tab */}
            <TabsContent value="blockchain" className="space-y-6">
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white">Imported Blockchain Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-gray-300">Chain Length:</span>
                    <span className="text-white">{blockchainStats.totalBlocks}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Pending Transactions:</span>
                    <span className="text-white">{blockchainStats.pendingTransactions}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Total Wallets:</span>
                    <span className="text-white">{wallets.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Blockchain Status:</span>
                    <Badge className="bg-green-600">Imported & Active</Badge>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* TX Explorer Tab */}
            <TabsContent value="explorer" className="space-y-6">
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white">Transaction Explorer</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <Input
                      placeholder="Enter transaction ID..."
                      className="bg-gray-700 border-gray-600 text-white"
                    />
                    <Button className="w-full">Search Transaction</Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* BC Explorer Tab */}
            <TabsContent value="bc-explorer" className="space-y-6">
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white text-yellow-400">Blockchain Explorer</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded">
                      <h3 className="text-yellow-400 font-semibold mb-2">Imported Blockchain Data</h3>
                      <p className="text-gray-300 text-sm">
                        This blockchain explorer shows data from your imported blockchain file.
                        All balances and transactions reflect the imported state.
                      </p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-3 bg-gray-700 rounded">
                        <div className="text-sm text-gray-400">Latest Block</div>
                        <div className="text-white font-mono">#{blockchainStats.totalBlocks - 1}</div>
                      </div>
                      <div className="p-3 bg-gray-700 rounded">
                        <div className="text-sm text-gray-400">Network Hash Rate</div>
                        <div className="text-white">Active</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        ) : (
          <div className="text-center py-12">
            <h2 className="text-xl font-semibold text-white mb-4">No Wallet Selected</h2>
            <p className="text-gray-400 mb-6">Please select or create a wallet to get started</p>
            <Button onClick={() => setShowCreateWallet(true)} className="mr-4">
              <Plus className="w-4 h-4 mr-2" />
              Create Wallet
            </Button>
            <Button variant="outline" onClick={() => setShowRestoreWallet(true)}>
              <Upload className="w-4 h-4 mr-2" />
              Import Wallet
            </Button>
          </div>
        )}
      </div>
  const [showRestoreWallet, setShowRestoreWallet] = useState(false);
  const [showPaperWallet, setShowPaperWallet] = useState(false);
  const [showPrivateKey, setShowPrivateKey] = useState(false);
  const [showNameConflict, setShowNameConflict] = useState(false);
  const [conflictWalletName, setConflictWalletName] = useState("");
  const [newWalletName, setNewWalletName] = useState("");
  const [pendingRestoreFile, setPendingRestoreFile] = useState<File | null>(null);
  
  // Form states
  const [walletName, setWalletName] = useState("");
  const [sendAddress, setSendAddress] = useState("");
  const [sendAmount, setSendAmount] = useState("");
  const [sendFee, setSendFee] = useState("0.1");

  useEffect(() => {
    loadWallets();
  }, []);

  const loadWallets = () => {
    const loadedWallets = gscBlockchainService.getWallets();
    setWallets(loadedWallets);
  };

  const getActiveWallet = (): GSCWallet | null => {
    return wallets.find(w => w.name === selectedWallet) || null;
  };

  const handleCreateWallet = () => {
    if (!walletName.trim()) {
      toast({
        title: "Error",
        description: "Please enter a wallet name",
        variant: "destructive",
      });
      return;
    }

    try {
      const newWallet = gscBlockchainService.createWallet(walletName);
      setWallets(prev => [...prev, newWallet]);
      setSelectedWallet(newWallet.name);
      
      toast({
        title: "Wallet Created",
        description: `Successfully created wallet: ${walletName}`,
      });
      
      setShowCreateWallet(false);
      setWalletName("");
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to create wallet: ${error}`,
        variant: "destructive",
      });
    }
  };

  const handleSendTransaction = () => {
    const wallet = getActiveWallet();
    if (!wallet) {
      toast({
        title: "Error",
        description: "No wallet selected",
        variant: "destructive",
      });
      return;
    }

    if (!sendAddress.trim() || !sendAmount.trim()) {
      toast({
        title: "Error",
        description: "Please enter recipient address and amount",
        variant: "destructive",
      });
      return;
    }

    const success = gscBlockchainService.sendTransaction(wallet, sendAddress, parseFloat(sendAmount));
    if (success) {
      setSendAddress("");
      setSendAmount("");
      loadWallets();
    }
  };

  const copyAddress = () => {
    const wallet = getActiveWallet();
    if (wallet) {
      navigator.clipboard.writeText(wallet.address);
      toast({
        title: "Copied",
        description: "Address copied to clipboard",
      });
    }
  };

  const blockchainStats = gscBlockchainService.getBlockchainStats();
  const transactions = getActiveWallet() ? 
    gscBlockchainService.getTransactionHistory(getActiveWallet()!.address) : [];

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700 p-4">
        <div className="flex items-center justify-between">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white">VAGS Wallet</h1>
              <p className="text-sm text-gray-400">Production-Grade Blockchain Wallet</p>
            </div>
            
            <div className="flex items-center gap-4">
              {/* Active Wallet Display */}
              {selectedWallet && (
                <div className="text-right">
                  <p className="text-sm text-gray-400">Active Wallet</p>
                  <p className="text-white font-medium">{selectedWallet}</p>
                  <p className="text-xs text-yellow-400">
                    Balance: {getActiveWallet()?.balance?.toFixed(8) || "0.00000000"} GSC
                  </p>
                </div>
              )}
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="border-yellow-500/30 hover:bg-yellow-500/10 text-yellow-400">
                    {selectedWallet ? "Wallet Options" : "Select Wallet"}
                    <ChevronDown className="w-4 h-4 ml-2" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="bg-gray-800 border-gray-700 w-64">
                  {/* Available Wallets Section */}
                  {wallets.length > 0 && (
                    <>
                      <div className="px-2 py-1 text-xs text-gray-400 font-medium">Available Wallets</div>
                      {wallets.map((wallet, index) => (
                        <DropdownMenuItem 
                          key={index}
                          onClick={() => setSelectedWallet(wallet.name)}
                          className={`text-white hover:bg-gray-700 flex flex-col items-start py-3 ${
                            selectedWallet === wallet.name ? 'bg-gray-700' : ''
                          }`}
                        >
                          <div className="flex items-center justify-between w-full">
                            <span className="font-medium">{wallet.name}</span>
                            {selectedWallet === wallet.name && (
                              <Check className="w-4 h-4 text-green-400" />
                            )}
                          </div>
                          <div className="text-xs text-gray-400 mt-1">
                            {wallet.address.substring(0, 20)}...
                          </div>
                          <div className="text-xs text-yellow-400">
                            {wallet.balance.toFixed(8)} GSC
                          </div>
                        </DropdownMenuItem>
                      ))}
                      <DropdownMenuSeparator className="bg-gray-600" />
                    </>
                  )}
                  
                  {/* Wallet Actions */}
                  <div className="px-2 py-1 text-xs text-gray-400 font-medium">Wallet Actions</div>
                  <DropdownMenuItem onClick={() => setShowCreateWallet(true)} className="text-white hover:bg-gray-700">
                    <Plus className="w-4 h-4 mr-2" />
                    Create New Wallet
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setShowRestoreWallet(true)} className="text-white hover:bg-gray-700">
                    <Upload className="w-4 h-4 mr-2" />
                    Import/Restore Wallet
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-gray-600" />
                  <DropdownMenuItem onClick={() => setShowBackupWallet(true)} className="text-white hover:bg-gray-700" disabled={!selectedWallet}>
                    <Download className="w-4 h-4 mr-2" />
                    Backup Wallet
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setShowPrivateKey(true)} className="text-white hover:bg-gray-700" disabled={!selectedWallet}>
                    <Key className="w-4 h-4 mr-2" />
                    Check Private Key
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setShowPaperWallet(true)} className="text-white hover:bg-gray-700">
                    <FileText className="w-4 h-4 mr-2" />
                    Generate Paper Wallet
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* File Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="text-white">File</Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-gray-800 border-gray-600">
              <DropdownMenuItem onClick={() => setShowCreateWallet(true)}>Create Wallet...</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setShowOpenWallet(true)}>Open Wallet</DropdownMenuItem>
              <DropdownMenuItem>Close Wallet</DropdownMenuItem>
              <DropdownMenuItem>Close All Wallets</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setShowBackupWallet(true)}>Backup Wallet...</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setShowRestoreWallet(true)}>Restore Wallet...</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setShowPaperWallet(true)}>Generate Paper Wallet...</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
                <DropdownMenuItem onClick={() => setShowCreateWallet(true)}>Create Wallet...</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setShowOpenWallet(true)}>Open Wallet</DropdownMenuItem>
                <DropdownMenuItem>Close Wallet</DropdownMenuItem>
                <DropdownMenuItem>Close All Wallets</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setShowBackupWallet(true)}>Backup Wallet...</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setShowRestoreWallet(true)}>Restore Wallet...</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setShowPaperWallet(true)}>Generate Paper Wallet...</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Login ID Display */}
        {selectedWallet && (
          <div className="mt-4 p-3 bg-gray-700 rounded">
            <div className="text-sm text-gray-300">Your Login ID (DID)</div>
            <div className="font-mono text-xs text-white break-all">
              {getActiveWallet()?.address || "No wallet selected"}
            </div>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="p-6">
        {selectedWallet && getActiveWallet() ? (
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="bg-gray-800 border-gray-700">
              <TabsTrigger value="overview" className="data-[state=active]:bg-gray-600">Overview</TabsTrigger>
              <TabsTrigger value="send" className="data-[state=active]:bg-gray-600">Send</TabsTrigger>
              <TabsTrigger value="receive" className="data-[state=active]:bg-gray-600">Receive</TabsTrigger>
              <TabsTrigger value="statistics" className="data-[state=active]:bg-gray-600">Statistics</TabsTrigger>
              <TabsTrigger value="blockchain" className="data-[state=active]:bg-gray-600">Blockchain</TabsTrigger>
              <TabsTrigger value="explorer" className="data-[state=active]:bg-gray-600">TX Explorer</TabsTrigger>
              <TabsTrigger value="bc-explorer" className="data-[state=active]:bg-gray-600 text-yellow-400">BC Explorer</TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="bg-gray-800 border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-white">Available Balance</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-green-400">
                      {getActiveWallet()?.balance.toFixed(8)} GSC
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gray-800 border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-white">Send GSC Coins</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label className="text-gray-300">Recipient Address:</Label>
                      <Input
                        value={sendAddress}
                        onChange={(e) => setSendAddress(e.target.value)}
                        placeholder="GSC1..."
                        className="bg-gray-700 border-gray-600 text-white"
                      />
                    </div>
                    <div>
                      <Label className="text-gray-300">Amount:</Label>
                      <Input
                        type="number"
                        value={sendAmount}
                        onChange={(e) => setSendAmount(e.target.value)}
                        placeholder="1.0"
                        className="bg-gray-700 border-gray-600 text-white"
                      />
                    </div>
                    <Button onClick={handleSendTransaction} className="w-full">
                      <Send className="w-4 h-4 mr-2" />
                      Send Transaction
                    </Button>
                  </CardContent>
                </Card>
              </div>

              {/* Transaction History */}
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white">Recent Transactions</CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[300px]">
                    {transactions.length > 0 ? (
                      <div className="space-y-2">
                        {transactions.slice(0, 10).map((tx, index) => (
                          <div key={index} className="flex justify-between items-center p-3 bg-gray-700 rounded">
                            <div>
                              <div className="text-sm font-medium text-white">
                                {tx.sender === getActiveWallet()?.address ? "Sent" : "Received"}
                              </div>
                              <div className="text-xs text-gray-400">{new Date(tx.timestamp * 1000).toLocaleString()}</div>
                            </div>
                            <div className={`font-mono ${tx.sender === getActiveWallet()?.address ? "text-red-400" : "text-green-400"}`}>
                              {tx.sender === getActiveWallet()?.address ? "-" : "+"}{tx.amount.toFixed(8)} GSC
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center text-gray-400 py-8">No transactions found</div>
                    )}
                  </ScrollArea>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Send Tab */}
            <TabsContent value="send" className="space-y-6">
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white">Send GSC Coins</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label className="text-gray-300">Pay To:</Label>
                    <Input
                      value={sendAddress}
                      onChange={(e) => setSendAddress(e.target.value)}
                      placeholder="GSC1..."
                      className="bg-gray-700 border-gray-600 text-white"
                    />
                  </div>
                  <div>
                    <Label className="text-gray-300">Amount:</Label>
                    <Input
                      type="number"
                      value={sendAmount}
                      onChange={(e) => setSendAmount(e.target.value)}
                      placeholder="0.00000000"
                      className="bg-gray-700 border-gray-600 text-white"
                    />
                  </div>
                  <div>
                    <Label className="text-gray-300">Fee:</Label>
                    <Input
                      type="number"
                      value={sendFee}
                      onChange={(e) => setSendFee(e.target.value)}
                      className="bg-gray-700 border-gray-600 text-white"
                    />
                  </div>
                  <Button onClick={handleSendTransaction} className="w-full">
                    <Send className="w-4 h-4 mr-2" />
                    Send
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Receive Tab */}
            <TabsContent value="receive" className="space-y-6">
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white">Your Address</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 bg-gray-700 rounded font-mono text-sm break-all text-white">
                    {getActiveWallet()?.address}
                  </div>
                  <Button onClick={copyAddress} className="w-full">
                    <Copy className="w-4 h-4 mr-2" />
                    Copy Address
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Statistics Tab */}
            <TabsContent value="statistics" className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <Card className="bg-gray-800 border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-white">Network Statistics</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-gray-300">Total Blocks:</span>
                      <span className="text-white">{blockchainStats.totalBlocks}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300">Total Supply:</span>
                      <span className="text-white">{blockchainStats.totalSupply.toLocaleString()} GSC</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300">Network Status:</span>
                      <Badge className="bg-green-600">Online</Badge>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Blockchain Tab */}
            <TabsContent value="blockchain" className="space-y-6">
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white">Blockchain Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-gray-300">Current Block Height:</span>
                      <span className="text-white">{blockchainStats.totalBlocks}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300">Network Difficulty:</span>
                      <span className="text-white">1</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* TX Explorer Tab */}
            <TabsContent value="explorer" className="space-y-6">
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white">Transaction Explorer</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <Input
                      placeholder="Enter transaction ID..."
                      className="bg-gray-700 border-gray-600 text-white"
                    />
                    <Button className="w-full">
                      <Search className="w-4 h-4 mr-2" />
                      Search Transaction
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* BC Explorer Tab */}
            <TabsContent value="bc-explorer" className="space-y-6">
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-yellow-400">Blockchain Explorer</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <Input
                      placeholder="Enter block hash or height..."
                      className="bg-gray-700 border-gray-600 text-white"
                    />
                    <Button className="w-full bg-yellow-600 hover:bg-yellow-700">
                      <Search className="w-4 h-4 mr-2" />
                      Explore Block
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        ) : (
          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="p-8 text-center">
              <Wallet className="w-12 h-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold mb-2 text-white">No Wallet Selected</h3>
              <p className="text-gray-400 mb-4">
                Please create a new wallet or import an existing one to view your GSC balance and transaction history.
              </p>
              <Button onClick={() => setShowCreateWallet(true)}>
                Create Wallet
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Dialogs */}
      <Dialog open={showCreateWallet} onOpenChange={setShowCreateWallet}>
        <DialogContent className="bg-gray-800 border-gray-700">
          <DialogHeader>
            <DialogTitle className="text-white">Create New Wallet</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="text-gray-300">Wallet Name:</Label>
              <Input
                value={walletName}
                onChange={(e) => setWalletName(e.target.value)}
                placeholder="Enter wallet name..."
                className="bg-gray-700 border-gray-600 text-white"
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleCreateWallet} className="flex-1">Create Wallet</Button>
              <Button variant="outline" onClick={() => setShowCreateWallet(false)}>Cancel</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Open Wallet Dialog */}
      <Dialog open={showOpenWallet} onOpenChange={setShowOpenWallet}>
        <DialogContent className="bg-gray-800 border-gray-700">
          <DialogHeader>
            <DialogTitle className="text-white">Open Existing Wallet</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-gray-300">Select Wallet:</Label>
              {wallets.length > 0 ? (
                <div className="space-y-2">
                  {wallets.map((wallet, index) => (
                    <div
                      key={index}
                      className="p-3 border border-gray-600 rounded cursor-pointer hover:bg-gray-700 text-white"
                      onClick={() => {
                        setSelectedWallet(wallet.name);
                        setShowOpenWallet(false);
                        toast({
                          title: "Wallet Opened",
                          description: `Successfully opened wallet: ${wallet.name}`,
                        });
                      }}
                    >
                      <p className="font-medium">{wallet.name}</p>
                      <p className="text-sm text-gray-400">GSC Wallet - {wallet.address.substring(0, 20)}...</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-400">
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
        <DialogContent className="bg-gray-800 border-gray-700">
          <DialogHeader>
            <DialogTitle className="text-white">Backup Wallet</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <p className="text-sm text-gray-300">
                Create a backup of your current wallet. This will download a JSON file containing your wallet data.
              </p>
              {selectedWallet && (
                <div className="p-3 bg-gray-700 rounded">
                  <p className="font-medium text-white">Active Wallet: {selectedWallet}</p>
                </div>
              )}
            </div>
            <div className="flex gap-2">
              <Button 
                onClick={() => {
                  if (!selectedWallet) {
                    toast({
                      title: "Error",
                      description: "No active wallet to backup",
                      variant: "destructive",
                    });
                    return;
                  }
                  
                  const wallet = getActiveWallet();
                  if (!wallet) return;
                  
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
                }}
                className="flex-1" 
                disabled={!selectedWallet}
              >
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
        <DialogContent className="bg-gray-800 border-gray-700">
          <DialogHeader>
            <DialogTitle className="text-white">Restore/Import Wallet</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-gray-300">Select Backup File:</Label>
              <Input
                type="file"
                accept=".backup,.json"
                onChange={async (event) => {
                  const file = event.target.files?.[0];
                  if (!file) return;
                  
                  try {
                    const importedWallet = await gscBlockchainService.importWalletFromBackup(file);
                    setWallets(prev => [...prev, importedWallet]);
                    setSelectedWallet(importedWallet.name);
                    
                    toast({
                      title: "Wallet Restored",
                      description: `Successfully restored wallet: ${importedWallet.name}`,
                    });
                    
                    setShowRestoreWallet(false);
                    loadWallets();
                  } catch (error) {
                    const errorMessage = String(error);
                    if (errorMessage.startsWith('WALLET_EXISTS:')) {
                      // Extract wallet name from error
                      const existingName = errorMessage.replace('WALLET_EXISTS:', '');
                      setConflictWalletName(existingName);
                      setNewWalletName(existingName);
                      setPendingRestoreFile(file);
                      setShowRestoreWallet(false);
                      setShowNameConflict(true);
                    } else {
                      toast({
                        title: "Error",
                        description: `Failed to restore wallet: ${error}`,
                        variant: "destructive",
                      });
                    }
                  }
                }}
                className="bg-gray-700 border-gray-600 text-white cursor-pointer"
              />
              <p className="text-sm text-gray-400">
                Select a wallet backup file (.backup or .json) to restore your wallet.
              </p>
            </div>
            <Button variant="outline" onClick={() => setShowRestoreWallet(false)} className="w-full">
              Cancel
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Check Private Key Dialog */}
      <Dialog open={showPrivateKey} onOpenChange={setShowPrivateKey}>
        <DialogContent className="bg-gray-800 border-gray-700">
          <DialogHeader>
            <DialogTitle className="text-white">Check Private Key</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {selectedWallet && getActiveWallet() ? (
              <>
                <div className="space-y-2">
                  <Label className="text-gray-300">Wallet:</Label>
                  <div className="p-3 bg-gray-700 rounded text-white">
                    {selectedWallet}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-gray-300">Private Key:</Label>
                  <div className="p-3 bg-gray-700 rounded font-mono text-sm text-white break-all">
                    {getActiveWallet()?.private_key}
                  </div>
                  <p className="text-sm text-red-400">
                    ⚠️ Keep your private key secure and never share it with anyone!
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button 
                    onClick={() => {
                      const wallet = getActiveWallet();
                      if (wallet?.private_key) {
                        navigator.clipboard.writeText(wallet.private_key);
                        toast({
                          title: "Private Key Copied",
                          description: "⚠️ Keep your private key secure!",
                          variant: "destructive",
                        });
                      }
                    }}
                    className="flex-1"
                  >
                    <Copy className="w-4 h-4 mr-2" />
                    Copy Private Key
                  </Button>
                  <Button variant="outline" onClick={() => setShowPrivateKey(false)}>
                    Close
                  </Button>
                </div>
              </>
            ) : (
              <>
                <p className="text-gray-400">No wallet selected. Please select a wallet first.</p>
                <Button variant="outline" onClick={() => setShowPrivateKey(false)} className="w-full">
                  Close
                </Button>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Generate Paper Wallet Dialog */}
      <Dialog open={showPaperWallet} onOpenChange={setShowPaperWallet}>
        <DialogContent className="bg-gray-800 border-gray-700">
          <DialogHeader>
            <DialogTitle className="text-white">Generate Paper Wallet</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-gray-300">Number of wallets to generate:</Label>
              <Input
                type="number"
                min="1"
                max="10"
                defaultValue="1"
                className="bg-gray-700 border-gray-600 text-white"
                onChange={(e) => {
                  // Store the count for paper wallet generation
                }}
              />
            </div>
            <div className="flex gap-2">
              <Button 
                onClick={() => {
                  try {
                    const { address, private_key, public_key } = gscBlockchainService.generateAddress();
                    
                    const paperWalletContent = `
GSC COIN PAPER WALLET
Generated: ${new Date().toLocaleString()}
===========================================

PUBLIC ADDRESS (Share this to receive GSC):
${address}

PRIVATE KEY (Keep this SECRET):
${private_key}

PUBLIC KEY:
${public_key}

INSTRUCTIONS:
1. Keep this paper wallet in a safe place
2. Never share your private key with anyone
3. Use the public address to receive GSC coins
4. Import the private key to access your funds

===========================================
GSC Coin - Professional Cryptocurrency
                    `;
                    
                    const blob = new Blob([paperWalletContent], { type: 'text/plain' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `GSC_Paper_Wallet_${Date.now()}.txt`;
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                    URL.revokeObjectURL(url);
                    
                    toast({
                      title: "Paper Wallet Generated",
                      description: "Paper wallet has been downloaded successfully",
                    });
                    
                    setShowPaperWallet(false);
                  } catch (error) {
                    toast({
                      title: "Generation Failed",
                      description: `Failed to generate paper wallet: ${error}`,
                      variant: "destructive",
                    });
                  }
                }}
                className="flex-1"
              >
                Generate Paper Wallet
              </Button>
              <Button variant="outline" onClick={() => setShowPaperWallet(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Wallet Name Conflict Dialog */}
      <Dialog open={showNameConflict} onOpenChange={setShowNameConflict}>
        <DialogContent className="bg-gray-800 border-gray-700">
          <DialogHeader>
            <DialogTitle className="text-white">Wallet Name Conflict</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <p className="text-sm text-gray-300">
                A wallet named "{conflictWalletName}" already exists. Please enter a new name for the wallet you're restoring.
              </p>
              <Label className="text-gray-300">New Wallet Name:</Label>
              <Input
                value={newWalletName}
                onChange={(e) => setNewWalletName(e.target.value)}
                placeholder="Enter new wallet name..."
                className="bg-gray-700 border-gray-600 text-white"
              />
            </div>
            <div className="flex gap-2">
              <Button 
                onClick={async () => {
                  if (!newWalletName.trim()) {
                    toast({
                      title: "Error",
                      description: "Please enter a wallet name",
                      variant: "destructive",
                    });
                    return;
                  }
                  
                  if (!pendingRestoreFile) {
                    toast({
                      title: "Error",
                      description: "No file to restore",
                      variant: "destructive",
                    });
                    return;
                  }
                  
                  try {
                    const importedWallet = await gscBlockchainService.importWalletFromBackup(
                      pendingRestoreFile, 
                      newWalletName.trim()
                    );
                    setWallets(prev => [...prev, importedWallet]);
                    setSelectedWallet(importedWallet.name);
                    
                    toast({
                      title: "Wallet Restored",
                      description: `Successfully restored wallet as: ${importedWallet.name}`,
                    });
                    
                    setShowNameConflict(false);
                    setPendingRestoreFile(null);
                    setNewWalletName("");
                    setConflictWalletName("");
                    loadWallets();
                  } catch (error) {
                    toast({
                      title: "Error",
                      description: `Failed to restore wallet: ${error}`,
                      variant: "destructive",
                    });
                  }
                }}
                className="flex-1"
              >
                Restore with New Name
              </Button>
              <Button 
                variant="outline" 
                onClick={() => {
                  setShowNameConflict(false);
                  setPendingRestoreFile(null);
                  setNewWalletName("");
                  setConflictWalletName("");
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default GSCFullWallet;
