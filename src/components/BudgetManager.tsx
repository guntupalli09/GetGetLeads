import { useState } from 'react';
import { useBudget } from '../hooks/useBudget';
import { useAI } from '../hooks/useAI';
import { AIFeatureIndicator } from './AIFeatureIndicator';
import { BackButton } from './BackButton';
import { LoadingSpinner } from './LoadingSpinner';
import { EmptyState } from './EmptyState';
import { BudgetAnalytics } from './BudgetAnalytics';
import {
  DollarSign,
  Plus,
  Calendar,
  TrendingUp,
  Target,
  Clock,
  AlertCircle,
  Trash2,
  Filter,
  Settings,
  X,
  Sparkles
} from 'lucide-react';

export function BudgetManager() {
  const { budgets, expenses, loading, error, addBudget, addExpense } = useBudget();
  const [showAddBudget, setShowAddBudget] = useState(false);
  const [showAddExpense, setShowAddExpense] = useState(false);
  
  // Budget form state
  const [category, setCategory] = useState('');
  const [amount, setAmount] = useState('');
  const [period, setPeriod] = useState('monthly');
  
  // Expense form state
  const [expenseCategory, setExpenseCategory] = useState('');
  const [expenseAmount, setExpenseAmount] = useState('');
  const [expenseDescription, setExpenseDescription] = useState('');
  const [expenseDate, setExpenseDate] = useState('');

  const handleAddBudget = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addBudget(
        category,
        parseFloat(amount),
        period
      );
      setShowAddBudget(false);
      setCategory('');
      setAmount('');
      setPeriod('monthly');
    } catch (err) {
      console.error('Error adding budget:', err);
    }
  };

  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addExpense(
        expenseCategory,
        parseFloat(expenseAmount),
        expenseDescription,
        new Date(expenseDate)
      );
      setShowAddExpense(false);
      setExpenseCategory('');
      setExpenseAmount('');
      setExpenseDescription('');
      setExpenseDate('');
    } catch (err) {
      console.error('Error adding expense:', err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <LoadingSpinner size={32} />
      </div>
    );
  }

  if (error) {
    return (
      <EmptyState
        title="Error Loading Budget Data"
        message={error}
        icon={<AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />}
      />
    );
  }

  const totalBudget = budgets.reduce((sum, b) => sum + b.amount, 0);
  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  const remainingBudget = Math.max(0, totalBudget - totalExpenses);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <BackButton />
          <h2 className="text-xl font-semibold text-white">Budget Management</h2>
          <AIFeatureIndicator feature="Budget Analytics" />
        </div>
        <div className="flex gap-4">
          <button
            onClick={() => setShowAddBudget(true)}
            className="btn-primary py-2 px-4 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Budget
          </button>
          <button
            onClick={() => setShowAddExpense(true)}
            className="btn-primary py-2 px-4 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Expense
          </button>
        </div>
      </div>

      {/* Budget Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-primary-700/50 rounded-xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <DollarSign className="w-5 h-5 text-accent-500" />
            <h3 className="text-sm font-medium text-primary-200">Total Budget</h3>
          </div>
          <p className="text-2xl font-bold text-white">${totalBudget.toLocaleString()}</p>
        </div>

        <div className="bg-primary-700/50 rounded-xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <Target className="w-5 h-5 text-accent-500" />
            <h3 className="text-sm font-medium text-primary-200">Total Expenses</h3>
          </div>
          <p className="text-2xl font-bold text-white">${totalExpenses.toLocaleString()}</p>
        </div>

        <div className="bg-primary-700/50 rounded-xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-accent-500" />
            <h3 className="text-sm font-medium text-primary-200">Remaining Budget</h3>
          </div>
          <p className="text-2xl font-bold text-white">${remainingBudget.toLocaleString()}</p>
        </div>
      </div>

      {/* Budget Analytics */}
      <BudgetAnalytics
        budgets={budgets}
        expenses={expenses}
        onInsightGenerated={(insights) => {
          console.log('AI Insights:', insights);
        }}
      />

      {/* Add Budget Modal */}
      {showAddBudget && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-primary-700 rounded-xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-white">Add Budget</h3>
              <button
                onClick={() => setShowAddBudget(false)}
                className="p-2 text-primary-300 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddBudget} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-primary-200">
                  Category
                </label>
                <input
                  type="text"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="mt-1 block w-full rounded-lg bg-primary-600 border-primary-500 text-white px-4 py-2"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-primary-200">
                  Amount
                </label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="mt-1 block w-full rounded-lg bg-primary-600 border-primary-500 text-white px-4 py-2"
                  min="0"
                  step="0.01"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-primary-200">
                  Period
                </label>
                <select
                  value={period}
                  onChange={(e) => setPeriod(e.target.value)}
                  className="mt-1 block w-full rounded-lg bg-primary-600 border-primary-500 text-white px-4 py-2"
                >
                  <option value="monthly">Monthly</option>
                  <option value="quarterly">Quarterly</option>
                  <option value="yearly">Yearly</option>
                </select>
              </div>

              <div className="flex justify-end gap-4">
                <button
                  type="button"
                  onClick={() => setShowAddBudget(false)}
                  className="px-4 py-2 text-primary-300 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary py-2 px-6">
                  Add Budget
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Expense Modal */}
      {showAddExpense && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-primary-700 rounded-xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-white">Add Expense</h3>
              <button
                onClick={() => setShowAddExpense(false)}
                className="p-2 text-primary-300 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddExpense} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-primary-200">
                  Category
                </label>
                <select
                  value={expenseCategory}
                  onChange={(e) => setExpenseCategory(e.target.value)}
                  className="mt-1 block w-full rounded-lg bg-primary-600 border-primary-500 text-white px-4 py-2"
                  required
                >
                  <option value="">Select a category</option>
                  {budgets.map((budget) => (
                    <option key={budget.id} value={budget.category}>
                      {budget.category}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-primary-200">
                  Amount
                </label>
                <input
                  type="number"
                  value={expenseAmount}
                  onChange={(e) => setExpenseAmount(e.target.value)}
                  className="mt-1 block w-full rounded-lg bg-primary-600 border-primary-500 text-white px-4 py-2"
                  min="0"
                  step="0.01"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-primary-200">
                  Description
                </label>
                <input
                  type="text"
                  value={expenseDescription}
                  onChange={(e) => setExpenseDescription(e.target.value)}
                  className="mt-1 block w-full rounded-lg bg-primary-600 border-primary-500 text-white px-4 py-2"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-primary-200">
                  Date
                </label>
                <input
                  type="date"
                  value={expenseDate}
                  onChange={(e) => setExpenseDate(e.target.value)}
                  className="mt-1 block w-full rounded-lg bg-primary-600 border-primary-500 text-white px-4 py-2"
                  required
                />
              </div>

              <div className="flex justify-end gap-4">
                <button
                  type="button"
                  onClick={() => setShowAddExpense(false)}
                  className="px-4 py-2 text-primary-300 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary py-2 px-6">
                  Add Expense
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Budgets List */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-white">Budgets</h3>
        <div className="grid gap-4">
          {budgets.map((budget) => (
            <div
              key={budget.id}
              className="bg-primary-700/50 rounded-xl p-4 flex items-center justify-between"
            >
              <div>
                <h4 className="font-medium text-white">{budget.category}</h4>
                <p className="text-sm text-primary-300">
                  ${budget.amount.toLocaleString()} ({budget.period})
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button className="p-2 text-primary-300 hover:text-white transition-colors">
                  <Settings className="w-4 h-4" />
                </button>
                <button className="p-2 text-primary-300 hover:text-red-400 transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Expenses List */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-white">Recent Expenses</h3>
        <div className="grid gap-4">
          {expenses.map((expense) => (
            <div
              key={expense.id}
              className="bg-primary-700/50 rounded-xl p-4 flex items-center justify-between"
            >
              <div>
                <h4 className="font-medium text-white">{expense.category}</h4>
                <p className="text-sm text-primary-300">{expense.description}</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-white font-medium">
                    ${expense.amount.toLocaleString()}
                  </p>
                  <p className="text-sm text-primary-300">
                    {new Date(expense.date).toLocaleDateString()}
                  </p>
                </div>
                <button className="p-2 text-primary-300 hover:text-red-400 transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}