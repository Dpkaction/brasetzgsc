import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useBlockchain } from "@/hooks/useBlockchain";
import { toast } from "@/hooks/use-toast";
import { 
  Pickaxe, 
  Play, 
  Square, 
  Zap, 
  Clock, 
  Hash,
  Trophy,
  Cpu
} from "lucide-react";
import { DIFFICULTY, DIFFICULTY_TARGET, calculateMiningReward } from "@/lib/blockchain";

interface MiningTabProps {
  activeWallet: string | null;
}

const MiningTab = ({ activeWallet }: MiningTabProps) => {
  const { 
    wallets, 
    startMining, 
    stopMining, 
    isMining, 
    miningStats,
    blockchain,
    mempool
  } = useBlockchain();
  
  const [localStats, setLocalStats] = useState({
    hashRate: 0,
    nonce: 0,
    elapsed: 0,
    attempts: 0,
  });

  const wallet = wallets.find(w => w.address === activeWallet);
  const currentBlockHeight = blockchain.length;
  const blockReward = calculateMiningReward(currentBlockHeight);
  const pendingFees = mempool.reduce((sum, tx) => sum + tx.fee, 0);

  useEffect(() => {
    if (miningStats) {
      setLocalStats({
        hashRate: miningStats.hashRate,
        nonce: miningStats.currentNonce,
        elapsed: miningStats.elapsedTime,
        attempts: miningStats.hashAttempts,
      });
    }
  }, [miningStats]);

  const handleStartMining = () => {
    if (!activeWallet) {
      toast({ title: "Error", description: "Please select a wallet first", variant: "destructive" });
      return;
    }

    startMining(activeWallet, (block) => {
      toast({
        title: "🎉 Block Mined!",
        description: `Block #${block.index} mined with reward ${block.reward.toFixed(4)} GSC`,
      });
    });

    toast({
      title: "Mining Started",
      description: "Mining process has started. This may take a while...",
    });
  };

  const handleStopMining = () => {
    stopMining();
    toast({
      title: "Mining Stopped",
      description: "Mining process has been stopped",
    });
  };

  const formatTime = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
    if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
    return `${seconds}s`;
  };

  if (!wallet) {
    return (
      <div className="glass-card p-8 text-center">
        <Pickaxe className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">No Wallet Selected</h3>
        <p className="text-muted-foreground text-sm">
          Select a wallet to start mining GSC.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Mining Controls */}
      <div className="glass-card-gold p-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-gold/10 rounded-full blur-3xl" />
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display font-semibold text-lg flex items-center gap-2">
              <Pickaxe className="w-5 h-5 text-gold" />
              Mining Control
            </h3>
            <div className={`px-3 py-1 rounded-full text-xs font-medium ${
              isMining 
                ? 'bg-success/20 text-success animate-pulse' 
                : 'bg-muted text-muted-foreground'
            }`}>
              {isMining ? 'Mining Active' : 'Idle'}
            </div>
          </div>

          <div className="mb-4">
            <p className="text-sm text-muted-foreground mb-1">Miner Address</p>
            <p className="font-mono text-xs truncate">{wallet.address}</p>
          </div>

          <div className="flex gap-3">
            {!isMining ? (
              <Button 
                onClick={handleStartMining} 
                className="flex-1 bg-success hover:bg-success/90"
              >
                <Play className="w-4 h-4 mr-2" />
                Start Mining
              </Button>
            ) : (
              <Button 
                onClick={handleStopMining} 
                variant="destructive"
                className="flex-1"
              >
                <Square className="w-4 h-4 mr-2" />
                Stop Mining
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Mining Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="glass-card p-4">
          <div className="flex items-center gap-2 mb-2">
            <Zap className="w-4 h-4 text-gold" />
            <span className="text-xs text-muted-foreground">Hash Rate</span>
          </div>
          <p className="font-display text-xl font-bold">
            {localStats.hashRate.toLocaleString()}
          </p>
          <p className="text-xs text-muted-foreground">H/s</p>
        </div>

        <div className="glass-card p-4">
          <div className="flex items-center gap-2 mb-2">
            <Hash className="w-4 h-4 text-silver" />
            <span className="text-xs text-muted-foreground">Nonce</span>
          </div>
          <p className="font-display text-xl font-bold">
            {localStats.nonce.toLocaleString()}
          </p>
          <p className="text-xs text-muted-foreground">current</p>
        </div>

        <div className="glass-card p-4">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-4 h-4 text-info" />
            <span className="text-xs text-muted-foreground">Elapsed</span>
          </div>
          <p className="font-display text-xl font-bold">
            {formatTime(localStats.elapsed)}
          </p>
          <p className="text-xs text-muted-foreground">time</p>
        </div>

        <div className="glass-card p-4">
          <div className="flex items-center gap-2 mb-2">
            <Cpu className="w-4 h-4 text-warning" />
            <span className="text-xs text-muted-foreground">Attempts</span>
          </div>
          <p className="font-display text-xl font-bold">
            {localStats.attempts.toLocaleString()}
          </p>
          <p className="text-xs text-muted-foreground">hashes</p>
        </div>
      </div>

      {/* Current Block Info */}
      <div className="glass-card p-6">
        <h3 className="font-display font-semibold mb-4 flex items-center gap-2">
          <Trophy className="w-5 h-5 text-gold" />
          Current Block Being Mined
        </h3>
        
        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-muted-foreground text-sm">Block Height</span>
              <span className="font-medium">#{currentBlockHeight}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground text-sm">Difficulty</span>
              <span className="font-medium">{DIFFICULTY} ({DIFFICULTY_TARGET}...)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground text-sm">Transactions</span>
              <span className="font-medium">{mempool.length} pending</span>
            </div>
          </div>
          
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-muted-foreground text-sm">Block Reward</span>
              <span className="font-medium text-gold">{blockReward.toFixed(4)} GSC</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground text-sm">Total Fees</span>
              <span className="font-medium text-gold">{pendingFees.toFixed(4)} GSC</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground text-sm">Total Reward</span>
              <span className="font-bold text-gold">{(blockReward + pendingFees).toFixed(4)} GSC</span>
            </div>
          </div>
        </div>
      </div>

      {/* Mining Info */}
      <div className="glass-card p-6">
        <h3 className="font-display font-semibold mb-4">Mining Information</h3>
        <div className="space-y-2 text-sm">
          <p className="text-muted-foreground">
            • Difficulty is fixed at <span className="text-foreground font-medium">{DIFFICULTY}</span> (hash must start with {DIFFICULTY_TARGET})
          </p>
          <p className="text-muted-foreground">
            • Initial block reward: <span className="text-foreground font-medium">50 GSC</span>
          </p>
          <p className="text-muted-foreground">
            • Halving interval: <span className="text-foreground font-medium">210,000 blocks</span>
          </p>
          <p className="text-muted-foreground">
            • Maximum supply: <span className="text-foreground font-medium">21.75 trillion GSC</span>
          </p>
          <p className="text-muted-foreground">
            • Max transactions per block: <span className="text-foreground font-medium">1,000</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default MiningTab;
