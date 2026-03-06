import React from 'react';
import { Check, Shield, Zap, TrendingUp, Award, Moon, Sun, Monitor, X } from 'lucide-react';
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

export default function ThemeShowcase({ onClose }: { onClose: () => void }) {
  const { colorTheme, appearanceMode, setColorTheme, setAppearanceMode } = useTheme();

  return (
    <div className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl max-w-4xl w-full overflow-hidden border border-white/20 dark:border-slate-700">
        <div className="p-8 border-b border-gray-100 dark:border-slate-700 flex justify-between items-start">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">Görünüm Ayarları</h2>
            <p className="text-gray-500 dark:text-slate-400 mt-2">Uygulamanızın karakterini ve modunu belirleyin.</p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-full transition-colors"
          >
            <X className="w-6 h-6 text-gray-400" />
          </button>
        </div>
        
        <div className="p-8 space-y-8">
          {/* Appearance Mode */}
          <div>
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">Görünüm Modu</h3>
            <div className="grid grid-cols-3 gap-4">
              {modes.map((mode) => (
                <button
                  key={mode.id}
                  onClick={() => setAppearanceMode(mode.id)}
                  className={`flex items-center justify-center gap-3 p-4 rounded-2xl border-2 transition-all ${
                    appearanceMode === mode.id 
                      ? 'border-primary bg-primary-light text-primary dark:bg-primary/10' 
                      : 'border-gray-100 dark:border-slate-700 text-gray-500 hover:border-gray-200 dark:hover:border-slate-600'
                  }`}
                >
                  <mode.icon className="w-5 h-5" />
                  <span className="font-semibold">{mode.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Color Themes */}
          <div>
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">Renk Teması</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {themes.map((theme) => (
                <div 
                  key={theme.id}
                  className={`group relative rounded-2xl p-5 border-2 transition-all cursor-pointer overflow-hidden ${
                    colorTheme === theme.id 
                      ? 'border-primary bg-primary-light/30 dark:bg-primary/5' 
                      : 'border-gray-100 dark:border-slate-700 bg-gray-50/50 dark:bg-slate-700/30 hover:border-gray-200 dark:hover:border-slate-600'
                  }`}
                  onClick={() => setColorTheme(theme.id)}
                >
                  <div className="flex items-start gap-4 relative z-10">
                    <div className={`p-2.5 rounded-xl ${theme.light} ${theme.accent}`}>
                      <theme.icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h3 className="font-bold text-gray-900 dark:text-white text-base">{theme.name}</h3>
                        {colorTheme === theme.id && <Check className="w-5 h-5 text-primary" />}
                      </div>
                      <p className="text-xs text-gray-500 dark:text-slate-400 mt-1 leading-relaxed">{theme.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="p-6 bg-gray-50 dark:bg-slate-700/50 border-t border-gray-100 dark:border-slate-700 flex justify-center">
          <button 
            onClick={onClose}
            className="px-8 py-3 bg-primary text-white rounded-xl font-bold hover:bg-primary-hover transition-all shadow-lg active:scale-95"
          >
            Değişiklikleri Kaydet
          </button>
        </div>
      </div>
    </div>
  );
}
