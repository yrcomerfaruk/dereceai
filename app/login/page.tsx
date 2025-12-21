'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [isSignUp, setIsSignUp] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    const validatePassword = (pwd: string) => {
        if (pwd.length < 6) return "Şifre en az 6 karakter olmalıdır.";
        if (!/[A-Z]/.test(pwd)) return "Şifre en az bir büyük harf içermelidir.";
        if (!/[^A-Za-z0-9]/.test(pwd)) return "Şifre en az bir özel karakter (sembol) içermelidir.";
        return null;
    };

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            if (isSignUp) {
                // Validate Password
                const pwdError = validatePassword(password);
                if (pwdError) {
                    throw new Error(pwdError);
                }
                if (!fullName.trim()) {
                    throw new Error("Lütfen adınızı ve soyadınızı giriniz.");
                }

                const { error } = await supabase.auth.signUp({
                    email,
                    password,
                    options: {
                        data: {
                            full_name: fullName,
                        },
                    },
                });
                if (error) throw error;
                // Auto sign in logic handles rest
            } else {
                const { error } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                });
                if (error) throw error;
                router.push('/home');
            }

            if (isSignUp) {
                // ... success logic remains
                const { data: { user } } = await supabase.auth.getUser();
                if (user) {
                    alert("Kayıt başarılı! Lütfen e-posta adresinize gelen onay linkine tıklayın.");
                } else {
                    alert("Kayıt işlemi alındı. Lütfen e-postanızı kontrol edin.");
                }
            }
        } catch (err: any) {
            // Console log for debugging (keeping it minimal for known errors)
            if (!err.message.includes('Invalid login credentials')) {
                console.error(err);
            }

            // Error Message Translation
            if (err.message.includes('rate limit') || err.status === 429) {
                setError("Çok fazla deneme yaptınız. Lütfen biraz bekleyin.");
            } else if (err.message.includes('already registered')) {
                setError("Bu e-posta adresi zaten kullanılıyor.");
            } else if (err.message.includes('Email not confirmed')) {
                setError("E-posta adresiniz doğrulanmamış. Lütfen e-postanızı kontrol edin.");
            } else if (err.message.includes('Invalid login credentials')) {
                setError("E-posta adresi veya şifre hatalı.");
            } else if (err.message.includes('Password should be')) {
                setError("Şifre politikasına uymuyor.");
            } else {
                // Fallback for unknown errors - try to be helpful or just show general error
                setError("Bir hata oluştu: " + (err.message === 'Failed to fetch' ? 'İnternet bağlantınızı kontrol edin.' : err.message));
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-white px-4">
            <div className="w-[300px]"> {/* Fixed narrow width */}
                <div className="text-center mb-4">
                    <h1 className="text-2xl font-black tracking-tighter text-black mb-0.5">
                        DERECE <span className="text-gray-300">AI</span>
                    </h1>
                    <p className="text-[10px] text-gray-400 font-medium">Yeni Nesil YKS Koçun</p>
                    <h2 className="text-sm font-bold text-gray-900 mt-3">{isSignUp ? 'Kayıt Ol' : 'Giriş Yap'}</h2>
                </div>

                <form onSubmit={handleAuth} className="space-y-2">
                    {isSignUp && (
                        <div>
                            <input
                                type="text"
                                placeholder="Ad Soyad"
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs font-medium text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-all"
                                required
                            />
                        </div>
                    )}
                    <div>
                        <input
                            type="email"
                            placeholder="E-posta"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs font-medium text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-all"
                            required
                        />
                    </div>
                    <div>
                        <input
                            type="password"
                            placeholder="Şifre"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs font-medium text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-all"
                            required
                        />
                        {isSignUp && (
                            <div className="mt-1.5 space-y-0.5 pl-1">
                                <div className={`flex items-center text-[10px] transition-colors ${password.length >= 6 ? 'text-green-600 font-semibold' : 'text-gray-400'}`}>
                                    <span className="mr-1">{password.length >= 6 ? '✓' : '•'}</span> min. 6 karakter
                                </div>
                                <div className={`flex items-center text-[10px] transition-colors ${/[A-Z]/.test(password) ? 'text-green-600 font-semibold' : 'text-gray-400'}`}>
                                    <span className="mr-1">{/[A-Z]/.test(password) ? '✓' : '•'}</span> 1 büyük harf
                                </div>
                                <div className={`flex items-center text-[10px] transition-colors ${/[^A-Za-z0-9]/.test(password) ? 'text-green-600 font-semibold' : 'text-gray-400'}`}>
                                    <span className="mr-1">{/[^A-Za-z0-9]/.test(password) ? '✓' : '•'}</span> 1 sembol
                                </div>
                            </div>
                        )}
                    </div>

                    {error && (
                        <div className="p-2 bg-red-50 text-red-600 text-[10px] font-medium rounded-lg leading-tight">
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-2.5 bg-black text-white rounded-lg font-bold text-xs hover:bg-gray-800 transition-all disabled:opacity-50"
                    >
                        {loading ? '...' : (isSignUp ? 'Kayıt Ol' : 'Giriş Yap')}
                    </button>

                    <div className="text-center mt-2">
                        <button
                            type="button"
                            onClick={() => setIsSignUp(!isSignUp)}
                            className="text-[10px] font-semibold text-gray-400 hover:text-black transition-colors"
                        >
                            {isSignUp ? 'Hesabın var mı? Giriş Yap' : 'Hesap Oluştur'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
