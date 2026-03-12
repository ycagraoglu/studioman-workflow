import React, { useState, useEffect, useRef } from 'react';
import { Check, Shield, Zap, TrendingUp, Award, Moon, Sun, Monitor, X, Key } from 'lucide-react';
import { useTheme, ColorTheme, AppearanceMode } from '../contexts/ThemeContext';

const themes = [
  {
    id: 'blue' as ColorTheme,
    name: 'Klasik Kurumsal Mavi',
    description: 'Güven, sadakat ve ciddiyet. IBM, LinkedIn tarzı.',
    primary: 'bg-blue-600',
    accent: 'text-blue-600',
    light: 'bg-blue-50',
    border: 'border-blue-200',
    hover: 'hover:bg-blue-700',
    icon: Shield
  },
  {
    id: 'slate' as ColorTheme,
    name: 'Modern Minimalist',
    description: 'Saf kalite ve teknoloji. Apple, Stripe tarzı.',
    primary: 'bg-slate-800',
    accent: 'text-slate-800',
    light: 'bg-slate-100',
    border: 'border-slate-300',
    hover: 'hover:bg-slate-900',
    icon: Zap
  },
  {
    id: 'emerald' as ColorTheme,
    name: 'Prestijli Zümrüt Yeşili',
    description: 'Büyüme, denge ve sürdürülebilirlik. Fintech tarzı.',
    primary: 'bg-emerald-600',
    accent: 'text-emerald-600',
    light: 'bg-emerald-50',
    border: 'border-emerald-200',
    hover: 'hover:bg-emerald-700',
    icon: TrendingUp
  },
  {
    id: 'zinc' as ColorTheme,
    name: 'Sofistike Kömür & Altın',
    description: 'Lüks, otorite ve özel hizmet. Premium panel tarzı.',
    primary: 'bg-zinc-900',
    accent: 'text-amber-500',
    light: 'bg-zinc-100',
    border: 'border-zinc-300',
    hover: 'hover:bg-zinc-950',
    icon: Award
  }
];

const modes = [
  { id: 'light' as AppearanceMode, name: 'Aydınlık', icon: Sun },
  { id: 'dark' as AppearanceMode, name: 'Karanlık', icon: Moon },
  { id: 'system' as AppearanceMode, name: 'Sistem', icon: Monitor }
];

export default function SettingsDrawer({ onClose, focusApiKey }: { onClose: () => void, focusApiKey?: boolean }) {
  const { colorTheme, appearanceMode, setColorTheme, setAppearanceMode } = useTheme();
  const [apiKey, setApiKey] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const savedKey = localStorage.getItem('gemini_api_key');
    if (savedKey) {
      setApiKey(savedKey);
    }
    
    if (focusApiKey) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 300); // Wait for drawer slide animation
    }
  }, [focusApiKey]);

  const handleSave = () => {
    if (apiKey.trim()) {
      localStorage.setItem('gemini_api_key', apiKey.trim());
    } else {
      localStorage.removeItem('gemini_api_key');
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex justify-end">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/20 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      
      {/* Drawer Panel */}
      <div className="relative w-full max-w-md bg-white dark:bg-slate-800 h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300 border-l border-gray-100 dark:border-slate-700">
        <div className="p-6 border-b border-gray-100 dark:border-slate-700 flex justify-between items-center bg-white/50 dark:bg-slate-800/50 backdrop-blur-md sticky top-0 z-10">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">Ayarlar</h2>
            <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">Görünüm ve sistem tercihleri</p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          {/* API Key Settings */}
          <div>
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2">
              <Key className="w-4 h-4" /> AI API Anahtarı
            </h3>
            <div className="bg-gray-50/50 dark:bg-slate-700/30 border border-gray-100 dark:border-slate-700 rounded-xl p-4">
              <label className="block text-xs font-medium text-gray-700 dark:text-slate-300 mb-2">
                Google Gemini API Key
              </label>
              <input
                ref={inputRef}
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="API anahtarınızı girin..."
                className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all text-gray-900 dark:text-white"
              />
              <p className="text-[11px] text-gray-500 dark:text-slate-400 mt-2 leading-relaxed">
                İş akışlarını otomatik oluşturmak için kendi Gemini API anahtarınızı kullanabilirsiniz. Bu anahtar sadece tarayıcınızda saklanır.
              </p>
            </div>
          </div>

          {/* Appearance Mode */}
          <div>
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Görünüm Modu</h3>
            <div className="grid grid-cols-3 gap-2">
              {modes.map((mode) => (
                <button
                  key={mode.id}
                  onClick={() => setAppearanceMode(mode.id)}
                  className={`flex flex-col items-center justify-center gap-2 p-3 rounded-xl border transition-all ${
                    appearanceMode === mode.id 
                      ? 'border-primary bg-primary-light text-primary dark:bg-primary/10' 
                      : 'border-gray-100 dark:border-slate-700 text-gray-500 hover:border-gray-200 dark:hover:border-slate-600'
                  }`}
                >
                  <mode.icon className="w-4 h-4" />
                  <span className="text-xs font-semibold">{mode.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Color Themes */}
          <div>
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Renk Teması</h3>
            <div className="grid grid-cols-1 gap-3">
              {themes.map((theme) => (
                <div 
                  key={theme.id}
                  className={`group relative rounded-xl p-3 border transition-all cursor-pointer overflow-hidden ${
                    colorTheme === theme.id 
                      ? 'border-primary bg-primary-light/30 dark:bg-primary/5' 
                      : 'border-gray-100 dark:border-slate-700 bg-gray-50/50 dark:bg-slate-700/30 hover:border-gray-200 dark:hover:border-slate-600'
                  }`}
                  onClick={() => setColorTheme(theme.id)}
                >
                  <div className="flex items-center gap-3 relative z-10">
                    <div className={`p-2 rounded-lg ${theme.light} ${theme.accent}`}>
                      <theme.icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h3 className="font-bold text-gray-900 dark:text-white text-sm">{theme.name}</h3>
                        {colorTheme === theme.id && <Check className="w-4 h-4 text-primary" />}
                      </div>
                      <p className="text-[11px] text-gray-500 dark:text-slate-400 mt-0.5 leading-relaxed">{theme.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="p-6 bg-white dark:bg-slate-800 border-t border-gray-100 dark:border-slate-700">
          <button 
            onClick={handleSave}
            className="w-full py-3 bg-primary text-white rounded-xl text-sm font-bold hover:bg-primary-hover transition-all shadow-md active:scale-95"
          >
            Değişiklikleri Kaydet
          </button>
        </div>
      </div>
    </div>
  );
}
