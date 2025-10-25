import React from 'react';
import { Calendar, Phone } from 'lucide-react';
import LeoLogo from '../assets/Leo_logo_round.png';
import LaurelLeft from '../assets/Laurel_left.png';
import LaurelRight from '../assets/Laurel_right.png';
import SpeechBubble from '../assets/Speech_bubble.png';
// import { openVoiceChat } from '../lib/chatWidget';

interface HeroProps {
  onStartVoiceDemo?: () => void;
}

const Hero: React.FC<HeroProps> = ({ onStartVoiceDemo }) => {

  return (
    <section className="pt-12 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Column - Text */}
          <div className="space-y-8 flex flex-col items-center text-center">
            <div className="space-y-6 flex flex-col items-center">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-[#1E293B] leading-tight">
                Missing 60% of
                <br />
                <span className="text-[#1E293B]">Your Leasing Calls?</span>
              </h1>
              
              <p className="text-xl text-[#64748B] leading-relaxed max-w-lg mx-auto">
                Every unanswered call is $15K+ walking out the door. Leo answers every call, captures leads, and books tours — 24/7.
              </p>

              <div className="space-y-4 flex flex-col items-center">
                <button onClick={onStartVoiceDemo || (() => alert('Voice demo not available'))} className="bg-[#F7EF00] text-[#1E293B] px-8 py-4 rounded-2xl text-lg font-semibold hover:bg-[#F7EF00]/90 transition-all duration-300 hover:scale-105 hover:shadow-lg inline-flex items-center space-x-2 group">
                  <span>Let Leo take your next call</span>
                  <span className="group-hover:translate-x-1 transition-transform">→</span>
                </button>

                <p className="text-[#64748B] font-medium">
                  Turn missed calls into signed leases
                </p>
              </div>

              {/* Microproof Row */}
              <div className="flex flex-col sm:flex-row gap-6 pt-4 justify-center items-center">
                <div className="flex items-center space-x-2">
                  <img 
                    src={LaurelLeft}
                    alt="Left laurel wreath" 
                    className="w-5 h-5"
                  />

                  <div className="text-center">
                    <p className="font-semibold text-[#1E293B] leading-none">Rated 4.9+</p>
                    <p className="text-sm text-[#64748B] leading-none">by Leo users</p>
                  </div>

                  <img 
                    src={LaurelRight}
                    alt="Right laurel wreath" 
                    className="w-5 h-5"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Phone className="w-5 h-5 text-[#38BDF8]" />
                  <span className="text-[#64748B] font-medium">50k+ calls handled</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Visual */}
          <div className="flex flex-col items-center space-y-8">
            <section className="w-full flex justify-center py-6">
              <div className="flex items-center gap-2 w-[380px] max-w-full">
                <img
                  src={LeoLogo}
                  alt="Leo Logo"
                  className="h-20 object-contain"
                />
                <img
                  src={SpeechBubble}
                  alt="Speech Bubble"
                  className="h-20 object-contain"
                />
              </div>
            </section>

            {/* Scheduled Tour Card */}
            <div className="bg-[#1F2937] text-white p-6 rounded-2xl w-full max-w-sm shadow-lg">
              <div className="flex items-center space-x-3 mb-4">
                <Calendar className="w-6 h-6 text-[#38BDF8]" />
                <h3 className="text-lg font-semibold">Scheduled Tour</h3>
              </div>
              
              <div className="space-y-2 text-sm">
                <p className="font-medium">Michael R.</p>
                <p className="text-gray-300">(555) 723-9481</p>
                <p className="text-gray-300">michael@email.com</p>
                <p className="text-gray-300">Move-in: 10/8/25</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
