
import React, { useState } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { FileUpload } from '@/components/FileUpload';
import { FileManager } from '@/components/FileManager';
import { SubscriptionGuard } from '@/components/SubscriptionGuard';

const Files = () => {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleFileUploaded = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <SubscriptionGuard>
      <DashboardLayout>
        <div className="p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Files</h1>
            <p className="text-gray-600 mt-2">Upload, protect, and manage your digital assets</p>
          </div>

          <div className="space-y-8">
            <FileUpload onFileUploaded={handleFileUploaded} />
            <FileManager refreshTrigger={refreshTrigger} />
          </div>
        </div>
      </DashboardLayout>
    </SubscriptionGuard>
  );
};

export default Files;
