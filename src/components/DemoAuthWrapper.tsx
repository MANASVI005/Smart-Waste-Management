import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import ResidentDashboard from "./ResidentDashboard";
import CollectorDashboard from "./CollectorDashboard";
import AdminDashboard from "./AdminDashboard";
import smartBinLogo from "@/assets/smart-bin-logo.png";

type UserRole = "resident" | "collector" | "admin" | null;

interface UserData {
  id?: number;
  name: string;
  email: string;
  role: UserRole;
}

interface DemoAuthWrapperProps {
  initialUser?: UserData;
}

const DemoAuthWrapper = ({ initialUser }: DemoAuthWrapperProps) => {
  const [currentUser, setCurrentUser] = useState<UserData | null>(initialUser ?? null);
  const [isLoading, setIsLoading] = useState(!initialUser);

  useEffect(() => {
    // Only fetch session status if we don't already have a user (e.g. on page refresh)
    if (initialUser) return;

    const checkAuthStatus = async () => {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
      try {
        const response = await fetch(`${API_URL}/auth.php?action=status`, {
          credentials: 'include',
          headers: { 'X-Requested-With': 'XMLHttpRequest' }
        });
        const result = await response.json();
        if (result.loggedIn && result.user) {
          setCurrentUser(result.user);
        }
      } catch (error) {
        console.error("Auth check failed:", error);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthStatus();
  }, [initialUser]);

  const handleLogout = async () => {
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
    try {
      await fetch(`${API_URL}/auth.php?action=logout`, {
        credentials: 'include'
      });
      setCurrentUser(null);
      window.location.reload();
    } catch (error) {
      console.error("Logout failed:", error);
      setCurrentUser(null);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (currentUser && currentUser.role) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        {/* Navigation Header only for non-residents */}
        {currentUser.role !== 'resident' && (
          <header className="bg-white shadow-sm border-b shrink-0">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between items-center h-16">
                <div className="flex items-center gap-3">
                  <img src={smartBinLogo} alt="Smart Bin Logo" className="w-8 h-8 rounded-full" />
                  <h1 className="text-xl font-bold text-gradient">Smart Bin</h1>
                  <span className="text-sm text-muted-foreground">
                    {currentUser.role === 'collector' && '• Collector Portal'}
                    {currentUser.role === 'admin' && '• Admin Portal'}
                  </span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-sm font-semibold text-foreground">{currentUser.name}</p>
                    <p className="text-xs text-muted-foreground">{currentUser.email}</p>
                  </div>
                  <Button variant="outline" onClick={handleLogout}>
                    Logout
                  </Button>
                </div>
              </div>
            </div>
          </header>
        )}

        {/* Dashboard Content */}
        <main className="flex-1 flex flex-col">
          {currentUser.role === 'resident' && (
            <ResidentDashboard onLogout={handleLogout} user={currentUser as { id?: number; name: string; email: string; role: string }} />
          )}
          {currentUser.role === 'collector' && (
            <CollectorDashboard user={currentUser as { name: string; email: string; role: string }} />
          )}
          {currentUser.role === 'admin' && (
            <AdminDashboard user={currentUser as { name: string; email: string; role: string }} />
          )}
        </main>
      </div>
    );
  }

  // No logged-in user — show demo role picker
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-accent/10 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        <div className="text-center mb-8">
          <img src={smartBinLogo} alt="Smart Bin Logo" className="w-16 h-16 mx-auto mb-4 animate-float" />
          <h1 className="text-3xl font-bold text-gradient mb-2">Smart Bin Demo</h1>
          <p className="text-muted-foreground">
            Experience different user roles in our waste management system
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card
            className="p-6 text-center cursor-pointer card-hover"
            onClick={() => setCurrentUser({ name: 'Demo Resident', email: 'resident@demo.com', role: 'resident' })}
          >
            <div className="w-12 h-12 mx-auto bg-primary rounded-full flex items-center justify-center mb-4">
              <span className="text-white text-xl">🏠</span>
            </div>
            <h3 className="font-bold text-lg mb-2">Resident</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Request pickups, track schedule, play segregation game
            </p>
            <Button className="w-full">Enter as Resident</Button>
          </Card>

          <Card
            className="p-6 text-center cursor-pointer card-hover"
            onClick={() => setCurrentUser({ name: 'Demo Collector', email: 'collector@demo.com', role: 'collector' })}
          >
            <div className="w-12 h-12 mx-auto bg-info rounded-full flex items-center justify-center mb-4">
              <span className="text-white text-xl">🚛</span>
            </div>
            <h3 className="font-bold text-lg mb-2">Collector</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Manage routes, view requests, track collections
            </p>
            <Button className="w-full">Enter as Collector</Button>
          </Card>

          <Card
            className="p-6 text-center cursor-pointer card-hover"
            onClick={() => setCurrentUser({ name: 'Demo Admin', email: 'admin@demo.com', role: 'admin' })}
          >
            <div className="w-12 h-12 mx-auto bg-e-waste rounded-full flex items-center justify-center mb-4">
              <span className="text-white text-xl">👑</span>
            </div>
            <h3 className="font-bold text-lg mb-2">Admin</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Manage staff, view analytics, approve residents
            </p>
            <Button className="w-full">Enter as Admin</Button>
          </Card>
        </div>

        <div className="text-center mt-8">
          <p className="text-sm text-muted-foreground">
            This is a demo showcasing the complete Smart Bin system. In production, users would authenticate with their credentials.
          </p>
        </div>
      </div>
    </div>
  );
};

export default DemoAuthWrapper;