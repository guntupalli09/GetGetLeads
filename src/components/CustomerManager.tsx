import { useState } from 'react';
import { useCustomers } from '../hooks/useCustomers';
import { useAI } from '../hooks/useAI';
import { AIFeatureIndicator } from './AIFeatureIndicator';
import { BackButton } from './BackButton';
import { LoadingSpinner } from './LoadingSpinner';
import { EmptyState } from './EmptyState';
import { CustomerProfile } from './customers/CustomerProfile';
import { CustomerAnalytics } from './customers/CustomerAnalytics';
import { CustomerSegments } from './customers/CustomerSegments';
import { CustomerWorkflow } from './customers/CustomerWorkflow';
import { CustomerFeedback } from './customers/CustomerFeedback';
import { CustomerImport } from './customers/CustomerImport';
import { CustomerLoyalty } from './customers/CustomerLoyalty';
import { 
  Users, Plus, Mail, Phone, MapPin, Tag, Calendar, Edit2, 
  MessageCircle, DollarSign, TrendingUp, Clock, FileText, 
  Download, Upload, Star, CheckSquare, AlertCircle, Trash2, 
  Filter, Settings, X, Sparkles, Brain, Search
} from 'lucide-react';

export function CustomerManager() {
  const { customers, loading, error, addCustomer, updateCustomer, deleteCustomer } = useCustomers();
  const { analyzeCustomer } = useAI();
  const [showAddCustomer, setShowAddCustomer] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'list' | 'analytics' | 'segments' | 'workflows' | 'feedback' | 'loyalty'>('list');

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
        title="Error Loading Customers"
        message={error}
        icon={<AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />}
      />
    );
  }

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'analytics':
        return <CustomerAnalytics customers={customers} />;
      case 'segments':
        return <CustomerSegments customers={customers} onSegmentSelect={() => {}} />;
      case 'workflows':
        return <CustomerWorkflow customers={customers} />;
      case 'feedback':
        return <CustomerFeedback customers={customers} />;
      case 'loyalty':
        return <CustomerLoyalty customers={customers} />;
      default:
        return (
          <div className="space-y-4">
            {customers.map((customer) => (
              <div
                key={customer.id}
                className="bg-primary-700/50 rounded-xl p-4 flex items-center justify-between"
                onClick={() => setSelectedCustomer(customer.id)}
              >
                <div>
                  <h3 className="text-lg font-medium text-white">{customer.name}</h3>
                  <p className="text-primary-300">{customer.email}</p>
                </div>
                <div className="flex items-center gap-4">
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    customer.status === 'lead'
                      ? 'bg-blue-500/20 text-blue-400'
                      : customer.status === 'customer'
                      ? 'bg-green-500/20 text-green-400'
                      : 'bg-yellow-500/20 text-yellow-400'
                  }`}>
                    {customer.status}
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        updateCustomer(customer.id, { status: 'customer' });
                      }}
                      className="p-2 text-primary-300 hover:text-white transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteCustomer(customer.id);
                      }}
                      className="p-2 text-primary-300 hover:text-red-400 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        );
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <BackButton />
          <h2 className="text-xl font-semibold text-white">Customer Management</h2>
          <AIFeatureIndicator feature="Customer Analysis" />
        </div>
        <div className="flex gap-4">
          <button
            onClick={() => setShowImport(true)}
            className="btn-secondary py-2 px-4 flex items-center gap-2"
          >
            <Upload className="w-4 h-4" />
            Import
          </button>
          <button
            onClick={() => setShowAddCustomer(true)}
            className="btn-primary py-2 px-4 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Customer
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex space-x-4 border-b border-primary-700">
        <button
          onClick={() => setActiveTab('list')}
          className={`px-4 py-2 ${
            activeTab === 'list'
              ? 'text-accent-500 border-b-2 border-accent-500'
              : 'text-primary-300 hover:text-white'
          }`}
        >
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            Customers
          </div>
        </button>
        <button
          onClick={() => setActiveTab('analytics')}
          className={`px-4 py-2 ${
            activeTab === 'analytics'
              ? 'text-accent-500 border-b-2 border-accent-500'
              : 'text-primary-300 hover:text-white'
          }`}
        >
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Analytics
          </div>
        </button>
        <button
          onClick={() => setActiveTab('segments')}
          className={`px-4 py-2 ${
            activeTab === 'segments'
              ? 'text-accent-500 border-b-2 border-accent-500'
              : 'text-primary-300 hover:text-white'
          }`}
        >
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4" />
            Segments
          </div>
        </button>
        <button
          onClick={() => setActiveTab('workflows')}
          className={`px-4 py-2 ${
            activeTab === 'workflows'
              ? 'text-accent-500 border-b-2 border-accent-500'
              : 'text-primary-300 hover:text-white'
          }`}
        >
          <div className="flex items-center gap-2">
            <Settings className="w-4 h-4" />
            Workflows
          </div>
        </button>
        <button
          onClick={() => setActiveTab('feedback')}
          className={`px-4 py-2 ${
            activeTab === 'feedback'
              ? 'text-accent-500 border-b-2 border-accent-500'
              : 'text-primary-300 hover:text-white'
          }`}
        >
          <div className="flex items-center gap-2">
            <MessageCircle className="w-4 h-4" />
            Feedback
          </div>
        </button>
        <button
          onClick={() => setActiveTab('loyalty')}
          className={`px-4 py-2 ${
            activeTab === 'loyalty'
              ? 'text-accent-500 border-b-2 border-accent-500'
              : 'text-primary-300 hover:text-white'
          }`}
        >
          <div className="flex items-center gap-2">
            <Star className="w-4 h-4" />
            Loyalty
          </div>
        </button>
      </div>

      {/* Active Tab Content */}
      {renderActiveTab()}

      {/* Add Customer Modal */}
      {showAddCustomer && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-primary-700 rounded-xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-white">Add Customer</h3>
              <button
                onClick={() => setShowAddCustomer(false)}
                className="text-primary-300 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={async (e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              await addCustomer(
                formData.get('email') as string,
                formData.get('name') as string,
                formData.get('source') as string
              );
              setShowAddCustomer(false);
            }}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-primary-200 mb-1">
                    Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    required
                    className="w-full rounded-lg bg-primary-600 border-primary-500 text-white px-4 py-2"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-primary-200 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    required
                    className="w-full rounded-lg bg-primary-600 border-primary-500 text-white px-4 py-2"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-primary-200 mb-1">
                    Source
                  </label>
                  <select
                    name="source"
                    className="w-full rounded-lg bg-primary-600 border-primary-500 text-white px-4 py-2"
                  >
                    <option value="website">Website</option>
                    <option value="referral">Referral</option>
                    <option value="social">Social Media</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div className="flex justify-end gap-4">
                  <button
                    type="button"
                    onClick={() => setShowAddCustomer(false)}
                    className="px-4 py-2 text-primary-300 hover:text-white transition-colors"
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn-primary py-2 px-6">
                    Add Customer
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Import Modal */}
      {showImport && (
        <CustomerImport
          onClose={() => setShowImport(false)}
          onImport={async (data) => {
            // Handle customer import
            console.log('Importing customers:', data);
            setShowImport(false);
          }}
        />
      )}

      {/* Customer Profile Modal */}
      {selectedCustomer && (
        <CustomerProfile
          customerId={selectedCustomer}
          onClose={() => setSelectedCustomer(null)}
        />
      )}
    </div>
  );
}