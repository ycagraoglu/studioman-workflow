import React from 'react';
import toast from 'react-hot-toast';
import { AlertTriangle, X, Clock, CheckCircle, XCircle } from 'lucide-react';
import { cn } from './cn';

export const showSuccessToast = (title: string, message?: string) => {
  toast.custom((t) => (
    <div
      className={cn(
        "max-w-md w-full bg-white dark:bg-slate-800 shadow-2xl rounded-2xl pointer-events-auto flex ring-1 ring-black/5 dark:ring-white/10 overflow-hidden transition-all",
        t.visible ? "animate-enter" : "animate-leave"
      )}
    >
      <div className="flex-1 w-0 p-4">
        <div className="flex items-start">
          <div className="flex-shrink-0 pt-0.5">
            <div className="h-10 w-10 rounded-full bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center border border-emerald-100 dark:border-emerald-500/20">
              <CheckCircle className="h-5 w-5 text-emerald-500" />
            </div>
          </div>
          <div className="ml-4 flex-1">
            <p className="text-sm font-semibold text-gray-900 dark:text-white">{title}</p>
            {message && <p className="mt-1 text-sm text-gray-500 dark:text-slate-400 leading-relaxed">{message}</p>}
          </div>
        </div>
      </div>
      <div className="flex border-l border-gray-100 dark:border-slate-700 bg-gray-50/50 dark:bg-slate-700/30">
        <button
          onClick={() => toast.remove(t.id)}
          className="w-full border border-transparent rounded-none p-4 flex items-center justify-center text-sm font-medium text-gray-400 dark:text-slate-400 hover:text-gray-600 dark:hover:text-slate-200 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors focus:outline-none"
        >
          <X className="h-5 w-5" />
        </button>
      </div>
    </div>
  ), { duration: 3000 });
};

export const showErrorToast = (title: string, message?: string) => {
  toast.custom((t) => (
    <div
      className={cn(
        "max-w-md w-full bg-white dark:bg-slate-800 shadow-2xl rounded-2xl pointer-events-auto flex ring-1 ring-black/5 dark:ring-white/10 overflow-hidden transition-all",
        t.visible ? "animate-enter" : "animate-leave"
      )}
    >
      <div className="flex-1 w-0 p-4">
        <div className="flex items-start">
          <div className="flex-shrink-0 pt-0.5">
            <div className="h-10 w-10 rounded-full bg-red-50 dark:bg-red-900/20 flex items-center justify-center border border-red-100 dark:border-red-500/20">
              <XCircle className="h-5 w-5 text-red-500" />
            </div>
          </div>
          <div className="ml-4 flex-1">
            <p className="text-sm font-semibold text-gray-900 dark:text-white">{title}</p>
            {message && <p className="mt-1 text-sm text-gray-500 dark:text-slate-400 leading-relaxed">{message}</p>}
          </div>
        </div>
      </div>
      <div className="flex border-l border-gray-100 dark:border-slate-700 bg-gray-50/50 dark:bg-slate-700/30">
        <button
          onClick={() => toast.remove(t.id)}
          className="w-full border border-transparent rounded-none p-4 flex items-center justify-center text-sm font-medium text-gray-400 dark:text-slate-400 hover:text-gray-600 dark:hover:text-slate-200 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors focus:outline-none"
        >
          <X className="h-5 w-5" />
        </button>
      </div>
    </div>
  ), { duration: 4000 });
};

export const showConflictToast = (assetName: string, taskName: string) => {
  toast.custom((t) => (
    <div
      className={cn(
        "max-w-md w-full bg-white dark:bg-slate-800 shadow-2xl rounded-2xl pointer-events-auto flex ring-1 ring-black/5 dark:ring-white/10 overflow-hidden transition-all",
        t.visible ? "animate-enter" : "animate-leave"
      )}
    >
      <div className="flex-1 w-0 p-4">
        <div className="flex items-start">
          <div className="flex-shrink-0 pt-0.5">
            <div className="h-10 w-10 rounded-full bg-red-50 dark:bg-red-900/20 flex items-center justify-center border border-red-100 dark:border-red-500/20">
              <AlertTriangle className="h-5 w-5 text-red-500" />
            </div>
          </div>
          <div className="ml-4 flex-1">
            <p className="text-sm font-semibold text-gray-900 dark:text-white">Zaman Çakışması</p>
            <p className="mt-1 text-sm text-gray-500 dark:text-slate-400 leading-relaxed">
              <span className="font-medium text-gray-900 dark:text-white">{assetName}</span> zaten <span className="font-medium text-gray-900 dark:text-white">"{taskName}"</span> işinde görevli.
            </p>
          </div>
        </div>
      </div>
      <div className="flex border-l border-gray-100 dark:border-slate-700 bg-gray-50/50 dark:bg-slate-700/30">
        <button
          onClick={() => toast.remove(t.id)}
          className="w-full border border-transparent rounded-none p-4 flex items-center justify-center text-sm font-medium text-gray-400 dark:text-slate-400 hover:text-gray-600 dark:hover:text-slate-200 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors focus:outline-none"
        >
          <X className="h-5 w-5" />
        </button>
      </div>
    </div>
  ), { duration: 5000 });
};

export const showValidationErrorToast = (message: string) => {
  toast.custom((t) => (
    <div
      className={cn(
        "max-w-md w-full bg-white dark:bg-slate-800 shadow-2xl rounded-2xl pointer-events-auto flex ring-1 ring-black/5 dark:ring-white/10 overflow-hidden transition-all",
        t.visible ? "animate-enter" : "animate-leave"
      )}
    >
      <div className="flex-1 w-0 p-4">
        <div className="flex items-start">
          <div className="flex-shrink-0 pt-0.5">
            <div className="h-10 w-10 rounded-full bg-orange-50 dark:bg-orange-900/20 flex items-center justify-center border border-orange-100 dark:border-orange-500/20">
              <Clock className="h-5 w-5 text-orange-500" />
            </div>
          </div>
          <div className="ml-4 flex-1">
            <p className="text-sm font-semibold text-gray-900 dark:text-white">Geçersiz Saat</p>
            <p className="mt-1 text-sm text-gray-500 dark:text-slate-400 leading-relaxed">
              {message}
            </p>
          </div>
        </div>
      </div>
      <div className="flex border-l border-gray-100 dark:border-slate-700 bg-gray-50/50 dark:bg-slate-700/30">
        <button
          onClick={() => toast.remove(t.id)}
          className="w-full border border-transparent rounded-none p-4 flex items-center justify-center text-sm font-medium text-gray-400 dark:text-slate-400 hover:text-gray-600 dark:hover:text-slate-200 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors focus:outline-none"
        >
          <X className="h-5 w-5" />
        </button>
      </div>
    </div>
  ), { duration: 4000 });
};
