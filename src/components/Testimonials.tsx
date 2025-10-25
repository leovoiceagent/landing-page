import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
// import { openVoiceChat } from '../lib/chatWidget';

const testimonials = [
  {
    quote: "Leo fills our tour calendar while we sleep. We haven't missed a single new inquiry since launch.",
    author: "Tanya R.",
    title: "Leasing Manager, Houston",
    featured: true,
  },
  {
    quote: "Tenants actually say thank you on the call. It sounds human — not robotic.",
    author: "Jason M.",
    title: "Property Owner, Florida",
  },
  {
    quote: "I've captured 5 more leads per week with zero extra effort.",
    author: "Priya S.",
    title: "Solo Property Manager, Chicago",
  },
  {
    quote: "It's like having a full-time receptionist I never have to train.",
    author: "Daniel G.",
    title: "Regional Manager, California",
  },
  {
    quote: "I was skeptical at first — now I can't imagine running my office without it.",
    author: "Mel",
    title: "Assistant Property Manager, Arizona",
  },
];

const Testimonials: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  // Auto-scroll every 6 seconds
  useEffect(() => {
    if (!isAutoPlaying) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    }, 6000);

    return () => clearInterval(interval);
  }, [isAutoPlaying]);

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  const getVisibleTestimonials = () => {
    const result = [];
    for (let i = 0; i < 3; i++) {
      const index = (currentIndex + i) % testimonials.length;
      result.push({ ...testimonials[index], index });
    }
    return result;
  };

  return (
    <section 
      id="testimonials" 
      className="py-20 px-4 sm:px-6 lg:px-8 bg-white"
      onMouseEnter={() => setIsAutoPlaying(false)}
      onMouseLeave={() => setIsAutoPlaying(true)}
    >
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-[#1E293B] mb-4">
            From missed calls to booked tours — meet Leo in action
          </h2>
        </div>

        {/* Desktop Carousel - 3 cards */}
        <div className="hidden md:block relative">
          <div className="grid grid-cols-3 gap-8 mb-8">
            {getVisibleTestimonials().map((testimonial, i) => (
              <div 
                key={`${testimonial.index}-${i}`}
                className={`bg-[#F9FAFB] p-8 rounded-2xl border border-[#E5E7EB] shadow-sm relative transition-all duration-500 ${
                  testimonial.featured ? 'ring-2 ring-[#F7EF00] ring-opacity-50' : ''
                }`}
              >
                {/* Quote mark */}
                <div className="absolute top-4 left-4 text-6xl text-[#E5E7EB] font-serif leading-none">
                  "
                </div>
                
                <div className="relative z-10 pt-8">
                  <blockquote className="text-[#1E293B] text-lg leading-relaxed mb-6">
                    {testimonial.quote}
                  </blockquote>
                  
                  <div className="text-[#64748B] text-sm">
                    <p className="font-semibold">— {testimonial.author}</p>
                    <p>{testimonial.title}</p>
                  </div>
                </div>

                {testimonial.featured && (
                  <div className="absolute top-0 right-0 bg-[#F7EF00] text-[#1E293B] px-3 py-1 rounded-bl-xl rounded-tr-2xl text-xs font-bold">
                    TOP RATED
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Navigation Arrows */}
          <div className="flex justify-center items-center space-x-4">
            <button 
              onClick={prevSlide}
              className="p-2 rounded-full bg-iconbg text-[#1E293B] hover:bg-iconbg/90 transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            {/* Dots */}
            <div className="flex space-x-2">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToSlide(index)}
                  className={`w-3 h-3 rounded-full transition-colors ${
                    index === currentIndex ? 'bg-[#F7EF00]' : 'bg-[#E5E7EB]'
                  }`}
                />
              ))}
            </div>

            <button 
              onClick={nextSlide}
              className="p-2 rounded-full bg-iconbg text-[#1E293B] hover:bg-iconbg/90 transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Mobile Carousel - 1 card */}
        <div className="md:hidden">
          <div className="mb-8">
            <div className="bg-[#F9FAFB] p-6 rounded-2xl border border-[#E5E7EB] shadow-sm relative">
              <div className="absolute top-4 left-4 text-4xl text-[#E5E7EB] font-serif leading-none">
                "
              </div>
              
              <div className="relative z-10 pt-6">
                <blockquote className="text-[#1E293B] leading-relaxed mb-6">
                  {testimonials[currentIndex].quote}
                </blockquote>
                
                <div className="text-[#64748B] text-sm">
                  <p className="font-semibold">— {testimonials[currentIndex].author}</p>
                  <p>{testimonials[currentIndex].title}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Mobile Navigation */}
          <div className="flex justify-center space-x-2">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`w-3 h-3 rounded-full transition-colors ${
                  index === currentIndex ? 'bg-[#F7EF00]' : 'bg-[#E5E7EB]'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;