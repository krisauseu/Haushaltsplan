import { useState, useEffect, useCallback } from 'react';
import Header from './components/Header';
import TabNav from './components/TabNav';
import SummaryCards from './components/SummaryCards';
import BudgetTable from './components/BudgetTable';
import AnalysisPage from './components/AnalysisPage';
import LoginPage from './components/LoginPage';
import { useAuth } from './context/AuthContext';
import {
    getValuesByYear,
    getSummary,
    updateValue,
    batchUpdateValues,
    createCategory,
    updateCategory,
    deleteCategory
} from './api/budgetApi';
import { AlertCircle, RefreshCw, Loader2 } from 'lucide-react';
import generatePDF from './utils/generatePDF';

function App() {
    const { user, loading: authLoading } = useAuth();
    const [year, setYear] = useState(new Date().getFullYear());
    const [data, setData] = useState([]);
    const [summary, setSummary] = useState(null);
    const [editMode, setEditMode] = useState(false);
    const [pendingChanges, setPendingChanges] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [saving, setSaving] = useState(false);
    const [autoFillFlash, setAutoFillFlash] = useState(null); // { categoryId, timestamp }
    const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'analysis'
    const [isExporting, setIsExporting] = useState(false);

    const fetchData = useCallback(async () => {
        if (!user) return;
        setLoading(true);
        setError(null);
        try {
            const [valuesData, summaryData] = await Promise.all([
                getValuesByYear(year),
                getSummary(year),
            ]);
            setData(valuesData);
            setSummary(summaryData);
        } catch (err) {
            console.error('Error fetching data:', err);
            setError('Fehler beim Laden der Daten. Bitte überprüfen Sie die Verbindung zum Server.');
        } finally {
            setLoading(false);
        }
    }, [year, user]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    if (authLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-100 dark:bg-slate-950">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
        );
    }

    if (!user) {
        return <LoginPage />;
    }

    const handleYearChange = (newYear) => {
        if (Object.keys(pendingChanges).length > 0) {
            if (!confirm('Sie haben ungespeicherte Änderungen. Möchten Sie fortfahren?')) {
                return;
            }
        }
        setPendingChanges({});
        setEditMode(false);
        setYear(newYear);
    };

    const handleValueChange = (categoryId, month, amount) => {
        const key = `${categoryId}-${month}`;
        setPendingChanges(prev => ({
            ...prev,
            [key]: { category_id: categoryId, year, month, amount }
        }));

        // Also update local data for immediate feedback
        setData(prevData =>
            prevData.map(category => {
                if (category.category_id !== categoryId) return category;

                const existingMonth = category.monthly_values?.find(mv => mv.month === month);
                if (existingMonth) {
                    return {
                        ...category,
                        monthly_values: category.monthly_values.map(mv =>
                            mv.month === month ? { ...mv, amount } : mv
                        )
                    };
                } else {
                    return {
                        ...category,
                        monthly_values: [...(category.monthly_values || []), { month, amount }]
                    };
                }
            })
        );
    };

    const handleSave = async () => {
        if (Object.keys(pendingChanges).length === 0) return;

        setSaving(true);
        try {
            const updates = Object.values(pendingChanges);

            // Save all changes
            for (const update of updates) {
                await updateValue(update.category_id, update.year, update.month, update.amount);
            }

            // Refresh data and summary
            await fetchData();
            setPendingChanges({});
            setEditMode(false);
        } catch (err) {
            console.error('Error saving changes:', err);
            setError('Fehler beim Speichern. Bitte versuchen Sie es erneut.');
        } finally {
            setSaving(false);
        }
    };

    const handleCancel = () => {
        if (Object.keys(pendingChanges).length > 0) {
            if (!confirm('Alle ungespeicherten Änderungen werden verworfen. Fortfahren?')) {
                return;
            }
        }
        setPendingChanges({});
        setEditMode(false);
        fetchData(); // Reload original data
    };

    const handleEditModeToggle = () => {
        setEditMode(true);
    };

    // Category management handlers
    const handleAddCategory = async (categoryData) => {
        setSaving(true);
        try {
            await createCategory(categoryData);
            await fetchData();
        } catch (err) {
            console.error('Error adding category:', err);
            setError('Fehler beim Hinzufügen der Kategorie.');
        } finally {
            setSaving(false);
        }
    };

    const handleUpdateCategory = async (categoryId, categoryData) => {
        setSaving(true);
        try {
            await updateCategory(categoryId, categoryData);
            await fetchData();
        } catch (err) {
            console.error('Error updating category:', err);
            setError('Fehler beim Aktualisieren der Kategorie.');
        } finally {
            setSaving(false);
        }
    };

    // Auto-Fill handler: copies value to all 12 months
    const handleAutoFill = async (categoryId, amount) => {
        // Build updates for all 12 months
        const updates = [];
        for (let month = 1; month <= 12; month++) {
            const key = `${categoryId}-${month}`;
            updates.push({ category_id: categoryId, year, month, amount });
            setPendingChanges(prev => ({
                ...prev,
                [key]: { category_id: categoryId, year, month, amount }
            }));
        }

        // Update local data immediately for all months
        setData(prevData =>
            prevData.map(category => {
                if (category.category_id !== categoryId) return category;
                return {
                    ...category,
                    monthly_values: Array.from({ length: 12 }, (_, i) => ({
                        month: i + 1,
                        amount
                    }))
                };
            })
        );

        // Trigger flash animation
        setAutoFillFlash({ categoryId, timestamp: Date.now() });
        setTimeout(() => setAutoFillFlash(null), 600);
    };

    const handleDeleteCategory = async (categoryId) => {
        setSaving(true);
        try {
            await deleteCategory(categoryId);
            await fetchData();
        } catch (err) {
            console.error('Error deleting category:', err);
            setError('Fehler beim Löschen der Kategorie.');
        } finally {
            setSaving(false);
        }
    };

    const handleExportPDF = async () => {
        setIsExporting(true);
        try {
            await generatePDF(year);
        } catch (err) {
            console.error('Error generating PDF:', err);
            setError('Fehler beim Erstellen des PDFs.');
        } finally {
            setIsExporting(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-100 via-blue-50 to-purple-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 p-4 md:p-6 lg:p-8 transition-colors duration-300">
            <div className="max-w-[1800px] mx-auto">
                <Header
                    year={year}
                    onYearChange={handleYearChange}
                    editMode={editMode}
                    onEditModeToggle={handleEditModeToggle}
                    onSave={handleSave}
                    onCancel={handleCancel}
                    hasChanges={Object.keys(pendingChanges).length > 0}
                    loading={loading || saving}
                    onExportPDF={handleExportPDF}
                    isExporting={isExporting}
                />

                {error && (
                    <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-xl flex items-center gap-3 text-red-700 dark:text-red-400">
                        <AlertCircle className="w-5 h-5 flex-shrink-0" />
                        <span>{error}</span>
                        <button
                            onClick={fetchData}
                            className="ml-auto flex items-center gap-2 px-3 py-1 bg-red-100 dark:bg-red-900/50 hover:bg-red-200 dark:hover:bg-red-800/50 rounded-lg transition-colors"
                        >
                            <RefreshCw className="w-4 h-4" />
                            Erneut versuchen
                        </button>
                    </div>
                )}

                {/* Tab Navigation */}
                <div data-tab-nav data-pdf-hide>
                    <TabNav
                        activeTab={activeTab}
                        onTabChange={setActiveTab}
                        disabled={loading || saving}
                    />
                </div>

                {/* Content based on active tab */}
                {/* During PDF export, render both sections (one hidden) so PDF can capture both */}
                {(activeTab === 'overview' || isExporting) && (
                    <div style={isExporting && activeTab !== 'overview' ? { position: 'absolute', left: '-9999px', top: 0 } : {}}>
                        <div data-pdf-summary-cards>
                            <SummaryCards summary={summary} loading={loading} />
                        </div>

                        <div data-pdf-budget-table>
                            <BudgetTable
                                data={data}
                                summary={summary}
                                editMode={editMode}
                                onChange={handleValueChange}
                                loading={loading}
                                year={year}
                                onAddCategory={handleAddCategory}
                                onUpdateCategory={handleUpdateCategory}
                                onDeleteCategory={handleDeleteCategory}
                                onAutoFill={handleAutoFill}
                                autoFillFlash={autoFillFlash}
                            />
                        </div>
                    </div>
                )}

                {(activeTab === 'analysis' || isExporting) && (
                    <div
                        data-pdf-analysis
                        style={isExporting && activeTab !== 'analysis' ? { position: 'absolute', left: '-9999px', top: 0 } : {}}
                    >
                        <AnalysisPage
                            data={data}
                            summary={summary}
                            year={year}
                            loading={loading}
                        />
                    </div>
                )}

                {/* Footer Info */}
                <div className="mt-6 text-center text-sm text-slate-400 dark:text-slate-500">
                    <p>
                        {editMode && Object.keys(pendingChanges).length > 0 && (
                            <span className="text-amber-600 dark:text-amber-400 font-medium">
                                {Object.keys(pendingChanges).length} ungespeicherte Änderung(en) •{' '}
                            </span>
                        )}
                        Haushaltsplan {year} • Daten werden in PostgreSQL gespeichert
                    </p>
                </div>
            </div>
        </div>
    );
}

export default App;
