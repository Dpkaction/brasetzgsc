import { useBlockchain } from "@/hooks/useBlockchain";
import { 
  Link2, 
  CheckCircle2, 
  XCircle, 
  Hash,
  Coins,
  Clock,
  Trophy
} from "lucide-react";

const BlockchainStatsTab = () => {
  const { blockchain, chainValid, getTotalSupply, wallets } = useBlockchain();
  
  const genesisBlock = blockchain[0];
  const latestBlock = blockchain[blockchain.length - 1];
  const totalSupply = getTotalSupply();
  const currentMiner = wallets[0]?.address ?? 'None';

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
  };

  return (
    <div className="space-y-6">
      {/* Chain Validity */}
      <div className={`glass-card p-6 border-2 ${chainValid ? 'border-success/30' : 'border-destructive/30'}`}>
        <div className="flex items-center gap-4">
          {chainValid ? (
            <div className="w-12 h-12 rounded-full bg-success/20 flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6 text-success" />
            </div>
          ) : (
            <div className="w-12 h-12 rounded-full bg-destructive/20 flex items-center justify-center">
              <XCircle className="w-6 h-6 text-destructive" />
            </div>
          )}
          <div>
            <h3 className="font-display font-semibold text-lg">Chain Validity</h3>
            <p className={chainValid ? 'text-success' : 'text-destructive'}>
              {chainValid ? 'Blockchain is valid and secure' : 'Chain integrity compromised!'}
            </p>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="glass-card p-4">
          <div className="flex items-center gap-2 mb-2">
            <Link2 className="w-4 h-4 text-gold" />
            <span className="text-xs text-muted-foreground">Total Blocks</span>
          </div>
          <p className="font-display text-2xl font-bold">{blockchain.length}</p>
        </div>

        <div className="glass-card p-4">
          <div className="flex items-center gap-2 mb-2">
            <Coins className="w-4 h-4 text-gold" />
            <span className="text-xs text-muted-foreground">Total Supply</span>
          </div>
          <p className="font-display text-2xl font-bold">{totalSupply.toFixed(2)}</p>
          <p className="text-xs text-muted-foreground">GSC mined</p>
        </div>

        <div className="glass-card p-4">
          <div className="flex items-center gap-2 mb-2">
            <Hash className="w-4 h-4 text-silver" />
            <span className="text-xs text-muted-foreground">Difficulty</span>
          </div>
          <p className="font-display text-2xl font-bold">5</p>
          <p className="text-xs text-muted-foreground">00000...</p>
        </div>

        <div className="glass-card p-4">
          <div className="flex items-center gap-2 mb-2">
            <Trophy className="w-4 h-4 text-warning" />
            <span className="text-xs text-muted-foreground">Latest Block</span>
          </div>
          <p className="font-display text-2xl font-bold">#{blockchain.length - 1}</p>
        </div>
      </div>

      {/* Genesis Block */}
      {genesisBlock && (
        <div className="glass-card p-6">
          <h3 className="font-display font-semibold mb-4 flex items-center gap-2">
            <Link2 className="w-5 h-5 text-gold" />
            Genesis Block
          </h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div>
                <span className="text-xs text-muted-foreground">Block Index</span>
                <p className="font-medium">0</p>
              </div>
              <div>
                <span className="text-xs text-muted-foreground">Timestamp</span>
                <p className="font-medium">{formatTime(genesisBlock.timestamp)}</p>
              </div>
              <div>
                <span className="text-xs text-muted-foreground">Miner</span>
                <p className="font-medium">{genesisBlock.miner}</p>
              </div>
            </div>
            <div className="space-y-2">
              <div>
                <span className="text-xs text-muted-foreground">Hash</span>
                <p className="font-mono text-xs break-all">{genesisBlock.hash}</p>
              </div>
              <div>
                <span className="text-xs text-muted-foreground">Previous Hash</span>
                <p className="font-mono text-xs break-all">{genesisBlock.previousHash}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Block Table */}
      <div className="glass-card p-6">
        <h3 className="font-display font-semibold mb-4">All Blocks</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-2 text-muted-foreground font-medium">#</th>
                <th className="text-left py-3 px-2 text-muted-foreground font-medium">Hash</th>
                <th className="text-left py-3 px-2 text-muted-foreground font-medium">Prev Hash</th>
                <th className="text-right py-3 px-2 text-muted-foreground font-medium">Nonce</th>
                <th className="text-right py-3 px-2 text-muted-foreground font-medium">TXs</th>
                <th className="text-right py-3 px-2 text-muted-foreground font-medium">Reward</th>
                <th className="text-right py-3 px-2 text-muted-foreground font-medium">Time</th>
              </tr>
            </thead>
            <tbody>
              {[...blockchain].reverse().map((block) => (
                <tr key={block.index} className="border-b border-border/50 hover:bg-muted/20">
                  <td className="py-3 px-2 font-medium">{block.index}</td>
                  <td className="py-3 px-2 font-mono text-xs">
                    <span className="text-success">{block.hash.slice(0, 5)}</span>
                    {block.hash.slice(5, 12)}...
                  </td>
                  <td className="py-3 px-2 font-mono text-xs text-muted-foreground">
                    {block.previousHash.slice(0, 12)}...
                  </td>
                  <td className="py-3 px-2 text-right">{block.nonce.toLocaleString()}</td>
                  <td className="py-3 px-2 text-right">{block.transactions.length}</td>
                  <td className="py-3 px-2 text-right text-gold">{block.reward.toFixed(2)}</td>
                  <td className="py-3 px-2 text-right text-xs text-muted-foreground">
                    {formatTime(block.timestamp)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default BlockchainStatsTab;
