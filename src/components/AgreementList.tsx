import React, { useState, useEffect } from 'react';
import { Calendar, MapPin, User, Search, Sparkles, Plus, Loader2, ArrowRight } from 'lucide-react';
import { format, isAfter, parseISO } from 'date-fns';
import { tr } from 'date-fns/locale';
import { crmService } from '../services/crmService';
import { Agreement } from '../types/crm';
import { Logo } from './Logo';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from './ui/dialog';
import { Button } from './ui/button';

interface AgreementListProps {
  onSelectAgreement: (agreementId: string, mode: 'ai' | 'manual', existingWorkflowId?: string, agreementName?: string) => void;
}

export default function AgreementList({ onSelectAgreement }: AgreementListProps) {
  const [agreements, setAgreements] = useState<Agreement[]>([]);
  const [workflows, setWorkflows] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedAgreement, setSelectedAgreement] = useState<Agreement | null>(null);
  const [showOptionsModal, setShowOptionsModal] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [agreementsData, workflowsRes] = await Promise.all([
          crmService.getAgreements(),
          fetch('/api/workflows')
        ]);
        
        const workflowsData = await workflowsRes.json();
        setWorkflows(workflowsData);

        // Filter out past agreements (eventStartDate >= today)
        const now = new Date();
        const upcoming = agreementsData.filter(a => {
          const eventDate = parseISO(a.eventStartDate);
          return isAfter(eventDate, now) || eventDate.toDateString() === now.toDateString();
        });
        // Sort by date ascending
        upcoming.sort((a, b) => new Date(a.eventStartDate).getTime() - new Date(b.eventStartDate).getTime());
        setAgreements(upcoming);
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const filteredAgreements = agreements.filter(a => 
    a.accountName.toLowerCase().includes(search.toLowerCase()) ||
    a.organizationName.toLowerCase().includes(search.toLowerCase()) ||
    a.agreementNumber.toLowerCase().includes(search.toLowerCase())
  );

  const handleAgreementClick = (agreement: Agreement) => {
    const existingWorkflow = workflows.find(w => w.agreement_id === agreement.id);
    if (existingWorkflow) {
      onSelectAgreement(agreement.id, 'manual', existingWorkflow.id, agreement.organizationName);
    } else {
      setSelectedAgreement(agreement);
      setShowOptionsModal(true);
    }
  };

  const handleCreate = (mode: 'ai' | 'manual') => {
    if (selectedAgreement) {
      setShowOptionsModal(false);
      onSelectAgreement(selectedAgreement.id, mode, undefined, selectedAgreement.organizationName);
    }
  };

  return (
    <div className="flex-1 h-full overflow-y-auto bg-gray-50 dark:bg-slate-900">
      <div className="max-w-5xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <Logo />
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mt-4">Yaklaşan Anlaşmalar</h1>
            <p className="text-gray-500 dark:text-slate-400 mt-1">
              Tarihi geçmemiş anlaşmalarınız için iş akışı oluşturun.
            </p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 overflow-hidden mb-6">
          <div className="p-4 border-b border-gray-200 dark:border-slate-700">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Müşteri, etkinlik veya anlaşma no ara..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-gray-900 dark:text-white"
              />
            </div>
          </div>

          {isLoading ? (
            <div className="p-12 flex justify-center">
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
            </div>
          ) : filteredAgreements.length === 0 ? (
            <div className="p-12 text-center text-gray-500 dark:text-slate-400">
              Yaklaşan anlaşma bulunamadı.
            </div>
          ) : (
            <div className="divide-y divide-gray-100 dark:divide-slate-700/50">
              {filteredAgreements.map((agreement) => {
                const existingWorkflow = workflows.find(w => w.agreement_id === agreement.id);
                return (
                <div 
                  key={agreement.id}
                  onClick={() => handleAgreementClick(agreement)}
                  className="p-4 hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors cursor-pointer group flex items-center justify-between"
                >
                  <div className="flex items-start gap-4">
                    <div 
                      className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 text-white font-bold text-lg shadow-sm"
                      style={{ backgroundColor: agreement.eventCategoryColor || '#6366f1' }}
                    >
                      {agreement.accountName.charAt(0)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                          {agreement.organizationName}
                        </h3>
                        <span className="px-2 py-0.5 text-[10px] font-medium bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-slate-300 rounded-full">
                          {agreement.agreementNumber}
                        </span>
                        {existingWorkflow && (
                          <span className="px-2 py-0.5 text-[10px] font-medium bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full">
                            İş Akışı Var
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-slate-400">
                        <div className="flex items-center gap-1.5">
                          <User className="w-4 h-4" />
                          {agreement.accountName}
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-4 h-4" />
                          {format(parseISO(agreement.eventStartDate), 'd MMMM yyyy, HH:mm', { locale: tr })}
                        </div>
                        <div className="flex items-center gap-1.5">
                          <MapPin className="w-4 h-4" />
                          {agreement.venueName}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="flex items-center gap-2 text-primary font-medium text-sm bg-primary/5 px-3 py-1.5 rounded-lg">
                      {existingWorkflow ? 'İş Akışına Git' : 'İş Akışı Oluştur'}
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  </div>
                </div>
              )})}
            </div>
          )}
        </div>
      </div>

      <Dialog open={showOptionsModal} onOpenChange={setShowOptionsModal}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>İş Akışı Oluştur</DialogTitle>
            <DialogDescription>
              "{selectedAgreement?.organizationName}" için nasıl bir iş akışı oluşturmak istersiniz?
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid grid-cols-2 gap-4 py-4">
            <button
              onClick={() => handleCreate('ai')}
              className="flex flex-col items-center justify-center gap-3 p-6 border-2 border-transparent bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-xl hover:border-purple-200 dark:hover:border-purple-800 transition-all group"
            >
              <div className="w-12 h-12 rounded-full bg-white dark:bg-slate-800 shadow-sm flex items-center justify-center group-hover:scale-110 transition-transform">
                <Sparkles className="w-6 h-6 text-purple-500" />
              </div>
              <div className="text-center">
                <div className="font-semibold text-gray-900 dark:text-white mb-1">AI ile Otomatik</div>
                <div className="text-xs text-gray-500 dark:text-slate-400">
                  Anlaşma detaylarına göre yapay zeka tüm adımları planlasın.
                </div>
              </div>
            </button>

            <button
              onClick={() => handleCreate('manual')}
              className="flex flex-col items-center justify-center gap-3 p-6 border-2 border-gray-100 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-xl hover:border-primary/30 hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-all group"
            >
              <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-slate-700 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Plus className="w-6 h-6 text-gray-600 dark:text-slate-300" />
              </div>
              <div className="text-center">
                <div className="font-semibold text-gray-900 dark:text-white mb-1">Manuel Oluştur</div>
                <div className="text-xs text-gray-500 dark:text-slate-400">
                  Boş bir tuvalden başlayarak adımları kendiniz ekleyin.
                </div>
              </div>
            </button>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowOptionsModal(false)}>
              İptal
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
