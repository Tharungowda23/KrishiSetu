import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  Package,
  Layers,
  ShoppingBag,
  TrendingUp,
  ShieldCheck,
  AlertTriangle,
  FileCheck,
  CheckCircle2,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import api from '../../services/api';
import { formatRupee, formatDate } from '../../utils/formatters';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import StatusBadge from '../../components/common/StatusBadge';

const COLORS = ['#245C3A', '#367A4C', '#B7791F', '#202820', '#687268'];

const AdminDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAdminDashboard = async () => {
      try {
        const res = await api.get('/admin/dashboard');
        if (res.data.success) {
          setData(res.data);
        }
      } catch (err) {
        console.warn('Error loading admin dashboard:', err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchAdminDashboard();
  }, []);

  if (loading) return <LoadingSpinner text="Loading administrator metrics..." />;

  const stats = data?.stats || {};
  const categoryStats = (data?.categoryStats || []).map((c) => ({
    name: c._id || 'General',
    value: c.count,
  }));

  return (
    <div className="space-y-8 pb-16">
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 border border-agriborder shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="badge-yellow mb-1.5 font-bold">Admin Central Controller</span>
          <h1 className="text-2xl font-bold text-agritext-main">Platform Activity & Operations</h1>
          <p className="text-xs text-agritext-secondary mt-0.5">
            Monitor users, inspect reported listings, and review platform transactions.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link to="/admin/verifications" className="btn-secondary text-xs py-2 px-3">
            <span>Pending Verifications ({stats.pendingVerifications || 0})</span>
          </Link>
          <Link to="/admin/listings" className="btn-primary text-xs py-2 px-3">
            <span>Moderate Listings</span>
          </Link>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="card p-5 bg-white border-agriborder">
          <div className="flex items-center justify-between text-forest mb-2">
            <span className="text-xs font-bold text-agritext-secondary uppercase">
              Registered Farmers
            </span>
            <Users className="w-4 h-4" />
          </div>
          <span className="text-2xl font-black text-agritext-main">
            {stats.totalFarmers || 0}
          </span>
          <span className="text-[11px] text-agritext-secondary block mt-1">Verified agricultural producers</span>
        </div>

        <div className="card p-5 bg-white border-agriborder">
          <div className="flex items-center justify-between text-sky-700 mb-2">
            <span className="text-xs font-bold text-agritext-secondary uppercase">
              Registered Buyers
            </span>
            <Users className="w-4 h-4" />
          </div>
          <span className="text-2xl font-black text-agritext-main">
            {stats.totalBuyers || 0}
          </span>
          <span className="text-[11px] text-agritext-secondary block mt-1">Wholesalers & processors</span>
        </div>

        <div className="card p-5 bg-white border-agriborder">
          <div className="flex items-center justify-between text-amber-700 mb-2">
            <span className="text-xs font-bold text-agritext-secondary uppercase">
              Active Listings
            </span>
            <Package className="w-4 h-4" />
          </div>
          <span className="text-2xl font-black text-agritext-main">
            {stats.activeListings || 0}
          </span>
          <span className="text-[11px] text-agritext-secondary block mt-1">On marketplace</span>
        </div>

        <div className="card p-5 bg-agrigreen-50 border-agrigreen-200">
          <div className="flex items-center justify-between text-forest mb-2">
            <span className="text-xs font-bold text-forest uppercase">
              Completed GMV
            </span>
            <TrendingUp className="w-4 h-4" />
          </div>
          <span className="text-2xl font-black text-forest">
            {formatRupee(stats.totalCompletedValue || 0)}
          </span>
          <span className="text-[11px] text-agritext-secondary block mt-1">Trade volume facilitated</span>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Categories Breakdown */}
        <div className="lg:col-span-6 card p-6 bg-white border-agriborder space-y-4">
          <h3 className="text-base font-bold text-agritext-main">Listings by Category</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryStats}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {categoryStats.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Transactions Feed */}
        <div className="lg:col-span-6 card p-6 bg-white border-agriborder space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-agritext-main">Recent Platform Sales</h3>
            <Link to="/admin/transactions" className="text-xs font-bold text-forest hover:underline">
              View All
            </Link>
          </div>

          <div className="divide-y divide-agriborder/60">
            {data?.recentSales?.map((sale) => (
              <div key={sale._id} className="py-3 flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-agritext-main block">
                    {sale.saleReference} • {sale.listingId?.cropName}
                  </span>
                  <span className="text-agritext-secondary">
                    Farmer: {sale.farmerId?.name} ➔ Buyer: {sale.buyerId?.name}
                  </span>
                </div>
                <div className="text-right">
                  <span className="font-bold text-forest block">
                    {formatRupee(sale.grossSaleValue)}
                  </span>
                  <StatusBadge status={sale.deliveryStatus} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
