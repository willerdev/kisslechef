import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useSessionContext } from "@supabase/auth-helpers-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, LogOut, ShoppingBag, CreditCard, Settings } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

const Profile = () => {
  const { session } = useSessionContext();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [currentPlan, setCurrentPlan] = useState<any>(null);
  const [profile, setProfile] = useState({
    username: "",
    full_name: "",
    phone: "",
    address: "",
    avatar_url: "",
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        
        // Fetch profile
        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", session?.user.id)
          .single();

        if (profileError) throw profileError;

        // Fetch recent orders
        const { data: ordersData, error: ordersError } = await supabase
          .from("orders")
          .select(`
            *,
            items:order_items(
              quantity,
              product:products(name)
            )
          `)
          .eq("user_id", session?.user.id)
          .order("created_at", { ascending: false })
          .limit(5);

        if (ordersError) throw ordersError;

        // Fetch current plan
        const { data: planData, error: planError } = await supabase
          .from("subscriptions")
          .select("*")
          .eq("user_id", session?.user.id)
          .single();

        if (planError && planError.code !== "PGRST116") throw planError;

        if (profileData) {
          setProfile({
            username: profileData.username || "",
            full_name: profileData.full_name || "",
            phone: profileData.phone || "",
            address: profileData.address || "",
            avatar_url: profileData.avatar_url || "",
          });
        }
        
        setRecentOrders(ordersData || []);
        setCurrentPlan(planData);
      } catch (error) {
        console.error("Error loading profile data:", error);
        toast({
          title: "Error",
          description: "Failed to load profile data",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    if (session?.user.id) {
      loadData();
    }
  }, [session]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setUpdating(true);

      const { error } = await supabase
        .from("profiles")
        .update({
          username: profile.username,
          full_name: profile.full_name,
          phone: profile.phone,
          address: profile.address,
          avatar_url: profile.avatar_url,
        })
        .eq("id", session?.user.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Profile updated successfully",
      });
    } catch (error) {
      console.error("Error updating profile:", error);
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive",
      });
    } finally {
      setUpdating(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setProfile((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/login");
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Account Settings</h1>
          <Button variant="outline" onClick={handleSignOut}>
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </Button>
        </div>

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid grid-cols-3 w-full">
            <TabsTrigger value="profile">
              <Settings className="h-4 w-4 mr-2" />
              Profile
            </TabsTrigger>
            <TabsTrigger value="orders">
              <ShoppingBag className="h-4 w-4 mr-2" />
              Orders
            </TabsTrigger>
            <TabsTrigger value="plan">
              <CreditCard className="h-4 w-4 mr-2" />
              Plan
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>
                  Update your personal information and contact details
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={session?.user.email || ""}
                        disabled
                        className="bg-gray-50"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="username">Username</Label>
                      <Input
                        id="username"
                        name="username"
                        value={profile.username}
                        onChange={handleChange}
                        placeholder="Enter your username"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="full_name">Full Name</Label>
                      <Input
                        id="full_name"
                        name="full_name"
                        value={profile.full_name}
                        onChange={handleChange}
                        placeholder="Enter your full name"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone</Label>
                      <Input
                        id="phone"
                        name="phone"
                        value={profile.phone}
                        onChange={handleChange}
                        placeholder="Enter your phone number"
                      />
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="address">Address</Label>
                      <Input
                        id="address"
                        name="address"
                        value={profile.address}
                        onChange={handleChange}
                        placeholder="Enter your address"
                      />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full"
                    disabled={updating}
                  >
                    {updating ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Updating...
                      </>
                    ) : (
                      "Update Profile"
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="orders">
            <Card>
              <CardHeader>
                <CardTitle>Recent Orders</CardTitle>
                <CardDescription>
                  View your recent order history
                </CardDescription>
              </CardHeader>
              <CardContent>
                {recentOrders.length === 0 ? (
                  <div className="text-center py-6">
                    <p className="text-gray-500 mb-4">No orders yet</p>
                    <Button onClick={() => navigate("/")} variant="outline">
                      Start Shopping
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {recentOrders.map((order) => (
                      <div
                        key={order.id}
                        className="flex justify-between items-center p-4 border rounded-lg"
                      >
                        <div>
                          <p className="font-medium">Order #{order.id.slice(0, 8)}</p>
                          <p className="text-sm text-gray-500">
                            {new Date(order.created_at).toLocaleDateString()}
                          </p>
                          <p className="text-sm text-gray-600">
                            {order.items.map((item: any) => 
                              `${item.product.name} (${item.quantity})`
                            ).join(", ")}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">${order.total.toFixed(2)}</p>
                          <span className="inline-block px-2 py-1 text-xs rounded bg-sage-100 text-sage-800">
                            {order.status}
                          </span>
                        </div>
                      </div>
                    ))}
                    <Button
                      onClick={() => navigate("/orders")}
                      variant="outline"
                      className="w-full"
                    >
                      View All Orders
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="plan">
            <Card>
              <CardHeader>
                <CardTitle>Subscription Plan</CardTitle>
                <CardDescription>
                  Manage your subscription and billing
                </CardDescription>
              </CardHeader>
              <CardContent>
                {currentPlan ? (
                  <div className="space-y-4">
                    <div className="p-4 border rounded-lg">
                      <h3 className="font-semibold text-lg mb-2">
                        {currentPlan.plan_name}
                      </h3>
                      <p className="text-gray-600 mb-4">
                        {currentPlan.description}
                      </p>
                      <div className="flex justify-between items-center">
                        <span className="text-2xl font-bold">
                          ${currentPlan.price}/mo
                        </span>
                        <Button onClick={() => navigate("/plan")} variant="outline">
                          Change Plan
                        </Button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <p className="text-gray-500 mb-4">No active subscription</p>
                    <Button onClick={() => navigate("/plan")}>
                      View Plans
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Profile;