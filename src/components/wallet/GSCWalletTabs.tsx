import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Wallet, Send, History, Settings, BarChart3, Users, Zap, Blocks } from "lucide-react";
import GSCWalletManager from "./GSCWalletManager";
import GSCTransactionManager from "./GSCTransactionManager";
import GSCBlockExplorer from "./GSCBlockExplorer";
import GSCSendReceive from "./GSCSendReceive";
import GSCMenuBar from "./GSCMenuBar";
import { gscBlockchainService, GSCWallet } from "@/services/gscBlockchain";

interface GSCWalletTabsProps {
  activeWallet: string | null;
}

const GSCWalletTabs = ({ activeWallet }: GSCWalletTabsProps) => {
  const [wallets, setWallets] = useState<GSCWallet[]>([]);
  const [selectedWallet, setSelectedWallet] = useState<string | null>(activeWallet);

  useEffect(() => {
    loadWallets();
  }, []);

  useEffect(() => {
    setSelectedWallet(activeWallet);
  }, [activeWallet]);

  const loadWallets = () => {
    // Force refresh wallet balances from blockchain data
    gscBlockchainService.refreshWalletBalances();
    
    const loadedWallets = gscBlockchainService.getWallets();
    const updatedWallets = loadedWallets.map(wallet => ({
      ...wallet,
      balance: gscBlockchainService.getWalletBalance(wallet.address)
    }));
    setWallets(updatedWallets);
  };

  const getActiveWalletData = (): GSCWallet | null => {
    return wallets.find(w => w.name === selectedWallet) || null;
  };

  const handleBalanceUpdate = () => {
    loadWallets();
  };

  const blockchainStats = gscBlockchainService.getBlockchainStats();

  const handleCreateWallet = () => {
    // Navigate to wallets tab and trigger create wallet
    const walletsTab = document.querySelector('[value="wallets"]') as HTMLElement;
    walletsTab?.click();
  };

  const handleOpenWallet = () => {
    // Navigate to wallets tab and show import options
    const walletsTab = document.querySelector('[value="wallets"]') as HTMLElement;
    walletsTab?.click();
  };

  const handleImportBlockchain = () => {
    // Navigate to network tab for blockchain import
    const networkTab = document.querySelector('[value="network"]') as HTMLElement;
    networkTab?.click();
  };

  const handleExportBlockchain = () => {
    try {
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
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  return (
    <div className="space-y-0">
      {/* GSC Menu Bar */}
      <GSCMenuBar 
        onCreateWallet={handleCreateWallet}
        onOpenWallet={handleOpenWallet}
        onImportBlockchain={handleImportBlockchain}
        onExportBlockchain={handleExportBlockchain}
        activeWallet={selectedWallet}
      />
      
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="send">Send</TabsTrigger>
          <TabsTrigger value="receive">Receive</TabsTrigger>
          <TabsTrigger value="blockchain">Blockchain</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {selectedWallet && getActiveWalletData() ? (
            <>
              {/* Available Balance */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg font-semibold">Available Balance</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">GSC Balance:</span>
                      <span className="text-2xl font-bold text-green-600">
                        {getActiveWalletData()?.balance.toFixed(8)} GSC
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Market Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg font-semibold">Market Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Total Supply:</span>
                      <span className="text-sm font-medium">{blockchainStats.totalSupply.toLocaleString()} GSC</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Current Address:</span>
                      <span className="text-sm font-mono break-all">{getActiveWalletData()?.address}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Send GSC Coins */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg font-semibold">Send GSC Coins</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Recipient Address:</label>
                      <input 
                        type="text" 
                        placeholder="GSC1..." 
                        className="w-full p-2 border rounded-md font-mono text-sm"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Amount:</label>
                        <input 
                          type="number" 
                          step="0.00000001"
                          placeholder="0.00000000"
                          className="w-full p-2 border rounded-md"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Fee:</label>
                        <input 
                          type="number" 
                          value="0.1"
                          readOnly
                          className="w-full p-2 border rounded-md bg-gray-50"
                        />
                      </div>
                    </div>
                    <Button className="w-full">
                      Send Transaction
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Transaction History */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg font-semibold">Transaction History</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="grid grid-cols-4 gap-4 text-sm font-medium text-muted-foreground border-b pb-2">
                      <span>Type</span>
                      <span>Amount</span>
                      <span>Address</span>
                      <span>Date</span>
                    </div>
                    <ScrollArea className="h-[200px]">
                      <div className="space-y-1">
                        {gscBlockchainService.getTransactionHistory(getActiveWalletData()?.address || "").slice(0, 10).map((tx, index) => (
                          <div key={index} className="grid grid-cols-4 gap-4 text-sm py-2 border-b">
                            <span className={tx.sender === getActiveWalletData()?.address ? "text-red-600" : "text-green-600"}>
                              {tx.sender === getActiveWalletData()?.address ? "Sent" : "Received"}
                            </span>
                            <span className="font-mono">
                              {tx.sender === getActiveWalletData()?.address ? "-" : "+"}{tx.amount.toFixed(8)}
                            </span>
                            <span className="font-mono text-xs truncate">
                              {tx.sender === getActiveWalletData()?.address ? tx.receiver : tx.sender}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {new Date(tx.timestamp * 1000).toLocaleDateString()}
                            </span>
                          </div>
                        ))}
                        {gscBlockchainService.getTransactionHistory(getActiveWalletData()?.address || "").length === 0 && (
                          <div className="text-center text-muted-foreground py-8">
                            No transactions found
                          </div>
                        )}
                      </div>
                    </ScrollArea>
                  </div>
                </CardContent>
              </Card>
            </>
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <Wallet className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Wallet Selected</h3>
                <p className="text-muted-foreground mb-4">
                  Please create a new wallet or import an existing one to view your GSC balance and transaction history.
                </p>
                <Button onClick={() => {}} variant="outline">
                  Create Wallet
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="send" className="space-y-6">
          <GSCSendReceive 
            activeWallet={getActiveWalletData()} 
            onTransactionComplete={handleBalanceUpdate}
          />
        </TabsContent>

        <TabsContent value="receive" className="space-y-6">
          <GSCSendReceive 
            activeWallet={getActiveWalletData()} 
            onTransactionComplete={handleBalanceUpdate}
          />
        </TabsContent>

        <TabsContent value="blockchain" className="space-y-6">
          <div className="grid grid-cols-1 gap-6">
            {/* Network Status */}
            <Card>
              <CardHeader>
                <CardTitle>Network & Sync</CardTitle>
                <CardDescription>GSC blockchain network information</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium">Network Status</p>
                      <p className="text-2xl font-bold text-green-600">Online</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Total Blocks</p>
                      <p className="text-2xl font-bold">{blockchainStats.totalBlocks}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium">Total Supply</p>
                      <p className="text-lg font-semibold">{blockchainStats.totalSupply.toLocaleString()} GSC</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Circulating Supply</p>
                      <p className="text-lg font-semibold">{blockchainStats.circulatingSupply.toFixed(2)} GSC</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Block Explorer */}
            <GSCBlockExplorer />
            
            {/* Wallet Manager */}
            <GSCWalletManager 
              activeWallet={selectedWallet} 
              onWalletChange={setSelectedWallet}
            />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default GSCWalletTabs;
