import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  MapPin, 
  Clock, 
  Truck, 
  CheckCircle, 
  User,
  Phone,
  Navigation,
  Package,
  Calendar,
  AlertCircle,
  LayoutDashboard,
  Send,
  LogOut,
  Bell
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import MapComponent from "./MapComponent";
import smartBinLogo from "@/assets/smart-bin-logo.png";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const CollectorDashboard = ({ onLogout, user }: { onLogout?: () => void; user?: { name: string; email: string; role: string } }) => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const { toast } = useToast();
  const [pendingRequests, setPendingRequests] = useState<any[]>([]);
  const [collectorData, setCollectorData] = useState<any>(null);
  const [isEnroute, setIsEnroute] = useState(false);

  const fetchData = async () => {
    try {
      // Fetch all pickups
      const pResponse = await fetch(`${API_URL}/api.php?action=get-all-pickups`, {
        credentials: 'include',
        headers: { 'X-Requested-With': 'XMLHttpRequest' }
      });
      const pResult = await pResponse.json();
      if (pResult.success) {
        setPendingRequests(pResult.pickups);
      }

      // Fetch collector specific info (vehicle, route)
      const sResponse = await fetch(`${API_URL}/api.php?action=get-collector-stats`, {
        credentials: 'include',
        headers: { 'X-Requested-With': 'XMLHttpRequest' }
      });
      const sResult = await sResponse.json();
      if (sResult.success) {
        setCollectorData(sResult);
      }
    } catch (error) {
      console.error("Failed to fetch collector data:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleUpdateStatus = async (requestId: number, status: string) => {
    try {
      const response = await fetch('http://localhost:8000/api.php?action=update-pickup-status', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pickup_id: requestId, status: status }),
      });
      const result = await response.json();
      if (result.success) {
        toast({
          title: status === 'enroute' ? "Navigation Started" : "Status Updated",
          description: status === 'enroute' ? "Live path shown on map." : `Pickup marked as ${status}.`,
        });
        if (status === 'enroute') {
          setActiveTab('route');
        }
        fetchData();
      }
    } catch (error) {
      toast({ title: "Update Failed", variant: "destructive" });
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50 w-full overflow-hidden">
      {/* Premium Green Sidebar matching screenshot */}
      <aside className="w-64 bg-[#166534] text-white flex flex-col justify-between shrink-0 shadow-xl">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-10">
            <img src={smartBinLogo} alt="Smart Bin Logo" className="w-10 h-10 rounded-full bg-white object-cover shadow-sm p-0.5" />
            <h2 className="text-xl font-bold tracking-tight">Smart Bin</h2>
          </div>
          <nav className="space-y-2">
            <button 
              onClick={() => setActiveTab('dashboard')}
              className={`flex items-center gap-3 w-full p-3 rounded-lg font-medium transition-all duration-200 ${activeTab === 'dashboard' ? 'bg-[#22c55e] text-white shadow-lg translate-x-1' : 'hover:bg-white/10 text-white/80'}`}
            >
              <LayoutDashboard size={20} /> Dashboard
            </button>
            <button 
              onClick={() => setActiveTab('requests')}
              className={`flex items-center gap-3 w-full p-3 rounded-lg font-medium transition-all duration-200 ${activeTab === 'requests' ? 'bg-[#22c55e] text-white shadow-lg translate-x-1' : 'hover:bg-white/10 text-white/80'}`}
            >
              <Bell size={20} /> Pickup Requests
            </button>
            <button 
              onClick={() => setActiveTab('route')}
              className={`flex items-center gap-3 w-full p-3 rounded-lg font-medium transition-all duration-200 ${activeTab === 'route' ? 'bg-[#22c55e] text-white shadow-lg translate-x-1' : 'hover:bg-white/10 text-white/80'}`}
            >
              <Navigation size={20} /> Assigned Route
            </button>
          </nav>
        </div>
        
        <div className="p-6 border-t border-white/10">
          <div className="flex flex-col gap-1 mb-4">
            <span className="font-bold text-sm">{user?.name ?? 'Collector Name'}</span>
            <span className="text-xs text-white/60 lowercase">{user?.email ?? 'collector@smartbin.com'}</span>
          </div>
          <button 
            onClick={onLogout} 
            className="flex items-center gap-2 text-white/80 hover:text-white transition-colors text-sm font-semibold group"
          >
            <LogOut size={16} className="group-hover:-translate-x-1 transition-transform" /> Logout
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-8 overflow-y-auto">
        {activeTab === 'dashboard' && (
          <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div>
              <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight mb-2">Welcome, {user?.name?.split(' ')[0] ?? 'John'}!</h1>
              <p className="text-gray-500 text-lg">Here's your collection overview for today.</p>
            </div>

            {/* Status Cards - 4 Column Layout from Screenshot */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {/* Pending */}
              <div className="bg-[#eff6ff] border border-[#dbeafe] rounded-2xl p-6 shadow-sm flex justify-between items-center group hover:shadow-md transition-shadow">
                <div>
                  <p className="text-[#1d4ed8] text-sm font-bold uppercase tracking-wider mb-2">Pending</p>
                  <h3 className="text-[#1e3a8a] text-4xl font-black mb-1">{collectorData?.stats?.pending_count ?? 0}</h3>
                  <p className="text-[#3b82f6] text-sm font-medium">Requests</p>
                </div>
                <div className="w-14 h-14 bg-white/50 rounded-full flex items-center justify-center border border-[#3b82f6]/20">
                  <Bell className="h-7 w-7 text-[#1d4ed8]" />
                </div>
              </div>

              {/* Completed */}
              <div className="bg-[#f0fdf4] border border-[#dcfce7] rounded-2xl p-6 shadow-sm flex justify-between items-center group hover:shadow-md transition-shadow">
                <div>
                  <p className="text-[#15803d] text-sm font-bold uppercase tracking-wider mb-2">Completed</p>
                  <h3 className="text-[#166534] text-4xl font-black mb-1">{collectorData?.stats?.completed_today ?? 0}</h3>
                  <p className="text-[#22c55e] text-sm font-medium">Today</p>
                </div>
                <div className="w-14 h-14 bg-white/50 rounded-full flex items-center justify-center border border-[#22c55e]/20">
                  <CheckCircle className="h-7 w-7 text-[#15803d]" />
                </div>
              </div>

              {/* Route Progress */}
              <div className="bg-[#fff7ed] border border-[#ffedd5] rounded-2xl p-6 shadow-sm flex justify-between items-center group hover:shadow-md transition-shadow">
                <div>
                  <p className="text-[#c2410c] text-sm font-bold uppercase tracking-wider mb-2">Route</p>
                  <h3 className="text-[#9a3412] text-4xl font-black mb-1">{collectorData?.route?.progress ?? 0}%</h3>
                  <p className="text-[#f97316] text-sm font-medium">Complete</p>
                </div>
                <div className="w-14 h-14 bg-white/50 rounded-full flex items-center justify-center border border-[#f97316]/20">
                  <Navigation className="h-7 w-7 text-[#c2410c]" />
                </div>
              </div>

              {/* Assigned Vehicle */}
              <div className="bg-[#faf5ff] border border-[#f3e8ff] rounded-2xl p-6 shadow-sm flex justify-between items-center group hover:shadow-md transition-shadow">
                <div>
                  <p className="text-[#7e22ce] text-sm font-bold uppercase tracking-wider mb-2">Vehicle</p>
                  <h3 className="text-[#581c87] text-3xl font-black mb-1">{collectorData?.vehicle?.vehicle_number ?? 'NONE'}</h3>
                  <p className="text-[#a855f7] text-sm font-medium">Assigned</p>
                </div>
                <div className="w-14 h-14 bg-white/50 rounded-full flex items-center justify-center border border-[#a855f7]/20">
                  <Truck className="h-7 w-7 text-[#7e22ce]" />
                </div>
              </div>
            </div>

            {/* Today's Mission Banner from Screenshot */}
            <div className="bg-gradient-to-br from-[#22c55e] to-[#16a34a] rounded-3xl p-10 shadow-xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-x-12 -translate-y-12 blur-3xl group-hover:scale-110 transition-transform duration-1000"></div>
              <div className="relative z-10 space-y-6">
                <div className="flex items-center gap-4 mb-4">
                  <span className="text-4xl filter drop-shadow-md">🚛</span>
                  <h2 className="text-white text-3xl font-black tracking-tight">Today's Mission</h2>
                </div>
                <p className="text-white/95 text-xl max-w-2xl leading-relaxed font-medium">
                  You're assigned to <span className="font-bold underline decoration-white/30 decoration-2 underline-offset-4">{collectorData?.route?.name ?? 'Your Assigned Route'}</span> with <span className="font-bold">{pendingRequests.filter(p => p.status === 'pending').length} scheduled pickups</span>. Current efficiency is at an all-time high!
                </p>
                <div className="flex flex-wrap gap-4 pt-4">
                  <Button 
                    onClick={() => setActiveTab('route')}
                    className="bg-white text-[#166534] hover:bg-gray-50 font-bold px-8 py-7 text-lg rounded-2xl transition-all shadow-lg hover:shadow-white/20 active:scale-95"
                  >
                    View Route Map
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => {
                      toast({
                        title: "Collection Started",
                        description: "Your assigned route is now active. markers are visible on the map.",
                      });
                    }}
                    className="bg-[#2563eb] text-white hover:bg-[#1d4ed8] border-none font-bold px-8 py-7 text-lg rounded-2xl transition-all shadow-lg hover:shadow-blue-500/20 active:scale-95"
                  >
                    Start Collection
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Pickup Requestscard layout from Screenshot */}
        {activeTab === 'requests' && (
          <div className="max-w-5xl mx-auto space-y-6 animate-in slide-in-from-right-8 duration-500">
            <h1 className="text-4xl font-black text-gray-900 mb-8">Pickup Requests</h1>
            <div className="space-y-6">
              {pendingRequests.length > 0 ? pendingRequests.map((request) => (
                <div 
                  key={request.id} 
                  className={`relative p-8 rounded-3xl border-2 transition-all hover:scale-[1.01] hover:shadow-xl ${
                    request.status === 'completed' 
                    ? 'bg-[#f0fdf4] border-[#dcfce7]' 
                    : request.id % 2 === 0 ? 'bg-[#fffbeb] border-[#fef3c7]' : 'bg-[#eff6ff] border-[#dbeafe]'
                  }`}
                >
                  <div className="flex flex-col md:flex-row justify-between gap-6">
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <Badge variant="outline" className={`px-3 py-1 font-bold rounded-full ${request.status === 'completed' ? 'bg-green-100 text-green-700 border-green-200' : request.status === 'enroute' ? 'bg-blue-100 text-blue-700 border-blue-200' : 'bg-yellow-100 text-yellow-700 border-yellow-200'}`}>
                          {request.status === 'completed' ? 'Completed' : request.status === 'enroute' ? 'Enroute' : 'High Priority'}
                        </Badge>
                        <span className="text-gray-400 font-mono text-sm tracking-widest uppercase">Req #{1000 + request.id}</span>
                      </div>
                      
                      <div>
                        <h3 className="text-2xl font-extrabold text-gray-900 mb-1">{request.resident_name || "Resident Name"}</h3>
                        <p className="text-gray-600 flex items-center gap-2 font-medium">
                          <MapPin className="h-4 w-4 text-gray-400" /> {request.address}
                        </p>
                      </div>

                      <div className="flex flex-wrap gap-6 text-sm text-gray-500 pt-2">
                        <div className="flex items-center gap-2 bg-white/50 px-3 py-1.5 rounded-full border border-gray-200">
                          <Phone className="h-4 w-4 text-green-600" /> <span className="font-bold text-gray-700">+91 {request.resident_phone || '98765 43210'}</span>
                        </div>
                        <div className="flex items-center gap-2 bg-white/50 px-3 py-1.5 rounded-full border border-gray-200">
                          <Package className="h-4 w-4 text-blue-600" /> <span className="font-medium text-gray-700">Waste Type: <span className="font-bold">{request.type}</span></span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex flex-col items-end justify-between min-w-[140px]">
                      <div className="text-right">
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">{request.status === 'completed' ? 'Completed' : 'Requested'}</p>
                        <p className="text-gray-900 font-black text-lg">Today, {request.scheduled_date ? new Date(request.scheduled_date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : '9:30 AM'}</p>
                      </div>

                      {request.status === 'completed' ? (
                         <div className="bg-white/80 p-3 rounded-2xl flex items-center gap-2 text-green-600 font-black border border-green-200 animate-in zoom-in-50 duration-300">
                           <CheckCircle className="h-5 w-5" /> DONE
                         </div>
                      ) : (
                        <div className="flex flex-col gap-2 w-full">
                          <Button 
                            onClick={() => handleUpdateStatus(request.id, 'enroute')}
                            className="bg-[#2563eb] hover:bg-[#1d4ed8] text-white font-black px-10 py-4 text-md rounded-2xl shadow-lg border-none active:scale-95 transition-all w-full"
                          >
                            Enroute
                          </Button>
                          <Button 
                            onClick={() => handleUpdateStatus(request.id, 'completed')}
                            className="bg-[#22c55e] hover:bg-[#16a34a] text-white font-black px-10 py-4 text-md rounded-2xl shadow-lg border-none active:scale-95 transition-all w-full"
                          >
                            Accept
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )) : (
                <div className="text-center p-20 bg-gray-100 rounded-3xl border-4 border-dashed border-gray-200">
                  <p className="text-2xl font-bold text-gray-400">No pending requests found.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Live Route Map Tab */}
        {activeTab === 'route' && (
          <div className="h-full space-y-6 animate-in slide-in-from-right-8 duration-500">
            <div className="flex justify-between items-center bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
              <div>
                <h1 className="text-3xl font-black text-gray-900 mb-1">Live Tracking</h1>
                <p className="text-gray-500 font-medium">{collectorData?.route?.name ?? 'Assigned Route'}</p>
              </div>
              <Badge className="bg-green-100 text-green-700 border-green-200 px-4 py-2 rounded-full text-sm font-bold">
                <Truck className="h-4 w-4 mr-2" /> EN ROUTE
              </Badge>
            </div>
            
            <div className="bg-white p-4 rounded-[40px] shadow-2xl border border-gray-100 h-[calc(100vh-280px)] min-h-[500px]">
              <MapComponent height="100%" zoom={15} center={[18.6298, 73.7997]} showPath={pendingRequests.some(r => r.status === 'enroute')} />
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default CollectorDashboard;