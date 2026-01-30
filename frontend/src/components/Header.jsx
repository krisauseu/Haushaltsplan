import { ChevronLeft, ChevronRight, Edit3, Save, X, Wallet } from 'lucide-react';

export default function Header({
    year,
    onYearChange,
    editMode,
    onEditModeToggle,
    onSave,
    onCancel,
    hasChanges,
    loading
}) {
    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: 10 }, (_, i) => currentYear - 5 + i);

    return (
        <header className="glass rounded-2xl p-6 mb-6">
            <div className="flex items-center justify-between flex-wrap gap-4">
                {/* Logo and Title */}
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                        <Wallet className="w-7 h-7 text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                            Haushaltsplan
                        </h1>
                        <p className="text-sm text-slate-500">Budget Planner</p>
                    </div>
                </div>

                {/* Year Selector */}
                <div className="flex items-center gap-2 bg-slate-100 rounded-xl p-1">
                    <button
                        onClick={() => onYearChange(year - 1)}
                        disabled={loading}
                        className="p-2 hover:bg-white rounded-lg transition-colors disabled:opacity-50"
                        aria-label="Vorheriges Jahr"
                    >
                        <ChevronLeft className="w-5 h-5" />
                    </button>

                    <select
                        value={year}
                        onChange={(e) => onYearChange(parseInt(e.target.value))}
                        disabled={loading}
                        className="bg-white px-4 py-2 rounded-lg font-semibold text-lg border-0 focus:ring-2 focus:ring-blue-500 cursor-pointer"
                    >
                        {years.map((y) => (
                            <option key={y} value={y}>{y}</option>
                        ))}
                    </select>

                    <button
                        onClick={() => onYearChange(year + 1)}
                        disabled={loading}
                        className="p-2 hover:bg-white rounded-lg transition-colors disabled:opacity-50"
                        aria-label="Nächstes Jahr"
                    >
                        <ChevronRight className="w-5 h-5" />
                    </button>
                </div>

                {/* Edit Mode Controls */}
                <div className="flex items-center gap-2">
                    {editMode ? (
                        <>
                            <button
                                onClick={onCancel}
                                disabled={loading}
                                className="flex items-center gap-2 px-4 py-2 bg-slate-200 hover:bg-slate-300 
                         text-slate-700 rounded-xl font-medium transition-colors disabled:opacity-50"
                            >
                                <X className="w-4 h-4" />
                                Abbrechen
                            </button>
                            <button
                                onClick={onSave}
                                disabled={loading || !hasChanges}
                                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 
                         hover:from-green-600 hover:to-emerald-700 text-white rounded-xl font-medium 
                         shadow-lg shadow-green-500/25 transition-all disabled:opacity-50 disabled:shadow-none"
                            >
                                <Save className="w-4 h-4" />
                                Speichern
                            </button>
                        </>
                    ) : (
                        <button
                            onClick={onEditModeToggle}
                            disabled={loading}
                            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 
                       hover:from-blue-600 hover:to-purple-700 text-white rounded-xl font-medium 
                       shadow-lg shadow-blue-500/25 transition-all disabled:opacity-50"
                        >
                            <Edit3 className="w-4 h-4" />
                            Bearbeiten
                        </button>
                    )}
                </div>
            </div>
        </header>
    );
}
