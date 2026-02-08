import { supabase } from '@/lib/supabase';
import { toast } from '@/hooks/use-toast';

export class SupabaseBlockchainService {
  private isOnline = true;

  constructor() {
    this.checkConnection();
    this.setupAutoUpdateListener();
  }

  // Setup listener for automatic blockchain updates
  private setupAutoUpdateListener() {
    try {
      // Listen for admin blockchain updates
      window.addEventListener('adminBlockchainUpdate', (event: any) => {
        const blockchainData = event.detail;
        if (blockchainData) {
          console.log('🔄 Auto-updating blockchain from admin upload...');
          
          // Update local storage immediately
          localStorage.setItem('gsc_blockchain_data', JSON.stringify(blockchainData));
          
          toast({
            title: "Blockchain Auto-Updated",
            description: "Admin uploaded new blockchain data. Your data has been updated automatically.",
          });

          // Reload page to refresh blockchain service
          setTimeout(() => {
            window.location.reload();
          }, 2000);
        }
      });

      console.log('✅ Auto-update listener setup complete');
    } catch (error) {
      console.warn('Failed to setup auto-update listener:', error);
    }
  }

  private async checkConnection() {
    try {
      const { data, error } = await supabase.from('gsc_blockchain').select('id').limit(1);
      this.isOnline = !error;
      if (error) {
        console.warn('Supabase connection failed:', error.message);
      }
    } catch (error) {
      this.isOnline = false;
      console.warn('Supabase offline:', error);
    }
  }

  // Upload blockchain to server (for admin use) - replaces all previous data
  async uploadBlockchain(blockchainData: any): Promise<boolean> {
    if (!this.isOnline) {
      console.warn('Cannot upload blockchain: offline');
      return false;
    }

    try {
      // First, delete ALL existing blockchain records to keep only the latest
      const { error: deleteError } = await supabase
        .from('gsc_blockchain')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all records

      if (deleteError) {
        console.warn('Warning: Could not delete old blockchain records:', deleteError);
        // Continue anyway - we still want to insert the new data
      }

      // Insert the new blockchain data as version 1 (always latest)
      const { error } = await supabase
        .from('gsc_blockchain')
        .insert({
          version: 1, // Always version 1 since we delete old ones
          chain_data: blockchainData.chain || [],
          balances: blockchainData.balances || {},
          mempool: blockchainData.mempool || blockchainData.pending_transactions || [],
          difficulty: blockchainData.difficulty || 4,
          mining_reward: blockchainData.mining_reward || 50,
          total_supply: blockchainData.total_supply || 21750000000000
        });

      if (error) {
        console.error('Failed to upload blockchain:', error);
        return false;
      }

      console.log('✅ Blockchain uploaded to server successfully (old data cleared)');
      toast({
        title: "Blockchain Uploaded",
        description: "Latest blockchain data uploaded. All users will get this version.",
      });

      // Trigger real-time update for all connected users
      this.broadcastBlockchainUpdate(blockchainData);

      return true;
    } catch (error) {
      console.error('Failed to upload blockchain:', error);
      return false;
    }
  }

  // Broadcast blockchain update to all connected users
  private broadcastBlockchainUpdate(blockchainData: any) {
    try {
      // Trigger a custom event that all users can listen to
      window.dispatchEvent(new CustomEvent('adminBlockchainUpdate', { 
        detail: blockchainData 
      }));
      
      console.log('📡 Blockchain update broadcasted to all users');
    } catch (error) {
      console.error('Failed to broadcast blockchain update:', error);
    }
  }

  // Download latest blockchain from server (for user import) - always gets the single latest record
  async downloadBlockchain(): Promise<any | null> {
    if (!this.isOnline) {
      console.warn('Cannot download blockchain: offline');
      return null;
    }

    try {
      // Since we only keep one record (latest), just get the first one
      const { data, error } = await supabase
        .from('gsc_blockchain')
        .select('*')
        .order('last_updated', { ascending: false })
        .limit(1);

      if (error) {
        console.error('Failed to download blockchain:', error);
        return null;
      }

      if (!data || data.length === 0) {
        console.log('No blockchain data found on server');
        return null;
      }

      const latestData = data[0];
      const blockchainData = {
        chain: latestData.chain_data || [],
        balances: latestData.balances || {},
        mempool: latestData.mempool || [],
        pending_transactions: latestData.mempool || [],
        difficulty: latestData.difficulty || 4,
        mining_reward: latestData.mining_reward || 50,
        total_supply: latestData.total_supply || 21750000000000
      };

      console.log('✅ Latest blockchain downloaded from server successfully');
      return blockchainData;
    } catch (error) {
      console.error('Failed to download blockchain:', error);
      return null;
    }
  }

  // Import blockchain from server to local storage
  async importFromServer(): Promise<boolean> {
    try {
      // Check connection first
      if (!this.isOnline) {
        throw new Error("No connection to Supabase server");
      }

      const serverData = await this.downloadBlockchain();
      if (serverData) {
        localStorage.setItem('gsc_blockchain_data', JSON.stringify(serverData));
        
        toast({
          title: "Blockchain Imported",
          description: "Latest blockchain data imported successfully",
        });

        // Reload the page to refresh the blockchain service
        setTimeout(() => {
          window.location.reload();
        }, 1000);
        return true;
      } else {
        throw new Error("No blockchain data found on server");
      }
    } catch (error) {
      console.error('Failed to import from server:', error);
      
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
      
      toast({
        title: "Import Failed",
        description: `Failed to import blockchain: ${errorMessage}. Click here to go home.`,
        variant: "destructive",
      });
      
      // Show additional error handling option
      setTimeout(() => {
        if (confirm("Would you like to go back to the home page?")) {
          window.location.href = '/';
        }
      }, 2000);
      return false;
    }
  }

  // Check if service is online
  isServiceOnline(): boolean {
    return this.isOnline;
  }
}

// Create singleton instance
export const supabaseBlockchainService = new SupabaseBlockchainService();
