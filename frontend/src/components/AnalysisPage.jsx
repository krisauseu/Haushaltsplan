import QuickStatsCards from './QuickStatsCards';
import ExpenseDistributionChart from './ExpenseDistributionChart';
import TrendChart from './TrendChart';

export default function AnalysisPage({ data, summary, year, loading }) {
    return (
        <div className="space-y-6">
            {/* Quick Stats Cards */}
            <QuickStatsCards summary={summary} data={data} loading={loading} />

            {/* Charts Grid - responsive layout */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Expense Distribution (Doughnut) */}
                <ExpenseDistributionChart data={data} loading={loading} />

                {/* Trend Chart (Area/Line) */}
                <TrendChart data={data} loading={loading} />
            </div>
        </div>
    );
}
