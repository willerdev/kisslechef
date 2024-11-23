import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, ArrowLeft, Heart, ShoppingCart } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useSessionContext } from '@supabase/auth-helpers-react';
import { useCart } from "@/contexts/CartContext";

const Favorites = () => {
  const navigate = useNavigate();
  const { session } = useSessionContext();
  const { toast } = useToast();
  const { addToCart } = useCart();
  const [favorites, setFavorites] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFavorites();
  }, [session?.user?.id]);

  const loadFavorites = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('favorites')
        .select(`
          *,
          product:products(*)
        `)
        .eq('user_id', session?.user?.id);

      if (error) throw error;
      setFavorites(data || []);
    } catch (error) {
      console.error('Error loading favorites:', error);
      toast({
        title: "Error",
        description: "Failed to load favorites",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const removeFavorite = async (productId: string) => {
    try {
      const { error } = await supabase
        .from('favorites')
        .delete()
        .eq('user_id', session?.user?.id)
        .eq('product_id', productId);

      if (error) throw error;

      setFavorites(favorites.filter(fav => fav.product_id !== productId));
      toast({
        title: "Success",
        description: "Removed from favorites",
      });
    } catch (error) {
      console.error('Error removing favorite:', error);
      toast({
        title: "Error",
        description: "Failed to remove from favorites",
        variant: "destructive",
      });
    }
  };

  const handleAddToCart = (product: any) => {
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image_url || '/placeholder.svg'
    });
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
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate("/")}
            className="text-sage-600 hover:text-sage-700"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Button>
          <h1 className="text-2xl font-bold">Your Favorites</h1>
        </div>

        {favorites.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 mb-4">No favorites yet</p>
            <Button onClick={() => navigate("/")} className="bg-sage-600 hover:bg-sage-700">
              Browse Products
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {favorites.map((favorite) => (
              <Card key={favorite.id} className="overflow-hidden">
                <img
                  src={(favorite.product.images?.[0] || favorite.product.image_url || "/placeholder.svg")}
                  alt={favorite.product.name}
                  className="w-full h-32 md:h-48 object-cover"
                />
                <div className="p-4">
                  <h3 className="font-semibold mb-2">{favorite.product.name}</h3>
                  <p className="text-sage-600 font-medium mb-4">
                    ${favorite.product.price.toFixed(2)}
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => removeFavorite(favorite.product_id)}
                      className="flex-1"
                    >
                      <Heart className="h-4 w-4 mr-2 fill-current" />
                      
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => handleAddToCart(favorite.product)}
                      className="flex-1"
                    >
                      <ShoppingCart className="h-4 w-4 mr-2" />
                      Buy
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

export default Favorites;