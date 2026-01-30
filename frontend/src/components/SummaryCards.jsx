import { TrendingUp, TrendingDown, Scale, Loader2 } from 'lucide-react';

export default function SummaryCards({ summary, loading }) {
    const formatCurrency = (value) => {
        return new Intl.NumberFormat('de-DE', {
            style: 'currency',
            currency: 'EUR',
        }).format(value || 0);
    };

    const cards = [
        {
            title: 'Gesamteinnahmen',
            value: summary?.yearlyTotals?.income || 0,
            icon: TrendingUp,
            gradient: 'from-green-500 to-emerald-600',
            bgGradient: 'from-green-50 to-emerald-50',
            textColor: 'text-green-700',
            shadowColor: 'shadow-green-500/20',
        },
        {
            title: 'Gesamtausgaben',
            value: summary?.yearlyTotals?.totalExpense || 0,
            icon: TrendingDown,
            gradient: 'from-orange-500 to-red-500',
            bgGradient: 'from-orange-50 to-red-50',
            textColor: 'text-orange-700',
            shadowColor: 'shadow-orange-500/20',
        },
        {
            title: 'Jahressaldo',
            value: summary?.yearlyTotals?.balance || 0,
            icon: Scale,
            gradient: summary?.yearlyTotals?.balance >= 0
                ? 'from-blue-500 to-purple-600'
                : 'from-red-500 to-pink-600',
            bgGradient: summary?.yearlyTotals?.balance >= 0
                ? 'from-blue-50 to-purple-50'
                : 'from-red-50 to-pink-50',
            textColor: summary?.yearlyTotals?.balance >= 0
                ? 'text-blue-700'
                : 'text-red-700',
            shadowColor: summary?.yearlyTotals?.balance >= 0
                ? 'shadow-blue-500/20'
                : 'shadow-red-500/20',
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
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-sm font-medium text-slate-600">{card.title}</span>
                        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${card.gradient} 
                          flex items-center justify-center shadow-lg`}>
                            <card.icon className="w-5 h-5 text-white" />
                        </div>
                    </div>
                    <p className={`text-2xl font-bold ${card.textColor}`}>
                        {formatCurrency(card.value)}
                    </p>
                </div>
            ))}
        </div>
    );
}
