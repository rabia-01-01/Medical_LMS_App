import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';

type UserRole = 'admin' | 'faculty' | 'student';

export function SplashScreen({ onComplete }: { onComplete: () => void }) {
  useEffect(() => {
    const timer = setTimeout(onComplete, 2500);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className="splash-screen">
      <div className="animate-slide-up">
        <div className="w-24 h-24 rounded-full bg-white/10 flex items-center justify-center mb-6 mx-auto backdrop-blur-sm border border-white/20">
          <div className="text-center">
            <i className="fas fa-staff-snake text-3xl text-teal-400" />
            <div className="flex gap-0.5 mt-1">
              <div className="w-5 h-1 rounded bg-green-500" />
              <div className="w-5 h-1 rounded bg-white" />
              <div className="w-5 h-1 rounded bg-red-500" />
            </div>
          </div>
        </div>
        
        <h1 className="text-white text-2xl font-bold text-center mb-1">Sultanat e Italia</h1>
        <h2 className="text-teal-400 text-lg font-semibold text-center mb-2">Medica</h2>
        <p className="text-gray-400 text-xs text-center max-w-[250px]">Your Gateway to Medical Education in India and Italy</p>
      </div>
      
      <div className="absolute bottom-16 flex flex-col items-center">
        <div className="w-8 h-8 border-2 border-teal-400 border-t-transparent rounded-full animate-spin mb-3" />
        <p className="text-gray-500 text-xs">Loading...</p>
      </div>
    </div>
  );
}

export function LoginScreen() {
  const { login } = useAuth();
  const { users } = useData();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = () => {
    setError('');
    if (!email || !password) {
      setError('Please enter email and password');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      const user = users.find(u => u.email === email && u.password === password);
      if (user) {
        if (user.status === 'suspended') {
          setError('Your account has been suspended. Contact admin.');
          setIsLoading(false);
          return;
        }
        login(user);
      } else {
        setError('Invalid email or password');
      }
      setIsLoading(false);
    }, 800);
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
          <div className="w-20 h-20 rounded-full bg-white/10 flex items-center justify-center mx-auto mb-4 backdrop-blur-sm border border-white/20">
            <i className="fas fa-staff-snake text-2xl text-teal-400" />
          </div>
          <h1 className="text-white text-xl font-bold">Sultanat e Italia Medica</h1>
          <p className="text-gray-400 text-xs mt-1">Your Gateway to Medical Education</p>
        </div>

        <div className="space-y-4">
          <div className="relative">
            <i className="fas fa-envelope absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
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
              placeholder="Password"
              className="w-full pl-11 pr-4 py-3.5 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 text-sm focus:outline-none focus:border-teal-400 transition"
            />
          </div>

          {error && (
            <div className="bg-red-500/20 border border-red-500/50 rounded-lg px-3 py-2">
              <p className="text-red-300 text-xs"><i className="fas fa-exclamation-circle mr-1" />{error}</p>
            </div>
          )}

          <div className="flex justify-end">
            <button className="text-teal-400 text-xs">Forgot Password?</button>
          </div>

          <button
            onClick={handleLogin}
            disabled={isLoading}
            className="w-full py-3.5 bg-gradient-to-r from-teal-500 to-teal-600 text-white rounded-xl font-semibold text-sm shadow-lg shadow-teal-500/30 active:scale-[0.98] transition disabled:opacity-70"
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

        {users.length === 0 && (
          <div className="mt-6 p-3 bg-teal-500/10 rounded-xl border border-teal-500/30">
            <p className="text-teal-300 text-xs text-center mb-2">
              <i className="fas fa-info-circle mr-1" />
              No users registered yet. Create your first account below!
            </p>
          </div>
        )}

        <div className="text-center mt-6">
          <p className="text-gray-400 text-sm">
            Don't have an account?{' '}
            <button onClick={() => setShowRegister(true)} className="text-teal-400 font-medium">Register</button>
          </p>
        </div>
      </div>

      <div className="px-6 pb-6 text-center">
        <p className="text-gray-500 text-xs">© 2024 Sultanat e Italia Medica. All rights reserved.</p>
      </div>
    </div>
  );
}

function RegisterScreen({ onBack }: { onBack: () => void }) {
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
  const [error, setError] = useState('');

  const handleRegister = () => {
    setError('');
    
    if (!formData.name || !formData.email || !formData.password) {
      setError('Please fill all required fields');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    if (users.find(u => u.email === formData.email)) {
      setError('Email already registered');
      return;
    }

    // First user is always admin
    const role = users.length === 0 ? 'admin' : formData.role;

    addUser({
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      password: formData.password,
      role: role,
      avatar: role === 'admin' ? '👨‍💼' : role === 'faculty' ? '👨‍⚕️' : '👩‍🎓',
      status: 'active',
      department: formData.department,
      targetExam: formData.targetExam,
    });

    onBack();
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
        <button onClick={onBack} className="text-white text-lg">
          <i className="fas fa-arrow-left" />
        </button>
        <h1 className="text-white text-lg font-bold">Create Account</h1>
      </div>

      <div className="flex-1 px-6 py-6">
        <div className="flex gap-2 mb-6">
          {[1, 2, 3].map((s) => (
            <div key={s} className={`flex-1 h-1.5 rounded-full ${s <= step ? 'bg-teal-400' : 'bg-white/20'}`} />
          ))}
        </div>

        {step === 1 && (
          <div className="space-y-4 animate-slide-up">
            <h2 className="text-white text-lg font-semibold mb-4">Select your role</h2>
            {users.length === 0 && (
              <div className="bg-teal-500/10 border border-teal-500/30 rounded-lg p-3 mb-4">
                <p className="text-teal-300 text-xs">
                  <i className="fas fa-info-circle mr-1" />
                  First user will be registered as Admin
                </p>
              </div>
            )}
            {users.length > 0 && (
              <>
                {[
                  { id: 'student' as UserRole, label: 'Student', desc: 'Access courses, quizzes, and study materials', icon: 'fa-graduation-cap' },
                  { id: 'faculty' as UserRole, label: 'Faculty', desc: 'Upload resources, create quizzes, manage courses', icon: 'fa-chalkboard-teacher' },
                ].map((r) => (
                  <button
                    key={r.id}
                    onClick={() => updateField('role', r.id)}
                    className={`w-full p-4 rounded-xl flex items-center gap-4 transition ${
                      formData.role === r.id ? 'bg-teal-500/20 border-2 border-teal-400' : 'bg-white/5 border-2 border-transparent'
                    }`}
                  >
                    <div className="w-10 h-10 rounded-full bg-teal-500/20 flex items-center justify-center">
                      <i className={`fas ${r.icon} text-teal-400`} />
                    </div>
                    <div className="text-left">
                      <p className="text-white font-medium text-sm">{r.label}</p>
                      <p className="text-gray-400 text-xs">{r.desc}</p>
                    </div>
                  </button>
                ))}
              </>
            )}
            <button onClick={() => setStep(2)} className="btn-primary mt-4">Continue</button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4 animate-slide-up">
            <h2 className="text-white text-lg font-semibold mb-4">Personal Information</h2>
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
              placeholder="Phone Number" 
              type="tel" 
              className="w-full px-4 py-3.5 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 text-sm focus:outline-none focus:border-teal-400" 
            />
            {formData.role === 'student' && (
              <select 
                value={formData.targetExam}
                onChange={(e) => updateField('targetExam', e.target.value)}
                className="w-full px-4 py-3.5 bg-white/10 border border-white/20 rounded-xl text-gray-400 text-sm focus:outline-none focus:border-teal-400"
              >
                <option value="">Select Target Exam</option>
                <option value="NEET">NEET</option>
                <option value="IMAT">IMAT</option>
                <option value="UCAT">UCAT</option>
                <option value="MCAT">MCAT</option>
              </select>
            )}
            {formData.role === 'faculty' && (
              <input 
                value={formData.department}
                onChange={(e) => updateField('department', e.target.value)}
                placeholder="Department" 
                className="w-full px-4 py-3.5 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 text-sm focus:outline-none focus:border-teal-400" 
              />
            )}
            <div className="flex gap-3 mt-4">
              <button onClick={() => setStep(1)} className="btn-secondary flex-1">Back</button>
              <button onClick={() => setStep(3)} className="btn-primary flex-1">Continue</button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4 animate-slide-up">
            <h2 className="text-white text-lg font-semibold mb-4">Set Password</h2>
            <input 
              value={formData.password}
              onChange={(e) => updateField('password', e.target.value)}
              placeholder="Create Password *" 
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
              <div className="bg-red-500/20 border border-red-500/50 rounded-lg px-3 py-2">
                <p className="text-red-300 text-xs"><i className="fas fa-exclamation-circle mr-1" />{error}</p>
              </div>
            )}

            <div className="flex items-start gap-2 mt-2">
              <input type="checkbox" className="mt-1" />
              <p className="text-gray-400 text-xs">I agree to the Terms of Service and Privacy Policy</p>
            </div>
            <div className="flex gap-3 mt-4">
              <button onClick={() => setStep(2)} className="btn-secondary flex-1">Back</button>
              <button onClick={handleRegister} className="btn-primary flex-1">Create Account</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
