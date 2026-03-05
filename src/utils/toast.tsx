import React from 'react';
import toast from 'react-hot-toast';
import { AlertTriangle, X, Clock, CheckCircle, XCircle } from 'lucide-react';
import { cn } from './cn';

export const showSuccessToast = (title: string, message?: string) => {
  toast.custom((t) => (
    <div
      className={cn(
        "max-w-md w-full bg-white shadow-2xl rounded-2xl pointer-events-auto flex ring-1 ring-black/5 overflow-hidden transition-all",
        t.visible ? "animate-enter" : "animate-leave"
      )}
    >
      <div className="flex-1 w-0 p-4">
        <div className="flex items-start">
          <div className="flex-shrink-0 pt-0.5">
            <div className="h-10 w-10 rounded-full bg-emerald-50 flex items-center justify-center border border-emerald-100">
              <CheckCircle className="h-5 w-5 text-emerald-500" />
            </div>
          </div>
          <div className="ml-4 flex-1">
            <p className="text-sm font-semibold text-gray-900">{title}</p>
            {message && <p className="mt-1 text-sm text-gray-500 leading-relaxed">{message}</p>}
          </div>
        </div>
      </div>
      <div className="flex border-l border-gray-100 bg-gray-50/50">
        <button
          onClick={() => toast.remove(t.id)}
          className="w-full border border-transparent rounded-none p-4 flex items-center justify-center text-sm font-medium text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors focus:outline-none"
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
        "max-w-md w-full bg-white shadow-2xl rounded-2xl pointer-events-auto flex ring-1 ring-black/5 overflow-hidden transition-all",
        t.visible ? "animate-enter" : "animate-leave"
      )}
    >
      <div className="flex-1 w-0 p-4">
        <div className="flex items-start">
          <div className="flex-shrink-0 pt-0.5">
            <div className="h-10 w-10 rounded-full bg-red-50 flex items-center justify-center border border-red-100">
              <XCircle className="h-5 w-5 text-red-500" />
            </div>
          </div>
          <div className="ml-4 flex-1">
            <p className="text-sm font-semibold text-gray-900">{title}</p>
            {message && <p className="mt-1 text-sm text-gray-500 leading-relaxed">{message}</p>}
          </div>
        </div>
      </div>
      <div className="flex border-l border-gray-100 bg-gray-50/50">
        <button
          onClick={() => toast.remove(t.id)}
          className="w-full border border-transparent rounded-none p-4 flex items-center justify-center text-sm font-medium text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors focus:outline-none"
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
        "max-w-md w-full bg-white shadow-2xl rounded-2xl pointer-events-auto flex ring-1 ring-black/5 overflow-hidden transition-all",
        t.visible ? "animate-enter" : "animate-leave"
      )}
    >
      <div className="flex-1 w-0 p-4">
        <div className="flex items-start">
          <div className="flex-shrink-0 pt-0.5">
            <div className="h-10 w-10 rounded-full bg-red-50 flex items-center justify-center border border-red-100">
              <AlertTriangle className="h-5 w-5 text-red-500" />
            </div>
          </div>
          <div className="ml-4 flex-1">
            <p className="text-sm font-semibold text-gray-900">Zaman Çakışması</p>
            <p className="mt-1 text-sm text-gray-500 leading-relaxed">
              <span className="font-medium text-gray-900">{assetName}</span> zaten <span className="font-medium text-gray-900">"{taskName}"</span> işinde görevli.
            </p>
          </div>
        </div>
      </div>
      <div className="flex border-l border-gray-100 bg-gray-50/50">
        <button
          onClick={() => toast.remove(t.id)}
          className="w-full border border-transparent rounded-none p-4 flex items-center justify-center text-sm font-medium text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors focus:outline-none"
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
        "max-w-md w-full bg-white shadow-2xl rounded-2xl pointer-events-auto flex ring-1 ring-black/5 overflow-hidden transition-all",
        t.visible ? "animate-enter" : "animate-leave"
      )}
    >
      <div className="flex-1 w-0 p-4">
        <div className="flex items-start">
          <div className="flex-shrink-0 pt-0.5">
            <div className="h-10 w-10 rounded-full bg-orange-50 flex items-center justify-center border border-orange-100">
              <Clock className="h-5 w-5 text-orange-500" />
            </div>
          </div>
          <div className="ml-4 flex-1">
            <p className="text-sm font-semibold text-gray-900">Geçersiz Saat</p>
            <p className="mt-1 text-sm text-gray-500 leading-relaxed">
              {message}
            </p>
          </div>
        </div>
      </div>
      <div className="flex border-l border-gray-100 bg-gray-50/50">
        <button
          onClick={() => toast.remove(t.id)}
          className="w-full border border-transparent rounded-none p-4 flex items-center justify-center text-sm font-medium text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors focus:outline-none"
        >
          <X className="h-5 w-5" />
        </button>
      </div>
    </div>
  ), { duration: 4000 });
};
