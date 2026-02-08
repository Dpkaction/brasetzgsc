import { BookOpen, Calculator, Clock, Shield, Coins, Layers } from "lucide-react";

const features = [
  {
    icon: Calculator,
    title: "GSC Algorithm",
    description: "The Gold-Silver Coefficient (GSC) acts as a value index using the formula GSC = (n+1)/2, where you receive exactly 1 GSC backed by real metals.",
  },
  {
    icon: Coins,
    title: "Metal Backing",
    description: "Each 1 GSC is backed by 0.1g of Gold + 0.8g of Silver, maintaining the historic 1:8 ratio for sustainable value.",
  },
  {
    icon: Layers,
    title: "Conservation Proof",
    description: "Total possible supply of 2.16 trillion GSC based on all mined precious metals, ensuring true scarcity.",
  },
  {
    icon: Clock,
    title: "Proof of Time Zone",
    description: "Revolutionary PoTZ consensus mechanism using UTC-based validation for decentralized, energy-efficient mining.",
  },
  {
    icon: Shield,
    title: "Non-Custodial",
    description: "Full ownership with private key generation and 12-24 word mnemonic seed phrase for recovery. Your keys, your metals.",
  },
  {
    icon: BookOpen,
    title: "Offline Capability",
    description: "System designed to work without internet or traditional servers via mathematical equations and reinforcement technology.",
  },
];

const AboutSection = () => {
  return (
    <section className="py-24 relative overflow-hidden" id="about">
      {/* Background */}
      <div className="absolute left-0 top-1/3 w-96 h-96 bg-gold/5 rounded-full blur-3xl" />
      <div className="absolute right-0 bottom-1/3 w-80 h-80 bg-silver/5 rounded-full blur-3xl" />

      <div className="container mx-auto px-4 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-16">
          <span className="inline-block px-4 py-1 rounded-full bg-gold/10 text-gold text-sm font-medium mb-4">
            The Technology
          </span>
          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
            <span className="text-foreground">Built on </span>
            <span className="text-gradient-gold">Sound Principles</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            6-7 years of algorithm research led to the discovery of combining gold and silver prices — 
            a solution hidden in plain sight.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <div
              key={feature.title}
              className="glass-card p-6 group hover:border-gold/20 transition-all duration-500 animate-fade-in-up"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="w-12 h-12 rounded-xl bg-gold/10 flex items-center justify-center mb-4 group-hover:bg-gold/20 transition-colors duration-300">
                <feature.icon className="w-6 h-6 text-gold" />
              </div>
              <h3 className="font-display font-semibold text-lg mb-2">
                {feature.title}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>

        {/* Stats Banner */}
        <div className="mt-16 glass-card-gold p-8 rounded-2xl">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="font-display text-3xl md:text-4xl font-bold text-gold mb-1">
                2.08M
              </div>
              <div className="text-sm text-muted-foreground">Max GSC Supply</div>
            </div>
            <div>
              <div className="font-display text-3xl md:text-4xl font-bold text-silver-light mb-1">
                1.74M
              </div>
              <div className="text-sm text-muted-foreground">Metric Tons Silver</div>
            </div>
            <div>
              <div className="font-display text-3xl md:text-4xl font-bold text-gold mb-1">
                216K
              </div>
              <div className="text-sm text-muted-foreground">Tonnes of Gold</div>
            </div>
            <div>
              <div className="font-display text-3xl md:text-4xl font-bold text-foreground mb-1">
                100%
              </div>
              <div className="text-sm text-muted-foreground">Deflationary</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
