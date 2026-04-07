import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Users, 
  Truck, 
  MapPin, 
  BarChart3, 
  UserCheck, 
  Phone,
  Mail,
  Plus,
  Edit,
  Eye,
  AlertTriangle,
  CheckCircle,
  Clock,
  LayoutDashboard,
  Users2,
  Navigation,
  LineChart,
  LogOut,
  ShieldCheck,
  Zap,
  XCircle,
  FileText,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  HelpCircle,
  BookOpen,
  Info
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import MapComponent from "./MapComponent";
import smartBinLogo from "@/assets/smart-bin-logo.png";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const AdminDashboard = ({ onLogout, user }: { onLogout?: () => void; user?: { name: string; email: string; role: string } }) => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const { toast } = useToast();
  
  const [allPickups, setAllPickups] = useState<any[]>([]);
  const [residents, setResidents] = useState<any[]>([]);
  const [collectors, setCollectors] = useState<any[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);
  const [mapFocus, setMapFocus] = useState<[number, number] | undefined>(undefined);
  
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newCollector, setNewCollector] = useState({ name: '', email: '', phone: '', zone: 'Zone A', password: 'collector123' });

  const fetchData = async () => {
    try {
      const headers = { 'X-Requested-With': 'XMLHttpRequest' };
      const options = { credentials: 'include' as const, headers };

      const [pRes, rRes, cRes, aRes] = await Promise.all([
        fetch(`${API_URL}/api.php?action=get-all-pickups`, options),
        fetch(`${API_URL}/api.php?action=get-residents`, options),
        fetch(`${API_URL}/api.php?action=get-all-collectors`, options),
        fetch(`${API_URL}/api.php?action=get-analytics`, options)
      ]);

      const [pJson, rJson, cJson, aJson] = await Promise.all([pRes.json(), rRes.json(), cRes.json(), aRes.json()]);

      if (pJson.success) setAllPickups(pJson.pickups);
      if (rJson.success) setResidents(rJson.residents);
      if (cJson.success) setCollectors(cJson.collectors);
      if (aJson.success) setAnalytics(aJson);

    } catch (error) {
      console.error("Failed to fetch admin data:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleTrack = (coords: [number, number]) => {
    setMapFocus(coords);
    setActiveTab('tracking');
    toast({ title: "Map Focused", description: "Centering on tracked entity." });
  };

  const handleUpdateResidentStatus = async (residentId: number, status: string) => {
    try {
      const response = await fetch('http://localhost:8000/api.php?action=update-resident-status', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: residentId, status }),
      });
      const result = await response.json();
      if (result.success) {
        toast({ title: `Resident ${status.charAt(0).toUpperCase() + status.slice(1)}` });
        fetchData();
      }
    } catch (error) {
      toast({ title: "Operation Failed", variant: "destructive" });
    }
  };

  const handleAddCollector = async () => {
    try {
      const response = await fetch('http://localhost:8000/api.php?action=add-collector', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newCollector),
      });
      const result = await response.json();
      if (result.success) {
        toast({ title: "Collector Added" });
        setIsAddModalOpen(false);
        fetchData();
      }
    } catch (error) {
       toast({ title: "Failed", variant: "destructive" });
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50 w-full overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-[#166534] text-white flex flex-col justify-between shrink-0 shadow-xl">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-10">
            <img src={smartBinLogo} alt="Smart Bin" className="w-10 h-10 rounded-full bg-white p-0.5" />
            <h2 className="text-xl font-bold tracking-tight">Smart Bin</h2>
          </div>
          <nav className="space-y-2">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
              { id: 'collectors', label: 'Manage Collectors', icon: Truck },
              { id: 'residents', label: 'Approve Residents', icon: Users2 },
              { id: 'tracking', label: 'Live Tracking', icon: Navigation },
              { id: 'analytics', label: 'Analytics', icon: LineChart },
              { id: 'guide', label: 'System Guide', icon: BookOpen },
            ].map((item) => (
              <button 
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-3 w-full p-3 rounded-lg font-medium transition-all ${activeTab === item.id ? 'bg-[#22c55e] text-white shadow-lg' : 'hover:bg-white/10 text-white/80'}`}
              >
                <item.icon size={20} /> {item.label}
              </button>
            ))}
          </nav>
        </div>
        
        <div className="p-6 border-t border-white/10">
          <div className="flex flex-col gap-1 mb-4">
            <span className="font-bold text-sm">{user?.name ?? 'Admin User'}</span>
            <span className="text-xs text-white/60 lowercase">{user?.email ?? 'admin@smartbin.com'}</span>
          </div>
          <button onClick={onLogout} className="flex items-center gap-2 text-white/80 hover:text-white transition-colors text-sm font-semibold">
            <LogOut size={16} /> Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-7xl mx-auto h-full">
          
          {/* Dashboard Tab */}
          {activeTab === 'dashboard' && (
            <div className="space-y-8 animate-in fade-in duration-500">
              <h1 className="text-4xl font-black text-gray-900">Admin Dashboard</h1>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card className="bg-[#f0fdf4] border-2 border-[#dcfce7] rounded-3xl p-6">
                  <p className="text-[#15803d] text-sm font-black uppercase tracking-widest mb-1">Active Collectors</p>
                  <h3 className="text-4xl font-black text-[#166534]">{collectors.filter(c => c.status === 'Active').length}</h3>
                  <Badge className="bg-[#22c55e] text-white mt-2">ON DUTY</Badge>
                </Card>
                <Card className="bg-[#eff6ff] border-2 border-[#dbeafe] rounded-3xl p-6">
                  <p className="text-[#1d4ed8] text-sm font-black uppercase tracking-widest mb-1">Residents</p>
                  <h3 className="text-4xl font-black text-[#1e3a8a]">{residents.length}</h3>
                  <Badge className="bg-[#3b82f6] text-white mt-2">REGISTERED</Badge>
                </Card>
                <Card className="bg-[#fff7ed] border-2 border-[#ffedd5] rounded-3xl p-6">
                  <p className="text-[#c2410c] text-sm font-black uppercase tracking-widest mb-1">Daily Waste</p>
                  <h3 className="text-4xl font-black text-[#9a3412]">15.2</h3>
                  <Badge className="bg-[#f97316] text-white mt-2">TONS</Badge>
                </Card>
                <Card className="bg-[#faf5ff] border-2 border-[#f3e8ff] rounded-3xl p-6">
                  <p className="text-[#7e22ce] text-sm font-black uppercase tracking-widest mb-1">Efficiency</p>
                  <h3 className="text-4xl font-black text-[#581c87]">94%</h3>
                  <Badge className="bg-[#a855f7] text-white mt-2">THIS WEEK</Badge>
                </Card>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div onClick={() => setActiveTab('analytics')} className="bg-gradient-to-br from-[#22c55e] to-[#3b82f6] p-10 rounded-[32px] text-white shadow-xl cursor-pointer hover:scale-[1.02] transition-transform">
                   <ShieldCheck className="w-12 h-12 mb-6" />
                   <h3 className="text-3xl font-black mb-4">Environmental Impact</h3>
                   <p className="text-xl font-medium text-white/90">450 tons recycled this month. View full analytics report.</p>
                </div>
                <div onClick={() => setActiveTab('guide')} className="bg-gradient-to-br from-[#a855f7] to-[#ec4899] p-10 rounded-[32px] text-white shadow-xl cursor-pointer hover:scale-[1.02] transition-transform">
                   <HelpCircle className="w-12 h-12 mb-6" />
                   <h3 className="text-3xl font-black mb-4">How it Works</h3>
                   <p className="text-xl font-medium text-white/90">Explore the complete system guide for administrators and residents.</p>
                </div>
              </div>
            </div>
          )}

          {/* Collectors Tab */}
          {activeTab === 'collectors' && (
            <div className="space-y-8 animate-in slide-in-from-right-8 duration-500">
               <div className="flex justify-between items-center">
                <h1 className="text-4xl font-black text-gray-900">Manage Collectors</h1>
                <Button onClick={() => setIsAddModalOpen(true)} className="bg-[#22c55e] text-white font-bold px-8 py-6 rounded-2xl shadow-lg">
                  <Plus className="mr-2" /> Add New Collector
                </Button>
              </div>
              <Card className="rounded-[32px] overflow-hidden border-none shadow-sm">
                <table className="w-full text-left">
                  <thead className="bg-gray-50 text-gray-400 text-xs font-black uppercase tracking-widest">
                    <tr><th className="px-8 py-5">Name</th><th className="px-8 py-5">Zone</th><th className="px-8 py-5">Vehicle</th><th className="px-8 py-5">Actions</th></tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {collectors.map(c => (
                      <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-8 py-6 font-black text-gray-900">{c.name}</td>
                        <td className="px-8 py-6"><Badge className="bg-blue-50 text-blue-700">{c.zone}</Badge></td>
                        <td className="px-8 py-6 font-bold text-gray-400">{c.vehicle_number}</td>
                        <td className="px-8 py-6">
                           <Button onClick={() => handleTrack([18.6298, 73.7997])} variant="ghost" className="rounded-xl font-bold text-[#166534]">Track Live</Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </Card>
            </div>
          )}

          {/* Residents Tab */}
          {activeTab === 'residents' && (
            <div className="space-y-8 animate-in slide-in-from-right-8 duration-500">
              <h1 className="text-4xl font-black text-gray-900">Resident Management</h1>
              <div className="grid grid-cols-1 gap-6">
                {residents.map((r) => (
                  <Card key={r.id} className="p-8 rounded-[32px] border-none shadow-sm flex items-center justify-between">
                    <div className="flex items-center gap-6">
                      <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center font-black text-2xl">{r.name.charAt(0)}</div>
                      <div>
                        <h3 className="text-2xl font-black text-gray-900">{r.name}</h3>
                        <p className="text-gray-500 font-bold">{r.email}</p>
                        <Badge className="bg-orange-50 text-orange-700 mt-2">{r.status.toUpperCase()}</Badge>
                      </div>
                    </div>
                    <div className="flex gap-4">
                      {r.status === 'pending' && <Button onClick={() => handleUpdateResidentStatus(r.id, 'approved')} className="bg-[#22c55e] px-10 py-6 rounded-2xl shadow-lg">Approve</Button>}
                      <Button onClick={() => handleTrack([18.6350, 73.8050])} variant="outline" className="px-10 py-6 rounded-2xl font-bold border-2">Locate</Button>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Analytics Tab - Matching Screenshot exactly */}
          {activeTab === 'analytics' && (
            <div className="space-y-8 animate-in slide-in-from-right-8 duration-500">
               <h1 className="text-4xl font-black text-gray-900">Waste Analytics</h1>
               
               <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                  {/* Left: Donut Chart Section */}
                  <Card className="lg:col-span-8 p-12 rounded-[40px] border-none shadow-xl bg-white flex flex-col items-center">
                     <h3 className="text-2xl font-black text-gray-900 mb-12 self-start">Waste Collection Breakdown</h3>
                     
                     <div className="relative w-80 h-80 rounded-full mb-12 flex items-center justify-center shadow-2xl group transition-all"
                        style={{ background: 'conic-gradient(#166534 0% 55%, #3b82f6 55% 85%, #ef4444 85% 95%, #a855f7 95% 100%)' }}>
                        <div className="absolute inset-0 rounded-full border-[30px] border-white/20 group-hover:scale-105 transition-transform" />
                        <div className="w-48 h-48 bg-white rounded-full flex flex-col items-center justify-center shadow-inner relative z-10">
                           <span className="text-5xl font-black text-gray-900">269</span>
                           <span className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">Total Units</span>
                        </div>
                     </div>

                     <div className="flex flex-wrap justify-center gap-8 mt-4">
                        <div className="flex items-center gap-2"><div className="w-3 h-3 bg-[#166534] rounded-full" /><span className="text-sm font-bold text-gray-500">Wet Waste</span></div>
                        <div className="flex items-center gap-2"><div className="w-3 h-3 bg-[#3b82f6] rounded-full" /><span className="text-sm font-bold text-gray-500">Dry Waste</span></div>
                        <div className="flex items-center gap-2"><div className="w-3 h-3 bg-[#ef4444] rounded-full" /><span className="text-sm font-bold text-gray-500">Hazardous</span></div>
                        <div className="flex items-center gap-2"><div className="w-3 h-3 bg-[#a855f7] rounded-full" /><span className="text-sm font-bold text-gray-500">E-Waste</span></div>
                     </div>
                  </Card>

                  {/* Right: Monthly Trends Sidebar */}
                  <div className="lg:col-span-4 space-y-6">
                     <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-2">Monthly Trends</h3>
                     
                     <Card className="p-6 bg-[#f0fdf4] border-none rounded-3xl group cursor-pointer hover:shadow-lg transition-all border-l-8 border-[#166534]">
                        <div className="flex justify-between items-start">
                           <div>
                              <p className="text-[#15803d] text-xs font-black uppercase mb-1">Wet Waste</p>
                              <h4 className="text-3xl font-black text-[#166534]">145 tons</h4>
                              <p className="text-[#22c55e] text-xs font-bold flex items-center gap-1 mt-1"><ArrowUpRight size={14} /> +12% from last month</p>
                           </div>
                           <BarChart3 className="text-[#166534] opacity-20 w-8 h-8" />
                        </div>
                     </Card>

                     <Card className="p-6 bg-[#eff6ff] border-none rounded-3xl group cursor-pointer hover:shadow-lg transition-all border-l-8 border-[#1e3a8a]">
                        <div className="flex justify-between items-start">
                           <div>
                              <p className="text-[#1d4ed8] text-xs font-black uppercase mb-1">Dry Waste</p>
                              <h4 className="text-3xl font-black text-[#1e3a8a]">89 tons</h4>
                              <p className="text-[#3b82f6] text-xs font-bold flex items-center gap-1 mt-1"><ArrowUpRight size={14} /> +8% from last month</p>
                           </div>
                           <PieChartIcon className="text-[#1e3a8a] opacity-20 w-8 h-8" />
                        </div>
                     </Card>

                     <Card className="p-6 bg-[#fff7ed] border-none rounded-3xl group cursor-pointer hover:shadow-lg transition-all border-l-8 border-[#9a3412]">
                        <div className="flex justify-between items-start">
                           <div>
                              <p className="text-[#c2410c] text-xs font-black uppercase mb-1">Hazardous</p>
                              <h4 className="text-3xl font-black text-[#9a3412]">23 tons</h4>
                              <p className="text-[#ef4444] text-xs font-bold flex items-center gap-1 mt-1"><ArrowDownRight size={14} /> -5% from last month</p>
                           </div>
                           <AlertTriangle className="text-[#9a3412] opacity-20 w-8 h-8" />
                        </div>
                     </Card>

                     <Card className="p-6 bg-[#faf5ff] border-none rounded-3xl group cursor-pointer hover:shadow-lg transition-all border-l-8 border-[#581c87]">
                        <div className="flex justify-between items-start">
                           <div>
                              <p className="text-[#7e22ce] text-xs font-black uppercase mb-1">E-Waste</p>
                              <h4 className="text-3xl font-black text-[#581c87]">12 tons</h4>
                              <p className="text-[#a855f7] text-xs font-bold flex items-center gap-1 mt-1"><ArrowUpRight size={14} /> +25% from last month</p>
                           </div>
                           <Zap className="text-[#581c87] opacity-20 w-8 h-8" />
                        </div>
                     </Card>
                  </div>
               </div>
            </div>
          )}

          {/* System Guide Tab */}
          {activeTab === 'guide' && (
            <div className="space-y-8 animate-in slide-in-from-right-8 duration-500">
               <h1 className="text-4xl font-black text-gray-900">System Guide</h1>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-gray-700">
                  <div className="space-y-6">
                     <h3 className="text-2xl font-black text-[#166534] flex items-center gap-3"><Users2 /> For Administrators</h3>
                     <div className="p-8 bg-white rounded-3xl border border-gray-100 space-y-4">
                        <div className="flex gap-4"><div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center font-bold text-green-700 shrink-0">1</div><p className="font-medium">Approve residents to give them platform access.</p></div>
                        <div className="flex gap-4"><div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center font-bold text-green-700 shrink-0">2</div><p className="font-medium">Manage collectors and assign trucks to specific zones.</p></div>
                        <div className="flex gap-4"><div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center font-bold text-green-700 shrink-0">3</div><p className="font-medium">Use 'Live Tracking' to monitor real-time collection progress.</p></div>
                        <div className="flex gap-4"><div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center font-bold text-green-700 shrink-0">4</div><p className="font-medium">Review 'Waste Analytics' to measure municipal efficiency.</p></div>
                     </div>
                  </div>
                  <div className="space-y-6">
                     <h3 className="text-2xl font-black text-[#2563eb] flex items-center gap-3"><Truck /> For Field Collectors</h3>
                     <div className="p-8 bg-white rounded-3xl border border-gray-100 space-y-4">
                        <div className="flex gap-4"><div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center font-bold text-blue-700 shrink-0">1</div><p className="font-medium">Check 'Pending Pickups' for new resident requests.</p></div>
                        <div className="flex gap-4"><div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center font-bold text-blue-700 shrink-0">2</div><p className="font-medium">Use 'Enroute' to see the navigation path to the bin.</p></div>
                        <div className="flex gap-4"><div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center font-bold text-blue-700 shrink-0">3</div><p className="font-medium">Mark as 'Accepted' and 'Done' to update the system.</p></div>
                        <div className="flex gap-4"><div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center font-bold text-blue-700 shrink-0">4</div><p className="font-medium">Observe 'Route Progress' bar to track your daily mission.</p></div>
                     </div>
                  </div>
               </div>
            </div>
          )}

          {/* Live Tracking Tab */}
          {activeTab === 'tracking' && (
            <div className="h-full flex flex-col space-y-6 animate-in slide-in-from-right-8 duration-500">
              <h1 className="text-4xl font-black text-gray-900">Live Fleet Tracking</h1>
              <div className="flex-1 overflow-hidden bg-white p-4 rounded-[40px] shadow-2xl border border-gray-100 min-h-[600px] relative">
                  <MapComponent height="100%" focus={mapFocus} />
                  {mapFocus && (
                    <Button 
                      onClick={() => setMapFocus(undefined)}
                      className="absolute top-8 right-8 bg-[#166534] text-white font-bold p-4 rounded-xl z-10 shadow-lg"
                    >
                      Reset View
                    </Button>
                  )}
              </div>
            </div>
          )}
        </div>
      </main>

      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className="max-w-md bg-white rounded-3xl p-8 border-none shadow-2xl">
          <DialogHeader><DialogTitle className="text-3xl font-black mb-4">Add Collector</DialogTitle></DialogHeader>
          <div className="space-y-4 py-4">
            <Input placeholder="Full Name" value={newCollector.name} onChange={e => setNewCollector({...newCollector, name: e.target.value})} className="rounded-2xl py-6 border-2" />
            <Input placeholder="Email Address" value={newCollector.email} onChange={e => setNewCollector({...newCollector, email: e.target.value})} className="rounded-2xl py-6 border-2" />
            <Input placeholder="Phone Number" value={newCollector.phone} onChange={e => setNewCollector({...newCollector, phone: e.target.value})} className="rounded-2xl py-6 border-2" />
            <Input placeholder="Zone (e.g. Zone A)" value={newCollector.zone} onChange={e => setNewCollector({...newCollector, zone: e.target.value})} className="rounded-2xl py-6 border-2" />
          </div>
          <DialogFooter>
            <Button onClick={handleAddCollector} className="w-full bg-[#166534] text-white font-black py-7 rounded-2xl text-lg">Create Account</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

// Help icon component
const PieChartIcon = ({ className }: { className?: string }) => (
  <svg className={className} width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21.21 15.89A10 10 0 1 1 8 2.83" /><path d="M22 12A10 10 0 0 0 12 2v10z" /></svg>
);

export default AdminDashboard;