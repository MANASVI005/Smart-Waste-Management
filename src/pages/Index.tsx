import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Home, Truck, Shield, Twitter, Facebook, Instagram, ArrowRight } from "lucide-react";
import LoginModal from "@/components/LoginModal";
import SegregationGame from "@/components/SegregationGame";
import DemoAuthWrapper from "@/components/DemoAuthWrapper";
import heroImage from "@/assets/bins_background.png";
import smartBinLogo from "@/assets/smart-bin-logo.png";

const Index = () => {
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isGameOpen, setIsGameOpen] = useState(false);
  const [showDemo, setShowDemo] = useState(false);
  const [loggedInUser, setLoggedInUser] = useState<{ id?: number; name: string; email: string; role: "resident" | "collector" | "admin" } | null>(null);

  useEffect(() => {
    // Check for existing session on mount
    const checkSession = async () => {
      const API_URL = import.meta.env.VITE_API_URL || '';
      try {
        const response = await fetch(`${API_URL}/auth.php?action=status`, {
          credentials: 'include',
          headers: { 'X-Requested-With': 'XMLHttpRequest' }
        });
        const result = await response.json();
        if (result.loggedIn && result.user) {
          setLoggedInUser(result.user);
          setShowDemo(true);
        }
      } catch (error) {
        console.error("Session check failed:", error);
      }
    };
    checkSession();
  }, []);

  const scrollToLogin = () => {
    const loginSection = document.getElementById('login-section');
    loginSection?.scrollIntoView({ behavior: 'smooth' });
  };

  if (showDemo) {
    return <DemoAuthWrapper initialUser={loggedInUser ?? undefined} />;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section with Enhanced Header & Background */}
      <div className="min-h-screen relative overflow-hidden">
        {/* Background Layer with Blur */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat scale-105"
          style={{ 
            backgroundImage: `url(${heroImage})`,
            filter: "blur(4px)" 
          }}
        ></div>
        {/* Darker Overlay to make text pop */}
        <div className="absolute inset-0 bg-black/40"></div>
        
        {/* Content stays clear */}
        <div className="relative z-10 flex flex-col min-h-screen">
          {/* Enhanced Header */}
          <header className="bg-white shadow-sm border-b shrink-0">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between items-center h-20">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <img 
                      src={smartBinLogo} 
                      alt="Smart Bin Logo" 
                      className="w-12 h-12 rounded-full"
                    />
                  </div>
                  <h1 className="text-3xl font-extrabold tracking-tight">
                    <span className="text-[#22c55e]">Smart</span> <span className="text-[#d97706]">Bin</span>
                  </h1>
                </div>
                <Button 
                  onClick={() => setIsLoginModalOpen(true)}
                  className="bg-[#10b981] hover:bg-[#059669] text-white font-bold px-8 py-2 rounded-full"
                >
                  Login / Register
                </Button>
              </div>
            </div>
          </header>

          {/* Hero Content */}
          <main className="flex-1 flex items-center justify-center text-center p-4">
            <div className="max-w-4xl mx-auto py-12 md:py-24">
              <h2 className="text-6xl md:text-8xl font-extrabold text-white leading-[1.05] mb-8 drop-shadow-2xl">
                Revolutionizing Waste<br/>Management
              </h2>
              <p className="text-xl md:text-3xl text-white font-medium max-w-2xl mx-auto mb-12 drop-shadow-lg leading-snug opacity-95">
                A smart, integrated platform for residents, collectors, and administrators to create cleaner, greener communities together.
              </p>
              <div className="flex flex-col sm:flex-row gap-6 justify-center">
                <Button 
                  onClick={() => setShowDemo(true)}
                  size="lg"
                  className="bg-white text-[#10b981] hover:bg-gray-100 font-bold px-10 py-8 rounded-full text-xl shadow-2xl transition-transform hover:scale-105"
                >
                  <ArrowRight className="h-7 w-7 mr-2 font-bold" />
                  Try Demo Dashboard
                </Button>
                <Button 
                  onClick={scrollToLogin}
                  variant="outline"
                  size="lg"
                  className="border-2 border-white text-white hover:bg-white/10 bg-transparent font-bold px-10 py-8 rounded-full text-xl shadow-2xl transition-transform hover:scale-105"
                >
                  Get Started
                </Button>
                <Button 
                  onClick={() => setIsGameOpen(true)}
                  variant="outline"
                  size="lg"
                  className="border-2 border-white text-white hover:bg-white/10 bg-transparent font-bold px-10 py-8 rounded-full text-xl shadow-2xl transition-transform hover:scale-105"
                >
                  🎮 Play Game
                </Button>
              </div>
            </div>
          </main>
        </div>
      </div>

      {/* Role Selection Section */}
      <section id="login-section" className="py-20 bg-gradient-to-br from-primary/5 to-accent/5">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-16 animate-fade-in">
            <h2 className="text-4xl md:text-5xl font-extrabold text-foreground mb-4">
              Choose Your Role
            </h2>
            <p className="text-xl text-muted-foreground">
              Select your portal to sign in or create an account
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Resident Card */}
            <Card 
              className="p-8 text-center cursor-pointer card-hover glass-card group"
              onClick={() => setIsLoginModalOpen(true)}
            >
              <div className="mb-6">
                <div className="w-20 h-20 mx-auto bg-gradient-to-br from-primary to-primary-light rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <Home className="h-10 w-10 text-white" />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-foreground mb-3">Resident</h3>
              <p className="text-muted-foreground">
                Manage pickups, file complaints, and learn about segregation
              </p>
            </Card>

            {/* Collector Card */}
            <Card 
              className="p-8 text-center cursor-pointer card-hover glass-card group"
              onClick={() => setIsLoginModalOpen(true)}
            >
              <div className="mb-6">
                <div className="w-20 h-20 mx-auto bg-gradient-to-br from-info to-blue-400 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <Truck className="h-10 w-10 text-white" />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-foreground mb-3">Waste Collector</h3>
              <p className="text-muted-foreground">
                View routes, manage pickup requests, and update schedules
              </p>
            </Card>

            {/* Admin Card */}
            <Card 
              className="p-8 text-center cursor-pointer card-hover glass-card group"
              onClick={() => setIsLoginModalOpen(true)}
            >
              <div className="mb-6">
                <div className="w-20 h-20 mx-auto bg-gradient-to-br from-e-waste to-purple-400 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <Shield className="h-10 w-10 text-white" />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-foreground mb-3">Municipal Admin</h3>
              <p className="text-muted-foreground">
                Monitor operations, manage staff, and view analytics
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-background">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-extrabold text-foreground mb-4">
              Smart Features for Everyone
            </h2>
            <p className="text-xl text-muted-foreground">
              Comprehensive waste management solutions powered by technology
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="w-16 h-16 mx-auto bg-wet-waste rounded-full flex items-center justify-center mb-4">
                <span className="text-2xl">🌱</span>
              </div>
              <h3 className="text-xl font-bold mb-2">Smart Segregation</h3>
              <p className="text-muted-foreground">AI-powered waste classification guidance</p>
            </div>
            
            <div className="text-center p-6">
              <div className="w-16 h-16 mx-auto bg-dry-waste rounded-full flex items-center justify-center mb-4">
                <span className="text-2xl">📍</span>
              </div>
              <h3 className="text-xl font-bold mb-2">Real-time Tracking</h3>
              <p className="text-muted-foreground">Live updates on collection status and routes</p>
            </div>
            
            <div className="text-center p-6">
              <div className="w-16 h-16 mx-auto bg-accent rounded-full flex items-center justify-center mb-4">
                <span className="text-2xl">📊</span>
              </div>
              <h3 className="text-xl font-bold mb-2">Analytics Dashboard</h3>
              <p className="text-muted-foreground">Comprehensive insights and reporting</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-foreground text-white py-16">
        <div className="max-w-6xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <img src={smartBinLogo} alt="Smart Bin Logo" className="w-8 h-8 rounded-full" />
              <h4 className="font-bold text-xl">Smart Bin</h4>
            </div>
            <p className="text-gray-300">
              Dedicated to fostering cleaner environments through technology, 
              connecting communities and waste management services seamlessly.
            </p>
          </div>
          
          <div>
            <h4 className="font-bold text-lg mb-4">Contact Us</h4>
            <p className="text-gray-300 mb-2">123 Green Way, Pimpri-Chinchwad, MH</p>
            <p className="text-gray-300">Email: contact@smartbin.com</p>
          </div>
          
          <div>
            <h4 className="font-bold text-lg mb-4">Follow Us</h4>
            <div className="flex gap-4">
              <Twitter className="h-6 w-6 text-gray-300 hover:text-white cursor-pointer" />
              <Facebook className="h-6 w-6 text-gray-300 hover:text-white cursor-pointer" />
              <Instagram className="h-6 w-6 text-gray-300 hover:text-white cursor-pointer" />
            </div>
          </div>
        </div>
        
        <div className="mt-12 pt-8 border-t border-gray-700 text-center text-gray-400">
          &copy; 2025 Smart Bin. All Rights Reserved.
        </div>
      </footer>

      {/* Modals */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onLoginSuccess={(role, user) => {
          setLoggedInUser(user);
          setShowDemo(true);
        }}
      />
      <SegregationGame isOpen={isGameOpen} onClose={() => setIsGameOpen(false)} />
    </div>
  );
};

export default Index;