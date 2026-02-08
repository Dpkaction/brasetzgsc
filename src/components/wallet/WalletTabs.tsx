import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  LayoutDashboard, 
  Send, 
  Download, 
  Pickaxe, 
  Clock, 
  BarChart3, 
  Link2, 
  Search,
  Globe
} from "lucide-react";
import OverviewTab from "./tabs/OverviewTab";
import SendTab from "./tabs/SendTab";
import ReceiveTab from "./tabs/ReceiveTab";
import MiningTab from "./tabs/MiningTab";
import MempoolTab from "./tabs/MempoolTab";
import BlockchainStatsTab from "./tabs/BlockchainStatsTab";
import BlockchainTab from "./tabs/BlockchainTab";
import TransactionExplorerTab from "./tabs/TransactionExplorerTab";
import BlockchainExplorerTab from "./tabs/BlockchainExplorerTab";

interface WalletTabsProps {
  activeWallet: string | null;
}

const WalletTabs = ({ activeWallet }: WalletTabsProps) => {
  const [activeTab, setActiveTab] = useState("overview");

  const tabs = [
    { id: "overview", label: "Overview", icon: LayoutDashboard },
    { id: "send", label: "Send", icon: Send },
    { id: "receive", label: "Receive", icon: Download },
    { id: "mining", label: "Mining", icon: Pickaxe },
    { id: "mempool", label: "Mempool", icon: Clock },
    { id: "stats", label: "Statistics", icon: BarChart3 },
    { id: "blockchain", label: "Blockchain", icon: Link2 },
    { id: "tx-explorer", label: "TX Explorer", icon: Search },
    { id: "bc-explorer", label: "BC Explorer", icon: Globe },
  ];

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="w-full flex flex-wrap justify-start gap-1 h-auto p-2 bg-card/50 border border-border rounded-lg mb-6">
        {tabs.map((tab) => (
          <TabsTrigger
            key={tab.id}
            value={tab.id}
            className="flex items-center gap-2 px-3 py-2 text-xs sm:text-sm data-[state=active]:bg-gold/20 data-[state=active]:text-gold"
          >
            <tab.icon className="w-4 h-4" />
            <span className="hidden sm:inline">{tab.label}</span>
          </TabsTrigger>
        ))}
      </TabsList>

      <TabsContent value="overview" className="mt-0">
        <OverviewTab activeWallet={activeWallet} />
      </TabsContent>
      
      <TabsContent value="send" className="mt-0">
        <SendTab activeWallet={activeWallet} />
      </TabsContent>
      
      <TabsContent value="receive" className="mt-0">
        <ReceiveTab activeWallet={activeWallet} />
      </TabsContent>
      
      <TabsContent value="mining" className="mt-0">
        <MiningTab activeWallet={activeWallet} />
      </TabsContent>
      
      <TabsContent value="mempool" className="mt-0">
        <MempoolTab />
      </TabsContent>
      
      <TabsContent value="stats" className="mt-0">
        <BlockchainStatsTab />
      </TabsContent>
      
      <TabsContent value="blockchain" className="mt-0">
        <BlockchainTab />
      </TabsContent>
      
      <TabsContent value="tx-explorer" className="mt-0">
        <TransactionExplorerTab />
      </TabsContent>
      
      <TabsContent value="bc-explorer" className="mt-0">
        <BlockchainExplorerTab />
      </TabsContent>
    </Tabs>
  );
};

export default WalletTabs;
