import React, { useState } from 'react';
import FlowCanvas from './components/FlowCanvas';
import AgreementList from './components/AgreementList';
import Dashboard from './components/Dashboard';
import SettingsDrawer from './components/SettingsDrawer';
import { DrawerProvider } from './contexts/DrawerContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { Toaster, toast } from 'react-hot-toast';
import { Settings } from 'lucide-react';
import { Logo } from './components/Logo';

function AppContent() {
  const [view, setView] = useState<'list' | 'flow' | 'dashboard'>('list');
  const [currentWorkflowId, setCurrentWorkflowId] = useState<string | null>(null);
  const [currentMode, setCurrentMode] = useState<'ai' | 'manual' | null>(null);
  const [showSettingsDrawer, setShowSettingsDrawer] = useState(false);

  const handleSelectAgreement = async (agreementId: string, mode: 'ai' | 'manual', existingWorkflowId?: string, agreementName?: string) => {
    try {
      if (existingWorkflowId) {
        setCurrentWorkflowId(existingWorkflowId);
        setCurrentMode(null);
        setView('flow');
        return;
      }

      if (mode === 'ai') {
        const apiKey = localStorage.getItem('gemini_api_key');
        if (!apiKey) {
          toast.error("API Anahtarı bulunamadı. Lütfen sağ alt köşedeki Ayarlar ikonuna tıklayarak Gemini API anahtarınızı girin.");
          setShowSettingsDrawer(true);
          return;
        }
      }

      const workflowName = agreementName ? `${agreementName} İş Akışı` : 'Yeni İş Akışı';

      // Create a new workflow for this agreement
      const res = await fetch('/api/workflows', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: workflowName,
          agreement_id: agreementId
        })
      });
      const data = await res.json();
      
      setCurrentWorkflowId(data.id);
      setCurrentMode(mode);
      setView('flow');
    } catch (error) {
      console.error('Failed to create workflow:', error);
    }
  };

  const handleBack = () => {
    setCurrentWorkflowId(null);
    setCurrentMode(null);
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

        {showSettingsDrawer && <SettingsDrawer onClose={() => setShowSettingsDrawer(false)} />}
        
        {/* Global Settings Trigger */}
        <button 
          onClick={() => setShowSettingsDrawer(true)}
          className="fixed bottom-6 right-6 z-50 p-3 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-full shadow-xl hover:shadow-2xl hover:scale-110 transition-all text-gray-600 dark:text-slate-400"
          title="Ayarlar"
        >
          <Settings className="w-6 h-6" />
        </button>

        {view === 'flow' && currentWorkflowId ? (
          <FlowCanvas 
            workflowId={currentWorkflowId} 
            initialMode={currentMode}
            onBack={handleBack} 
          />
        ) : view === 'dashboard' ? (
          <Dashboard 
            onBack={() => setView('list')} 
            onSelectWorkflow={(id) => {
              setCurrentWorkflowId(id);
              setCurrentMode(null);
              setView('flow');
            }}
          />
        ) : (
          <AgreementList 
            onSelectAgreement={handleSelectAgreement} 
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
