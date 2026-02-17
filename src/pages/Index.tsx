import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, Shield, Zap, Activity } from "lucide-react";
import heroImage from "@/assets/hero-illustration.png";

const features = [
  { icon: Eye, title: "Real-time Monitoring", desc: "Continuous webcam analysis to track eye movements and detect drowsiness instantly." },
  { icon: Shield, title: "Instant Alerts", desc: "Audible beep alerts the moment drowsiness is detected to keep you safe." },
  { icon: Zap, title: "Lightning Fast", desc: "Frames analyzed every 0.5s for near-instant drowsiness detection." },
  { icon: Activity, title: "Live Status", desc: "See your current state — awake, drowsy, or no face detected — in real time." },
];

// Use "/api" for proxy (requires Vite proxy config) or "http://127.0.0.1:5000" for direct calls
// If using direct calls, ensure Flask backend has CORS enabled
const API_BASE = import.meta.env.VITE_BACKEND_URL;
 // Change to "http://127.0.0.1:5000" if proxy doesn't work

const Index = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleStartDetection = async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log("[API] Calling POST /start to:", `${API_BASE}/start`);
      
      const response = await fetch(`${API_BASE}/start`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        // No body - do not send empty JSON or null
      });
      
      console.log("[API] Fetch completed. Status:", response.status);
      console.log("[API] Response ok:", response.ok);
      console.log("[API] Response statusText:", response.statusText);
      
      // Check if status is in success range (200-299) OR if backend received request
      // Navigate immediately if we got any response (means backend is reachable)
      const isSuccessStatus = response.status >= 200 && response.status < 300;
      const backendReachable = response.status > 0; // Any status means backend responded
      
      console.log("[API] Is success status (200-299):", isSuccessStatus);
      console.log("[API] Backend reachable:", backendReachable);
      
      // Navigate if backend responded (even if status is not 200)
      // This handles cases where backend returns non-standard success codes
      if (backendReachable) {
        console.log("[API] Backend responded! Navigating to /detect page immediately...");
        
        // Navigate first, then try to parse response in background
        navigate("/detect");
        console.log("[API] Navigation called");
        
        // Try to parse and log response (but don't block navigation)
        try {
          const text = await response.text();
          
          if (response.ok) {
            try {
              const data = JSON.parse(text);
              console.log("[API] Response data:", data);
            } catch (parseError) {
              console.log("[API] Response text (not JSON):", text.substring(0, 200));
            }
          } else {
            console.warn("[API] Backend error:", text.substring(0, 200));
          }
        } catch (parseError) {
          console.warn("[API] Could not read response (non-critical):", parseError);
        }
        
        // If status is not in success range, log warning but don't prevent navigation
        if (!isSuccessStatus) {
          console.warn("[API] Warning: Response status is", response.status, "but navigating anyway");
        }
      } else {
        throw new Error("No response from backend server");
      }
    } catch (error: any) {
      console.error("[API] Failed to start detection:", error);
      console.error("[API] Error details:", {
        message: error.message,
        name: error.name,
        stack: error.stack
      });
      
      // More specific error message
      if (error.message?.includes("Failed to fetch") || error.message?.includes("NetworkError") || error.name === "TypeError") {
        setError("Cannot connect to backend server. Please ensure the server is running at http://127.0.0.1:5000");
      } else {
        setError(`Failed to start detection: ${error.message || "Unknown error"}`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <nav className="flex items-center justify-between px-6 md:px-12 lg:px-20 py-5 border-b border-border">
        <div className="flex items-center gap-2">
          <Eye className="h-7 w-7 text-primary" />
          <span className="text-xl font-heading font-bold text-foreground">DrowsyGuard</span>
        </div>
        <div className="hidden md:flex items-center gap-8 text-sm text-muted-foreground font-medium">
          <a href="#features" className="hover:text-foreground transition-colors">Features</a>
          <a href="#how-it-works" className="hover:text-foreground transition-colors">How It Works</a>
        </div>
        <button
          onClick={handleStartDetection}
          disabled={loading}
          className="rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Starting..." : "Get Started"}
        </button>
      </nav>

      {/* Hero */}
      <section className="flex flex-col items-center text-center px-6 pt-16 md:pt-24 pb-8">
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-heading font-bold text-foreground leading-tight max-w-3xl animate-fade-in-up">
          Stay Awake. Stay Safe.
        </h1>
        <p className="mt-6 text-lg md:text-xl text-muted-foreground max-w-xl animate-fade-in-up" style={{ animationDelay: "0.15s" }}>
          AI-powered drowsiness detection using your webcam. Get instant alerts before it's too late.
        </p>
        <div className="flex flex-col items-center gap-4 mt-10 animate-fade-in-up" style={{ animationDelay: "0.3s" }}>
          <button
            onClick={handleStartDetection}
            disabled={loading}
            className="rounded-full bg-primary px-8 py-3.5 text-base font-semibold text-primary-foreground hover:opacity-90 transition-all hover:scale-105 shadow-lg shadow-primary/25 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Starting..." : "Detect Drowsiness"}
          </button>
          {error && (
            <div className="text-destructive text-sm font-medium">
              {error}
            </div>
          )}
          <a
            href="#features"
            className="rounded-full border border-border px-8 py-3.5 text-base font-semibold text-foreground hover:bg-secondary transition-colors"
          >
            Learn More
          </a>
        </div>
      </section>

      {/* Hero Image */}
      <section className="flex justify-center px-6 pb-16">
        <div className="animate-fade-in-up max-w-4xl w-full" style={{ animationDelay: "0.45s" }}>
          <img src={heroImage} alt="Drowsiness Detection AI Illustration" className="w-full rounded-2xl" />
        </div>
      </section>

      {/* Features */}
      <section id="features" className="bg-secondary/50 py-20 px-6">
        <h2 className="text-3xl md:text-4xl font-heading font-bold text-foreground text-center mb-14">Why DrowsyGuard?</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
          {features.map((f, i) => (
            <div key={i} className="bg-card rounded-xl p-6 border border-border hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 rounded-lg bg-accent flex items-center justify-center mb-4">
                <f.icon className="h-6 w-6 text-accent-foreground" />
              </div>
              <h3 className="font-heading font-semibold text-foreground mb-2">{f.title}</h3>
              <p className="text-sm text-muted-foreground">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 px-6">
        <h2 className="text-3xl md:text-4xl font-heading font-bold text-foreground text-center mb-14">How It Works</h2>
        <div className="flex flex-col md:flex-row gap-8 max-w-4xl mx-auto">
          {[
            { step: "1", title: "Open Camera", desc: "Grant webcam access to start monitoring." },
            { step: "2", title: "Start Detection", desc: "Click start and our AI begins analyzing frames." },
            { step: "3", title: "Get Alerts", desc: "Receive instant audio alerts if drowsiness is detected." },
          ].map((s, i) => (
            <div key={i} className="flex-1 text-center">
              <div className="w-14 h-14 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xl font-heading font-bold mx-auto mb-4">
                {s.step}
              </div>
              <h3 className="font-heading font-semibold text-foreground mb-2">{s.title}</h3>
              <p className="text-sm text-muted-foreground">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8 text-center text-sm text-muted-foreground">
        © 2026 DrowsyGuard. Built for safety.
      </footer>
    </div>
  );
};

export default Index;
