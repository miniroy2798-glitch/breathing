import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Lock, Unlock, KeyRound, Save, Plus, Edit2, Trash2 } from 'lucide-react';

interface SecretThought {
  id: string;
  content: string;
  timestamp: string;
}

const DEFAULT_THOUGHTS: SecretThought[] = [
  { id: '1', content: "Ambivert, scared of attention, don't like people staring", timestamp: new Date(Date.now() - 100000).toISOString() },
  { id: '2', content: "Wanting to live with your besties someday", timestamp: new Date(Date.now() - 80000).toISOString() },
  { id: '3', content: "Liking someone 4 years older", timestamp: new Date(Date.now() - 60000).toISOString() },
  { id: '4', content: "Worrying about what you're going to do in the future", timestamp: new Date(Date.now() - 40000).toISOString() },
  { id: '5', content: "Wishing you didn't hurt people when you're angry", timestamp: new Date(Date.now() - 20000).toISOString() }
];

export function Secrets() {
  const [unlocked, setUnlocked] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);
  
  const [hasStoredPassword, setHasStoredPassword] = useState(false);
  
  const [thoughts, setThoughts] = useState<SecretThought[]>([]);
  const [newThought, setNewThought] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');

  useEffect(() => {
    const storedAuth = localStorage.getItem('vault_password');
    if (storedAuth) {
      setHasStoredPassword(true);
    }
    
    const storedThoughts = localStorage.getItem('vault_thoughts');
    if (storedThoughts) {
      try {
        setThoughts(JSON.parse(storedThoughts));
      } catch (e) {
        setThoughts(DEFAULT_THOUGHTS);
      }
    } else {
      setThoughts(DEFAULT_THOUGHTS);
    }
  }, []);

  useEffect(() => {
    if (unlocked) {
      localStorage.setItem('vault_thoughts', JSON.stringify(thoughts));
    }
  }, [thoughts, unlocked]);

  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) return;

    if (!hasStoredPassword) {
      localStorage.setItem('vault_password', password);
      setHasStoredPassword(true);
      setUnlocked(true);
      setError(false);
      setPassword('');
    } else {
      const stored = localStorage.getItem('vault_password');
      if (password === stored) {
        setUnlocked(true);
        setError(false);
        setPassword('');
      } else {
        setError(true);
        setPassword('');
        setTimeout(() => setError(false), 2000);
      }
    }
  };

  const handleAddThought = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newThought.trim()) return;
    
    const newEntry: SecretThought = {
      id: Date.now().toString(),
      content: newThought,
      timestamp: new Date().toISOString()
    };
    
    setThoughts([newEntry, ...thoughts]);
    setNewThought('');
  };

  const startEdit = (thought: SecretThought) => {
    setEditingId(thought.id);
    setEditContent(thought.content);
  };

  const saveEdit = () => {
    if (!editContent.trim()) return;
    setThoughts(thoughts.map(t => 
      t.id === editingId ? { ...t, content: editContent } : t
    ));
    setEditingId(null);
    setEditContent('');
  };

  const deleteThought = (id: string) => {
    setThoughts(thoughts.filter(t => t.id !== id));
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8 h-full flex flex-col"
    >
      <header className="space-y-4">
        <div className="flex items-center space-x-3">
          {unlocked ? (
            <Unlock className="w-8 h-8 text-amber-500" />
          ) : (
            <Lock className="w-8 h-8 text-amber-600" />
          )}
          <h2 className="text-3xl font-bold tracking-tight text-black">Secret Thoughts</h2>
        </div>
        <p className="text-stone-600">Restricted area. Only accessible to the archivist.</p>
        <div className={`w-16 h-1 rounded-full transition-colors ${unlocked ? 'bg-amber-500' : 'bg-amber-300'}`}></div>
      </header>

      <div className="flex-1 flex items-center justify-center py-12">
        <AnimatePresence mode="wait">
          {!unlocked ? (
            <motion.form 
              key="locked"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onSubmit={handleUnlock}
              className="w-full max-w-sm p-8 rounded-2xl border border-stone-100 bg-white drop-shadow-sm/50 backdrop-blur-sm shadow-2xl flex flex-col items-center space-y-6"
            >
              <div className="w-16 h-16 rounded-full bg-pink-200 flex items-center justify-center">
                <KeyRound className="w-8 h-8 text-stone-600" />
              </div>
              
              <div className="text-center space-y-2">
                <h3 className="text-xl font-medium text-stone-900">Encrypted Archive</h3>
                <p className="text-sm text-amber-600">
                  {hasStoredPassword ? "Enter PIN to decrypt entries." : "Set a PIN to secure your archive."}
                </p>
              </div>

              <div className="w-full space-y-3">
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••"
                  className={`w-full bg-pink-50 border ${error ? 'border-red-500/50' : 'border-white'} rounded-xl px-4 py-3 text-center text-2xl tracking-widest text-stone-900 focus:outline-none focus:border-amber-500/50 transition-colors`}
                  autoFocus
                />
                
                {error && (
                  <motion.p 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-red-400 text-xs text-center font-mono"
                  >
                    ACCESS DENIED
                  </motion.p>
                )}
                {!hasStoredPassword && (
                  <p className="text-amber-500 text-xs text-center font-mono">
                    Type a new password and save
                  </p>
                )}
              </div>

              <button 
                type="submit"
                className="w-full bg-amber-500 hover:bg-amber-600 text-white font-medium py-3 rounded-xl transition-colors"
                disabled={!password}
              >
                {hasStoredPassword ? "Decrypt" : "Save Password"}
              </button>
            </motion.form>
          ) : (
            <motion.div 
              key="unlocked"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="w-full space-y-6"
            >
              <form onSubmit={handleAddThought} className="flex gap-2">
                <input 
                  type="text" 
                  value={newThought}
                  onChange={(e) => setNewThought(e.target.value)}
                  placeholder="Write a secret thought..."
                  className="flex-1 bg-white border border-stone-100 drop-shadow-sm rounded-xl px-4 py-3 text-stone-900 focus:outline-none focus:border-amber-300 transition-colors"
                />
                <button 
                  type="submit"
                  disabled={!newThought.trim()}
                  className="bg-amber-500 hover:bg-amber-600 border border-amber-500 text-white px-4 rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center shrink-0"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </form>

              <div className="space-y-4">
                {thoughts.map((thought) => (
                  <div key={thought.id} className="p-6 rounded-xl border border-stone-100 bg-white drop-shadow-sm relative overflow-hidden group">
                    <div className="flex justify-between items-start mb-4 gap-4">
                      {editingId === thought.id ? (
                        <div className="flex-1 flex gap-2">
                          <input 
                            type="text"
                            value={editContent}
                            onChange={(e) => setEditContent(e.target.value)}
                            className="flex-1 bg-stone-50 border border-stone-200 rounded px-3 py-2 text-stone-900 focus:outline-none focus:border-amber-300"
                            autoFocus
                          />
                          <button onClick={saveEdit} className="text-amber-600 hover:text-amber-700 bg-amber-50 px-3 rounded flex items-center justify-center">
                            <Save className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <p className="text-stone-800 font-serif leading-relaxed italic flex-1">
                          "{thought.content}"
                        </p>
                      )}
                      
                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                        {editingId !== thought.id && (
                          <button onClick={() => startEdit(thought)} className="text-stone-400 hover:text-amber-600 p-1">
                            <Edit2 className="w-4 h-4" />
                          </button>
                        )}
                        <button onClick={() => deleteThought(thought.id)} className="text-stone-400 hover:text-red-500 p-1">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <div className="mt-4 pt-4 border-t border-stone-100 flex justify-between items-center text-xs text-amber-600 font-mono tracking-wide">
                      <span>STATUS: SECURE</span>
                      <span>ENCRYPTION: 256-BIT</span>
                    </div>
                  </div>
                ))}
                
                {thoughts.length === 0 && (
                  <p className="text-center text-stone-400 py-8 italic font-serif">No secrets here yet...</p>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
