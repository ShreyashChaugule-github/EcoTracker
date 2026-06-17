import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Leaf, Sparkles, ArrowRight, X, Mail, User, Info, CheckCircle2, ShieldCheck } from "lucide-react";
import { signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "../firebase";

interface LandingPageProps {
  onLoginSuccess: (email: string, displayName: string) => void;
}

export default function LandingPage({ onLoginSuccess }: LandingPageProps) {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [errorInput, setErrorInput] = useState("");
  const [loading, setLoading] = useState(false);

  // Helper to sanitize/generate deterministic userId from email
  const handleAuthSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorInput("");

    if (!email) {
      setErrorInput("Please enter a valid email address.");
      return;
    }

    if (authMode === "signup" && !name) {
      setErrorInput("Please enter your display name.");
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      // Determine display name
      const finalName = name || email.split("@")[0].split(".")[0];
      onLoginSuccess(email.trim(), finalName.trim());
    }, 850);
  };

  const handleGoogleSubmit = async () => {
    setLoading(true);
    setErrorInput("");
    try {
      // Check if we are running in an iframe
      const isInIframe = window.self !== window.top;
      if (isInIframe) {
        console.warn("Detected iframe environment. Google Sign-In popups require opening the application in a 'New Tab' due to browser security restrictions.");
      }

      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      const userEmail = user.email || "google.warrior@example.com";
      const userDisplayName = user.displayName || userEmail.split("@")[0] || "Eco-Warrior";
      onLoginSuccess(userEmail, userDisplayName);
    } catch (e: any) {
      console.error("Google Auth failed:", e);
      let errMsg = "";
      
      if (e.code === "auth/unauthorized-domain" || (e.message && e.message.includes("auth/unauthorized-domain"))) {
        const hostname = window.location.hostname;
        errMsg = `Firebase Error: unauthorized-domain\n\nTo allow Google Authentication, this host must be authorized in your Firebase Project:\n\n1. Go to Firebase Console > Authentication > Settings > Authorized domains.\n2. Click 'Add domain'.\n3. Add the following hostnames to the list:\n   • ${hostname}\n   • localhost\n\nOnce added, try to sign in again!`;
      } else if (e.code === "auth/popup-blocked" || e.code === "auth/cancelled-popup-request") {
        errMsg = "Google Auth failed. The sign-in popup was blocked by your browser. Please allow popups or click the 'Open in New Tab' button in the top right of the preview window.";
      } else if (e.code === "auth/operation-not-allowed") {
        errMsg = "Google Auth failed. Google Sign-In is not enabled yet in your Firebase Console. Please make sure Google is enabled as a Sign-In Provider in Firebase Auth.";
      } else if (window.self !== window.top) {
        errMsg = "Google Auth failed. Since the application is running inside a secure preview iframe, browser policies block authentication popups. Please click 'Open in New Tab' at the top-right of your preview screen to log in safely via Google!";
      } else {
        errMsg = `Google Auth failed: ${e.message || "Please make sure your Firebase configuration allows Google Authentication."}`;
      }
      
      setErrorInput(errMsg);
      setShowAuthModal(true); // Open the modal automatically to display the instructions
    } finally {
      setLoading(false);
    }
  };

  const handleTryDemo = () => {
    onLoginSuccess("demo.warrior@example.com", "Alex Eco-Warrior");
  };

  return (
    <div className="min-h-screen bg-slate-50/50 flex flex-col justify-between relative overflow-hidden font-sans">
      
      {/* Background Decorative Rings/Glow meshes */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-emerald-100/30 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-blue-100/20 rounded-full blur-[140px] pointer-events-none" />

      {/* Floating Graphic Widgets (Eco-Themed glassmorphism cards like the attached layout) */}
      
      {/* Widget A: Left-middle (Tree block) */}
      <motion.div 
        animate={{ y: [0, -12, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        className="absolute left-[6%] top-[24%] z-10 hidden md:flex items-center justify-center p-3.5 bg-white border border-slate-100 rounded-3xl shadow-[0_15px_30px_-5px_rgba(34,197,94,0.12)] bg-white/80 backdrop-blur-lg w-16 h-16 border-green-250/20"
      >
        <span className="text-3xl filter drop-shadow">🌲</span>
      </motion.div>

      {/* Widget B: Right-middle (Leaf block) */}
      <motion.div 
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        className="absolute right-[8%] top-[34%] z-10 hidden md:flex items-center justify-center p-3.5 bg-white border border-slate-100 rounded-3xl shadow-[0_15px_30px_-5px_rgba(59,130,246,0.12)] bg-white/80 backdrop-blur-lg w-16 h-16 border-blue-250/20"
      >
        <span className="text-3xl filter drop-shadow">🍃</span>
      </motion.div>

      {/* Widget C: Mid-bottom-left (Analytics Graph symbol) */}
      <motion.div 
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
        className="absolute left-[12%] bottom-[22%] z-10 hidden md:flex items-center justify-center p-3.5 bg-white border border-slate-100 rounded-3xl shadow-[0_15px_30px_-5px_rgba(245,158,11,0.12)] bg-white/80 backdrop-blur-lg w-16 h-16 border-amber-250/20"
      >
        <span className="text-3xl filter drop-shadow">📊</span>
      </motion.div>

      {/* Widget D: Mid-bottom-right (Users icon group symbol) */}
      <motion.div 
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 5.8, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
        className="absolute right-[12%] bottom-[12%] z-10 hidden md:flex items-center justify-center p-3.5 bg-white border border-slate-100 rounded-3xl shadow-[0_15px_30px_-5px_rgba(168,85,247,0.12)] bg-white/80 backdrop-blur-lg w-16 h-16 border-purple-250/20"
      >
        <span className="text-3xl filter drop-shadow">👥</span>
      </motion.div>

      {/* Widget E: Center-right (Earth / Globe symbol) */}
      <motion.div 
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 4.8, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        className="absolute right-[22%] top-[48%] z-10 hidden md:flex items-center justify-center p-3 bg-white border border-slate-100 rounded-2xl shadow-[0_10px_25px_-5px_rgba(16,185,129,0.1)] bg-white/80 backdrop-blur-lg w-14 h-14 border-emerald-250/20"
      >
        <span className="text-2xl filter drop-shadow">🌍</span>
      </motion.div>

      {/* Header Navigation Navbar */}
      <header className="w-full max-w-7xl mx-auto px-6 py-6 flex items-center justify-between shrink-0 relative z-20 select-none">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-emerald-600 flex items-center justify-center text-white shadow-md shadow-emerald-600/20">
            <Leaf className="w-5 h-5 fill-white/10" />
          </div>
          <span className="font-sans font-extrabold text-slate-900 tracking-tight text-lg">EcoTracker</span>
        </div>

        <button 
          onClick={() => {
            setAuthMode("login");
            setShowAuthModal(true);
          }}
          className="font-sans font-semibold text-slate-800 text-xs px-5 py-2.5 rounded-full border border-slate-200 bg-white hover:bg-slate-50 transition-all shadow-xs cursor-pointer focus:outline-none"
        >
          Sign In
        </button>
      </header>

      {/* Hero Center Block */}
      <main className="flex-1 flex flex-col items-center justify-center text-center px-6 relative z-10 py-10">
        
        {/* Gemini Badge */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-emerald-50 border border-emerald-200/50 rounded-full px-4 py-1.5 flex items-center gap-1.5 mb-7 shadow-xs w-fit select-none"
        >
          <span className="text-[12px]">🍃</span>
          <span className="text-[11px] font-sans font-bold text-emerald-800 tracking-wide uppercase">Built with Gemini AI & Verified Carbon Data</span>
        </motion.div>

        {/* Big Bold Headline */}
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-4xl sm:text-6xl font-black text-slate-900 tracking-tighter leading-[1.05] max-w-3xl mb-6 select-none"
        >
          Your Intelligent Guide to <span className="text-emerald-700 font-extrabold relative inline-block">Net-Zero Living</span>
        </motion.h1>

        {/* Description Subtitle */}
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-slate-500 font-sans font-medium text-sm sm:text-base max-w-xl leading-relaxed mb-10 select-none"
        >
          Powered by Gemini AI and science-backed environmental guidelines. 
          Audit your consumption habits, optimize transit paths, log green milestones, and offset emissions instantly.
        </motion.p>

        {/* Buttons Action Group */}
        <motion.div 
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center gap-4 w-full justify-center max-w-md px-4"
        >
          {/* Continue with Google Mock Action Button */}
          <button 
            onClick={handleGoogleSubmit}
            className="w-full sm:w-auto bg-[#1a2e5a] hover:bg-[#122144] text-white text-xs sm:text-[13px] font-bold px-7 py-3.5 rounded-full shadow-md shadow-[#1a2e5a]/10 hover:shadow-lg transition-all flex items-center justify-center gap-2.5 cursor-pointer border-none"
          >
            {/* Google Vector Icon */}
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#EA4335"
                d="M12.24 10.285V13.4h6.887c-.275 1.565-1.88 4.6-6.887 4.6-4.33 0-7.859-3.578-7.859-8s3.53-8 7.859-8c2.46 0 4.105 1.025 5.047 1.926l2.427-2.334C17.955 1.157 15.34 0 12.24 0 5.58 0 .24 5.34.24 12s5.34 12 12 12c6.958 0 11.57-4.89 11.57-11.785 0-.79-.086-1.39-.19-1.93H12.24z"
              />
            </svg>
            Continue with Google
          </button>

          {/* Get Started Free Email Trigger Button */}
          <button 
            onClick={() => {
              setAuthMode("signup");
              setShowAuthModal(true);
            }}
            className="w-full sm:w-auto bg-white hover:bg-slate-50 border border-slate-200 text-slate-800 text-xs sm:text-[13px] font-bold px-7 py-3.5 rounded-full shadow-xs hover:shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer"
          >
            Get Started Free <ArrowRight className="w-4 h-4 text-slate-500" />
          </button>
        </motion.div>

        {/* Subtle sub text caption */}
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="text-[11px] text-slate-400 font-sans tracking-wide mt-4 select-none"
        >
          Free for all citizens. No credit cards or billing required. Or, check out as a <button onClick={handleTryDemo} className="text-emerald-600 hover:text-emerald-500 font-bold underline cursor-pointer bg-transparent border-none p-0 focus:outline-none">Guest Explorer</button>.
        </motion.p>
      </main>

      {/* Bottom Large Horizontal Stats Card Grid Layout */}
      <footer className="w-full max-w-5xl mx-auto px-6 pb-12 shrink-0 relative z-20">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.4 }}
          className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-[0_15px_40px_-10px_rgba(15,23,42,0.06)] grid grid-cols-2 md:grid-cols-4 gap-6 items-center select-none"
        >
          {/* Stat 1 */}
          <div className="text-center md:border-r border-slate-100 last:border-0 py-2">
            <h3 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">4.8 Tons</h3>
            <p className="text-[10px] font-bold font-sans text-slate-400 tracking-wider uppercase mt-1">Average CO2 / Capita</p>
          </div>

          {/* Stat 2 */}
          <div className="text-center md:border-r border-slate-100 last:border-0 py-2">
            <h3 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">150+</h3>
            <p className="text-[10px] font-bold font-sans text-slate-400 tracking-wider uppercase mt-1">Verified Eco-Actions</p>
          </div>

          {/* Stat 3 */}
          <div className="text-center md:border-r border-slate-100 last:border-0 py-2">
            <h3 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">2030</h3>
            <p className="text-[10px] font-bold font-sans text-slate-400 tracking-wider uppercase mt-1">Net-Zero Time Horizon</p>
          </div>

          {/* Stat 4 */}
          <div className="text-center last:border-0 py-2">
            <h3 className="text-2xl sm:text-3xl font-black text-emerald-700 tracking-tight">100%</h3>
            <p className="text-[10px] font-bold font-sans text-slate-400 tracking-wider uppercase mt-1">Free & Science-Backed</p>
          </div>
        </motion.div>
      </footer>

      {/* Modal Overlay glass structure for authentication */}
      <AnimatePresence>
        {showAuthModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            
            {/* Dark glass backdrop element */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-950/40 backdrop-blur-xs"
              onClick={() => setShowAuthModal(false)}
            />

            {/* Modal Body card */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="relative bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 shadow-2xl max-w-sm w-full z-10 flex flex-col gap-6"
            >
              
              {/* Header inside Modal */}
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 tracking-tight uppercase">
                    {authMode === "login" ? "Welcome Back" : "Create Account"}
                  </h3>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    {authMode === "login" ? "Enter details to resume tracker logs" : "Start saving carbon points today"}
                  </p>
                </div>
                <button 
                  onClick={() => setShowAuthModal(false)}
                  className="text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-all p-1.5 rounded-xl cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Form elements */}
              <form onSubmit={handleAuthSubmit} className="space-y-4 font-sans">
                
                {/* Input Name field - inside Sign-up Mode only */}
                {authMode === "signup" && (
                  <div>
                    <label className="block text-[10px] font-mono font-bold text-emerald-800 uppercase tracking-widest pl-1 mb-1">
                      Display Name
                    </label>
                    <div className="relative flex items-center">
                      <User className="absolute left-3.5 w-4 h-4 text-slate-400 pointer-events-none" />
                      <input 
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Alex Eco-Warrior"
                        className="w-full bg-slate-50 border border-slate-150 pl-10 pr-4 py-3 rounded-2xl text-xs outline-none focus:border-emerald-500 focus:bg-white text-slate-950 transition-all"
                        required={authMode === "signup"}
                      />
                    </div>
                  </div>
                )}

                {/* Input Email field */}
                <div>
                  <label className="block text-[10px] font-mono font-bold text-emerald-800 uppercase tracking-widest pl-1 mb-1">
                    Email Address
                  </label>
                  <div className="relative flex items-center">
                    <Mail className="absolute left-3.5 w-4 h-4 text-slate-400 pointer-events-none" />
                    <input 
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="alex@ecowarrior.org"
                      className="w-full bg-slate-50 border border-slate-150 pl-10 pr-4 py-3 rounded-2xl text-xs outline-none focus:border-emerald-500 focus:bg-white text-slate-950 transition-all"
                      required
                    />
                  </div>
                </div>

                {/* Form Input Error line */}
                {errorInput && (
                  <div className="bg-rose-50 border border-rose-100 rounded-xl p-3 text-[10.5px] text-rose-600 font-medium leading-relaxed whitespace-pre-wrap text-left">
                    {errorInput}
                  </div>
                )}

                {/* Action Submit button */}
                <button 
                  type="submit"
                  disabled={loading}
                  className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:bg-emerald-300 text-white font-bold text-xs py-3.5 rounded-2xl shadow-md shadow-emerald-600/10 transition-all flex items-center justify-center gap-1.5 cursor-pointer border-none"
                >
                  {loading ? (
                    <span>Verifying authentication...</span>
                  ) : (
                    <>
                      <span>{authMode === "login" ? "Sign In" : "Initialize Account"}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>

                {/* Divider */}
                <div className="relative flex py-1.5 items-center">
                  <div className="flex-grow border-t border-slate-100"></div>
                  <span className="flex-shrink mx-3 text-[9px] font-mono text-slate-400 uppercase tracking-widest">or</span>
                  <div className="flex-grow border-t border-slate-100"></div>
                </div>

                {/* Google Sign In option inside modal */}
                <button 
                  type="button"
                  onClick={handleGoogleSubmit}
                  disabled={loading}
                  className="w-full bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 font-bold text-xs py-3 rounded-2xl transition-all flex items-center justify-center gap-2.5 cursor-pointer"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path
                      fill="#EA4335"
                      d="M12.24 10.285V13.4h6.887c-.275 1.565-1.88 4.6-6.887 4.6-4.33 0-7.859-3.578-7.859-8s3.53-8 7.859-8c2.46 0 4.105 1.025 5.047 1.926l2.427-2.334C17.955 1.157 15.34 0 12.24 0 5.58 0 .24 5.34.24 12s5.34 12 12 12c6.958 0 11.57-4.89 11.57-11.785 0-.79-.086-1.39-.19-1.93H12.24z"
                    />
                  </svg>
                  <span>Continue with Google</span>
                </button>
              </form>

              {/* Toggle switch between login / signup modes */}
              <div className="text-center border-t border-slate-100 pt-4 flex flex-col gap-2">
                <p className="text-[11.5px] text-slate-500">
                  {authMode === "login" ? "New to EcoTracker? " : "Already have an account? "}
                  <button 
                    type="button"
                    onClick={() => {
                      setErrorInput("");
                      setAuthMode(authMode === "login" ? "signup" : "login");
                    }}
                    className="text-emerald-600 hover:text-emerald-500 hover:underline font-extrabold focus:outline-none cursor-pointer bg-transparent border-none p-0 inline-block"
                  >
                    {authMode === "login" ? "Register Free" : "Log In"}
                  </button>
                </p>

                {/* Quick Demo Access Trigger */}
                <div className="mt-1 flex items-center justify-center gap-1.5 text-[11px] text-slate-400 bg-slate-50 border border-slate-150 p-2.5 rounded-xl">
                  <span>Want to seed fake values?</span>
                  <button 
                    onClick={handleTryDemo}
                    className="text-emerald-700 hover:text-emerald-600 font-bold hover:underline focus:outline-none cursor-pointer bg-transparent border-none p-0 inline-block"
                  >
                    Load Demo Account
                  </button>
                </div>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
