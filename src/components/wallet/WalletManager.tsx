import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "@/hooks/use-toast";
import { useBlockchain } from "@/hooks/useBlockchain";
import { Wallet } from "@/lib/blockchain";
import {
  Wallet as WalletIcon,
  Plus,
  FolderOpen,
  X,
  Download,
  Upload,
  Key,
  FileText,
  ChevronDown,
  Copy,
  Trash2,
  Check,
} from "lucide-react";

interface WalletManagerProps {
  activeWallet: string | null;
  onWalletChange: (address: string | null) => void;
}

const WalletManager = ({ activeWallet, onWalletChange }: WalletManagerProps) => {
  const { wallets, createWallet, importWallet, removeWallet, getWalletBalance } = useBlockchain();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [isBackupOpen, setIsBackupOpen] = useState(false);
  const [isPaperWalletOpen, setIsPaperWalletOpen] = useState(false);
  const [newWalletLabel, setNewWalletLabel] = useState("");
  const [importPrivateKey, setImportPrivateKey] = useState("");
  const [importLabel, setImportLabel] = useState("");
  const [mnemonic, setMnemonic] = useState<string[]>([]);
  const [newWalletData, setNewWalletData] = useState<Wallet | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const selectedWallet = wallets.find(w => w.address === activeWallet);

  const handleCreateWallet = async () => {
    if (!newWalletLabel.trim()) {
      toast({ title: "Error", description: "Please enter a wallet label", variant: "destructive" });
      return;
    }

    const result = await createWallet(newWalletLabel.trim());
    setNewWalletData(result.wallet);
    setMnemonic(result.mnemonic);
    setNewWalletLabel("");
    onWalletChange(result.wallet.address);
    
    toast({
      title: "Wallet Created",
      description: "Please backup your seed phrase and private key!",
    });
  };

  const handleImportWallet = () => {
    if (!importPrivateKey.trim() || !importLabel.trim()) {
      toast({ title: "Error", description: "Please fill all fields", variant: "destructive" });
      return;
    }

    const wallet = importWallet(importPrivateKey.trim(), importLabel.trim());
    if (wallet) {
      setImportPrivateKey("");
      setImportLabel("");
      setIsImportOpen(false);
      onWalletChange(wallet.address);
      toast({ title: "Wallet Imported", description: `Wallet "${wallet.label}" imported successfully` });
    } else {
      toast({ title: "Error", description: "Failed to import wallet", variant: "destructive" });
    }
  };

  const handleRemoveWallet = (address: string) => {
    removeWallet(address);
    if (activeWallet === address) {
      onWalletChange(wallets.length > 1 ? wallets.find(w => w.address !== address)?.address ?? null : null);
    }
    toast({ title: "Wallet Removed", description: "Wallet has been removed" });
  };

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
    toast({ title: "Copied", description: `${field} copied to clipboard` });
  };

  return (
    <div className="flex items-center gap-3">
      {/* Wallet Selector */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="gap-2 border-gold/30 hover:border-gold">
            <WalletIcon className="w-4 h-4 text-gold" />
            <span className="max-w-[150px] truncate">
              {selectedWallet ? selectedWallet.label : "Select Wallet"}
            </span>
            <ChevronDown className="w-4 h-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-64">
          {wallets.length === 0 ? (
            <div className="px-3 py-2 text-sm text-muted-foreground">No wallets created</div>
          ) : (
            wallets.map((wallet) => (
              <DropdownMenuItem
                key={wallet.address}
                className="flex items-center justify-between cursor-pointer"
                onClick={() => onWalletChange(wallet.address)}
              >
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{wallet.label}</p>
                  <p className="text-xs text-muted-foreground truncate">{wallet.address}</p>
                </div>
                <span className="text-xs text-gold ml-2">{getWalletBalance(wallet.address).toFixed(2)} GSC</span>
              </DropdownMenuItem>
            ))
          )}
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setIsCreateOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Create Wallet
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setIsImportOpen(true)}>
            <Upload className="w-4 h-4 mr-2" />
            Import Wallet
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* File Menu */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className="gap-2">
            File
            <ChevronDown className="w-3 h-3" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem onClick={() => setIsCreateOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Create Wallet
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onWalletChange(wallets[0]?.address ?? null)} disabled={wallets.length === 0}>
            <FolderOpen className="w-4 h-4 mr-2" />
            Open Wallet
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onWalletChange(null)} disabled={!activeWallet}>
            <X className="w-4 h-4 mr-2" />
            Close Wallet
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onWalletChange(null)}>
            <X className="w-4 h-4 mr-2" />
            Close All Wallets
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setIsBackupOpen(true)} disabled={!selectedWallet}>
            <Download className="w-4 h-4 mr-2" />
            Backup Wallet
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setIsImportOpen(true)}>
            <Upload className="w-4 h-4 mr-2" />
            Restore/Import Wallet
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setIsBackupOpen(true)} disabled={!selectedWallet}>
            <Key className="w-4 h-4 mr-2" />
            Check Private Key
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setIsPaperWalletOpen(true)} disabled={!selectedWallet}>
            <FileText className="w-4 h-4 mr-2" />
            Generate Paper Wallet
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem 
            onClick={() => selectedWallet && handleRemoveWallet(selectedWallet.address)} 
            disabled={!selectedWallet}
            className="text-destructive"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Delete Wallet
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Create Wallet Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Create New Wallet</DialogTitle>
            <DialogDescription>
              Create a new GSC wallet with a unique address and private key.
            </DialogDescription>
          </DialogHeader>
          
          {!newWalletData ? (
            <div className="space-y-4">
              <div>
                <Label htmlFor="walletLabel">Wallet Label</Label>
                <Input
                  id="walletLabel"
                  value={newWalletLabel}
                  onChange={(e) => setNewWalletLabel(e.target.value)}
                  placeholder="e.g., Main Wallet"
                  className="mt-1"
                />
              </div>
              <Button onClick={handleCreateWallet} className="w-full bg-gold hover:bg-gold/90 text-midnight">
                Create Wallet
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="p-4 bg-warning/10 border border-warning/30 rounded-lg">
                <p className="text-sm text-warning font-medium">⚠️ Important: Backup your seed phrase!</p>
                <p className="text-xs text-muted-foreground mt-1">
                  This is the only way to recover your wallet. Store it securely.
                </p>
              </div>
              
              <div>
                <Label>Seed Phrase (12 words)</Label>
                <div className="grid grid-cols-3 gap-2 mt-2 p-3 bg-muted/30 rounded-lg">
                  {mnemonic.map((word, i) => (
                    <div key={i} className="text-xs p-1 bg-background rounded text-center">
                      <span className="text-muted-foreground mr-1">{i + 1}.</span>
                      {word}
                    </div>
                  ))}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-2 w-full"
                  onClick={() => copyToClipboard(mnemonic.join(' '), 'Seed phrase')}
                >
                  {copiedField === 'Seed phrase' ? <Check className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
                  Copy Seed Phrase
                </Button>
              </div>
              
              <div>
                <Label>Wallet Address</Label>
                <div className="flex items-center gap-2 mt-1">
                  <Input value={newWalletData.address} readOnly className="font-mono text-xs" />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => copyToClipboard(newWalletData.address, 'Address')}
                  >
                    {copiedField === 'Address' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </Button>
                </div>
              </div>
              
              <div>
                <Label>Private Key</Label>
                <div className="flex items-center gap-2 mt-1">
                  <Input value={newWalletData.privateKey} readOnly type="password" className="font-mono text-xs" />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => copyToClipboard(newWalletData.privateKey, 'Private key')}
                  >
                    {copiedField === 'Private key' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </Button>
                </div>
              </div>
              
              <Button 
                onClick={() => {
                  setIsCreateOpen(false);
                  setNewWalletData(null);
                  setMnemonic([]);
                }} 
                className="w-full"
              >
                I've Saved My Backup
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Import Wallet Dialog */}
      <Dialog open={isImportOpen} onOpenChange={setIsImportOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Import Wallet</DialogTitle>
            <DialogDescription>
              Import an existing wallet using your private key.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="importLabel">Wallet Label</Label>
              <Input
                id="importLabel"
                value={importLabel}
                onChange={(e) => setImportLabel(e.target.value)}
                placeholder="e.g., Imported Wallet"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="privateKey">Private Key</Label>
              <Input
                id="privateKey"
                value={importPrivateKey}
                onChange={(e) => setImportPrivateKey(e.target.value)}
                placeholder="Enter your private key"
                type="password"
                className="mt-1"
              />
            </div>
            <Button onClick={handleImportWallet} className="w-full bg-gold hover:bg-gold/90 text-midnight">
              Import Wallet
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Backup Wallet Dialog */}
      <Dialog open={isBackupOpen} onOpenChange={setIsBackupOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Backup Wallet</DialogTitle>
            <DialogDescription>
              Your wallet keys for backup and recovery.
            </DialogDescription>
          </DialogHeader>
          {selectedWallet && (
            <div className="space-y-4">
              <div className="p-4 bg-destructive/10 border border-destructive/30 rounded-lg">
                <p className="text-sm text-destructive font-medium">⚠️ Keep these private!</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Never share your private key with anyone.
                </p>
              </div>
              
              <div>
                <Label>Wallet Address</Label>
                <div className="flex items-center gap-2 mt-1">
                  <Input value={selectedWallet.address} readOnly className="font-mono text-xs" />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => copyToClipboard(selectedWallet.address, 'Address')}
                  >
                    {copiedField === 'Address' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </Button>
                </div>
              </div>
              
              <div>
                <Label>Private Key</Label>
                <div className="flex items-center gap-2 mt-1">
                  <Input value={selectedWallet.privateKey} readOnly className="font-mono text-xs" />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => copyToClipboard(selectedWallet.privateKey, 'Private key')}
                  >
                    {copiedField === 'Private key' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Paper Wallet Dialog */}
      <Dialog open={isPaperWalletOpen} onOpenChange={setIsPaperWalletOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Paper Wallet</DialogTitle>
            <DialogDescription>
              Print this page and store it securely.
            </DialogDescription>
          </DialogHeader>
          {selectedWallet && (
            <div className="space-y-4 p-4 border border-dashed border-border rounded-lg">
              <div className="text-center">
                <h3 className="font-display text-lg font-bold text-gold">GSC Paper Wallet</h3>
                <p className="text-xs text-muted-foreground">Gold Silver Coin</p>
              </div>
              
              <div className="space-y-3">
                <div className="p-3 bg-muted/30 rounded">
                  <Label className="text-xs text-muted-foreground">PUBLIC ADDRESS</Label>
                  <p className="font-mono text-xs break-all mt-1">{selectedWallet.address}</p>
                </div>
                
                <div className="p-3 bg-muted/30 rounded">
                  <Label className="text-xs text-muted-foreground">PRIVATE KEY (KEEP SECRET)</Label>
                  <p className="font-mono text-xs break-all mt-1">{selectedWallet.privateKey}</p>
                </div>
              </div>
              
              <Button onClick={() => window.print()} variant="outline" className="w-full">
                Print Paper Wallet
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default WalletManager;
