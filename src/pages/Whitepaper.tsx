import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { BookOpen, Calculator, Coins, Shield, Clock, Layers, ArrowRight, Download } from "lucide-react";
import { Button } from "@/components/ui/button";

const Whitepaper = () => {
  const sections = [
    {
      title: "Abstract",
      content: `GSC (Gold Silver Coin) represents a paradigm shift in digital finance, 
      creating a sustainable, scarcity-driven value system backed by physical precious metals. 
      After 6-7 years of algorithm research, we discovered a solution hidden in plain sight: 
      combining gold and silver prices using the historic 1:8 ratio to create a truly deflationary digital asset.`,
    },
    {
      title: "The Problem",
      content: `The global financial system faces unprecedented challenges. Fiat currencies continue 
      to devalue through inflation, central banks print money without restraint, and the average 
      citizen watches their purchasing power erode. Traditional cryptocurrencies, while innovative, 
      lack the tangible backing that has made gold and silver stores of value for millennia.`,
    },
    {
      title: "The Solution: GSC",
      content: `GSC bridges the gap between the ancient reliability of precious metals and the 
      efficiency of digital transactions. Each GSC token is backed by real, quantifiable amounts 
      of gold and silver, creating a truly sound money system for the digital age.`,
    },
  ];

  const technicalSpecs = [
    {
      icon: Calculator,
      title: "GSC Algorithm",
      formula: "GSC = (n+1)/2",
      description: "The Gold-Silver Coefficient acts as a value index. Users receive exactly 1 GSC while the GSC determines the underlying value calculation.",
    },
    {
      icon: Coins,
      title: "Metal Backing",
      formula: "1 GSC = 0.1g Gold + 0.8g Silver",
      description: "Each GSC unit is backed by physical precious metals maintaining the historic 1:8 gold-to-silver ratio.",
    },
    {
      icon: Layers,
      title: "Total Supply",
      formula: "Max 2.16 Trillion GSC",
      description: "Based on all mined gold (216,265 tonnes) and silver (1.74 million metric tons), ensuring true scarcity.",
    },
    {
      icon: Shield,
      title: "GSC Supply Cap",
      formula: "2,079,968 GSC",
      description: "Hard-capped supply makes the system fully deflationary once the metal cap is reached.",
    },
    {
      icon: Clock,
      title: "Proof of Time Zone",
      formula: "UTC-Based Validation",
      description: "Revolutionary PoTZ consensus mechanism for decentralized, energy-efficient validation across global time zones.",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero Section */}
      <section className="pt-32 pb-16 relative overflow-hidden">
        <div className="absolute inset-0 bg-hero-pattern" />
        <div className="absolute top-1/3 left-1/4 w-96 h-96 bg-gold/5 rounded-full blur-3xl" />

        <div className="container mx-auto px-4 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto">
            <span className="inline-block px-4 py-1 rounded-full bg-gold/10 text-gold text-sm font-medium mb-4 animate-fade-in-up">
              Technical Documentation
            </span>
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold mb-6 animate-fade-in-up delay-100">
              <span className="text-gradient-gold">GSC</span> Whitepaper
            </h1>
            <p className="text-muted-foreground text-lg mb-8 animate-fade-in-up delay-200">
              A comprehensive guide to the Gold Silver Coin ecosystem
            </p>
            <Button className="btn-gold animate-fade-in-up delay-300">
              <Download className="w-5 h-5 mr-2" />
              Download PDF
            </Button>
          </div>
        </div>
      </section>

      {/* Overview Sections */}
      <section className="py-16 relative">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="max-w-4xl mx-auto space-y-12">
            {sections.map((section, index) => (
              <div
                key={section.title}
                className="glass-card p-8 animate-fade-in-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <h2 className="font-display text-2xl font-bold mb-4 flex items-center gap-3">
                  <BookOpen className="w-6 h-6 text-gold" />
                  {section.title}
                </h2>
                <p className="text-muted-foreground leading-relaxed">
                  {section.content}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Technical Specifications */}
      <section className="py-16 relative bg-midnight-light/30">
        <div className="absolute right-0 top-1/2 w-96 h-96 bg-gold/5 rounded-full blur-3xl" />

        <div className="container mx-auto px-4 lg:px-8 relative z-10">
          <div className="text-center mb-12">
            <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
              Technical <span className="text-gradient-gold">Specifications</span>
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              The mathematical foundation of the GSC ecosystem
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {technicalSpecs.map((spec, index) => (
              <div
                key={spec.title}
                className="glass-card-gold p-6 animate-fade-in-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="w-12 h-12 rounded-xl bg-gold/10 flex items-center justify-center mb-4">
                  <spec.icon className="w-6 h-6 text-gold" />
                </div>
                <h3 className="font-display font-semibold text-lg mb-2">{spec.title}</h3>
                <div className="bg-midnight/50 rounded-lg p-3 mb-3">
                  <code className="text-gold font-mono text-sm">{spec.formula}</code>
                </div>
                <p className="text-sm text-muted-foreground">{spec.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Conservation Proof */}
      <section className="py-16 relative">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="max-w-4xl mx-auto glass-card p-8 md:p-10">
            <h2 className="font-display text-2xl md:text-3xl font-bold mb-6 text-center">
              The <span className="text-gradient-gold">Conservation Proof</span>
            </h2>

            <div className="space-y-6">
              <div className="glass-card p-6 border-gold/20">
                <h3 className="font-semibold text-gold mb-3">Gold Reserves</h3>
                <p className="text-muted-foreground">
                  Total mined gold: <span className="text-foreground font-semibold">216,265 tonnes</span>
                </p>
                <p className="text-muted-foreground">
                  At 0.1g per GSC: <span className="text-foreground font-semibold">2.16 trillion GSC maximum</span>
                </p>
              </div>

              <div className="glass-card p-6 border-silver/20">
                <h3 className="font-semibold text-silver-light mb-3">Silver Reserves</h3>
                <p className="text-muted-foreground">
                  Total mined silver: <span className="text-foreground font-semibold">1.74 million metric tons</span>
                </p>
                <p className="text-muted-foreground">
                  At 0.8g per GSC: <span className="text-foreground font-semibold">2.175 trillion GSC maximum</span>
                </p>
              </div>

              <div className="text-center p-6 bg-gradient-to-r from-gold/10 via-transparent to-silver/10 rounded-xl">
                <p className="text-muted-foreground mb-2">Constrained Supply (Lower of Two)</p>
                <p className="font-display text-3xl font-bold text-gradient-gold">
                  2.16 Trillion GSC
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  Limited by gold reserves, ensuring perpetual scarcity
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Whitepaper;
