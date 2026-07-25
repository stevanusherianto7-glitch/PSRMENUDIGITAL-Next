/** 
 * ⚠️ DILARANG KERAS UNTUK MENGUBAH ATAU MEMODIFIKASI FILE INI TANPA IZIN SENIOR ARCHITECT.
 * FILE INI BERISI HALAMAN LOGIN DAN ROUTING AUTENTIKASI ROLE (ADMIN/WAITER/KITCHEN).
 * KESALAHAN MODIFIKASI DAPAT MENYEBABKAN USER TIDAK BISA MASUK ATAU REDIRECT SALAH. ⚠️
 */
import { useState } from "react";
import { useNavigate } from "react-router-dom"; // Menggunakan react-router-dom agar tidak error context
import { ChefHat, Eye, EyeOff, Lock, ArrowRight, UtensilsCrossed, ShoppingBag, Scan } from "lucide-react";

// Menggunakan string path untuk logo agar tidak error di Vite
import { CREDENTIALS, BRAND_NAME, APP_LOGO as logoImg } from "../data";
import { supabase } from "../../lib/supabase";
import { isBackendConfigured, getApiBase } from "../../lib/api";
import type { UserRole, UserSession } from "../types";

export default function LoginPage() {
  const navigate = useNavigate();
  const [role, setRole] = useState<UserRole>("admin");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const roles: { id: UserRole; label: string; desc: string; icon: typeof ChefHat }[] = [
    { id: "admin",   label: "Admin",  desc: "Dashboard, laporan, menu, QR meja",   icon: ChefHat },
    { id: "waiter",  label: "Waiter", desc: "Terima & antar pesanan ke meja",      icon: UtensilsCrossed },
    { id: "kitchen", label: "Dapur",  desc: "Proses & masak pesanan masuk",        icon: ShoppingBag },
  ];

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    await new Promise(r => setTimeout(r, 600));

    const cred = CREDENTIALS[role];
    if (password !== cred.password) {
      setError("Password salah. Coba lagi.");
      setLoading(false);
      return;
    }

    const session: UserSession = { role, name: cred.name };
    localStorage.setItem("pawon_session", JSON.stringify(session));

    // Fix redirect logic agar role kitchen dan manager/owner terarah dengan benar
    if (role === "admin" || role === "manager" || role === "owner") navigate("/admin");
    else if (role === "kitchen") navigate("/kitchen");
    else navigate("/waiter");
    
    setLoading(false);
  }

  // Redirect ke Google OAuth (Socialite) di backend Laravel.
  // Backend akan callback lalu redirect balik ke /admin?token=...
  function handleGoogleLogin() {
    const base = getApiBase();
    const redirect = encodeURIComponent(window.location.origin + '/admin');
    window.location.href = `${base}/api/v1/auth/google?redirect=${redirect}`;
  }

  return (
    <div className="min-h-screen flex batik-pattern">
      {/* Left — Branding (heritage hero) */}
      <div className="hidden lg:flex flex-col justify-between w-[460px] bg-sidebar text-sidebar-foreground p-12 relative overflow-hidden">
        {/* Ornament */}
        <div className="absolute inset-0 batik-pattern-dark opacity-60 pointer-events-none" />
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold to-transparent" />

        <div className="relative flex items-center gap-3">
          <img src={logoImg} alt={BRAND_NAME} className="w-11 h-11 rounded-xl object-cover ring-1 ring-gold/40" />
          <div>
            <p className="font-display text-lg leading-none text-sidebar-foreground">{BRAND_NAME}</p>
            <p className="eyebrow mt-1">Restaurant System</p>
          </div>
        </div>

        <div className="relative space-y-10">
          <div>
            <p className="eyebrow mb-4">Sejak 2025 · Semarang</p>
            <h1 className="font-display text-5xl leading-[1.05] text-sidebar-foreground">
              Cita rasa Jawa,
              <br />
              <span className="text-gold italic">disajikan modern.</span>
            </h1>
            <div className="gold-rule-short mt-6" />
            <p className="text-sidebar-foreground/70 text-sm mt-5 leading-relaxed max-w-sm">
              Platform manajemen restoran terintegrasi — dari pemesanan tamu melalui QR, dapur, hingga laporan penjualan.
            </p>
          </div>

          <div className="space-y-5">
            {[
              { icon: Scan, label: "QR Self-Order", desc: "Tamu pesan langsung dari meja" },
              { icon: ChefHat, label: "Dapur Realtime", desc: "Antrian pesanan otomatis masuk" },
              { icon: UtensilsCrossed, label: "Monitor Pesanan", desc: "Pantau semua transaksi live" },
            ].map(f => (
              <div key={f.label} className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full border border-gold/40 bg-gold/5 flex items-center justify-center flex-shrink-0">
                  <f.icon size={16} className="text-gold" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-sidebar-foreground">{f.label}</p>
                  <p className="text-xs text-sidebar-foreground/60 mt-0.5">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <p className="relative text-[11px] tracking-widest uppercase text-sidebar-foreground/40">© 2025 {BRAND_NAME}</p>
      </div>

      {/* Right — Login Form */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="flex lg:hidden items-center justify-center gap-3 mb-10">
            <img src={logoImg} alt={BRAND_NAME} className="w-12 h-12 rounded-xl object-cover ring-1 ring-gold/40" />
            <div>
              <p className="font-display text-xl leading-none">{BRAND_NAME}</p>
              <p className="eyebrow mt-1">Restaurant System</p>
            </div>
          </div>

          <div className="mb-8 text-center lg:text-left">
            <p className="eyebrow mb-3">Masuk</p>
            <h2 className="font-display text-4xl leading-tight text-foreground">Selamat datang kembali</h2>
            <div className="gold-rule-short mt-4 lg:mx-0 mx-auto" />
            <p className="text-muted-foreground text-sm mt-4">Pilih peran lalu masukkan password.</p>
          </div>

          {/* Role selection */}
          <div className="grid grid-cols-3 gap-3 mb-5">
            {roles.map(r => {
              const Icon = r.icon;
              const active = role === r.id;
              return (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => { setRole(r.id); setError(""); setPassword(""); }}
                  className={`flex flex-col items-center gap-2 p-4 rounded-xl border text-center transition-all duration-300 hover:scale-[1.03] hover:shadow-md ${
                    active
                      ? "bg-primary/8 border-primary text-primary shadow-[0_4px_16px_-8px_rgba(181,70,42,0.4)]"
                      : "card-premium hover:border-primary/30 text-muted-foreground"
                  }`}
                >
                  <Icon size={22} className={active ? "text-primary" : "text-muted-foreground"} />
                  <p className="text-[11px] font-semibold tracking-wide uppercase">{r.label}</p>
                </button>
              );
            })}
          </div>

          <div className="mb-6 px-4 py-3 rounded-lg bg-secondary/60 border border-border text-xs text-muted-foreground italic">
            {roles.find(r => r.id === role)?.desc}
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block mb-2">Password</label>
              <div className="relative">
                <Lock size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                <input
                  type={showPass ? "text" : "password"}
                  value={password}
                  onChange={e => { setPassword(e.target.value); setError(""); }}
                  placeholder={`Password ${roles.find(r => r.id === role)?.label}`}
                  className="w-full bg-input-background border border-border rounded-lg pl-10 pr-11 py-3.5 text-[15px] focus:outline-none focus:border-primary/60 focus:ring-2 focus:ring-primary/15 transition-all"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setShowPass(v => !v)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPass ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-destructive/8 border border-destructive/25 rounded-lg px-4 py-3 text-xs text-destructive">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={!password || loading}
              className="btn-heritage w-full py-3.5 rounded-lg font-semibold text-sm disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 tracking-wide"
            >
              {loading ? (
                <span className="w-4 h-4 border-2 border-foreground/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>Masuk <ArrowRight size={15} /></>
              )}
            </button>
          </form>

          {isBackendConfigured() && (
            <button
              type="button"
              onClick={handleGoogleLogin}
              className="w-full mt-4 py-3.5 rounded-lg font-semibold text-sm border border-border bg-white/5 hover:bg-white/10 transition-all flex items-center justify-center gap-2"
            >
              <svg width="16" height="16" viewBox="0 0 48 48" aria-hidden>
                <path fill="#EA4335" d="M24 9.5c3.54 0 6.7 1.22 9.2 3.62l6.86-6.86C35.9 2.43 30.4 0 24 0 14.6 0 6.46 5.4 2.62 13.2l7.98 6.2C12.36 13.66 17.74 9.5 24 9.5z"/>
                <path fill="#4285F4" d="M46.1 24.5c0-1.57-.14-3.08-.4-4.54H24v9.02h12.4c-.54 2.9-2.18 5.36-4.66 7.02l7.2 5.6C43.7 37.3 46.1 31.3 46.1 24.5z"/>
                <path fill="#FBBC05" d="M10.6 28.42c-.48-1.44-.76-2.97-.76-4.56s.28-3.12.76-4.56l-7.98-6.2C.9 16.4 0 20.1 0 24s.9 7.6 2.62 10.9l7.98-6.48z"/>
                <path fill="#34A853" d="M24 48c6.4 0 11.9-2.13 15.86-5.78l-7.2-5.6c-2 1.34-4.58 2.14-8.66 2.14-6.26 0-11.64-4.16-13.4-9.78l-7.98 6.48C6.46 42.6 14.6 48 24 48z"/>
              </svg>
              Masuk dengan Google
            </button>
          )}

          <div className="mt-10 pt-6 border-t border-border text-center">
            <p className="eyebrow mb-3">Untuk Tamu</p>
            <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
              <Scan size={12} className="text-gold" />
              <span>Scan QR di meja untuk memesan langsung</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
