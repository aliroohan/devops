import { useState, useEffect } from 'react';
import api from '../services/api';
import { toast } from 'react-hot-toast';
import { FiPlus, FiTrash2, FiFilter, FiCalendar } from 'react-icons/fi';

const CATEGORIES = [
  'Food', 'Transport', 'Entertainment', 'Shopping', 'Bills', 'Health', 'Education', 'Travel', 'Other'
];

export const Expenses = () => {
  const [expenses, setExpenses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    amount: '',
    category: 'Other',
    description: '',
    date: new Date().toISOString().split('T')[0],
  });
  const [filters, setFilters] = useState({
    category: '',
    startDate: '',
    endDate: '',
  });

  const fetchExpenses = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.category) params.append('category', filters.category);
      if (filters.startDate) params.append('startDate', filters.startDate);
      if (filters.endDate) params.append('endDate', filters.endDate);

      const response = await api.get(`/expenses?${params.toString()}`);
      setExpenses(response.data.data);
    } catch (error) {
      toast.error('Failed to load expenses');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, [filters]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/expenses', formData);
      toast.success('Expense added!');
      setShowAddForm(false);
      setFormData({
        amount: '',
        category: 'Other',
        description: '',
        date: new Date().toISOString().split('T')[0],
      });
      fetchExpenses();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to add expense');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this?')) return;
    try {
      await api.delete(`/expenses/${id}`);
      toast.success('Deleted');
      fetchExpenses();
    } catch (error) {
      toast.error('Delete failed');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-bold text-white">Expenses</h1>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center space-x-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-lg shadow-blue-500/20 transition-all font-semibold"
        >
          <FiPlus />
          <span>{showAddForm ? 'Cancel' : 'Add Expense'}</span>
        </button>
      </div>

      {showAddForm && (
        <div className="bg-slate-900 border border-white/10 p-6 rounded-2xl shadow-xl animate-in fade-in slide-in-from-top-4 duration-300">
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">Amount</label>
              <input
                type="number"
                required
                step="0.01"
                className="w-full px-4 py-2.5 rounded-xl bg-slate-800 border border-white/10 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">Category</label>
              <select
                className="w-full px-4 py-2.5 rounded-xl bg-slate-800 border border-white/10 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">Date</label>
              <input
                type="date"
                required
                className="w-full px-4 py-2.5 rounded-xl bg-slate-800 border border-white/10 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">Description</label>
              <input
                type="text"
                className="w-full px-4 py-2.5 rounded-xl bg-slate-800 border border-white/10 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="Optional"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>
            <div className="md:col-span-4 flex justify-end">
              <button
                type="submit"
                className="px-8 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-lg shadow-blue-500/20"
              >
                Save Expense
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Filters */}
      <div className="bg-slate-900/50 border border-white/5 p-4 rounded-2xl flex flex-wrap gap-4 items-center">
        <div className="flex items-center space-x-2 text-slate-400">
          <FiFilter />
          <span className="text-sm font-medium uppercase tracking-wider">Filters:</span>
        </div>
        <select
          className="px-4 py-2 rounded-lg bg-slate-800 border border-white/10 text-sm text-white outline-none"
          value={filters.category}
          onChange={(e) => setFilters({ ...filters, category: e.target.value })}
        >
          <option value="">All Categories</option>
          {CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
        <div className="flex items-center space-x-2">
          <FiCalendar className="text-slate-500" />
          <input
            type="date"
            className="px-4 py-2 rounded-lg bg-slate-800 border border-white/10 text-sm text-white outline-none"
            value={filters.startDate}
            onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
          />
          <span className="text-slate-500">to</span>
          <input
            type="date"
            className="px-4 py-2 rounded-lg bg-slate-800 border border-white/10 text-sm text-white outline-none"
            value={filters.endDate}
            onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
          />
        </div>
        {(filters.category || filters.startDate || filters.endDate) && (
          <button
            onClick={() => setFilters({ category: '', startDate: '', endDate: '' })}
            className="text-xs text-blue-400 hover:text-blue-300 font-medium underline px-2"
          >
            Clear All
          </button>
        )}
      </div>

      <div className="bg-slate-900 border border-white/10 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-white/5 text-slate-400 text-xs font-semibold uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4">Description</th>
                <th className="px-6 py-4 text-right">Amount</th>
                <th className="px-6 py-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr><td colSpan={5} className="px-6 py-12 text-center text-slate-500">Loading expenses...</td></tr>
              ) : expenses.length === 0 ? (
                <tr><td colSpan={5} className="px-6 py-12 text-center text-slate-500">No expenses found matching the filters.</td></tr>
              ) : (
                expenses.map((exp) => (
                  <tr key={exp._id} className="hover:bg-white/5 transition-colors group">
                    <td className="px-6 py-4 text-sm text-slate-300">
                      {new Date(exp.date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-xs font-medium text-slate-300">
                        {exp.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-400 truncate max-w-[200px]">
                      {exp.description || '-'}
                    </td>
                    <td className="px-6 py-4 text-right font-bold text-slate-200">
                      ${exp.amount.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => handleDelete(exp._id)}
                        className="p-2 text-slate-500 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all"
                        title="Delete"
                      >
                        <FiTrash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
