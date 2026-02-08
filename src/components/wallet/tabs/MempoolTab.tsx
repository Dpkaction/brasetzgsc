import { useBlockchain } from "@/hooks/useBlockchain";
import { Clock, Coins, Hash, ArrowRight } from "lucide-react";

const MempoolTab = () => {
  const { mempool } = useBlockchain();
  
  const totalFees = mempool.reduce((sum, tx) => sum + tx.fee, 0);
  const totalAmount = mempool.reduce((sum, tx) => sum + tx.amount, 0);

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
  };

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="glass-card p-4">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-4 h-4 text-warning" />
            <span className="text-xs text-muted-foreground">Pending</span>
          </div>
          <p className="font-display text-2xl font-bold">{mempool.length}</p>
          <p className="text-xs text-muted-foreground">transactions</p>
        </div>

        <div className="glass-card p-4">
          <div className="flex items-center gap-2 mb-2">
            <Coins className="w-4 h-4 text-gold" />
            <span className="text-xs text-muted-foreground">Total Fees</span>
          </div>
          <p className="font-display text-2xl font-bold text-gold">{totalFees.toFixed(4)}</p>
          <p className="text-xs text-muted-foreground">GSC</p>
        </div>

        <div className="glass-card p-4">
          <div className="flex items-center gap-2 mb-2">
            <Hash className="w-4 h-4 text-silver" />
            <span className="text-xs text-muted-foreground">Total Amount</span>
          </div>
          <p className="font-display text-2xl font-bold">{totalAmount.toFixed(4)}</p>
          <p className="text-xs text-muted-foreground">GSC</p>
        </div>
      </div>

      {/* Transaction Table */}
      <div className="glass-card p-6">
        <h3 className="font-display font-semibold mb-4">Pending Transactions</h3>
        
        {mempool.length === 0 ? (
          <div className="text-center py-12">
            <Clock className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No pending transactions</p>
            <p className="text-xs text-muted-foreground mt-1">
              Transactions will appear here before being mined
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-2 text-muted-foreground font-medium">TX ID</th>
                  <th className="text-left py-3 px-2 text-muted-foreground font-medium">From</th>
                  <th className="text-left py-3 px-2 text-muted-foreground font-medium">To</th>
                  <th className="text-right py-3 px-2 text-muted-foreground font-medium">Amount</th>
                  <th className="text-right py-3 px-2 text-muted-foreground font-medium">Fee</th>
                  <th className="text-right py-3 px-2 text-muted-foreground font-medium">Time</th>
                  <th className="text-center py-3 px-2 text-muted-foreground font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {mempool.map((tx) => (
                  <tr key={tx.id} className="border-b border-border/50 hover:bg-muted/20">
                    <td className="py-3 px-2 font-mono text-xs">{tx.id}</td>
                    <td className="py-3 px-2">
                      <span className="font-mono text-xs truncate block max-w-[120px]" title={tx.from}>
                        {tx.from === 'NETWORK' ? 'NETWORK' : tx.from.slice(0, 12) + '...'}
                      </span>
                    </td>
                    <td className="py-3 px-2">
                      <span className="font-mono text-xs truncate block max-w-[120px]" title={tx.to}>
                        {tx.to.slice(0, 12)}...
                      </span>
                    </td>
                    <td className="py-3 px-2 text-right font-medium">{tx.amount.toFixed(4)}</td>
                    <td className="py-3 px-2 text-right text-muted-foreground">{tx.fee.toFixed(4)}</td>
                    <td className="py-3 px-2 text-right text-xs text-muted-foreground">
                      {formatTime(tx.timestamp)}
                    </td>
                    <td className="py-3 px-2 text-center">
                      <span className="px-2 py-1 rounded-full text-xs bg-warning/20 text-warning">
                        Pending
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="text-xs text-muted-foreground text-center">
        Transactions are sorted by fee (highest first) for mining priority.
      </div>
    </div>
  );
};

export default MempoolTab;
