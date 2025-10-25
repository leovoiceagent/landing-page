import React from 'react';
import { PhoneOff, Banknote, Clock } from 'lucide-react';

const Problem: React.FC = () => {
  const painPoints = [
    {
      icon: PhoneOff,
      stat: "> 60%",
      label: "of calls unanswered",
      description: "After hours, weekends, lunch breaks—your prospects call when you're unavailable.",
      color: "text-red-600"
    },
    {
      icon: Banknote,
      stat: "$100K+",
      label: "lost revenue annually",
      description: "Missing just 3-5 leases per quarter costs a typical 200-unit property six figures.",
      color: "text-red-600"
    },
    {
      icon: Clock,
      stat: "85%",
      label: "expect 24hr response",
      description: "Modern renters won't wait. When they can't reach you, they've already moved on to the next property.",
      color: "text-red-600"
    }
  ];

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-[#1E293B]">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            The Hidden Cost of Missed Calls
          </h2>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Every day, prospects hang up and call alternative properties instead
          </p>
        </div>

        {/* Pain Points Grid */}
        <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
          {painPoints.map((point, index) => (
            <div key={index} className="text-center">
              {/* Icon */}
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center border border-red-800/30 shadow-lg">
                  <point.icon className={`w-8 h-8 ${point.color}`} />
                </div>
              </div>

              {/* Stat */}
              <div className="text-4xl md:text-5xl font-bold text-white mb-2">
                {point.stat}
              </div>

              {/* Label */}
              <div className="text-lg font-semibold text-gray-200 mb-3">
                {point.label}
              </div>

              {/* Description */}
              <p className="text-gray-300 leading-relaxed">
                {point.description}
              </p>
            </div>
          ))}
        </div>

        {/* Source Citation */}
        <div className="mt-12 text-center">
          <p className="text-sm text-gray-400">
            Sources: Fiona/Digible study (170,825 calls analyzed), Apartments.com 2023 Renter Survey
          </p>
        </div>
      </div>
    </section>
  );
};

export default Problem;
