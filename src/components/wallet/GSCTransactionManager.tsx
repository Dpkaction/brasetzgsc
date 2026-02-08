import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "@/hooks/use-toast";
import { Send, History, ArrowUpRight, ArrowDownLeft, Clock, CheckCircle } from "lucide-react";
import { gscBlockchainService, GSCWallet, GSCTransaction } from "@/services/gscBlockchain";

interface GSCTransactionManagerProps {
  activeWallet: GSCWallet | null;
  onBalanceUpdate: () => void;
}

const GSCTransactionManager = ({ activeWallet, onBalanceUpdate }: GSCTransactionManagerProps) => {
  const [recipientAddress, setRecipientAddress] = useState("");
  const [sendAmount, setSendAmount] = useState("");
  const [transactionHistory, setTransactionHistory] = useState<GSCTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (activeWallet) {
      loadTransactionHistory();
    }
  }, [activeWallet]);

  const loadTransactionHistory = () => {
    if (!activeWallet) return;
    
    const history = gscBlockchainService.getTransactionHistory(activeWallet.address);
    setTransactionHistory(history);
  };

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

    setIsLoading(true);
    
    try {
      const success = gscBlockchainService.sendTransaction(activeWallet, recipientAddress, amount);
      
      if (success) {
        setRecipientAddress("");
        setSendAmount("");
        loadTransactionHistory();
        onBalanceUpdate();
        
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

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
  };

  const getTransactionType = (tx: GSCTransaction) => {
    if (!activeWallet) return "unknown";
    return tx.sender === activeWallet.address ? "sent" : "received";
  };

  const getTransactionIcon = (type: string) => {
    return type === "sent" ? (
      <ArrowUpRight className="w-4 h-4 text-red-500" />
    ) : (
      <ArrowDownLeft className="w-4 h-4 text-green-500" />
    );
  };

  if (!activeWallet) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <p className="text-muted-foreground">Please select or create a wallet to manage transactions</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="send" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="send">Send GSC</TabsTrigger>
          <TabsTrigger value="history">Transaction History</TabsTrigger>
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="balance">Available Balance</Label>
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="text-2xl font-bold text-green-600">
                      {activeWallet.balance.toFixed(8)} GSC
                    </p>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fee">Transaction Fee</Label>
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="text-lg font-semibold">0.1 GSC</p>
                  </div>
                </div>
              </div>

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
                    <Clock className="w-4 h-4 mr-2 animate-spin" />
                    Broadcasting to network...
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
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="w-5 h-5" />
                Transaction History
              </CardTitle>
              <CardDescription>
                All transactions for wallet: {activeWallet.name}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px]">
                {transactionHistory.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">No transactions found</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {transactionHistory.map((tx, index) => {
                      const type = getTransactionType(tx);
                      return (
                        <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                          <div className="flex items-center gap-3">
                            {getTransactionIcon(type)}
                            <div>
                              <div className="flex items-center gap-2">
                                <Badge variant={type === "sent" ? "destructive" : "default"}>
                                  {type.toUpperCase()}
                                </Badge>
                                <span className="font-semibold">
                                  {type === "sent" ? "-" : "+"}{tx.amount.toFixed(8)} GSC
                                </span>
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {type === "sent" ? "To: " : "From: "}
                                <span className="font-mono">
                                  {(type === "sent" ? tx.receiver : tx.sender).substring(0, 20)}...
                                </span>
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {formatDate(tx.timestamp)}
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="flex items-center gap-1">
                              <CheckCircle className="w-4 h-4 text-green-500" />
                              <span className="text-sm text-green-600">Confirmed</span>
                            </div>
                            {tx.fee > 0 && (
                              <div className="text-xs text-muted-foreground">
                                Fee: {tx.fee} GSC
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default GSCTransactionManager;
