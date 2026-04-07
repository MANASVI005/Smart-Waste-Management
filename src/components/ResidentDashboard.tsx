import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { 
  Calendar, 
  Truck, 
  Star, 
  Send, 
  AlertTriangle,
  FileText,
  CheckCircle,
  LayoutDashboard,
  LogOut,
  Trophy,
  Info
} from "lucide-react";
import SegregationGame from "./SegregationGame";
import MapComponent from "./MapComponent";
import wasteSegregationImage from "@/assets/waste-segregation.png";
import smartBinLogo from "@/assets/smart-bin-logo.png";
import { useToast } from "@/hooks/use-toast";

interface ResidentDashboardProps {
  onLogout?: () => void;
  user?: { id?: number; name: string; email: string; role: string };
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const ResidentDashboard = ({ onLogout, user }: ResidentDashboardProps) => {
  const [isGameOpen, setIsGameOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("dashboard");
  const { toast } = useToast();
  const [upcomingPickups, setUpcomingPickups] = useState<any[]>([]);
  const [mapFocus, setMapFocus] = useState<[number, number] | undefined>(undefined);

  const fetchPickups = async () => {
    try {
      const response = await fetch(`${API_URL}/api.php?action=get-user-pickups`, {
        credentials: 'include',
        headers: { 'X-Requested-With': 'XMLHttpRequest' }
      });
      const result = await response.json();
      if (result.success) {
        setUpcomingPickups(result.pickups);
      }
    } catch (error) {
      console.error("Failed to fetch pickups:", error);
    }
  };

  useEffect(() => {
    fetchPickups();
  }, []);

  const handlePickupRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const payload = {
      type: formData.get('waste-type'),
      scheduled_date: formData.get('pickup-date'),
      address: formData.get('address'),
      instructions: formData.get('special-instructions'),
    };

    try {
      const response = await fetch(`${API_URL}/api.php?action=submit-pickup`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const result = await response.json();
      if (result.success) {
        toast({
          title: "Pickup Request Submitted",
          description: "Your waste pickup request has been saved in the database.",
        });
        // Refresh local pickup list without reloading the whole page
        fetchPickups();
        // Clear form
        (e.target as HTMLFormElement).reset();
        // Optional: Switch back to schedule tab to show the new entry
        setActiveTab('schedule');
      } else {
        throw new Error(result.error);
      }
    } catch (error: any) {
      toast({
        title: "Submission Failed",
        description: error.message || "Could not save pickup to database.",
        variant: "destructive",
      });
    }
  };

  const handleComplaintSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const payload = {
      type: formData.get('complaint-type'),
      location: formData.get('location'),
      description: formData.get('description'),
    };

    try {
      const response = await fetch(`${API_URL}/api.php?action=submit-complaint`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const result = await response.json();
      if (result.success) {
        toast({
          title: "Complaint Filed",
          description: "Your complaint has been saved in the database.",
        });
        (e.target as HTMLFormElement).reset();
      } else {
        throw new Error(result.error);
      }
    } catch (error: any) {
      toast({
        title: "Submission Failed",
        description: error.message || "Could not save complaint to database.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex min-h-screen bg-white w-full">
      {/* Sidebar */}
      <aside className="w-64 bg-[#166534] text-white flex flex-col justify-between shrink-0">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-10">
            <img src={smartBinLogo} alt="Smart Bin Logo" className="w-10 h-10 rounded-full bg-white object-cover shadow-sm p-0.5" />
            <h2 className="text-xl font-bold">Smart Bin</h2>
          </div>
          <nav className="space-y-1">
            <button 
              onClick={() => setActiveTab('dashboard')}
              className={`flex items-center gap-3 w-full p-3 rounded-lg font-medium transition-colors ${activeTab === 'dashboard' ? 'bg-[#4ade80] text-white shadow-sm' : 'hover:bg-white/10 text-white/90'}`}
            >
              <LayoutDashboard size={20} /> Dashboard
            </button>
            <button 
              onClick={() => setActiveTab('request')}
              className={`flex items-center gap-3 w-full p-3 rounded-lg font-medium transition-colors ${activeTab === 'request' ? 'bg-[#4ade80] text-white shadow-sm' : 'hover:bg-white/10 text-white/90'}`}
            >
              <Send size={20} /> Request Pickup
            </button>
            <button 
              onClick={() => setActiveTab('complain')}
              className={`flex items-center gap-3 w-full p-3 rounded-lg font-medium transition-colors ${activeTab === 'complain' ? 'bg-[#4ade80] text-white shadow-sm' : 'hover:bg-white/10 text-white/90'}`}
            >
              <AlertTriangle size={20} /> File Complaint
            </button>
            <button 
              onClick={() => setActiveTab('guide')}
              className={`flex items-center gap-3 w-full p-3 rounded-lg font-medium transition-colors ${activeTab === 'guide' ? 'bg-[#4ade80] text-white shadow-sm' : 'hover:bg-white/10 text-white/90'}`}
            >
              <FileText size={20} /> Segregation Guide
            </button>
            <button 
              onClick={() => setActiveTab('schedule')}
              className={`flex items-center gap-3 w-full p-3 rounded-lg font-medium transition-colors ${activeTab === 'schedule' ? 'bg-[#4ade80] text-white shadow-sm' : 'hover:bg-white/10 text-white/90'}`}
            >
              <Calendar size={20} /> Pickup Schedule
            </button>
            <button 
              onClick={() => setActiveTab('feedback')}
              className={`flex items-center gap-3 w-full p-3 rounded-lg font-medium transition-colors ${activeTab === 'feedback' ? 'bg-[#4ade80] text-white shadow-sm' : 'hover:bg-white/10 text-white/90'}`}
            >
              <Star size={20} /> Feedback
            </button>
          </nav>
        </div>
        <div className="p-6">
          <div className="flex flex-col">
            <span className="font-bold text-sm">{user?.name ?? 'User'}</span>
            <span className="text-xs text-white/70 mb-4">{user?.email ?? ''}</span>
            <button onClick={onLogout} className="flex items-center gap-2 text-white/90 hover:text-white transition-colors text-sm font-medium">
              <LogOut size={16} /> Logout
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-8">
        {activeTab === 'dashboard' && (
          <div className="max-w-5xl mx-auto border border-gray-100 shadow-sm rounded-xl p-8 bg-white mt-4">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-[#111827] mb-2">Welcome back, {user?.name ?? 'Resident'}!</h1>
              <p className="text-[#6b7280]">Here's a quick overview of your waste management activities.</p>
            </div>

            {/* Map Section */}
            <div className="mb-8">
              <h3 className="text-lg font-bold mb-3">Nearby Bins & Collection Routes</h3>
              <MapComponent height="300px" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {/* Card 1 */}
              <div className="bg-[#f0fdf4] border border-[#dcfce7] rounded-xl p-5 flex justify-between items-center">
                <div>
                  <p className="text-[#15803d] text-sm font-semibold mb-1">This Month</p>
                  <h3 className="text-[#166534] text-3xl font-extrabold mb-1">12</h3>
                  <p className="text-[#22c55e] text-xs font-medium">Pickups Completed</p>
                </div>
                <div className="w-12 h-12 bg-[#dcfce7] rounded-full flex items-center justify-center">
                  <Truck className="h-6 w-6 text-[#166534]" />
                </div>
              </div>

              {/* Card 2 */}
              <div className="bg-[#eff6ff] border border-[#dbeafe] rounded-xl p-5 flex justify-between items-center">
                <div>
                  <p className="text-[#1d4ed8] text-sm font-semibold mb-1">Next Pickup</p>
                  <h3 className="text-[#1e3a8a] text-2xl font-extrabold leading-tight mb-1">Friday</h3>
                  <p className="text-[#3b82f6] text-xs font-medium">Sep 26, 2025</p>
                </div>
                <div className="w-12 h-12 bg-[#dbeafe] rounded-full flex items-center justify-center">
                  <Calendar className="h-6 w-6 text-[#1e3a8a]" />
                </div>
              </div>

              {/* Card 3 */}
              <div className="bg-[#fff7ed] border border-[#ffedd5] rounded-xl p-5 flex justify-between items-center">
                <div>
                  <p className="text-[#c2410c] text-sm font-semibold mb-1">Game Score</p>
                  <h3 className="text-[#9a3412] text-3xl font-extrabold mb-1">850</h3>
                  <p className="text-[#f97316] text-xs font-medium">Points Earned</p>
                </div>
                <div className="w-12 h-12 bg-[#ffedd5] rounded-full flex items-center justify-center">
                  <Trophy className="h-6 w-6 text-[#9a3412]" />
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-[#22c55e] to-[#3b82f6] rounded-xl p-8 shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl">🌱</span>
                <h3 className="text-white text-xl font-bold">Eco Impact</h3>
              </div>
              <p className="text-white/95 mb-6 text-[15px]">
                Your proper waste segregation has helped save 45kg of recyclable materials this month!
              </p>
              <Button 
                onClick={() => setIsGameOpen(true)} 
                className="bg-white text-[#166534] hover:bg-gray-50 font-semibold px-5 py-2 rounded-md transition-colors"
              >
                Play Segregation Game
              </Button>
            </div>
          </div>
        )}

        {/* Other Tabs Rendering - Kept Functional */}
        {activeTab === 'request' && (
          <div className="max-w-3xl mx-auto mt-4">
            <Card>
              <CardHeader><CardTitle>Request a Waste Pickup</CardTitle></CardHeader>
              <CardContent>
                <form onSubmit={handlePickupRequest} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="waste-type">Waste Type</Label>
                      <select name="waste-type" className="w-full mt-1 p-2 border rounded-md">
                        <option>General Waste</option>
                        <option>Recyclables</option>
                        <option>Bulk Items</option>
                        <option>E-Waste</option>
                      </select>
                    </div>
                    <div>
                      <Label htmlFor="pickup-date">Preferred Date</Label>
                      <Input name="pickup-date" type="date" id="pickup-date" required />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="address">Pickup Address</Label>
                    <Input name="address" id="address" defaultValue="123 Green Street, Pimpri-Chinchwad" required />
                  </div>
                  <div>
                    <Label htmlFor="special-instructions">Special Instructions</Label>
                    <Textarea name="special-instructions" id="special-instructions" placeholder="Any special handling requirements..." rows={3} />
                  </div>
                  <Button type="submit" className="w-full bg-[#166534] hover:bg-[#15803d]"><Send className="h-4 w-4 mr-2" /> Submit Pickup Request</Button>
                </form>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === 'schedule' && (
          <div className="max-w-3xl mx-auto mt-4 space-y-6 animate-in slide-in-from-right-8 duration-500">
            <h1 className="text-3xl font-black text-gray-900">Pickup Schedule</h1>
            <Card className="rounded-3xl border-none shadow-sm overflow-hidden bg-white">
              <CardContent className="p-0">
                <div className="divide-y divide-gray-100">
                  {upcomingPickups.length > 0 ? upcomingPickups.map((pickup, index) => (
                    <div key={index} className="flex items-center justify-between p-6 hover:bg-gray-50 transition-colors">
                      <div className="flex items-center gap-6">
                        <div className="w-12 h-12 bg-green-50 text-[#166534] rounded-2xl flex items-center justify-center font-black">
                          <Truck size={24} />
                        </div>
                        <div>
                          <p className="font-extrabold text-gray-900 text-lg uppercase tracking-tight">{pickup.type}</p>
                          <p className="text-sm font-bold text-gray-500">{new Date(pickup.scheduled_date).toDateString()}</p>
                          <Badge className={pickup.status === 'completed' ? 'bg-green-100 text-green-700' : pickup.status === 'enroute' ? 'bg-blue-100 text-blue-700' : 'bg-yellow-100 text-yellow-700'}>
                            {pickup.status.toUpperCase()}
                          </Badge>
                        </div>
                      </div>
                      <Button variant="outline" className="rounded-xl border-2 font-black" onClick={() => { setMapFocus([18.6298, 73.7997]); setActiveTab('guide'); }}>
                        Track Truck
                      </Button>
                    </div>
                  )) : (
                    <p className="text-center text-muted-foreground py-12 font-medium">No scheduled pickups yet.</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === 'guide' && (
          <div className="max-w-4xl mx-auto mt-4 space-y-8 animate-in slide-in-from-right-8 duration-500">
             <h1 className="text-4xl font-black text-gray-900">System Guide & Tracker</h1>
             
             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <Card className="p-8 rounded-[32px] border-none shadow-sm flex flex-col gap-6">
                   <h3 className="text-2xl font-black text-[#166534] flex items-center gap-3"><Info /> Citizen Onboarding</h3>
                   <div className="space-y-4">
                      <div className="flex gap-4"><div className="w-8 h-8 bg-green-50 text-green-700 rounded-lg flex items-center justify-center font-black">1</div><p className="font-bold text-gray-600">Register your address and contact details.</p></div>
                      <div className="flex gap-4"><div className="w-8 h-8 bg-green-50 text-green-700 rounded-lg flex items-center justify-center font-black">2</div><p className="font-bold text-gray-600">Use 'Request Pickup' to schedule a waste collection.</p></div>
                      <div className="flex gap-4"><div className="w-8 h-8 bg-green-50 text-green-700 rounded-lg flex items-center justify-center font-black">3</div><p className="font-bold text-gray-600">Track your assigned truck in real-time via the hub.</p></div>
                   </div>
                </Card>
                <Card className="p-8 rounded-[32px] border-none shadow-sm bg-[#166534] text-white">
                   <h3 className="text-2xl font-black flex items-center gap-3"><Trophy /> Eco Rewards</h3>
                   <p className="font-medium text-white/90">Properly segregated waste earns you points in our 'Segregation Game'. Redeem these points for municipal benefits!</p>
                   <Button onClick={() => setIsGameOpen(true)} className="mt-6 bg-white text-[#166534] font-black rounded-xl py-6">Play & Earn</Button>
                </Card>
             </div>

             <Card className="p-10 rounded-[40px] border-none shadow-2xl bg-white space-y-6">
                <h3 className="text-2xl font-black text-gray-900">Live Collection Status</h3>
                <MapComponent height="400px" focus={mapFocus} showPath={upcomingPickups.some(p => p.status === 'enroute')} />
                <div className="flex justify-between items-center text-sm font-black text-gray-400 uppercase tracking-widest bg-gray-50 p-6 rounded-2xl">
                   <span>Truck Status: {upcomingPickups.some(p => p.status === 'enroute') ? 'ENROUTE TO YOU' : 'OPERATIONAL'}</span>
                   <span className="text-[#166534]">Zone: Green Sector 4</span>
                </div>
                {mapFocus && (
                  <Button onClick={() => setMapFocus(undefined)} variant="ghost" className="w-full font-bold">Reset Tracker View</Button>
                )}
             </Card>
          </div>
        )}

        {activeTab === 'complain' && (
          <div className="max-w-3xl mx-auto mt-4">
            <Card>
              <CardHeader><CardTitle>File a Complaint</CardTitle></CardHeader>
              <CardContent>
                <form onSubmit={handleComplaintSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="complaint-type">Complaint Type</Label>
                    <select name="complaint-type" className="w-full mt-1 p-2 border rounded-md">
                      <option>Missed Collection</option>
                      <option>Improper Collection</option>
                      <option>Damaged Property</option>
                      <option>Other</option>
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="location">Location</Label>
                    <Input name="location" id="location" placeholder="Specify the location of the issue" required />
                  </div>
                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea name="description" id="description" placeholder="Please describe the issue in detail..." rows={4} required />
                  </div>
                  <Button type="submit" className="w-full bg-[#166534] hover:bg-[#15803d]"><AlertTriangle className="h-4 w-4 mr-2" /> Submit Complaint</Button>
                </form>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === 'guide' && (
          <div className="max-w-4xl mx-auto mt-4">
            <Card>
              <CardHeader><CardTitle>Interactive Bin Map & Guide</CardTitle></CardHeader>
              <CardContent>
                <div className="mb-6">
                  <MapComponent height="400px" />
                </div>
                <div className="text-center group">
                  <p className="text-muted-foreground mb-4 italic text-sm">
                    Interactive maps help you find the nearest smart bins and track collection status in real-time.
                  </p>
                  <Button onClick={() => setIsGameOpen(true)} className="bg-[#166534] hover:bg-[#15803d]">🎮 Play Segregation Game</Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === 'feedback' && (
          <div className="max-w-3xl mx-auto mt-4">
            <Card>
              <CardHeader><CardTitle>Submit Feedback</CardTitle></CardHeader>
              <CardContent>
                <form className="space-y-4">
                  <div>
                    <Label htmlFor="rating">Overall Rating</Label>
                    <select className="w-full mt-1 p-2 border rounded-md">
                      <option>5 Stars - Excellent</option>
                      <option>4 Stars - Good</option>
                      <option>3 Stars - Average</option>
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="feedback-text">Your Feedback</Label>
                    <Textarea id="feedback-text" placeholder="Tell us about your experience..." rows={4} />
                  </div>
                  <Button type="submit" className="w-full bg-[#166534] hover:bg-[#15803d]"><Star className="h-4 w-4 mr-2" /> Submit Feedback</Button>
                </form>
              </CardContent>
            </Card>
          </div>
        )}

      </main>

      <SegregationGame isOpen={isGameOpen} onClose={() => setIsGameOpen(false)} />
    </div>
  );
};

export default ResidentDashboard;