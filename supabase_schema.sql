-- GSC Blockchain Database Schema for Supabase
-- Run this SQL in your Supabase SQL Editor

-- Enable Row Level Security
ALTER DATABASE postgres SET "app.jwt_secret" TO 'your-jwt-secret';

-- Create gsc_blockchain table for storing the main blockchain state
CREATE TABLE IF NOT EXISTS gsc_blockchain (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  version INTEGER NOT NULL DEFAULT 1,
  chain_data JSONB NOT NULL DEFAULT '[]',
  balances JSONB NOT NULL DEFAULT '{}',
  mempool JSONB NOT NULL DEFAULT '[]',
  difficulty INTEGER NOT NULL DEFAULT 4,
  mining_reward DECIMAL(20,8) NOT NULL DEFAULT 50.0,
  total_supply DECIMAL(20,8) NOT NULL DEFAULT 21750000000000,
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create gsc_transactions table for individual transaction records
CREATE TABLE IF NOT EXISTS gsc_transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tx_id VARCHAR(64) NOT NULL UNIQUE,
  sender VARCHAR(255) NOT NULL,
  receiver VARCHAR(255) NOT NULL,
  amount DECIMAL(20,8) NOT NULL,
  fee DECIMAL(20,8) NOT NULL DEFAULT 0.1,
  timestamp BIGINT NOT NULL,
  signature VARCHAR(255) NOT NULL,
  block_index INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create gsc_wallets table for wallet information
CREATE TABLE IF NOT EXISTS gsc_wallets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  address VARCHAR(255) NOT NULL UNIQUE,
  name VARCHAR(255),
  balance DECIMAL(20,8) NOT NULL DEFAULT 0,
  public_key TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_gsc_blockchain_version ON gsc_blockchain(version DESC);
CREATE INDEX IF NOT EXISTS idx_gsc_blockchain_updated ON gsc_blockchain(last_updated DESC);
CREATE INDEX IF NOT EXISTS idx_gsc_transactions_tx_id ON gsc_transactions(tx_id);
CREATE INDEX IF NOT EXISTS idx_gsc_transactions_sender ON gsc_transactions(sender);
CREATE INDEX IF NOT EXISTS idx_gsc_transactions_receiver ON gsc_transactions(receiver);
CREATE INDEX IF NOT EXISTS idx_gsc_transactions_timestamp ON gsc_transactions(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_gsc_wallets_address ON gsc_wallets(address);

-- Enable Row Level Security (RLS)
ALTER TABLE gsc_blockchain ENABLE ROW LEVEL SECURITY;
ALTER TABLE gsc_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE gsc_wallets ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access (since this is a public blockchain)
CREATE POLICY "Enable read access for all users" ON gsc_blockchain FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON gsc_transactions FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON gsc_wallets FOR SELECT USING (true);

-- Create policies for insert/update (you may want to restrict this to admin users)
CREATE POLICY "Enable insert for all users" ON gsc_blockchain FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for all users" ON gsc_blockchain FOR UPDATE USING (true);
CREATE POLICY "Enable insert for all users" ON gsc_transactions FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable insert for all users" ON gsc_wallets FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for all users" ON gsc_wallets FOR UPDATE USING (true);

-- Create a function to automatically update the last_updated timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.last_updated = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers to automatically update timestamps
CREATE TRIGGER update_gsc_blockchain_updated_at 
    BEFORE UPDATE ON gsc_blockchain 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_gsc_wallets_updated_at 
    BEFORE UPDATE ON gsc_wallets 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Insert initial blockchain state if not exists
INSERT INTO gsc_blockchain (version, chain_data, balances, mempool, difficulty, mining_reward, total_supply)
SELECT 1, '[]'::jsonb, '{}'::jsonb, '[]'::jsonb, 4, 50.0, 21750000000000
WHERE NOT EXISTS (SELECT 1 FROM gsc_blockchain);

-- Create a view for the latest blockchain state
CREATE OR REPLACE VIEW latest_blockchain AS
SELECT * FROM gsc_blockchain 
ORDER BY version DESC, last_updated DESC 
LIMIT 1;

-- Enable realtime for the tables (for live updates)
ALTER PUBLICATION supabase_realtime ADD TABLE gsc_blockchain;
ALTER PUBLICATION supabase_realtime ADD TABLE gsc_transactions;
ALTER PUBLICATION supabase_realtime ADD TABLE gsc_wallets;
