import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useSessionContext } from '@supabase/auth-helpers-react';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { Card } from "@/components/ui/card";

interface Order {
  id: string;
  created_at: string;
  status: string;
  total: number;
  items: {
    product: {
      name: string;
    };
    quantity: number;
  }[];
}

const Orders = () => {
  const navigate = useNavigate();
  const { session } = useSessionContext();
  const { toast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const { data: ordersData, error: ordersError } = await supabase
          .from('orders')
          .select(`
            *,
            items:order_items(
              quantity,
              product:products(name)
            )
          `)
          .eq('user_id', session?.user?.id)
          .order('created_at', { ascending: false });

        if (ordersError) throw ordersError;
        setOrders(ordersData || []);
      } catch (error) {
        console.error('Error fetching orders:', error);
        toast({
          title: "Error",
          description: "Failed to load orders",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    if (session?.user?.id) {
      fetchOrders();
    }
  }, [session?.user?.id]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-sage-50 to-white p-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate("/")}
            className="text-sage-600 hover:text-sage-700"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Button>
          <h1 className="text-2xl font-bold">Your Orders</h1>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 mb-4">You haven't placed any orders yet</p>
            <Button onClick={() => navigate("/")} className="bg-sage-600 hover:bg-sage-700">
              Browse Restaurants
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <Card key={order.id} className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex justify-between md:block">
                      <div className="font-medium">Order #{order.id.slice(0, 8)}</div>
                      <div className="text-gray-500">
                        {new Date(order.created_at).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="text-sm text-gray-600">
                      {order.items.map(item => 
                        `${item.product.name} (${item.quantity})`
                      ).join(", ")}
                    </div>
                  </div>
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                    <div>
                      <span className="px-2 py-1 text-sm rounded bg-sage-100 text-sage-800">
                        {order.status}
                      </span>
                      <div className="mt-2 font-medium">${order.total.toFixed(2)}</div>
                    </div>
                    <Button
                      variant="outline"
                      onClick={() => navigate(`/chat?orderId=${order.id}`)}
                      className="w-full md:w-auto"
                    >
                      Contact Support
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Orders;