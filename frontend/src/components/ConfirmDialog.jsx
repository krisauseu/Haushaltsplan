import { AlertTriangle, X } from 'lucide-react';

export default function ConfirmDialog({
    isOpen,
    title,
    message,
    confirmLabel = 'Löschen',
    cancelLabel = 'Abbrechen',
    onConfirm,
    onCancel,
    destructive = true
}) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                onClick={onCancel}
            />

            {/* Dialog */}
            <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-slate-100">
                    <div className="flex items-center gap-3">
                        {destructive && (
                            <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
                                <AlertTriangle className="w-5 h-5 text-red-600" />
                            </div>
                        )}
                        <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
                    </div>
                    <button
                        onClick={onCancel}
                        className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                    >
                        <X className="w-5 h-5 text-slate-500" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-4">
                    <p className="text-slate-600">{message}</p>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end gap-3 p-4 bg-slate-50">
                    <button
                        onClick={onCancel}
                        className="px-4 py-2 text-slate-700 bg-white border border-slate-200 
                                   hover:bg-slate-100 rounded-xl font-medium transition-colors"
                    >
                        {cancelLabel}
                    </button>
                    <button
                        onClick={onConfirm}
                        className={`px-4 py-2 rounded-xl font-medium transition-colors
                            ${destructive
                                ? 'bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-500/25'
                                : 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/25'
                            }`}
                    >
                        {confirmLabel}
                    </button>
                </div>
            </div>
        </div>
    );
}
