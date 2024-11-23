import { Package, PlusCircle, Settings, LayoutDashboard } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

const AdminFooter = () => {
  const location = useLocation();
  
  return (
    <footer className="hidden md:block bg-white border-t">
      <div className="mx-auto max-w-7xl px-4 py-6">
        <div className="grid grid-cols-4 gap-8">
          <div>
            <h4 className="font-semibold mb-3">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <Link 
                  to="/admin/dashboard" 
                  className={`flex items-center text-gray-600 hover:text-sage-600 ${
                    location.pathname === '/admin/dashboard' ? 'text-sage-600' : ''
                  }`}
                >
                  <LayoutDashboard className="h-4 w-4 mr-2" />
                  Dashboard
                </Link>
              </li>
              <li>
                <Link 
                  to="/admin/products" 
                  className={`flex items-center text-gray-600 hover:text-sage-600 ${
                    location.pathname === '/admin/products' ? 'text-sage-600' : ''
                  }`}
                >
                  <Package className="h-4 w-4 mr-2" />
                  Products
                </Link>
              </li>
              <li>
                <Link 
                  to="/admin/products/add" 
                  className={`flex items-center text-gray-600 hover:text-sage-600 ${
                    location.pathname === '/admin/products/add' ? 'text-sage-600' : ''
                  }`}
                >
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Add Product
                </Link>
              </li>
              <li>
                <Link 
                  to="/admin/settings" 
                  className={`flex items-center text-gray-600 hover:text-sage-600 ${
                    location.pathname === '/admin/settings' ? 'text-sage-600' : ''
                  }`}
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Settings
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-3">Support</h4>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-gray-600 hover:text-sage-600">Help Center</a>
              </li>
              <li>
                <a href="#" className="text-gray-600 hover:text-sage-600">Documentation</a>
              </li>
            </ul>
          </div>
          <div className="col-span-2">
            <h4 className="font-semibold mb-3">About Admin Panel</h4>
            <p className="text-gray-600">
              Manage your products, orders, and settings through this administrative interface.
              For support, contact the system administrator.
            </p>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t text-center text-gray-600">
          <p>&copy; {new Date().getFullYear()} KissleChef Admin Panel. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default AdminFooter;