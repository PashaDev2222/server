import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const { register, loading } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: '', email: '', password: '', confirm: '' });
  const [errors, setErrors] = useState({});
  const [showPass, setShowPass] = useState(false);

  const validate = () => {
    const e = {};
    if (!form.username) e.username = 'Username is required';
    else if (form.username.length < 3) e.username = 'At least 3 characters';
    else if (!/^[a-zA-Z0-9_]+$/.test(form.username)) e.username = 'Letters, numbers and _ only';
    if (!form.email) e.email = 'Email is required';
    else if (!/^\S+@\S+\.\S+$/.test(form.email)) e.email = 'Invalid email';
    if (!form.password) e.password = 'Password is required';
    else if (form.password.length < 6) e.password = 'At least 6 characters';
    if (!form.confirm) e.confirm = 'Please confirm password';
    else if (form.confirm !== form.password) e.confirm = 'Passwords do not match';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    const result = await register(form.username, form.email, form.password);
    if (result.success) navigate('/');
  };

  const Field = ({ name, label, type = 'text', placeholder, autoComplete }) => (
    <div>
      <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>
        {label}
      </label>
      <input
        type={name === 'password' || name === 'confirm' ? (showPass ? 'text' : 'password') : type}
        autoComplete={autoComplete}
        className={`input-field ${errors[name] ? 'border-red-400 focus:border-red-400 focus:ring-red-200' : ''}`}
        placeholder={placeholder}
        value={form[name]}
        onChange={(e) => { setForm(f => ({ ...f, [name]: e.target.value })); setErrors(er => ({ ...er, [name]: '' })); }}
      />
      {errors[name] && <p className="text-xs text-red-500 mt-1">{errors[name]}</p>}
    </div>
  );

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8" style={{ background: 'var(--bg)' }}>
      <div className="w-full max-w-sm animate-scale-in">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-primary to-secondary rounded-2xl flex items-center justify-center shadow-glow mx-auto mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-9 h-9 text-white" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.477 2 2 6.477 2 12c0 5.523 4.477 10 10 10s10-4.477 10-10S17.523 2 12 2zm0 4a3 3 0 110 6 3 3 0 010-6zm0 14a8 8 0 01-6.195-2.941C6.82 15.717 9.265 14.5 12 14.5s5.18 1.217 6.195 2.559A8 8 0 0112 20z"/>
            </svg>
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            SocialNet
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
            Join the community
          </p>
        </div>

        {/* Card */}
        <div className="card p-7">
          <h2 className="text-xl font-bold mb-6" style={{ color: 'var(--text-primary)' }}>
            Create an account
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <Field name="username" label="Username" placeholder="your_username" autoComplete="username" />
            <Field name="email" label="Email" type="email" placeholder="you@example.com" autoComplete="email" />

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
                  Password
                </label>
                <button type="button" onClick={() => setShowPass(s => !s)}
                  className="text-xs font-medium text-primary hover:underline">
                  {showPass ? 'Hide' : 'Show'}
                </button>
              </div>
              <input
                type={showPass ? 'text' : 'password'}
                autoComplete="new-password"
                className={`input-field ${errors.password ? 'border-red-400 focus:border-red-400 focus:ring-red-200' : ''}`}
                placeholder="Min. 6 characters"
                value={form.password}
                onChange={(e) => { setForm(f => ({ ...f, password: e.target.value })); setErrors(er => ({ ...er, password: '' })); }}
              />
              {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                Confirm Password
              </label>
              <input
                type={showPass ? 'text' : 'password'}
                autoComplete="new-password"
                className={`input-field ${errors.confirm ? 'border-red-400 focus:border-red-400 focus:ring-red-200' : ''}`}
                placeholder="Repeat password"
                value={form.confirm}
                onChange={(e) => { setForm(f => ({ ...f, confirm: e.target.value })); setErrors(er => ({ ...er, confirm: '' })); }}
              />
              {errors.confirm && <p className="text-xs text-red-500 mt-1">{errors.confirm}</p>}
            </div>

            {/* Password strength */}
            {form.password && (
              <div className="space-y-1">
                <div className="flex gap-1">
                  {[1,2,3,4].map((level) => {
                    const strength = [
                      form.password.length >= 6,
                      /[A-Z]/.test(form.password),
                      /[0-9]/.test(form.password),
                      /[^a-zA-Z0-9]/.test(form.password),
                    ].filter(Boolean).length;
                    return (
                      <div key={level} className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                        level <= strength
                          ? strength <= 1 ? 'bg-red-400'
                          : strength <= 2 ? 'bg-yellow-400'
                          : strength <= 3 ? 'bg-blue-400'
                          : 'bg-green-400'
                          : 'bg-[var(--border)]'
                      }`} />
                    );
                  })}
                </div>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                  {[
                    form.password.length >= 6,
                    /[A-Z]/.test(form.password),
                    /[0-9]/.test(form.password),
                    /[^a-zA-Z0-9]/.test(form.password),
                  ].filter(Boolean).length <= 1 ? 'Weak'
                  : [form.password.length >= 6, /[A-Z]/.test(form.password), /[0-9]/.test(form.password), /[^a-zA-Z0-9]/.test(form.password)].filter(Boolean).length <= 2 ? 'Fair'
                  : [form.password.length >= 6, /[A-Z]/.test(form.password), /[0-9]/.test(form.password), /[^a-zA-Z0-9]/.test(form.password)].filter(Boolean).length <= 3 ? 'Good'
                  : 'Strong'} password
                </p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full mt-2 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Creating account...
                </>
              ) : 'Create account'}
            </button>
          </form>
        </div>

        <p className="text-center text-sm mt-4" style={{ color: 'var(--text-muted)' }}>
          Already have an account?{' '}
          <Link to="/login" className="text-primary font-semibold hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
