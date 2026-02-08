import { Pickaxe, Wallet, Globe, Check, Clock, ArrowRight } from "lucide-react";

const phases = [
  {
    id: 1,
    title: "Mining Phase",
    subtitle: "Distributed Mining",
    description: "Participate in the distributed mining process using Proof of Time Zone (PoTZ) consensus. Earn VAGS tokens backed by real gold and silver.",
    icon: Pickaxe,
    status: "completed",
    features: ["PoTZ Validation", "Distributed Network", "Fair Distribution"],
  },
  {
    id: 2,
    title: "Wallet Creation",
    subtitle: "Secure Storage",
    description: "Create your non-custodial wallet with private key generation and 12-24 word seed phrase recovery. Full control of your assets.",
    icon: Wallet,
    status: "completed",
    features: ["Private Keys", "Seed Phrase Backup", "Multi-Currency View"],
  },
  {
    id: 3,
    title: "Market Launch",
    subtitle: "Global Transactions",
    description: "VAGS becomes available for worldwide transactions. Trade, transfer, and utilize your metal-backed digital assets globally.",
    icon: Globe,
    status: "active",
    features: ["P2P Transactions", "Exchange Listing", "Global Access"],
  },
];

const PhaseIcon = ({ Icon, status }: { Icon: any; status: string }) => (
  <div
    className={`relative w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-500 ${
      status === "completed"
        ? "bg-gradient-to-br from-green-500 to-green-600 glow-green shadow-lg shadow-green-500/25"
        : status === "active"
        ? "bg-gradient-gold glow-gold shadow-lg shadow-gold/25"
        : "glass-card border-silver/20 hover:border-silver/40"
    }`}
  >
    <Icon
      className={`w-8 h-8 transition-colors duration-300 ${
        status === "completed" 
          ? "text-white" 
          : status === "active" 
          ? "text-midnight" 
          : "text-silver hover:text-silver/80"
      }`}
    />
    {status === "completed" && (
      <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-green-400 border-2 border-white flex items-center justify-center shadow-lg">
        <Check className="w-4 h-4 text-white font-bold" />
      </div>
    )}
    {status === "active" && (
      <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-gold border-2 border-white flex items-center justify-center shadow-lg animate-pulse">
        <div className="w-2 h-2 rounded-full bg-midnight" />
      </div>
    )}
    {status === "upcoming" && (
      <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-muted flex items-center justify-center">
        <Clock className="w-3 h-3 text-muted-foreground" />
      </div>
    )}
  </div>
);

const PhasesSection = () => {
  return (
    <section className="py-24 relative overflow-hidden" id="phases">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-midnight-light/50 to-background" />

      <div className="container mx-auto px-4 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
            <span className="text-foreground">Project </span>
            <span className="text-gradient-gold">Roadmap</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Our three-phase journey to revolutionize the global financial system with metal-backed digital assets.
          </p>
        </div>

        {/* Phases Grid */}
        <div className="grid md:grid-cols-3 gap-8 relative">
          {/* Connection Line */}
          <div className="hidden md:block absolute top-8 left-[16.67%] right-[16.67%] h-0.5">
            <div className="h-full bg-gradient-to-r from-gold via-silver/30 to-silver/10" />
          </div>

          {phases.map((phase, index) => (
            <div
              key={phase.id}
              className={`relative animate-fade-in-up`}
              style={{ animationDelay: `${index * 150}ms` }}
            >
              {/* Phase Card */}
              <div
                className={`glass-card p-8 h-full transition-all duration-500 hover:scale-[1.02] ${
                  phase.status === "completed"
                    ? "border-green-500/30 glow-green-sm bg-green-500/5"
                    : phase.status === "active"
                    ? "border-gold/30 glow-gold-sm bg-gold/5"
                    : "hover:border-silver/30"
                }`}
              >
                {/* Icon & Phase Number */}
                <div className="flex items-start justify-between mb-6">
                  <PhaseIcon Icon={phase.icon} status={phase.status} />
                  <span
                    className={`font-display text-6xl font-bold ${
                      phase.status === "completed" 
                        ? "text-green-500/20" 
                        : phase.status === "active" 
                        ? "text-gold/20" 
                        : "text-silver/10"
                    }`}
                  >
                    {String(phase.id).padStart(2, "0")}
                  </span>
                </div>

                {/* Content */}
                <div className="mb-6">
                  <span
                    className={`text-xs font-semibold uppercase tracking-wider ${
                      phase.status === "completed" 
                        ? "text-green-400" 
                        : phase.status === "active" 
                        ? "text-gold" 
                        : "text-silver"
                    }`}
                  >
                    {phase.subtitle}
                  </span>
                  <h3 className="font-display text-xl font-bold mt-2 mb-3">
                    {phase.title}
                  </h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {phase.description}
                  </p>
                </div>

                {/* Features */}
                <ul className="space-y-2">
                  {phase.features.map((feature, i) => (
                    <li
                      key={i}
                      className="flex items-center gap-2 text-sm text-foreground/70"
                    >
                      {phase.status === "completed" ? (
                        <Check className="w-3 h-3 text-green-400" />
                      ) : (
                        <ArrowRight
                          className={`w-3 h-3 ${
                            phase.status === "active" ? "text-gold" : "text-silver"
                          }`}
                        />
                      )}
                      {feature}
                    </li>
                  ))}
                </ul>

                {/* Status Badge */}
                <div className="mt-6 pt-6 border-t border-border">
                  <span
                    className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium ${
                      phase.status === "completed"
                        ? "bg-green-500/10 text-green-400 border border-green-500/20"
                        : phase.status === "active"
                        ? "bg-gold/10 text-gold border border-gold/20"
                        : "bg-silver/10 text-silver border border-silver/20"
                    }`}
                  >
                    {phase.status === "completed" ? (
                      <Check className="w-3 h-3" />
                    ) : (
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          phase.status === "active"
                            ? "bg-gold animate-pulse"
                            : "bg-silver"
                        }`}
                      />
                    )}
                    {phase.status === "completed" 
                      ? "Completed" 
                      : phase.status === "active" 
                      ? "Currently Active" 
                      : "Coming Soon"}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PhasesSection;
