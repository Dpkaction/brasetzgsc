import { useBlockchain } from "@/hooks/useBlockchain";
import { 
  Coins, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Clock,
  CheckCircle2,
  XCircle
} from "lucide-react";

interface OverviewTabProps {
  activeWallet: string | null;
}

const OverviewTab = ({ activeWallet }: OverviewTabProps) => {
  const { wallets, getTransactionsByAddress, blockchain } = useBlockchain();
  
  const wallet = wallets.find(w => w.address === activeWallet);
  const transactions = activeWallet ? getTransactionsByAddress(activeWallet) : [];
  
  const confirmedTxs = transactions.filter(tx => tx.status === 'confirmed');
  const pendingTxs = transactions.filter(tx => tx.status === 'pending');

  if (!wallet) {
    return (
      <div className="glass-card p-8 text-center">
        <Coins className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">No Wallet Selected</h3>
        <p className="text-muted-foreground text-sm">
          Create or select a wallet to view your balance and transactions.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Balance Card */}
      <div className="glass-card-gold p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-gold/10 rounded-full blur-3xl" />
        <div className="relative z-10">
          <p className="text-muted-foreground text-sm mb-1">Wallet Balance</p>
          <div className="flex items-baseline gap-2">
            <span className="font-display text-5xl font-bold text-gradient-gold">
              {wallet.balance.toFixed(4)}
            </span>
            <span className="text-xl text-gold font-display">GSC</span>
          </div>
          <p className="text-xs text-muted-foreground mt-2 font-mono">
            {wallet.address}
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="glass-card p-4">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle2 className="w-4 h-4 text-success" />
            <span className="text-xs text-muted-foreground">Confirmed</span>
          </div>
          <p className="font-display text-2xl font-bold">{confirmedTxs.length}</p>
        </div>
        
        <div className="glass-card p-4">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-4 h-4 text-warning" />
            <span className="text-xs text-muted-foreground">Pending</span>
          </div>
          <p className="font-display text-2xl font-bold">{pendingTxs.length}</p>
        </div>
        
        <div className="glass-card p-4">
          <div className="flex items-center gap-2 mb-2">
            <ArrowUpRight className="w-4 h-4 text-destructive" />
            <span className="text-xs text-muted-foreground">Sent</span>
          </div>
          <p className="font-display text-2xl font-bold">
            {transactions.filter(tx => tx.from === activeWallet).length}
          </p>
        </div>
        
        <div className="glass-card p-4">
          <div className="flex items-center gap-2 mb-2">
            <ArrowDownLeft className="w-4 h-4 text-success" />
            <span className="text-xs text-muted-foreground">Received</span>
          </div>
          <p className="font-display text-2xl font-bold">
            {transactions.filter(tx => tx.to === activeWallet).length}
          </p>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="glass-card p-6">
        <h3 className="font-display font-semibold mb-4">Recent Transactions</h3>
        {transactions.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">
            No transactions yet
          </p>
        ) : (
          <div className="space-y-3">
            {transactions.slice(0, 10).map((tx) => (
              <div
                key={tx.id}
                className="flex items-center justify-between p-3 bg-muted/20 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  {tx.to === activeWallet ? (
                    <div className="w-8 h-8 rounded-full bg-success/20 flex items-center justify-center">
                      <ArrowDownLeft className="w-4 h-4 text-success" />
                    </div>
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-destructive/20 flex items-center justify-center">
                      <ArrowUpRight className="w-4 h-4 text-destructive" />
                    </div>
                  )}
                  <div>
                    <p className="text-sm font-medium">
                      {tx.to === activeWallet ? 'Received' : 'Sent'}
                    </p>
                    <p className="text-xs text-muted-foreground font-mono">
                      {tx.id}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-medium ${tx.to === activeWallet ? 'text-success' : 'text-destructive'}`}>
                    {tx.to === activeWallet ? '+' : '-'}{tx.amount.toFixed(4)} GSC
                  </p>
                  <div className="flex items-center gap-1 justify-end">
                    {tx.status === 'confirmed' ? (
                      <CheckCircle2 className="w-3 h-3 text-success" />
                    ) : (
                      <Clock className="w-3 h-3 text-warning" />
                    )}
                    <span className="text-xs text-muted-foreground">{tx.status}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Last Update */}
      <p className="text-xs text-muted-foreground text-center">
        Last updated: {new Date().toLocaleString()}
      </p>
    </div>
  );
};

export default OverviewTab;
