import React, { createContext, useContext, useState, useRef } from "react";
import { AlertTriangle, AlertCircle, Info, CheckCircle, X } from "lucide-react";

export interface ConfirmOptions {
  title?: string;
  message: React.ReactNode;
  confirmText?: string;
  cancelText?: string;
  type?: "danger" | "warning" | "info" | "success";
}

interface ConfirmContextType {
  confirm: (options: ConfirmOptions) => Promise<boolean>;
}

const ConfirmContext = createContext<ConfirmContextType | undefined>(undefined);

export const useConfirm = () => {
  const context = useContext(ConfirmContext);
  if (!context) {
    throw new Error("useConfirm must be used within a ConfirmProvider");
  }
  return context;
};

export const ConfirmProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [options, setOptions] = useState<ConfirmOptions | null>(null);
  const resolveRef = useRef<((value: boolean) => void) | null>(null);

  const confirm = (opts: ConfirmOptions) => {
    setOptions(opts);
    setIsOpen(true);
    return new Promise<boolean>((resolve) => {
      resolveRef.current = resolve;
    });
  };

  const handleConfirm = () => {
    resolveRef.current?.(true);
    setIsOpen(false);
  };

  const handleCancel = () => {
    resolveRef.current?.(false);
    setIsOpen(false);
  };

  const renderIcon = () => {
    const type = options?.type || "warning";
    const size = 28;
    switch (type) {
      case "danger":
        return (
          <div className="p-3 bg-red-50 text-red-600 rounded-full border border-red-100 flex items-center justify-center shrink-0">
            <AlertTriangle size={size} />
          </div>
        );
      case "success":
        return (
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-full border border-emerald-100 flex items-center justify-center shrink-0">
            <CheckCircle size={size} />
          </div>
        );
      case "info":
        return (
          <div className="p-3 bg-blue-50 text-blue-600 rounded-full border border-blue-100 flex items-center justify-center shrink-0">
            <Info size={size} />
          </div>
        );
      case "warning":
      default:
        return (
          <div className="p-3 bg-amber-50 text-amber-500 rounded-full border border-amber-100 flex items-center justify-center shrink-0">
            <AlertCircle size={size} />
          </div>
        );
    }
  };

  const getConfirmButtonClass = () => {
    const type = options?.type || "warning";
    switch (type) {
      case "danger":
        return "px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl shadow-lg shadow-red-500/20 active:scale-98 transition-all duration-200 text-sm cursor-pointer";
      case "success":
        return "px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl shadow-lg shadow-emerald-500/20 active:scale-98 transition-all duration-200 text-sm cursor-pointer";
      case "info":
        return "px-5 py-2.5 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-xl shadow-lg shadow-primary-500/20 active:scale-98 transition-all duration-200 text-sm cursor-pointer";
      case "warning":
      default:
        return "px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-xl shadow-lg shadow-amber-500/20 active:scale-98 transition-all duration-200 text-sm cursor-pointer";
    }
  };

  return (
    <ConfirmContext.Provider value={{ confirm }}>
      {children}
      {isOpen && options && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-fade-in">
          {/* Backdrop Click */}
          <div className="absolute inset-0 cursor-default" onClick={handleCancel} />
          
          {/* Modal Container */}
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-100 w-full max-w-md overflow-hidden z-10 animate-scale-up transform transition-all">
            {/* Header / Close button */}
            <div className="absolute top-4 right-4">
              <button
                onClick={handleCancel}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all duration-150 cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 pt-8 flex items-start gap-4">
              {renderIcon()}
              <div className="flex-1 space-y-2 mt-1">
                {options.title && (
                  <h3 className="text-lg font-black text-slate-800 tracking-tight leading-snug">
                    {options.title}
                  </h3>
                )}
                <div className="text-sm text-slate-600 leading-relaxed font-medium">
                  {options.message}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-3">
              <button
                onClick={handleCancel}
                className="px-5 py-2.5 bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 font-semibold rounded-xl active:scale-98 transition-all duration-200 text-sm cursor-pointer"
              >
                {options.cancelText || "Hủy"}
              </button>
              <button
                onClick={handleConfirm}
                className={getConfirmButtonClass()}
              >
                {options.confirmText || "Xác nhận"}
              </button>
            </div>
          </div>
        </div>
      )}
    </ConfirmContext.Provider>
  );
};
