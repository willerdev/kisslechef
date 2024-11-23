import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { useSessionContext } from '@supabase/auth-helpers-react';
import { supabase } from "@/integrations/supabase/client";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

interface MealPlan {
  id: string;
  user_id: string;
  meal_id: string;
  delivery_time: string;
  frequency: string;
  status: string;
  product: {
    id: string;
    name: string;
    price: number;
    // ... other product fields
  };
}

const Plan = () => {
  const { session } = useSessionContext();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [meals, setMeals] = useState<any[]>([]);
  const [selectedMeal, setSelectedMeal] = useState("");
  const [deliveryTime, setDeliveryTime] = useState("12:00");
  const [plans, setPlans] = useState<MealPlan[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Fetch available meals
        const { data: mealsData, error: mealsError } = await supabase
          .from('products')
          .select('*')
          .order('name');

        if (mealsError) throw mealsError;
        setMeals(mealsData || []);

        // Fetch user's existing plans
        const { data: plansData, error: plansError } = await supabase
          .from('meal_plans')
          .select(`
            *,
            product:products(*)
          `)
          .eq('user_id', session?.user?.id);

        if (plansError) throw plansError;
        setPlans(plansData || []);
      } catch (error) {
        console.error('Error fetching data:', error);
        toast({
          title: "Error",
          description: "Failed to load meal plans",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    if (session?.user?.id) {
      fetchData();
    }
  }, [session?.user?.id]);

  const handleCreatePlan = async () => {
    try {
      const { data, error } = await supabase
        .from('meal_plans')
        .insert([
          {
            user_id: session?.user?.id,
            meal_id: selectedMeal,
            delivery_time: deliveryTime,
            frequency: 'daily',
            status: 'active'
          }
        ])
        .select()
        .single();

      if (error) throw error;

      const { data: newPlan, error: fetchError } = await supabase
        .from('meal_plans')
        .select(`
          *,
          product:products(*)
        `)
        .eq('id', data.id)
        .single();

      if (fetchError) throw fetchError;

      setPlans([...plans, newPlan]);
      setSelectedMeal("");
      setDeliveryTime("12:00");

      toast({
        title: "Success",
        description: "Meal plan created successfully",
      });
    } catch (error) {
      console.error('Error creating plan:', error);
      toast({
        title: "Error",
        description: "Failed to create meal plan",
        variant: "destructive",
      });
    }
  };

  const handleCancelPlan = async (planId: string) => {
    try {
      const { error } = await supabase
        .from('meal_plans')
        .update({ status: 'cancelled' })
        .eq('id', planId);

      if (error) throw error;

      // Update the local state to reflect the change
      setPlans(plans.map(plan => 
        plan.id === planId 
          ? { ...plan, status: 'cancelled' }
          : plan
      ));

      toast({
        title: "Success",
        description: "Meal plan cancelled successfully",
      });
    } catch (error) {
      console.error('Error cancelling plan:', error);
      toast({
        title: "Error",
        description: "Failed to cancel meal plan",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-sage-50 to-white p-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Meal Plans</h1>

        <Card className="p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Create New Plan</h2>
          <div className="space-y-4">
            <div>
              <Label htmlFor="meal">Select Meal</Label>
              <Select value={selectedMeal} onValueChange={setSelectedMeal}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a meal" />
                </SelectTrigger>
                <SelectContent>
                  {meals.map((meal) => (
                    <SelectItem key={meal.id} value={meal.id}>
                      {meal.name} - ${meal.price}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="time">Delivery Time</Label>
              <Input
                type="time"
                id="time"
                value={deliveryTime}
                onChange={(e) => setDeliveryTime(e.target.value)}
              />
            </div>

            <Button 
              onClick={handleCreatePlan}
              className="w-full bg-sage-600 hover:bg-sage-700"
              disabled={!selectedMeal}
            >
              Create Plan
            </Button>
          </div>
        </Card>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Your Plans</h2>
          {plans.length === 0 ? (
            <p className="text-gray-500">You haven't created any meal plans yet.</p>
          ) : (
            plans.map((plan) => (
              <Card key={plan.id} className="p-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-semibold">{plan.product.name}</h3>
                    <p className="text-sm text-gray-600">
                      Delivery Time: {plan.delivery_time}
                    </p>
                    <p className="text-sm text-gray-600">
                      Status: {plan.status}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => handleCancelPlan(plan.id)}
                    disabled={plan.status === 'cancelled'}
                    className={plan.status === 'cancelled' ? 'opacity-50' : ''}
                  >
                    {plan.status === 'cancelled' ? 'Cancelled' : 'Cancel Plan'}
                  </Button>
                </div>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Plan;