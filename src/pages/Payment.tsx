import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCart } from "@/contexts/CartContext";
import { useToast } from "@/components/ui/use-toast";
import { useSessionContext } from '@supabase/auth-helpers-react';
import { supabase } from "@/integrations/supabase/client";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const Payment = () => {
  const navigate = useNavigate();
  const { state, clearCart } = useCart();
  const { session } = useSessionContext();
  const { toast } = useToast();
  const [paymentMethod, setPaymentMethod] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [paymentProof, setPaymentProof] = useState<File | null>(null);
  const [processing, setProcessing] = useState(false);

  const handlePaymentProofUpload = async (file: File) => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${session?.user?.id}/payment-proofs/${fileName}`;

      const { error: uploadError, data } = await supabase.storage
        .from('kissbucket')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('kissbucket')
        .getPublicUrl(filePath);

      return publicUrl;
    } catch (error) {
      console.error('Error uploading payment proof:', error);
      throw error;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!session?.user?.id) {
      toast({
        title: "Error",
        description: "You must be logged in to place an order",
        variant: "destructive",
      });
      return;
    }

    try {
      setProcessing(true);

      let paymentProofUrl = null;
      if (paymentMethod === 'bank_transfer' && paymentProof) {
        paymentProofUrl = await handlePaymentProofUpload(paymentProof);
      }

      // Create the order with .single()
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .insert([
          {
            user_id: session.user.id,
            total: state.total,
            status: paymentMethod === 'cash_on_delivery' ? 'pending_delivery' : 'pending',
            payment_method: paymentMethod,
            payment_proof_url: paymentProofUrl,
            payment_status: paymentMethod === 'cash_on_delivery' ? 'pending_delivery' : 'pending'
          }
        ])
        .select()
        .single();

      if (orderError) throw orderError;

      // Create order items
      const orderItems = state.items.map(item => ({
        order_id: orderData.id,
        product_id: item.id,
        quantity: item.quantity,
        price: item.price
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) throw itemsError;

      clearCart();
      toast({
        title: "Order Placed Successfully",
        description: paymentMethod === 'cash_on_delivery' 
          ? "Thank you for your order! You can pay when your order arrives."
          : "Thank you for your order! You can track it in your orders page.",
      });
      navigate("/orders");
      
    } catch (error) {
      console.error('Error creating order:', error);
      toast({
        title: "Error",
        description: "Failed to process your order. Please try again.",
        variant: "destructive",
      });
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-sage-50 to-white p-4">
      <div className="max-w-md mx-auto">
        <h1 className="text-2xl font-bold mb-6">Payment</h1>
        
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Select Payment Method</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="card" id="card" />
                  <Label htmlFor="card">Credit/Debit Card</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="bank_transfer" id="bank_transfer" />
                  <Label htmlFor="bank_transfer">Mobile Money</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="cash_on_delivery" id="cash_on_delivery" />
                  <Label htmlFor="cash_on_delivery">Cash on Delivery</Label>
                </div>
              </RadioGroup>

              {paymentMethod === 'card' && (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="cardNumber">Card Number</Label>
                    <Input
                      id="cardNumber"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      placeholder="1234 5678 9012 3456"
                      required
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="expiry">Expiry Date</Label>
                      <Input
                        id="expiry"
                        value={expiry}
                        onChange={(e) => setExpiry(e.target.value)}
                        placeholder="MM/YY"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="cvv">CVV</Label>
                      <Input
                        id="cvv"
                        value={cvv}
                        onChange={(e) => setCvv(e.target.value)}
                        placeholder="123"
                        required
                      />
                    </div>
                  </div>
                </div>
              )}

              {paymentMethod === 'bank_transfer' && (
                <div className="space-y-4">
                  <div>
                    <Label>Bank Account Details</Label>
                    <div className="p-4 bg-sage-50 rounded-lg">
                      <p>Momo name: Kiss Le Chef</p>
                      <p>Tel Number: 1234567890</p>
                     
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="proof">Upload Payment Proof</Label>
                    <Input
                      id="proof"
                      type="file"
                      onChange={(e) => setPaymentProof(e.target.files?.[0] || null)}
                      accept="image/*"
                      required
                    />
                  </div>
                </div>
              )}

              <div className="border-t pt-4">
                <div className="flex justify-between font-semibold mb-4">
                  <span>Total to Pay</span>
                  <span>${state.total.toFixed(2)}</span>
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full bg-sage-600 hover:bg-sage-700"
                  disabled={processing || !paymentMethod}
                >
                  {processing ? "Processing..." : "Place Order"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Payment;