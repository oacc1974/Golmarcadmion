'use client';

import React from 'react';
import { Bar } from 'react-chartjs-2';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  BarElement, 
  Title, 
  Tooltip, 
  Legend 
} from 'chart.js';
import { FiTrendingUp, FiTrendingDown } from 'react-icons/fi';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface SalesSummaryProps {
  data: {
    today: {
      date: string;
      total_sales: number;
      receipt_count: number;
      day_over_day_change: number;
    };
    yesterday: {
      date: string;
      total_sales: number;
    };
    current_week: {
      start_date: string;
      end_date: string;
      total_sales: number;
    };
    current_month: {
      start_date: string;
      end_date: string;
      total_sales: number;
    };
  };
}

export default function SalesSummary({ data }: SalesSummaryProps) {
  // Format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(value);
  };

  // Chart data
  const chartData = {
    labels: ['Today', 'Yesterday', 'This Week', 'This Month'],
    datasets: [
      {
        label: 'Sales',
        data: [
          data.today.total_sales,
          data.yesterday.total_sales,
          data.current_week.total_sales,
          data.current_month.total_sales,
        ],
        backgroundColor: [
          'rgba(14, 165, 233, 0.8)',
          'rgba(14, 165, 233, 0.6)',
          'rgba(14, 165, 233, 0.4)',
          'rgba(14, 165, 233, 0.2)',
        ],
        borderColor: [
          'rgba(14, 165, 233, 1)',
          'rgba(14, 165, 233, 1)',
          'rgba(14, 165, 233, 1)',
          'rgba(14, 165, 233, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  return (
    <div className="card">
      <h2 className="text-xl font-semibold mb-4">Sales Summary</h2>
      
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-gray-50 p-4 rounded-lg">
          <p className="text-sm text-gray-500">Today's Sales</p>
          <p className="text-xl font-bold">{formatCurrency(data.today.total_sales)}</p>
          <div className="flex items-center mt-1">
            <span className={`text-sm ${data.today.day_over_day_change >= 0 ? 'text-green-500' : 'text-red-500'} flex items-center`}>
              {data.today.day_over_day_change >= 0 ? (
                <FiTrendingUp className="mr-1" />
              ) : (
                <FiTrendingDown className="mr-1" />
              )}
              {Math.abs(data.today.day_over_day_change).toFixed(1)}% vs yesterday
            </span>
          </div>
        </div>
        
        <div className="bg-gray-50 p-4 rounded-lg">
          <p className="text-sm text-gray-500">Today's Transactions</p>
          <p className="text-xl font-bold">{data.today.receipt_count}</p>
          <p className="text-sm text-gray-500 mt-1">
            Avg: {formatCurrency(data.today.receipt_count > 0 ? data.today.total_sales / data.today.receipt_count : 0)}
          </p>
        </div>
      </div>
      
      <div className="mb-4">
        <Bar data={chartData} options={chartOptions} height={200} />
      </div>
      
      <div className="grid grid-cols-2 gap-4 mt-4">
        <div>
          <p className="text-sm font-medium">This Week</p>
          <p className="text-lg">{formatCurrency(data.current_week.total_sales)}</p>
          <p className="text-xs text-gray-500">
            {data.current_week.start_date} - {data.current_week.end_date}
          </p>
        </div>
        
        <div>
          <p className="text-sm font-medium">This Month</p>
          <p className="text-lg">{formatCurrency(data.current_month.total_sales)}</p>
          <p className="text-xs text-gray-500">
            {data.current_month.start_date} - {data.current_month.end_date}
          </p>
        </div>
      </div>
    </div>
  );
}
