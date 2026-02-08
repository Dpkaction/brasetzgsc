import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const Privacy = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <section className="pt-32 pb-16 relative">
        <div className="absolute inset-0 bg-hero-pattern" />

        <div className="container mx-auto px-4 lg:px-8 relative z-10">
          <div className="max-w-4xl mx-auto">
            <h1 className="font-display text-4xl md:text-5xl font-bold mb-6 text-center">
              Privacy <span className="text-gradient-gold">Policy</span>
            </h1>
            <p className="text-muted-foreground text-center mb-12">
              Last updated: January 2024
            </p>

            <div className="glass-card p-8 md:p-10 space-y-8">
              <section>
                <h2 className="font-display text-xl font-semibold mb-4 text-gold">1. Information We Collect</h2>
                <p className="text-muted-foreground leading-relaxed">
                  We collect information you provide during account creation including name, email, city, country, 
                  and username. We use cryptographic hashing to create your Decentralized ID (DID) without storing 
                  sensitive data in plaintext.
                </p>
              </section>

              <section>
                <h2 className="font-display text-xl font-semibold mb-4 text-gold">2. How We Use Your Information</h2>
                <p className="text-muted-foreground leading-relaxed">
                  Your information is used to generate your unique DID, verify your identity, provide platform services, 
                  and communicate important updates. We do not sell or share your personal information with third parties.
                </p>
              </section>

              <section>
                <h2 className="font-display text-xl font-semibold mb-4 text-gold">3. Data Security</h2>
                <p className="text-muted-foreground leading-relaxed">
                  We employ industry-standard security measures including SHA-256 hashing for identity verification. 
                  Your Login ID and authentication data are secured using cryptographic methods.
                </p>
              </section>

              <section>
                <h2 className="font-display text-xl font-semibold mb-4 text-gold">4. Your Rights</h2>
                <p className="text-muted-foreground leading-relaxed">
                  You have the right to access, correct, or delete your personal information. 
                  As a decentralized system, some data may be immutably recorded for security purposes.
                </p>
              </section>

              <section>
                <h2 className="font-display text-xl font-semibold mb-4 text-gold">5. Cookies and Tracking</h2>
                <p className="text-muted-foreground leading-relaxed">
                  We use essential cookies for authentication and session management. 
                  We do not use tracking cookies or share data with advertising networks.
                </p>
              </section>

              <section>
                <h2 className="font-display text-xl font-semibold mb-4 text-gold">6. Contact Us</h2>
                <p className="text-muted-foreground leading-relaxed">
                  For privacy-related inquiries, please contact our data protection team through our official channels.
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

export default Privacy;
