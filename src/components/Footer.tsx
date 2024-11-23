import { Facebook, Instagram, Twitter } from "lucide-react";
import { Link } from "react-router-dom";

const Footer = ({ className = "" }) => {
  return (
    <footer className={`bg-white border-t ${className}`}>
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-lg font-semibold mb-4">KissleChef</h3>
            <p className="text-gray-600">Your favorite food delivery service</p>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li><Link to="/" className="text-gray-600 hover:text-sage-600">Home</Link></li>
              <li><Link to="/orders" className="text-gray-600 hover:text-sage-600">Orders</Link></li>
              <li><Link to="/profile" className="text-gray-600 hover:text-sage-600">Profile</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Support</h4>
            <ul className="space-y-2">
              <li><Link to="/chat" className="text-gray-600 hover:text-sage-600">Chat with us</Link></li>
              <li><a href="#" className="text-gray-600 hover:text-sage-600">FAQ</a></li>
              <li><a href="#" className="text-gray-600 hover:text-sage-600">Contact</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Follow Us</h4>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-600 hover:text-sage-600">
                <Facebook className="h-6 w-6" />
              </a>
              <a href="#" className="text-gray-600 hover:text-sage-600">
                <Instagram className="h-6 w-6" />
              </a>
              <a href="#" className="text-gray-600 hover:text-sage-600">
                <Twitter className="h-6 w-6" />
              </a>
            </div>
          </div>
        </div>
        <div className="mt-8 border-t pt-8 text-center">
          <p className="text-gray-600">&copy; {new Date().getFullYear()} KissleChef. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;