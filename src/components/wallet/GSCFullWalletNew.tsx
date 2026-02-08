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
  Check,
  MoreVertical,
  Trash2,
  Edit,
  RefreshCw
} from "lucide-react";
import { gscBlockchainService, GSCWallet } from "@/services/gscBlockchain";

const GSCFullWallet = () => {
  const [wallets, setWallets] = useState<GSCWallet[]>([]);
  const [selectedWallet, setSelectedWallet] = useState<string | null>(null);
  const [showCreateWallet, setShowCreateWallet] = useState(false);
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
  const [isSendingTransaction, setIsSendingTransaction] = useState(false);
  const [isSendingYellowSend, setIsSendingYellowSend] = useState(false);
  
  // Transaction history state
  const [transactionHistory, setTransactionHistory] = useState<Array<{
    transaction: any;
    type: 'sent' | 'received';
    amount: number;
    counterparty: string;
    timestamp: number;
    date: string;
  }>>([]);
  const [selectedTransaction, setSelectedTransaction] = useState<any>(null);
  const [showTransactionDetails, setShowTransactionDetails] = useState(false);
  
  // Transaction Explorer state
  const [searchTxId, setSearchTxId] = useState("");
  const [searchResult, setSearchResult] = useState<any>(null);
  const [searchError, setSearchError] = useState("");

  useEffect(() => {
    loadWallets();
  }, []);

  useEffect(() => {
    loadTransactionHistory();
  }, [selectedWallet]);

  const loadWallets = () => {
    try {
      const loadedWallets = gscBlockchainService.getWallets();
      console.log("=== LOADING WALLETS ===");
      console.log("Loaded wallets from service:", loadedWallets);
      
      // Ensure loadedWallets is an array
      if (!Array.isArray(loadedWallets)) {
        console.warn("getWallets() did not return an array, using empty array");
        setWallets([]);
        return;
      }
      
      // Update each wallet with real blockchain balance
      const walletsWithRealBalance = loadedWallets.map(wallet => {
        if (!wallet || !wallet.address) {
          console.warn("Invalid wallet object:", wallet);
          return wallet;
        }
        
        const balance = gscBlockchainService.getWalletBalance(wallet.address);
        console.log(`Wallet ${wallet.address}: balance ${balance} GSC`);
        return {
          ...wallet,
          balance: balance || 0
        };
      });
      
      setWallets(walletsWithRealBalance);
      console.log("Wallets with real balance:", walletsWithRealBalance);
      
      // Set first wallet as selected if none selected, but prioritize GSC1705641e65321ef23ac5fb3d470f39627
      const targetWallet = walletsWithRealBalance.find(w => w && w.address === "GSC1705641e65321ef23ac5fb3d470f39627");
      if (targetWallet && !selectedWallet) {
        console.log("Setting target wallet as selected:", targetWallet.name);
        setSelectedWallet(targetWallet.name);
      } else if (walletsWithRealBalance.length > 0 && !selectedWallet && walletsWithRealBalance[0]) {
        console.log("Setting first wallet as selected:", walletsWithRealBalance[0].name);
        setSelectedWallet(walletsWithRealBalance[0].name);
      }
      
      // Load transaction history for the active wallet
      setTimeout(() => loadTransactionHistory(), 100);
    } catch (error) {
      console.error("Error loading wallets:", error);
      setWallets([]);
    }
  };

  const getActiveWallet = (): GSCWallet | null => {
    if (!Array.isArray(wallets) || wallets.length === 0) {
      return null;
    }
    return wallets.find(w => w && w.name === selectedWallet) || null;
  };

  const loadTransactionHistory = () => {
    try {
      const activeWallet = getActiveWallet();
      console.log("=== LOADING TRANSACTION HISTORY ===");
      
      if (activeWallet) {
        const transactions = gscBlockchainService.getTransactionHistory(activeWallet.address);
        setTransactionHistory(transactions);
        // Transform raw transactions into the expected format
        const transformedHistory = Array.isArray(history) ? history.map(tx => {
          if (!tx || !tx.tx_id) {
            console.warn("Invalid transaction object:", tx);
            return null;
          }
          
          const isSent = tx.sender === activeWallet.address;
          const counterparty = isSent ? tx.receiver : tx.sender;
          const date = new Date(tx.timestamp * 1000).toLocaleDateString();
          
          return {
            transaction: tx,
            type: isSent ? 'sent' as const : 'received' as const,
            amount: isSent ? -tx.amount : tx.amount,
            counterparty: counterparty,
            timestamp: tx.timestamp,
            date: date
          };
        }).filter(item => item !== null) : [];
        
        setTransactionHistory(transformedHistory);
      } else {
        console.log("No active wallet found");
        setTransactionHistory([]);
      }
    } catch (error) {
      console.error("Error loading transaction history:", error);
      setTransactionHistory([]);
    }
  };

  const reloadWalletAndBlockchain = () => {
    console.log("=== RELOADING WALLET AND BLOCKCHAIN ===");
    loadWallets();
    loadTransactionHistory();
    // Automatically refresh blockchain data
    gscBlockchainService.refreshBlockchainData();
    toast({
      title: "Wallet Reloaded",
      description: "Wallet and blockchain data refreshed successfully",
    });
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

  const handleSendTransaction = async () => {
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

    // Validate minimum fee
    const feeAmount = parseFloat(sendFee);
    if (isNaN(feeAmount) || feeAmount < 0.1) {
      toast({
        title: "Error",
        description: "Minimum transaction fee is 0.1 GSC",
        variant: "destructive",
      });
      return;
    }

    setIsSendingTransaction(true);
    setIsSendingYellowSend(true);

    try {
      // Debug logging before transaction
      console.log("=== WALLET UI DEBUG ===");
      console.log("Selected wallet:", wallet);
      console.log("Wallet address:", wallet.address);
      console.log("Wallet balance (UI):", wallet.balance);
      console.log("Send address:", sendAddress);
      console.log("Send amount:", parseFloat(sendAmount));
      
      // Get fresh balance from blockchain service
      const freshBalance = gscBlockchainService.getWalletBalance(wallet.address);
      console.log("Fresh balance from service:", freshBalance);

      const success = await gscBlockchainService.sendTransaction(wallet, sendAddress, parseFloat(sendAmount));
      if (success) {
        setSendAddress("");
        setSendAmount("");
        loadWallets();
        loadTransactionHistory(); // Refresh transaction history after sending
      }
    } catch (error) {
      console.error("Send transaction error:", error);
      toast({
        title: "Transaction Failed",
        description: "Failed to send transaction. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSendingTransaction(false);
      setIsSendingYellowSend(false);
    }
  };

  const copyAddress = () => {
    const wallet = getActiveWallet();
    if (wallet) {
      navigator.clipboard.writeText(wallet.address);
      toast({
        title: "Address Copied",
        description: "Wallet address copied to clipboard",
      });
    }
  };

  const handleTransactionClick = (historyItem: any) => {
    setSelectedTransaction(historyItem.transaction);
    setShowTransactionDetails(true);
  };

  const copyTransactionId = () => {
    if (selectedTransaction?.tx_id) {
      navigator.clipboard.writeText(selectedTransaction.tx_id);
      toast({
        title: "Transaction ID Copied",
        description: "Transaction ID copied to clipboard",
      });
    }
  };

  const handleSearchTransaction = () => {
    if (!searchTxId.trim()) {
      setSearchError("Please enter a transaction ID");
      return;
    }

    setSearchError("");
    const result = gscBlockchainService.searchTransactionById(searchTxId.trim());
    
    if (result) {
      setSearchResult(result);
      toast({
        title: "Transaction Found",
        description: `Found transaction: ${searchTxId.substring(0, 20)}...`,
      });
    } else {
      setSearchResult(null);
      setSearchError("Transaction not found in blockchain");
      toast({
        title: "Transaction Not Found",
        description: "No transaction found with this ID",
        variant: "destructive",
      });
    }
  };

  const handleRestoreWallet = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const backupData = JSON.parse(e.target?.result as string);
        
        // Handle different backup formats
        let walletData;
        if (backupData.wallet_data) {
          // Complex backup format with nested wallet_data
          walletData = {
            name: backupData.wallet_name || backupData.wallet_data.name,
            address: backupData.wallet_data.master_address,
            private_key: backupData.wallet_data.master_private_key,
            public_key: backupData.wallet_data.master_public_key,
            balance: backupData.wallet_data.balance || 0,
            created: backupData.wallet_data.created,
            encrypted: backupData.wallet_data.encrypted || false
          };
        } else {
          // Simple backup format
          walletData = backupData;
        }
        
        // Check if wallet name already exists
        const existingWallet = Array.isArray(wallets) ? wallets.find(w => w && w.name === walletData.name) : null;
        if (existingWallet) {
          setConflictWalletName(walletData.name);
          setPendingRestoreFile(file);
          setShowNameConflict(true);
          return;
        }

        // Import wallet directly using the exact address from backup file
        const importedWallet = gscBlockchainService.importWalletWithAddress(
          walletData.name, 
          walletData.address, // Use exact address from backup file
          walletData.private_key,
          walletData.public_key
        );
        
        // Always update balance from blockchain data, ignore backup file balance
        const blockchainBalance = gscBlockchainService.getWalletBalance(walletData.address);
        importedWallet.balance = blockchainBalance; // Use blockchain balance, not backup balance
        
        setWallets(prev => [...prev, importedWallet]);
        setSelectedWallet(importedWallet.name);
        
        // Force reload transaction history for the imported wallet
        setTimeout(() => {
          loadTransactionHistory();
        }, 100);
        
        toast({
          title: "Wallet Imported",
          description: `Successfully imported wallet: ${importedWallet.name}. Balance: ${importedWallet.balance.toFixed(8)} GSC`,
        });
        
        setShowRestoreWallet(false);
      } catch (error) {
        toast({
          title: "Import Failed",
          description: `Failed to import wallet: ${error}`,
          variant: "destructive",
        });
      }
    };
    reader.readAsText(file);
  };

  const handleNameConflictResolve = () => {
    if (!pendingRestoreFile || !newWalletName.trim()) {
      toast({
        title: "Error",
        description: "Please enter a new wallet name",
        variant: "destructive",
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const backupData = JSON.parse(e.target?.result as string);
        
        // Handle different backup formats
        let walletData;
        if (backupData.wallet_data) {
          // Complex backup format with nested wallet_data
          walletData = {
            name: newWalletName,
            address: backupData.wallet_data.master_address,
            private_key: backupData.wallet_data.master_private_key,
            public_key: backupData.wallet_data.master_public_key,
            balance: backupData.wallet_data.balance || 0,
            created: backupData.wallet_data.created,
            encrypted: backupData.wallet_data.encrypted || false
          };
        } else {
          // Simple backup format
          walletData = backupData;
          walletData.name = newWalletName;
        }
        
        const importedWallet = gscBlockchainService.importWalletWithAddress(
          newWalletName, 
          walletData.address, // Use exact address from backup file
          walletData.private_key,
          walletData.public_key
        );
        
        // Always update balance from blockchain data, ignore backup file balance
        const blockchainBalance = gscBlockchainService.getWalletBalance(walletData.address);
        importedWallet.balance = blockchainBalance; // Use blockchain balance, not backup balance
        
        setWallets(prev => [...prev, importedWallet]);
        setSelectedWallet(importedWallet.name);
        
        // Force reload transaction history for the imported wallet
        setTimeout(() => {
          loadTransactionHistory();
        }, 100);
        
        toast({
          title: "Wallet Imported",
          description: `Successfully imported wallet: ${importedWallet.name}. Balance: ${importedWallet.balance.toFixed(8)} GSC`,
        });
        
        setShowNameConflict(false);
        setShowRestoreWallet(false);
        setNewWalletName("");
        setPendingRestoreFile(null);
      } catch (error) {
        toast({
          title: "Import Failed",
          description: `Failed to import wallet: ${error}`,
          variant: "destructive",
        });
      }
    };
    reader.readAsText(pendingRestoreFile);
  };

  const handleBackupWallet = () => {
    const wallet = getActiveWallet();
    if (!wallet) return;

    const walletBackup = {
      name: wallet.name,
      address: wallet.address,
      private_key: wallet.private_key,
      public_key: wallet.public_key,
      balance: wallet.balance,
      created: wallet.created,
      encrypted: wallet.encrypted
    };

    const dataStr = JSON.stringify(walletBackup, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `${wallet.name}_backup.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast({
      title: "Backup Created",
      description: `Wallet backup downloaded: ${wallet.name}_backup.json`,
    });

    setShowBackupWallet(false);
  };

  const blockchainStats = gscBlockchainService.getBlockchainStats();

  return (
    <div className="w-full max-w-7xl mx-auto p-3 sm:p-4 lg:p-6 space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-lg p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-white">VAGS Wallet</h1>
            <p className="text-sm text-gray-400">Production-Grade Blockchain Wallet</p>
          </div>
          
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
            {/* Active Wallet Display */}
            {selectedWallet && (
              <div className="text-center sm:text-right">
                <p className="text-sm text-gray-400">Active Wallet</p>
                <p className="text-white font-medium truncate max-w-[200px]">{selectedWallet}</p>
                <p className="text-xs text-yellow-400">
                  Balance: {getActiveWallet()?.balance?.toFixed(8) || "0.00000000"} GSC
                </p>
              </div>
            )}
            
            {/* Reload Button */}
            <Button
              onClick={reloadWalletAndBlockchain}
              variant="outline"
              className="border-blue-500/30 hover:bg-blue-500/10 text-blue-400 w-full sm:w-auto"
              title="Reload Wallet"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              (open after create or import)
            </Button>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="border-yellow-500/30 hover:bg-yellow-500/10 text-yellow-400 w-full sm:w-auto">
                  {selectedWallet ? "Wallet Options" : "Select Wallet"}
                  <ChevronDown className="w-4 h-4 ml-2" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-gray-800 border-gray-700 w-64">
                {/* Available Wallets Section */}
                {Array.isArray(wallets) && wallets.length > 0 && (
                  <>
                    <div className="px-2 py-1 text-xs text-gray-400 font-medium">Available Wallets</div>
                    {wallets.map((wallet, index) => {
                      if (!wallet || !wallet.name || !wallet.address) {
                        return null;
                      }
                      return (
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
                            {(wallet.balance || 0).toFixed(8)} GSC
                          </div>
                        </DropdownMenuItem>
                      );
                    })}
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
                <DropdownMenuSeparator className="bg-gray-600" />
                <DropdownMenuItem onClick={async () => {
                  try {
                    // Store current selected wallet to restore after refresh
                    const currentSelectedWallet = selectedWallet;
                    
                    // Import fresh blockchain data from server
                    const { supabaseBlockchainService } = await import("@/services/supabaseBlockchain");
                    await supabaseBlockchainService.importFromServer();
                    
                    // Refresh blockchain while preserving existing wallets
                    gscBlockchainService.refreshBlockchainData();
                    
                    // Reload wallets and transaction history
                    loadWallets();
                    
                    // Restore selected wallet after a short delay to ensure wallets are loaded
                    setTimeout(() => {
                      if (currentSelectedWallet) {
                        const updatedWallets = gscBlockchainService.getWallets();
                        const walletStillExists = updatedWallets.find(w => w && w.name === currentSelectedWallet);
                        if (walletStillExists) {
                          setSelectedWallet(currentSelectedWallet);
                        } else if (updatedWallets.length > 0) {
                          // If current wallet doesn't exist, select the first available wallet
                          setSelectedWallet(updatedWallets[0].name);
                        }
                      } else if (gscBlockchainService.getWallets().length > 0) {
                        // If no wallet was selected, select the first available wallet
                        setSelectedWallet(gscBlockchainService.getWallets()[0].name);
                      }
                      loadTransactionHistory();
                    }, 100);
                    
                    toast({
                      title: "Blockchain Refreshed",
                      description: "Blockchain data updated while preserving your wallets",
                    });
                  } catch (error) {
                    console.error("Error refreshing blockchain:", error);
                    toast({
                      title: "Refresh Failed",
                      description: "Failed to refresh blockchain data",
                      variant: "destructive",
                    });
                  }
                }} className="text-blue-400 hover:bg-gray-700">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Refresh Blockchain
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-gray-600" />
                <DropdownMenuItem onClick={() => {
                  console.log("Force refreshing transaction history...");
                  loadTransactionHistory();
                }} className="text-purple-400 hover:bg-gray-700">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Refresh Transaction History
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            
            {/* Login ID Display */}
            {getActiveWallet() && (
              <div className="font-mono text-xs text-white break-all">
                {getActiveWallet()?.address || "No wallet selected"}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      {Array.isArray(wallets) && wallets.length > 0 && selectedWallet && getActiveWallet() ? (
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="bg-gray-800/50 border-gray-700 w-full overflow-x-auto scrollbar-hide">
            <div className="flex min-w-max gap-1 p-1">
              <TabsTrigger value="overview" className="data-[state=active]:bg-gray-600 text-xs sm:text-sm px-3 py-2 whitespace-nowrap">Overview</TabsTrigger>
              <TabsTrigger value="send" className="data-[state=active]:bg-gray-600 text-xs sm:text-sm px-3 py-2 whitespace-nowrap">Send</TabsTrigger>
              <TabsTrigger value="receive" className="data-[state=active]:bg-gray-600 text-xs sm:text-sm px-3 py-2 whitespace-nowrap">Receive</TabsTrigger>
              <TabsTrigger value="statistics" className="data-[state=active]:bg-gray-600 text-xs sm:text-sm px-3 py-2 whitespace-nowrap">Statistics</TabsTrigger>
              <TabsTrigger value="blockchain" className="data-[state=active]:bg-gray-600 text-xs sm:text-sm px-3 py-2 whitespace-nowrap">Blockchain</TabsTrigger>
              <TabsTrigger value="explorer" className="data-[state=active]:bg-gray-600 text-xs sm:text-sm px-3 py-2 whitespace-nowrap">TX Explorer</TabsTrigger>
              <TabsTrigger value="bc-explorer" className="data-[state=active]:bg-gray-600 text-yellow-400 text-xs sm:text-sm px-3 py-2 whitespace-nowrap">BC Explorer</TabsTrigger>
            </div>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-4 sm:space-y-6 mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              <Card className="bg-gray-800/50 border-gray-700">
                <CardHeader className="pb-3">
                  <CardTitle className="text-white text-lg">Available Balance</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl sm:text-3xl font-bold text-green-400">
                    {getActiveWallet()?.balance.toFixed(8)} GSC
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gray-800/50 border-gray-700">
                <CardHeader className="pb-3">
                  <CardTitle className="text-white text-lg">Send GSC Coins</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label className="text-gray-300 text-sm">Recipient Address:</Label>
                    <Input
                      value={sendAddress}
                      onChange={(e) => setSendAddress(e.target.value)}
                      placeholder="GSC1..."
                      className="bg-gray-700 border-gray-600 text-white mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-gray-300 text-sm">Amount:</Label>
                    <Input
                      type="number"
                      value={sendAmount}
                      onChange={(e) => setSendAmount(e.target.value)}
                      placeholder="1.0"
                      className="bg-gray-700 border-gray-600 text-white mt-1"
                    />
                  </div>
                  <Button onClick={handleSendTransaction} className="w-full bg-blue-600 hover:bg-blue-700" disabled={isSendingTransaction}>
                    {isSendingTransaction ? (
                      <>
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                        Sending Transaction...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4 mr-2" />
                        Send Transaction
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Transaction History */}
            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader className="pb-3">
                <CardTitle className="text-white text-lg">Recent Transactions</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[250px] sm:h-[300px]">
                  {Array.isArray(transactionHistory) && transactionHistory.length > 0 ? (
                    <div className="space-y-2">
                      {transactionHistory.slice(0, 10).map((historyItem, index) => {
                        // Safety check to ensure historyItem and transaction exist
                        if (!historyItem || !historyItem.transaction || !historyItem.transaction.tx_id) {
                          console.warn("Invalid history item at index", index, historyItem);
                          return null;
                        }
                        
                        return (
                          <div 
                            key={historyItem.transaction.tx_id || index} 
                            className="flex justify-between items-center p-3 bg-gray-700 rounded cursor-pointer hover:bg-gray-600 transition-colors"
                            onClick={() => handleTransactionClick(historyItem)}
                          >
                            <div className="flex-1">
                              <div className="text-white font-medium mb-1">
                                {historyItem.type === 'sent' ? 'Sent' : 'Received'}
                              </div>
                              <div className="font-mono text-blue-400 text-sm break-all">
                                {historyItem.transaction.tx_id}
                              </div>
                              <div className="text-gray-500 text-xs mt-1">
                                Click to view full details
                              </div>
                            </div>
                            <div className="text-right ml-4">
                              <div className={`font-medium ${historyItem.type === 'sent' ? 'text-red-400' : 'text-green-400'}`}>
                                {historyItem.amount > 0 ? '+' : ''}{(historyItem.amount || 0).toFixed(8)} GSC
                              </div>
                              <div className="text-gray-400 text-sm">
                                {new Date((historyItem.timestamp || Date.now() / 1000) * 1000).toLocaleDateString()}
                              </div>
                            </div>
                          </div>
                        );
                      }).filter(item => item !== null)}
                    </div>
                  ) : (
                    <div className="text-center text-gray-400 py-8">
                      No transactions found
                    </div>
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
                    <Label className="text-gray-300">Fee (Minimum 0.1 GSC):</Label>
                    <Input
                      type="number"
                      step="0.1"
                      min="0.1"
                      value={sendFee}
                      onChange={(e) => setSendFee(e.target.value)}
                      className="bg-gray-700 border-gray-600 text-white"
                      placeholder="0.1"
                    />
                  </div>
                  <Button onClick={handleSendTransaction} className="w-full" disabled={isSendingYellowSend}>
                    {isSendingYellowSend ? (
                      <>
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4 mr-2" />
                        Send
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Receive Tab */}
            <TabsContent value="receive" className="space-y-4 sm:space-y-6">
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader className="pb-3">
                  <CardTitle className="text-white text-lg">Your Address</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-3 sm:p-4 bg-gray-700 rounded-lg">
                    <div className="font-mono text-xs sm:text-sm break-all text-white leading-relaxed">
                      {getActiveWallet()?.address}
                    </div>
                  </div>
                  <Button onClick={copyAddress} className="w-full py-2 sm:py-3">
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
                      value={searchTxId}
                      onChange={(e) => setSearchTxId(e.target.value)}
                      className="bg-gray-700 border-gray-600 text-white"
                      onKeyPress={(e) => e.key === 'Enter' && handleSearchTransaction()}
                    />
                    <Button onClick={handleSearchTransaction} className="w-full">
                      Search Transaction
                    </Button>
                    
                    {searchError && (
                      <div className="p-3 bg-red-500/20 border border-red-500/50 rounded text-red-400 text-sm">
                        {searchError}
                      </div>
                    )}
                    
                    {searchResult && (
                      <Card className="bg-gray-700 border-gray-600">
                        <CardHeader>
                          <CardTitle className="text-white text-lg">Transaction Details</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="grid grid-cols-1 gap-4">
                            <div className="p-3 bg-gray-600 rounded">
                              <Label className="text-gray-300 text-sm">Transaction ID:</Label>
                              <div className="flex items-center gap-2 mt-1">
                                <div className="font-mono text-white text-sm break-all bg-gray-800 p-2 rounded flex-1">
                                  {searchResult.tx_id}
                                </div>
                                <Button 
                                  size="sm" 
                                  onClick={() => {
                                    navigator.clipboard.writeText(searchResult.tx_id);
                                    toast({
                                      title: "Transaction ID Copied",
                                      description: "Transaction ID copied to clipboard",
                                    });
                                  }}
                                  className="shrink-0"
                                >
                                  <Copy className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4">
                              <div className="p-3 bg-gray-600 rounded">
                                <Label className="text-gray-300 text-sm">From:</Label>
                                <div className="font-mono text-white text-sm break-all mt-1">
                                  {searchResult.sender}
                                </div>
                              </div>
                              <div className="p-3 bg-gray-600 rounded">
                                <Label className="text-gray-300 text-sm">To:</Label>
                                <div className="font-mono text-white text-sm break-all mt-1">
                                  {searchResult.receiver}
                                </div>
                              </div>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4">
                              <div className="p-3 bg-gray-600 rounded">
                                <Label className="text-gray-300 text-sm">Amount:</Label>
                                <div className="text-white font-medium mt-1">
                                  {searchResult.amount?.toFixed(8)} GSC
                                </div>
                              </div>
                              <div className="p-3 bg-gray-600 rounded">
                                <Label className="text-gray-300 text-sm">Fee:</Label>
                                <div className="text-white font-medium mt-1">
                                  {searchResult.fee?.toFixed(8)} GSC
                                </div>
                              </div>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4">
                              <div className="p-3 bg-gray-600 rounded">
                                <Label className="text-gray-300 text-sm">Block Index:</Label>
                                <div className="text-white font-medium mt-1">
                                  {searchResult.blockIndex}
                                </div>
                              </div>
                              <div className="p-3 bg-gray-600 rounded">
                                <Label className="text-gray-300 text-sm">Timestamp:</Label>
                                <div className="text-white text-sm mt-1">
                                  {searchResult.timestamp ? new Date(searchResult.timestamp * 1000).toLocaleString() : 'N/A'}
                                </div>
                              </div>
                            </div>
                            
                            <div className="p-3 bg-gray-600 rounded">
                              <Label className="text-gray-300 text-sm">Signature:</Label>
                              <div className="font-mono text-white text-xs break-all mt-1">
                                {searchResult.signature || 'N/A'}
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )}
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
      {/* Create Wallet Dialog */}
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

      {/* Import/Restore Wallet Dialog */}
      <Dialog open={showRestoreWallet} onOpenChange={setShowRestoreWallet}>
        <DialogContent className="bg-gray-800 border-gray-700">
          <DialogHeader>
            <DialogTitle className="text-white">Import/Restore Wallet</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="text-gray-300">Select Wallet Backup File:</Label>
              <Input
                type="file"
                accept=".json,.backup"
                onChange={handleRestoreWallet}
                className="bg-gray-700 border-gray-600 text-white"
              />
            </div>
            <div className="text-sm text-gray-400">
              Select a wallet backup file (.json or .backup) to import your wallet.
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setShowRestoreWallet(false)} className="flex-1">Cancel</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Name Conflict Dialog */}
      <Dialog open={showNameConflict} onOpenChange={setShowNameConflict}>
        <DialogContent className="bg-gray-800 border-gray-700">
          <DialogHeader>
            <DialogTitle className="text-white">Wallet Name Conflict</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="text-gray-300">
              A wallet with the name "{conflictWalletName}" already exists. Please enter a new name:
            </div>
            <div>
              <Label className="text-gray-300">New Wallet Name:</Label>
              <Input
                value={newWalletName}
                onChange={(e) => setNewWalletName(e.target.value)}
                placeholder="Enter new wallet name..."
                className="bg-gray-700 border-gray-600 text-white"
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleNameConflictResolve} className="flex-1">Import with New Name</Button>
              <Button variant="outline" onClick={() => setShowNameConflict(false)}>Cancel</Button>
            </div>
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
            <div className="text-gray-300">
              Create a backup of your wallet "{selectedWallet}". This will download a JSON file containing your wallet data.
            </div>
            <div className="p-3 bg-yellow-500/10 border border-yellow-500/30 rounded">
              <div className="text-yellow-400 text-sm font-medium">Important:</div>
              <div className="text-gray-300 text-sm">
                Keep your wallet backup file secure. Anyone with access to this file can access your wallet.
              </div>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleBackupWallet} className="flex-1">Download Backup</Button>
              <Button variant="outline" onClick={() => setShowBackupWallet(false)}>Cancel</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Private Key Dialog */}
      <Dialog open={showPrivateKey} onOpenChange={setShowPrivateKey}>
        <DialogContent className="bg-gray-800 border-gray-700">
          <DialogHeader>
            <DialogTitle className="text-white">Private Key</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="text-gray-300">
              Private key for wallet "{selectedWallet}":
            </div>
            <div className="p-4 bg-gray-700 rounded font-mono text-sm break-all text-white">
              {getActiveWallet()?.private_key || "No private key available"}
            </div>
            <div className="p-3 bg-red-500/10 border border-red-500/30 rounded">
              <div className="text-red-400 text-sm font-medium">Warning:</div>
              <div className="text-gray-300 text-sm">
                Never share your private key with anyone. Anyone with your private key can access your wallet.
              </div>
            </div>
            <div className="flex gap-2">
              <Button 
                onClick={() => {
                  const wallet = getActiveWallet();
                  if (wallet) {
                    navigator.clipboard.writeText(wallet.private_key);
                    toast({
                      title: "Copied",
                      description: "Private key copied to clipboard",
                    });
                  }
                }} 
                className="flex-1"
              >
                Copy Private Key
              </Button>
              <Button variant="outline" onClick={() => setShowPrivateKey(false)}>Close</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Paper Wallet Dialog */}
      <Dialog open={showPaperWallet} onOpenChange={setShowPaperWallet}>
        <DialogContent className="bg-gray-800 border-gray-700">
          <DialogHeader>
            <DialogTitle className="text-white">Generate Paper Wallet</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="text-gray-300">
              Generate a new paper wallet for offline storage:
            </div>
            <div className="text-sm text-gray-400">
              This feature will create a new wallet with printable keys for secure offline storage.
            </div>
            <div className="flex gap-2">
              <Button 
                onClick={() => {
                  // Generate new wallet for paper storage
                  const paperWallet = gscBlockchainService.createWallet(`Paper_${Date.now()}`);
                  
                  // Create printable content
                  const printContent = `
VAGS Paper Wallet
=================
Wallet Name: ${paperWallet.name}
Address: ${paperWallet.address}
Private Key: ${paperWallet.private_key}
Public Key: ${paperWallet.public_key}
Created: ${new Date().toLocaleString()}

IMPORTANT: Keep this paper wallet secure and private!
`;
                  
                  // Open print dialog
                  const printWindow = window.open('', '_blank');
                  if (printWindow) {
                    printWindow.document.write(`<pre style="font-family: monospace; white-space: pre-wrap;">${printContent}</pre>`);
                    printWindow.document.close();
                    printWindow.print();
                  }
                  
                  toast({
                    title: "Paper Wallet Generated",
                    description: `Paper wallet created: ${paperWallet.name}`,
                  });
                  
                  setShowPaperWallet(false);
                }} 
                className="flex-1"
              >
                Generate & Print
              </Button>
              <Button variant="outline" onClick={() => setShowPaperWallet(false)}>Cancel</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Transaction Details Dialog */}
      <Dialog open={showTransactionDetails} onOpenChange={setShowTransactionDetails}>
        <DialogContent className="bg-gray-800 border-gray-700 max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-white">Transaction Details</DialogTitle>
          </DialogHeader>
          {selectedTransaction && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <div className="p-4 bg-gray-700 rounded">
                  <Label className="text-gray-300 text-sm">Transaction ID:</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="font-mono text-white text-sm break-all bg-gray-600 p-2 rounded flex-1">
                      {selectedTransaction.tx_id}
                    </div>
                    <Button size="sm" onClick={copyTransactionId} className="shrink-0">
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-gray-700 rounded">
                    <Label className="text-gray-300 text-sm">From:</Label>
                    <div className="font-mono text-white text-sm break-all mt-1">
                      {selectedTransaction.sender}
                    </div>
                  </div>
                  <div className="p-4 bg-gray-700 rounded">
                    <Label className="text-gray-300 text-sm">To:</Label>
                    <div className="font-mono text-white text-sm break-all mt-1">
                      {selectedTransaction.receiver}
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-gray-700 rounded">
                    <Label className="text-gray-300 text-sm">Amount:</Label>
                    <div className="text-white font-medium mt-1">
                      {selectedTransaction.amount?.toFixed(8)} GSC
                    </div>
                  </div>
                  <div className="p-4 bg-gray-700 rounded">
                    <Label className="text-gray-300 text-sm">Fee:</Label>
                    <div className="text-white font-medium mt-1">
                      {selectedTransaction.fee?.toFixed(8)} GSC
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-gray-700 rounded">
                    <Label className="text-gray-300 text-sm">Timestamp:</Label>
                    <div className="text-white text-sm mt-1">
                      {selectedTransaction.timestamp ? new Date(selectedTransaction.timestamp * 1000).toLocaleString() : 'N/A'}
                    </div>
                  </div>
                  <div className="p-4 bg-gray-700 rounded">
                    <Label className="text-gray-300 text-sm">Signature:</Label>
                    <div className="font-mono text-white text-xs break-all mt-1">
                      {selectedTransaction.signature || 'N/A'}
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex gap-2 pt-4">
                <Button onClick={() => setShowTransactionDetails(false)} className="flex-1">
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default GSCFullWallet;
