import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { gscBlockchainService } from "@/services/gscBlockchain";

const GSCSimpleTest = () => {
  const [walletName, setWalletName] = useState("");
  const [wallets, setWallets] = useState<any[]>([]);
  const [selectedWallet, setSelectedWallet] = useState<string | null>(null);

  const handleCreateWallet = () => {
    console.log("Create wallet clicked with name:", walletName);
    
    if (!walletName.trim()) {
      toast({
        title: "Error",
        description: "Please enter a wallet name",
        variant: "destructive",
      });
      return;
    }

    try {
      console.log("Creating wallet...");
      const newWallet = gscBlockchainService.createWallet(walletName);
      console.log("Wallet created:", newWallet);
      
      setWallets(prev => [...prev, newWallet]);
      setSelectedWallet(newWallet.name);
      
      toast({
        title: "Success",
        description: `Wallet "${walletName}" created successfully!`,
      });
      
      setWalletName("");
    } catch (error) {
      console.error("Error creating wallet:", error);
      toast({
        title: "Error",
        description: `Failed to create wallet: ${error}`,
        variant: "destructive",
      });
    }
  };

  const loadExistingWallets = () => {
    try {
      const existingWallets = gscBlockchainService.getWallets();
      console.log("Existing wallets:", existingWallets);
      setWallets(existingWallets);
    } catch (error) {
      console.error("Error loading wallets:", error);
    }
  };

  React.useEffect(() => {
    loadExistingWallets();
  }, []);

  return (
    <div className="space-y-4 p-4">
      <Card>
        <CardHeader>
          <CardTitle>GSC Wallet Test - Create Wallet</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="wallet-name">Wallet Name:</Label>
            <Input
              id="wallet-name"
              value={walletName}
              onChange={(e) => setWalletName(e.target.value)}
              placeholder="Enter wallet name..."
            />
          </div>
          
          <Button 
            onClick={handleCreateWallet}
            className="w-full"
          >
            Create Wallet
          </Button>
          
          <Button 
            onClick={loadExistingWallets}
            variant="outline"
            className="w-full"
          >
            Refresh Wallets
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Existing Wallets ({wallets.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {wallets.length > 0 ? (
            <div className="space-y-2">
              {wallets.map((wallet, index) => (
                <div 
                  key={index}
                  className={`p-3 border rounded cursor-pointer ${
                    selectedWallet === wallet.name ? 'bg-blue-50 border-blue-200' : 'hover:bg-gray-50'
                  }`}
                  onClick={() => setSelectedWallet(wallet.name)}
                >
                  <p className="font-medium">{wallet.name}</p>
                  <p className="text-sm text-muted-foreground font-mono">{wallet.address}</p>
                  <p className="text-sm text-green-600">Balance: {wallet.balance || 0} GSC</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-4">
              No wallets found. Create your first wallet above.
            </p>
          )}
        </CardContent>
      </Card>

      {selectedWallet && (
        <Card>
          <CardHeader>
            <CardTitle>Selected Wallet: {selectedWallet}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm">
              Wallet is selected and ready for transactions.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default GSCSimpleTest;
