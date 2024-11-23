import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, Loader2, X, Upload } from "lucide-react";

interface ProductImage {
  file: File;
  preview: string;
}

const AddProduct = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState<ProductImage[]>([]);
  const [product, setProduct] = useState({
    name: "",
    description: "",
    price: "",
    category: "",
    images: [] as string[],
    is_promoted: false,
    discount_percentage: "",
  });

  useEffect(() => {
    checkAdminStatus();
  }, []);

  const checkAdminStatus = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate('/admin/login');
      return;
    }

    const { data: adminData, error } = await supabase
      .from('admins')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (error || !adminData) {
      navigate('/admin/login');
      toast({
        title: "Unauthorized",
        description: "You must be an admin to access this page",
        variant: "destructive",
      });
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newImages: ProductImage[] = Array.from(files).map(file => ({
      file,
      preview: URL.createObjectURL(file)
    }));

    setImages(prev => [...prev, ...newImages]);
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const uploadImagesToStorage = async () => {
    const uploadedUrls: string[] = [];

    for (const image of images) {
      const fileExt = image.file.name.split('.').pop()?.toLowerCase() || '';
      const validExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
      
      if (!validExtensions.includes(fileExt)) {
        throw new Error(`Invalid file type: ${fileExt}`);
      }

      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `products/${fileName}`;

      const { error: uploadError, data } = await supabase.storage
        .from('kissbucket')
        .upload(filePath, image.file, {
          contentType: image.file.type,
          cacheControl: '3600'
        });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('kissbucket')
        .getPublicUrl(filePath);

      uploadedUrls.push(publicUrl);
    }

    return uploadedUrls;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      
      if (!product.name || !product.price || !product.category || images.length === 0) {
        throw new Error('Please fill in all required fields');
      }

      const imageUrls = await uploadImagesToStorage();
      
      const { data, error } = await supabase
        .from('products')
        .insert([{
          ...product,
          price: parseFloat(product.price),
          discount_percentage: product.discount_percentage 
            ? parseFloat(product.discount_percentage) 
            : null,
          is_promoted: product.is_promoted,
          images: imageUrls
        }])
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Success",
        description: "Product added successfully",
      });
      
      navigate("/admin/products");
    } catch (error: any) {
      console.error('Error adding product:', error);
      toast({
        title: "Error",
        description: error.message === "new row violates row-level security policy" 
          ? "You don't have permission to add products. Please check your admin access."
          : error.message || "Failed to add product",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-sage-50 to-white p-4 pb-20">
      <div className="max-w-4xl mx-auto mb-30">
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate("/admin/products")}
            className="text-sage-600 hover:text-sage-700"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Products
          </Button>
          <h1 className="text-2xl font-bold">Add Product</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="name">Product Name</Label>
              <Input
                id="name"
                value={product.name}
                onChange={(e) => setProduct({ ...product, name: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="price">Price</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                value={product.price}
                onChange={(e) => setProduct({ ...product, price: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <select
                id="category"
                value={product.category}
                onChange={(e) => setProduct({ ...product, category: e.target.value })}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                required
              >
                <option value="">Select a category</option>
                <option value="Italian">Italian</option>
                <option value="American">American</option>
                <option value="Japanese">Japanese</option>
                <option value="Healthy">Healthy</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="images">Images</Label>
              <Input
                id="images"
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageUpload}
                required
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={product.description}
                onChange={(e) => setProduct({ ...product, description: e.target.value })}
                required
              />
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="promoted"
                checked={product.is_promoted}
                onCheckedChange={(checked) => setProduct({ ...product, is_promoted: checked })}
              />
              <Label htmlFor="promoted">Promoted Product</Label>
            </div>

            <div className="space-y-2">
              <Label htmlFor="discount">Discount Percentage</Label>
              <Input
                id="discount"
                type="number"
                min="0"
                max="100"
                value={product.discount_percentage}
                onChange={(e) => setProduct({ ...product, discount_percentage: e.target.value })}
              />
            </div>
          </div>

          <Button
            type="submit"
            className="w-full bg-sage-600 hover:bg-sage-700"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Adding Product...
              </>
            ) : (
              "Add Product"
            )}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default AddProduct;