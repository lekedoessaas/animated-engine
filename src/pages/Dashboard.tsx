
import React from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { DashboardStats } from '@/components/DashboardStats';
import { SubscriptionGuard } from '@/components/SubscriptionGuard';

const Dashboard = () => {
  return (
    <SubscriptionGuard>
      <DashboardLayout>
        <div className="p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600 mt-2">Welcome to your PayLockr dashboard</p>
          </div>
          <DashboardStats />
        </div>
      </DashboardLayout>
    </SubscriptionGuard>
  );
};

export default Dashboard;
