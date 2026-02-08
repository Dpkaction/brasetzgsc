import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { 
  Copy, 
  Send, 
  Download, 
  QrCode, 
  Wallet, 
  Eye, 
  EyeOff,
  RefreshCw,
  Plus,
  Trash2,
  BookOpen
} from "lucide-react";
import { gscBlockchainService, GSCWallet } from "@/services/gscBlockchain";
import GSCMenuBar from "./GSCMenuBar";
import GSCTestRunner from "./GSCTestRunner";
import GSCSimpleTest from "./GSCSimpleTest";

interface GSCCompleteInterfaceProps {
  activeWallet: string | null;
}

const GSCCompleteInterface = ({ activeWallet }: GSCCompleteInterfaceProps) => {
  const [wallets, setWallets] = useState<GSCWallet[]>([]);
  const [selectedWallet, setSelectedWallet] = useState<string | null>(activeWallet);
  const [showPrivateKey, setShowPrivateKey] = useState(false);
  
  // Send form state
  const [recipientAddress, setRecipientAddress] = useState("");
  const [sendAmount, setSendAmount] = useState("");
  const [sendLabel, setSendLabel] = useState("");
  const [sendFee, setSendFee] = useState("0.1");
  
  // Receive form state
  const [receiveLabel, setReceiveLabel] = useState("");
  const [receiveAmount, setReceiveAmount] = useState("");
  const [receiveMessage, setReceiveMessage] = useState("");
  
  // Address book state
  const [addressBook, setAddressBook] = useState<Array<{name: string, address: string}>>([]);
  const [showAddressBook, setShowAddressBook] = useState(false);
  
  useEffect(() => {
    loadWallets();
    loadAddressBook();
  }, []);

  const loadWallets = () => {
    gscBlockchainService.refreshWalletBalances();
    const loadedWallets = gscBlockchainService.getWallets();
    const updatedWallets = loadedWallets.map(wallet => ({
      ...wallet,
      balance: gscBlockchainService.getWalletBalance(wallet.address)
    }));
    setWallets(updatedWallets);
  };

  const loadAddressBook = () => {
    const stored = localStorage.getItem('gsc_address_book');
    if (stored) {
      setAddressBook(JSON.parse(stored));
    }
  };

  const saveAddressBook = (book: Array<{name: string, address: string}>) => {
    localStorage.setItem('gsc_address_book', JSON.stringify(book));
    setAddressBook(book);
  };

  const getActiveWalletData = (): GSCWallet | null => {
    return wallets.find(w => w.name === selectedWallet) || null;
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied",
      description: `${label} copied to clipboard`,
    });
  };

  const copyMyAddress = () => {
    const wallet = getActiveWalletData();
    if (wallet) {
      copyToClipboard(wallet.address, "Address");
    }
  };

  const copyMyAddressToSend = () => {
    const wallet = getActiveWalletData();
    if (wallet) {
      setRecipientAddress(wallet.address);
      toast({
        title: "Address Copied",
        description: "Your address has been copied to the send form",
      });
    }
  };

  const clearSendForm = () => {
    setRecipientAddress("");
    setSendAmount("");
    setSendLabel("");
    setSendFee("0.1");
  };

  const clearReceiveForm = () => {
    setReceiveLabel("");
    setReceiveAmount("");
    setReceiveMessage("");
  };

  const handleSendTransaction = () => {
    const wallet = getActiveWalletData();
    if (!wallet) {
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
    const fee = parseFloat(sendFee);

    if (isNaN(amount) || amount <= 0) {
      toast({
        title: "Error",
        description: "Please enter a valid amount",
        variant: "destructive",
      });
      return;
    }

    if (fee < 0.1) {
      toast({
        title: "Error",
        description: "Minimum fee is 0.1 GSC",
        variant: "destructive",
      });
      return;
    }

    const success = gscBlockchainService.sendTransaction(wallet, recipientAddress, amount);
    if (success) {
      clearSendForm();
      loadWallets();
      
      // Add to address book if label provided
      if (sendLabel.trim()) {
        const newEntry = { name: sendLabel, address: recipientAddress };
        const updatedBook = [...addressBook.filter(entry => entry.address !== recipientAddress), newEntry];
        saveAddressBook(updatedBook);
      }
    }
  };

  const addToAddressBook = () => {
    if (!sendLabel.trim() || !recipientAddress.trim()) {
      toast({
        title: "Error",
        description: "Please enter both label and address",
        variant: "destructive",
      });
      return;
    }

    const newEntry = { name: sendLabel, address: recipientAddress };
    const updatedBook = [...addressBook.filter(entry => entry.address !== recipientAddress), newEntry];
    saveAddressBook(updatedBook);
    
    toast({
      title: "Address Added",
      description: `${sendLabel} added to address book`,
    });
  };

  const selectFromAddressBook = (address: string) => {
    setRecipientAddress(address);
    setShowAddressBook(false);
  };

  const removeFromAddressBook = (address: string) => {
    const updatedBook = addressBook.filter(entry => entry.address !== address);
    saveAddressBook(updatedBook);
  };

  const generateNewAddress = () => {
    const { address, private_key, public_key } = gscBlockchainService.generateAddress();
    const newWallet: GSCWallet = {
      name: `Wallet_${Date.now()}`,
      address,
      private_key,
      public_key,
      balance: 0,
      created: new Date().toISOString(),
      encrypted: false
    };

    // Add to wallets (this would typically be done through the wallet manager)
    toast({
      title: "New Address Generated",
      description: `New address: ${address.substring(0, 20)}...`,
    });
  };

  const getPrivateKey = () => {
    const wallet = getActiveWalletData();
    if (wallet && wallet.private_key) {
      copyToClipboard(wallet.private_key, "Private Key");
      toast({
        title: "Private Key Copied",
        description: "⚠️ Keep your private key secure and never share it!",
        variant: "destructive",
      });
    }
  };

  const blockchainStats = gscBlockchainService.getBlockchainStats();
  const transactions = getActiveWalletData() ? 
    gscBlockchainService.getTransactionHistory(getActiveWalletData()!.address) : [];

  return (
    <div className="space-y-0">
      {/* GSC Menu Bar */}
      <GSCMenuBar 
        onCreateWallet={(wallet) => {
          setWallets(prev => [...prev, wallet]);
          setSelectedWallet(wallet.name);
          loadWallets();
        }}
        onOpenWallet={(walletName) => {
          setSelectedWallet(walletName);
          loadWallets();
        }}
        onImportBlockchain={() => {}}
        onExportBlockchain={() => {}}
        activeWallet={selectedWallet}
        onWalletChange={setSelectedWallet}
      />
      
      <Tabs defaultValue="debug" className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="send">Send</TabsTrigger>
          <TabsTrigger value="receive">Receive</TabsTrigger>
          <TabsTrigger value="blockchain">Blockchain</TabsTrigger>
          <TabsTrigger value="tests">Tests</TabsTrigger>
          <TabsTrigger value="debug">Debug</TabsTrigger>
        </TabsList>

        {/* Overview Tab - Exact match to original */}
        <TabsContent value="overview" className="space-y-4">
          {selectedWallet && getActiveWalletData() ? (
            <>
              {/* Available Balance */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Available Balance</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">GSC Balance:</span>
                    <span className="text-3xl font-bold text-green-600">
                      {getActiveWalletData()?.balance.toFixed(8)} GSC
                    </span>
                  </div>
                </CardContent>
              </Card>

              {/* Market Information */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Market Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Total Supply:</span>
                    <span className="text-sm font-bold text-green-700">
                      {blockchainStats.totalSupply.toLocaleString()} GSC
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Current Address:</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-mono text-blue-600">
                        {getActiveWalletData()?.address.substring(0, 20)}...
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={copyMyAddress}
                        className="h-6 w-6 p-0"
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Send GSC Coins (Overview) */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Send GSC Coins</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="overview-recipient">Recipient Address:</Label>
                    <Input
                      id="overview-recipient"
                      value={recipientAddress}
                      onChange={(e) => setRecipientAddress(e.target.value)}
                      placeholder="GSC1..."
                      className="font-mono text-sm"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="overview-amount">Amount:</Label>
                      <Input
                        id="overview-amount"
                        type="number"
                        step="0.00000001"
                        value={sendAmount}
                        onChange={(e) => setSendAmount(e.target.value)}
                        placeholder="0.00000000"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="overview-fee">Fee:</Label>
                      <Input
                        id="overview-fee"
                        type="number"
                        step="0.1"
                        value={sendFee}
                        onChange={(e) => setSendFee(e.target.value)}
                        className="bg-gray-50"
                      />
                    </div>
                  </div>
                  <Button onClick={handleSendTransaction} className="w-full">
                    <Send className="w-4 h-4 mr-2" />
                    Send Transaction
                  </Button>
                </CardContent>
              </Card>

              {/* Transaction History */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Transaction History</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="grid grid-cols-4 gap-4 text-sm font-medium text-muted-foreground border-b pb-2">
                      <span>Type</span>
                      <span>Amount</span>
                      <span>Address</span>
                      <span>Time</span>
                    </div>
                    <ScrollArea className="h-[200px]">
                      <div className="space-y-1">
                        {transactions.slice(0, 10).map((tx, index) => (
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
                        {transactions.length === 0 && (
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
                <Button variant="outline">
                  Create Wallet
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Send Tab - Complete Bitcoin Core style */}
        <TabsContent value="send" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Send GSC Coins</CardTitle>
              <CardDescription>Send GSC coins to another address</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Pay To */}
              <div className="space-y-2">
                <Label htmlFor="send-address">Pay To:</Label>
                <div className="flex gap-2">
                  <Input
                    id="send-address"
                    value={recipientAddress}
                    onChange={(e) => setRecipientAddress(e.target.value)}
                    placeholder="GSC1..."
                    className="font-mono flex-1"
                  />
                  <Button
                    variant="outline"
                    onClick={() => setShowAddressBook(!showAddressBook)}
                  >
                    <BookOpen className="w-4 h-4 mr-2" />
                    Address Book
                  </Button>
                  <Button
                    variant="outline"
                    onClick={copyMyAddressToSend}
                  >
                    Copy My Address
                  </Button>
                </div>
              </div>

              {/* Address Book */}
              {showAddressBook && (
                <Card className="border-dashed">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Address Book</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-32">
                      {addressBook.length > 0 ? (
                        <div className="space-y-1">
                          {addressBook.map((entry, index) => (
                            <div key={index} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded">
                              <div className="flex-1">
                                <p className="font-medium text-sm">{entry.name}</p>
                                <p className="text-xs text-muted-foreground font-mono">{entry.address}</p>
                              </div>
                              <div className="flex gap-1">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => selectFromAddressBook(entry.address)}
                                >
                                  Select
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removeFromAddressBook(entry.address)}
                                >
                                  <Trash2 className="w-3 h-3" />
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground text-center py-4">
                          No addresses in address book
                        </p>
                      )}
                    </ScrollArea>
                  </CardContent>
                </Card>
              )}

              {/* Label */}
              <div className="space-y-2">
                <Label htmlFor="send-label">Label:</Label>
                <div className="flex gap-2">
                  <Input
                    id="send-label"
                    value={sendLabel}
                    onChange={(e) => setSendLabel(e.target.value)}
                    placeholder="Optional label for this address"
                  />
                  <Button
                    variant="outline"
                    onClick={addToAddressBook}
                    disabled={!sendLabel.trim() || !recipientAddress.trim()}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add to Book
                  </Button>
                </div>
              </div>

              {/* Amount */}
              <div className="space-y-2">
                <Label htmlFor="send-amount-main">Amount:</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="send-amount-main"
                    type="number"
                    step="0.00000001"
                    value={sendAmount}
                    onChange={(e) => setSendAmount(e.target.value)}
                    placeholder="0.00000000"
                    className="flex-1"
                  />
                  <span className="text-sm font-medium">GSC</span>
                </div>
              </div>

              {/* Fee */}
              <div className="space-y-2">
                <Label htmlFor="send-fee-main">Fee:</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="send-fee-main"
                    type="number"
                    step="0.1"
                    min="0.1"
                    value={sendFee}
                    onChange={(e) => setSendFee(e.target.value)}
                    className="flex-1"
                  />
                  <span className="text-sm font-medium">GSC</span>
                </div>
                <p className="text-xs text-muted-foreground">Minimum fee: 0.1 GSC</p>
              </div>

              {/* Buttons */}
              <div className="flex gap-2 pt-4">
                <Button variant="outline" onClick={clearSendForm}>
                  Clear All
                </Button>
                <Button onClick={handleSendTransaction} className="flex-1">
                  <Send className="w-4 h-4 mr-2" />
                  Send
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Receive Tab - Complete Bitcoin Core style */}
        <TabsContent value="receive" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Request Payment</CardTitle>
              <CardDescription>Create a payment request</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Label */}
              <div className="space-y-2">
                <Label htmlFor="receive-label">Label:</Label>
                <Input
                  id="receive-label"
                  value={receiveLabel}
                  onChange={(e) => setReceiveLabel(e.target.value)}
                  placeholder="Optional label for this request"
                />
              </div>

              {/* Amount */}
              <div className="space-y-2">
                <Label htmlFor="receive-amount">Amount:</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="receive-amount"
                    type="number"
                    step="0.00000001"
                    value={receiveAmount}
                    onChange={(e) => setReceiveAmount(e.target.value)}
                    placeholder="0.00000000"
                    className="flex-1"
                  />
                  <span className="text-sm font-medium">GSC</span>
                </div>
              </div>

              {/* Message */}
              <div className="space-y-2">
                <Label htmlFor="receive-message">Message:</Label>
                <Input
                  id="receive-message"
                  value={receiveMessage}
                  onChange={(e) => setReceiveMessage(e.target.value)}
                  placeholder="Optional message for this request"
                />
              </div>

              {/* Buttons */}
              <div className="flex gap-2">
                <Button variant="outline" onClick={clearReceiveForm}>
                  Clear
                </Button>
                <Button variant="outline">
                  Request payment
                </Button>
                <Button variant="outline">
                  <QrCode className="w-4 h-4 mr-2" />
                  Show QR Code
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Your Address */}
          {getActiveWalletData() && (
            <Card>
              <CardHeader>
                <CardTitle>Your Address</CardTitle>
                <CardDescription>Share this address to receive GSC coins</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-3 bg-gray-50 rounded font-mono text-sm break-all">
                  {getActiveWalletData()?.address}
                </div>
                
                <div className="flex gap-2">
                  <Button variant="outline" onClick={copyMyAddress}>
                    <Copy className="w-4 h-4 mr-2" />
                    Copy Address
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={getPrivateKey}
                    className="text-red-600 hover:text-red-700"
                  >
                    {showPrivateKey ? <EyeOff className="w-4 h-4 mr-2" /> : <Eye className="w-4 h-4 mr-2" />}
                    Get Private Key
                  </Button>
                  <Button variant="outline" onClick={generateNewAddress}>
                    <Plus className="w-4 h-4 mr-2" />
                    Generate New Address
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Blockchain Tab */}
        <TabsContent value="blockchain" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Network & Sync</CardTitle>
              <CardDescription>GSC blockchain network information</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium">Network Status</p>
                  <p className="text-2xl font-bold text-green-600">Online</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Total Blocks</p>
                  <p className="text-2xl font-bold">{blockchainStats.totalBlocks}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Total Supply</p>
                  <p className="text-lg font-semibold">{blockchainStats.totalSupply.toLocaleString()} GSC</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Circulating Supply</p>
                  <p className="text-lg font-semibold">{blockchainStats.circulatingSupply.toFixed(2)} GSC</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tests Tab - Hidden in production */}
        <TabsContent value="tests" className="space-y-4">
          <div className="p-8 text-center text-muted-foreground">
            <p>Test functionality disabled in production build.</p>
          </div>
        </TabsContent>

        {/* Debug Tab - Hidden in production */}
        <TabsContent value="debug" className="space-y-4">
          <div className="p-8 text-center text-muted-foreground">
            <p>Debug functionality disabled in production build.</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default GSCCompleteInterface;
