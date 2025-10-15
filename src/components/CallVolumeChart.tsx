import React, { useEffect, useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { getCallVolumeData, debugCallCounts } from '../lib/dashboard';
import type { CallVolumeData } from '../lib/dashboard';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface CallVolumeChartProps {
  days?: number;
  className?: string;
}

const CallVolumeChart: React.FC<CallVolumeChartProps> = ({ days = 30, className = '' }) => {
  // All hooks must be at the top in the same order every time
  const [chartData, setChartData] = useState<CallVolumeData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState(days);
  const [debugInfo, setDebugInfo] = useState<{
    totalRecords: number;
    organizationRecords: number;
    dateRangeRecords: { [key: string]: number };
  } | null>(null);

  // Load chart data and debug info
  useEffect(() => {
    const loadChartData = async () => {
      setIsLoading(true);
      try {
        // Debug call counts first
        const debugData = await debugCallCounts();
        console.log('Debug Call Counts:', debugData);
        setDebugInfo(debugData);
        
        const data = await getCallVolumeData(selectedPeriod);
        setChartData(data);
      } catch (error) {
        console.error('Error loading chart data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadChartData();
  }, [selectedPeriod]);

  // Format dates for display
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    if (selectedPeriod <= 7) {
      return date.toLocaleDateString('en-US', { weekday: 'short' });
    } else if (selectedPeriod <= 30) {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    } else {
      return date.toLocaleDateString('en-US', { month: 'short' });
    }
  };

  // Prepare chart data
  const data = {
    labels: chartData.map(item => formatDate(item.date)),
    datasets: [
      {
        label: 'Total Calls',
        data: chartData.map(item => item.calls),
        borderColor: 'rgb(56, 189, 248)', // Blue color matching your theme
        backgroundColor: 'rgba(56, 189, 248, 0.1)',
        borderWidth: 3,
        fill: true,
        tension: 0.4,
        pointBackgroundColor: 'rgb(56, 189, 248)',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
      },
      {
        label: 'Tours Scheduled',
        data: chartData.map(item => item.tours),
        borderColor: 'rgb(16, 185, 129)', // Green color
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        borderWidth: 3,
        fill: true,
        tension: 0.4,
        pointBackgroundColor: 'rgb(16, 185, 129)',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          usePointStyle: true,
          padding: 20,
          font: {
            size: 12,
            weight: '500' as const,
          },
        },
      },
      title: {
        display: false,
      },
      tooltip: {
        backgroundColor: 'rgba(30, 41, 59, 0.95)',
        titleColor: '#fff',
        bodyColor: '#fff',
        borderColor: 'rgba(56, 189, 248, 0.3)',
        borderWidth: 1,
        cornerRadius: 8,
        displayColors: true,
        intersect: false,
        mode: 'index' as const,
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: '#64748B',
          font: {
            size: 11,
          },
        },
      },
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(148, 163, 184, 0.1)',
        },
        ticks: {
          color: '#64748B',
          font: {
            size: 11,
          },
        },
      },
    },
    interaction: {
      intersect: false,
      mode: 'index' as const,
    },
  };

  const handlePeriodChange = (newDays: number) => {
    setSelectedPeriod(newDays);
  };

  // Calculate totals using debug info for accurate counts
  const getTotalCalls = () => {
    if (!debugInfo) return chartData.reduce((sum, item) => sum + item.calls, 0);
    
    // Map selected period to debug keys
    const debugKey = selectedPeriod === 7 ? '7days' : 
                    selectedPeriod === 30 ? '30days' : 
                    selectedPeriod === 90 ? '90days' : 'allTime';
    
    return debugInfo.dateRangeRecords?.[debugKey] || chartData.reduce((sum, item) => sum + item.calls, 0);
  };
  
  const totalCalls = getTotalCalls();
  const totalTours = chartData.reduce((sum, item) => sum + item.tours, 0);

  if (isLoading) {
    return (
      <div className={`bg-gray-50 rounded-xl p-6 ${className}`}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold text-[#1E293B]">Call Volume Trends</h3>
          <div className="flex space-x-2">
            <button className="px-3 py-1 text-sm bg-gray-200 text-gray-700 rounded-lg">7D</button>
            <button className="px-3 py-1 text-sm bg-gray-200 text-gray-700 rounded-lg">30D</button>
            <button className="px-3 py-1 text-sm bg-gray-200 text-gray-700 rounded-lg">90D</button>
          </div>
        </div>
        <div className="h-64 bg-white rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#38BDF8] mx-auto mb-2"></div>
            <p className="text-gray-500">Loading chart data...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-gray-50 rounded-xl p-6 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-xl font-semibold text-[#1E293B]">Call Volume Trends</h3>
          <p className="text-sm text-[#64748B] mt-1">
            {totalCalls} total calls • {totalTours} tours scheduled
          </p>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => handlePeriodChange(7)}
            className={`px-3 py-1 text-sm rounded-lg transition-colors ${
              selectedPeriod === 7
                ? 'bg-[#38BDF8] text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            7D
          </button>
          <button
            onClick={() => handlePeriodChange(30)}
            className={`px-3 py-1 text-sm rounded-lg transition-colors ${
              selectedPeriod === 30
                ? 'bg-[#38BDF8] text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            30D
          </button>
          <button
            onClick={() => handlePeriodChange(90)}
            className={`px-3 py-1 text-sm rounded-lg transition-colors ${
              selectedPeriod === 90
                ? 'bg-[#38BDF8] text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            90D
          </button>
        </div>
      </div>
      
      <div className="h-64 bg-white rounded-lg p-4 border border-gray-200">
        {chartData.length === 0 ? (
          <div className="h-full flex items-center justify-center">
            <div className="text-center">
              <svg className="w-12 h-12 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <p className="text-gray-500">No call data available</p>
              <p className="text-sm text-gray-400">Data will appear here once calls are made</p>
            </div>
          </div>
        ) : (
          <Line data={data} options={options} />
        )}
      </div>
    </div>
  );
};

export default CallVolumeChart;