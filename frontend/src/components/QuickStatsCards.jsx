import { Percent, TrendingUp, Tag } from 'lucide-react';

export default function QuickStatsCards({ summary, data, loading }) {
    // Calculate savings rate (Sparrate)
    const income = summary?.yearlyTotals?.income || 0;
    const balance = summary?.yearlyTotals?.balance || 0;
    const savingsRate = income > 0 ? ((balance / income) * 100).toFixed(1) : 0;

    // Calculate average monthly surplus
    const avgMonthlySurplus = balance / 12;

    // Find most expensive category 
    const expenseCategories = data?.filter(cat => cat.type === 'expense') || [];
    let mostExpensiveCategory = { name: '-', total: 0 };

    expenseCategories.forEach(cat => {
        const total = cat.monthly_values?.reduce((sum, mv) => sum + (mv.amount || 0), 0) || 0;
        if (total > mostExpensiveCategory.total) {
            mostExpensiveCategory = { name: cat.name, total };
        }
    });

    const formatCurrency = (value) => {
        return new Intl.NumberFormat('de-DE', {
            style: 'currency',
            currency: 'EUR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(value || 0);
    };

    const cards = [
        {
            title: 'Sparrate',
            value: `${savingsRate}%`,
            icon: Percent,
            gradient: 'from-emerald-500 to-teal-600',
            bgGradient: 'from-emerald-50 to-teal-50',
            textColor: parseFloat(savingsRate) >= 0 ? 'text-emerald-700' : 'text-red-700',
            shadowColor: 'shadow-emerald-500/20',
            subtitle: 'Anteil gespart am Einkommen',
        },
        {
            title: 'Ø Überschuss / Monat',
            value: formatCurrency(avgMonthlySurplus),
            icon: TrendingUp,
            gradient: avgMonthlySurplus >= 0 ? 'from-blue-500 to-indigo-600' : 'from-red-500 to-pink-600',
            bgGradient: avgMonthlySurplus >= 0 ? 'from-blue-50 to-indigo-50' : 'from-red-50 to-pink-50',
            textColor: avgMonthlySurplus >= 0 ? 'text-blue-700' : 'text-red-700',
            shadowColor: avgMonthlySurplus >= 0 ? 'shadow-blue-500/20' : 'shadow-red-500/20',
            subtitle: 'Durchschnittlicher monatlicher Saldo',
        },
        {
            title: 'Teuerste Kategorie',
            value: mostExpensiveCategory.name,
            icon: Tag,
            gradient: 'from-amber-500 to-orange-600',
            bgGradient: 'from-amber-50 to-orange-50',
            textColor: 'text-amber-700',
            shadowColor: 'shadow-amber-500/20',
            subtitle: formatCurrency(mostExpensiveCategory.total),
        },
    ];

    if (loading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="glass rounded-2xl p-6 animate-pulse">
                        <div className="h-4 bg-slate-200 rounded w-24 mb-3"></div>
                        <div className="h-8 bg-slate-200 rounded w-32"></div>
                    </div>
                ))}
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {cards.map((card) => (
                <div
                    key={card.title}
                    className={`glass rounded-2xl p-6 bg-gradient-to-br ${card.bgGradient} 
                     border border-white/50 shadow-xl ${card.shadowColor} transition-transform hover:scale-[1.02]`}
                >
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-slate-600">{card.title}</span>
                        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${card.gradient} 
                          flex items-center justify-center shadow-lg`}>
                            <card.icon className="w-5 h-5 text-white" />
                        </div>
                    </div>
                    <p className={`text-2xl font-bold ${card.textColor} truncate`}>
                        {card.value}
                    </p>
                    <p className="text-xs text-slate-500 mt-1">{card.subtitle}</p>
                </div>
            ))}
        </div>
    );
}
