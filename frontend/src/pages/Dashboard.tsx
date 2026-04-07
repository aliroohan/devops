import { useState, useEffect } from 'react';
import api from '../services/api';
import {
  PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip as RechartsTooltip,
  BarChart, Bar, XAxis, YAxis, CartesianGrid
} from 'recharts';
import { FiTrendingUp, FiCreditCard, FiPieChart } from 'react-icons/fi';

const COLORS = ['#3b82f6', '#6366f1', '#a855f7', '#ec4899', '#f43f5e', '#f59e0b', '#10b981', '#06b6d4', '#64748b'];

export const Dashboard = () => {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.get('/expenses/stats');
        setStats(response.data.data);
      } catch (error) {
        console.error('Failed to fetch stats', error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) return <div className="text-center py-20 text-slate-500">Calculating your insights...</div>;
  if (!stats) return <div className="text-center py-20 text-red-500">Error loading dashboard stats</div>;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <h1 className="text-3xl font-bold text-white">Dashboard</h1>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-slate-900 border border-white/10 p-6 rounded-2xl shadow-xl hover:shadow-blue-500/5 transition-all">
          <div className="flex items-center justify-between mb-4">
            <span className="text-slate-400 font-medium">Monthly Spending</span>
            <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400">
              <FiCreditCard size={20} />
            </div>
          </div>
          <div className="text-3xl font-bold text-white">${stats.monthlyTotal.total.toFixed(2)}</div>
          <p className="text-sm text-slate-500 mt-2">{stats.monthlyTotal.count} transactions this month</p>
        </div>

        <div className="bg-slate-900 border border-white/10 p-6 rounded-2xl shadow-xl hover:shadow-indigo-500/5 transition-all">
          <div className="flex items-center justify-between mb-4">
            <span className="text-slate-400 font-medium">All-Time Total</span>
            <div className="p-2 bg-indigo-500/10 rounded-lg text-indigo-400">
              <FiTrendingUp size={20} />
            </div>
          </div>
          <div className="text-3xl font-bold text-white">${stats.allTimeTotal.total.toFixed(2)}</div>
          <p className="text-sm text-slate-500 mt-2">Overall tracks {stats.allTimeTotal.count} expenses</p>
        </div>

        <div className="bg-slate-900 border border-white/10 p-6 rounded-2xl shadow-xl hover:shadow-purple-500/5 transition-all">
          <div className="flex items-center justify-between mb-4">
            <span className="text-slate-400 font-medium">Top Category</span>
            <div className="p-2 bg-purple-500/10 rounded-lg text-purple-400">
              <FiPieChart size={20} />
            </div>
          </div>
          <div className="text-2xl font-bold text-white">
            {stats.categoryBreakdown[0]?.category || 'N/A'}
          </div>
          <p className="text-sm text-slate-500 mt-2">
            ${stats.categoryBreakdown[0]?.total.toFixed(2) || '0.00'} spent in this group
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Category Breakdown */}
        <div className="bg-slate-900 border border-white/10 p-6 rounded-2xl shadow-xl">
          <h2 className="text-xl font-semibold text-white mb-6">Spending by Category</h2>
          <div className="h-80 w-full">
            {stats.categoryBreakdown.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats.categoryBreakdown}
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="total"
                    nameKey="category"
                  >
                    {stats.categoryBreakdown.map((_: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip 
                    contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f8fafc' }}
                    itemStyle={{ color: '#f8fafc' }}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
                <div className="flex items-center justify-center h-full text-slate-500">No category data yet</div>
            )}
          </div>
        </div>

        {/* Monthly Trend */}
        <div className="bg-slate-900 border border-white/10 p-6 rounded-2xl shadow-xl">
          <h2 className="text-xl font-semibold text-white mb-6">Last 6 Months Trend</h2>
          <div className="h-80 w-full">
            {stats.monthlyTrends.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.monthlyTrends}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} />
                  <YAxis stroke="#94a3b8" fontSize={12} />
                  <RechartsTooltip 
                    contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f8fafc' }}
                    itemStyle={{ color: '#f8fafc' }}
                  />
                  <Bar dataKey="total" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-slate-500">No trend data yet</div>
            )}
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-slate-900 border border-white/10 p-6 rounded-2xl shadow-xl">
        <h2 className="text-xl font-semibold text-white mb-6">Recent Transactions</h2>
        <div className="space-y-4">
          {stats.recentExpenses.length > 0 ? (
            stats.recentExpenses.map((exp: any) => (
              <div key={exp._id} className="flex items-center justify-between p-4 bg-slate-800/50 rounded-xl hover:bg-slate-800 transition-colors">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-400 font-bold uppercase">
                    {exp.category[0]}
                  </div>
                  <div>
                    <p className="text-slate-200 font-medium">{exp.category}</p>
                    <p className="text-xs text-slate-500">{new Date(exp.date).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-slate-100 font-bold">-${exp.amount.toFixed(2)}</p>
                  <p className="text-xs text-slate-500 truncate max-w-[150px]">{exp.description || 'No notes'}</p>
                </div>
              </div>
            ))
          ) : (
            <p className="text-center text-slate-500 py-4">No recent transactions to display</p>
          )}
        </div>
      </div>
    </div>
  );
};
