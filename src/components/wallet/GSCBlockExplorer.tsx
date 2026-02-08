import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Blocks, 
  Hash, 
  Clock, 
  User, 
  Coins, 
  ArrowRight, 
  Search,
  ChevronDown,
  ChevronUp,
  Copy,
  Check
} from "lucide-react";
import { gscBlockchainService, GSCBlock, GSCTransaction } from "@/services/gscBlockchain";
import { toast } from "@/hooks/use-toast";

const GSCBlockExplorer = () => {
  const [blocks, setBlocks] = useState<GSCBlock[]>([]);
  const [selectedBlock, setSelectedBlock] = useState<GSCBlock | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedBlocks, setExpandedBlocks] = useState<Set<number>>(new Set());
  const [copiedHash, setCopiedHash] = useState<string | null>(null);

  useEffect(() => {
    loadBlocks();
  }, []);

  const loadBlocks = () => {
    const stats = gscBlockchainService.getBlockchainStats();
    const blockchain = gscBlockchainService.exportBlockchain();
    const parsedBlockchain = JSON.parse(blockchain);
    setBlocks(parsedBlockchain.chain || []);
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleString();
  };

  const formatHash = (hash: string, length: number = 16) => {
    return `${hash.substring(0, length)}...`;
  };

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopiedHash(text);
    toast({
      title: "Copied!",
      description: `${type} copied to clipboard`,
    });
    setTimeout(() => setCopiedHash(null), 2000);
  };

  const toggleBlockExpansion = (blockIndex: number) => {
    const newExpanded = new Set(expandedBlocks);
    if (newExpanded.has(blockIndex)) {
      newExpanded.delete(blockIndex);
    } else {
      newExpanded.add(blockIndex);
    }
    setExpandedBlocks(newExpanded);
  };

  const getTransactionType = (tx: GSCTransaction) => {
    if (tx.sender === "COINBASE") return "coinbase";
    if (tx.sender === "GENESIS") return "genesis";
    return "transfer";
  };

  const getTransactionTypeColor = (type: string) => {
    switch (type) {
      case "coinbase": return "bg-yellow-100 text-yellow-800";
      case "genesis": return "bg-purple-100 text-purple-800";
      case "transfer": return "bg-blue-100 text-blue-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const filteredBlocks = blocks.filter(block => 
    searchQuery === "" || 
    block.hash.toLowerCase().includes(searchQuery.toLowerCase()) ||
    block.index.toString().includes(searchQuery) ||
    block.miner.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalTransactions = blocks.reduce((sum, block) => sum + block.transactions.length, 0);

  return (
    <div className="space-y-6">
      {/* Blockchain Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Blocks</CardTitle>
            <Blocks className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{blocks.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Transactions</CardTitle>
            <ArrowRight className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalTransactions}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Latest Block</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">#{blocks.length > 0 ? blocks[blocks.length - 1].index : 0}</div>
            <p className="text-xs text-muted-foreground">
              {blocks.length > 0 ? formatDate(blocks[blocks.length - 1].timestamp) : "No blocks"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Network Difficulty</CardTitle>
            <Hash className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{blocks.length > 0 ? blocks[blocks.length - 1].difficulty : 0}</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="blocks" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="blocks">Block Explorer</TabsTrigger>
          <TabsTrigger value="transactions">All Transactions</TabsTrigger>
        </TabsList>

        <TabsContent value="blocks" className="space-y-4">
          {/* Search */}
          <div className="flex items-center space-x-2">
            <Search className="w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by block hash, index, or miner..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="max-w-sm"
            />
          </div>

          {/* Blocks List */}
          <ScrollArea className="h-[600px]">
            <div className="space-y-4">
              {filteredBlocks.map((block) => (
                <Card key={block.index} className="border-l-4 border-l-blue-500">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <Badge variant="outline" className="font-mono">
                          Block #{block.index}
                        </Badge>
                        <div className="text-sm text-muted-foreground">
                          {formatDate(block.timestamp)}
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleBlockExpansion(block.index)}
                      >
                        {expandedBlocks.has(block.index) ? (
                          <ChevronUp className="w-4 h-4" />
                        ) : (
                          <ChevronDown className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-3">
                    {/* Block Summary */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <Label className="text-xs text-muted-foreground">Hash</Label>
                        <div className="flex items-center space-x-2">
                          <span className="font-mono text-xs">{formatHash(block.hash)}</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyToClipboard(block.hash, "Block hash")}
                          >
                            {copiedHash === block.hash ? (
                              <Check className="w-3 h-3 text-green-500" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                          </Button>
                        </div>
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground">Miner</Label>
                        <p className="font-mono text-xs">{formatHash(block.miner, 20)}</p>
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground">Transactions</Label>
                        <p className="font-semibold">{block.transactions.length}</p>
                      </div>
                    </div>

                    {/* Expanded Block Details */}
                    {expandedBlocks.has(block.index) && (
                      <div className="space-y-4 border-t pt-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                          <div>
                            <Label className="text-xs text-muted-foreground">Previous Hash</Label>
                            <p className="font-mono text-xs break-all">{block.previous_hash}</p>
                          </div>
                          <div>
                            <Label className="text-xs text-muted-foreground">Merkle Root</Label>
                            <p className="font-mono text-xs break-all">{block.merkle_root}</p>
                          </div>
                          <div>
                            <Label className="text-xs text-muted-foreground">Nonce</Label>
                            <p className="font-semibold">{block.nonce.toLocaleString()}</p>
                          </div>
                          <div>
                            <Label className="text-xs text-muted-foreground">Difficulty</Label>
                            <p className="font-semibold">{block.difficulty}</p>
                          </div>
                          <div>
                            <Label className="text-xs text-muted-foreground">Reward</Label>
                            <p className="font-semibold text-green-600">{block.reward} GSC</p>
                          </div>
                        </div>

                        {/* Transactions in Block */}
                        <div>
                          <Label className="text-sm font-medium">Transactions ({block.transactions.length})</Label>
                          <div className="space-y-2 mt-2">
                            {block.transactions.map((tx, txIndex) => (
                              <div key={txIndex} className="p-3 bg-muted rounded-lg">
                                <div className="flex items-center justify-between mb-2">
                                  <Badge className={getTransactionTypeColor(getTransactionType(tx))}>
                                    {getTransactionType(tx).toUpperCase()}
                                  </Badge>
                                  <span className="text-sm font-semibold text-green-600">
                                    {tx.amount} GSC
                                  </span>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                                  <div>
                                    <span className="text-muted-foreground">From: </span>
                                    <span className="font-mono">{formatHash(tx.sender, 15)}</span>
                                  </div>
                                  <div>
                                    <span className="text-muted-foreground">To: </span>
                                    <span className="font-mono">{formatHash(tx.receiver, 15)}</span>
                                  </div>
                                  <div>
                                    <span className="text-muted-foreground">Fee: </span>
                                    <span>{tx.fee} GSC</span>
                                  </div>
                                  <div>
                                    <span className="text-muted-foreground">TX ID: </span>
                                    <span className="font-mono">{formatHash(tx.tx_id, 12)}</span>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="transactions" className="space-y-4">
          <ScrollArea className="h-[600px]">
            <div className="space-y-3">
              {blocks.flatMap((block, blockIndex) => 
                block.transactions.map((tx, txIndex) => (
                  <Card key={`${blockIndex}-${txIndex}`}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-2">
                          <Badge className={getTransactionTypeColor(getTransactionType(tx))}>
                            {getTransactionType(tx).toUpperCase()}
                          </Badge>
                          <Badge variant="outline">Block #{block.index}</Badge>
                        </div>
                        <div className="text-lg font-semibold text-green-600">
                          {tx.amount} GSC
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                        <div>
                          <Label className="text-xs text-muted-foreground">From</Label>
                          <p className="font-mono">{tx.sender}</p>
                        </div>
                        <div>
                          <Label className="text-xs text-muted-foreground">To</Label>
                          <p className="font-mono">{tx.receiver}</p>
                        </div>
                        <div>
                          <Label className="text-xs text-muted-foreground">Fee</Label>
                          <p>{tx.fee} GSC</p>
                        </div>
                        <div>
                          <Label className="text-xs text-muted-foreground">Time</Label>
                          <p>{formatDate(tx.timestamp)}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default GSCBlockExplorer;
