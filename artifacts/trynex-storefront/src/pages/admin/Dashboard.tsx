import { AdminLayout } from "@/components/layout/AdminLayout";
import { useGetAdminStats } from "@workspace/api-client-react";
import { Loader } from "@/components/ui/Loader";
import { getAuthHeaders, formatPrice } from "@/lib/utils";
import { TrendingUp, ShoppingCart, Package, AlertTriangle, ArrowUpRight, Users, RefreshCw, Circle } from "lucide-react";
import { Link } from "wouter";
import { motion } from "framer-motion";

export default function AdminDashboard() {
  const { data: stats, isLoading, refetch, dataUpdatedAt } = useGetAdminStats({
    request: { headers: getAuthHeaders() },
    query: { refetchInterval: 30000 } as any
  });

  if (isLoading || !stats) return <AdminLayout><Loader /></AdminLayout>;

  const lastRefresh = dataUpdatedAt ? new Date(dataUpdatedAt).toLocaleTimeString('en-BD') : null;

  const cards = [
    { title: "Total Revenue", value: formatPrice(stats.totalRevenue), icon: TrendingUp, color: "#4ade80", bg: "rgba(74,222,128,0.1)", border: "rgba(74,222,128,0.2)", desc: "All time earnings" },
    { title: "Today's Revenue", value: formatPrice(stats.todayRevenue), icon: TrendingUp, color: "#60a5fa", bg: "rgba(96,165,250,0.1)", border: "rgba(96,165,250,0.2)", desc: "Earned today" },
    { title: "Total Orders", value: String(stats.totalOrders), icon: ShoppingCart, color: "hsl(var(--primary))", bg: "rgba(255,107,43,0.1)", border: "rgba(255,107,43,0.2)", desc: "All orders" },
    { title: "Low Stock Alert", value: String(stats.lowStockProducts), icon: AlertTriangle, color: "#f59e0b", bg: "rgba(245,158,11,0.1)", border: "rgba(245,158,11,0.2)", desc: "Products ≤5 units" },
  ];

  const getStatusStyle = (status: string) => {
    const map: Record<string, string> = {
      pending: 'status-pending', processing: 'status-processing',
      shipped: 'status-shipped', delivered: 'status-delivered', cancelled: 'status-cancelled',
    };
    return map[status] || 'status-pending';
  };

  return (
    <AdminLayout>
      {/* Header */}
      <div className="flex items-start justify-between mb-10 gap-4 flex-wrap">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-primary mb-2">Overview</p>
          <h1 className="text-4xl font-black font-display tracking-tighter">Dashboard</h1>
          {lastRefresh && (
            <p className="text-xs text-foreground/30 mt-1.5 flex items-center gap-1.5 font-medium">
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
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all text-foreground/50 hover:text-foreground"
          style={{ background: 'hsl(0 0% 9%)', border: '1px solid rgba(255,255,255,0.07)' }}
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
              initial={{ opacity: 0, y: 20, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ delay: i * 0.08, duration: 0.5 }}
              whileHover={{ y: -4 }}
              className="p-6 rounded-2xl relative overflow-hidden card-shine"
              style={{ background: 'hsl(0 0% 7.5%)', border: '1px solid rgba(255,255,255,0.06)' }}
            >
              {/* Background glow */}
              <div className="absolute -top-8 -right-8 w-24 h-24 rounded-full blur-2xl opacity-40"
                style={{ background: `radial-gradient(circle, ${c.color}, transparent)` }} />

              <div className="flex items-start justify-between mb-5 relative">
                <div className="w-11 h-11 rounded-xl flex items-center justify-center"
                  style={{ background: c.bg, border: `1px solid ${c.border}` }}>
                  <Icon className="w-5 h-5" style={{ color: c.color }} />
                </div>
                <span className="text-[10px] font-bold px-2 py-1 rounded-lg text-foreground/30"
                  style={{ background: 'hsl(0 0% 10%)' }}>
                  {c.desc}
                </span>
              </div>
              <p className="text-[11px] font-black uppercase tracking-widest text-foreground/30 mb-1.5">{c.title}</p>
              <p className="text-2xl font-black" style={{ color: c.color }}>{c.value}</p>
            </motion.div>
          );
        })}
      </div>

      {/* Status Breakdown */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 mb-8">
        {[
          { label: "Pending", value: stats.pendingOrders, cls: 'status-pending', icon: "⏳" },
          { label: "Processing", value: stats.processingOrders, cls: 'status-processing', icon: "🔄" },
          { label: "Shipped", value: stats.shippedOrders, cls: 'status-shipped', icon: "🚚" },
          { label: "Delivered", value: stats.deliveredOrders, cls: 'status-delivered', icon: "✅" },
          { label: "Products", value: stats.totalProducts, cls: 'luxury-badge', icon: "📦" },
        ].map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 + i * 0.06 }}
            className="p-4 rounded-2xl text-center"
            style={{ background: 'hsl(0 0% 7.5%)', border: '1px solid rgba(255,255,255,0.05)' }}
          >
            <div className="text-lg mb-1">{s.icon}</div>
            <p className={`text-2xl font-black mb-1.5 ${s.cls} inline-block px-3 py-0.5 rounded-xl`}>{s.value}</p>
            <p className="text-[10px] font-black uppercase tracking-widest text-foreground/25">{s.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {[
          { label: "View All Orders", href: "/admin/orders", color: "hsl(var(--primary))", icon: ShoppingCart },
          { label: "Manage Products", href: "/admin/products", color: "#60a5fa", icon: Package },
          { label: "Store Settings", href: "/admin/settings", color: "#a78bfa", icon: AlertTriangle },
          { label: "Visit Store", href: "/", color: "#4ade80", icon: ArrowUpRight },
        ].map(({ label, href, color, icon: Icon }) => (
          <Link
            key={label}
            href={href}
            className="flex items-center gap-3 p-4 rounded-2xl text-sm font-semibold transition-all hover:-translate-y-1"
            style={{ background: 'hsl(0 0% 7.5%)', border: '1px solid rgba(255,255,255,0.05)' }}
          >
            <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: `${color}12`, border: `1px solid ${color}20` }}>
              <Icon className="w-4 h-4" style={{ color }} />
            </div>
            <span className="text-foreground/60 hover:text-foreground transition-colors text-xs font-bold">{label}</span>
          </Link>
        ))}
      </div>

      {/* Recent Orders */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="rounded-2xl overflow-hidden"
        style={{ background: 'hsl(0 0% 7.5%)', border: '1px solid rgba(255,255,255,0.06)' }}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
          <div className="flex items-center gap-2">
            <h2 className="font-bold text-base">Recent Orders</h2>
            <span className="text-[10px] font-black px-2 py-0.5 rounded-full luxury-badge">LIVE</span>
          </div>
          <Link href="/admin/orders" className="flex items-center gap-1 text-xs font-bold text-primary hover:underline">
            View All <ArrowUpRight className="w-3 h-3" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ background: 'hsl(0 0% 8%)' }}>
                <th className="px-6 py-3 text-left text-[11px] font-black text-foreground/25 uppercase tracking-wider">Order #</th>
                <th className="px-6 py-3 text-left text-[11px] font-black text-foreground/25 uppercase tracking-wider">Customer</th>
                <th className="px-6 py-3 text-left text-[11px] font-black text-foreground/25 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-[11px] font-black text-foreground/25 uppercase tracking-wider">Payment</th>
                <th className="px-6 py-3 text-left text-[11px] font-black text-foreground/25 uppercase tracking-wider">Total</th>
              </tr>
            </thead>
            <tbody>
              {stats.recentOrders.map((order, i) => (
                <motion.tr
                  key={order.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.55 + i * 0.05 }}
                  className="border-t border-white/5 hover:bg-white/[0.015] transition-colors"
                >
                  <td className="px-6 py-4 font-mono text-xs font-bold text-primary">{order.orderNumber}</td>
                  <td className="px-6 py-4 font-semibold text-sm">{order.customerName}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-xl text-xs font-bold capitalize ${getStatusStyle(order.status)}`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-xs font-bold text-foreground/40 uppercase">{order.paymentMethod}</span>
                  </td>
                  <td className="px-6 py-4 font-black text-primary">{formatPrice(order.total)}</td>
                </motion.tr>
              ))}
              {stats.recentOrders.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-16 text-center">
                    <ShoppingCart className="w-10 h-10 mx-auto mb-3 opacity-15" />
                    <p className="text-foreground/30 text-sm font-medium">No orders yet. Share your store to get started!</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </motion.div>
    </AdminLayout>
  );
}
