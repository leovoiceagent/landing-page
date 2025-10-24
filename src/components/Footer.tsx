import React from 'react';
import { useState } from 'react';
import { Phone } from 'lucide-react';
import LeoLogo from '../assets/Leo_logo_round.png';
import WaitlistModal from './WaitlistModal';

interface FooterProps {
  showCTA?: boolean;
}

const Footer: React.FC<FooterProps> = ({ showCTA = true }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleJoinWaitlist = () => {
    setIsModalOpen(true);
  };
  return (
    <>
      <footer className="bg-white">
      {/* CTA Strip */}
      {showCTA && (
        <div className="bg-[#1F2937] text-white py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Ready to capture every leasing lead?
            </h2>
            <p className="text-xl text-gray-300 mb-8">
              Try Leo for free — no setup headaches, no missed calls.
            </p>
            <button 
              onClick={handleJoinWaitlist}
              className="bg-[#F7EF00] text-[#1E293B] px-8 py-4 rounded-2xl text-lg font-semibold hover:bg-[#F7EF00]/90 transition-all duration-300 hover:scale-105 inline-flex items-center space-x-2 group"
            >
              <Phone className="w-5 h-5" />
              <span>Join waitlist</span>
              <span className="group-hover:translate-x-1 transition-transform">→</span>
            </button>
          </div>
        </div>
      )}

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

      <WaitlistModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
    </>
  );
};

export default Footer;