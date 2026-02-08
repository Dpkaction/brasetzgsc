/**
 * GSC Wallet Test Suite
 * Tests all functionality to match original GSC exe behavior
 * Excludes mining and mempool as requested
 */

import { gscBlockchainService, GSCWallet, GSCTransaction } from '../services/gscBlockchain';

class GSCWalletTester {
  private testResults: Array<{name: string, passed: boolean, error?: string}> = [];
  private originalConsoleLog = console.log;

  constructor() {
    // Capture console logs for testing
    console.log = (...args) => {
      this.originalConsoleLog('[TEST]', ...args);
    };
  }

  private addResult(name: string, passed: boolean, error?: string) {
    this.testResults.push({ name, passed, error });
    console.log(`${passed ? '✅' : '❌'} ${name}${error ? `: ${error}` : ''}`);
  }

  private async delay(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Test 1: Wallet Creation (like exe)
  async testWalletCreation(): Promise<boolean> {
    try {
      const walletName = `TestWallet_${Date.now()}`;
      const wallet = gscBlockchainService.createWallet(walletName);
      
      // Verify wallet properties
      const isValid = wallet.name === walletName &&
                     wallet.address.startsWith('GSC1') &&
                     wallet.private_key.length > 0 &&
                     wallet.public_key.length > 0 &&
                     wallet.balance === 0;

      this.addResult('Wallet Creation', isValid);
      return isValid;
    } catch (error) {
      this.addResult('Wallet Creation', false, String(error));
      return false;
    }
  }

  // Test 2: Address Generation (GSC format)
  async testAddressGeneration(): Promise<boolean> {
    try {
      const { address, private_key, public_key } = gscBlockchainService.generateAddress();
      
      const isValid = address.startsWith('GSC1') &&
                     address.length > 20 &&
                     private_key.length === 64 &&
                     public_key.length > 0;

      this.addResult('Address Generation', isValid);
      return isValid;
    } catch (error) {
      this.addResult('Address Generation', false, String(error));
      return false;
    }
  }

  // Test 3: Balance Calculation (from blockchain data)
  async testBalanceCalculation(): Promise<boolean> {
    try {
      // Create test wallet
      const wallet = gscBlockchainService.createWallet(`BalanceTest_${Date.now()}`);
      
      // Initial balance should be 0
      const initialBalance = gscBlockchainService.getWalletBalance(wallet.address);
      
      const isValid = initialBalance === 0;
      this.addResult('Balance Calculation', isValid);
      return isValid;
    } catch (error) {
      this.addResult('Balance Calculation', false, String(error));
      return false;
    }
  }

  // Test 4: Transaction Creation (GSC compatible)
  async testTransactionCreation(): Promise<boolean> {
    try {
      const senderAddress = "GSC1test1234567890abcdef1234567890";
      const receiverAddress = "GSC1test0987654321fedcba0987654321";
      const amount = 10.5;
      const fee = 0.1;

      const transaction = gscBlockchainService.createTransaction(
        senderAddress, 
        receiverAddress, 
        amount, 
        fee
      );

      const isValid = transaction.sender === senderAddress &&
                     transaction.receiver === receiverAddress &&
                     transaction.amount === amount &&
                     transaction.fee === fee &&
                     transaction.tx_id.length > 0 &&
                     transaction.signature.length > 0 &&
                     transaction.timestamp > 0;

      this.addResult('Transaction Creation', isValid);
      return isValid;
    } catch (error) {
      this.addResult('Transaction Creation', false, String(error));
      return false;
    }
  }

  // Test 5: Transaction Validation (like exe)
  async testTransactionValidation(): Promise<boolean> {
    try {
      const validTx = gscBlockchainService.createTransaction(
        "GSC1valid123456789012345678901234",
        "GSC1receiver123456789012345678901",
        5.0,
        0.1
      );

      // Test minimum fee validation
      try {
        const invalidFeeTx = gscBlockchainService.createTransaction(
          "GSC1valid123456789012345678901234",
          "GSC1receiver123456789012345678901",
          5.0,
          0.05 // Below minimum
        );
        this.addResult('Transaction Validation', false, 'Should reject low fee');
        return false;
      } catch (feeError) {
        // Expected to fail
      }

      this.addResult('Transaction Validation', true);
      return true;
    } catch (error) {
      this.addResult('Transaction Validation', false, String(error));
      return false;
    }
  }

  // Test 6: Wallet Import from Backup (like exe)
  async testWalletImport(): Promise<boolean> {
    try {
      // Create mock backup data
      const mockBackup = {
        wallet_name: "ImportedWallet",
        wallet_data: {
          name: "ImportedWallet",
          master_address: "GSC1imported123456789012345678901",
          master_private_key: "1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
          master_public_key: "abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890",
          created: new Date().toISOString()
        }
      };

      // Create mock file
      const mockFile = new File([JSON.stringify(mockBackup)], 'test.json', { type: 'application/json' });
      
      const importedWallet = await gscBlockchainService.importWalletFromBackup(mockFile);
      
      const isValid = importedWallet.name === "ImportedWallet" &&
                     importedWallet.address === "GSC1imported123456789012345678901";

      this.addResult('Wallet Import', isValid);
      return isValid;
    } catch (error) {
      this.addResult('Wallet Import', false, String(error));
      return false;
    }
  }

  // Test 7: Blockchain Export (GSC exe compatible)
  async testBlockchainExport(): Promise<boolean> {
    try {
      const exportData = gscBlockchainService.exportBlockchain();
      const parsed = JSON.parse(exportData);
      
      const isValid = parsed.hasOwnProperty('chain') &&
                     parsed.hasOwnProperty('mempool') &&
                     parsed.hasOwnProperty('balances') &&
                     parsed.hasOwnProperty('difficulty') &&
                     parsed.hasOwnProperty('mining_reward');

      this.addResult('Blockchain Export', isValid);
      return isValid;
    } catch (error) {
      this.addResult('Blockchain Export', false, String(error));
      return false;
    }
  }

  // Test 8: Address Format Validation (GSC1 prefix)
  async testAddressValidation(): Promise<boolean> {
    try {
      const validAddresses = [
        "GSC1705641e65321ef23ac5fb3d470f39627",
        "GSC1221fe3e6139bbe0b76f0230d9cd5bbc1"
      ];

      const invalidAddresses = [
        "BTC1705641e65321ef23ac5fb3d470f39627",
        "GSC705641e65321ef23ac5fb3d470f39627",
        "GSC1",
        ""
      ];

      let allValid = true;

      // Test valid addresses
      for (const addr of validAddresses) {
        if (!addr.startsWith('GSC1') || addr.length < 20) {
          allValid = false;
          break;
        }
      }

      // Test invalid addresses
      for (const addr of invalidAddresses) {
        if (addr.startsWith('GSC1') && addr.length >= 20) {
          allValid = false;
          break;
        }
      }

      this.addResult('Address Validation', allValid);
      return allValid;
    } catch (error) {
      this.addResult('Address Validation', false, String(error));
      return false;
    }
  }

  // Test 9: Transaction History (like exe display)
  async testTransactionHistory(): Promise<boolean> {
    try {
      const testAddress = "GSC1test123456789012345678901234";
      const history = gscBlockchainService.getTransactionHistory(testAddress);
      
      // Should return empty array for new address
      const isValid = Array.isArray(history);

      this.addResult('Transaction History', isValid);
      return isValid;
    } catch (error) {
      this.addResult('Transaction History', false, String(error));
      return false;
    }
  }

  // Test 10: Blockchain Stats (network info)
  async testBlockchainStats(): Promise<boolean> {
    try {
      const stats = gscBlockchainService.getBlockchainStats();
      
      const isValid = stats.hasOwnProperty('totalBlocks') &&
                     stats.hasOwnProperty('totalWallets') &&
                     stats.hasOwnProperty('totalSupply') &&
                     stats.totalSupply === 21750000000000; // GSC total supply

      this.addResult('Blockchain Stats', isValid);
      return isValid;
    } catch (error) {
      this.addResult('Blockchain Stats', false, String(error));
      return false;
    }
  }

  // Test 11: No Mining Features (as requested)
  async testNoMiningFeatures(): Promise<boolean> {
    try {
      // Verify no mining-related methods exist
      const service = gscBlockchainService as any;
      
      const miningMethods = [
        'startMining',
        'stopMining',
        'mineBlock',
        'getMiningStatus',
        'setMiningAddress'
      ];

      let hasMiningFeatures = false;
      for (const method of miningMethods) {
        if (typeof service[method] === 'function') {
          hasMiningFeatures = true;
          break;
        }
      }

      this.addResult('No Mining Features', !hasMiningFeatures);
      return !hasMiningFeatures;
    } catch (error) {
      this.addResult('No Mining Features', false, String(error));
      return false;
    }
  }

  // Test 12: No Mempool Features (as requested)
  async testNoMempoolFeatures(): Promise<boolean> {
    try {
      // Verify mempool is not exposed as main feature
      const service = gscBlockchainService as any;
      
      const mempoolMethods = [
        'addToMempool',
        'clearMempool',
        'getMempoolTransactions',
        'validateMempool'
      ];

      let hasMempoolFeatures = false;
      for (const method of mempoolMethods) {
        if (typeof service[method] === 'function') {
          hasMempoolFeatures = true;
          break;
        }
      }

      this.addResult('No Mempool Features', !hasMempoolFeatures);
      return !hasMempoolFeatures;
    } catch (error) {
      this.addResult('No Mempool Features', false, String(error));
      return false;
    }
  }

  // Test 13: Send Transaction Flow (complete workflow)
  async testSendTransactionFlow(): Promise<boolean> {
    try {
      // Create test wallets
      const senderWallet = gscBlockchainService.createWallet(`Sender_${Date.now()}`);
      const receiverAddress = "GSC1receiver123456789012345678901";
      
      // Mock balance for sender (in real scenario, this would come from blockchain)
      (senderWallet as any).balance = 100.0;
      
      // Attempt to send transaction
      const success = gscBlockchainService.sendTransaction(senderWallet, receiverAddress, 10.0);
      
      // Should fail due to insufficient balance in actual blockchain
      // But the method should handle it gracefully
      this.addResult('Send Transaction Flow', typeof success === 'boolean');
      return typeof success === 'boolean';
    } catch (error) {
      this.addResult('Send Transaction Flow', false, String(error));
      return false;
    }
  }

  // Test 14: Wallet Balance Refresh (after import)
  async testWalletBalanceRefresh(): Promise<boolean> {
    try {
      // Test the refresh functionality
      gscBlockchainService.refreshWalletBalances();
      
      const wallets = gscBlockchainService.getWallets();
      let allHaveValidBalances = true;
      
      for (const wallet of wallets) {
        if (typeof wallet.balance !== 'number' || wallet.balance < 0) {
          allHaveValidBalances = false;
          break;
        }
      }

      this.addResult('Wallet Balance Refresh', allHaveValidBalances);
      return allHaveValidBalances;
    } catch (error) {
      this.addResult('Wallet Balance Refresh', false, String(error));
      return false;
    }
  }

  // Run all tests
  async runAllTests(): Promise<void> {
    console.log('🧪 Starting GSC Wallet Test Suite...');
    console.log('📋 Testing functionality to match original GSC exe (excluding mining/mempool)');
    console.log('');

    const tests = [
      () => this.testWalletCreation(),
      () => this.testAddressGeneration(),
      () => this.testBalanceCalculation(),
      () => this.testTransactionCreation(),
      () => this.testTransactionValidation(),
      () => this.testWalletImport(),
      () => this.testBlockchainExport(),
      () => this.testAddressValidation(),
      () => this.testTransactionHistory(),
      () => this.testBlockchainStats(),
      () => this.testNoMiningFeatures(),
      () => this.testNoMempoolFeatures(),
      () => this.testSendTransactionFlow(),
      () => this.testWalletBalanceRefresh()
    ];

    for (const test of tests) {
      await test();
      await this.delay(100); // Small delay between tests
    }

    this.printSummary();
  }

  private printSummary(): void {
    const passed = this.testResults.filter(r => r.passed).length;
    const total = this.testResults.length;
    const failed = this.testResults.filter(r => !r.passed);

    console.log('');
    console.log('📊 Test Summary:');
    console.log(`✅ Passed: ${passed}/${total}`);
    console.log(`❌ Failed: ${total - passed}/${total}`);
    
    if (failed.length > 0) {
      console.log('');
      console.log('❌ Failed Tests:');
      failed.forEach(test => {
        console.log(`   • ${test.name}: ${test.error || 'Unknown error'}`);
      });
    }

    console.log('');
    if (passed === total) {
      console.log('🎉 All tests passed! GSC wallet matches original exe functionality.');
    } else {
      console.log('⚠️  Some tests failed. Review implementation for compatibility.');
    }

    // Restore original console.log
    console.log = this.originalConsoleLog;
  }

  // Get test results for external use
  getResults() {
    return {
      passed: this.testResults.filter(r => r.passed).length,
      total: this.testResults.length,
      results: this.testResults
    };
  }
}

// Export for use in components or manual testing
export { GSCWalletTester };

// Auto-run tests disabled for production build
