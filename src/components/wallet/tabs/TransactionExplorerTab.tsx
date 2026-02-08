import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useBlockchain } from "@/hooks/useBlockchain";
import { 
  Search, 
  ArrowRight, 
  CheckCircle2, 
  Clock,
  Hash,
  Coins
} from "lucide-react";

const TransactionExplorerTab = () => {
  const { getTransaction } = useBlockchain();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResult, setSearchResult] = useState<any>(null);
  const [notFound, setNotFound] = useState(false);

  const handleSearch = () => {
    if (!searchQuery.trim()) return;
    
    const tx = getTransaction(searchQuery.trim().toUpperCase());
    if (tx) {
      setSearchResult(tx);
      setNotFound(false);
    } else {
      setSearchResult(null);
      setNotFound(true);
    }
  };

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
  };

  return (
    <div className="space-y-6">
      {/* Search */}
      <div className="glass-card p-6">
        <h3 className="font-display font-semibold mb-4 flex items-center gap-2">
          <Search className="w-5 h-5 text-gold" />
          Transaction Explorer
        </h3>
        <div className="flex gap-3">
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Enter Transaction ID (e.g., CB12345...)"
            className="font-mono"
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          />
          <Button onClick={handleSearch} className="bg-gold hover:bg-gold/90 text-midnight">
            <Search className="w-4 h-4 mr-2" />
            Search
          </Button>
        </div>
      </div>

      {/* Not Found */}
      {notFound && (
        <div className="glass-card p-8 text-center">
          <Search className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">Transaction Not Found</h3>
          <p className="text-muted-foreground text-sm">
            No transaction found with ID: {searchQuery}
          </p>
        </div>
      )}

      {/* Search Result */}
      {searchResult && (
        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-display font-semibold text-lg">Transaction Details</h3>
            <div className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${
              searchResult.status === 'confirmed' 
                ? 'bg-success/20 text-success' 
                : 'bg-warning/20 text-warning'
            }`}>
              {searchResult.status === 'confirmed' ? (
                <CheckCircle2 className="w-3 h-3" />
              ) : (
                <Clock className="w-3 h-3" />
              )}
              {searchResult.status}
            </div>
          </div>

          <div className="space-y-4">
            {/* TX ID */}
            <div className="p-4 bg-muted/20 rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <Hash className="w-4 h-4 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">Transaction ID</span>
              </div>
              <p className="font-mono text-sm">{searchResult.id}</p>
            </div>

            {/* From -> To */}
            <div className="grid md:grid-cols-2 gap-4">
              <div className="p-4 bg-muted/20 rounded-lg">
                <span className="text-xs text-muted-foreground">From</span>
                <p className="font-mono text-xs mt-1 break-all">
                  {searchResult.from === 'NETWORK' ? (
                    <span className="text-gold">NETWORK (Coinbase)</span>
                  ) : searchResult.from}
                </p>
              </div>
              <div className="p-4 bg-muted/20 rounded-lg">
                <span className="text-xs text-muted-foreground">To</span>
                <p className="font-mono text-xs mt-1 break-all">{searchResult.to}</p>
              </div>
            </div>

            {/* Amount & Fee */}
            <div className="grid md:grid-cols-3 gap-4">
              <div className="p-4 bg-muted/20 rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <Coins className="w-4 h-4 text-gold" />
                  <span className="text-xs text-muted-foreground">Amount</span>
                </div>
                <p className="font-display text-xl font-bold text-gold">
                  {searchResult.amount.toFixed(4)} GSC
                </p>
              </div>
              <div className="p-4 bg-muted/20 rounded-lg">
                <span className="text-xs text-muted-foreground">Fee</span>
                <p className="font-display text-xl font-bold">
                  {searchResult.fee.toFixed(4)} GSC
                </p>
              </div>
              <div className="p-4 bg-muted/20 rounded-lg">
                <span className="text-xs text-muted-foreground">Block Number</span>
                <p className="font-display text-xl font-bold">
                  {searchResult.blockNumber !== undefined ? `#${searchResult.blockNumber}` : 'Pending'}
                </p>
              </div>
            </div>

            {/* Timestamp */}
            <div className="p-4 bg-muted/20 rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <Clock className="w-4 h-4 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">Timestamp</span>
              </div>
              <p className="text-sm">{formatTime(searchResult.timestamp)}</p>
            </div>

            {/* Coinbase Badge */}
            {searchResult.isCoinbase && (
              <div className="p-4 bg-gold/10 border border-gold/30 rounded-lg">
                <p className="text-sm text-gold font-medium">
                  🏆 This is a Coinbase Transaction (Mining Reward)
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Instructions */}
      {!searchResult && !notFound && (
        <div className="glass-card p-8 text-center">
          <Search className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">Search Transactions</h3>
          <p className="text-muted-foreground text-sm">
            Enter a transaction ID to view its details, status, and confirmation.
          </p>
        </div>
      )}
    </div>
  );
};

export default TransactionExplorerTab;
