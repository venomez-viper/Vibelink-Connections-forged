import { Link } from "react-router-dom";
import logo from "@/assets/vibelink-logo-new.png";
const Footer = () => {
  return <footer className="bg-primary text-white py-12 px-4">
      <div className="container mx-auto">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-1 mb-4 mx-0">
              <img src={logo} alt="VibeLink Logo" className="w-1 h-18" />
              <span className="font-bold text-3xl px-0 text-right">VibeLink</span>
            </div>
            <p className="text-white/90 mb-4">
              Modern dating platform for meaningful connections nearby. 
              Join thousands finding love, friendship, and companionship.
            </p>
          </div>
          
          {/* Quick Links */}
          <div>
            <h3 className="font-semibold mb-4 text-white">Quick Links</h3>
            <ul className="space-y-2 text-white/80">
              <li><Link to="/about" className="hover:text-white transition-colors">About Us</Link></li>
              <li><Link to="/how-it-works" className="hover:text-white transition-colors">How It Works</Link></li>
              <li><Link to="/safety" className="hover:text-white transition-colors">Safety Tips</Link></li>
              <li><Link to="/blog" className="hover:text-white transition-colors">Blog</Link></li>
            </ul>
          </div>
          
          {/* Legal */}
          <div>
            <h3 className="font-semibold mb-4 text-white">Legal</h3>
            <ul className="space-y-2 text-white/80">
              <li><Link to="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
              <li><Link to="/terms" className="hover:text-white transition-colors">Terms of Service</Link></li>
              <li><Link to="/community-guidelines" className="hover:text-white transition-colors">Community Guidelines</Link></li>
              <li><Link to="/contact" className="hover:text-white transition-colors">Contact Us</Link></li>
            </ul>
          </div>
        </div>
        
        {/* Bottom Bar */}
        <div className="border-t border-white/20 pt-8 text-center text-white/80">
          <p>&copy; 2025 VibeLink | Modern Dating Platform</p>
        </div>
      </div>
    </footer>;
};
export default Footer;