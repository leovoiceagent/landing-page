import React, { useState } from 'react';
import { X, Calculator, RotateCcw } from 'lucide-react';

interface ROICalculatorModalProps {
  onClose: () => void;
}

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

const ROICalculatorModal: React.FC<ROICalculatorModalProps> = ({ onClose }) => {
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

    // Calculation logic
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
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header - Sticky */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex justify-between items-center rounded-t-2xl z-10">
          <div>
            <h2 className="text-2xl font-bold text-[#1E293B]">
              Revenue Leakage Calculator
            </h2>
            <p className="text-sm text-[#64748B] mt-1">
              Discover your potential revenue loss from missed calls
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Close calculator"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Calculator Content - Scrollable */}
        <div className="p-6">
          {!showResults && (
          <form onSubmit={calculateResults} className="space-y-4">
            {/* Input Fields - Two Column Grid, Logical Order */}
            <div className="grid grid-cols-2 gap-x-4 gap-y-3">
              {/* Daily Operations */}
              <div>
                <label htmlFor="totalCalls" className="block text-xs font-medium text-[#1E293B] mb-1">
                  Total Calls per Day
                </label>
                <input
                  type="number"
                  id="totalCalls"
                  value={formData.totalCalls}
                  onChange={(e) => handleInputChange('totalCalls', e.target.value)}
                  min="0"
                  step="1"
                  className="w-full p-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#38BDF8] focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label htmlFor="afterHoursPercent" className="block text-xs font-medium text-[#1E293B] mb-1">
                  After-Hours % <span className="text-xs text-gray-500">(60% typical)</span>
                </label>
                <input
                  type="number"
                  id="afterHoursPercent"
                  value={formData.afterHoursPercent}
                  onChange={(e) => handleInputChange('afterHoursPercent', e.target.value)}
                  min="0"
                  max="100"
                  step="1"
                  className="w-full p-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#38BDF8] focus:border-transparent"
                  required
                />
              </div>

              {/* Conversion Funnel */}
              <div>
                <label htmlFor="leadQualityRate" className="block text-xs font-medium text-[#1E293B] mb-1">
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
                  className="w-full p-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#38BDF8] focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label htmlFor="leadToTourRate" className="block text-xs font-medium text-[#1E293B] mb-1">
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
                  className="w-full p-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#38BDF8] focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label htmlFor="tourToLeaseRate" className="block text-xs font-medium text-[#1E293B] mb-1">
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
                  className="w-full p-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#38BDF8] focus:border-transparent"
                  required
                />
              </div>

              {/* Financial Metrics */}
              <div>
                <label htmlFor="averageRent" className="block text-xs font-medium text-[#1E293B] mb-1">
                  Average Monthly Rent ($)
                </label>
                <input
                  type="number"
                  id="averageRent"
                  value={formData.averageRent}
                  onChange={(e) => handleInputChange('averageRent', e.target.value)}
                  min="0"
                  step="1"
                  className="w-full p-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#38BDF8] focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label htmlFor="averageStayDuration" className="block text-xs font-medium text-[#1E293B] mb-1">
                  Avg Stay Duration (Years)
                </label>
                <input
                  type="number"
                  id="averageStayDuration"
                  value={formData.averageStayDuration}
                  onChange={(e) => handleInputChange('averageStayDuration', e.target.value)}
                  min="0"
                  step="0.1"
                  className="w-full p-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#38BDF8] focus:border-transparent"
                  required
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                type="submit"
                className="flex-1 bg-[#38BDF8] text-white px-6 py-3 rounded-lg hover:bg-[#0EA5E9] focus:outline-none focus:ring-2 focus:ring-[#38BDF8] focus:ring-offset-2 transition-colors flex items-center justify-center space-x-2 font-semibold text-sm"
              >
                <Calculator className="w-4 h-4" />
                <span>Calculate Revenue Loss</span>
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="sm:w-auto bg-gray-600 text-white px-5 py-3 rounded-lg hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-600 focus:ring-offset-2 transition-colors flex items-center justify-center space-x-2 font-semibold text-sm"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Reset</span>
              </button>
            </div>
          </form>
          )}

          {/* Results Section */}
          {showResults && results && (
            <div className="p-6 bg-gradient-to-r from-[#38BDF8] to-[#0EA5E9] rounded-xl text-white">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold">Your Revenue Leakage</h3>
                <button
                  onClick={resetForm}
                  className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg transition-colors flex items-center space-x-2 text-sm font-semibold"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Recalculate</span>
                </button>
              </div>
              <div className="space-y-3">
                <p className="text-blue-100">
                  Lost Leases Per Month: <span className="font-bold text-white">{formatNumber(results.leasesLost)}</span>
                </p>
                <p className="text-blue-100">
                  Monthly Recurring Revenue Lost: <span className="font-bold text-white">{formatCurrency(results.monthlyLoss)}</span>
                </p>
                <p className="text-blue-100">
                  Annual Impact: <span className="font-bold text-white">{formatCurrency(results.annualLoss)}</span>
                </p>
              </div>
              <div className="mt-4 pt-4 border-t border-blue-300">
                <p className="text-blue-100 text-center">
                  Total Lifetime Value Lost: <span className="font-bold text-white text-xl">{formatCurrency(results.lifetimeLoss)}</span>
                </p>
              </div>

              {/* CTA after results - Close modal and scroll to How It Works */}
              <div className="mt-6 p-4 bg-white/10 rounded-lg backdrop-blur-sm">
                <p className="text-white text-center font-semibold mb-3">
                  Leo captures these missed leads automatically — 24/7
                </p>
                <div className="flex justify-center">
                  <button
                    onClick={() => {
                      onClose();
                      setTimeout(() => {
                        document.getElementById('how-it-works')?.scrollIntoView({
                          behavior: 'smooth',
                          block: 'start'
                        });
                      }, 100);
                    }}
                    className="bg-white text-[#38BDF8] px-6 py-3 rounded-lg hover:bg-gray-100 transition-colors font-semibold"
                  >
                    See How Leo Works
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ROICalculatorModal;
