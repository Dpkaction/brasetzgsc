import { useState } from "react";
import { useBlockchain } from "@/hooks/useBlockchain";
import { Button } from "@/components/ui/button";
import { 
  Link2, 
  ChevronDown, 
  ChevronUp,
  CheckCircle2,
  Hash,
  Clock,
  User,
  Coins
} from "lucide-react";

const BlockchainTab = () => {
  const { blockchain } = useBlockchain();
  const [expandedBlock, setExpandedBlock] = useState<number | null>(null);

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
  };

  const toggleBlock = (index: number) => {
    setExpandedBlock(expandedBlock === index ? null : index);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-display font-semibold text-lg flex items-center gap-2">
          <Link2 className="w-5 h-5 text-gold" />
          Full Blockchain
        </h3>
        <span className="text-sm text-muted-foreground">
          {blockchain.length} blocks
        </span>
      </div>

      {blockchain.length === 0 ? (
        <div className="glass-card p-8 text-center">
          <Link2 className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">No blocks mined yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {[...blockchain].reverse().map((block, idx) => (
            <div 
              key={block.index}
              className={`glass-card overflow-hidden transition-all ${
                idx === 0 ? 'border-gold/30 bg-gold/5' : ''
              }`}
            >
              {/* Block Header */}
              <button
                onClick={() => toggleBlock(block.index)}
                className="w-full p-4 flex items-center justify-between hover:bg-muted/20 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    idx === 0 ? 'bg-gold/20' : 'bg-muted/30'
                  }`}>
                    <span className="font-display font-bold text-sm">
                      #{block.index}
                    </span>
                  </div>
                  <div className="text-left">
                    <p className="font-mono text-sm">
                      <span className="text-success">{block.hash.slice(0, 5)}</span>
                      {block.hash.slice(5, 20)}...
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {block.transactions.length} transactions • {block.reward.toFixed(2)} GSC reward
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {idx === 0 && (
                    <span className="px-2 py-1 rounded-full text-xs bg-gold/20 text-gold">
                      Latest
                    </span>
                  )}
                  <CheckCircle2 className="w-4 h-4 text-success" />
                  {expandedBlock === block.index ? (
                    <ChevronUp className="w-4 h-4" />
                  ) : (
                    <ChevronDown className="w-4 h-4" />
                  )}
                </div>
              </button>

              {/* Block Details */}
              {expandedBlock === block.index && (
                <div className="border-t border-border p-4 bg-muted/10">
                  <div className="grid md:grid-cols-2 gap-4 mb-4">
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Hash className="w-4 h-4 text-muted-foreground" />
                        <div>
                          <p className="text-xs text-muted-foreground">Block Hash</p>
                          <p className="font-mono text-xs break-all">{block.hash}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Hash className="w-4 h-4 text-muted-foreground" />
                        <div>
                          <p className="text-xs text-muted-foreground">Previous Hash</p>
                          <p className="font-mono text-xs break-all">{block.previousHash}</p>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-muted-foreground" />
                        <div>
                          <p className="text-xs text-muted-foreground">Miner</p>
                          <p className="font-mono text-xs">{block.miner}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-muted-foreground" />
                        <div>
                          <p className="text-xs text-muted-foreground">Timestamp</p>
                          <p className="text-sm">{formatTime(block.timestamp)}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Coins className="w-4 h-4 text-muted-foreground" />
                        <div>
                          <p className="text-xs text-muted-foreground">Reward</p>
                          <p className="text-sm text-gold font-medium">{block.reward.toFixed(4)} GSC</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Block Stats */}
                  <div className="grid grid-cols-3 gap-3 mb-4">
                    <div className="p-2 bg-muted/20 rounded text-center">
                      <p className="text-xs text-muted-foreground">Nonce</p>
                      <p className="font-medium">{block.nonce.toLocaleString()}</p>
                    </div>
                    <div className="p-2 bg-muted/20 rounded text-center">
                      <p className="text-xs text-muted-foreground">Difficulty</p>
                      <p className="font-medium">{block.difficulty}</p>
                    </div>
                    <div className="p-2 bg-muted/20 rounded text-center">
                      <p className="text-xs text-muted-foreground">Transactions</p>
                      <p className="font-medium">{block.transactions.length}</p>
                    </div>
                  </div>

                  {/* Transactions */}
                  {block.transactions.length > 0 && (
                    <div>
                      <p className="text-sm font-medium mb-2">Transactions</p>
                      <div className="space-y-2">
                        {block.transactions.map((tx) => (
                          <div 
                            key={tx.id}
                            className="p-2 bg-muted/20 rounded flex items-center justify-between text-xs"
                          >
                            <div className="flex items-center gap-2">
                              {tx.isCoinbase && (
                                <span className="px-1.5 py-0.5 rounded bg-gold/20 text-gold text-[10px]">
                                  COINBASE
                                </span>
                              )}
                              <span className="font-mono">{tx.id}</span>
                            </div>
                            <span className="text-gold font-medium">
                              {tx.amount.toFixed(4)} GSC
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default BlockchainTab;
