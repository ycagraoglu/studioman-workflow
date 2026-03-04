import React, { useState } from 'react';
import FlowCanvas from './components/FlowCanvas';
import Dashboard from './components/Dashboard';
import { DrawerProvider } from './contexts/DrawerContext';
import { Toaster } from 'react-hot-toast';

export default function App() {
  const [currentWorkflowId, setCurrentWorkflowId] = useState<string | null>(null);

  return (
    <DrawerProvider>
      <div className="flex h-screen w-full bg-white overflow-hidden font-sans">
        {currentWorkflowId ? (
          <FlowCanvas 
            workflowId={currentWorkflowId} 
            onBack={() => setCurrentWorkflowId(null)} 
          />
        ) : (
          <Dashboard onSelectWorkflow={setCurrentWorkflowId} />
        )}
      </div>
      <Toaster position="top-center" />
    </DrawerProvider>
  );
}
