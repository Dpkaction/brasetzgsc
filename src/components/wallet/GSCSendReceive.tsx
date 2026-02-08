import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { Send, Download, Copy, Check, QrCode, Wallet } from "lucide-react";
import { gscBlockchainService, GSCWallet } from "@/services/gscBlockchain";

interface GSCSendReceiveProps {
  activeWallet: GSCWallet | null;
  onTransactionComplete: () => void;
}

const GSCSendReceive = ({ activeWallet, onTransactionComplete }: GSCSendReceiveProps) => {
  const [recipientAddress, setRecipientAddress] = useState("");
  const [sendAmount, setSendAmount] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [copiedAddress, setCopiedAddress] = useState(false);
  const [showReceiveDialog, setShowReceiveDialog] = useState(false);

  const handleSendTransaction = async () => {
    if (!activeWallet) {
      toast({
        title: "Error",
        description: "No active wallet selected",
        variant: "destructive",
      });
      return;
    }

    if (!recipientAddress.trim() || !sendAmount.trim()) {
      toast({
        title: "Error",
        description: "Please enter recipient address and amount",
        variant: "destructive",
      });
      return;
    }

    const amount = parseFloat(sendAmount);
    if (isNaN(amount) || amount <= 0) {
      toast({
        title: "Error",
        description: "Please enter a valid amount",
        variant: "destructive",
      });
      return;
    }

    if (!recipientAddress.startsWith("GSC1")) {
      toast({
        title: "Error",
        description: "Invalid GSC address format",
        variant: "destructive",
      });
      return;
    }

    const fee = 0.1; // Minimum fee
    if (activeWallet.balance < amount + fee) {
      toast({
        title: "Insufficient Balance",
        description: `You need ${(amount + fee).toFixed(8)} GSC (including 0.1 GSC fee)`,
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    try {
      const success = gscBlockchainService.sendTransaction(activeWallet, recipientAddress, amount);
      
      if (success) {
        setRecipientAddress("");
        setSendAmount("");
        onTransactionComplete();
        
        toast({
          title: "Transaction Sent",
          description: `Successfully sent ${amount} GSC and broadcast to network`,
        });
      }
    } catch (error) {
      toast({
        title: "Transaction Failed",
        description: `${error}`,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const copyAddress = () => {
    if (activeWallet?.address) {
      navigator.clipboard.writeText(activeWallet.address);
      setCopiedAddress(true);
      toast({
        title: "Address Copied",
        description: "Wallet address copied to clipboard",
      });
      setTimeout(() => setCopiedAddress(false), 2000);
    }
  };

  if (!activeWallet) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <Wallet className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">Please select or create a wallet to send and receive GSC</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="send" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="send">Send GSC</TabsTrigger>
          <TabsTrigger value="receive">Receive GSC</TabsTrigger>
        </TabsList>

        <TabsContent value="send" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Send className="w-5 h-5" />
                Send GSC Coins
              </CardTitle>
              <CardDescription>
                Send GSC coins to another address. Transactions are automatically broadcast to network.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Wallet Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Available Balance</Label>
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="text-2xl font-bold text-green-600">
                      {activeWallet.balance.toFixed(8)} GSC
                    </p>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Transaction Fee</Label>
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="text-lg font-semibold">0.1 GSC</p>
                    <p className="text-xs text-muted-foreground">Minimum required fee</p>
                  </div>
                </div>
              </div>

              {/* Send Form */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="recipient">Recipient Address</Label>
                  <Input
                    id="recipient"
                    value={recipientAddress}
                    onChange={(e) => setRecipientAddress(e.target.value)}
                    placeholder="GSC1..."
                    className="font-mono"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="amount">Amount (GSC)</Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.00000001"
                    min="0"
                    value={sendAmount}
                    onChange={(e) => setSendAmount(e.target.value)}
                    placeholder="0.00000000"
                  />
                </div>

                {/* Transaction Summary */}
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <h4 className="font-semibold text-blue-900 mb-2">Transaction Summary</h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span>Amount:</span>
                      <span>{sendAmount || "0.00000000"} GSC</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Fee:</span>
                      <span>0.1 GSC</span>
                    </div>
                    <div className="flex justify-between font-semibold border-t pt-1">
                      <span>Total:</span>
                      <span>{(parseFloat(sendAmount || "0") + 0.1).toFixed(8)} GSC</span>
                    </div>
                  </div>
                </div>

                <Button 
                  onClick={handleSendTransaction} 
                  className="w-full" 
                  disabled={isLoading || !recipientAddress || !sendAmount}
                >
                  {isLoading ? (
                    <>
                      <Send className="w-4 h-4 mr-2 animate-pulse" />
                      Broadcasting to network...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Send Transaction
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="receive" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Download className="w-5 h-5" />
                Receive GSC Coins
              </CardTitle>
              <CardDescription>
                Share your wallet address to receive GSC coins from others.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Wallet Address */}
              <div className="space-y-2">
                <Label>Your GSC Address</Label>
                <div className="flex items-center gap-2">
                  <Input
                    value={activeWallet.address}
                    readOnly
                    className="font-mono text-sm"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={copyAddress}
                  >
                    {copiedAddress ? (
                      <Check className="w-4 h-4 text-green-500" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </div>

              {/* QR Code Dialog */}
              <Dialog open={showReceiveDialog} onOpenChange={setShowReceiveDialog}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="w-full">
                    <QrCode className="w-4 h-4 mr-2" />
                    Show QR Code
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Receive GSC Coins</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 text-center">
                    <div className="p-4 bg-muted rounded-lg">
                      <p className="text-xs text-muted-foreground mb-2">GSC Address</p>
                      <p className="font-mono text-sm break-all">{activeWallet.address}</p>
                    </div>
                    <div className="p-8 bg-white border rounded-lg">
                      {/* QR Code placeholder - you can integrate a QR code library here */}
                      <div className="w-48 h-48 mx-auto bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
                        <div className="text-center">
                          <QrCode className="w-12 h-12 mx-auto text-gray-400 mb-2" />
                          <p className="text-xs text-gray-500">QR Code</p>
                          <p className="text-xs text-gray-500">for address</p>
                        </div>
                      </div>
                    </div>
                    <Button onClick={copyAddress} className="w-full">
                      <Copy className="w-4 h-4 mr-2" />
                      Copy Address
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>

              {/* Instructions */}
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <h4 className="font-semibold text-green-900 mb-2">How to Receive GSC</h4>
                <ul className="text-sm text-green-800 space-y-1">
                  <li>• Share your GSC address with the sender</li>
                  <li>• Or show them the QR code for easy scanning</li>
                  <li>• Transactions will appear in your wallet automatically</li>
                  <li>• All incoming transactions are broadcast to network</li>
                </ul>
              </div>

              {/* Current Balance */}
              <div className="text-center p-4 bg-muted rounded-lg">
                <Label className="text-sm text-muted-foreground">Current Balance</Label>
                <p className="text-3xl font-bold text-green-600 mt-1">
                  {activeWallet.balance.toFixed(8)} GSC
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default GSCSendReceive;
