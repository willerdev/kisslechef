import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCart } from "@/contexts/CartContext";
import { ArrowLeft, Plus } from "lucide-react";
import { useSessionContext } from '@supabase/auth-helpers-react';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  RadioGroup,
  RadioGroupItem,
} from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

interface DeliveryAddress {
  id: string;
  address: string;
  phone: string;
  is_default: boolean;
}

const Checkout = () => {
  const navigate = useNavigate();
  const { state } = useCart();
  const { session } = useSessionContext();
  const { toast } = useToast();
  const [showNewAddressForm, setShowNewAddressForm] = useState(false);
  const [selectedAddressId, setSelectedAddressId] = useState<string>("");
  const [addresses, setAddresses] = useState<DeliveryAddress[]>([]);
  const [newAddress, setNewAddress] = useState({
    address: "",
    phone: "",
    is_default: false,
  });

  useEffect(() => {
    if (session?.user?.id) {
      loadAddresses();
    }
  }, [session?.user?.id]);

  const loadAddresses = async () => {
    try {
      const { data, error } = await supabase
        .from('delivery_addresses')
        .select('*')
        .eq('user_id', session?.user?.id)
        .order('is_default', { ascending: false });

      if (error) throw error;

      setAddresses(data || []);
      if (data && data.length > 0) {
        const defaultAddress = data.find(addr => addr.is_default) || data[0];
        setSelectedAddressId(defaultAddress.id);
      }
    } catch (error) {
      console.error('Error loading addresses:', error);
      toast({
        title: "Error",
        description: "Failed to load delivery addresses",
        variant: "destructive",
      });
    }
  };

  const handleAddNewAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { data, error } = await supabase
        .from('delivery_addresses')
        .insert([
          {
            user_id: session?.user?.id,
            ...newAddress,
          },
        ])
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Success",
        description: "New delivery address added",
      });

      setAddresses([...addresses, data]);
      setSelectedAddressId(data.id);
      setShowNewAddressForm(false);
      setNewAddress({ address: "", phone: "", is_default: false });
    } catch (error) {
      console.error('Error adding address:', error);
      toast({
        title: "Error",
        description: "Failed to add delivery address",
        variant: "destructive",
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAddressId) {
      toast({
        title: "Error",
        description: "Please select a delivery address",
        variant: "destructive",
      });
      return;
    }
    navigate("/payment");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-sage-50 to-white p-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate("/cart")}
            className="text-sage-600 hover:text-sage-700"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Cart
          </Button>
          <h1 className="text-2xl font-bold">Checkout</h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Delivery Details</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {addresses.length > 0 && (
                    <RadioGroup
                      value={selectedAddressId}
                      onValueChange={setSelectedAddressId}
                      className="space-y-4"
                    >
                      {addresses.map((addr) => (
                        <div key={addr.id} className="flex items-center space-x-2">
                          <RadioGroupItem value={addr.id} id={addr.id} />
                          <Label htmlFor={addr.id} className="flex-1">
                            <div className="font-medium">{addr.address}</div>
                            <div className="text-sm text-gray-500">{addr.phone}</div>
                          </Label>
                        </div>
                      ))}
                    </RadioGroup>
                  )}

                  {!showNewAddressForm ? (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowNewAddressForm(true)}
                      className="w-full"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add New Address
                    </Button>
                  ) : (
                    <div className="space-y-4">
                      <Input
                        value={newAddress.address}
                        onChange={(e) => setNewAddress({ ...newAddress, address: e.target.value })}
                        placeholder="Enter delivery address"
                        required
                      />
                      <Input
                        value={newAddress.phone}
                        onChange={(e) => setNewAddress({ ...newAddress, phone: e.target.value })}
                        placeholder="Enter phone number"
                        required
                      />
                      <div className="flex gap-2">
                        <Button
                          type="button"
                          onClick={handleAddNewAddress}
                          className="flex-1"
                        >
                          Save Address
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setShowNewAddressForm(false)}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  )}

                  <Button type="submit" className="w-full bg-sage-600 hover:bg-sage-700">
                    Continue to Payment
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {state.items.map((item) => (
                    <div key={item.id} className="flex justify-between">
                      <span>
                        {item.name} x {item.quantity}
                      </span>
                      <span>{(item.price * item.quantity).toFixed(2)} Frw</span>
                    </div>
                  ))}
                  <div className="border-t pt-4">
                    <div className="flex justify-between font-semibold">
                      <span>Total</span>
                      <span>{(state.total).toFixed(2)} Frw</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;