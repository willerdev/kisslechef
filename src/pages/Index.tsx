import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search, ChevronRight, LogOut, Loader2, ShoppingCart, User, Heart } from "lucide-react";
import { useSessionContext } from '@supabase/auth-helpers-react';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { useCart } from "@/contexts/CartContext";
import { Skeleton } from "@/components/ui/skeleton";

const categories = [
  "All",
  "Italian",
  "American",
  "Japanese",
  "Healthy",
];

const Index = () => {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const { session } = useSessionContext();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [favorites, setFavorites] = useState<string[]>([]);
  const { state } = useCart();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        console.log("Fetching products with category:", selectedCategory);
        
        let query = supabase
          .from('products')
          .select('*')
          .order('created_at', { ascending: false });
        
        if (selectedCategory !== "All") {
          query = query.eq('category', selectedCategory);
        }

        if (searchQuery) {
          query = query.ilike('name', `%${searchQuery}%`);
        }

        const { data, error } = await query;
        
        if (error) throw error;
        console.log("Fetched products:", data);
        
        setProducts(data || []);
      } catch (error) {
        console.error('Error fetching products:', error);
        toast({
          title: "Error",
          description: "Failed to load products",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [selectedCategory, searchQuery]);

  useEffect(() => {
    if (session?.user?.id) {
      loadFavorites();
    }
  }, [session?.user?.id]);

  const loadFavorites = async () => {
    try {
      const { data, error } = await supabase
        .from('favorites')
        .select('product_id')
        .eq('user_id', session?.user?.id);

      if (error) throw error;
      setFavorites(data.map(fav => fav.product_id));
    } catch (error) {
      console.error('Error loading favorites:', error);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  const handleOrderNow = (productId: string) => {
    navigate(`/product/${productId}`);
  };

  const handleAddToFavorite = async (productId: string) => {
    try {
      if (favorites.includes(productId)) {
        const { error } = await supabase
          .from('favorites')
          .delete()
          .eq('user_id', session?.user?.id)
          .eq('product_id', productId);

        if (error) throw error;
        setFavorites(favorites.filter(id => id !== productId));
        toast({
          title: "Removed from favorites",
          description: "Product removed from your favorites",
        });
      } else {
        const { error } = await supabase
          .from('favorites')
          .insert([
            {
              user_id: session?.user?.id,
              product_id: productId,
            },
          ]);

        if (error) throw error;
        setFavorites([...favorites, productId]);
        toast({
          title: "Added to favorites",
          description: "Product added to your favorites",
        });
      }
    } catch (error) {
      console.error('Error updating favorites:', error);
      toast({
        title: "Error",
        description: "Failed to update favorites",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-sage-50 to-white">
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100 shadow-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-sage-800 md:block">KissleChef</h1>
          <div className="flex gap-4 items-center">
            {session ? (
              <>
                <Link to="/profile" className="text-sage-700 hover:text-sage-900 md:flex hidden">
                  Profile
                </Link>
                <Link to="/orders" className="text-sage-700 hover:text-sage-900 md:flex hidden">
                  Orders
                </Link>
                <Link to="/cart" className="text-sage-700 hover:text-sage-900 relative">
                  <ShoppingCart className="h-5 w-5" />
                  {state.items.length > 0 && (
                    <span className="absolute -top-2 -right-2 bg-sage-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {state.items.length}
                    </span>
                  )}
                </Link>
                <Button 
                  variant="ghost" 
                  className="text-sage-700 hover:text-sage-900 md:flex hidden"
                  onClick={handleSignOut}
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
                </Button>
              </>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="ghost" className="text-sage-700 hover:text-sage-900">
                    <User className="h-5 w-5" />
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 mb-16 md:mb-0">
        <section className="mb-12 text-center fade-in hidden md:block">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Delicious food, delivered to your door
          </h2>
          <p className="text-lg text-gray-600 mb-8">
            Order from the best local restaurants with easy, contactless delivery
          </p>
          <div className="max-w-2xl mx-auto relative">
            <Input
              type="text"
              placeholder="Search for dishes or cuisines"
              className="pl-12 h-12 text-lg"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
          </div>
        </section>

        <section className="mb-8 overflow-x-auto scrollbar-hide">
          <div className="flex gap-2 pb-4">
            {categories.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                className={`rounded-full px-4 whitespace-nowrap ${
                  selectedCategory === category
                    ? "bg-sage-600 text-white"
                    : "text-gray-600 hover:text-sage-700"
                }`}
                onClick={() => setSelectedCategory(category)}
              >
                {category}
              </Button>
            ))}
          </div>
        </section>

        <section className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-8 fade-in">
          {loading ? (
            <section className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-8 fade-in">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="overflow-hidden">
                  <Skeleton className="w-full h-32 md:h-48" />
                  <div className="p-3 md:p-6">
                    <div className="flex flex-col md:flex-row justify-between items-start mb-2 md:mb-4">
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-3 w-20" />
                      </div>
                      <Skeleton className="h-4 w-16" />
                    </div>
                    <div className="flex gap-2">
                      <Skeleton className="h-9 flex-1" />
                      <Skeleton className="h-9 flex-1" />
                    </div>
                  </div>
                </Card>
              ))}
            </section>
          ) : products.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <p className="text-gray-500">No products found in this category</p>
            </div>
          ) : (
            products.map((product) => (
              <Card
                key={product.id}
                className="overflow-hidden hover:shadow-lg transition-shadow duration-300"
              >
                <img
                  src={(product.images?.[0] || product.image_url || "/placeholder.svg")}
                  alt={product.name}
                  className="w-full h-32 md:h-48 object-cover"
                  loading="lazy"
                />
                <div className="p-3 md:p-6">
                  <div className="flex flex-col md:flex-row justify-between items-start mb-2 md:mb-4">
                    <div>
                      <h3 className="text-sm md:text-xl font-semibold text-gray-900 mb-1">
                        {product.name}
                      </h3>
                      <p className="text-xs md:text-sm text-gray-600">{product.category}</p>
                    </div>
                    <span className="text-xs md:text-sm font-medium text-sage-800">
                      {product.price.toFixed(2)} Frw
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      className="flex-1 text-sage-600 hover:text-sage-700 text-sm md:text-base"
                      onClick={() => handleAddToFavorite(product.id)}
                    >
                      <Heart className={`h-4 w-4 mr-2 ${favorites.includes(product.id) ? 'fill-current' : ''}`} />
                     
                    </Button>
                    <Button
                      className="flex-1 bg-sage-600 hover:bg-sage-700 text-sm md:text-base"
                      onClick={() => navigate(`/product/${product.id}`)}
                    >
                     
                      View
                    </Button>
                  </div>
                </div>
              </Card>
            ))
          )}
        </section>
      </main>
    </div>
  );
};

export default Index;