import { useState } from 'react';
import { X } from 'lucide-react';

export default function ScenarioModal({ isOpen, onClose, onCreate, year }) {
    const [name, setName] = useState('');
    const [copyFromLive, setCopyFromLive] = useState(false);
    const [isCreating, setIsCreating] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!name.trim()) return;

        setIsCreating(true);
        try {
            await onCreate(name.trim(), copyFromLive);
            setName('');
            setCopyFromLive(false);
            onClose();
        } catch (error) {
            console.error('Error creating scenario:', error);
        } finally {
            setIsCreating(false);
        }
    };

    const handleClose = () => {
        setName('');
        setCopyFromLive(false);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-md w-full">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700">
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                        Neues Szenario erstellen
                    </h2>
                    <button
                        onClick={handleClose}
                        className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                        disabled={isCreating}
                    >
                        <X className="w-5 h-5 text-slate-500 dark:text-slate-400" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                    <div>
                        <label
                            htmlFor="scenario-name"
                            className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2"
                        >
                            Szenario-Name
                        </label>
                        <input
                            id="scenario-name"
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="z.B. Budget 2026 - Optimiert"
                            className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500"
                            disabled={isCreating}
                            autoFocus
                        />
                    </div>

                    <div className="flex items-start gap-3">
                        <input
                            id="copy-from-live"
                            type="checkbox"
                            checked={copyFromLive}
                            onChange={(e) => setCopyFromLive(e.target.checked)}
                            className="mt-1 w-4 h-4 text-violet-600 bg-slate-50 dark:bg-slate-900 border-slate-300 dark:border-slate-600 rounded focus:ring-2 focus:ring-violet-500"
                            disabled={isCreating}
                        />
                        <div className="flex-1">
                            <label
                                htmlFor="copy-from-live"
                                className="text-sm font-medium text-slate-700 dark:text-slate-300 cursor-pointer"
                            >
                                Aktuelle Daten kopieren
                            </label>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                Kopiert alle Live-Daten aus dem Jahr {year} in das neue Szenario
                            </p>
                        </div>
                    </div>

                    {/* Buttons */}
                    <div className="flex gap-3 pt-2">
                        <button
                            type="button"
                            onClick={handleClose}
                            className="flex-1 px-4 py-2.5 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 font-medium transition-colors"
                            disabled={isCreating}
                        >
                            Abbrechen
                        </button>
                        <button
                            type="submit"
                            className="flex-1 px-4 py-2.5 bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-lg hover:from-violet-700 hover:to-indigo-700 font-medium shadow-lg shadow-violet-500/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={!name.trim() || isCreating}
                        >
                            {isCreating ? 'Erstelle...' : 'Erstellen'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
