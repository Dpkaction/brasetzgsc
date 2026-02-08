import { toast } from "@/hooks/use-toast";

// GSC Blockchain Types
export interface GSCTransaction {
  sender: string;
  receiver: string;
  amount: number;
  fee: number;
  timestamp: number;
  signature: string;
  tx_id: string;
}

export interface GSCBlock {
  index: number;
  timestamp: number;
  transactions: GSCTransaction[];
  previous_hash: string;
  nonce: number;
  hash: string;
  merkle_root: string;
  difficulty: number;
  miner: string;
  reward: number;
}

export interface GSCWallet {
  name: string;
  address: string;
  private_key: string;
  public_key: string;
  balance: number;
  created: string;
  encrypted: boolean;
}

export interface GSCBlockchain {
  chain: GSCBlock[];
  pending_transactions: GSCTransaction[];
  wallets: GSCWallet[];
  total_supply: number;
  mempool?: GSCTransaction[];
  balances?: { [address: string]: number };
  difficulty?: number;
  mining_reward?: number;
}

class GSCBlockchainService {
  private blockchain: GSCBlockchain | null = null;
  private storage_key = "gsc_blockchain_data";

  constructor() {
    this.loadBlockchain();
  }

  private loadBlockchain(): void {
    try {
      console.log("=== LOADING BLOCKCHAIN ===");
      
      // Check for imported blockchain data first
      const imported = localStorage.getItem('gsc_blockchain');
      if (imported) {
        console.log("Found imported blockchain data, loading...");
        const importedData = JSON.parse(imported);
        
        this.blockchain = {
          chain: importedData.chain || [],
          pending_transactions: importedData.mempool || importedData.pending_transactions || [],
          wallets: [],
          total_supply: importedData.total_supply || 21750000000000,
          balances: importedData.balances || {},
          difficulty: importedData.difficulty || 4,
          mining_reward: importedData.mining_reward || 50,
          mempool: importedData.mempool || importedData.pending_transactions || []
        };
        
        // Create wallets from imported balances
        if (importedData.balances) {
          Object.entries(importedData.balances).forEach(([address, balance]) => {
            if (address !== "GENESIS" && address !== "COINBASE" && address.startsWith("GSC1")) {
              const shortAddress = address.substring(4, 14);
              const wallet: GSCWallet = {
                name: `Wallet_${shortAddress}`,
                address: address,
                private_key: "",
                public_key: "",
                balance: Math.max(0, balance as number),
                created: new Date().toISOString(),
                encrypted: false
              };
              this.blockchain!.wallets.push(wallet);
            }
          });
        }
        
        localStorage.removeItem('gsc_blockchain');
        this.saveBlockchain();
        return;
      }
      
      // Load existing blockchain
      const stored = localStorage.getItem(this.storage_key);
      if (stored) {
        this.blockchain = JSON.parse(stored);
        this.initializeBlockchainAfterImport();
      } else {
        this.createGenesisBlock();
      }
    } catch (error) {
      console.error("Error loading blockchain:", error);
      this.createGenesisBlock();
    }
  }

  private createGenesisBlock(): void {
    console.log("Creating genesis block...");
    this.blockchain = {
      chain: [{
        index: 0,
        timestamp: Date.now(),
        transactions: [],
        previous_hash: "0",
        nonce: 0,
        hash: "genesis_hash",
        merkle_root: "",
        difficulty: 4,
        miner: "GENESIS",
        reward: 0
      }],
      pending_transactions: [],
      wallets: [],
      total_supply: 21750000000000,
      balances: {},
      difficulty: 4,
      mining_reward: 50
    };
    this.saveBlockchain();
  }

  private saveBlockchain(): void {
    try {
      if (this.blockchain) {
        localStorage.setItem(this.storage_key, JSON.stringify(this.blockchain));
      }
    } catch (error) {
      console.error("Error saving blockchain:", error);
    }
  }

  // Get all wallets
  getWallets(): GSCWallet[] {
    if (!this.blockchain || !Array.isArray(this.blockchain.wallets)) {
      return [];
    }
    return this.blockchain.wallets;
  }

  // Get all transactions
  getAllTransactions(): GSCTransaction[] {
    if (!this.blockchain || !Array.isArray(this.blockchain.chain)) {
      return [];
    }
    
    const allTransactions: GSCTransaction[] = [];
    for (const block of this.blockchain.chain) {
      if (block && Array.isArray(block.transactions)) {
        allTransactions.push(...block.transactions);
      }
    }
    
    // Add pending transactions
    if (Array.isArray(this.blockchain.pending_transactions)) {
      allTransactions.push(...this.blockchain.pending_transactions);
    }
    
    return allTransactions;
  }

  // Get wallet balance
  getWalletBalance(address: string): number {
    if (!this.blockchain) return 0;
    
    // Check balances object first
    if (this.blockchain.balances && this.blockchain.balances[address] !== undefined) {
      return this.blockchain.balances[address];
    }
    
    // Check wallet object
    if (Array.isArray(this.blockchain.wallets)) {
      const wallet = this.blockchain.wallets.find(w => w && w.address === address);
      if (wallet && wallet.balance !== undefined) {
        return wallet.balance;
      }
    }
    
    return 0;
  }

  // Get transaction history for address
  getTransactionHistory(address: string): GSCTransaction[] {
    if (!this.blockchain || !Array.isArray(this.blockchain.chain)) {
      return [];
    }

    const transactions: GSCTransaction[] = [];
    
    // Search through all blocks
    for (const block of this.blockchain.chain) {
      if (!block || !Array.isArray(block.transactions)) continue;
      
      for (const tx of block.transactions) {
        if (tx && (tx.sender === address || tx.receiver === address)) {
          transactions.push(tx);
        }
      }
    }
    
    // Add pending transactions
    if (Array.isArray(this.blockchain.pending_transactions)) {
      for (const tx of this.blockchain.pending_transactions) {
        if (tx && (tx.sender === address || tx.receiver === address)) {
          transactions.push(tx);
        }
      }
    }
    
    return transactions.sort((a, b) => b.timestamp - a.timestamp);
  }

  // Create new wallet
  createWallet(name: string): GSCWallet {
    if (!this.blockchain) {
      this.createGenesisBlock();
    }

    const timestamp = Date.now();
    const randomPart = Math.random().toString(36).substring(2, 15);
    const address = `GSC1${timestamp.toString(16)}${randomPart}`;
    
    const wallet: GSCWallet = {
      name: name,
      address: address,
      private_key: this.generatePrivateKey(),
      public_key: this.generatePublicKey(address),
      balance: 0,
      created: new Date().toISOString(),
      encrypted: false
    };

    this.blockchain!.wallets.push(wallet);
    this.saveBlockchain();
    
    return wallet;
  }

  // Import wallet with address
  importWalletWithAddress(name: string, address: string, private_key: string, public_key?: string): GSCWallet {
    if (!this.blockchain) {
      this.createGenesisBlock();
    }

    // Check if wallet already exists
    const existingWallet = this.blockchain!.wallets.find(w => w && w.address === address);
    if (existingWallet) {
      throw new Error("Wallet with this address already exists");
    }

    const balance = this.getWalletBalance(address);
    
    const wallet: GSCWallet = {
      name: name,
      address: address,
      private_key: private_key,
      public_key: public_key || this.generatePublicKey(address),
      balance: balance,
      created: new Date().toISOString(),
      encrypted: false
    };

    this.blockchain!.wallets.push(wallet);
    this.saveBlockchain();
    
    return wallet;
  }

  // Generate private key
  private generatePrivateKey(): string {
    const chars = '0123456789abcdef';
    let result = '';
    for (let i = 0; i < 64; i++) {
      result += chars[Math.floor(Math.random() * chars.length)];
    }
    return result;
  }

  // Generate public key
  private generatePublicKey(address: string): string {
    return address.substring(4) + Math.random().toString(16).substring(2, 10);
  }

  // Create transaction
  async createTransaction(sender: string, receiver: string, amount: number, fee: number): Promise<GSCTransaction> {
    const timestamp = Date.now();
    const txString = `${sender}${receiver}${amount}${fee}${timestamp}`;
    const tx_id = await this.generateGSCHash(txString, 64);
    
    const transaction: GSCTransaction = {
      sender,
      receiver,
      amount,
      fee,
      timestamp,
      tx_id,
      signature: await this.signGSCTransaction({
        sender, receiver, amount, fee, timestamp, tx_id, signature: ""
      })
    };

    return transaction;
  }

  // Generate GSC hash
  private async generateGSCHash(input: string, length: number = 64): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(input);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    return hashHex.substring(0, length);
  }

  // Sign GSC transaction
  private async signGSCTransaction(tx: GSCTransaction): Promise<string> {
    if (!tx.tx_id) return "";
    const signatureData = `${tx.tx_id}${tx.sender}${tx.timestamp}`;
    return await this.generateGSCHash(signatureData, 16);
  }

  // Send transaction
  async sendTransaction(senderWallet: GSCWallet, receiver: string, amount: number): Promise<boolean> {
    try {
      if (!this.blockchain || !senderWallet) {
        console.error("Blockchain or sender wallet not initialized");
        return false;
      }
      
      let balance = this.getWalletBalance(senderWallet.address);
      const fee = 0.1;
      
      if (balance === 0 && senderWallet.balance > 0) {
        balance = senderWallet.balance;
        if (!this.blockchain.balances) {
          this.blockchain.balances = {};
        }
        this.blockchain.balances[senderWallet.address] = senderWallet.balance;
      }
      
      if (!receiver.startsWith("GSC1")) {
        throw new Error("Invalid GSC address format");
      }
      
      if (amount <= 0) {
        throw new Error("Amount must be greater than 0");
      }
      
      if (balance < amount + fee) {
        throw new Error(`Insufficient balance. Need ${(amount + fee).toFixed(8)} GSC, have ${balance.toFixed(8)} GSC`);
      }
      
      const transaction = await this.createTransaction(senderWallet.address, receiver, amount, fee);
      
      if (!this.validateGSCTransaction(transaction, senderWallet.address)) {
        throw new Error("Transaction validation failed");
      }
      
      if (!Array.isArray(this.blockchain.pending_transactions)) {
        this.blockchain.pending_transactions = [];
      }
      this.blockchain.pending_transactions.push(transaction);
      
      this.updateWalletBalance(senderWallet.address, balance - amount - fee);
      const receiverBalance = this.getWalletBalance(receiver);
      this.updateWalletBalance(receiver, receiverBalance + amount);
      
      this.saveBlockchain();
      
      toast({
        title: "GSC Transaction Sent",
        description: `Successfully sent ${amount} GSC to ${receiver.substring(0, 20)}... (Fee: ${fee} GSC)`,
      });
      
      return true;
    } catch (error) {
      toast({
        title: "Transaction Failed",
        description: `${error}`,
        variant: "destructive",
      });
      return false;
    }
  }

  // Validate GSC transaction
  private validateGSCTransaction(transaction: GSCTransaction, senderAddress: string): boolean {
    if (transaction.amount <= 0) return false;
    if (transaction.fee < 0) return false;
    if (transaction.sender === transaction.receiver) return false;
    if (!this.validateGSCAddress(transaction.sender)) return false;
    if (!this.validateGSCAddress(transaction.receiver)) return false;
    if (!transaction.tx_id || transaction.tx_id.length !== 64) return false;
    return true;
  }

  // Validate GSC address
  private validateGSCAddress(address: string): boolean {
    if (!address || typeof address !== 'string') return false;
    if (address === "COINBASE" || address === "GENESIS" || address === "Genesis") return true;
    if (!address.startsWith("GSC1")) return false;
    if (address.length < 35 || address.length > 36) return false;
    
    const hexPart = address.substring(4);
    try {
      parseInt(hexPart, 16);
      return true;
    } catch (error) {
      return false;
    }
  }

  // Update wallet balance
  private updateWalletBalance(address: string, newBalance: number): void {
    if (!this.blockchain.balances) {
      this.blockchain.balances = {};
    }
    this.blockchain.balances[address] = Math.max(0, newBalance);
    
    if (Array.isArray(this.blockchain.wallets)) {
      const wallet = this.blockchain.wallets.find(w => w && w.address === address);
      if (wallet) {
        wallet.balance = Math.max(0, newBalance);
      }
    }
  }

  // Get blockchain stats
  getBlockchainStats() {
    if (!this.blockchain) {
      return {
        totalBlocks: 0,
        totalWallets: 0,
        totalSupply: 0,
        pendingTransactions: 0,
        difficulty: 4,
        miningReward: 50,
        circulatingSupply: 0
      };
    }
    
    return {
      totalBlocks: Array.isArray(this.blockchain.chain) ? this.blockchain.chain.length : 0,
      totalWallets: Array.isArray(this.blockchain.wallets) ? this.blockchain.wallets.length : 0,
      pendingTransactions: Array.isArray(this.blockchain.pending_transactions) ? this.blockchain.pending_transactions.length : 0,
      totalSupply: this.blockchain.total_supply || 0,
      difficulty: this.blockchain.difficulty || 4,
      miningReward: this.blockchain.mining_reward || 50,
      circulatingSupply: Array.isArray(this.blockchain.wallets) ? this.blockchain.wallets.reduce((sum, wallet) => sum + (wallet?.balance || 0), 0) : 0,
    };
  }

  // Search for transaction by ID
  searchTransactionById(txId: string): GSCTransaction | null {
    if (!txId || !this.blockchain || !Array.isArray(this.blockchain.chain)) {
      return null;
    }

    // Search in all blocks
    for (const block of this.blockchain.chain) {
      if (!block || !Array.isArray(block.transactions)) continue;
      
      for (const transaction of block.transactions) {
        if (transaction && transaction.tx_id === txId) {
          return transaction;
        }
      }
    }
    
    // Search in pending transactions
    if (Array.isArray(this.blockchain.pending_transactions)) {
      for (const transaction of this.blockchain.pending_transactions) {
        if (transaction && transaction.tx_id === txId) {
          return transaction;
        }
      }
    }
    
    return null;
  }

  // Initialize blockchain after import
  initializeBlockchainAfterImport(): void {
    if (!this.blockchain) {
      this.blockchain = {
        chain: [],
        wallets: [],
        pending_transactions: [],
        balances: {},
        difficulty: 4,
        mining_reward: 50,
        total_supply: 0
      };
      return;
    }

    if (!Array.isArray(this.blockchain.chain)) {
      this.blockchain.chain = [];
    }
    
    if (!Array.isArray(this.blockchain.wallets)) {
      this.blockchain.wallets = [];
    }
    
    if (!Array.isArray(this.blockchain.pending_transactions)) {
      this.blockchain.pending_transactions = [];
    }
    
    if (!this.blockchain.balances || typeof this.blockchain.balances !== 'object') {
      this.blockchain.balances = {};
    }

    this.blockchain.difficulty = this.blockchain.difficulty || 4;
    this.blockchain.mining_reward = this.blockchain.mining_reward || 50;
    this.blockchain.total_supply = this.blockchain.total_supply || 0;
  }

  // Export blockchain
  exportBlockchain(): string {
    if (!this.blockchain) {
      return JSON.stringify({});
    }
    
    return JSON.stringify({
      chain: this.blockchain.chain || [],
      wallets: this.blockchain.wallets || [],
      pending_transactions: this.blockchain.pending_transactions || [],
      balances: this.blockchain.balances || {},
      difficulty: this.blockchain.difficulty || 4,
      mining_reward: this.blockchain.mining_reward || 50,
      total_supply: this.blockchain.total_supply || 0
    }, null, 2);
  }
}

export const gscBlockchainService = new GSCBlockchainService();
export default GSCBlockchainService;
