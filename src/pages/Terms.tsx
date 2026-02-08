import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const Terms = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <section className="pt-32 pb-16 relative">
        <div className="absolute inset-0 bg-hero-pattern" />

        <div className="container mx-auto px-4 lg:px-8 relative z-10">
          <div className="max-w-4xl mx-auto">
            <h1 className="font-display text-4xl md:text-5xl font-bold mb-6 text-center">
              Terms & <span className="text-gradient-gold">Conditions</span>
            </h1>
            <p className="text-muted-foreground text-center mb-12">
              Last updated: January 2024
            </p>

            <div className="glass-card p-8 md:p-10 space-y-8">
              <section>
                <h2 className="font-display text-xl font-semibold mb-4 text-gold">1. Acceptance of Terms</h2>
                <p className="text-muted-foreground leading-relaxed">
                  By accessing and using the GSC platform, you agree to be bound by these Terms and Conditions. 
                  If you do not agree to these terms, please do not use our services.
                </p>
              </section>

              <section>
                <h2 className="font-display text-xl font-semibold mb-4 text-gold">2. Description of Service</h2>
                <p className="text-muted-foreground leading-relaxed">
                  GSC provides a decentralized digital asset platform backed by physical gold and silver. 
                  Our services include wallet creation, mining participation, and future transaction capabilities.
                </p>
              </section>

              <section>
                <h2 className="font-display text-xl font-semibold mb-4 text-gold">3. User Responsibilities</h2>
                <p className="text-muted-foreground leading-relaxed">
                  Users are responsible for maintaining the security of their Login ID and private keys. 
                  GSC cannot recover lost credentials. Users must comply with all applicable laws and regulations.
                </p>
              </section>

              <section>
                <h2 className="font-display text-xl font-semibold mb-4 text-gold">4. Risk Disclaimer</h2>
                <p className="text-muted-foreground leading-relaxed">
                  Digital assets involve significant risks. The value of GSC tokens may fluctuate based on 
                  underlying metal prices and market conditions. Past performance does not guarantee future results.
                </p>
              </section>

              <section>
                <h2 className="font-display text-xl font-semibold mb-4 text-gold">5. Limitation of Liability</h2>
                <p className="text-muted-foreground leading-relaxed">
                  GSC shall not be liable for any indirect, incidental, special, consequential, or punitive damages 
                  resulting from your use of the platform.
                </p>
              </section>

              <section>
                <h2 className="font-display text-xl font-semibold mb-4 text-gold">6. Modifications</h2>
                <p className="text-muted-foreground leading-relaxed">
                  We reserve the right to modify these terms at any time. Users will be notified of significant 
                  changes through the platform.
                </p>
              </section>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Terms;
