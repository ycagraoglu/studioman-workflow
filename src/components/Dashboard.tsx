import React, { useState, useEffect } from 'react';
import { ArrowLeft, Search, Filter, Calendar, MapPin, User, Camera, Car, Loader2, LayoutDashboard, ChevronRight, Clock, X } from 'lucide-react';
import { format, parseISO, isWithinInterval, startOfDay, endOfDay } from 'date-fns';
import { tr } from 'date-fns/locale';
import { cn } from '../utils/cn';
import DatePicker from './DatePicker';

interface AssetUsage {
  assetId: string;
  assetName: string;
  assetType: string;
  assetRole: string;
  workflowId: string;
  workflowName: string;
  nodeId: string;
  nodeTitle: string;
  date: string;
  startTime: string;
  endTime: string;
}

interface DashboardProps {
  onBack: () => void;
  onSelectWorkflow: (id: string) => void;
}

export default function Dashboard({ onBack, onSelectWorkflow }: DashboardProps) {
  const [usageData, setUsageData] = useState<AssetUsage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<string | 'all'>('all');
  const [filterRange, setFilterRange] = useState<{ from: string; to: string }>({ from: '', to: '' });

  useEffect(() => {
    const fetchUsage = async () => {
      try {
        const res = await fetch('/api/analytics/asset-usage');
        const data = await res.json();
        // Filter out locations from tracking
        const filteredData = data.filter((item: AssetUsage) => item.assetType !== 'location');
        setUsageData(filteredData);
      } catch (error) {
        console.error('Failed to fetch asset usage:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchUsage();
  }, []);

  const filteredData = usageData.filter(item => {
    const matchesSearch = 
      item.assetName.toLowerCase().includes(search.toLowerCase()) ||
      item.workflowName.toLowerCase().includes(search.toLowerCase()) ||
      item.nodeTitle.toLowerCase().includes(search.toLowerCase());
    const matchesType = filterType === 'all' || item.assetType === filterType;
    
    let matchesDate = true;
    if (filterRange.from && filterRange.to) {
      const itemDate = parseISO(item.date);
      matchesDate = isWithinInterval(itemDate, {
        start: startOfDay(parseISO(filterRange.from)),
        end: endOfDay(parseISO(filterRange.to))
      });
    } else if (filterRange.from) {
      matchesDate = item.date === filterRange.from;
    }

    return matchesSearch && matchesType && matchesDate;
  });

  const getIcon = (type: string) => {
    switch (type) {
      case 'location': return <MapPin className="w-4 h-4" />;
      case 'personnel': return <User className="w-4 h-4" />;
      case 'equipment': return <Camera className="w-4 h-4" />;
      case 'vehicle': return <Car className="w-4 h-4" />;
      default: return <LayoutDashboard className="w-4 h-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'location': return 'text-blue-500 bg-blue-50';
      case 'personnel': return 'text-emerald-500 bg-emerald-50';
      case 'equipment': return 'text-amber-500 bg-amber-50';
      case 'vehicle': return 'text-purple-500 bg-purple-50';
      default: return 'text-gray-500 bg-gray-50';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'location': return 'Lokasyon';
      case 'personnel': return 'Ekip';
      case 'equipment': return 'Ekipman';
      case 'vehicle': return 'Araç';
      default: return type;
    }
  };

  if (isLoading) {
    return (
      <div className="flex-grow h-full flex items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex-grow h-full bg-gray-50 overflow-y-auto">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
            <button 
              onClick={onBack}
              className="p-2 hover:bg-white rounded-lg transition-colors text-gray-500 border border-transparent hover:border-gray-200"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-2xl font-medium text-gray-900 tracking-tight">Kaynak Takibi & Panel</h1>
              <p className="text-sm text-gray-500 mt-1">Tüm kaynakların kullanım geçmişini ve planlamasını inceleyin.</p>
            </div>
          </div>
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {[
            { label: 'Toplam Kullanım', value: usageData.length, icon: LayoutDashboard, color: 'text-indigo-600' },
            { label: 'Ekipman Kullanımı', value: usageData.filter(d => d.assetType === 'equipment').length, icon: Camera, color: 'text-amber-600' },
            { label: 'Ekip Görevleri', value: usageData.filter(d => d.assetType === 'personnel').length, icon: User, color: 'text-emerald-600' },
          ].map((stat, i) => (
            <div key={i} className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <stat.icon className={cn("w-5 h-5", stat.color)} />
                <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">{stat.label}</span>
              </div>
              <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
            </div>
          ))}
        </div>

        {/* Filters & Search */}
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm mb-6">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            <div className="md:col-span-6 lg:col-span-7 relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input 
                type="text"
                placeholder="Kaynak, iş akışı veya görev ara..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all"
              />
            </div>
            <div className="md:col-span-3 lg:col-span-2 relative">
              <Filter className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              <select 
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="w-full pl-10 pr-8 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all appearance-none cursor-pointer"
              >
                <option value="all">Tüm Türler</option>
                <option value="personnel">Ekip</option>
                <option value="equipment">Ekipman</option>
                <option value="vehicle">Araç</option>
              </select>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                <ChevronRight className="w-4 h-4 text-gray-400 rotate-90" />
              </div>
            </div>
            <div className="md:col-span-3 lg:col-span-3">
              <DatePicker 
                value={filterRange}
                onChange={setFilterRange}
                placeholder="Tarih Aralığı Seç"
                className="w-full"
                showClear
                mode="range"
              />
            </div>
          </div>
        </div>

        {/* Usage Table */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Kaynak</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Tür</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">İş Akışı / Görev</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Tarih & Saat</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">İşlem</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredData.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500 italic">
                    Kayıt bulunamadı.
                  </td>
                </tr>
              ) : (
                filteredData.map((item, idx) => (
                  <tr key={idx} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className={cn("p-2 rounded-lg", getTypeColor(item.assetType))}>
                          {getIcon(item.assetType)}
                        </div>
                        <div>
                          <div className="font-medium text-gray-900 text-sm">{item.assetName}</div>
                          <div className="text-xs text-gray-500">{item.assetRole}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={cn("px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider", getTypeColor(item.assetType))}>
                        {getTypeLabel(item.assetType)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 font-medium">{item.workflowName}</div>
                      <div className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                        <ChevronRight className="w-3 h-3" />
                        {item.nodeTitle}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-sm text-gray-700">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        {item.date ? format(new Date(item.date), 'd MMM yyyy', { locale: tr }) : 'Tarihsiz'}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                        <Clock className="w-4 h-4 text-gray-400" />
                        {item.startTime} - {item.endTime}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => onSelectWorkflow(item.workflowId)}
                        className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 hover:underline"
                      >
                        İşe Git
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
  );
}
