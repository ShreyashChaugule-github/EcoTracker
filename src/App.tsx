import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import axios from "axios";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell 
} from "recharts";
import { 
  Plus, 
  Trash2, 
  AlertCircle, 
  Leaf, 
  Trophy, 
  TrendingDown, 
  Info, 
  Download,
  Flame,
  LayoutGrid,
  CheckCircle,
  Lightbulb,
  CornerDownRight,
  X
} from "lucide-react";

// Shared Interfaces
import { 
  UserProfile, 
  CarbonLog, 
  SustainabilityStats, 
  LeaderboardUser,
  CarbonCategory
} from "./types";

// Modular Components
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import CarbonCoach from "./components/CarbonCoach";
import ActionPlan from "./components/ActionPlan";
import TransitCalculator from "./components/TransitCalculator";
import OffsetsPanel from "./components/OffsetsPanel";
import EarthSimulator from "./components/EarthSimulator";
import AssessmentReport from "./components/AssessmentReport";
import LandingPage from "./components/LandingPage";

export default function App() {
  const [currentTab, setCurrentTab] = useState("dashboard");
  const [dashboardSubTab, setDashboardSubTab] = useState("analytics"); // "analytics", "offsets_tab", "simulation_tab"

  // User Authentication / Context Identity (Loads saved profile or triggers the Landing Page)
  const [userId, setUserId] = useState<string>(() => {
    try {
      return localStorage.getItem("ecoTracker_userId") || "";
    } catch {
      return "";
    }
  });

  const [profile, setProfile] = useState<UserProfile>(() => {
    let storedEmail = "demo.warrior@example.com";
    let storedName = "Alex Eco-Warrior";
    try {
      storedEmail = localStorage.getItem("ecoTracker_email") || storedEmail;
      storedName = localStorage.getItem("ecoTracker_name") || storedName;
    } catch {}

    const uid = ""; // will get set on landing
    return {
      id: uid,
      email: storedEmail,
      displayName: storedName,
      level: 1,
      totalXp: 100,
      currentStreak: 1,
      totalCo2Saved: 0.0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  });

  // Carbon Log Inputs
  const [logs, setLogs] = useState<CarbonLog[]>([]);
  const [stats, setStats] = useState<SustainabilityStats>({
    sustainabilityScore: 50,
    rating: "D",
    monthlyEmissions: 853,
    co2Prevented: 84.5,
    co2Offset: 250,
    distribution: {
      transportation: 324,
      food: 223,
      electricity: 113,
      waste: 28,
      shopping: 103,
      water: 62
    },
    trend: [
      { month: "Jan", emissions: 700 },
      { month: "Feb", emissions: 680 },
      { month: "Mar", emissions: 650 },
      { month: "Apr", emissions: 610 },
      { month: "May", emissions: 570 },
      { month: "Jun", emissions: 853 }
    ]
  });

  const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>([
    { displayName: "Alex Eco-Warrior (You)", level: 3, totalCo2Saved: 334.5, totalXp: 5450 },
    { displayName: "Sophia Green", level: 5, totalCo2Saved: 210.5, totalXp: 3950 },
    { displayName: "Ethan Solars", level: 4, totalCo2Saved: 145.0, totalXp: 2850 },
    { displayName: "Liam Wind-Power", level: 2, totalCo2Saved: 72.0, totalXp: 1200 },
    { displayName: "Mia Bicycle-Hero", level: 2, totalCo2Saved: 44.5, totalXp: 950 }
  ]);

  // Daily Logging Form State
  const [logCategory, setLogCategory] = useState<CarbonCategory>("transportation");
  const [logAmount, setLogAmount] = useState<string>("20");
  const [logDate, setLogDate] = useState<string>(new Date().toISOString().substring(0, 10));
  const [logFormLoading, setLogFormLoading] = useState(false);

  // Custom Toast and Dialog states for Sandboxed Frame compatibility
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "info" } | null>(null);
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  } | null>(null);

  const showToast = (message: string, type: "success" | "error" | "info" = "success") => {
    setToast({ message, type });
  };

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // Load backend variables on boot
  useEffect(() => {
    if (userId) {
      syncUserData();
    }
  }, [userId]);

  const syncUserData = async () => {
    if (!userId) return;
    try {
      // 1. Sync User profile attributes
      const profRes = await axios.get(`/api/profile/${userId}?email=${profile.email}&displayName=${profile.displayName}`);
      setProfile(profRes.data);

      // 2. Load latest category logs
      const logRes = await axios.get(`/api/carbon/logs/${userId}`);
      setLogs(logRes.data);

      // 3. Load stats calculations from REST API
      const statsRes = await axios.get(`/api/carbon/stats/${userId}`);
      setStats(statsRes.data);

      // 4. Load public leaderboards
      const leadRes = await axios.get("/api/leaderboard");
      if (leadRes.data && leadRes.data.length > 0) {
        setLeaderboard(leadRes.data);
      }
    } catch (err) {
      console.warn("Express backend sync warnings. Operating in mock continuity for preview frameworks.", err);
    }
  };

  const handleLoginSuccess = async (email: string, displayName: string) => {
    const cleanId = email.replace(/[^a-zA-Z0-9]/g, "-").toLowerCase();
    try {
      localStorage.setItem("ecoTracker_userId", cleanId);
      localStorage.setItem("ecoTracker_email", email);
      localStorage.setItem("ecoTracker_name", displayName);
    } catch (e) {
      console.warn("Storage write failed due to security sandbox", e);
    }

    setUserId(cleanId);
    setProfile({
      id: cleanId,
      email: email,
      displayName: displayName,
      level: 1,
      totalXp: 100,
      currentStreak: 1,
      totalCo2Saved: 0.0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
    showToast(`Welcome back, ${displayName}!`, "success");
  };

  const handleLogout = () => {
    try {
      localStorage.removeItem("ecoTracker_userId");
      localStorage.removeItem("ecoTracker_email");
      localStorage.removeItem("ecoTracker_name");
    } catch (e) {
      console.warn("Storage clear failed due to security sandbox", e);
    }
    setUserId("");
    setLogs([]);
    showToast("Signed out successfully. Have a green day!", "info");
  };

  const handleCreateLog = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(logAmount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      showToast("Invalid numeric carbon category amount input.", "error");
      return;
    }

    try {
      setLogFormLoading(true);
      const payload = {
        userId,
        date: logDate,
        category: logCategory,
        amount: parsedAmount
      };

      const res = await axios.post("/api/carbon/logs", payload);
      setLogs(prev => [res.data, ...prev]);
      
      // Reset inputs & refresh dashboard totals
      setLogAmount("");
      showToast(`Logged footprint entry successfully! You earned +20 XP.`, "success");
      await syncUserData();
    } catch (err) {
      console.error(err);
      showToast("Error adding footprint log record to backend.", "error");
    } finally {
      setLogFormLoading(false);
    }
  };

  const handleDeleteLog = (logId: string) => {
    setConfirmModal({
      isOpen: true,
      title: "Delete Footprint Log",
      message: "Are you sure you want to permanently delete this footprint event record from your tracker history ledger?",
      onConfirm: async () => {
        try {
          await axios.delete(`/api/carbon/logs/${logId}`);
          setLogs(prev => prev.filter(l => l.id !== logId));
          showToast("Footprint event record removed successfully.", "success");
          await syncUserData();
        } catch (err) {
          console.error(err);
          showToast("Failed to delete log from Firestore.", "error");
        }
      }
    });
  };

  // Callback whenever complete checks are checked/logged
  const handleActionCompleted = async (savedCo2: number) => {
    await syncUserData();
  };

  // Recharts Pie Colors Match Configuration
  const COLORS: Record<CarbonCategory, string> = {
    transportation: "#10b981", // Green
    food: "#f59e0b", // Orange-yellow
    electricity: "#3b82f6", // Blue
    waste: "#8b5cf6", // Purple
    shopping: "#ef4444", // Red
    water: "#06b6d4" // Cyan
  };

  const pieData = Object.entries(stats.distribution).map(([key, val]) => ({
    name: key.toUpperCase(),
    value: Number(val),
    color: COLORS[key as CarbonCategory] || "#10b981"
  })).filter(item => Number(item.value) > 0);

  // If no visual logged entries, render a dummy pie distribution for aesthetic purposes
  const finalPieData = pieData.length > 0 ? pieData : [
    { name: "TRANSPORTATION", value: 324, color: "#10b981" },
    { name: "FOOD", value: 223, color: "#f59e0b" },
    { name: "ELECTRICITY", value: 113, color: "#3b82f6" },
    { name: "WASTE", value: 28, color: "#8b5cf6" },
    { name: "SHOPPING", value: 103, color: "#ef4444" },
    { name: "WATER", value: 62, color: "#06b6d4" }
  ];

  // Map category placeholders
  const unitLabels: Record<CarbonCategory, string> = {
    transportation: "Kilometers (km)",
    food: "Meals Eaten",
    electricity: "Kilowatt Hours (kWh)",
    waste: "Kilograms (kg)",
    shopping: "Manufactured Items Purchased",
    water: "Liters Used"
  };

  if (!userId) {
    return (
      <LandingPage onLoginSuccess={handleLoginSuccess} />
    );
  }

  return (
    <div id="app-root-container" className="flex h-screen bg-[#F8FAFC] text-slate-700 font-sans overflow-hidden">
      {/* Sidebar Navigation */}
      <Sidebar 
        currentTab={currentTab} 
        setCurrentTab={setCurrentTab} 
        userLevel={profile.level} 
      />

      {/* Main Panel Frame */}
      <main id="main-panel-frame" className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Horizontal Header Banner */}
        <Header 
          displayName={profile.displayName} 
          level={profile.level} 
          totalXp={profile.totalXp} 
          streak={profile.currentStreak} 
          onLogout={handleLogout}
        />

        {/* Content Panel Section */}
        <section id="content-panel-section" className="flex-1 overflow-y-auto p-6">
          
          {/* TAB 1: MASTER DASHBOARD PANEL */}
          {currentTab === "dashboard" && (
            <div id="tab-dashboard" className="space-y-6 animate-fadeIn">
              
              {/* Dashboard SubTab horizontal menu selectors */}
              <div id="subtab-selector" className="flex justify-between items-center border-b border-slate-200 pb-3 select-none">
                <div>
                  <h1 className="text-xl font-bold font-sans tracking-tight text-slate-900">Carbon Analytics Dashboard</h1>
                  <p className="text-xs text-slate-500 mt-0.5">View footprint metrics, offsite offset projects, and Earth simulations.</p>
                </div>
                <div className="flex bg-slate-100 border border-slate-200 p-1 rounded-xl">
                  <button
                    onClick={() => setDashboardSubTab("analytics")}
                    className={`px-4 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
                      dashboardSubTab === "analytics" ? "bg-emerald-600 text-white shadow-xs" : "text-slate-500 hover:text-slate-900"
                    }`}
                  >
                    Analytics & Habits
                  </button>
                  <button
                    onClick={() => setDashboardSubTab("offsets_tab")}
                    className={`px-4 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
                      dashboardSubTab === "offsets_tab" ? "bg-emerald-600 text-white shadow-xs" : "text-slate-500 hover:text-slate-900"
                    }`}
                  >
                    Carbon Offsets
                  </button>
                  <button
                    onClick={() => setDashboardSubTab("simulation_tab")}
                    className={`px-4 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
                      dashboardSubTab === "simulation_tab" ? "bg-emerald-600 text-white shadow-xs" : "text-slate-500 hover:text-slate-900"
                    }`}
                  >
                    Earth Simulator
                  </button>
                </div>
              </div>

              {/* VIEW A: ANALYTICS & HABITS MAIN LAYOUT */}
              {dashboardSubTab === "analytics" && (
                <div id="analytics-master-layout" className="space-y-6">
                  {/* Performance stats grid */}
                  <div className="grid grid-cols-4 gap-4">
                    {/* Stat Card 1 */}
                    <div className="bg-white border border-slate-200 rounded-2xl p-4 select-none relative group overflow-hidden shadow-xs">
                      <p className="text-[10px] font-mono font-bold text-slate-450 uppercase tracking-widest mb-1.5">Sustainability Score</p>
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-3xl font-extrabold text-emerald-600">{stats.sustainabilityScore}</span>
                        <span className="text-xs text-slate-500">/100</span>
                      </div>
                      <span className="text-[11px] text-emerald-600 font-mono block mt-2 font-semibold">Rating: {stats.rating}</span>
                      <div className="absolute right-3 bottom-3 w-5 h-5 opacity-15 group-hover:opacity-30 transition-opacity"><Leaf className="text-emerald-500" /></div>
                    </div>

                    {/* Stat Card 2 */}
                    <div className="bg-white border border-slate-200 rounded-2xl p-4 select-none relative group overflow-hidden shadow-xs">
                      <p className="text-[10px] font-mono font-bold text-slate-450 uppercase tracking-widest mb-1.5">Monthly Emissions</p>
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-3xl font-extrabold text-slate-900">{stats.monthlyEmissions}</span>
                        <span className="text-xs text-slate-500">kg</span>
                      </div>
                      <span className="text-[11px] text-slate-500 font-mono block mt-2">CO2 equivalent output</span>
                    </div>

                    {/* Stat Card 3 */}
                    <div className="bg-white border border-slate-200 rounded-2xl p-4 select-none relative group overflow-hidden shadow-xs">
                      <p className="text-[10px] font-mono font-bold text-slate-450 uppercase tracking-widest mb-1.5">Total CO2 Prevented</p>
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-3xl font-extrabold text-emerald-600">{profile.totalCo2Saved || stats.co2Prevented}</span>
                        <span className="text-xs text-slate-500">kg</span>
                      </div>
                      <span className="text-[11px] text-emerald-600 font-mono block mt-2 font-semibold">Earned from Eco Action</span>
                    </div>

                    {/* Stat Card 4 */}
                    <div className="bg-white border border-slate-200 rounded-2xl p-4 select-none relative group overflow-hidden shadow-xs">
                      <p className="text-[10px] font-mono font-bold text-slate-450 uppercase tracking-widest mb-1.5">Total CO2 Offset</p>
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-3xl font-extrabold text-blue-600">{stats.co2Offset}</span>
                        <span className="text-xs text-slate-500">kg</span>
                      </div>
                      <span className="text-[11px] text-blue-600 font-mono block mt-2 font-semibold font-semibold">Funded contributions</span>
                    </div>
                  </div>

                  {/* Core interactive section: Add footprint form + Recharts visualizations */}
                  <div className="grid grid-cols-12 gap-6 items-start">
                    
                    {/* Add daily log entry form (Col 4) */}
                    <div className="col-span-4 bg-white border border-slate-200 p-5 rounded-3xl self-start shadow-xs">
                      <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3 flex items-center gap-2 select-none">
                        <Plus className="w-4 h-4 text-emerald-600" /> Log Footprint today
                      </h3>
                      <form onSubmit={handleCreateLog} className="space-y-4">
                        {/* Selector Category */}
                        <div>
                          <label className="block text-[10px] font-mono font-semibold text-emerald-700 uppercase tracking-wide mb-1 select-none">
                            Category type
                          </label>
                          <select
                            value={logCategory}
                            onChange={(e) => setLogCategory(e.target.value as CarbonCategory)}
                            className="w-full bg-slate-50 text-xs text-slate-800 border border-slate-200 p-2.5 rounded-xl outline-none"
                          >
                            <option value="transportation">🚗 Transportation (Driving)</option>
                            <option value="food">🍔 Food Habits (Meals count)</option>
                            <option value="electricity">⚡ Electricity Utility (kWh)</option>
                            <option value="waste">🗑️ Household Waste (kg)</option>
                            <option value="shopping">🛍️ Retail Shopping (Items)</option>
                            <option value="water">💧 Water Consumption (Liters)</option>
                          </select>
                        </div>

                        {/* Input amount */}
                        <div>
                          <label className="block text-[10px] font-mono font-semibold text-emerald-700 uppercase tracking-wide mb-1 select-none">
                            Amount: {unitLabels[logCategory]}
                          </label>
                          <input
                            type="number"
                            step="0.1"
                            value={logAmount}
                            onChange={(e) => setLogAmount(e.target.value)}
                            placeholder="e.g. 25"
                            className="w-full bg-slate-50 text-xs text-slate-900 border border-slate-200 p-2.5 rounded-xl outline-none"
                            required
                          />
                        </div>

                        {/* Log date */}
                        <div>
                          <label className="block text-[10px] font-mono font-semibold text-emerald-700 uppercase tracking-wide mb-1 select-none">
                            Date of event
                          </label>
                          <input
                            type="date"
                            value={logDate}
                            onChange={(e) => setLogDate(e.target.value)}
                            className="w-full bg-slate-50 text-xs text-slate-900 border border-slate-200 p-2.5 rounded-xl outline-none"
                            required
                          />
                        </div>

                        <button
                          type="submit"
                          disabled={logFormLoading}
                          className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:bg-emerald-300 text-white py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-sm"
                        >
                          <Leaf className="w-3.5 h-3.5" /> {logFormLoading ? "Submitting to database..." : "Submit Footprint Log"}
                        </button>
                      </form>
                    </div>

                    {/* Monthly Emissions Trend Recharts Bar (Col 8) */}
                    <div className="col-span-8 bg-white border border-slate-200 p-5 rounded-3xl h-[330px] flex flex-col justify-between shadow-xs">
                      <div className="flex items-center justify-between select-none pb-2">
                        <div>
                          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Monthly Emissions Trend</h3>
                          <p className="text-[10px] text-slate-500">Carbon equivalent footprint progress over past 6 months.</p>
                        </div>
                        <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-250 flex items-center gap-1 font-semibold">
                          <TrendingDown className="w-3" /> -12% overall
                        </span>
                      </div>

                      <div className="grow w-full mt-2">
                        <ResponsiveContainer width="100%" height={210}>
                           <BarChart data={stats.trend} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                            <XAxis dataKey="month" stroke="#64748b" fontSize={10} tickLine={false} />
                            <YAxis stroke="#64748b" fontSize={10} tickLine={false} />
                            <Tooltip 
                              cursor={false}
                              contentStyle={{ backgroundColor: "#ffffff", borderColor: "#e2e8f0", borderRadius: "12px", fontSize: "10.5px", color: "#1e293b", boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.05)" }} 
                              labelStyle={{ color: "#059669", fontWeight: "bold" }}
                            />
                            <Bar dataKey="emissions" fill="#059669" activeBar={{ fill: '#34d399' }} radius={[4, 4, 0, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                  </div>

                  {/* Secondary Horizontal visualization: Category Breakdown Pie + AI Habit Detector + Leaderboard */}
                  <div className="grid grid-cols-12 gap-6 items-start">
                    {/* Category Donut chart (Col 5) */}
                    <div className="col-span-5 bg-white border border-slate-200 p-5 rounded-3xl h-[360px] flex flex-col justify-between shadow-xs">
                      <div className="select-none">
                        <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Carbon Breakdown By Category</h3>
                        <p className="text-[10px] text-slate-500">Distribution of carbon emissions by source</p>
                      </div>

                      <div className="flex items-center justify-around grow gap-4">
                        <div className="w-36 h-36 relative shrink-0">
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Pie
                                data={finalPieData}
                                innerRadius={42}
                                outerRadius={54}
                                paddingAngle={3}
                                dataKey="value"
                              >
                                {finalPieData.map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                              </Pie>
                            </PieChart>
                          </ResponsiveContainer>
                          {/* absolute center text label */}
                          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none select-none">
                            <span className="text-[9px] font-mono font-bold text-slate-400 uppercase">CO2 Net</span>
                            <span className="text-sm font-extrabold text-slate-900 text-center">{stats.monthlyEmissions}kg</span>
                          </div>
                        </div>

                        {/* Legends custom list */}
                        <div className="space-y-1.5 text-[9px] font-mono text-slate-600 w-full">
                          {finalPieData.map((e, idx) => (
                            <div key={idx} className="flex items-center justify-between">
                              <span className="flex items-center gap-1.5 truncate max-w-[80px]">
                                <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: e.color }} />
                                <span className="truncate">{e.name.substring(0, 10)}</span>
                              </span>
                              <span className="text-slate-900 font-bold ml-1">{e.value}kg</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* AI Habit Detector list (Col 4) */}
                    <div className="col-span-4 bg-white border border-slate-200 p-5 rounded-3xl h-[360px] flex flex-col justify-between overflow-hidden shadow-xs">
                      <div className="select-none pb-2 border-b border-slate-100">
                        <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                          <Flame className="w-4 h-4 text-orange-500 fill-orange-500 animate-pulse" /> AI Habit Detector
                        </h3>
                        <p className="text-[10px] text-slate-500">Emissions distribution analysis vs ideal limits</p>
                      </div>

                      <div className="grow overflow-y-auto space-y-3.5 my-3 pr-1">
                        {/* transportation limits */}
                        <div>
                          <div className="flex justify-between text-[11px] mb-1">
                            <span className="text-slate-700 font-medium">Transportation</span>
                            <span className="text-orange-600 font-bold font-mono">38% Limit</span>
                          </div>
                          <div className="w-full h-1 bg-slate-100 rounded-full overflow-hidden">
                            <div className="bg-red-500 h-full rounded-full" style={{ width: "38%" }} />
                          </div>
                          <p className="text-[9.5px] text-slate-500 mt-1 flex items-start gap-1">
                            <Lightbulb className="w-3 text-emerald-600 shrink-0 mt-0.5" /> Switch to walking or hybrid/electric commutes.
                          </p>
                        </div>

                        {/* diet limits */}
                        <div>
                          <div className="flex justify-between text-[11px] mb-1">
                            <span className="text-slate-700 font-medium">Food Habits</span>
                            <span className="text-emerald-700 font-bold font-mono">26% limit</span>
                          </div>
                          <div className="w-full h-1 bg-slate-100 rounded-full overflow-hidden">
                            <div className="bg-emerald-500 h-full rounded-full" style={{ width: "26%" }} />
                          </div>
                          <p className="text-[9.5px] text-slate-500 mt-1 flex items-start gap-1">
                            <Lightbulb className="w-3 text-emerald-600 shrink-0 mt-0.5" /> Reduce red meat; prioritize organic produce.
                          </p>
                        </div>

                        {/* electricity limits */}
                        <div>
                          <div className="flex justify-between text-[11px] mb-1">
                            <span className="text-slate-700 font-medium">Electricity</span>
                            <span className="text-emerald-700 font-bold font-mono">13% limit</span>
                          </div>
                          <div className="w-full h-1 bg-slate-100 rounded-full overflow-hidden">
                            <div className="bg-emerald-500 h-full rounded-full" style={{ width: "13%" }} />
                          </div>
                          <p className="text-[9.5px] text-slate-500 mt-1 flex items-start gap-1">
                            <Lightbulb className="w-3 text-emerald-600 shrink-0 mt-0.5" /> Unplug vampires, transition to solar farms.
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Community Leaderboard (Col 3) */}
                    <div className="col-span-3 bg-white border border-slate-200 p-5 rounded-3xl h-[360px] flex flex-col justify-between shadow-xs">
                      <div className="select-none pb-2 border-b border-slate-100">
                        <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                          <Trophy className="w-4 h-4 text-emerald-600" /> Eco Leaderboard
                        </h3>
                        <p className="text-[10px] text-slate-500">XP and CO2 savings compared locally</p>
                      </div>

                      <div className="grow overflow-y-auto space-y-2.5 my-3 pr-1">
                        {leaderboard.map((user, idx) => (
                          <div 
                            key={idx}
                            className={`flex items-center justify-between p-2 rounded-xl border ${
                              idx === 0 ? "bg-emerald-50/70 border-emerald-200" : "bg-slate-50 border-slate-150"
                            }`}
                          >
                            <div className="flex items-center gap-1.5 truncate">
                              <span className="text-[10px] font-mono font-bold text-emerald-700">#{idx + 1}</span>
                              <div className="truncate">
                                <p className="text-[10.5px] font-bold text-slate-900 truncate leading-relaxed">{user.displayName.split(" ")[0]}</p>
                                <span className="text-[9px] text-slate-500 font-mono">Lvl {user.level} Expert</span>
                              </div>
                            </div>
                            <span className="text-[10px] font-mono text-emerald-700 font-bold shrink-0 ml-1">
                              {user.totalCo2Saved.toFixed(0)}kg
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                  </div>

                  {/* Logs Ledger Management Table */}
                  <div className="bg-white border border-slate-200 p-5 rounded-3xl select-none shadow-xs">
                    <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">Your Tracked Carbon events</h3>
                    {logs.length === 0 ? (
                      <p className="text-xs text-slate-400 font-mono italic">No footprint logs registered yet today. Add travel or grid energy logs above to calibrate.</p>
                    ) : (
                      <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                        {logs.map((log) => (
                          <div key={log.id} className="text-xs text-slate-600 flex items-center justify-between bg-slate-50 px-3.5 py-2.5 rounded-xl border border-slate-150 hover:border-emerald-250 transition-colors">
                            <span className="flex items-center gap-2 text-slate-800">
                              <span className="capitalize text-[10px] font-mono bg-emerald-50 text-emerald-700 border border-emerald-250 rounded px-1.5 py-0.5">{log.category}</span>
                              <span>Date: {log.date} ({log.amount} units)</span>
                            </span>
                            <div className="flex items-center gap-3">
                              <span className="font-mono text-emerald-700 font-extrabold">+{log.calculatedCo2} kg</span>
                              <button 
                                onClick={() => handleDeleteLog(log.id)}
                                className="text-slate-400 hover:text-red-500 transition-colors cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* VIEW B: OFFSETS TAB FOR DASHBOARD */}
              {dashboardSubTab === "offsets_tab" && (
                <OffsetsPanel 
                  userId={userId} 
                  onOffsetFunded={handleActionCompleted} 
                  showToast={showToast}
                />
              )}

              {/* VIEW C: EARTH SIMULATION TAB FOR DASHBOARD */}
              {dashboardSubTab === "simulation_tab" && (
                <EarthSimulator />
              )}

            </div>
          )}

          {/* TAB 2: AI ASSESSMENT REPORT PANEL */}
          {currentTab === "assessment" && (
            <AssessmentReport userId={userId} />
          )}

          {/* TAB 3: DAILY ECO ACTION PLAN PLAN */}
          {currentTab === "action_plan" && (
            <ActionPlan 
              userId={userId} 
              onActionCompleted={handleActionCompleted} 
              showToast={showToast}
            />
          )}

          {/* TAB 4: CHATS WITH AI CARBON COACH */}
          {currentTab === "coach" && (
            <CarbonCoach userId={userId} />
          )}

          {/* TAB 5: TRANSIT COMPARATOR */}
          {currentTab === "transit" && (
            <TransitCalculator onAvoidedCarbonLogged={handleActionCompleted} showToast={showToast} />
          )}

          {/* TAB 6: CLIMATE LEARNING HUB */}
          {currentTab === "learning" && (
            <div id="learning-hub-panel" className="bg-white border border-slate-200 p-6 rounded-3xl h-[calc(100vh-140px)] flex flex-col justify-between overflow-hidden animate-fadeIn select-none shadow-xs">
              <div className="shrink-0 border-b border-slate-150 pb-3 mb-4">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  Climate Knowledge Learning Hub <Leaf className="w-4 h-4 text-emerald-600 animate-spin" style={{ animationDuration: "12s" }} />
                </h3>
                <p className="text-[10px] text-slate-500">Demystifying climate science terms and simple everyday metrics</p>
              </div>

              <div className="grow overflow-y-auto grid grid-cols-3 gap-4 pr-1 py-1">
                {/* Fact 1 */}
                <div className="p-4 bg-slate-50 border border-slate-150 rounded-2xl flex flex-col justify-between">
                  <div>
                    <span className="text-xl">📊</span>
                    <h4 className="text-xs font-bold text-slate-900 mt-2">What is CO2e?</h4>
                    <p className="text-[10.5px] leading-relaxed text-slate-600 mt-1">
                      Carbon Dioxide Equivalent (CO2e) is a unit footprint wrapping multiple greenhouse gases (like nitrous oxide, methane) relative to their global warming potential.
                    </p>
                  </div>
                  <span className="text-[9px] font-mono text-emerald-700 mt-2 block font-semibold">CO2 INTEGRITY STANDARD</span>
                </div>

                {/* Fact 2 */}
                <div className="p-4 bg-slate-50 border border-slate-150 rounded-2xl flex flex-col justify-between">
                  <div>
                    <span className="text-xl">🌳</span>
                    <h4 className="text-xs font-bold text-slate-900 mt-2">How much CO2 sinks into a tree?</h4>
                    <p className="text-[10.5px] leading-relaxed text-slate-600 mt-1">
                      A fully mature hardwood tree absorbs roughly 22 kg of carbon dioxide from the atmosphere over the course of an annual growth cycle, embedding it as sugar and wood tissue.
                    </p>
                  </div>
                  <span className="text-[9px] font-mono text-emerald-700 mt-2 block font-semibold">CERTIFIED ECO DATA</span>
                </div>

                {/* Fact 3 */}
                <div className="p-4 bg-slate-50 border border-slate-150 rounded-2xl flex flex-col justify-between">
                  <div>
                    <span className="text-xl">🚗</span>
                    <h4 className="text-xs font-bold text-slate-900 mt-2">The Commute Dilemma</h4>
                    <p className="text-[10.5px] leading-relaxed text-slate-600 mt-1">
                      Trading driving for standard public transit buses immediately reduces transportation footprint by over 75%, making urban grids highly resilient.
                    </p>
                  </div>
                  <span className="text-[9px] font-mono text-emerald-700 mt-2 block font-semibold">URBAN DENSITY RESILIENCE</span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 7: VALIDATION HUB & DOWNLOAD ZIP */}
          {currentTab === "validation" && (
            <div id="validation-hub-panel" className="bg-white border border-slate-200 p-6 rounded-3xl h-[calc(100vh-140px)] flex flex-col justify-between overflow-hidden animate-fadeIn shadow-xs">
              <div className="shrink-0 border-b border-slate-150 pb-3 mb-4 select-none">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  Validation Hub & Download Center <Info className="w-4.5 h-4.5 text-emerald-600" />
                </h3>
                <p className="text-[10px] text-slate-500">Verify emission factors, review validation rules, and export your complete full-stack project ZIP</p>
              </div>

              {/* Grid content */}
              <div className="grow overflow-y-auto grid grid-cols-2 gap-6 pr-1 select-none">
                {/* Code Quality Validators */}
                <div className="space-y-4">
                  <h4 className="text-[10px] font-mono text-slate-400 uppercase tracking-widest pl-1">API Conversion Guard Algorithms</h4>
                  <div className="bg-slate-50 border border-slate-150 rounded-2xl p-4 text-xs font-mono space-y-2 text-slate-600">
                    <p className="font-bold text-emerald-700 text-xs">🔬 Standardized Factor Rules:</p>
                    <div className="flex items-start gap-1"><CornerDownRight className="w-3.5 shrink-0 mt-0.5" /> <span>Gasoline travel: 0.18 kg CO2/km</span></div>
                    <div className="flex items-start gap-1"><CornerDownRight className="w-3.5 shrink-0 mt-0.5" /> <span>Electricity utility: 0.45 kg CO2/kWh</span></div>
                    <div className="flex items-start gap-1"><CornerDownRight className="w-3.5 shrink-0 mt-0.5" /> <span>Meat and Food: 1.5 kg CO2/meal</span></div>
                    <div className="flex items-start gap-1"><CornerDownRight className="w-3.5 shrink-0 mt-0.5" /> <span>Domestic waste: 0.5 kg CO2/kg</span></div>
                    <div className="flex items-start gap-1"><CornerDownRight className="w-3.5 shrink-0 mt-0.5" /> <span>Domestic water: 0.001 kg CO2/liter</span></div>
                  </div>
                </div>

                {/* Download section  */}
                <div className="bg-slate-50 border border-slate-150 rounded-2xl p-5 flex flex-col justify-between items-center text-center">
                  <div className="py-4">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-250 text-emerald-600 flex items-center justify-center mx-auto mb-3">
                      <Download className="w-6 h-6 animate-pulse" />
                    </div>
                    <h5 className="text-xs font-bold text-slate-900 mb-1.5 uppercase tracking-wide">Export & Download Complete Project ZIP</h5>
                    <p className="text-[10.5px] leading-relaxed text-slate-500 max-w-xs mx-auto">
                      Generate and compress the complete full-stack application (combining Express Node.js Server API, React/Vite layout, types, and security rules), packaged immediately on-the-fly.
                    </p>
                  </div>

                  {/* Direct link to serve compiled backend zip file */}
                  <a
                    href="/api/download-zip"
                    download="ecotracker-project.zip"
                    className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-5 py-3 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs w-full"
                  >
                    <Download className="w-4 h-4 shrink-0" /> Download ecotracker-project.zip
                  </a>
                </div>
              </div>

            </div>
          )}

        </section>
      </main>

      {/* Dynamic Floating Toast System Notification Overlay */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            id="toast-notification-panel"
            className="fixed bottom-6 right-6 z-50 max-w-sm flex items-start gap-3 bg-white border border-slate-200 p-4 rounded-2xl shadow-xl select-none"
          >
            <div className={`mt-0.5 w-5 h-5 rounded-full flex items-center justify-center text-[10px] shrink-0 font-bold ${
              toast.type === "success" 
                ? "bg-emerald-50 text-emerald-600 border border-emerald-250" 
                : toast.type === "error"
                  ? "bg-rose-50 text-rose-600 border border-rose-250"
                  : "bg-amber-50 text-amber-600 border border-amber-250"
            }`}>
              {toast.type === "success" ? "✓" : toast.type === "error" ? "✕" : "i"}
            </div>
            <div className="flex-1">
              <p className="text-[11.5px] font-semibold text-slate-800 leading-tight">
                {toast.type === "success" ? "Success" : toast.type === "error" ? "Warning Alert" : "Information Notice"}
              </p>
              <p className="text-[10.5px] text-slate-500 mt-0.5 leading-normal">{toast.message}</p>
            </div>
            <button 
              onClick={() => setToast(null)}
              className="text-slate-400 hover:text-slate-600 transition-colors p-0.5 rounded-lg hover:bg-slate-50 shrink-0 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Dynamic Animated Interactive Confirmation Dialog Modal Overlay */}
      <AnimatePresence>
        {confirmModal && confirmModal.isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 select-none">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setConfirmModal(null)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs"
            />
            {/* Modal Box */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ duration: 0.18, ease: "easeOut" }}
              className="relative bg-white border border-slate-200 rounded-3xl max-w-md w-full p-6 shadow-2xl flex flex-col gap-4 z-10"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-amber-50 border border-amber-250 text-amber-600 flex items-center justify-center">
                    <AlertCircle className="w-4 h-4" />
                  </div>
                  <h4 className="text-sm font-bold text-slate-900">{confirmModal.title}</h4>
                </div>
                <button
                  onClick={() => setConfirmModal(null)}
                  className="text-slate-400 hover:text-slate-600 transition-colors p-1 rounded-xl hover:bg-slate-50 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <p className="text-[11.5px] text-slate-600 leading-relaxed font-normal">
                {confirmModal.message}
              </p>

              <div className="flex items-center gap-3 justify-end mt-2">
                <button
                  onClick={() => setConfirmModal(null)}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs px-4 py-2.5 rounded-xl transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    confirmModal.onConfirm();
                    setConfirmModal(null);
                  }}
                  className="bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition-all cursor-pointer shadow-xs"
                >
                  Confirm Delete
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
