import { useState, useEffect, useCallback } from 'react';
import {
  blockchainState,
  Block,
  Transaction,
  Wallet,
  MiningStats,
  createTransaction,
  signTransaction,
  generateMnemonic,
} from '@/lib/blockchain';

export function useBlockchain() {
  const [blockchain, setBlockchain] = useState<Block[]>([]);
  const [mempool, setMempool] = useState<Transaction[]>([]);
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [miningStats, setMiningStats] = useState<MiningStats | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [chainValid, setChainValid] = useState(true);

  // Refresh state from blockchain
  const refreshState = useCallback(() => {
    setBlockchain(blockchainState.getBlockchain());
    setMempool(blockchainState.getMempool());
    setWallets(blockchainState.getWallets());
    setMiningStats(blockchainState.getMiningStats());
  }, []);

  // Initialize blockchain
  useEffect(() => {
    const init = async () => {
      await blockchainState.initialize();
      blockchainState.setUpdateCallback(refreshState);
      refreshState();
      setIsInitialized(true);
      
      // Validate chain
      const valid = await blockchainState.validateChain();
      setChainValid(valid);
    };
    init();
  }, [refreshState]);

  // Wallet operations
  const createWallet = useCallback(async (label: string) => {
    const wallet = await blockchainState.createWallet(label);
    const mnemonic = generateMnemonic();
    return { wallet, mnemonic };
  }, []);

  const importWallet = useCallback((privateKey: string, label: string) => {
    return blockchainState.importWallet(privateKey, label);
  }, []);

  const removeWallet = useCallback((address: string) => {
    blockchainState.removeWallet(address);
  }, []);

  const getWalletBalance = useCallback((address: string) => {
    const wallet = blockchainState.getWallet(address);
    return wallet?.balance ?? 0;
  }, []);

  // Transaction operations
  const sendTransaction = useCallback(async (
    fromAddress: string,
    toAddress: string,
    amount: number,
    fee: number
  ): Promise<{ success: boolean; transaction?: Transaction; error?: string }> => {
    // Validate addresses
    if (!fromAddress || !toAddress) {
      return { success: false, error: 'Invalid addresses' };
    }

    // Check balance
    const senderWallet = blockchainState.getWallet(fromAddress);
    if (!senderWallet) {
      return { success: false, error: 'Sender wallet not found' };
    }

    if (senderWallet.balance < amount + fee) {
      return { success: false, error: 'Insufficient balance' };
    }

    // Create and sign transaction
    const tx = await createTransaction(fromAddress, toAddress, amount, fee);
    const signedTx = await signTransaction(tx, senderWallet.privateKey);
    
    // Add to mempool
    const added = await blockchainState.addTransaction(signedTx);
    if (!added) {
      return { success: false, error: 'Failed to add transaction to mempool' };
    }

    return { success: true, transaction: signedTx };
  }, []);

  // Mining operations
  const startMining = useCallback((
    minerAddress: string,
    onBlockMined?: (block: Block) => void
  ) => {
    blockchainState.startMining(
      minerAddress,
      (stats) => setMiningStats(stats),
      (block) => {
        refreshState();
        if (onBlockMined) onBlockMined(block);
      }
    );
  }, [refreshState]);

  const stopMining = useCallback(() => {
    blockchainState.stopMining();
    setMiningStats(blockchainState.getMiningStats());
  }, []);

  // Explorer operations
  const getTransaction = useCallback((txId: string) => {
    return blockchainState.getTransaction(txId);
  }, []);

  const getTransactionsByAddress = useCallback((address: string) => {
    return blockchainState.getTransactionsByAddress(address);
  }, []);

  const getBlock = useCallback((index: number) => {
    return blockchainState.getBlock(index);
  }, []);

  const getBlockByHash = useCallback((hash: string) => {
    return blockchainState.getBlockByHash(hash);
  }, []);

  // Stats
  const getTotalSupply = useCallback(() => {
    return blockchainState.getTotalSupply();
  }, []);

  return {
    // State
    blockchain,
    mempool,
    wallets,
    miningStats,
    isInitialized,
    chainValid,
    
    // Wallet operations
    createWallet,
    importWallet,
    removeWallet,
    getWalletBalance,
    
    // Transaction operations
    sendTransaction,
    
    // Mining operations
    startMining,
    stopMining,
    isMining: miningStats?.isActive ?? false,
    
    // Explorer operations
    getTransaction,
    getTransactionsByAddress,
    getBlock,
    getBlockByHash,
    
    // Stats
    getTotalSupply,
    
    // Utilities
    refreshState,
  };
}
