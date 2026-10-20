import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { resetPassword } from '../features/auth';
import { isSupabaseConfigured } from '../lib/supabase';

type UserRole = 'admin' | 'faculty' | 'student';

export function SplashScreen({ onComplete }: { onComplete: () => void }) {
  useEffect(() => {
    const timer = setTimeout(onComplete, 2200);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className="splash-screen">
      <div className="animate-slide-up">
        <div className="w-24 h-24 rounded-full bg-white/10 flex items-center justify-center mb-6 mx-auto backdrop-blur-sm border border-white/20 shadow-xl shadow-teal-900/30">
          <div className="text-center">
            <i className="fas fa-staff-snake text-3xl text-teal-400" />
            <div className="flex gap-0.5 mt-1 justify-center">
              <div className="w-5 h-1 rounded bg-green-500" />
              <div className="w-5 h-1 rounded bg-white" />
              <div className="w-5 h-1 rounded bg-red-500" />
            </div>
          </div>
        </div>
        
        <h1 className="text-white text-2xl font-bold text-center mb-1 tracking-tight">Sultanat e Italia</h1>
        <h2 className="text-teal-400 text-lg font-semibold text-center mb-2">Medica LMS</h2>
        <p className="text-gray-400 text-xs text-center max-w-[260px] mx-auto leading-relaxed">
          Your Gateway to Medical Excellence in India & Italy
        </p>
      </div>
      
      <div className="absolute bottom-16 flex flex-col items-center">
        <div className="w-8 h-8 border-2 border-teal-400 border-t-transparent rounded-full animate-spin mb-3" />
        <p className="text-teal-400/80 text-[11px] font-medium tracking-wide">CONNECTING TO CAMPUS...</p>
      </div>
    </div>
  );
}

export function LoginScreen() {
  const { signIn, login } = useAuth();
  const { users } = useData();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotStatus, setForgotStatus] = useState<{ message: string; isError: boolean } | null>(null);
  const [error, setError] = useState('');

  const handleLogin = async () => {
    setError('');
    if (!email.trim() || !password) {
      setError('Please enter your email and password.');
      return;
    }

    setIsLoading(true);

    try {
      // 1. Attempt Supabase Auth login if client is configured
      if (isSupabaseConfigured()) {
        const result = await signIn({ email, password });
        if (result.success) {
          setIsLoading(false);
          return;
        }

        // If Supabase returned an error, check if local prototype fallback has this user
        const localUser = users.find(u => u.email.toLowerCase() === email.trim().toLowerCase() && u.password === password);
        if (localUser) {
          if (localUser.status === 'suspended') {
            setError('Your account has been suspended. Please contact the administrator.');
            setIsLoading(false);
            return;
          }
          login(localUser);
          setIsLoading(false);
          return;
        }

        setError(result.error || 'Invalid credentials or user not found.');
        setIsLoading(false);
        return;
      }

      // 2. Offline / Prototype fallback
      const localUser = users.find(u => u.email.toLowerCase() === email.trim().toLowerCase() && u.password === password);
      if (localUser) {
        if (localUser.status === 'suspended') {
          setError('Your account has been suspended. Contact administrator.');
          setIsLoading(false);
          return;
        }
        login(localUser);
      } else {
        setError('Invalid email or password.');
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected login error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!forgotEmail.trim()) {
      setForgotStatus({ message: 'Please enter your registered email address.', isError: true });
      return;
    }

    setForgotStatus({ message: 'Sending recovery link...', isError: false });
    const result = await resetPassword(forgotEmail.trim());

    if (result.success) {
      setForgotStatus({ message: 'Password recovery email sent! Please check your inbox.', isError: false });
      setTimeout(() => {
        setShowForgotModal(false);
        setForgotStatus(null);
        setForgotEmail('');
      }, 2500);
    } else {
      setForgotStatus({ message: result.error || 'Failed to send recovery link.', isError: true });
    }
  };

  if (showRegister) {
    return <RegisterScreen onBack={() => setShowRegister(false)} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0f2b46] to-[#1a3a5c] flex flex-col">
      <div className="italy-accent">
        <div className="green" /><div className="white" /><div className="red" />
      </div>
      
      <div className="flex-1 flex flex-col justify-center px-6 py-8">
        <div className="text-center mb-8">
          <div className="w-20 h-20 rounded-full bg-white/10 flex items-center justify-center mx-auto mb-4 backdrop-blur-sm border border-white/20 shadow-lg shadow-teal-900/30">
            <i className="fas fa-staff-snake text-2xl text-teal-400" />
          </div>
          <h1 className="text-white text-xl font-bold tracking-tight">Sultanat e Italia Medica</h1>
          <p className="text-gray-400 text-xs mt-1">Medical Competitive Exam LMS • Portal Access</p>
        </div>

        <div className="space-y-4">
          <div className="relative">
            <i className="fas fa-envelope absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
              placeholder="Email address"
              className="w-full pl-11 pr-4 py-3.5 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 text-sm focus:outline-none focus:border-teal-400 transition"
            />
          </div>
          
          <div className="relative">
            <i className="fas fa-lock absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
              placeholder="Password"
              className="w-full pl-11 pr-4 py-3.5 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 text-sm focus:outline-none focus:border-teal-400 transition"
            />
          </div>

          {error && (
            <div className="bg-red-500/20 border border-red-500/50 rounded-lg px-3 py-2.5 animate-slide-up">
              <p className="text-red-300 text-xs flex items-center gap-1.5">
                <i className="fas fa-exclamation-circle text-red-400" />
                <span>{error}</span>
              </p>
            </div>
          )}

          <div className="flex justify-between items-center text-xs">
            <span className="text-gray-400 text-[11px] flex items-center gap-1">
              <i className="fas fa-shield-alt text-teal-400" /> Supabase Secured
            </span>
            <button
              type="button"
              onClick={() => { setForgotEmail(email); setShowForgotModal(true); }}
              className="text-teal-400 hover:text-teal-300 transition font-medium"
            >
              Forgot Password?
            </button>
          </div>

          <button
            onClick={handleLogin}
            disabled={isLoading}
            className="w-full py-3.5 bg-gradient-to-r from-teal-500 to-teal-600 text-white rounded-xl font-semibold text-sm shadow-lg shadow-teal-500/30 active:scale-[0.98] transition disabled:opacity-70 cursor-pointer"
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Signing in...
              </span>
            ) : (
              'Sign In'
            )}
          </button>
        </div>

        <div className="text-center mt-6">
          <p className="text-gray-400 text-sm">
            Don't have an account?{' '}
            <button onClick={() => setShowRegister(true)} className="text-teal-400 font-semibold hover:underline">
              Register Now
            </button>
          </p>
        </div>
      </div>

      <div className="px-6 pb-6 text-center">
        <p className="text-gray-500 text-xs">© 2026 Sultanat e Italia Medica • All Rights Reserved</p>
      </div>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#12283e] border border-white/20 rounded-2xl p-6 w-full max-w-sm shadow-2xl">
            <div className="w-12 h-12 rounded-full bg-teal-500/20 flex items-center justify-center mx-auto mb-3">
              <i className="fas fa-key text-teal-400 text-xl" />
            </div>
            <h3 className="text-white text-base font-bold text-center mb-1">Reset Password</h3>
            <p className="text-gray-400 text-xs text-center mb-4">
              Enter your email address and we'll send you a password recovery link.
            </p>
            <input
              type="email"
              value={forgotEmail}
              onChange={(e) => setForgotEmail(e.target.value)}
              placeholder="Your registered email"
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 text-sm focus:outline-none focus:border-teal-400 mb-3"
            />
            {forgotStatus && (
              <p className={`text-xs mb-3 text-center ${forgotStatus.isError ? 'text-red-400' : 'text-teal-300'}`}>
                {forgotStatus.message}
              </p>
            )}
            <div className="flex gap-2">
              <button
                onClick={() => { setShowForgotModal(false); setForgotStatus(null); }}
                className="flex-1 py-2.5 bg-white/10 text-gray-300 rounded-xl text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleForgotPassword}
                className="flex-1 py-2.5 bg-teal-500 text-white rounded-xl text-xs font-semibold"
              >
                Send Link
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function RegisterScreen({ onBack }: { onBack: () => void }) {
  const { signUp } = useAuth();
  const { addUser, users } = useData();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    role: 'student' as UserRole,
    targetExam: '',
    department: '',
  });
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);
  const [error, setError] = useState('');

  const handleRegister = async () => {
    setError('');

    if (!formData.name.trim() || !formData.email.trim() || !formData.password) {
      setError('Please fill all required fields.');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    if (!agreedToTerms) {
      setError('Please agree to the Terms of Service to continue.');
      return;
    }

    setIsSubmitting(true);

    try {
      // 1. Try real Supabase Auth registration
      if (isSupabaseConfigured()) {
        const result = await signUp({
          email: formData.email.trim(),
          password: formData.password,
          fullName: formData.name.trim(),
          phone: formData.phone.trim(),
          role: formData.role,
          department: formData.department.trim(),
          targetExam: formData.targetExam,
        });

        if (!result.success) {
          setError(result.error || 'Registration failed in Supabase.');
          setIsSubmitting(false);
          return;
        }

        // Also add to local store for synchronous instant update
        addUser({
          name: formData.name.trim(),
          email: formData.email.trim(),
          phone: formData.phone.trim(),
          password: formData.password,
          role: formData.role,
          avatar: formData.role === 'admin' ? '👨‍💼' : formData.role === 'faculty' ? '👨‍⚕️' : '👩‍🎓',
          status: 'active',
          department: formData.department.trim(),
          targetExam: formData.targetExam,
        });

        setSuccessNotice('Account registered successfully! Welcome to Sultanat e Italia Medica.');
        setTimeout(() => {
          onBack();
        }, 1500);
        return;
      }

      // 2. Offline / Prototype fallback
      if (users.find(u => u.email.toLowerCase() === formData.email.trim().toLowerCase())) {
        setError('Email is already registered.');
        setIsSubmitting(false);
        return;
      }

      addUser({
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        password: formData.password,
        role: formData.role,
        avatar: formData.role === 'admin' ? '👨‍💼' : formData.role === 'faculty' ? '👨‍⚕️' : '👩‍🎓',
        status: 'active',
        department: formData.department.trim(),
        targetExam: formData.targetExam,
      });

      setSuccessNotice('Account created successfully!');
      setTimeout(() => {
        onBack();
      }, 1200);
    } catch (err: any) {
      setError(err.message || 'An unexpected registration error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateField = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0f2b46] to-[#1a3a5c] flex flex-col">
      <div className="italy-accent">
        <div className="green" /><div className="white" /><div className="red" />
      </div>
      
      <div className="px-4 py-4 flex items-center gap-3">
        <button onClick={onBack} className="text-white text-lg p-2 rounded-lg hover:bg-white/10 transition">
          <i className="fas fa-arrow-left" />
        </button>
        <h1 className="text-white text-lg font-bold">Create Account</h1>
      </div>

      <div className="flex-1 px-6 py-4">
        {/* Step Progress Bar */}
        <div className="flex gap-2 mb-6">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`flex-1 h-1.5 rounded-full transition-all duration-300 ${
                s <= step ? 'bg-teal-400' : 'bg-white/20'
              }`}
            />
          ))}
        </div>

        {successNotice ? (
          <div className="text-center py-12 animate-slide-up">
            <div className="w-16 h-16 rounded-full bg-teal-500/20 text-teal-400 flex items-center justify-center mx-auto mb-4 border border-teal-500/40">
              <i className="fas fa-check text-2xl" />
            </div>
            <h3 className="text-white text-lg font-bold mb-2">Registration Complete</h3>
            <p className="text-teal-300 text-xs">{successNotice}</p>
          </div>
        ) : (
          <>
            {step === 1 && (
              <div className="space-y-4 animate-slide-up">
                <div>
                  <h2 className="text-white text-lg font-semibold">Select Your Role</h2>
                  <p className="text-gray-400 text-xs mt-0.5">Choose how you will participate in the medical academy.</p>
                </div>

                <div className="space-y-3 pt-2">
                  {[
                    { id: 'student' as UserRole, label: 'Medical Aspirant (Student)', desc: 'NEET, IMAT, UCAT exam prep, DPPs, mocks & lecture notes', icon: 'fa-graduation-cap' },
                    { id: 'faculty' as UserRole, label: 'Faculty & Medical Doctor', desc: 'Create curriculum, author medical questions & upload resources', icon: 'fa-user-md' },
                    { id: 'admin' as UserRole, label: 'Academy Administrator', desc: 'Manage batches, system governance & institutional analytics', icon: 'fa-user-shield' },
                  ].map((r) => (
                    <button
                      key={r.id}
                      onClick={() => updateField('role', r.id)}
                      className={`w-full p-4 rounded-xl flex items-center gap-4 text-left transition ${
                        formData.role === r.id
                          ? 'bg-teal-500/20 border-2 border-teal-400 shadow-lg shadow-teal-500/10'
                          : 'bg-white/5 border-2 border-transparent hover:bg-white/10'
                      }`}
                    >
                      <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-lg ${
                        formData.role === r.id ? 'bg-teal-400 text-[#0f2b46]' : 'bg-white/10 text-teal-400'
                      }`}>
                        <i className={`fas ${r.icon}`} />
                      </div>
                      <div className="flex-1">
                        <p className="text-white font-semibold text-sm">{r.label}</p>
                        <p className="text-gray-400 text-xs mt-0.5">{r.desc}</p>
                      </div>
                    </button>
                  ))}
                </div>

                <button onClick={() => setStep(2)} className="btn-primary mt-6 w-full">
                  Continue <i className="fas fa-arrow-right ml-1" />
                </button>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4 animate-slide-up">
                <div>
                  <h2 className="text-white text-lg font-semibold">Personal Information</h2>
                  <p className="text-gray-400 text-xs mt-0.5">Please provide your official contact details.</p>
                </div>

                <input 
                  value={formData.name}
                  onChange={(e) => updateField('name', e.target.value)}
                  placeholder="Full Name *" 
                  className="w-full px-4 py-3.5 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 text-sm focus:outline-none focus:border-teal-400" 
                />
                <input 
                  value={formData.email}
                  onChange={(e) => updateField('email', e.target.value)}
                  placeholder="Email Address *" 
                  type="email" 
                  className="w-full px-4 py-3.5 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 text-sm focus:outline-none focus:border-teal-400" 
                />
                <input 
                  value={formData.phone}
                  onChange={(e) => updateField('phone', e.target.value)}
                  placeholder="Phone Number (e.g. +91 / +39)" 
                  type="tel" 
                  className="w-full px-4 py-3.5 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 text-sm focus:outline-none focus:border-teal-400" 
                />

                {formData.role === 'student' && (
                  <div>
                    <label className="text-gray-300 text-xs font-medium block mb-1">Target Competitive Exam</label>
                    <select 
                      value={formData.targetExam}
                      onChange={(e) => updateField('targetExam', e.target.value)}
                      className="w-full px-4 py-3.5 bg-[#173351] border border-white/20 rounded-xl text-white text-sm focus:outline-none focus:border-teal-400"
                    >
                      <option value="">Select Target Exam</option>
                      <option value="NEET">NEET-UG (National Eligibility cum Entrance Test)</option>
                      <option value="IMAT">IMAT (International Medical Admissions Test - Italy)</option>
                      <option value="UCAT">UCAT (University Clinical Aptitude Test)</option>
                      <option value="MCAT">MCAT (Medical College Admission Test)</option>
                    </select>
                  </div>
                )}

                {formData.role === 'faculty' && (
                  <input 
                    value={formData.department}
                    onChange={(e) => updateField('department', e.target.value)}
                    placeholder="Department (e.g. Anatomy, Physiology, Chemistry)" 
                    className="w-full px-4 py-3.5 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 text-sm focus:outline-none focus:border-teal-400" 
                  />
                )}

                <div className="flex gap-3 pt-2">
                  <button onClick={() => setStep(1)} className="btn-secondary flex-1">
                    Back
                  </button>
                  <button
                    onClick={() => {
                      if (!formData.name.trim() || !formData.email.trim()) {
                        setError('Please fill in your name and email.');
                        return;
                      }
                      setError('');
                      setStep(3);
                    }}
                    className="btn-primary flex-1"
                  >
                    Continue
                  </button>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-4 animate-slide-up">
                <div>
                  <h2 className="text-white text-lg font-semibold">Security & Password</h2>
                  <p className="text-gray-400 text-xs mt-0.5">Create a strong password for your medical portal account.</p>
                </div>

                <input 
                  value={formData.password}
                  onChange={(e) => updateField('password', e.target.value)}
                  placeholder="Create Password (min. 6 characters) *" 
                  type="password" 
                  className="w-full px-4 py-3.5 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 text-sm focus:outline-none focus:border-teal-400" 
                />
                <input 
                  value={formData.confirmPassword}
                  onChange={(e) => updateField('confirmPassword', e.target.value)}
                  placeholder="Confirm Password *" 
                  type="password" 
                  className="w-full px-4 py-3.5 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 text-sm focus:outline-none focus:border-teal-400" 
                />
                
                {error && (
                  <div className="bg-red-500/20 border border-red-500/50 rounded-lg px-3 py-2.5">
                    <p className="text-red-300 text-xs flex items-center gap-1.5">
                      <i className="fas fa-exclamation-circle text-red-400" />
                      <span>{error}</span>
                    </p>
                  </div>
                )}

                <label className="flex items-start gap-2.5 mt-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={agreedToTerms}
                    onChange={(e) => setAgreedToTerms(e.target.checked)}
                    className="mt-1 accent-teal-400"
                  />
                  <span className="text-gray-300 text-xs leading-relaxed">
                    I agree to the Sultanat e Italia Medica Honor Code, Privacy Policy, and Academic Terms.
                  </span>
                </label>

                <div className="flex gap-3 pt-3">
                  <button onClick={() => setStep(2)} className="btn-secondary flex-1" disabled={isSubmitting}>
                    Back
                  </button>
                  <button
                    onClick={handleRegister}
                    disabled={isSubmitting}
                    className="btn-primary flex-1 disabled:opacity-70"
                  >
                    {isSubmitting ? (
                      <span className="flex items-center justify-center gap-2">
                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Creating...
                      </span>
                    ) : (
                      'Create Account'
                    )}
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
