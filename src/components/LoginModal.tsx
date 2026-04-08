import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Home, Truck, Shield } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess?: (role: "resident" | "collector" | "admin", user: { id?: number; name: string; email: string; role: "resident" | "collector" | "admin" }) => void;
}

const LoginModal = ({ isOpen, onClose, onLoginSuccess }: LoginModalProps) => {
  const [selectedRole, setSelectedRole] = useState<string>("");
  const [isRegister, setIsRegister] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });
  const { toast } = useToast();

  const roles = [
    { id: "resident", name: "Resident", icon: Home, color: "from-primary to-primary-light" },
    { id: "collector", name: "Waste Collector", icon: Truck, color: "from-info to-blue-400" },
    { id: "admin", name: "Municipal Admin", icon: Shield, color: "from-e-waste to-purple-400" },
  ];

  const handleRoleSelect = (roleId: string) => {
    setSelectedRole(roleId);
    setFormData({
      ...formData,
      email: `${roleId}@smartbin.com`,
      name: roleId === 'resident' ? 'Jane Doe' : (roleId === 'collector' ? 'John Smith' : 'Admin User')
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedRole) {
      toast({
        title: "Please select a role",
        description: "You must choose a role before proceeding.",
        variant: "destructive",
      });
      return;
    }

    try {
      const API_URL = import.meta.env.VITE_API_URL || '';
      const endpoint = `${API_URL}/auth.php?action=${isRegister ? 'register' : 'login'}`;
      const response = await fetch(endpoint, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          role: selectedRole
        }),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        toast({
          title: isRegister ? "Registration Successful!" : "Login Successful!",
          description: `Welcome ${result.user.name}!`,
        });
        onClose();
        if (onLoginSuccess) {
          onLoginSuccess(
            result.user.role as "resident" | "collector" | "admin",
            {
              id: result.user.id,
              name: result.user.name,
              email: result.user.email,
              role: result.user.role as "resident" | "collector" | "admin",
            }
          );
        }
      } else {
        toast({
          title: "Authentication Failed",
          description: result.error || "An error occurred during authentication.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Connection Error",
        description: "Could not connect to the authentication server. Ensure PHP is running.",
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setSelectedRole("");
    setFormData({ name: "", email: "", password: "" });
    setIsRegister(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center">
            {!selectedRole ? "Choose Your Role" : `${isRegister ? "Register" : "Login"} as ${roles.find(r => r.id === selectedRole)?.name}`}
          </DialogTitle>
        </DialogHeader>

        {!selectedRole ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4">
            {roles.map((role) => {
              const IconComponent = role.icon;
              return (
                <Card
                  key={role.id}
                  className="p-6 text-center cursor-pointer card-hover group"
                  onClick={() => handleRoleSelect(role.id)}
                >
                  <div className="mb-4">
                    <div className={`w-16 h-16 mx-auto bg-gradient-to-br ${role.color} rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                      <IconComponent className="h-8 w-8 text-white" />
                    </div>
                  </div>
                  <h3 className="text-lg font-bold text-foreground">{role.name}</h3>
                </Card>
              );
            })}
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 p-4">
            {isRegister && (
              <div>
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="mt-1"
                />
              </div>
            )}
            
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="mt-1"
              />
            </div>
            
            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                required
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="mt-1"
                placeholder="Enter your password"
              />
            </div>

            <Button type="submit" className="w-full">
              {isRegister ? "Register" : "Login"}
            </Button>

            <div className="text-center space-y-2">
              <p className="text-sm text-muted-foreground">
                {isRegister ? "Already have an account?" : "Don't have an account?"}
              </p>
              <Button
                type="button"
                variant="link"
                onClick={() => setIsRegister(!isRegister)}
                className="text-primary hover:text-primary-dark"
              >
                {isRegister ? "Sign in here" : "Register here"}
              </Button>
            </div>

            <Button
              type="button"
              variant="outline"
              onClick={() => setSelectedRole("")}
              className="w-full"
            >
              Back to Role Selection
            </Button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default LoginModal;