import {
    ComposedChart,
    Area,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend,
} from 'recharts';

const MONTHS = ['Jan', 'Feb', 'Mär', 'Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dez'];

export default function TrendChart({ data, loading }) {
    // Calculate monthly totals for income and expenses
    const monthlyData = MONTHS.map((month, index) => {
        const monthNum = index + 1;

        let income = 0;
        let expense = 0;

        data?.forEach(cat => {
            const monthValue = cat.monthly_values?.find(mv => mv.month === monthNum);
            const amount = monthValue?.amount || 0;

            if (cat.type === 'income') {
                income += amount;
            } else if (cat.type === 'expense') {
                expense += amount;
            }
        });

        return {
            month,
            income,
            expense,
            surplus: income - expense,
        };
    });

    const formatCurrency = (value) => {
        return new Intl.NumberFormat('de-DE', {
            style: 'currency',
            currency: 'EUR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(value);
    };

    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className="glass rounded-xl p-4 shadow-xl border border-white/50">
                    <p className="font-semibold text-slate-800 mb-2">{label}</p>
                    {payload.map((entry, index) => (
                        <p key={index} className="text-sm" style={{ color: entry.color }}>
                            {entry.name}: {formatCurrency(entry.value)}
                        </p>
                    ))}
                </div>
            );
        }
        return null;
    };

    if (loading) {
        return (
            <div className="glass rounded-2xl p-6 animate-pulse">
                <div className="h-6 bg-slate-200 rounded w-48 mb-4"></div>
                <div className="h-64 bg-slate-100 rounded-xl"></div>
            </div>
        );
    }

    return (
        <div className="glass rounded-2xl p-6">
            <h3 className="text-lg font-semibold text-slate-800 mb-4">Jahresverlauf</h3>
            <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={monthlyData}>
                        <defs>
                            <linearGradient id="surplusGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="#22c55e" stopOpacity={0.05} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                        <XAxis
                            dataKey="month"
                            tick={{ fill: '#64748b', fontSize: 12 }}
                            axisLine={{ stroke: '#cbd5e1' }}
                        />
                        <YAxis
                            tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
                            tick={{ fill: '#64748b', fontSize: 12 }}
                            axisLine={{ stroke: '#cbd5e1' }}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend
                            wrapperStyle={{ paddingTop: '10px' }}
                            formatter={(value) => (
                                <span className="text-slate-600 text-sm">{value}</span>
                            )}
                        />
                        <Area
                            type="monotone"
                            dataKey="surplus"
                            name="Überschuss"
                            stroke="transparent"
                            fill="url(#surplusGradient)"
                        />
                        <Line
                            type="monotone"
                            dataKey="income"
                            name="Einnahmen"
                            stroke="#22c55e"
                            strokeWidth={3}
                            dot={{ fill: '#22c55e', strokeWidth: 2, r: 4 }}
                            activeDot={{ r: 6, strokeWidth: 0 }}
                        />
                        <Line
                            type="monotone"
                            dataKey="expense"
                            name="Ausgaben"
                            stroke="#f97316"
                            strokeWidth={3}
                            dot={{ fill: '#f97316', strokeWidth: 2, r: 4 }}
                            activeDot={{ r: 6, strokeWidth: 0 }}
                        />
                    </ComposedChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
