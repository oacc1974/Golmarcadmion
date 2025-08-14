'use client';

import React from 'react';
import { Doughnut } from 'react-chartjs-2';
import { 
  Chart as ChartJS, 
  ArcElement, 
  Tooltip, 
  Legend 
} from 'chart.js';
import { FiClock, FiDollarSign, FiUsers } from 'react-icons/fi';

// Register Chart.js components
ChartJS.register(
  ArcElement,
  Tooltip,
  Legend
);

interface ShiftSummaryProps {
  data: {
    shifts: {
      today: {
        count: number;
        total_cash: number;
        total_card: number;
        total_other: number;
        employees: string[];
      };
      open: {
        count: number;
        employees: string[];
      };
    };
  };
}

export default function ShiftSummary({ data }: ShiftSummaryProps) {
  // Format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(value);
  };

  // Calculate total
  const totalSales = data.shifts.today.total_cash + data.shifts.today.total_card + data.shifts.today.total_other;

  // Chart data for payment methods
  const chartData = {
    labels: ['Cash', 'Card', 'Other'],
    datasets: [
      {
        data: [
          data.shifts.today.total_cash,
          data.shifts.today.total_card,
          data.shifts.today.total_other,
        ],
        backgroundColor: [
          'rgba(34, 197, 94, 0.8)',
          'rgba(59, 130, 246, 0.8)',
          'rgba(168, 85, 247, 0.8)',
        ],
        borderColor: [
          'rgba(34, 197, 94, 1)',
          'rgba(59, 130, 246, 1)',
          'rgba(168, 85, 247, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom' as const,
      },
    },
    cutout: '70%',
  };

  return (
    <div className="card">
      <h2 className="text-xl font-semibold mb-4">Shift Summary</h2>
      
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-gray-50 p-4 rounded-lg flex flex-col items-center justify-center">
          <FiClock className="text-primary-500 mb-1" size={20} />
          <p className="text-sm text-gray-500">Today's Shifts</p>
          <p className="text-xl font-bold">{data.shifts.today.count}</p>
        </div>
        
        <div className="bg-gray-50 p-4 rounded-lg flex flex-col items-center justify-center">
          <FiDollarSign className="text-green-500 mb-1" size={20} />
          <p className="text-sm text-gray-500">Total Sales</p>
          <p className="text-xl font-bold">{formatCurrency(totalSales)}</p>
        </div>
        
        <div className="bg-gray-50 p-4 rounded-lg flex flex-col items-center justify-center">
          <FiUsers className="text-blue-500 mb-1" size={20} />
          <p className="text-sm text-gray-500">Open Shifts</p>
          <p className="text-xl font-bold">{data.shifts.open.count}</p>
        </div>
      </div>
      
      <div className="flex flex-col md:flex-row gap-6">
        <div className="flex-1">
          <h3 className="text-sm font-medium mb-2">Payment Methods</h3>
          <div className="h-48">
            <Doughnut data={chartData} options={chartOptions} />
          </div>
        </div>
        
        <div className="flex-1">
          <h3 className="text-sm font-medium mb-2">Today's Employees</h3>
          <div className="bg-gray-50 p-3 rounded-lg max-h-48 overflow-y-auto">
            {data.shifts.today.employees.length > 0 ? (
              <ul className="space-y-1">
                {data.shifts.today.employees.map((employee, index) => (
                  <li key={index} className="text-sm py-1 border-b border-gray-100 last:border-0">
                    {employee}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-gray-500 text-center py-4">No employees on shift today</p>
            )}
          </div>
          
          {data.shifts.open.count > 0 && (
            <>
              <h3 className="text-sm font-medium mt-4 mb-2">Currently on Shift</h3>
              <div className="bg-gray-50 p-3 rounded-lg">
                <ul className="space-y-1">
                  {data.shifts.open.employees.map((employee, index) => (
                    <li key={index} className="text-sm py-1 border-b border-gray-100 last:border-0">
                      {employee}
                    </li>
                  ))}
                </ul>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
