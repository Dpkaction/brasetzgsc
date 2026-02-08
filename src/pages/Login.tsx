import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { ArrowLeft, KeyRound, AtSign, Loader2, Shield, AlertCircle } from "lucide-react";

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    loginId: "",
    username: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.loginId) {
      newErrors.loginId = "Login ID is required";
    } else if (!formData.loginId.startsWith("12021")) {
      newErrors.loginId = "Login ID must start with 12021";
    } else if (!formData.loginId.endsWith("021GSC")) {
      newErrors.loginId = "Login ID must end with 021GSC";
    }

    if (!formData.username) {
      newErrors.username = "Username is required";
    } else if (formData.username.length < 3) {
      newErrors.username = "Username must be at least 3 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const success = await login(formData.loginId.trim(), formData.username.trim());

      if (success) {
        toast({
          title: "Welcome back!",
          description: "Successfully verified your identity",
        });
        navigate("/wallet");
      } else {
        toast({
          title: "Verification Failed",
          description: "Username hash does not match the Login ID. Please check your credentials and try again.",
          variant: "destructive",
        });
        setErrors({
          ...errors,
          loginId: "Username hash does not match this Login ID",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An error occurred during verification. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
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
      <div className="fixed top-1/3 left-1/3 w-96 h-96 bg-gold/5 rounded-full blur-3xl pointer-events-none" />
      <div className="fixed bottom-1/3 right-1/3 w-80 h-80 bg-silver/5 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        {/* Back Button */}
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-gold transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>

        <div className="glass-card p-8 md:p-10 animate-fade-in-up">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-full bg-gradient-gold flex items-center justify-center mx-auto mb-4 glow-gold">
              <Shield className="w-8 h-8 text-midnight" />
            </div>
            <h1 className="font-display text-2xl md:text-3xl font-bold mb-2">
              Verify Your <span className="text-gradient-gold">Identity</span>
            </h1>
            <p className="text-muted-foreground text-sm">
              Enter your username and login ID to verify
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Login ID */}
            <div className="space-y-2">
              <Label htmlFor="loginId" className="flex items-center gap-2">
                <KeyRound className="w-4 h-4 text-gold" />
                Login ID
              </Label>
              <Input
                id="loginId"
                placeholder="Enter your login ID (starts with 12021...)"
                value={formData.loginId}
                onChange={(e) => handleChange("loginId", e.target.value)}
                className={`bg-input border-border focus:border-gold font-mono text-sm ${
                  errors.loginId ? "border-destructive" : ""
                }`}
              />
              {errors.loginId ? (
                <p className="text-xs text-destructive flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.loginId}
                </p>
              ) : (
                <p className="text-xs text-muted-foreground">
                  The unique ID generated during signup
                </p>
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
                placeholder="Enter your username"
                value={formData.username}
                onChange={(e) => handleChange("username", e.target.value)}
                className={`bg-input border-border focus:border-gold ${
                  errors.username ? "border-destructive" : ""
                }`}
              />
              {errors.username ? (
                <p className="text-xs text-destructive flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.username}
                </p>
              ) : (
                <p className="text-xs text-muted-foreground">
                  Enter the same username you used when creating your ID
                </p>
              )}
            </div>

            {/* DID Info Box */}
            <div className="glass-card p-4 border-gold/20">
              <p className="text-xs text-muted-foreground">
                <span className="text-gold font-semibold">DID Verification:</span> Your username hash must match 
                the hash embedded in your Login ID. This is your Decentralized Identity (DID) verification using SHA-256.
              </p>
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
                  Verifying...
                </>
              ) : (
                "Verify & Login"
              )}
            </Button>
          </form>

          {/* Signup Link */}
          <p className="text-center text-muted-foreground text-sm mt-6">
            Don't have a DID?{" "}
            <Link to="/signup" className="text-gold hover:underline">
              Generate one here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
