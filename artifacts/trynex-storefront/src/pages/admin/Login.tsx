import { useState } from "react";
import { useLocation } from "wouter";
import { useAdminLogin } from "@workspace/api-client-react";
import { Lock, Eye, EyeOff } from "lucide-react";
import { motion } from "framer-motion";

export default function AdminLogin() {
  const [, setLocation] = useLocation();
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const { mutateAsync: login, isPending } = useAdminLogin();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    try {
      const res = await login({ data: { password } });
      if (res.success && res.token) {
        localStorage.setItem('trynex_admin_token', res.token);
        setLocation("/admin");
      } else {
        setErrorMsg("Invalid password. Please try again.");
      }
    } catch {
      setErrorMsg("Invalid password. Please try again.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden" style={{ background: 'hsl(0 0% 4%)' }}>
      {/* Background */}
      <div className="absolute inset-0 grid-pattern opacity-30" />
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-[600px] h-[600px] rounded-full blur-3xl opacity-10" style={{ background: 'radial-gradient(circle, rgba(255,107,43,0.8), transparent)' }} />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="w-full max-w-sm relative z-10"
      >
        <div className="p-8 rounded-3xl" style={{ background: 'hsl(0 0% 7%)', border: '1px solid rgba(255,255,255,0.08)' }}>
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="inline-flex w-16 h-16 rounded-2xl items-center justify-center mb-5" style={{ background: 'rgba(255,107,43,0.1)', border: '1px solid rgba(255,107,43,0.15)' }}>
              <Lock className="w-7 h-7 text-primary" />
            </div>
            <h1 className="text-3xl font-black font-display tracking-tight">
              TRY<span className="text-gradient">NEX</span>
            </h1>
            <p className="text-sm text-foreground/40 mt-1 font-medium">Admin Panel</p>
          </div>

          {errorMsg && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-3.5 rounded-xl text-sm font-semibold text-center mb-5"
              style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#f87171' }}
            >
              {errorMsg}
            </motion.div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-foreground/40 mb-2">Admin Password</label>
              <div className="relative">
                <input
                  required
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Enter admin password"
                  className="w-full px-4 py-3.5 pr-12 rounded-xl text-sm font-medium focus:outline-none focus:ring-1 focus:ring-primary transition-all"
                  style={{ background: 'hsl(0 0% 10%)', border: '1px solid rgba(255,255,255,0.08)', color: 'hsl(var(--foreground))' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-foreground/30 hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isPending || !password}
              className="btn-glow w-full py-4 rounded-xl font-bold text-white text-sm flex items-center justify-center gap-2 mt-2 disabled:opacity-50 disabled:transform-none"
              style={{ background: 'hsl(var(--primary))' }}
            >
              <Lock className="w-4 h-4" />
              {isPending ? "Verifying..." : "Access Admin Panel"}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-foreground/20 mt-6">
          © {new Date().getFullYear()} TryNex Lifestyle · Restricted Area
        </p>
      </motion.div>
    </div>
  );
}
