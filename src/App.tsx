import React, { useState } from 'react';
import FlowCanvas from './components/FlowCanvas';
import WorkflowList from './components/WorkflowList';
import Dashboard from './components/Dashboard';
import ThemeShowcase from './components/ThemeShowcase';
import { DrawerProvider } from './contexts/DrawerContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { Toaster } from 'react-hot-toast';
import { Settings } from 'lucide-react';
import { Logo } from './components/Logo';

function AppContent() {
  const [view, setView] = useState<'list' | 'flow' | 'dashboard'>('list');
  const [currentWorkflowId, setCurrentWorkflowId] = useState<string | null>(null);
  const [showThemeSelector, setShowThemeSelector] = useState(false);

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
      <div className="flex h-screen w-full bg-white dark:bg-slate-800 overflow-hidden font-sans transition-colors duration-300 relative">
        {view === 'flow' && (
          <div 
            className="absolute top-5 left-6 z-50 cursor-pointer"
            onClick={() => {
              setCurrentWorkflowId(null);
              setView('list');
            }}
          >
            <Logo />
          </div>
        )}

        {showThemeSelector && <ThemeShowcase onClose={() => setShowThemeSelector(false)} />}
        
        {/* Global Settings Trigger */}
        <button 
          onClick={() => setShowThemeSelector(true)}
          className="fixed bottom-6 right-6 z-50 p-3 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-full shadow-xl hover:shadow-2xl hover:scale-110 transition-all text-gray-600 dark:text-slate-400"
          title="Görünüm Ayarları"
        >
          <Settings className="w-6 h-6" />
        </button>

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

export default function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}
