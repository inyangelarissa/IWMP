import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/client";
import { User } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Calendar, Users, MapPin, TrendingUp, LogOut, Heart } from "lucide-react";


const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const checkUser = useCallback (async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        navigate("/auth");
        return;
      }

      setUser(user);

      // Get user role
      const { data: roleData } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .single();

      if (roleData) {
        setUserRole(roleData.role);
        
        // Redirect admins to their specific dashboard
        if (roleData.role === "admin") {
          navigate("/admin");
          return;
        }
        
        // Redirect venue managers to their specific dashboard
        if (roleData.role === "venue_manager") {
          navigate("/venue-manager");
          return;
        }
        
        // Redirect vendors to their specific dashboard
        if (roleData.role === "vendor") {
          navigate("/vendor");
          return;
        }
        
        // Redirect planners to their specific dashboard
        if (roleData.role === "planner") {
          navigate("/planner");
          return;
        }
      }
    } catch (error) {
      console.error("Error checking user:", error);
    } finally {
      setLoading(false);
    }
  }, [navigate]);

useEffect (() => {
    checkUser();
  }, [checkUser]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.success("Logged out successfully");
    navigate("/");
  };

  const handleRoleSwitch = async (newRole: "couple" | "planner" | "vendor" | "venue_manager" | "admin") => {
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from("user_roles")
        .update({ role: newRole })
        .eq("user_id", user.id);

      if (error) throw error;

      toast.success(`Role switched to ${newRole}`);
      // Refresh to redirect to appropriate dashboard
      window.location.reload();
    } catch (error) {
      console.error("Error switching role:", error);
      toast.error("Failed to switch role");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Heart className="w-12 h-12 text-primary fill-primary animate-pulse mx-auto mb-4" />
          <p className="text-muted-foreground">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  const getRoleName = (role: string | null) => {
    if (!role) return "User";
    return role.split("_").map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(" ");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted to-background">
      <nav className="border-b bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Heart className="w-8 h-8 text-primary fill-primary" />
            <h1 className="text-2xl font-serif font-bold">IWEMS</h1>
          </div>
          <Button variant="outline" onClick={handleLogout}>
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-serif font-bold mb-2">
            Welcome back, {user?.user_metadata?.full_name || "User"}!
          </h2>
          <p className="text-muted-foreground mb-4">
            Role: <span className="font-medium text-foreground">{getRoleName(userRole)}</span>
          </p>
          
        
          {/* Demo Role Switcher */}
          <Card className="max-w-2xl border-dashed border-2 border-primary/20 bg-primary/5">
            <CardHeader>
              <CardTitle className="text-sm">🎭 Demo Mode - Switch Roles</CardTitle>
              <CardDescription className="text-xs">
                Quickly switch between roles to test different dashboards
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              <Button
                size="sm"
                variant={userRole === "couple" ? "default" : "outline"}
                onClick={() => handleRoleSwitch("couple")}
              >
                Couple
              </Button>
              <Button
                size="sm"
                variant={userRole === "planner" ? "default" : "outline"}
                onClick={() => handleRoleSwitch("planner")}
              >
                Planner
              </Button>
              <Button
                size="sm"
                variant={userRole === "vendor" ? "default" : "outline"}
                onClick={() => handleRoleSwitch("vendor")}
              >
                Vendor
              </Button>
              <Button
                size="sm"
                variant={userRole === "venue_manager" ? "default" : "outline"}
                onClick={() => handleRoleSwitch("venue_manager")}
              >
                Venue Manager
              </Button>
              <Button
                size="sm"
                variant={userRole === "admin" ? "default" : "outline"}
                onClick={() => handleRoleSwitch("admin")}
              >
                Admin
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Events</CardTitle>
              <Calendar className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
              <p className="text-xs text-muted-foreground">Active events</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Vendors</CardTitle>
              <Users className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
              <p className="text-xs text-muted-foreground">Booked vendors</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Venues</CardTitle>
              <MapPin className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
              <p className="text-xs text-muted-foreground">Venue options</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Budget</CardTitle>
              <TrendingUp className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">$0</div>
              <p className="text-xs text-muted-foreground">Total allocated</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Get started with your event planning</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button className="w-full" variant="outline" onClick={() => navigate("/events")}>
                <Calendar className="w-4 h-4 mr-2" />
                My Events
              </Button>
              <Button className="w-full" variant="outline" onClick={() => navigate("/vendors")}>
                <Users className="w-4 h-4 mr-2" />
                Browse Vendors
              </Button>
              <Button className="w-full" variant="outline" onClick={() => navigate("/venues")}>
                <MapPin className="w-4 h-4 mr-2" />
                Find Venues
              </Button>
              <Button className="w-full" variant="outline" onClick={() => navigate("/budget")}>
                <TrendingUp className="w-4 h-4 mr-2" />
                Budget Tracker
              </Button>
              <Button className="w-full" variant="outline" onClick={() => navigate("/cultural")}>
                <Calendar className="w-4 h-4 mr-2" />
                Cultural Activities
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Your latest updates</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground text-center py-8">
                No activity yet. Start planning your dream wedding!
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
