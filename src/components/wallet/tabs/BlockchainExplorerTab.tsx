import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useBlockchain } from "@/hooks/useBlockchain";
import { 
  Globe, 
  Search, 
  Link2,
  Hash,
  User,
  ArrowUpRight,
  ArrowDownLeft
} from "lucide-react";

const BlockchainExplorerTab = () => {
  const { getBlock, getBlockByHash, getTransactionsByAddress } = useBlockchain();
  const [searchType, setSearchType] = useState<'block' | 'address'>('block');
  const [searchQuery, setSearchQuery] = useState("");
  const [blockResult, setBlockResult] = useState<any>(null);
  const [addressResult, setAddressResult] = useState<any>(null);
  const [notFound, setNotFound] = useState(false);

  const handleSearch = () => {
    if (!searchQuery.trim()) return;
    
    setBlockResult(null);
    setAddressResult(null);
    setNotFound(false);

    if (searchType === 'block') {
      // Search by block height or hash
      const query = searchQuery.trim();
      let block = null;
      
      if (/^\d+$/.test(query)) {
        block = getBlock(parseInt(query));
      } else {
        block = getBlockByHash(query);
      }
      
      if (block) {
        setBlockResult(block);
      } else {
        setNotFound(true);
      }
    } else {
      // Search by address
      const transactions = getTransactionsByAddress(searchQuery.trim());
      if (transactions.length > 0) {
        setAddressResult({
          address: searchQuery.trim(),
          transactions
        });
      } else {
        setNotFound(true);
      }
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
          <Globe className="w-5 h-5 text-gold" />
          Blockchain Explorer
        </h3>

        {/* Search Type Tabs */}
        <div className="flex gap-2 mb-4">
          <Button
            variant={searchType === 'block' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSearchType('block')}
            className={searchType === 'block' ? 'bg-gold hover:bg-gold/90 text-midnight' : ''}
          >
            <Link2 className="w-4 h-4 mr-2" />
            Block
          </Button>
          <Button
            variant={searchType === 'address' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSearchType('address')}
            className={searchType === 'address' ? 'bg-gold hover:bg-gold/90 text-midnight' : ''}
          >
            <User className="w-4 h-4 mr-2" />
            Address
          </Button>
        </div>

        <div className="flex gap-3">
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={searchType === 'block' ? 'Block height or hash...' : 'Wallet address (GSC...)'}
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
          <h3 className="text-lg font-semibold mb-2">Not Found</h3>
          <p className="text-muted-foreground text-sm">
            No {searchType === 'block' ? 'block' : 'transactions'} found for: {searchQuery}
          </p>
        </div>
      )}

      {/* Block Result */}
      {blockResult && (
        <div className="glass-card p-6">
          <h3 className="font-display font-semibold text-lg mb-4 flex items-center gap-2">
            <Link2 className="w-5 h-5 text-gold" />
            Block #{blockResult.index}
          </h3>

          <div className="grid md:grid-cols-2 gap-4 mb-4">
            <div className="space-y-3">
              <div>
                <span className="text-xs text-muted-foreground">Hash</span>
                <p className="font-mono text-xs break-all mt-1">
                  <span className="text-success">{blockResult.hash.slice(0, 5)}</span>
                  {blockResult.hash.slice(5)}
                </p>
              </div>
              <div>
                <span className="text-xs text-muted-foreground">Previous Hash</span>
                <p className="font-mono text-xs break-all mt-1">{blockResult.previousHash}</p>
              </div>
              <div>
                <span className="text-xs text-muted-foreground">Miner</span>
                <p className="font-mono text-xs mt-1">{blockResult.miner}</p>
              </div>
            </div>
            <div className="space-y-3">
              <div>
                <span className="text-xs text-muted-foreground">Timestamp</span>
                <p className="text-sm mt-1">{formatTime(blockResult.timestamp)}</p>
              </div>
              <div>
                <span className="text-xs text-muted-foreground">Nonce</span>
                <p className="text-sm mt-1">{blockResult.nonce.toLocaleString()}</p>
              </div>
              <div>
                <span className="text-xs text-muted-foreground">Reward</span>
                <p className="text-sm text-gold font-medium mt-1">{blockResult.reward.toFixed(4)} GSC</p>
              </div>
            </div>
          </div>

          {/* Transactions in Block */}
          <div>
            <h4 className="text-sm font-medium mb-2">Transactions ({blockResult.transactions.length})</h4>
            <div className="space-y-2">
              {blockResult.transactions.map((tx: any) => (
                <div key={tx.id} className="p-3 bg-muted/20 rounded-lg flex items-center justify-between">
                  <div>
                    <span className="font-mono text-xs">{tx.id}</span>
                    {tx.isCoinbase && (
                      <span className="ml-2 px-1.5 py-0.5 rounded bg-gold/20 text-gold text-[10px]">
                        COINBASE
                      </span>
                    )}
                  </div>
                  <span className="text-gold font-medium">{tx.amount.toFixed(4)} GSC</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Address Result */}
      {addressResult && (
        <div className="glass-card p-6">
          <h3 className="font-display font-semibold text-lg mb-4 flex items-center gap-2">
            <User className="w-5 h-5 text-gold" />
            Address Transactions
          </h3>

          <div className="p-4 bg-muted/20 rounded-lg mb-4">
            <span className="text-xs text-muted-foreground">Address</span>
            <p className="font-mono text-sm break-all mt-1">{addressResult.address}</p>
          </div>

          <div className="space-y-2">
            {addressResult.transactions.map((tx: any) => (
              <div key={tx.id} className="p-3 bg-muted/20 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {tx.to === addressResult.address ? (
                      <ArrowDownLeft className="w-4 h-4 text-success" />
                    ) : (
                      <ArrowUpRight className="w-4 h-4 text-destructive" />
                    )}
                    <span className="font-mono text-xs">{tx.id}</span>
                  </div>
                  <span className={`font-medium ${
                    tx.to === addressResult.address ? 'text-success' : 'text-destructive'
                  }`}>
                    {tx.to === addressResult.address ? '+' : '-'}{tx.amount.toFixed(4)} GSC
                  </span>
                </div>
                <div className="text-xs text-muted-foreground">
                  {tx.to === addressResult.address ? 'From: ' : 'To: '}
                  <span className="font-mono">
                    {(tx.to === addressResult.address ? tx.from : tx.to).slice(0, 20)}...
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Instructions */}
      {!blockResult && !addressResult && !notFound && (
        <div className="glass-card p-8 text-center">
          <Globe className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">Explore the Blockchain</h3>
          <p className="text-muted-foreground text-sm">
            Search for blocks by height or hash, or view all transactions for a specific address.
          </p>
        </div>
      )}
    </div>
  );
};

export default BlockchainExplorerTab;
