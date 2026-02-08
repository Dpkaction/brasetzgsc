import { useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { Globe, User, Mail, Phone, MapPin, Send, Loader2, Star, Users, Award } from "lucide-react";

const Ambassador = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    username: "",
    email: "",
    phone: "",
    country: "",
    city: "",
    motivation: "",
  });

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate
    if (!formData.fullName || !formData.email || !formData.country || !formData.username) {
      toast({
        title: "Missing Fields",
        description: "Please fill all required fields",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // First, let's test if the bot token is valid
      const botToken = "8235026634:AAE0tNMsvAODsst9h9WhAXAtdjSF2N13wOQ";
      
      // Test bot token validity first
      console.log("Testing bot token validity...");
      try {
        const botInfoResponse = await fetch(`https://api.telegram.org/bot${botToken}/getMe`);
        if (!botInfoResponse.ok) {
          throw new Error(`Bot token invalid: ${botInfoResponse.statusText}`);
        }
        console.log("✅ Bot token is valid");
      } catch (tokenError) {
        console.error("Bot token validation failed:", tokenError);
        toast({
          title: "Configuration Error",
          description: "Bot token is invalid. Please check bot configuration.",
          variant: "destructive",
        });
        return;
      }
      
      const message = `🌟 New GSC Partner Application

👤 Full Name: ${formData.fullName}
🏷️ Username: ${formData.username}
📧 Email: ${formData.email}
📱 Phone: ${formData.phone || "Not provided"}
🌍 Country: ${formData.country}
🏙️ City: ${formData.city || "Not provided"}

💭 Motivation:
${formData.motivation || "Not provided"}

📅 Submitted: ${new Date().toLocaleString()}`;

      let success = false;
      let errorDetails = "";
      
      // Try different chat ID formats - the bot might need to be contacted directly
      const chatConfigs = [
        "@gscambassador_bot",
        "gscambassador_bot",
        // If the above don't work, we'll need the actual chat ID number
      ];
      
      for (const chatId of chatConfigs) {
        try {
          console.log(`Attempting to send to chat ID: ${chatId}`);
          
          const response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              chat_id: chatId,
              text: message,
              parse_mode: 'HTML'
            })
          });

          const responseData = await response.json();
          
          if (response.ok && responseData.ok) {
            success = true;
            console.log(`✅ Message sent successfully to ${chatId}`);
            break;
          } else {
            console.log(`❌ Failed to send to ${chatId}:`, responseData.description);
            errorDetails += `Failed to send to ${chatId}: ${responseData.description}. `;
          }
        } catch (error) {
          console.error(`Error sending to ${chatId}:`, error);
          errorDetails += `Error with ${chatId}: ${error.message}. `;
        }
      }

      // Try alternative method - direct bot API call
      if (!success) {
        try {
          console.log("Trying alternative method...");
          
          const response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              chat_id: "@gscambassador_bot",
              text: message,
              parse_mode: 'HTML'
            })
          });

          const responseData = await response.json();
          
          if (response.ok && responseData.ok) {
            success = true;
            console.log("✅ Alternative method successful");
          } else {
            console.log("❌ Alternative method failed:", responseData.description);
            errorDetails += `Alternative method error: ${responseData.description}. `;
          }
        } catch (alternativeError) {
          console.log("Alternative method failed:", alternativeError);
          errorDetails += `Alternative method error: ${alternativeError.message}. `;
        }
      }

      if (success) {
        toast({
          title: "Application Submitted!",
          description: "Your application has been successfully sent to @gscambassador_bot on network.",
        });

        // Reset form
        setFormData({
          fullName: "",
          username: "",
          email: "",
          phone: "",
          country: "",
          city: "",
          motivation: "",
        });
        
      } else {
        // Log detailed error information for debugging
        console.error("All Telegram API methods failed. Error details:", errorDetails);
        
        toast({
          title: "Bot Configuration Issue",
          description: `Failed to send to @gscambassador_bot. Error: ${errorDetails.substring(0, 100)}... Check console for details.`,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Submission error:", error);
      toast({
        title: "Submission Failed",
        description: "Failed to broadcast to network. Please check your connection and try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero Section */}
      <section className="pt-32 pb-16 relative overflow-hidden">
        <div className="absolute inset-0 bg-hero-pattern" />
        <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-gold/5 rounded-full blur-3xl" />

        <div className="container mx-auto px-4 lg:px-8 relative z-10">
          <div className="text-center mb-12">
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card-gold mb-6">
              <Users className="w-4 h-4 text-gold" />
              Join Our Network
            </span>
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold mb-6 animate-fade-in-up delay-100">
              Become a <span className="text-gradient-gold">GSC Partner</span>
            </h1>
            <p className="text-muted-foreground text-lg animate-fade-in-up delay-200">
              Help us build the future of sustainable digital finance. Represent GSC in your region 
              and grow with our global community.
            </p>
          </div>

          {/* Application Form */}
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-10">
              <h2 className="font-display text-2xl md:text-3xl font-bold mb-3">
                Apply to be a <span className="text-gradient-gold">Partner</span>
              </h2>
              <p className="text-muted-foreground">
                Fill out the form below and we'll get back to you
              </p>
            </div>

          <form onSubmit={handleSubmit} className="glass-card p-8 md:p-10 space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Full Name */}
              <div className="space-y-2">
                <Label htmlFor="fullName" className="flex items-center gap-2">
                  <User className="w-4 h-4 text-gold" />
                  Full Name *
                </Label>
                <Input
                  id="fullName"
                  placeholder="Your full name"
                  value={formData.fullName}
                  onChange={(e) => handleChange("fullName", e.target.value)}
                  className="bg-input border-border focus:border-gold"
                  required
                />
              </div>

              {/* Username */}
              <div className="space-y-2">
                <Label htmlFor="username" className="flex items-center gap-2">
                  <Award className="w-4 h-4 text-gold" />
                  Username *
                </Label>
                <Input
                  id="username"
                  placeholder="Your username"
                  value={formData.username}
                  onChange={(e) => handleChange("username", e.target.value)}
                  className="bg-input border-border focus:border-gold"
                  required
                />
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-gold" />
                  Email *
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your.email@example.com"
                  value={formData.email}
                  onChange={(e) => handleChange("email", e.target.value)}
                  className="bg-input border-border focus:border-gold"
                  required
                />
              </div>

              {/* Phone */}
              <div className="space-y-2">
                <Label htmlFor="phone" className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-gold" />
                  Phone
                </Label>
                <Input
                  id="phone"
                  placeholder="+1 (555) 123-4567"
                  value={formData.phone}
                  onChange={(e) => handleChange("phone", e.target.value)}
                  className="bg-input border-border focus:border-gold"
                />
              </div>

              {/* Country */}
              <div className="space-y-2">
                <Label htmlFor="country" className="flex items-center gap-2">
                  <Globe className="w-4 h-4 text-gold" />
                  Country *
                </Label>
                <Input
                  id="country"
                  placeholder="Your country"
                  value={formData.country}
                  onChange={(e) => handleChange("country", e.target.value)}
                  className="bg-input border-border focus:border-gold"
                  required
                />
              </div>

              {/* City */}
              <div className="space-y-2">
                <Label htmlFor="city" className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-gold" />
                  City
                </Label>
                <Input
                  id="city"
                  placeholder="Your city"
                  value={formData.city}
                  onChange={(e) => handleChange("city", e.target.value)}
                  className="bg-input border-border focus:border-gold"
                />
              </div>
            </div>

            {/* Motivation */}
            <div className="space-y-2">
              <Label htmlFor="motivation" className="flex items-center gap-2">
                Why do you want to be a GSC Partner?
              </Label>
              <Textarea
                id="motivation"
                placeholder="Tell us about your interest in GSC and how you can contribute..."
                value={formData.motivation}
                onChange={(e) => handleChange("motivation", e.target.value)}
                className="bg-input border-border focus:border-gold min-h-[120px]"
              />
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full btn-gold py-6 text-lg"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Submitting Application...
                </>
              ) : (
                <>
                  <Send className="w-5 h-5 mr-2" />
                  Submit Application
                </>
              )}
            </Button>
          </form>
        </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Ambassador;
