import React, { useState } from 'react';
import {
  X,
  Mail,
  Lock,
  User,
  Shield,
  AlertCircle,
  CheckCircle2,
  Tv,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const AuthModal: React.FC = () => {
  const {
    isAuthModalOpen,
    closeAuthModal,
    authModalMode,
    setAuthModalMode,
    signInWithGoogle,
    signInWithEmail,
    signUpWithEmail,
  } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!isAuthModalOpen) return null;

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setDisplayName('');
    setErrorMessage(null);
  };

  const handleSwitchMode = (mode: 'signin' | 'signup') => {
    setAuthModalMode(mode);
    setErrorMessage(null);
  };

  const mapFirebaseError = (error: any): string => {
    const code = error?.code || '';
    if (code === 'auth/email-already-in-use') {
      return 'Emel ini telah didaftarkan. Sila log masuk atau gunakan emel lain.';
    }
    if (code === 'auth/wrong-password' || code === 'auth/invalid-credential' || code === 'auth/user-not-found') {
      return 'Emel atau kata laluan tidak tepat. Sila semak semula.';
    }
    if (code === 'auth/weak-password') {
      return 'Kata laluan terlalu lemah. Sila gunakan sekurang-kurangnya 6 aksara.';
    }
    if (code === 'auth/invalid-email') {
      return 'Format emel tidak sah.';
    }
    if (code === 'auth/operation-not-allowed') {
      return 'Penyedia Emel/Kata Laluan belum diaktifkan dalam Firebase Console (Authentication > Sign-in method > Email/Password). Anda boleh log masuk menggunakan Google serta-merta.';
    }
    if (code === 'auth/popup-closed-by-user') {
      return 'Tetingkap log masuk Google telah ditutup sebelum selesai.';
    }
    return error?.message || 'Ralat berlaku semasa log masuk. Sila cuba lagi.';
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!email.trim() || !password.trim()) {
      setErrorMessage('Sila masukkan emel dan kata laluan anda.');
      return;
    }

    if (authModalMode === 'signup') {
      if (password.length < 6) {
        setErrorMessage('Kata laluan mestilah sekurang-kurangnya 6 aksara.');
        return;
      }
      if (password !== confirmPassword) {
        setErrorMessage('Kata laluan dan pengesahan kata laluan tidak sepadan.');
        return;
      }
    }

    setLoading(true);
    try {
      if (authModalMode === 'signin') {
        await signInWithEmail(email, password);
      } else {
        await signUpWithEmail(email, password, displayName);
      }
      resetForm();
    } catch (err: any) {
      setErrorMessage(mapFirebaseError(err));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setErrorMessage(null);
    setLoading(true);
    try {
      await signInWithGoogle();
      resetForm();
    } catch (err: any) {
      setErrorMessage(mapFirebaseError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-[#0b1c30] border border-[#1b2b3f] rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header / Brand */}
        <div className="relative px-6 pt-6 pb-4 bg-gradient-to-b from-[#102034] to-[#0b1c30] border-b border-[#1b2b3f]">
          <button
            onClick={() => {
              resetForm();
              closeAuthModal();
            }}
            className="absolute top-5 right-5 p-1 rounded-lg text-[#8c909f] hover:text-[#d3e4fe] hover:bg-[#1b2b3f] transition-colors cursor-pointer"
            aria-label="Tutup"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-[#4d8eff] flex items-center justify-center shadow-md">
              <Tv className="w-5 h-5 text-[#00285d]" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-[#d3e4fe] tracking-tight">
                RightsFlow PayTrack
              </h2>
              <p className="text-xs text-[#8c909f]">
                Sistem Pengurusan & Telemetri Pembayaran Hak Siaran
              </p>
            </div>
          </div>

          {/* Account Isolation Notice */}
          <div className="mt-3 py-2 px-3 rounded-lg bg-[#000f21]/80 border border-[#1b2b3f] flex items-start gap-2 text-xs text-[#adc6ff]">
            <Shield className="w-4 h-4 shrink-0 mt-0.5 text-emerald-400" />
            <span>
              <strong>Akaun Peribadi Selamat:</strong> Data kontrak dan jadual pembayaran anda disimpan secara terasing di Firebase Cloud dan hanya boleh diakses melalui akaun anda.
            </span>
          </div>
        </div>

        {/* Tab Controls: Sign In vs Sign Up */}
        <div className="flex border-b border-[#1b2b3f] bg-[#000f21]">
          <button
            type="button"
            onClick={() => handleSwitchMode('signin')}
            className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider text-center transition-all cursor-pointer ${
              authModalMode === 'signin'
                ? 'text-[#4d8eff] border-b-2 border-[#4d8eff] bg-[#0b1c30]'
                : 'text-[#8c909f] hover:text-[#d3e4fe] hover:bg-[#0b1c30]/50'
            }`}
          >
            Log Masuk (Sign In)
          </button>
          <button
            type="button"
            onClick={() => handleSwitchMode('signup')}
            className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider text-center transition-all cursor-pointer ${
              authModalMode === 'signup'
                ? 'text-[#4d8eff] border-b-2 border-[#4d8eff] bg-[#0b1c30]'
                : 'text-[#8c909f] hover:text-[#d3e4fe] hover:bg-[#0b1c30]/50'
            }`}
          >
            Daftar Akaun (Sign Up)
          </button>
        </div>

        {/* Content & Form */}
        <div className="p-6 flex flex-col gap-4 overflow-y-auto max-h-[75vh]">
          {/* Error Banner */}
          {errorMessage && (
            <div className="p-3 rounded-xl bg-red-950/60 border border-red-500/40 text-red-200 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <div className="flex-1 leading-relaxed">{errorMessage}</div>
            </div>
          )}

          {/* Quick Admin Account Selector Banner */}
          <div className="p-3 rounded-xl bg-indigo-950/25 border border-indigo-500/30 flex flex-col gap-2">
            <div className="flex items-center justify-between text-[11px] font-bold text-indigo-300">
              <span className="flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-indigo-400" />
                2 Akaun Pentadbir Utama (Access All Functions):
              </span>
              <span className="text-[10px] text-[#8c909f]">Klik untuk isi pantas</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => {
                  setEmail('mohdhafizaw89@gmail.com');
                  setPassword('Admin@123456');
                  setConfirmPassword('Admin@123456');
                  setDisplayName('Mohd Hafiz');
                }}
                className="p-2 rounded-lg bg-[#000f21] hover:bg-[#102034] border border-indigo-500/30 text-left flex flex-col transition-colors cursor-pointer group"
              >
                <span className="font-bold text-[#d3e4fe] group-hover:text-indigo-300 text-[11px] flex items-center justify-between">
                  <span>Admin 1: Mohd Hafiz</span>
                  <span className="text-[9px] px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-300">Super Admin</span>
                </span>
                <span className="text-[10px] text-[#adc6ff] font-mono truncate">
                  mohdhafizaw89@gmail.com
                </span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setEmail('admin2@rightsflow.com');
                  setPassword('Admin@123456');
                  setConfirmPassword('Admin@123456');
                  setDisplayName('Operations Admin');
                }}
                className="p-2 rounded-lg bg-[#000f21] hover:bg-[#102034] border border-indigo-500/30 text-left flex flex-col transition-colors cursor-pointer group"
              >
                <span className="font-bold text-[#d3e4fe] group-hover:text-indigo-300 text-[11px] flex items-center justify-between">
                  <span>Admin 2: Ops Admin</span>
                  <span className="text-[9px] px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-300">Co-Admin</span>
                </span>
                <span className="text-[10px] text-[#adc6ff] font-mono truncate">
                  admin2@rightsflow.com
                </span>
              </button>
            </div>
          </div>

          {/* Social Google Provider Button */}
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 py-2.5 px-4 rounded-xl bg-white hover:bg-slate-100 text-slate-800 font-semibold text-sm transition-all shadow-md cursor-pointer disabled:opacity-50 active:scale-[0.98]"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
              />
              <path
                fill="#34A853"
                d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.34 24 12 24z"
              />
              <path
                fill="#FBBC05"
                d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.98 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
              />
              <path
                fill="#EA4335"
                d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
              />
            </svg>
            <span>
              {authModalMode === 'signin' ? 'Log masuk dengan Google' : 'Daftar dengan Google'}
            </span>
          </button>

          {/* Divider */}
          <div className="flex items-center gap-3 my-1">
            <div className="flex-1 h-px bg-[#1b2b3f]" />
            <span className="text-[11px] uppercase tracking-wider text-[#8c909f] font-semibold">
              atau emel & kata laluan
            </span>
            <div className="flex-1 h-px bg-[#1b2b3f]" />
          </div>

          {/* Email / Password Form */}
          <form onSubmit={handleEmailSubmit} className="flex flex-col gap-3.5">
            {authModalMode === 'signup' && (
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-[#c2c6d6]">
                  Nama Penuh / Pasukan Penyiaran
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-2.5 w-4 h-4 text-[#8c909f]" />
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Contoh: Media Prima / Astro Rights Desk"
                    className="w-full pl-9 pr-3 py-2 bg-[#000f21] border border-[#1b2b3f] rounded-xl text-xs text-[#d3e4fe] placeholder:text-[#424754] focus:outline-none focus:border-[#4d8eff] transition-colors"
                  />
                </div>
              </div>
            )}

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-[#c2c6d6]">
                Alamat Emel <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 w-4 h-4 text-[#8c909f]" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="anda@syarikat.com"
                  className="w-full pl-9 pr-3 py-2 bg-[#000f21] border border-[#1b2b3f] rounded-xl text-xs text-[#d3e4fe] placeholder:text-[#424754] focus:outline-none focus:border-[#4d8eff] transition-colors"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-[#c2c6d6]">
                Kata Laluan <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 w-4 h-4 text-[#8c909f]" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Sekurang-kurangnya 6 aksara"
                  className="w-full pl-9 pr-3 py-2 bg-[#000f21] border border-[#1b2b3f] rounded-xl text-xs text-[#d3e4fe] placeholder:text-[#424754] focus:outline-none focus:border-[#4d8eff] transition-colors"
                />
              </div>
            </div>

            {authModalMode === 'signup' && (
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-[#c2c6d6]">
                  Sahkan Kata Laluan <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 w-4 h-4 text-[#8c909f]" />
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Ulang kata laluan di atas"
                    className="w-full pl-9 pr-3 py-2 bg-[#000f21] border border-[#1b2b3f] rounded-xl text-xs text-[#d3e4fe] placeholder:text-[#424754] focus:outline-none focus:border-[#4d8eff] transition-colors"
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="mt-2 w-full py-2.5 px-4 rounded-xl bg-[#4d8eff] hover:bg-[#387bf6] text-[#00285d] font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer disabled:opacity-50 active:scale-[0.98]"
            >
              {loading ? (
                <span className="inline-block w-4 h-4 border-2 border-[#00285d] border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>
                    {authModalMode === 'signin' ? 'Log Masuk Sekarang' : 'Cipta Akaun Baharu'}
                  </span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </form>

          {/* Bottom Switch Link */}
          <div className="pt-2 text-center text-xs text-[#8c909f]">
            {authModalMode === 'signin' ? (
              <p>
                Belum mempunyai akaun?{' '}
                <button
                  type="button"
                  onClick={() => handleSwitchMode('signup')}
                  className="text-[#4d8eff] hover:underline font-semibold cursor-pointer"
                >
                  Daftar akaun baharu di sini
                </button>
              </p>
            ) : (
              <p>
                Sudah mempunyai akaun?{' '}
                <button
                  type="button"
                  onClick={() => handleSwitchMode('signin')}
                  className="text-[#4d8eff] hover:underline font-semibold cursor-pointer"
                >
                  Log masuk ke akaun sedia ada
                </button>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
