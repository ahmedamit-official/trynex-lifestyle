import { AdminLayout } from "@/components/layout/AdminLayout";
import { useGetAdminStats } from "@workspace/api-client-react";
import { Loader } from "@/components/ui/Loader";
import { getAuthHeaders, formatPrice } from "@/lib/utils";
import { TrendingUp, ShoppingCart, Package, AlertTriangle, ArrowUpRight, RefreshCw } from "lucide-react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend, BarChart, Bar
} from "recharts";

const WEEKLY_DATA = [
  { day: "Mon", revenue: 12400, orders: 18 },
  { day: "Tue", revenue: 18900, orders: 27 },
  { day: "Wed", revenue: 15200, orders: 21 },
  { day: "Thu", revenue: 22100, orders: 32 },
  { day: "Fri", revenue: 29500, orders: 41 },
  { day: "Sat", revenue: 35200, orders: 54 },
  { day: "Sun", revenue: 27800, orders: 39 },
];

const PAYMENT_DATA = [
  { name: "bKash", value: 45, color: "#e2136e" },
  { name: "Nagad", value: 28, color: "#f7941d" },
  { name: "COD", value: 18, color: "#16a34a" },
  { name: "Rocket", value: 9, color: "#8b2291" },
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-gray-100 rounded-xl p-3 shadow-lg text-sm">
        <p className="font-bold text-gray-900 mb-2">{label}</p>
        {payload.map((p: any, i: number) => (
          <p key={i} className="font-semibold" style={{ color: p.color }}>
            {p.name}: {p.name === "revenue" ? formatPrice(p.value) : p.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function AdminDashboard() {
  const { data: stats, isLoading, refetch, dataUpdatedAt } = useGetAdminStats({
    request: { headers: getAuthHeaders() },
    query: { refetchInterval: 30000 } as any
  });

  if (isLoading || !stats) return <AdminLayout><Loader /></AdminLayout>;

  const lastRefresh = dataUpdatedAt ? new Date(dataUpdatedAt).toLocaleTimeString('en-BD') : null;

  const cards = [
    {
      title: "Total Revenue",
      value: formatPrice(stats.totalRevenue),
      icon: TrendingUp,
      color: "#16a34a",
      bg: "#f0fdf4",
      border: "#bbf7d0",
      desc: "All time earnings",
      trend: "+12.5%"
    },
    {
      title: "Today's Revenue",
      value: formatPrice(stats.todayRevenue),
      icon: TrendingUp,
      color: "#2563eb",
      bg: "#eff6ff",
      border: "#bfdbfe",
      desc: "Earned today",
      trend: "+8.2%"
    },
    {
      title: "Total Orders",
      value: String(stats.totalOrders),
      icon: ShoppingCart,
      color: "#E85D04",
      bg: "#fff4ee",
      border: "#fdd5b4",
      desc: "All orders placed",
      trend: "+5.1%"
    },
    {
      title: "Low Stock Alert",
      value: String(stats.lowStockProducts),
      icon: AlertTriangle,
      color: "#d97706",
      bg: "#fffbeb",
      border: "#fde68a",
      desc: "Products ≤ 5 units",
      trend: "Action needed"
    },
  ];

  const getStatusStyle = (status: string) => {
    const map: Record<string, string> = {
      pending: 'status-pending', processing: 'status-processing',
      shipped: 'status-shipped', delivered: 'status-delivered',
      cancelled: 'status-cancelled', ongoing: 'status-ongoing',
    };
    return map[status] || 'status-pending';
  };

  return (
    <AdminLayout>
      {/* Header */}
      <div className="flex items-start justify-between mb-8 gap-4 flex-wrap">
        <div>
          <p className="text-xs font-black uppercase tracking-widest text-orange-500 mb-1">Overview</p>
          <h1 className="text-3xl font-black font-display tracking-tight text-gray-900">Dashboard</h1>
          {lastRefresh && (
            <p className="text-xs text-gray-400 mt-1.5 flex items-center gap-1.5 font-medium">
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-green-400"></span>
              </span>
              Live · Updated {lastRefresh}
            </p>
          )}
        </div>
        <button
          onClick={() => refetch()}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all text-gray-600 bg-white border border-gray-200 hover:border-orange-300 hover:text-orange-600"
        >
          <RefreshCw className="w-4 h-4" /> Refresh
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        {cards.map((c, i) => {
          const Icon = c.icon;
          return (
            <motion.div
              key={c.title}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              whileHover={{ y: -3 }}
              className="p-6 rounded-2xl bg-white border shadow-sm"
              style={{ borderColor: c.border }}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-11 h-11 rounded-xl flex items-center justify-center"
                  style={{ background: c.bg }}>
                  <Icon className="w-5 h-5" style={{ color: c.color }} />
                </div>
                <span className="text-xs font-bold px-2.5 py-1 rounded-full"
                  style={{ background: c.bg, color: c.color }}>
                  {c.trend}
                </span>
              </div>
              <p className="text-2xl font-black text-gray-900 mb-1">{c.value}</p>
              <p className="text-xs text-gray-500 font-medium">{c.title}</p>
            </motion.div>
          );
        })}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">

        {/* Revenue Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="font-black text-gray-900">Weekly Revenue</h2>
              <p className="text-xs text-gray-400 mt-0.5">Last 7 days performance</p>
            </div>
            <span className="text-xs font-bold px-3 py-1.5 rounded-full bg-green-50 text-green-600 border border-green-100">
              ↑ +18.2% this week
            </span>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={WEEKLY_DATA} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#E85D04" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#E85D04" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis dataKey="day" tick={{ fontSize: 11, fontWeight: 600, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} tickFormatter={v => `৳${(v/1000).toFixed(0)}K`} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="revenue" name="revenue" stroke="#E85D04" strokeWidth={2.5} fill="url(#revenueGrad)" dot={{ fill: '#E85D04', strokeWidth: 2, r: 4 }} activeDot={{ r: 6 }} />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Payment Methods Pie */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6"
        >
          <h2 className="font-black text-gray-900 mb-1">Payment Methods</h2>
          <p className="text-xs text-gray-400 mb-6">Order distribution</p>
          <ResponsiveContainer width="100%" height={160}>
            <PieChart>
              <Pie
                data={PAYMENT_DATA}
                cx="50%" cy="50%"
                innerRadius={45} outerRadius={70}
                paddingAngle={3}
                dataKey="value"
              >
                {PAYMENT_DATA.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(v: any) => `${v}%`} />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-2 mt-2">
            {PAYMENT_DATA.map((p) => (
              <div key={p.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ background: p.color }} />
                  <span className="font-semibold text-gray-600">{p.name}</span>
                </div>
                <span className="font-black text-gray-900">{p.value}%</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Orders Chart + Table */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Orders Bar Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55 }}
          className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6"
        >
          <h2 className="font-black text-gray-900 mb-1">Daily Orders</h2>
          <p className="text-xs text-gray-400 mb-6">Orders this week</p>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={WEEKLY_DATA} margin={{ top: 0, right: 0, left: -25, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis dataKey="day" tick={{ fontSize: 10, fontWeight: 600, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
              <Tooltip formatter={(v: any) => `${v} orders`} />
              <Bar dataKey="orders" name="Orders" fill="#E85D04" radius={[6, 6, 0, 0]} opacity={0.85} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Recent Orders Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
        >
          <div className="p-6 border-b border-gray-100 flex items-center justify-between">
            <div>
              <h2 className="font-black text-gray-900">Recent Orders</h2>
              <p className="text-xs text-gray-400 mt-0.5">Latest customer orders</p>
            </div>
            <Link href="/admin/orders"
              className="text-xs font-bold text-orange-600 flex items-center gap-1 hover:text-orange-700 transition-colors">
              View All <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-5 py-3 text-left text-[10px] font-black text-gray-400 uppercase tracking-wider">Order #</th>
                  <th className="px-5 py-3 text-left text-[10px] font-black text-gray-400 uppercase tracking-wider">Customer</th>
                  <th className="px-5 py-3 text-left text-[10px] font-black text-gray-400 uppercase tracking-wider">Status</th>
                  <th className="px-5 py-3 text-left text-[10px] font-black text-gray-400 uppercase tracking-wider">Payment</th>
                  <th className="px-5 py-3 text-left text-[10px] font-black text-gray-400 uppercase tracking-wider">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {stats.recentOrders.map((order, i) => (
                  <motion.tr
                    key={order.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.7 + i * 0.04 }}
                    className="hover:bg-orange-50/30 transition-colors"
                  >
                    <td className="px-5 py-4 font-mono text-xs font-black text-orange-600">{order.orderNumber}</td>
                    <td className="px-5 py-4 font-semibold text-sm text-gray-900">{order.customerName}</td>
                    <td className="px-5 py-4">
                      <span className={`px-2.5 py-1 rounded-xl text-xs font-bold capitalize ${getStatusStyle(order.status)}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-xs font-black text-gray-500 uppercase">{order.paymentMethod}</span>
                    </td>
                    <td className="px-5 py-4 font-black text-orange-600">{formatPrice(order.total)}</td>
                  </motion.tr>
                ))}
                {stats.recentOrders.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-5 py-16 text-center">
                      <ShoppingCart className="w-10 h-10 mx-auto mb-3 text-gray-300" />
                      <p className="text-gray-400 text-sm font-medium">No orders yet. Share your store to get started!</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>
    </AdminLayout>
  );
}
