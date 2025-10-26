import React from 'react';
import { Shield, FileText, Calendar, Clock } from 'lucide-react';

const benefits = [
  {
    icon: Shield,
    title: "Never worry about a missed lead",
    description: "Leo gives you confidence that every opportunity is handled",
  },
  {
    icon: FileText,
    title: "Capture and log every lead — automatically",
    description: "Leo collects prospect info during the call and sends it to your CRM or inbox for follow-up",
  },
  {
    icon: Calendar,
    title: "Book more property tours",
    description: "Seamlessly schedule visits while the prospect is still on the phone",
  },
  {
    icon: Clock,
    title: "Answer calls 24/7 — no extra staff",
    description: "Leo works nights, weekends, and lunch breaks without missing a beat",
  },
];

const Benefits: React.FC = () => {
  return (
    <section id="benefits" className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-[#1E293B] mb-4">
            Why property managers choose Leo
          </h2>
          <p className="text-xl text-[#64748B] max-w-2xl mx-auto">
            Built specifically for small leasing teams who need to capture every opportunity
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {benefits.map((benefit, index) => (
            <div 
              key={index} 
              className="bg-[#F9FAFB] p-8 rounded-2xl border border-[#E5E7EB] hover:shadow-lg transition-all duration-300 hover:-translate-y-1 group"
            >
              <div className="flex flex-col items-start space-y-4">
                <div className="w-12 h-12 bg-iconbg rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <benefit.icon className="w-6 h-6 text-[#1E293B]" />
                </div>
                
                <h3 className="text-xl font-bold text-[#1E293B]">
                  {benefit.title}
                </h3>
                
                <p className="text-[#64748B] leading-relaxed">
                  {benefit.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Benefits;