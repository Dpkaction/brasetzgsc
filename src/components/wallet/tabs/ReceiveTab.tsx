import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useBlockchain } from "@/hooks/useBlockchain";
import { toast } from "@/hooks/use-toast";
import { Download, Copy, Check, QrCode } from "lucide-react";

interface ReceiveTabProps {
  activeWallet: string | null;
}

const ReceiveTab = ({ activeWallet }: ReceiveTabProps) => {
  const { wallets } = useBlockchain();
  const [copied, setCopied] = useState(false);
  const [addressLabel, setAddressLabel] = useState("");

  const wallet = wallets.find(w => w.address === activeWallet);

  const copyAddress = () => {
    if (wallet) {
      navigator.clipboard.writeText(wallet.address);
      setCopied(true);
      toast({ title: "Copied", description: "Address copied to clipboard" });
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (!wallet) {
    return (
      <div className="glass-card p-8 text-center">
        <Download className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">No Wallet Selected</h3>
        <p className="text-muted-foreground text-sm">
          Select a wallet to receive GSC.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto">
      <div className="glass-card p-6 space-y-6">
        <h3 className="font-display font-semibold text-lg text-center">Receive GSC</h3>

        {/* QR Code Placeholder */}
        <div className="flex justify-center">
          <div className="w-48 h-48 bg-white rounded-xl flex items-center justify-center p-4">
            <div className="w-full h-full border-2 border-dashed border-muted-foreground/30 rounded-lg flex flex-col items-center justify-center gap-2">
              <QrCode className="w-12 h-12 text-muted-foreground" />
              <span className="text-xs text-muted-foreground text-center">
                QR Code
              </span>
            </div>
          </div>
        </div>

        {/* Address Display */}
        <div>
          <Label>Your Wallet Address</Label>
          <div className="flex items-center gap-2 mt-1">
            <Input
              value={wallet.address}
              readOnly
              className="font-mono text-sm"
            />
            <Button
              variant="outline"
              size="icon"
              onClick={copyAddress}
              className="shrink-0"
            >
              {copied ? (
                <Check className="w-4 h-4 text-success" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </Button>
          </div>
        </div>

        {/* Label */}
        <div>
          <Label htmlFor="addressLabel">Address Label (optional)</Label>
          <Input
            id="addressLabel"
            value={addressLabel}
            onChange={(e) => setAddressLabel(e.target.value)}
            placeholder="e.g., Payment from client"
            className="mt-1"
          />
          <p className="text-xs text-muted-foreground mt-1">
            Add a label to identify payments to this address.
          </p>
        </div>

        {/* Copy Button */}
        <Button
          onClick={copyAddress}
          className="w-full bg-gold hover:bg-gold/90 text-midnight"
        >
          {copied ? (
            <>
              <Check className="w-4 h-4 mr-2" />
              Copied!
            </>
          ) : (
            <>
              <Copy className="w-4 h-4 mr-2" />
              Copy Address
            </>
          )}
        </Button>

        <p className="text-xs text-muted-foreground text-center">
          Share this address to receive GSC from others.
        </p>
      </div>
    </div>
  );
};

export default ReceiveTab;
