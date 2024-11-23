import { Home, MessageCircle, ClipboardList, User, Heart } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

const MobileNav = () => {
  const location = useLocation();
  
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t md:hidden">
      <div className="flex justify-around py-3">
        <Link to="/" className={`flex flex-col items-center ${location.pathname === '/' ? 'text-sage-600' : 'text-gray-500'}`}>
          <Home className="h-6 w-6" />
          <span className="text-xs mt-1">Home</span>
        </Link>
        <Link to="/chat" className={`flex flex-col items-center ${location.pathname === '/chat' ? 'text-sage-600' : 'text-gray-500'}`}>
          <MessageCircle className="h-6 w-6" />
          <span className="text-xs mt-1">Chat</span>
        </Link>
            <Link to="/plan" className={`flex flex-col items-center ${location.pathname === '/plan' ? 'text-sage-600' : 'text-gray-500'}`}>
            <ClipboardList className="h-6 w-6" />
            <span className="text-xs mt-1">Plan</span>
            </Link>
            <Link to="/favorites" className={`flex flex-col items-center ${location.pathname === '/favorites' ? 'text-sage-600' : 'text-gray-500'}`}>
            <Heart className="h-6 w-6" />
            <span className="text-xs mt-1">Favorites</span>
            </Link>
        <Link to="/profile" className={`flex flex-col items-center ${location.pathname === '/profile' ? 'text-sage-600' : 'text-gray-500'}`}>
          <User className="h-6 w-6" />
          <span className="text-xs mt-1">Profile</span>
        </Link>
      </div>
    </div>
  );
};

export default MobileNav;