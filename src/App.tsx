import React, { useState } from 'react';
import FlowCanvas from './components/FlowCanvas';
import WorkflowList from './components/WorkflowList';
import Dashboard from './components/Dashboard';
import { DrawerProvider } from './contexts/DrawerContext';
import { Toaster } from 'react-hot-toast';

export default function App() {
  const [view, setView] = useState<'list' | 'flow' | 'dashboard'>('list');
  const [currentWorkflowId, setCurrentWorkflowId] = useState<string | null>(null);

  const handleSelectWorkflow = (id: string) => {
    setCurrentWorkflowId(id);
    setView('flow');
  };

  const handleBack = () => {
    setCurrentWorkflowId(null);
    setView('list');
  };

  return (
    <DrawerProvider>
      <div className="flex h-screen w-full bg-white overflow-hidden font-sans">
        {view === 'flow' && currentWorkflowId ? (
          <FlowCanvas 
            workflowId={currentWorkflowId} 
            onBack={handleBack} 
          />
        ) : view === 'dashboard' ? (
          <Dashboard 
            onBack={() => setView('list')} 
            onSelectWorkflow={handleSelectWorkflow}
          />
        ) : (
          <WorkflowList 
            onSelectWorkflow={handleSelectWorkflow} 
            onViewDashboard={() => setView('dashboard')}
          />
        )}
      </div>
      <Toaster position="top-center" />
    </DrawerProvider>
  );
}
