import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { ArrowLeft, User, Mail, MapPin, Globe, Key, AtSign, Eye, EyeOff, Copy, Check, Loader2 } from "lucide-react";

const Signup = () => {
  const navigate = useNavigate();
  const { signup } = useAuth();
  const [step, setStep] = useState<"form" | "result">("form");
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState(false);
  const [showSalt, setShowSalt] = useState(false);
  const [generatedData, setGeneratedData] = useState<{
    loginId: string;
    formHash: string;
    usernameHash: string;
    combinedHash: string;
    prefixes: Record<string, string>;
    formCombinedString: string;
  } | null>(null);

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    city: "",
    country: "",
    saltKey: "",
    username: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (formData.fullName.length < 3) {
      newErrors.fullName = "Full name must be at least 3 characters";
    }
    if (!formData.email.includes("@") || formData.email.length < 3) {
      newErrors.email = "Please enter a valid email";
    }
    if (formData.city.length < 3) {
      newErrors.city = "City must be at least 3 characters";
    }
    if (formData.country.length < 3) {
      newErrors.country = "Country must be at least 3 characters";
    }
    if (formData.saltKey.length < 3) {
      newErrors.saltKey = "Salt key must be at least 3 characters";
    }
    if (formData.username.length < 3) {
      newErrors.username = "Username must be at least 3 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const getPrefix = (str: string): string => str.toLowerCase().slice(0, 3);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast({
        title: "Validation Error",
        description: "Please fill all fields with at least 3 characters",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const userData = await signup(formData);

      const prefixes = {
        fullName: getPrefix(formData.fullName),
        email: getPrefix(formData.email),
        city: getPrefix(formData.city),
        country: getPrefix(formData.country),
        saltKey: getPrefix(formData.saltKey),
        username: getPrefix(formData.username),
      };

      const formCombinedString = 
        prefixes.fullName + 
        prefixes.email + 
        prefixes.city + 
        prefixes.country + 
        prefixes.saltKey;

      setGeneratedData({
        loginId: userData.loginId,
        formHash: userData.formHash,
        usernameHash: userData.usernameHash,
        combinedHash: userData.combinedHash,
        prefixes,
        formCombinedString,
      });

      setStep("result");
      toast({
        title: "Success!",
        description: "Your DID has been generated successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate DID. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(true);
    toast({
      title: "Copied!",
      description: "Login ID copied to clipboard. Save it securely!",
    });
    setTimeout(() => setCopiedId(false), 2000);
  };

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      {/* Background Effects */}
      <div className="fixed inset-0 bg-hero-pattern pointer-events-none" />
      <div className="fixed top-1/4 right-1/4 w-96 h-96 bg-gold/5 rounded-full blur-3xl pointer-events-none" />
      <div className="fixed bottom-1/4 left-1/4 w-80 h-80 bg-silver/5 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-2xl relative z-10">
        {/* Back Button */}
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-gold transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>

        {step === "form" ? (
          <div className="glass-card p-8 md:p-10 animate-fade-in-up">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="w-16 h-16 rounded-full bg-gradient-gold flex items-center justify-center mx-auto mb-4 glow-gold">
                <span className="font-display font-bold text-midnight text-2xl">G</span>
              </div>
              <h1 className="font-display text-2xl md:text-3xl font-bold mb-2">
                Generate Your <span className="text-gradient-gold">DID</span>
              </h1>
              <p className="text-muted-foreground text-sm">
                Create your Decentralized Identity for GSC
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                {/* Full Name */}
                <div className="space-y-2">
                  <Label htmlFor="fullName" className="flex items-center gap-2">
                    <User className="w-4 h-4 text-gold" />
                    Full Name
                  </Label>
                  <Input
                    id="fullName"
                    placeholder="e.g., Deepak Singh"
                    value={formData.fullName}
                    onChange={(e) => handleChange("fullName", e.target.value)}
                    className="bg-input border-border focus:border-gold"
                  />
                  {formData.fullName.length >= 3 && (
                    <p className="text-xs text-gold">Prefix: {getPrefix(formData.fullName)}</p>
                  )}
                  {errors.fullName && (
                    <p className="text-xs text-destructive">{errors.fullName}</p>
                  )}
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <Label htmlFor="email" className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-gold" />
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="e.g., dpkaction@gmail.com"
                    value={formData.email}
                    onChange={(e) => handleChange("email", e.target.value)}
                    className="bg-input border-border focus:border-gold"
                  />
                  {formData.email.length >= 3 && (
                    <p className="text-xs text-gold">Prefix: {getPrefix(formData.email)}</p>
                  )}
                  {errors.email && (
                    <p className="text-xs text-destructive">{errors.email}</p>
                  )}
                </div>

                {/* City */}
                <div className="space-y-2">
                  <Label htmlFor="city" className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-gold" />
                    City
                  </Label>
                  <Input
                    id="city"
                    placeholder="e.g., Satna"
                    value={formData.city}
                    onChange={(e) => handleChange("city", e.target.value)}
                    className="bg-input border-border focus:border-gold"
                  />
                  {formData.city.length >= 3 && (
                    <p className="text-xs text-gold">Prefix: {getPrefix(formData.city)}</p>
                  )}
                  {errors.city && (
                    <p className="text-xs text-destructive">{errors.city}</p>
                  )}
                </div>

                {/* Country */}
                <div className="space-y-2">
                  <Label htmlFor="country" className="flex items-center gap-2">
                    <Globe className="w-4 h-4 text-gold" />
                    Country
                  </Label>
                  <Input
                    id="country"
                    placeholder="e.g., India"
                    value={formData.country}
                    onChange={(e) => handleChange("country", e.target.value)}
                    className="bg-input border-border focus:border-gold"
                  />
                  {formData.country.length >= 3 && (
                    <p className="text-xs text-gold">Prefix: {getPrefix(formData.country)}</p>
                  )}
                  {errors.country && (
                    <p className="text-xs text-destructive">{errors.country}</p>
                  )}
                </div>

                {/* Salt Key */}
                <div className="space-y-2">
                  <Label htmlFor="saltKey" className="flex items-center gap-2">
                    <Key className="w-4 h-4 text-gold" />
                    Salt Key (Secret)
                  </Label>
                  <div className="relative">
                    <Input
                      id="saltKey"
                      type={showSalt ? "text" : "password"}
                      placeholder="e.g., Ankush"
                      value={formData.saltKey}
                      onChange={(e) => handleChange("saltKey", e.target.value)}
                      className="bg-input border-border focus:border-gold pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowSalt(!showSalt)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-gold"
                    >
                      {showSalt ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {formData.saltKey.length >= 3 && (
                    <p className="text-xs text-gold">Prefix: {getPrefix(formData.saltKey)}</p>
                  )}
                  {errors.saltKey && (
                    <p className="text-xs text-destructive">{errors.saltKey}</p>
                  )}
                </div>

                {/* Username */}
                <div className="space-y-2">
                  <Label htmlFor="username" className="flex items-center gap-2">
                    <AtSign className="w-4 h-4 text-gold" />
                    Username
                  </Label>
                  <Input
                    id="username"
                    placeholder="e.g., Dpkaction"
                    value={formData.username}
                    onChange={(e) => handleChange("username", e.target.value)}
                    className="bg-input border-border focus:border-gold"
                  />
                  {formData.username.length >= 3 && (
                    <p className="text-xs text-gold">Prefix: {getPrefix(formData.username)}</p>
                  )}
                  {errors.username && (
                    <p className="text-xs text-destructive">{errors.username}</p>
                  )}
                </div>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full btn-gold py-6 text-lg"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Generating DID...
                  </>
                ) : (
                  "Generate My DID"
                )}
              </Button>
            </form>

            {/* Login Link */}
            <p className="text-center text-muted-foreground text-sm mt-6">
              Already have a DID?{" "}
              <Link to="/login" className="text-gold hover:underline">
                Login here
              </Link>
            </p>
          </div>
        ) : (
          /* Result Screen */
          <div className="glass-card p-8 md:p-10 animate-scale-in">
            {/* Success Header */}
            <div className="text-center mb-8">
              <div className="w-16 h-16 rounded-full bg-success/20 flex items-center justify-center mx-auto mb-4">
                <Check className="w-8 h-8 text-success" />
              </div>
              <h1 className="font-display text-2xl md:text-3xl font-bold mb-2">
                DID Generated <span className="text-gradient-gold">Successfully!</span>
              </h1>
              <p className="text-muted-foreground text-sm">
                Complete breakdown of your hash-based ID creation
              </p>
            </div>

            {/* Hash Breakdown */}
            <div className="space-y-6">
              {/* Form Details & Prefixes */}
              <div className="glass-card p-4 space-y-3">
                <h3 className="text-sm font-semibold text-gold">Form Details & Prefixes</h3>
                <p className="text-xs text-muted-foreground mb-2">Must have all detail at least 3 characters or digit</p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-xs">
                  {generatedData && Object.entries(generatedData.prefixes).map(([key, value]) => (
                    <div key={key} className="flex flex-col bg-muted/50 p-2 rounded">
                      <span className="text-muted-foreground capitalize">{key}</span>
                      <span className="text-foreground">{formData[key as keyof typeof formData]}</span>
                      <span className="text-gold font-mono mt-1">Prefix: {value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* SHA-256 Hash Generation */}
              <div className="glass-card p-4 space-y-4">
                <h3 className="text-sm font-semibold text-silver">SHA-256 Hash Generation</h3>
                
                {/* Form Combined String */}
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Form Combined String (for hashing):</p>
                  <p className="font-mono text-xs text-gold break-all bg-muted/50 p-2 rounded">
                    {generatedData?.formCombinedString && Object.values(generatedData.prefixes).slice(0, 5).join(" + ")} = "{generatedData?.formCombinedString}"
                  </p>
                </div>

                {/* Form Hash */}
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Form Details SHA-256 Hash:</p>
                  <p className="font-mono text-xs text-foreground break-all bg-muted/50 p-2 rounded">
                    {generatedData?.formHash}
                  </p>
                </div>

                {/* Username String */}
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Username String (for hashing):</p>
                  <p className="font-mono text-xs text-gold break-all bg-muted/50 p-2 rounded">
                    "{formData.username.toLowerCase()}"
                  </p>
                </div>

                {/* Username Hash */}
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Username SHA-256 Hash:</p>
                  <p className="font-mono text-xs text-foreground break-all bg-muted/50 p-2 rounded">
                    {generatedData?.usernameHash}
                  </p>
                </div>
              </div>

              {/* Hash Combination Process */}
              <div className="glass-card p-4 space-y-3">
                <h3 className="text-sm font-semibold text-silver">Hash Combination Process</h3>
                <p className="text-xs text-muted-foreground">
                  Combination Method: Characters are alternated: FormHash[0] + UsernameHash[0] + FormHash[1] + UsernameHash[1] ...
                </p>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Combined Hash:</p>
                  <p className="font-mono text-xs text-foreground break-all bg-muted/50 p-2 rounded max-h-24 overflow-y-auto">
                    {generatedData?.combinedHash}
                  </p>
                </div>
              </div>

              {/* Final Login ID */}
              <div className="glass-card-gold p-6">
                <h3 className="text-sm font-semibold text-gold mb-2">Final Login ID</h3>
                <p className="text-xs text-muted-foreground mb-3">
                  ID Structure: "12021" + CombinedHash + "021GSC"
                </p>
                <div className="relative">
                  <div className="font-mono text-xs text-foreground break-all bg-midnight/50 p-4 rounded-lg pr-12 max-h-32 overflow-y-auto">
                    {generatedData?.loginId}
                  </div>
                  <button
                    onClick={() => generatedData && copyToClipboard(generatedData.loginId)}
                    className="absolute right-2 top-4 p-2 hover:bg-gold/10 rounded-lg transition-colors"
                  >
                    {copiedId ? (
                      <Check className="w-5 h-5 text-success" />
                    ) : (
                      <Copy className="w-5 h-5 text-gold" />
                    )}
                  </button>
                </div>
              </div>

              {/* Warning */}
              <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
                <p className="text-sm text-destructive">
                  ⚠️ <strong>Important:</strong> Save your Login ID and remember your username. 
                  These are required for login. We cannot recover them if lost.
                </p>
              </div>

              {/* Continue Button */}
              <Button
                className="w-full btn-gold py-6 text-lg"
                onClick={() => navigate("/wallet")}
              >
                Continue to Wallet
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Signup;
