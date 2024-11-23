import { Home, Package, PlusCircle, Settings } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

const AdminMobileNav = () => {
  const location = useLocation();
  
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t md:hidden">
      <div className="flex justify-around py-3">
        <Link to="/admin/dashboard" className={`flex flex-col items-center ${location.pathname === '/admin/dashboard' ? 'text-sage-600' : 'text-gray-500'}`}>
          <Home className="h-6 w-6" />
          <span className="text-xs mt-1">Dashboard</span>
        </Link>
        <Link to="/admin/products" className={`flex flex-col items-center ${location.pathname === '/admin/products' ? 'text-sage-600' : 'text-gray-500'}`}>
          <Package className="h-6 w-6" />
          <span className="text-xs mt-1">Products</span>
        </Link>
        <Link to="/admin/products/add" className={`flex flex-col items-center ${location.pathname === '/admin/products/add' ? 'text-sage-600' : 'text-gray-500'}`}>
          <PlusCircle className="h-6 w-6" />
          <span className="text-xs mt-1">Add Product</span>
        </Link>
        <Link to="/admin/settings" className={`flex flex-col items-center ${location.pathname === '/admin/settings' ? 'text-sage-600' : 'text-gray-500'}`}>
          <Settings className="h-6 w-6" />
          <span className="text-xs mt-1">Settings</span>
        </Link>
      </div>
    </div>
  );
};

export default AdminMobileNav;