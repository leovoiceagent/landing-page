import React from 'react';
import LeoLogo from '../assets/Leo_logo_round.png';

const Footer: React.FC = () => {
  return (
    <>
      <footer className="bg-white">
      {/* Footer Links */}
      <div className="bg-[#F9FAFB] py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8">
            {/* Column 1 */}
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <img 
                  src={LeoLogo}
                  alt="Leo AI Voice Agent Logo" 
                  className="w-8 h-8 rounded-full"
                />
                <h3 className="text-lg font-bold text-[#1E293B]">Leo Voice Agent</h3>
              </div>
              <p className="text-[#64748B] mb-2">Smarter leasing calls — 24/7.</p>
              <p className="text-[#64748B]">Built for property managers.</p>
            </div>

            {/* Column 2 */}
            <div>
              <h4 className="font-semibold text-[#1E293B] mb-4">Product</h4>
              <ul className="space-y-3 text-[#64748B]">
                <li><a href="#how-it-works" className="hover:text-[#38BDF8] transition-colors">How it Works</a></li>
                <li><a href="#testimonials" className="hover:text-[#38BDF8] transition-colors">Testimonials</a></li>
                <li><a href="#" className="hover:text-[#38BDF8] transition-colors">Pricing</a></li>
                <li><a href="#faq" className="hover:text-[#38BDF8] transition-colors">FAQ</a></li>
              </ul>
            </div>

            {/* Column 3 */}
            <div>
              <h4 className="font-semibold text-[#1E293B] mb-4">Company</h4>
              <ul className="space-y-3 text-[#64748B]">
                <li><a href="#" className="hover:text-[#38BDF8] transition-colors">About</a></li>
                <li><a href="#" className="hover:text-[#38BDF8] transition-colors">Contact</a></li>
                <li><a href="#" className="hover:text-[#38BDF8] transition-colors">Privacy Policy →</a></li>
                <li><a href="#" className="hover:text-[#38BDF8] transition-colors">Terms of Use →</a></li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Strip */}
      <div className="bg-white border-t border-[#E5E7EB] py-6 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-[#64748B] text-sm">
            © 2025 Leo Voice Agent. All rights reserved.
            <br className="md:hidden" />
            <span className="md:ml-2">Made for leasing teams who never want to miss another lead.</span>
          </p>
        </div>
      </div>
      </footer>
    </>
  );
};

export default Footer;