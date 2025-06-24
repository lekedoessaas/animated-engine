
import { DashboardLayout } from '@/components/DashboardLayout';
import { PayoutDashboard } from '@/components/PayoutDashboard';

const Payouts = () => {
  return (
    <DashboardLayout>
      <div className="p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Payouts</h1>
          <p className="text-gray-600 mt-2">Manage your earnings and payout preferences</p>
        </div>
        
        <PayoutDashboard />
      </div>
    </DashboardLayout>
  );
};

export default Payouts;
