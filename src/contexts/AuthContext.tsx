import { createContext, useContext, useState, ReactNode } from "react";

interface UserData {
  fullName: string;
  email: string;
  city: string;
  country: string;
  saltKey: string;
  username: string;
  loginId: string;
  formHash: string;
  usernameHash: string;
  combinedHash: string;
}

interface AuthContextType {
  user: UserData | null;
  isAuthenticated: boolean;
  login: (loginId: string, username: string) => Promise<boolean>;
  signup: (userData: Omit<UserData, "loginId" | "formHash" | "usernameHash" | "combinedHash">) => Promise<UserData>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

// SHA-256 hash function using Web Crypto API
async function sha256(message: string): Promise<string> {
  const msgBuffer = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest("SHA-256", msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
  return hashHex;
}

// Get prefix (first 3 characters, lowercase)
function getPrefix(str: string): string {
  return str.toLowerCase().slice(0, 3);
}

// Combine hashes by alternating characters: FormHash[0] + UsernameHash[0] + FormHash[1] + UsernameHash[1]...
function combineHashes(formHash: string, usernameHash: string): string {
  let combined = "";
  const maxLen = Math.max(formHash.length, usernameHash.length);
  for (let i = 0; i < maxLen; i++) {
    if (i < formHash.length) combined += formHash[i];
    if (i < usernameHash.length) combined += usernameHash[i];
  }
  return combined;
}

// Generate Login ID: "12021" + CombinedHash + "021VAGS"
function generateLoginId(combinedHash: string): string {
  return `12021${combinedHash}021VAGS`;
}

// Extract username hash from login ID by reversing the alternating combination
function extractUsernameHashFromLoginId(loginId: string): string {
  // Remove prefix "12021" and suffix "021VAGS"
  const combinedHash = loginId.slice(5, -7);
  
  // Extract username hash (every odd position: 1, 3, 5, ...)
  let usernameHash = "";
  for (let i = 1; i < combinedHash.length; i += 2) {
    usernameHash += combinedHash[i];
  }
  return usernameHash;
}

// Validate Login ID format
function validateLoginId(loginId: string): boolean {
  return loginId.startsWith("12021") && loginId.endsWith("021VAGS") && loginId.length > 12;
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<UserData | null>(() => {
    const stored = localStorage.getItem("vags_user");
    return stored ? JSON.parse(stored) : null;
  });

  const signup = async (userData: Omit<UserData, "loginId" | "formHash" | "usernameHash" | "combinedHash">): Promise<UserData> => {
    // Create form combined string from prefixes: dee + dpk + sat + ind + ank
    const formCombined = 
      getPrefix(userData.fullName) +
      getPrefix(userData.email) +
      getPrefix(userData.city) +
      getPrefix(userData.country) +
      getPrefix(userData.saltKey);

    // Generate SHA-256 hashes
    const formHash = await sha256(formCombined);
    const usernameHash = await sha256(userData.username.toLowerCase());
    
    // Combine hashes by alternating characters
    const combinedHash = combineHashes(formHash, usernameHash);
    
    // Generate final Login ID
    const loginId = generateLoginId(combinedHash);

    const fullUserData: UserData = {
      ...userData,
      formHash,
      usernameHash,
      combinedHash,
      loginId,
    };

    setUser(fullUserData);
    localStorage.setItem("vags_user", JSON.stringify(fullUserData));
    localStorage.setItem("vags_credentials", JSON.stringify({ 
      loginId, 
      username: userData.username,
      usernameHash 
    }));

    return fullUserData;
  };

  const login = async (loginId: string, username: string): Promise<boolean> => {
    // Validate Login ID format
    if (!validateLoginId(loginId)) {
      return false;
    }

    // Generate SHA-256 hash of the entered username
    const enteredUsernameHash = await sha256(username.toLowerCase());
    
    // Extract username hash from the login ID
    const embeddedUsernameHash = extractUsernameHashFromLoginId(loginId);
    
    // Compare: the embedded hash should match the entered username's hash
    if (embeddedUsernameHash === enteredUsernameHash) {
      // Check if we have stored user data
      const storedUser = localStorage.getItem("vags_user");
      const storedCreds = localStorage.getItem("vags_credentials");
      
      if (storedUser && storedCreds) {
        const creds = JSON.parse(storedCreds);
        if (creds.loginId === loginId) {
          setUser(JSON.parse(storedUser));
          return true;
        }
      }
      
      // If no stored user but hashes match, create a minimal user session
      const minimalUser: UserData = {
        fullName: "",
        email: "",
        city: "",
        country: "",
        saltKey: "",
        username: username,
        loginId: loginId,
        formHash: "",
        usernameHash: enteredUsernameHash,
        combinedHash: loginId.slice(5, -7),
      };
      setUser(minimalUser);
      return true;
    }
    
    return false;
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        login,
        signup,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
