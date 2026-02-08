import { Link } from "react-router-dom";
import { useState } from "react";
import { 
  Twitter, 
  Github, 
  MessageCircle, 
  Youtube, 
  Linkedin,
  Mail,
  MessageSquare,
  Send,
  Globe,
  Coins,
  CheckCircle,
  AlertCircle
} from "lucide-react";

interface FooterProps {
  onAdminClick?: () => void;
}

const Footer = ({ onAdminClick }: FooterProps) => {
  const currentYear = new Date().getFullYear();
  const [email, setEmail] = useState("");
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [subscriptionStatus, setSubscriptionStatus] = useState<"idle" | "success" | "error">("idle");
  const [adminClickCount, setAdminClickCount] = useState(0);
  const [clickTimeout, setClickTimeout] = useState<NodeJS.Timeout | null>(null);

  const handleAdminClick = () => {
    // Clear existing timeout
    if (clickTimeout) {
      clearTimeout(clickTimeout);
    }

    // Increment click count
    const newCount = adminClickCount + 1;
    setAdminClickCount(newCount);

    // If 5 clicks within 3 seconds, trigger admin panel
    if (newCount >= 5) {
      onAdminClick();
      setAdminClickCount(0); // Reset counter
      return;
    }

    // Set timeout to reset counter after 3 seconds
    const timeout = setTimeout(() => {
      setAdminClickCount(0);
      setClickTimeout(null);
    }, 3000);
    
    setClickTimeout(timeout);
  };

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !email.includes("@")) {
      setSubscriptionStatus("error");
      setTimeout(() => setSubscriptionStatus("idle"), 3000);
      return;
    }

    setIsSubscribing(true);
    setSubscriptionStatus("idle");

    try {
      // Send to Telegram bot @gscambassador_bot
      const botToken = "8235026634:AAE0tNMsvAODsst9h9WhAXAtdjSF2N13wOQ";
      const chatId = "@gscambassador_bot";
      
      const subscriptionMessage = `📧 New GSC Newsletter Subscription

📧 Email: ${email}
📅 Date: ${new Date().toLocaleString()}
🌐 Source: GSC Website Footer
📝 Type: Newsletter Subscription

Please add this email to the GSC newsletter mailing list.`;

      let telegramSuccess = false;
      
      // Try to send to Telegram first
      try {
        const response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            chat_id: chatId,
            text: subscriptionMessage
          })
        });
        
        const responseData = await response.json();
        if (response.ok && responseData.ok) {
          telegramSuccess = true;
          console.log("✅ Subscription sent to @gscambassador_bot");
        } else {
          console.log("❌ Telegram send failed:", responseData.description);
        }
      } catch (telegramError) {
        console.log("❌ Telegram error:", telegramError);
      }
      
      // Also send email as backup/additional notification
      const subject = encodeURIComponent("New GSC Newsletter Subscription");
      const body = encodeURIComponent(`New subscription request:

Email: ${email}
Date: ${new Date().toLocaleString()}
Source: GSC Website Footer

Please add this email to the GSC newsletter mailing list.`);
      
      const mailtoLink = `mailto:connectbrasetz@gmail.com?subject=${subject}&body=${body}`;
      
      // Open default email client
      window.open(mailtoLink, '_blank');
      
      setSubscriptionStatus("success");
      setEmail("");
      
      // Reset status after 5 seconds
      setTimeout(() => setSubscriptionStatus("idle"), 5000);
      
    } catch (error) {
      console.error("Subscription error:", error);
      setSubscriptionStatus("error");
      setTimeout(() => setSubscriptionStatus("idle"), 3000);
    } finally {
      setIsSubscribing(false);
    }
  };

  const socialLinks = [
    { icon: MessageSquare, href: "https://chat.whatsapp.com/L9OHYAl4UYtF2Um8pc79Gj", label: "WhatsApp" },
    { icon: Twitter, href: "https://x.com/brasetz0", label: "Twitter" },
    { icon: Globe, href: "https://www.startupindia.gov.in/content/sih/en/profile.Startup.65166bf8e4b023326372d8cb.html", label: "Startup India" },
    { icon: MessageCircle, href: "https://www.reddit.com/r/Brassetz/", label: "Reddit" },
    { icon: MessageCircle, href: "https://discord.gg/J7QwrA5f", label: "Discord" },
    { icon: Send, href: "https://t.me/Brasetz", label: "Telegram" },
    { icon: Youtube, href: "https://www.youtube.com/@Brasset0", label: "YouTube" },
    { icon: Linkedin, href: "https://www.linkedin.com/company/brasset0/", label: "LinkedIn" },
  ];

  const footerLinks = {
    product: [
      { label: "Whitepaper", href: "/whitepaper" },
      { label: "Wallet", href: "/wallet" },
      { label: "Partner", href: "/ambassador" },
      { label: "admin", href: "#", isAdmin: true },
    ],
    legal: [
      { label: "Terms & Conditions", href: "/terms" },
      { label: "Privacy Policy", href: "/privacy" },
    ],
    support: [
      { label: "FAQ", href: "#" },
      { label: "Contact", href: "#" },
    ],
  };

  return (
    <footer className="relative border-t border-border bg-midnight-dark/50">
      <div className="container mx-auto px-4 lg:px-8">
        {/* Main Footer Content */}
        <div className="py-12 sm:py-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-12">
          {/* Brand Column */}
          <div className="sm:col-span-2 lg:col-span-1">
            <Link to="/" className="flex items-center gap-3 mb-4 sm:mb-6">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-gold flex items-center justify-center glow-gold-sm">
                <Coins className="w-5 h-5 sm:w-6 sm:h-6 text-midnight" />
              </div>
              <span className="font-display font-bold text-lg sm:text-xl text-gradient-gold">
                GSC
              </span>
            </Link>
            <p className="text-muted-foreground text-sm mb-4 sm:mb-6 max-w-xs">
              Gold Silver Coin — The sustainable digital metal standard for the next century.
            </p>
            {/* Social Links */}
            <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg glass-card flex items-center justify-center text-muted-foreground hover:text-gold hover:border-gold/30 transition-all duration-300"
                  aria-label={social.label}
                  title={social.label}
                >
                  <social.icon className="w-4 h-4 sm:w-5 sm:h-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Product Links */}
          <div>
            <h4 className="font-display font-semibold text-foreground mb-4">Product</h4>
            <ul className="space-y-3">
              {footerLinks.product.map((link) => (
                <li key={link.label}>
                  {link.isAdmin ? (
                    <button
                      onClick={handleAdminClick}
                      className="text-muted-foreground hover:text-gold transition-colors duration-300 text-sm text-left relative"
                    >
                      {link.label}
                      {adminClickCount > 0 && (
                        <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                          {adminClickCount}
                        </span>
                      )}
                    </button>
                  ) : (
                    <Link
                      to={link.href}
                      className="text-muted-foreground hover:text-gold transition-colors duration-300 text-sm"
                    >
                      {link.label}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </div>

          {/* Legal Links */}
          <div>
            <h4 className="font-display font-semibold text-foreground mb-4">Legal</h4>
            <ul className="space-y-3">
              {footerLinks.legal.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.href}
                    className="text-muted-foreground hover:text-gold transition-colors duration-300 text-sm"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter / Contact */}
          <div className="sm:col-span-2 lg:col-span-1">
            <h4 className="font-display font-semibold text-foreground mb-4">Stay Updated</h4>
            <p className="text-muted-foreground text-sm mb-4">
              Subscribe to receive the latest updates and announcements.
            </p>
            
            {/* Subscription Status Messages */}
            {subscriptionStatus === "success" && (
              <div className="flex items-center gap-2 mb-4 p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                <CheckCircle className="w-4 h-4 text-green-400" />
                <span className="text-green-400 text-sm">Subscription sent to @gscambassador_bot and email!</span>
              </div>
            )}
            
            {subscriptionStatus === "error" && (
              <div className="flex items-center gap-2 mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                <AlertCircle className="w-4 h-4 text-red-400" />
                <span className="text-red-400 text-sm">Please enter a valid email address.</span>
              </div>
            )}
            
            <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-2">
              <div className="flex-1 relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  disabled={isSubscribing}
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-input border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-gold/50 transition-colors disabled:opacity-50"
                  required
                />
              </div>
              <button 
                type="submit"
                disabled={isSubscribing || !email}
                className="px-4 py-2.5 rounded-lg bg-gradient-gold text-midnight font-medium text-sm hover:opacity-90 transition-opacity whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubscribing ? "Sending..." : "Subscribe"}
              </button>
            </form>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="py-4 sm:py-6 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-2 sm:gap-4 text-center sm:text-left">
          <p className="text-muted-foreground text-xs sm:text-sm">
            © {currentYear} GSC. All rights reserved.
          </p>
          <p className="text-muted-foreground text-xs">
            Backed by 216,265 tonnes of gold & 1.74M metric tons of silver
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
