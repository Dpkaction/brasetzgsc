// ============= PRODUCTION-GRADE BLOCKCHAIN CORE =============

export interface Transaction {
  id: string;
  from: string;
  to: string;
  amount: number;
  fee: number;
  timestamp: number;
  signature?: string;
  isCoinbase?: boolean;
  status: 'pending' | 'confirmed';
  blockNumber?: number;
}

export interface Block {
  index: number;
  timestamp: number;
  transactions: Transaction[];
  previousHash: string;
  hash: string;
  nonce: number;
  difficulty: number;
  miner: string;
  reward: number;
}

export interface Wallet {
  id: string;
  address: string;
  privateKey: string;
  publicKey: string;
  label: string;
  balance: number;
  createdAt: number;
}

export interface MiningStats {
  isActive: boolean;
  currentNonce: number;
  hashAttempts: number;
  hashRate: number;
  elapsedTime: number;
  currentBlock: Block | null;
}

// Constants
export const DIFFICULTY = 5; // Hash must start with 5 zeros
export const DIFFICULTY_TARGET = '00000';
export const INITIAL_REWARD = 50;
export const HALVING_INTERVAL = 210000;
export const MAX_SUPPLY = 21750000000000; // 21.75 trillion GSC
export const MAX_TRANSACTIONS_PER_BLOCK = 1000;

// SHA-256 hash function
export async function sha256(message: string): Promise<string> {
  const msgBuffer = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// Generate random hex string
export function generateRandomHex(length: number): string {
  const array = new Uint8Array(length / 2);
  crypto.getRandomValues(array);
  return Array.from(array).map(b => b.toString(16).padStart(2, '0')).join('');
}

// Generate wallet address
export async function generateWalletAddress(): Promise<{ address: string; privateKey: string; publicKey: string }> {
  const privateKey = generateRandomHex(64);
  const publicKey = await sha256(privateKey);
  const address = 'GSC' + publicKey.slice(0, 40).toUpperCase();
  return { address, privateKey, publicKey };
}

// Generate 12-word mnemonic seed phrase
export function generateMnemonic(): string[] {
  const wordList = [
    'abandon', 'ability', 'able', 'about', 'above', 'absent', 'absorb', 'abstract',
    'absurd', 'abuse', 'access', 'accident', 'account', 'accuse', 'achieve', 'acid',
    'acoustic', 'acquire', 'across', 'act', 'action', 'actor', 'actress', 'actual',
    'adapt', 'add', 'addict', 'address', 'adjust', 'admit', 'adult', 'advance',
    'advice', 'aerobic', 'affair', 'afford', 'afraid', 'again', 'age', 'agent',
    'agree', 'ahead', 'aim', 'air', 'airport', 'aisle', 'alarm', 'album',
    'alcohol', 'alert', 'alien', 'all', 'alley', 'allow', 'almost', 'alone',
    'alpha', 'already', 'also', 'alter', 'always', 'amateur', 'amazing', 'among',
    'amount', 'amused', 'analyst', 'anchor', 'ancient', 'anger', 'angle', 'angry',
    'animal', 'ankle', 'announce', 'annual', 'another', 'answer', 'antenna', 'antique',
    'anxiety', 'any', 'apart', 'apology', 'appear', 'apple', 'approve', 'april',
    'arch', 'arctic', 'area', 'arena', 'argue', 'arm', 'armed', 'armor',
    'army', 'around', 'arrange', 'arrest', 'arrive', 'arrow', 'art', 'artefact',
    'artist', 'artwork', 'ask', 'aspect', 'assault', 'asset', 'assist', 'assume',
    'asthma', 'athlete', 'atom', 'attack', 'attend', 'attitude', 'attract', 'auction',
    'audit', 'august', 'aunt', 'author', 'auto', 'autumn', 'average', 'avocado',
    'avoid', 'awake', 'aware', 'away', 'awesome', 'awful', 'awkward', 'axis',
    'baby', 'bachelor', 'bacon', 'badge', 'bag', 'balance', 'balcony', 'ball',
    'bamboo', 'banana', 'banner', 'bar', 'barely', 'bargain', 'barrel', 'base',
    'basic', 'basket', 'battle', 'beach', 'bean', 'beauty', 'because', 'become',
    'beef', 'before', 'begin', 'behave', 'behind', 'believe', 'below', 'belt',
    'bench', 'benefit', 'best', 'betray', 'better', 'between', 'beyond', 'bicycle',
    'bid', 'bike', 'bind', 'biology', 'bird', 'birth', 'bitter', 'black', 'blade',
    'blame', 'blanket', 'blast', 'bleak', 'bless', 'blind', 'blood', 'blossom',
    'blouse', 'blue', 'blur', 'blush', 'board', 'boat', 'body', 'boil', 'bomb',
    'bone', 'bonus', 'book', 'boost', 'border', 'boring', 'borrow', 'boss',
    'bottom', 'bounce', 'box', 'boy', 'bracket', 'brain', 'brand', 'brass',
    'brave', 'bread', 'breeze', 'brick', 'bridge', 'brief', 'bright', 'bring',
    'brisk', 'broccoli', 'broken', 'bronze', 'broom', 'brother', 'brown', 'brush',
    'bubble', 'buddy', 'budget', 'buffalo', 'build', 'bulb', 'bulk', 'bullet',
    'bundle', 'bunker', 'burden', 'burger', 'burst', 'bus', 'business', 'busy',
    'butter', 'buyer', 'buzz', 'cabbage', 'cabin', 'cable', 'cactus', 'cage',
    'cake', 'call', 'calm', 'camera', 'camp', 'can', 'canal', 'cancel', 'candy',
    'cannon', 'canoe', 'canvas', 'canyon', 'capable', 'capital', 'captain', 'car'
  ];
  
  const mnemonic: string[] = [];
  for (let i = 0; i < 12; i++) {
    const randomIndex = Math.floor(Math.random() * wordList.length);
    mnemonic.push(wordList[randomIndex]);
  }
  return mnemonic;
}

// Calculate block hash
export async function calculateBlockHash(block: Omit<Block, 'hash'>): Promise<string> {
  const blockData = JSON.stringify({
    index: block.index,
    timestamp: block.timestamp,
    transactions: block.transactions.map(tx => tx.id),
    previousHash: block.previousHash,
    nonce: block.nonce,
    difficulty: block.difficulty,
    miner: block.miner,
  });
  return sha256(blockData);
}

// Calculate mining reward based on halving
export function calculateMiningReward(blockHeight: number): number {
  const halvings = Math.floor(blockHeight / HALVING_INTERVAL);
  if (halvings >= 64) return 0;
  return INITIAL_REWARD / Math.pow(2, halvings);
}

// Create genesis block
export async function createGenesisBlock(): Promise<Block> {
  const genesisBlock: Omit<Block, 'hash'> = {
    index: 0,
    timestamp: Date.now(),
    transactions: [],
    previousHash: '0'.repeat(64),
    nonce: 0,
    difficulty: DIFFICULTY,
    miner: 'GENESIS',
    reward: 0,
  };
  
  const hash = await calculateBlockHash(genesisBlock);
  return { ...genesisBlock, hash };
}

// Validate block
export async function validateBlock(block: Block, previousBlock: Block): Promise<boolean> {
  // Check index
  if (block.index !== previousBlock.index + 1) {
    console.error('Invalid block index');
    return false;
  }
  
  // Check previous hash
  if (block.previousHash !== previousBlock.hash) {
    console.error('Previous hash mismatch');
    return false;
  }
  
  // Check difficulty
  if (!block.hash.startsWith(DIFFICULTY_TARGET)) {
    console.error('Difficulty not met');
    return false;
  }
  
  // Verify hash
  const calculatedHash = await calculateBlockHash(block);
  if (calculatedHash !== block.hash) {
    console.error('Hash mismatch');
    return false;
  }
  
  return true;
}

// Validate transaction
export function validateTransaction(tx: Transaction, senderBalance: number): boolean {
  if (tx.isCoinbase) return true;
  if (tx.amount <= 0) return false;
  if (tx.fee < 0) return false;
  if (tx.amount + tx.fee > senderBalance) return false;
  return true;
}

// Create transaction
export async function createTransaction(
  from: string,
  to: string,
  amount: number,
  fee: number
): Promise<Transaction> {
  const id = await sha256(`${from}${to}${amount}${fee}${Date.now()}${Math.random()}`);
  return {
    id: id.slice(0, 16).toUpperCase(),
    from,
    to,
    amount,
    fee,
    timestamp: Date.now(),
    status: 'pending',
  };
}

// Create coinbase transaction
export async function createCoinbaseTransaction(
  minerAddress: string,
  reward: number,
  totalFees: number
): Promise<Transaction> {
  const id = await sha256(`coinbase${minerAddress}${reward}${totalFees}${Date.now()}`);
  return {
    id: 'CB' + id.slice(0, 14).toUpperCase(),
    from: 'NETWORK',
    to: minerAddress,
    amount: reward + totalFees,
    fee: 0,
    timestamp: Date.now(),
    isCoinbase: true,
    status: 'confirmed',
  };
}

// Sign transaction (simulated)
export async function signTransaction(tx: Transaction, privateKey: string): Promise<Transaction> {
  const signature = await sha256(`${tx.id}${privateKey}`);
  return { ...tx, signature: signature.slice(0, 32) };
}

// Blockchain state manager class
export class BlockchainState {
  private blockchain: Block[] = [];
  private mempool: Transaction[] = [];
  private wallets: Wallet[] = [];
  private miningActive: boolean = false;
  private miningStats: MiningStats = {
    isActive: false,
    currentNonce: 0,
    hashAttempts: 0,
    hashRate: 0,
    elapsedTime: 0,
    currentBlock: null,
  };
  private onUpdate: (() => void) | null = null;

  constructor() {
    this.loadState();
  }

  setUpdateCallback(callback: () => void) {
    this.onUpdate = callback;
  }

  private triggerUpdate() {
    if (this.onUpdate) {
      this.onUpdate();
    }
  }

  private loadState() {
    try {
      const storedChain = localStorage.getItem('vags_blockchain');
      const storedMempool = localStorage.getItem('vags_mempool');
      const storedWallets = localStorage.getItem('vags_wallets');
      
      if (storedChain) this.blockchain = JSON.parse(storedChain);
      if (storedMempool) this.mempool = JSON.parse(storedMempool);
      if (storedWallets) this.wallets = JSON.parse(storedWallets);
    } catch (e) {
      console.error('Failed to load blockchain state:', e);
    }
  }

  private saveState() {
    try {
      localStorage.setItem('vags_blockchain', JSON.stringify(this.blockchain));
      localStorage.setItem('vags_mempool', JSON.stringify(this.mempool));
      localStorage.setItem('vags_wallets', JSON.stringify(this.wallets));
    } catch (e) {
      console.error('Failed to save blockchain state:', e);
    }
  }

  async initialize(): Promise<void> {
    if (this.blockchain.length === 0) {
      const genesis = await createGenesisBlock();
      this.blockchain.push(genesis);
      this.saveState();
    }
  }

  // Wallet operations
  async createWallet(label: string): Promise<Wallet> {
    const { address, privateKey, publicKey } = await generateWalletAddress();
    const wallet: Wallet = {
      id: generateRandomHex(16),
      address,
      privateKey,
      publicKey,
      label,
      balance: 0,
      createdAt: Date.now(),
    };
    this.wallets.push(wallet);
    this.saveState();
    this.triggerUpdate();
    return wallet;
  }

  getWallets(): Wallet[] {
    return [...this.wallets];
  }

  getWallet(address: string): Wallet | undefined {
    return this.wallets.find(w => w.address === address);
  }

  removeWallet(address: string): void {
    this.wallets = this.wallets.filter(w => w.address !== address);
    this.saveState();
    this.triggerUpdate();
  }

  importWallet(privateKey: string, label: string): Wallet | null {
    // Simple import - in production would derive address from private key
    const existingWallet = this.wallets.find(w => w.privateKey === privateKey);
    if (existingWallet) return existingWallet;
    
    const wallet: Wallet = {
      id: generateRandomHex(16),
      address: 'GSC' + privateKey.slice(0, 40).toUpperCase(),
      privateKey,
      publicKey: privateKey, // Simplified
      label,
      balance: 0,
      createdAt: Date.now(),
    };
    this.wallets.push(wallet);
    this.saveState();
    this.triggerUpdate();
    return wallet;
  }

  updateWalletBalance(address: string, amount: number): void {
    const wallet = this.wallets.find(w => w.address === address);
    if (wallet) {
      wallet.balance += amount;
      this.saveState();
      this.triggerUpdate();
    }
  }

  // Transaction operations
  async addTransaction(tx: Transaction): Promise<boolean> {
    const sender = this.getWallet(tx.from);
    const senderBalance = sender ? sender.balance : 0;
    
    if (!validateTransaction(tx, senderBalance)) {
      return false;
    }
    
    this.mempool.push(tx);
    this.saveState();
    this.triggerUpdate();
    return true;
  }

  getMempool(): Transaction[] {
    return [...this.mempool];
  }

  getMempoolFees(): number {
    return this.mempool.reduce((sum, tx) => sum + tx.fee, 0);
  }

  // Blockchain operations
  getBlockchain(): Block[] {
    return [...this.blockchain];
  }

  getLatestBlock(): Block {
    return this.blockchain[this.blockchain.length - 1];
  }

  getBlock(index: number): Block | undefined {
    return this.blockchain[index];
  }

  getBlockByHash(hash: string): Block | undefined {
    return this.blockchain.find(b => b.hash === hash);
  }

  getTransaction(txId: string): Transaction | undefined {
    // Check mempool
    const mempoolTx = this.mempool.find(tx => tx.id === txId);
    if (mempoolTx) return mempoolTx;
    
    // Check blockchain
    for (const block of this.blockchain) {
      const tx = block.transactions.find(t => t.id === txId);
      if (tx) return tx;
    }
    return undefined;
  }

  getTransactionsByAddress(address: string): Transaction[] {
    const transactions: Transaction[] = [];
    
    // Check mempool
    this.mempool.forEach(tx => {
      if (tx.from === address || tx.to === address) {
        transactions.push(tx);
      }
    });
    
    // Check blockchain
    this.blockchain.forEach(block => {
      block.transactions.forEach(tx => {
        if (tx.from === address || tx.to === address) {
          transactions.push({ ...tx, blockNumber: block.index });
        }
      });
    });
    
    return transactions;
  }

  async validateChain(): Promise<boolean> {
    for (let i = 1; i < this.blockchain.length; i++) {
      const isValid = await validateBlock(this.blockchain[i], this.blockchain[i - 1]);
      if (!isValid) return false;
    }
    return true;
  }

  // Mining operations
  getMiningStats(): MiningStats {
    return { ...this.miningStats };
  }

  isMiningActive(): boolean {
    return this.miningActive;
  }

  stopMining(): void {
    this.miningActive = false;
    this.miningStats.isActive = false;
    this.triggerUpdate();
  }

  async startMining(
    minerAddress: string,
    onProgress: (stats: MiningStats) => void,
    onBlockMined: (block: Block) => void
  ): Promise<void> {
    if (this.miningActive) return;
    
    this.miningActive = true;
    this.miningStats.isActive = true;
    
    const startTime = Date.now();
    const previousBlock = this.getLatestBlock();
    const blockReward = calculateMiningReward(previousBlock.index + 1);
    
    // Select transactions from mempool (sorted by fee, descending)
    const selectedTxs = [...this.mempool]
      .sort((a, b) => b.fee - a.fee)
      .slice(0, MAX_TRANSACTIONS_PER_BLOCK);
    
    const totalFees = selectedTxs.reduce((sum, tx) => sum + tx.fee, 0);
    
    // Create coinbase transaction
    const coinbaseTx = await createCoinbaseTransaction(minerAddress, blockReward, totalFees);
    
    // Build candidate block
    const candidateBlock: Omit<Block, 'hash'> = {
      index: previousBlock.index + 1,
      timestamp: Date.now(),
      transactions: [coinbaseTx, ...selectedTxs],
      previousHash: previousBlock.hash,
      nonce: 0,
      difficulty: DIFFICULTY,
      miner: minerAddress,
      reward: blockReward + totalFees,
    };

    let nonce = 0;
    let hash = '';
    let hashAttempts = 0;
    
    // Mining loop with UI updates
    const mineStep = async () => {
      if (!this.miningActive) return;
      
      const batchSize = 1000;
      const batchStart = Date.now();
      
      for (let i = 0; i < batchSize && this.miningActive; i++) {
        candidateBlock.nonce = nonce;
        hash = await calculateBlockHash(candidateBlock);
        hashAttempts++;
        nonce++;
        
        if (hash.startsWith(DIFFICULTY_TARGET)) {
          // Block found!
          const minedBlock: Block = { ...candidateBlock, hash };
          
          // Validate and add to chain
          const isValid = await validateBlock(minedBlock, previousBlock);
          if (isValid) {
            this.blockchain.push(minedBlock);
            
            // Update transaction statuses
            selectedTxs.forEach(tx => {
              tx.status = 'confirmed';
              tx.blockNumber = minedBlock.index;
            });
            
            // Remove mined transactions from mempool
            const txIds = selectedTxs.map(tx => tx.id);
            this.mempool = this.mempool.filter(tx => !txIds.includes(tx.id));
            
            // Update miner wallet balance
            this.updateWalletBalance(minerAddress, blockReward + totalFees);
            
            // Update sender balances for confirmed transactions
            selectedTxs.forEach(tx => {
              if (!tx.isCoinbase) {
                this.updateWalletBalance(tx.from, -(tx.amount + tx.fee));
                this.updateWalletBalance(tx.to, tx.amount);
              }
            });
            
            this.saveState();
            this.miningActive = false;
            this.miningStats.isActive = false;
            
            onBlockMined(minedBlock);
            this.triggerUpdate();
            return;
          }
        }
      }
      
      // Update stats
      const elapsed = Date.now() - startTime;
      const batchTime = Date.now() - batchStart;
      const hashRate = batchTime > 0 ? Math.round((batchSize / batchTime) * 1000) : 0;
      
      this.miningStats = {
        isActive: this.miningActive,
        currentNonce: nonce,
        hashAttempts,
        hashRate,
        elapsedTime: elapsed,
        currentBlock: { ...candidateBlock, hash } as Block,
      };
      
      onProgress(this.miningStats);
      
      if (this.miningActive) {
        requestAnimationFrame(mineStep);
      }
    };
    
    mineStep();
  }

  // Stats
  getTotalBlocks(): number {
    return this.blockchain.length;
  }

  getTotalSupply(): number {
    let supply = 0;
    this.blockchain.forEach(block => {
      supply += block.reward;
    });
    return supply;
  }

  getGenesisBlock(): Block | undefined {
    return this.blockchain[0];
  }
}

// Singleton instance
export const blockchainState = new BlockchainState();
