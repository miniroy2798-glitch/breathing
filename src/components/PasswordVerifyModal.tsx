import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Lock, X } from 'lucide-react';

interface PasswordVerifyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  title?: string;
  subtitle?: string;
}

export function PasswordVerifyModal({ 
  isOpen, 
  onClose, 
  onSuccess, 
  title = "Authentication Required", 
  subtitle = "Verify password to modify lists" 
}: PasswordVerifyModalProps) {
  const [passwordInput, setPasswordInput] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [hasPassword, setHasPassword] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setHasPassword(!!localStorage.getItem('vault_password'));
      setPasswordInput('');
      setErrorMsg('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const saved = localStorage.getItem('vault_password');
    if (!saved) {
      if (!passwordInput.trim()) {
        setErrorMsg('Password cannot be empty');
        return;
      }
      localStorage.setItem('vault_password', passwordInput);
      onSuccess();
      onClose();
    } else {
      if (passwordInput === saved) {
        onSuccess();
        onClose();
      } else {
        setErrorMsg('Incorrect Password');
        setPasswordInput('');
      }
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-md bg-white border border-stone-200 rounded-2xl shadow-2xl overflow-hidden p-6 space-y-6"
      >
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-amber-50 rounded-lg text-amber-600 animate-pulse">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-stone-900">{title}</h3>
              <p className="text-xs text-stone-500">{subtitle}</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1 text-stone-400 hover:text-stone-600 rounded-md transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-xs font-bold text-stone-600 uppercase tracking-wider block">
              {hasPassword ? 'Enter Secret Password' : 'Choose a New Secret Password'}
            </label>
            <div className="relative">
              <input
                type="password"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                placeholder="••••"
                className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-center text-xl tracking-widest text-stone-900 focus:outline-none focus:border-amber-500 transition-colors"
                autoComplete="new-password"
                autoFocus
              />
            </div>
            {errorMsg ? (
              <p className="text-xs text-red-500 font-medium text-center">{errorMsg}</p>
            ) : !hasPassword ? (
              <p className="text-[11px] text-amber-600 text-center animate-pulse">
                No password set yet! Set one now to secure all your lists.
              </p>
            ) : null}
          </div>

          <div className="flex gap-2.5 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 border border-stone-200 text-stone-600 rounded-xl hover:bg-stone-50 transition-colors text-sm font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2.5 bg-amber-500 text-white rounded-xl hover:bg-amber-600 transition-colors text-sm font-medium"
            >
              {hasPassword ? 'Unlock & Proceed' : 'Set Password'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
