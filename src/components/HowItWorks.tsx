import React, { useEffect, useRef, useState } from 'react';
import { Phone, FileText, Calendar, Bell } from 'lucide-react';

const steps = [
  {
    icon: Phone,
    title: "Answers the call",
    description: "Greets every new prospect within 3 rings — even after hours.",
  },
  {
    icon: FileText,
    title: "Captures each prospect's details",
    description: "Gets name, number, email, and what they're looking for.",
  },
  {
    icon: Calendar,
    title: "Books a tour",
    description: "Leo handles bookings and logs the info for your team.",
  },
  {
    icon: Bell,
    title: "Hands off to your team",
    description: "Your staff is looped in instantly — no missed opportunities.",
  },
];

interface HowItWorksProps {
  onStartVoiceDemo?: () => void;
}

const HowItWorks: React.FC<HowItWorksProps> = ({ onStartVoiceDemo }) => {
  const [visibleSteps, setVisibleSteps] = useState<number[]>([]);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // Animate steps sequentially
            steps.forEach((_, index) => {
              setTimeout(() => {
                setVisibleSteps(prev => [...prev, index]);
              }, index * 200);
            });
          }
        });
      },
      { threshold: 0.3 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <section 
      ref={sectionRef}
      id="how-it-works" 
      className="py-20 px-4 sm:px-6 lg:px-8 bg-[#F5F3EF]"
    >
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-[#1E293B] mb-4">
            HOW LEO WORKS
          </h2>
          <p className="text-xl text-[#64748B] max-w-2xl mx-auto">
            Four simple steps to never miss another leasing opportunity
          </p>
        </div>

        {/* Desktop Layout */}
        <div className="hidden lg:block">
          <div className="relative">
            {/* Connection Line */}
            <div className="absolute top-12 left-1/2 transform -translate-x-1/2 w-3/4 h-0.5 bg-[#E5E7EB]"></div>
            
            <div className="grid grid-cols-4 gap-8">
              {steps.map((step, index) => (
                <div 
                  key={index}
                  className={`text-center transition-all duration-500 ${
                    visibleSteps.includes(index) 
                      ? 'opacity-100 translate-y-0' 
                      : 'opacity-0 translate-y-8'
                  }`}
                >
                  <div className="mb-6">
                    <div className="w-24 h-24 bg-iconbg rounded-full flex items-center justify-center mx-auto shadow-lg">
                      <step.icon className="w-10 h-10 text-[#1E293B]" />
                    </div>
                  </div>

                  <h3 className="text-lg font-bold text-[#1E293B] mb-3 flex items-center justify-center space-x-2">
                    <span className="w-6 h-6 bg-iconbg text-white rounded-full flex items-center justify-center text-sm font-bold">
                      {index + 1}
                    </span>
                    <span>{step.title}</span>
                  </h3>
                  
                  <p className="text-[#64748B] text-sm leading-relaxed">
                    {step.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Mobile Layout */}
        <div className="lg:hidden space-y-8">
          {steps.map((step, index) => (
            <div 
              key={index}
              className={`flex items-start space-x-4 transition-all duration-500 ${
                visibleSteps.includes(index) 
                  ? 'opacity-100 translate-x-0' 
                  : 'opacity-0 translate-x-8'
              }`}
            >
              <div className="flex-shrink-0">
                <div className="w-16 h-16 bg-iconbg rounded-full flex items-center justify-center shadow-lg">
                  <step.icon className="w-8 h-8 text-[#1E293B]" />
                </div>
              </div>

              <div className="flex-1">
                <h3 className="text-lg font-bold text-[#1E293B] mb-2 flex items-center space-x-2">
                  <span className="w-6 h-6 bg-iconbg text-white rounded-full flex items-center justify-center text-sm font-bold">
                    {index + 1}
                  </span>
                  <span>{step.title}</span>
                </h3>
                <p className="text-[#64748B] leading-relaxed">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Voice Demo CTA - MOVED FROM TESTIMONIALS */}
        <div className="text-center mt-16">
          <button 
            onClick={onStartVoiceDemo || (() => alert('Chat widget temporarily disabled'))} 
            className="bg-[#F7EF00] text-[#1E293B] px-8 py-4 rounded-2xl text-lg font-semibold hover:bg-[#F7EF00]/90 transition-all duration-300 hover:scale-105 hover:shadow-lg inline-flex items-center space-x-2 group"
          >
            <span>Let Leo take your next call</span>
            <span className="group-hover:translate-x-1 transition-transform">→</span>
          </button>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
