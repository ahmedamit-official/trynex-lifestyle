import { Link, useLocation } from "wouter";
import { LayoutDashboard, Package, ShoppingCart, Settings, LogOut, Menu, X, FileText } from "lucide-react";
import { useAdminLogout, useAdminMe } from "@workspace/api-client-react";
import { useEffect, useState } from "react";
import { Loader } from "@/components/ui/Loader";
import { cn } from "@/lib/utils";

const MENU = [
  { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { name: "Products", href: "/admin/products", icon: Package },
  { name: "Orders", href: "/admin/orders", icon: ShoppingCart },
  { name: "Blog Posts", href: "/admin/blog", icon: FileText },
  { name: "Settings", href: "/admin/settings", icon: Settings },
];

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const [location, setLocation] = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const { data, isLoading, isError } = useAdminMe({
    request: { headers: { Authorization: `Bearer ${localStorage.getItem('trynex_admin_token')}` } }
  });
  const { mutateAsync: logout } = useAdminLogout();

  useEffect(() => {
    if (!isLoading && (isError || !data?.authenticated)) {
      setLocation("/admin/login");
    }
  }, [isLoading, isError, data, setLocation]);

  const handleLogout = async () => {
    localStorage.removeItem('trynex_admin_token');
    await logout({}).catch(() => {});
    setLocation("/admin/login");
  };

  if (isLoading || isError) return <Loader fullScreen />;

  return (
    <div className="min-h-screen flex" style={{ background: 'hsl(0 0% 5%)' }}>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 flex flex-col transition-transform duration-300 md:relative md:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
        style={{ background: 'hsl(0 0% 6%)', borderRight: '1px solid rgba(255,255,255,0.06)' }}
      >
        {/* Brand */}
        <div className="flex items-center justify-between p-6 border-b border-white/5">
          <Link href="/" className="font-black font-display text-xl tracking-tighter">
            TRY<span className="text-gradient">NEX</span>
            <span className="block text-[10px] font-semibold text-foreground/30 tracking-widest uppercase mt-0.5">Admin Panel</span>
          </Link>
          <button onClick={() => setSidebarOpen(false)} className="md:hidden p-1.5 text-foreground/30 hover:text-foreground">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {MENU.map(item => {
            const Icon = item.icon;
            const active = location === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-sm transition-all duration-200",
                  active
                    ? "text-white"
                    : "text-foreground/40 hover:text-foreground hover:bg-white/5"
                )}
                style={active ? { background: 'hsl(var(--primary))', boxShadow: '0 4px 20px rgba(255,107,43,0.3)' } : {}}
              >
                <Icon className="w-4 h-4" />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-white/5">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-sm text-foreground/40 hover:text-destructive hover:bg-destructive/10 transition-all w-full"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="h-16 flex items-center gap-4 px-6 border-b border-white/5" style={{ background: 'hsl(0 0% 6%)' }}>
          <button
            onClick={() => setSidebarOpen(true)}
            className="md:hidden p-2 text-foreground/40 hover:text-foreground"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex-1" />
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center text-xs font-black text-white" style={{ background: 'hsl(var(--primary))' }}>
              A
            </div>
            <span className="text-sm font-semibold text-foreground/60 hidden sm:block">Admin</span>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
