import React, { useState } from 'react';
import { Calculator, RotateCcw } from 'lucide-react';

interface FormData {
  totalCalls: number;
  afterHoursPercent: number;
  leadQualityRate: number;
  leadToTourRate: number;
  tourToLeaseRate: number;
  averageRent: number;
  averageStayDuration: number;
}

interface Results {
  monthlyCalls: number;
  qualifiedLeads: number;
  toursLost: number;
  leasesLost: number;
  monthlyLoss: number;
  annualLoss: number;
  lifetimeLoss: number;
}

const ROICalculator: React.FC = () => {
  const [formData, setFormData] = useState<FormData>({
    totalCalls: 20,
    afterHoursPercent: 60,
    leadQualityRate: 20,
    leadToTourRate: 25,
    tourToLeaseRate: 35,
    averageRent: 1500,
    averageStayDuration: 2
  });

  const [results, setResults] = useState<Results | null>(null);
  const [showResults, setShowResults] = useState(false);

  const handleInputChange = (field: keyof FormData, value: string) => {
    const numValue = parseFloat(value) || 0;
    setFormData(prev => ({
      ...prev,
      [field]: numValue
    }));
  };

  const calculateResults = (e: React.FormEvent) => {
    e.preventDefault();
    
    const {
      totalCalls,
      afterHoursPercent,
      leadQualityRate,
      leadToTourRate,
      tourToLeaseRate,
      averageRent,
      averageStayDuration
    } = formData;

    // Calculations based on provided formula
    const dailyAfterHoursCalls = totalCalls * (afterHoursPercent / 100);
    const monthlyMissedCalls = dailyAfterHoursCalls * 30;
    const qualifiedLeadsLost = monthlyMissedCalls * (leadQualityRate / 100);
    const toursLost = qualifiedLeadsLost * (leadToTourRate / 100);
    const leasesLost = toursLost * (tourToLeaseRate / 100);
    const monthlyRevenueLoss = leasesLost * averageRent;
    const annualImpact = monthlyRevenueLoss * 12;
    const lifetimeValueLoss = annualImpact * averageStayDuration;

    const calculatedResults: Results = {
      monthlyCalls: monthlyMissedCalls,
      qualifiedLeads: qualifiedLeadsLost,
      toursLost: toursLost,
      leasesLost: leasesLost,
      monthlyLoss: monthlyRevenueLoss,
      annualLoss: annualImpact,
      lifetimeLoss: lifetimeValueLoss
    };

    setResults(calculatedResults);
    setShowResults(true);
  };

  const resetForm = () => {
    setFormData({
      totalCalls: 20,
      afterHoursPercent: 60,
      leadQualityRate: 20,
      leadToTourRate: 25,
      tourToLeaseRate: 35,
      averageRent: 1500,
      averageStayDuration: 2
    });
    setShowResults(false);
    setResults(null);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { 
      style: 'currency', 
      currency: 'USD', 
      minimumFractionDigits: 0 
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US', { 
      minimumFractionDigits: 1, 
      maximumFractionDigits: 1 
    }).format(num);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-[#1E293B] mb-4">
            Revenue Leakage Calculator
          </h1>
          <p className="text-xl text-[#64748B] max-w-2xl mx-auto">
            Enter your leasing metrics to discover your potential revenue loss from missed calls
          </p>
        </div>

        {/* Calculator Card */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <form onSubmit={calculateResults} className="space-y-6">
            {/* Input Fields Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left Column */}
              <div className="space-y-6">
                <div>
                  <label htmlFor="totalCalls" className="block text-sm font-medium text-[#1E293B] mb-2">
                    Total Calls per Day
                  </label>
                  <input
                    type="number"
                    id="totalCalls"
                    value={formData.totalCalls}
                    onChange={(e) => handleInputChange('totalCalls', e.target.value)}
                    min="0"
                    step="1"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#38BDF8] focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="leadQualityRate" className="block text-sm font-medium text-[#1E293B] mb-2">
                    Lead Quality Rate (%)
                  </label>
                  <input
                    type="number"
                    id="leadQualityRate"
                    value={formData.leadQualityRate}
                    onChange={(e) => handleInputChange('leadQualityRate', e.target.value)}
                    min="0"
                    max="100"
                    step="1"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#38BDF8] focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="tourToLeaseRate" className="block text-sm font-medium text-[#1E293B] mb-2">
                    Tour-to-Lease Rate (%)
                  </label>
                  <input
                    type="number"
                    id="tourToLeaseRate"
                    value={formData.tourToLeaseRate}
                    onChange={(e) => handleInputChange('tourToLeaseRate', e.target.value)}
                    min="0"
                    max="100"
                    step="1"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#38BDF8] focus:border-transparent"
                    required
                  />
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-6">
                <div>
                  <label htmlFor="afterHoursPercent" className="block text-sm font-medium text-[#1E293B] mb-2">
                    After-Hours Call % <span className="text-sm text-gray-500">(60% typical)</span>
                  </label>
                  <input
                    type="number"
                    id="afterHoursPercent"
                    value={formData.afterHoursPercent}
                    onChange={(e) => handleInputChange('afterHoursPercent', e.target.value)}
                    min="0"
                    max="100"
                    step="1"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#38BDF8] focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="leadToTourRate" className="block text-sm font-medium text-[#1E293B] mb-2">
                    Lead-to-Tour Rate (%)
                  </label>
                  <input
                    type="number"
                    id="leadToTourRate"
                    value={formData.leadToTourRate}
                    onChange={(e) => handleInputChange('leadToTourRate', e.target.value)}
                    min="0"
                    max="100"
                    step="1"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#38BDF8] focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="averageRent" className="block text-sm font-medium text-[#1E293B] mb-2">
                    Average Monthly Rent ($)
                  </label>
                  <input
                    type="number"
                    id="averageRent"
                    value={formData.averageRent}
                    onChange={(e) => handleInputChange('averageRent', e.target.value)}
                    min="0"
                    step="1"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#38BDF8] focus:border-transparent"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Bottom Row - Full Width */}
            <div>
              <label htmlFor="averageStayDuration" className="block text-sm font-medium text-[#1E293B] mb-2">
                Average Stay Duration (Years)
              </label>
              <input
                type="number"
                id="averageStayDuration"
                value={formData.averageStayDuration}
                onChange={(e) => handleInputChange('averageStayDuration', e.target.value)}
                min="0"
                step="0.1"
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#38BDF8] focus:border-transparent"
                required
              />
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <button
                type="submit"
                className="flex-1 bg-[#38BDF8] text-white p-4 rounded-lg hover:bg-[#0EA5E9] focus:outline-none focus:ring-2 focus:ring-[#38BDF8] focus:ring-offset-2 transition-colors flex items-center justify-center space-x-2 font-semibold"
              >
                <Calculator className="w-5 h-5" />
                <span>Calculate Revenue Loss</span>
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="flex-1 bg-gray-600 text-white p-4 rounded-lg hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-600 focus:ring-offset-2 transition-colors flex items-center justify-center space-x-2 font-semibold"
              >
                <RotateCcw className="w-5 h-5" />
                <span>Reset Numbers</span>
              </button>
            </div>
          </form>

          {/* Results Section */}
          {showResults && results && (
            <div className="mt-8 p-6 bg-gradient-to-r from-[#38BDF8] to-[#0EA5E9] rounded-xl text-white">
              <h2 className="text-2xl font-bold mb-6">Revenue Leakage Results</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <p className="text-blue-100">
                    Monthly After-Hours Calls: <span className="font-bold text-white">{formatNumber(results.monthlyCalls)}</span>
                  </p>
                  <p className="text-blue-100">
                    Qualified Prospects Lost: <span className="font-bold text-white">{formatNumber(results.qualifiedLeads)}</span>
                  </p>
                  <p className="text-blue-100">
                    Tours Lost: <span className="font-bold text-white">{formatNumber(results.toursLost)}</span>
                  </p>
                </div>
                <div className="space-y-3">
                  <p className="text-blue-100">
                    Leases Lost: <span className="font-bold text-white">{formatNumber(results.leasesLost)}</span>
                  </p>
                  <p className="text-blue-100">
                    Monthly Revenue Loss: <span className="font-bold text-white">{formatCurrency(results.monthlyLoss)}</span>
                  </p>
                  <p className="text-blue-100">
                    Annual Revenue Loss: <span className="font-bold text-white">{formatCurrency(results.annualLoss)}</span>
                  </p>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-blue-300">
                <p className="text-blue-100 text-center">
                  Lifetime Value Loss: <span className="font-bold text-white text-xl">{formatCurrency(results.lifetimeLoss)}</span>
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ROICalculator;
