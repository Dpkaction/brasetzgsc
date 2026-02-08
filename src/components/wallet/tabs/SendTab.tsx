import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useBlockchain } from "@/hooks/useBlockchain";
import { toast } from "@/hooks/use-toast";
import { Send, AlertCircle } from "lucide-react";

interface SendTabProps {
  activeWallet: string | null;
}

const SendTab = ({ activeWallet }: SendTabProps) => {
  const { wallets, sendTransaction, getWalletBalance } = useBlockchain();
  const [recipientAddress, setRecipientAddress] = useState("");
  const [label, setLabel] = useState("");
  const [amount, setAmount] = useState("");
  const [fee, setFee] = useState("0.1");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const wallet = wallets.find(w => w.address === activeWallet);
  const balance = wallet ? getWalletBalance(wallet.address) : 0;
  const totalAmount = parseFloat(amount || "0") + parseFloat(fee || "0");

  const handleSend = async () => {
    if (!activeWallet || !recipientAddress || !amount) {
      toast({ title: "Error", description: "Please fill all required fields", variant: "destructive" });
      return;
    }

    if (!recipientAddress.startsWith("GSC")) {
      toast({ title: "Error", description: "Invalid recipient address format", variant: "destructive" });
      return;
    }

    const amountNum = parseFloat(amount);
    const feeNum = parseFloat(fee);

    if (amountNum <= 0) {
      toast({ title: "Error", description: "Amount must be greater than 0", variant: "destructive" });
      return;
    }

    if (amountNum + feeNum > balance) {
      toast({ title: "Error", description: "Insufficient balance", variant: "destructive" });
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await sendTransaction(activeWallet, recipientAddress, amountNum, feeNum);
      
      if (result.success) {
        toast({
          title: "Transaction Submitted",
          description: `Transaction ${result.transaction?.id} added to mempool`,
        });
        setRecipientAddress("");
        setLabel("");
        setAmount("");
        setFee("0.1");
      } else {
        toast({ title: "Error", description: result.error, variant: "destructive" });
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to send transaction", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!wallet) {
    return (
      <div className="glass-card p-8 text-center">
        <Send className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">No Wallet Selected</h3>
        <p className="text-muted-foreground text-sm">
          Select a wallet to send GSC.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto">
      <div className="glass-card p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="font-display font-semibold text-lg">Send GSC</h3>
          <span className="text-sm text-muted-foreground">
            Balance: <span className="text-gold font-medium">{balance.toFixed(4)} GSC</span>
          </span>
        </div>

        <div className="space-y-4">
          <div>
            <Label htmlFor="recipient">Recipient Address *</Label>
            <Input
              id="recipient"
              value={recipientAddress}
              onChange={(e) => setRecipientAddress(e.target.value)}
              placeholder="GSC..."
              className="mt-1 font-mono"
            />
          </div>

          <div>
            <Label htmlFor="label">Label (optional)</Label>
            <Input
              id="label"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="Payment for..."
              className="mt-1"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="amount">Amount (GSC) *</Label>
              <Input
                id="amount"
                type="number"
                step="0.0001"
                min="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.0000"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="fee">Fee (GSC)</Label>
              <Input
                id="fee"
                type="number"
                step="0.0001"
                min="0"
                value={fee}
                onChange={(e) => setFee(e.target.value)}
                placeholder="0.001"
                className="mt-1"
              />
            </div>
          </div>
        </div>

        {/* Summary */}
        <div className="p-4 bg-muted/30 rounded-lg space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Amount</span>
            <span>{parseFloat(amount || "0").toFixed(4)} GSC</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Fee</span>
            <span>{parseFloat(fee || "0").toFixed(4)} GSC</span>
          </div>
          <div className="border-t border-border pt-2 flex justify-between font-medium">
            <span>Total</span>
            <span className={totalAmount > balance ? "text-destructive" : "text-gold"}>
              {totalAmount.toFixed(4)} GSC
            </span>
          </div>
        </div>

        {totalAmount > balance && (
          <div className="flex items-center gap-2 p-3 bg-destructive/10 rounded-lg text-destructive text-sm">
            <AlertCircle className="w-4 h-4" />
            Insufficient balance
          </div>
        )}

        <Button
          onClick={handleSend}
          disabled={isSubmitting || totalAmount > balance || !amount || !recipientAddress}
          className="w-full bg-gold hover:bg-gold/90 text-midnight"
        >
          {isSubmitting ? (
            "Sending..."
          ) : (
            <>
              <Send className="w-4 h-4 mr-2" />
              Send Transaction
            </>
          )}
        </Button>

        <p className="text-xs text-muted-foreground text-center">
          Transaction will be added to mempool and confirmed after mining.
        </p>
      </div>
    </div>
  );
};

export default SendTab;
