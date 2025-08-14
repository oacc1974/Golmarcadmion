'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useRouter } from 'next/navigation';
import axios from 'axios';

// Dashboard components will be imported here
import DashboardLayout from '../../components/dashboard/DashboardLayout';
import SalesSummary from '../../components/dashboard/SalesSummary';
import ShiftSummary from '../../components/dashboard/ShiftSummary';

export default function DashboardPage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [selectedStore, setSelectedStore] = useState<string>('');
  const [stores, setStores] = useState<any[]>([]);
  const [isDataLoading, setIsDataLoading] = useState(false);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isLoading, isAuthenticated, router]);

  // Fetch stores on component mount
  useEffect(() => {
    if (isAuthenticated) {
      fetchStores();
    }
  }, [isAuthenticated]);

  // Fetch dashboard data when store is selected
  useEffect(() => {
    if (selectedStore) {
      fetchDashboardData();
    }
  }, [selectedStore]);

  const fetchStores = async () => {
    try {
      const response = await axios.get('/api/stores');
      setStores(response.data.data);
      
      // Select the first store by default if user has access
      if (response.data.data.length > 0) {
        const userStores = user?.store_ids || [];
        const availableStore = response.data.data.find(
          (store: any) => userStores.includes(store.loyverse_id)
        );
        
        if (availableStore) {
          setSelectedStore(availableStore.loyverse_id);
        } else if (user?.role === 'admin') {
          // Admin can see all stores
          setSelectedStore(response.data.data[0].loyverse_id);
        }
      }
    } catch (error) {
      console.error('Error fetching stores:', error);
    }
  };

  const fetchDashboardData = async () => {
    setIsDataLoading(true);
    try {
      const response = await axios.get(`/api/reports/dashboard?storeId=${selectedStore}`);
      setDashboardData(response.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setIsDataLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-lg">Loading...</p>
      </div>
    );
  }

  return (
    <DashboardLayout>
      <div className="px-4 py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <div className="flex items-center">
            <label htmlFor="store-select" className="mr-2 text-sm font-medium">
              Store:
            </label>
            <select
              id="store-select"
              value={selectedStore}
              onChange={(e) => setSelectedStore(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-1 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="">Select a store</option>
              {stores.map((store) => (
                <option key={store.loyverse_id} value={store.loyverse_id}>
                  {store.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {isDataLoading ? (
          <div className="flex justify-center items-center h-64">
            <p>Loading dashboard data...</p>
          </div>
        ) : dashboardData ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <SalesSummary data={dashboardData} />
            <ShiftSummary data={dashboardData} />
          </div>
        ) : (
          <div className="text-center py-10">
            <p>Select a store to view dashboard data</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
