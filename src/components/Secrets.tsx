import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Lock, Unlock, KeyRound, Save, Plus, Edit2, Trash2, 
  Sparkles, GripVertical, ChevronUp, ChevronDown, ArrowUpDown, 
  Heart, Upload, Film, Trash, Image as ImageIcon, X 
} from 'lucide-react';
import { FictionalCrush } from '../types';
import { PasswordVerifyModal } from './PasswordVerifyModal';

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

const DEFAULT_CRUSHES: FictionalCrush[] = [
  {
    id: 'c1',
    name: "Gojo Satoru",
    series: "Jujutsu Kaisen",
    imageUrl: "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=400&auto=format&fit=crop&q=80",
    note: "The eyes and the confidence. Absolutely unmatched. 💙",
    rank: 1
  },
  {
    id: 'c2',
    name: "Howl Jenkins Pendragon",
    series: "Howl's Moving Castle",
    imageUrl: "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=400&auto=format&fit=crop&q=80",
    note: "A drama king who literally gives his heart away. Absolutely beautiful.",
    rank: 2
  },
  {
    id: 'c3',
    name: "Captain Ri Jeong-hyeok",
    series: "Crash Landing on You",
    imageUrl: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&auto=format&fit=crop&q=80",
    note: "Plays piano, makes fresh hand-drip coffee, and protects you at all costs.",
    rank: 3
  }
];


export function Secrets() {
  const [unlocked, setUnlocked] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);
  
  const [hasStoredPassword, setHasStoredPassword] = useState(false);
  const [showSetupSuccess, setShowSetupSuccess] = useState(false);

  // Authentication states
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);
  const [authTitle, setAuthTitle] = useState('');
  const [authSubtitle, setAuthSubtitle] = useState('');

  const executeSecuredAction = (action: () => void, title: string, subtitle: string) => {
    setPendingAction(() => action);
    setAuthTitle(title);
    setAuthSubtitle(subtitle);
    setIsAuthModalOpen(true);
  };
  
  const [thoughts, setThoughts] = useState<SecretThought[]>([]);
  const [newThought, setNewThought] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');

  const [activeTab, setActiveTab] = useState<'thoughts' | 'crushes'>('thoughts');

  // Fictional Crushes States
  const [crushes, setCrushes] = useState<FictionalCrush[]>([]);
  const [isAddingCrush, setIsAddingCrush] = useState(false);
  const [editingCrushId, setEditingCrushId] = useState<string | null>(null);
  const [deletingCrushId, setDeletingCrushId] = useState<string | null>(null);
  const [isRearrangingCrushes, setIsRearrangingCrushes] = useState(false);
  const [draggedIndexCrush, setDraggedIndexCrush] = useState<number | null>(null);

  // Form states for adding crush
  const [addCrushName, setAddCrushName] = useState('');
  const [addCrushSeries, setAddCrushSeries] = useState('');
  const [addCrushNote, setAddCrushNote] = useState('');
  const [addCrushImageUrl, setAddCrushImageUrl] = useState('');
  const [addCrushRank, setAddCrushRank] = useState<number>(1);
  const [addCrushImagePosition, setAddCrushImagePosition] = useState('50% 50%');
  const [addCrushImageZoom, setAddCrushImageZoom] = useState('100');

  // Form states for editing crush
  const [editCrushName, setEditCrushName] = useState('');
  const [editCrushSeries, setEditCrushSeries] = useState('');
  const [editCrushNote, setEditCrushNote] = useState('');
  const [editCrushImageUrl, setEditCrushImageUrl] = useState('');
  const [editCrushRank, setEditCrushRank] = useState<number>(1);
  const [editCrushImagePosition, setEditCrushImagePosition] = useState('50% 50%');
  const [editCrushImageZoom, setEditCrushImageZoom] = useState('100');

  // file input refs
  const addFileRef = useRef<HTMLInputElement>(null);
  const editFileRef = useRef<HTMLInputElement>(null);

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

    const storedCrushes = localStorage.getItem('vault_crushes');
    if (storedCrushes) {
      try {
        setCrushes(JSON.parse(storedCrushes));
      } catch (e) {
        setCrushes(DEFAULT_CRUSHES);
      }
    } else {
      setCrushes(DEFAULT_CRUSHES);
    }
  }, []);

  useEffect(() => {
    if (unlocked) {
      localStorage.setItem('vault_thoughts', JSON.stringify(thoughts));
    }
  }, [thoughts, unlocked]);

  useEffect(() => {
    if (unlocked) {
      localStorage.setItem('vault_crushes', JSON.stringify(crushes));
    }
  }, [crushes, unlocked]);

  const handleDragStartCrush = (e: React.DragEvent, index: number) => {
    setDraggedIndexCrush(index);
    if (e.dataTransfer) {
      e.dataTransfer.effectAllowed = 'move';
    }
  };

  const handleDragEnterCrush = (e: React.DragEvent, index: number) => {
    if (draggedIndexCrush === null || draggedIndexCrush === index) return;
    
    const sorted = [...crushes].sort((a, b) => a.rank - b.rank);
    const item = sorted[draggedIndexCrush];
    sorted.splice(draggedIndexCrush, 1);
    sorted.splice(index, 0, item);
    
    // Re-assign ranks 1..N
    const updated = sorted.map((item, i) => ({
      ...item,
      rank: i + 1
    }));
    
    setDraggedIndexCrush(index);
    setCrushes(updated);
  };

  const handleDragEndCrush = () => {
    setDraggedIndexCrush(null);
  };

  const moveCrush = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= crushes.length) return;
    
    const sorted = [...crushes].sort((a, b) => a.rank - b.rank);
    const temp = sorted[index];
    sorted[index] = sorted[targetIndex];
    sorted[targetIndex] = temp;
    
    // Re-assign ranks 1..N
    const updated = sorted.map((item, i) => ({
      ...item,
      rank: i + 1
    }));
    
    setCrushes(updated);
  };

  const handleAddCrushSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!addCrushName.trim()) return;

    const newCrush: FictionalCrush = {
      id: 'crush_' + Date.now().toString(),
      name: addCrushName.trim(),
      series: addCrushSeries.trim() || undefined,
      note: addCrushNote.trim() || undefined,
      imageUrl: addCrushImageUrl.trim() || undefined,
      rank: addCrushRank,
      imagePosition: addCrushImagePosition,
      imageZoom: addCrushImageZoom
    };

    // Sort current list by rank
    const sorted = [...crushes].sort((a, b) => a.rank - b.rank);
    // Insert at target rank - 1 index
    const insertIndex = Math.max(0, Math.min(addCrushRank - 1, sorted.length));
    sorted.splice(insertIndex, 0, newCrush);

    // Re-assign ranks 1..N
    const updated = sorted.map((item, index) => ({
      ...item,
      rank: index + 1
    }));

    setCrushes(updated);
    
    // Reset add form states
    setAddCrushName('');
    setAddCrushSeries('');
    setAddCrushNote('');
    setAddCrushImageUrl('');
    setAddCrushImagePosition('50% 50%');
    setAddCrushImageZoom('100');
    setIsAddingCrush(false);
  };

  const startEditCrush = (crush: FictionalCrush) => {
    setEditingCrushId(crush.id);
    setEditCrushName(crush.name);
    setEditCrushSeries(crush.series || '');
    setEditCrushNote(crush.note || '');
    setEditCrushImageUrl(crush.imageUrl || '');
    setEditCrushRank(crush.rank);
    setEditCrushImagePosition(crush.imagePosition || '50% 50%');
    setEditCrushImageZoom(crush.imageZoom || '100');
  };

  const handleEditCrushSubmit = (e: React.FormEvent, id: string) => {
    e.preventDefault();
    if (!editCrushName.trim()) return;

    const updatedItem: FictionalCrush = {
      id,
      name: editCrushName.trim(),
      series: editCrushSeries.trim() || undefined,
      note: editCrushNote.trim() || undefined,
      imageUrl: editCrushImageUrl.trim() || undefined,
      rank: editCrushRank,
      imagePosition: editCrushImagePosition,
      imageZoom: editCrushImageZoom
    };

    // Remove old item from the list
    const remaining = crushes.filter(c => c.id !== id).sort((a, b) => a.rank - b.rank);
    
    // Insert at new rank - 1 index
    const insertIndex = Math.max(0, Math.min(editCrushRank - 1, remaining.length));
    remaining.splice(insertIndex, 0, updatedItem);

    // Re-assign ranks 1..N
    const updated = remaining.map((item, index) => ({
      ...item,
      rank: index + 1
    }));

    setCrushes(updated);
    setEditingCrushId(null);
  };

  const deleteCrush = (id: string) => {
    const remaining = crushes.filter(c => c.id !== id);
    // Recalculate ranks so they are contiguous 1..N
    const updated = [...remaining]
      .sort((a, b) => a.rank - b.rank)
      .map((c, i) => ({
        ...c,
        rank: i + 1
      }));
    setCrushes(updated);
  };

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>, isEdit: boolean) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        if (isEdit) {
          setEditCrushImageUrl(reader.result);
        } else {
          setAddCrushImageUrl(reader.result);
        }
      }
    };
    reader.readAsDataURL(file);
  };

  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) return;

    if (!hasStoredPassword) {
      localStorage.setItem('vault_password', password);
      setHasStoredPassword(true);
      setShowSetupSuccess(true);
      setError(false);
      setPassword('');
    } else {
      const stored = localStorage.getItem('vault_password');
      if (password === stored) {
        setUnlocked(true);
        sessionStorage.setItem('vault_session_unlocked', 'true');
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
    
    executeSecuredAction(
      () => {
        const newEntry: SecretThought = {
          id: Date.now().toString(),
          content: newThought,
          timestamp: new Date().toISOString()
        };
        
        setThoughts([newEntry, ...thoughts]);
        setNewThought('');
      },
      "Authenticate to Add",
      "Verify password to add a secret thought"
    );
  };

  const startEdit = (thought: SecretThought) => {
    executeSecuredAction(
      () => {
        setEditingId(thought.id);
        setEditContent(thought.content);
      },
      "Authenticate to Edit",
      "Verify password to edit this secret thought"
    );
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
    executeSecuredAction(
      () => {
        setThoughts(thoughts.filter(t => t.id !== id));
      },
      "Authenticate to Delete",
      "Verify password to delete this secret thought"
    );
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8 h-full flex flex-col"
    >
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-2">
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
        </div>
        {unlocked && (
          <button
            onClick={() => {
              setUnlocked(false);
              sessionStorage.removeItem('vault_session_unlocked');
            }}
            className="flex items-center gap-2 px-3 py-1.5 border border-stone-200 text-stone-600 hover:text-red-600 hover:bg-red-50 hover:border-red-100 rounded-lg text-xs font-semibold transition-all self-start sm:self-auto"
          >
            <Lock className="w-3.5 h-3.5" />
            Lock Archive
          </button>
        )}
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
                <h3 className="text-xl font-medium text-stone-900">
                  {!hasStoredPassword ? "Create Private Vault" : "Encrypted Archive"}
                </h3>
                <p className="text-sm text-amber-600">
                  {showSetupSuccess 
                    ? "Password set! Enter it below to unlock." 
                    : hasStoredPassword 
                      ? "Enter PIN to decrypt entries." 
                      : "Set a password to secure your archive."}
                </p>
              </div>

              <div className="w-full space-y-3">
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••"
                  className={`w-full bg-pink-50 border ${error ? 'border-red-500/50' : 'border-white'} rounded-xl px-4 py-3 text-center text-2xl tracking-widest text-stone-900 focus:outline-none focus:border-amber-500/50 transition-colors`}
                  autoComplete="new-password"
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
                  <p className="text-amber-500 text-xs text-center font-mono animate-pulse">
                    Type your desired password and save
                  </p>
                )}
              </div>

              <button 
                type="submit"
                className="w-full bg-amber-500 hover:bg-amber-600 text-white font-medium py-3 rounded-xl transition-colors shadow-sm"
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
              {/* Tab Selector */}
              <div className="flex border-b border-stone-200 gap-6 mb-2">
                <button 
                  onClick={() => { setActiveTab('thoughts'); setIsRearrangingCrushes(false); setIsAddingCrush(false); }}
                  className={`pb-3 font-semibold text-sm transition-colors border-b-2 relative ${activeTab === 'thoughts' ? 'text-amber-500 border-amber-500' : 'text-stone-400 border-transparent hover:text-stone-600'}`}
                >
                  Secret Thoughts
                </button>
                <button 
                  onClick={() => { setActiveTab('crushes'); }}
                  className={`pb-3 font-semibold text-sm transition-colors border-b-2 relative flex items-center gap-1.5 ${activeTab === 'crushes' ? 'text-amber-500 border-amber-500' : 'text-stone-400 border-transparent hover:text-stone-600'}`}
                >
                  <Heart className="w-4 h-4 text-red-500 fill-red-400" />
                  Fictional Crushes
                </button>
              </div>

              {activeTab === 'thoughts' ? (
                /* SECRET DIARY / THOUGHTS TAB */
                <div className="space-y-6">
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
                </div>
              ) : (
                /* FICTIONAL CRUSHES TAB */
                <div className="space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <h3 className="text-xl font-bold tracking-tight text-stone-900 flex items-center gap-1.5">
                        <Heart className="w-5 h-5 text-red-500 fill-red-500" />
                        My Fictional Crushes
                      </h3>
                      <p className="text-xs text-stone-500">Rank, edit, and keep track of your ultimate favorites.</p>
                    </div>
                    
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => {
                          if (isRearrangingCrushes) {
                            setIsRearrangingCrushes(false);
                          } else {
                            executeSecuredAction(
                              () => {
                                setIsRearrangingCrushes(true);
                                setIsAddingCrush(false);
                              },
                              "Authenticate to Rearrange",
                              "Verify password to sort your fictional crushes"
                            );
                          }
                        }}
                        className={`font-medium px-3.5 py-2 rounded-xl transition-all duration-200 flex items-center gap-1.5 shadow-sm active:scale-95 text-xs ${
                          isRearrangingCrushes 
                            ? 'bg-emerald-600 hover:bg-emerald-700 text-white' 
                            : 'bg-stone-100 hover:bg-stone-200 text-stone-700'
                        }`}
                      >
                        <ArrowUpDown className="w-3.5 h-3.5" />
                        {isRearrangingCrushes ? 'Done Sorting' : 'Rearrange'}
                      </button>

                      <button
                        onClick={() => {
                          if (isAddingCrush) {
                            setIsAddingCrush(false);
                          } else {
                            executeSecuredAction(
                              () => {
                                setIsAddingCrush(true);
                                setIsRearrangingCrushes(false);
                                setAddCrushRank(crushes.length + 1);
                              },
                              "Authenticate to Add Crush",
                              "Verify password to add a fictional crush"
                            );
                          }
                        }}
                        className="bg-amber-500 hover:bg-amber-600 text-white font-medium px-3.5 py-2 rounded-xl transition-all duration-200 flex items-center gap-1.5 shadow-sm active:scale-95 text-xs"
                      >
                        {isAddingCrush ? <X className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                        {isAddingCrush ? 'Cancel' : 'Add Crush'}
                      </button>
                    </div>
                  </div>

                  {/* Expandable Add Form */}
                  <AnimatePresence>
                    {isAddingCrush && (
                      <motion.div
                        initial={{ opacity: 0, height: 0, y: -10 }}
                        animate={{ opacity: 1, height: 'auto', y: 0 }}
                        exit={{ opacity: 0, height: 0, y: -10 }}
                        className="overflow-hidden bg-white border border-stone-200 rounded-2xl p-5 shadow-sm space-y-4"
                      >
                        <h4 className="text-sm font-semibold text-stone-900 flex items-center gap-2">
                          <Sparkles className="w-4 h-4 text-amber-500" />
                          Add a Fictional Crush
                        </h4>
                        
                        <form onSubmit={handleAddCrushSubmit} className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="space-y-1.5">
                              <label className="text-xs font-semibold text-stone-500 uppercase">Character Name</label>
                              <input
                                type="text"
                                required
                                value={addCrushName}
                                onChange={e => setAddCrushName(e.target.value)}
                                placeholder="e.g. Gojo Satoru"
                                className="w-full px-3.5 py-2 rounded-xl border border-stone-200 focus:outline-none focus:border-amber-500 bg-stone-50 text-sm text-stone-900 transition-colors"
                              />
                            </div>

                            <div className="space-y-1.5">
                              <label className="text-xs font-semibold text-stone-500 uppercase">Series / Origin</label>
                              <input
                                type="text"
                                value={addCrushSeries}
                                onChange={e => setAddCrushSeries(e.target.value)}
                                placeholder="e.g. Jujutsu Kaisen"
                                className="w-full px-3.5 py-2 rounded-xl border border-stone-200 focus:outline-none focus:border-amber-500 bg-stone-50 text-sm text-stone-900 transition-colors"
                              />
                            </div>

                            <div className="space-y-1.5">
                              <label className="text-xs font-semibold text-stone-500 uppercase">Rank (1 is Top)</label>
                              <input
                                type="number"
                                required
                                min={1}
                                max={crushes.length + 1}
                                value={addCrushRank}
                                onChange={e => setAddCrushRank(Math.max(1, parseInt(e.target.value, 10) || 1))}
                                className="w-full px-3.5 py-2 rounded-xl border border-stone-200 focus:outline-none focus:border-amber-500 bg-stone-50 text-sm text-stone-900 transition-colors"
                              />
                            </div>
                          </div>

                          <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-stone-500 uppercase">My Thoughts / Notes</label>
                            <textarea
                              value={addCrushNote}
                              onChange={e => setAddCrushNote(e.target.value)}
                              placeholder="What makes them special to you?"
                              rows={2}
                              className="w-full px-3.5 py-2 rounded-xl border border-stone-200 focus:outline-none focus:border-amber-500 bg-stone-50 text-sm text-stone-900 transition-colors resize-none"
                            />
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
                            <div className="space-y-1.5">
                              <label className="text-xs font-semibold text-stone-500 uppercase">Image URL (Optional)</label>
                              <input
                                type="text"
                                value={addCrushImageUrl}
                                onChange={e => setAddCrushImageUrl(e.target.value)}
                                placeholder="https://example.com/image.jpg"
                                className="w-full px-3.5 py-2 rounded-xl border border-stone-200 focus:outline-none focus:border-amber-500 bg-stone-50 text-sm text-stone-900 transition-colors"
                              />
                            </div>

                            <div className="space-y-1.5">
                              <label className="text-xs font-semibold text-stone-500 uppercase">Or Upload Custom Image</label>
                              <div className="flex items-center gap-3">
                                <button
                                  type="button"
                                  onClick={() => addFileRef.current?.click()}
                                  className="px-4 py-2 border border-dashed border-stone-300 rounded-xl hover:bg-stone-50 transition-colors text-xs font-medium text-stone-600 flex items-center gap-1.5"
                                >
                                  <Upload className="w-3.5 h-3.5 text-stone-500" />
                                  Select Image File
                                </button>
                                <input
                                  type="file"
                                  ref={addFileRef}
                                  onChange={(e) => handleImageFileChange(e, false)}
                                  accept="image/*"
                                  className="hidden"
                                />
                                {addCrushImageUrl && (
                                  <div className="flex items-center gap-1.5 text-xs text-green-600 font-medium">
                                    <span className="w-2 h-2 rounded-full bg-green-500"></span>
                                    Image Ready!
                                    <button 
                                      type="button"
                                      onClick={() => setAddCrushImageUrl('')}
                                      className="p-1 hover:bg-stone-100 rounded text-stone-400 hover:text-stone-600"
                                      title="Clear Image"
                                    >
                                      <X className="w-3 h-3" />
                                    </button>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>

                          {addCrushImageUrl && (
                            <div className="bg-stone-50 p-4 rounded-xl border border-stone-200/60 space-y-3">
                              <div className="flex items-center justify-between">
                                <span className="text-xs font-bold text-stone-600 flex items-center gap-1.5">
                                  <ImageIcon className="w-3.5 h-3.5 text-amber-500" />
                                  Image Focus & Zoom Controls
                                </span>
                                <span className="text-[10px] text-stone-400 font-medium">Drag sliders to make sure their face is visible!</span>
                              </div>
                              
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {/* Real-time preview */}
                                <div className="space-y-1">
                                  <label className="text-[10px] font-bold text-stone-400 uppercase">Live Crop Preview</label>
                                  <div className="relative w-full h-28 bg-stone-200 rounded-lg overflow-hidden border border-stone-300 flex items-center justify-center">
                                    <img
                                      src={addCrushImageUrl}
                                      alt="Preview"
                                      className="w-full h-full object-cover"
                                      style={{
                                        objectPosition: addCrushImagePosition,
                                        transform: `scale(${parseFloat(addCrushImageZoom) / 100})`,
                                        transformOrigin: 'center center'
                                      }}
                                    />
                                    <div className="absolute inset-0 border-2 border-dashed border-amber-400/30 pointer-events-none rounded-lg" />
                                    <div className="absolute top-1.5 left-1.5 px-1.5 py-0.5 bg-black/50 text-white text-[8px] font-bold rounded">
                                      Card Shape
                                    </div>
                                  </div>
                                </div>
                                
                                {/* Sliders */}
                                <div className="space-y-2">
                                  {/* Y-axis slider */}
                                  <div className="space-y-1">
                                    <div className="flex justify-between text-[10px]">
                                      <span className="font-semibold text-stone-500 uppercase">Vertical Position (Y-Axis)</span>
                                      <span className="font-mono text-stone-600">{addCrushImagePosition.split(' ')[1] || '50%'}</span>
                                    </div>
                                    <input
                                      type="range"
                                      min="0"
                                      max="100"
                                      value={parseInt(addCrushImagePosition.split(' ')[1]) || 50}
                                      onChange={(e) => {
                                        const xVal = addCrushImagePosition.split(' ')[0] || '50%';
                                        setAddCrushImagePosition(`${xVal} ${e.target.value}%`);
                                      }}
                                      className="w-full h-1.5 bg-stone-200 rounded-lg appearance-none cursor-pointer accent-amber-500 focus:outline-none"
                                    />
                                    <div className="flex justify-between text-[8px] text-stone-400">
                                      <span>Top (Face)</span>
                                      <span>Center</span>
                                      <span>Bottom</span>
                                    </div>
                                  </div>

                                  {/* X-axis slider */}
                                  <div className="space-y-1">
                                    <div className="flex justify-between text-[10px]">
                                      <span className="font-semibold text-stone-500 uppercase">Horizontal Position (X-Axis)</span>
                                      <span className="font-mono text-stone-600">{addCrushImagePosition.split(' ')[0] || '50%'}</span>
                                    </div>
                                    <input
                                      type="range"
                                      min="0"
                                      max="100"
                                      value={parseInt(addCrushImagePosition.split(' ')[0]) || 50}
                                      onChange={(e) => {
                                        const yVal = addCrushImagePosition.split(' ')[1] || '50%';
                                        setAddCrushImagePosition(`${e.target.value}% ${yVal}`);
                                      }}
                                      className="w-full h-1.5 bg-stone-200 rounded-lg appearance-none cursor-pointer accent-amber-500 focus:outline-none"
                                    />
                                  </div>

                                  {/* Zoom slider */}
                                  <div className="space-y-1">
                                    <div className="flex justify-between text-[10px]">
                                      <span className="font-semibold text-stone-500 uppercase">Zoom Level</span>
                                      <span className="font-mono text-stone-600">{addCrushImageZoom}%</span>
                                    </div>
                                    <input
                                      type="range"
                                      min="100"
                                      max="250"
                                      step="5"
                                      value={parseInt(addCrushImageZoom) || 100}
                                      onChange={(e) => setAddCrushImageZoom(e.target.value)}
                                      className="w-full h-1.5 bg-stone-200 rounded-lg appearance-none cursor-pointer accent-amber-500 focus:outline-none"
                                    />
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}

                          <div className="flex justify-end gap-2.5 pt-2 border-t border-stone-100">
                            <button
                              type="button"
                              onClick={() => setIsAddingCrush(false)}
                              className="px-4 py-2 rounded-xl text-stone-500 hover:bg-stone-100 transition-colors text-xs font-medium"
                            >
                              Cancel
                            </button>
                            <button
                              type="submit"
                              className="bg-amber-500 hover:bg-amber-600 text-white font-medium px-4 py-2 rounded-xl transition-colors text-xs shadow-sm"
                            >
                              Save Crush
                            </button>
                          </div>
                        </form>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Rearrange Mode Info Alert */}
                  {isRearrangingCrushes && (
                    <div className="p-3 bg-amber-50 border border-amber-200/60 rounded-xl text-stone-700 text-xs flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
                      <span>Sorting Mode: Drag cards to rearrange, or use the <strong>↑ / ↓</strong> buttons on the cards to rank them. Click <strong>Done Sorting</strong> above to save.</span>
                    </div>
                  )}

                  {/* Crushes Grid */}
                  <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                    <AnimatePresence initial={false}>
                      {[...crushes].sort((a, b) => a.rank - b.rank).map((crush, idx) => (
                        <motion.div
                          key={crush.id}
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.9 }}
                          transition={{ duration: 0.2 }}
                          draggable={isRearrangingCrushes}
                          onDragStart={(e) => handleDragStartCrush(e, idx)}
                          onDragEnter={(e) => handleDragEnterCrush(e, idx)}
                          onDragEnd={handleDragEndCrush}
                          onDragOver={(e) => e.preventDefault()}
                          className={`bg-white border rounded-2xl shadow-sm overflow-hidden flex flex-col group transition-all duration-300 ${
                            isRearrangingCrushes 
                              ? 'border-dashed border-amber-300 hover:bg-amber-50/20 cursor-grab active:cursor-grabbing' 
                              : 'border-stone-100 hover:shadow-md'
                          }`}
                        >
                          {editingCrushId === crush.id ? (
                            /* EDITING FORM IN CARD */
                            <form onSubmit={(e) => handleEditCrushSubmit(e, crush.id)} className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                              <div className="space-y-2.5">
                                <h5 className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-1">Edit Crush Info</h5>
                                
                                <div className="space-y-1">
                                  <label className="text-[10px] font-bold text-stone-400 uppercase">Name</label>
                                  <input
                                    type="text"
                                    required
                                    value={editCrushName}
                                    onChange={e => setEditCrushName(e.target.value)}
                                    className="w-full px-2.5 py-1.5 rounded-lg border border-stone-200 focus:outline-none focus:border-amber-500 bg-stone-50 text-xs text-stone-900"
                                  />
                                </div>

                                <div className="space-y-1">
                                  <label className="text-[10px] font-bold text-stone-400 uppercase">Series / Origin</label>
                                  <input
                                    type="text"
                                    value={editCrushSeries}
                                    onChange={e => setEditCrushSeries(e.target.value)}
                                    className="w-full px-2.5 py-1.5 rounded-lg border border-stone-200 focus:outline-none focus:border-amber-500 bg-stone-50 text-xs text-stone-900"
                                  />
                                </div>

                                <div className="space-y-1">
                                  <label className="text-[10px] font-bold text-stone-400 uppercase">Rank (1 is Top)</label>
                                  <input
                                    type="number"
                                    required
                                    min={1}
                                    max={crushes.length}
                                    value={editCrushRank}
                                    onChange={e => setEditCrushRank(Math.max(1, parseInt(e.target.value, 10) || 1))}
                                    className="w-full px-2.5 py-1.5 rounded-lg border border-stone-200 focus:outline-none focus:border-amber-500 bg-stone-50 text-xs text-stone-900"
                                  />
                                </div>

                                <div className="space-y-1">
                                  <label className="text-[10px] font-bold text-stone-400 uppercase">My Thoughts</label>
                                  <textarea
                                    value={editCrushNote}
                                    onChange={e => setEditCrushNote(e.target.value)}
                                    rows={2}
                                    className="w-full px-2.5 py-1.5 rounded-lg border border-stone-200 focus:outline-none focus:border-amber-500 bg-stone-50 text-xs text-stone-900 resize-none"
                                  />
                                </div>

                                <div className="space-y-1">
                                  <label className="text-[10px] font-bold text-stone-400 uppercase">Image URL</label>
                                  <input
                                    type="text"
                                    value={editCrushImageUrl}
                                    onChange={e => setEditCrushImageUrl(e.target.value)}
                                    placeholder="Paste URL"
                                    className="w-full px-2.5 py-1.5 rounded-lg border border-stone-200 focus:outline-none focus:border-amber-500 bg-stone-50 text-xs text-stone-900 mb-1"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => editFileRef.current?.click()}
                                    className="w-full px-2.5 py-1.5 border border-dashed border-stone-300 hover:bg-stone-50 rounded-lg text-[11px] font-medium text-stone-600 flex items-center justify-center gap-1"
                                  >
                                    <Upload className="w-3.5 h-3.5 text-stone-500" />
                                    Upload Image File
                                  </button>
                                  <input
                                    type="file"
                                    ref={editFileRef}
                                    onChange={(e) => handleImageFileChange(e, true)}
                                    accept="image/*"
                                    className="hidden"
                                  />
                                </div>

                                {editCrushImageUrl && (
                                  <div className="bg-stone-50 p-2.5 rounded-xl border border-stone-200/60 space-y-2 mt-2">
                                    <div className="flex items-center justify-between text-[10px] font-bold text-stone-500">
                                      <span className="flex items-center gap-1">
                                        <ImageIcon className="w-3 h-3 text-amber-500" />
                                        Focus & Zoom Preview
                                      </span>
                                    </div>
                                    
                                    {/* Real-time preview */}
                                    <div className="relative w-full h-24 bg-stone-200 rounded-lg overflow-hidden border border-stone-300 flex items-center justify-center">
                                      <img
                                        src={editCrushImageUrl}
                                        alt="Edit Preview"
                                        className="w-full h-full object-cover"
                                        style={{
                                          objectPosition: editCrushImagePosition,
                                          transform: `scale(${parseFloat(editCrushImageZoom) / 100})`,
                                          transformOrigin: 'center center'
                                        }}
                                      />
                                      <div className="absolute inset-0 border border-dashed border-amber-400/40 pointer-events-none rounded" />
                                    </div>

                                    {/* Y position slider */}
                                    <div className="space-y-0.5">
                                      <div className="flex justify-between text-[9px] font-bold text-stone-400 uppercase">
                                        <span>Vertical Pos (Y)</span>
                                        <span className="font-mono">{editCrushImagePosition.split(' ')[1] || '50%'}</span>
                                      </div>
                                      <input
                                        type="range"
                                        min="0"
                                        max="100"
                                        value={parseInt(editCrushImagePosition.split(' ')[1]) || 50}
                                        onChange={(e) => {
                                          const xVal = editCrushImagePosition.split(' ')[0] || '50%';
                                          setEditCrushImagePosition(`${xVal} ${e.target.value}%`);
                                        }}
                                        className="w-full h-1 bg-stone-200 rounded appearance-none cursor-pointer accent-amber-500"
                                      />
                                    </div>

                                    {/* X position slider */}
                                    <div className="space-y-0.5">
                                      <div className="flex justify-between text-[9px] font-bold text-stone-400 uppercase">
                                        <span>Horizontal Pos (X)</span>
                                        <span className="font-mono">{editCrushImagePosition.split(' ')[0] || '50%'}</span>
                                      </div>
                                      <input
                                        type="range"
                                        min="0"
                                        max="100"
                                        value={parseInt(editCrushImagePosition.split(' ')[0]) || 50}
                                        onChange={(e) => {
                                          const yVal = editCrushImagePosition.split(' ')[1] || '50%';
                                          setEditCrushImagePosition(`${e.target.value}% ${yVal}`);
                                        }}
                                        className="w-full h-1 bg-stone-200 rounded appearance-none cursor-pointer accent-amber-500"
                                      />
                                    </div>

                                    {/* Zoom slider */}
                                    <div className="space-y-0.5">
                                      <div className="flex justify-between text-[9px] font-bold text-stone-400 uppercase">
                                        <span>Zoom Level</span>
                                        <span className="font-mono">{editCrushImageZoom}%</span>
                                      </div>
                                      <input
                                        type="range"
                                        min="100"
                                        max="250"
                                        step="5"
                                        value={parseInt(editCrushImageZoom) || 100}
                                        onChange={(e) => setEditCrushImageZoom(e.target.value)}
                                        className="w-full h-1 bg-stone-200 rounded appearance-none cursor-pointer accent-amber-500"
                                      />
                                    </div>
                                  </div>
                                )}
                              </div>

                              <div className="flex justify-end gap-1.5 pt-3 border-t border-stone-100 mt-2">
                                <button
                                  type="button"
                                  onClick={() => setEditingCrushId(null)}
                                  className="p-1.5 text-stone-400 hover:text-stone-600 hover:bg-stone-100 rounded-lg transition-colors"
                                  title="Cancel"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                                <button
                                  type="submit"
                                  className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white text-xs font-semibold rounded-lg shadow-sm flex items-center gap-1 transition-colors"
                                >
                                  <Save className="w-3.5 h-3.5" />
                                  Save
                                </button>
                              </div>
                            </form>
                          ) : (
                            /* CARD DISPLAY MODE */
                            <>
                              {/* Card Image Area */}
                              <div className="relative w-full h-48 bg-stone-100 shrink-0 overflow-hidden">
                                {crush.imageUrl ? (
                                  <img
                                    src={crush.imageUrl}
                                    alt={crush.name}
                                    referrerPolicy="no-referrer"
                                    className="w-full h-full object-cover transition-all duration-300"
                                    style={{
                                      objectPosition: crush.imagePosition || '50% 50%',
                                      transform: `scale(${parseFloat(crush.imageZoom || '100') / 100})`,
                                      transformOrigin: 'center center'
                                    }}
                                  />
                                ) : (
                                  /* GORGEOUS CSS GRADIENT WITH GLOWING HEART */
                                  <div className="w-full h-full bg-gradient-to-tr from-pink-400 via-rose-300 to-amber-200 flex flex-col items-center justify-center p-4 text-center">
                                    <div className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center shadow-inner animate-pulse">
                                      <Heart className="w-8 h-8 text-white fill-white" />
                                    </div>
                                  </div>
                                )}

                                {/* Rank Badge */}
                                <div className="absolute top-3 left-3 px-2.5 py-1 bg-white/95 backdrop-blur-md rounded-full text-[10px] font-black text-amber-600 shadow-sm border border-amber-100/50 flex items-center gap-1">
                                  <Heart className="w-3 h-3 fill-red-400 text-red-400" />
                                  Rank #{crush.rank}
                                </div>

                                {/* Quick Actions overlay */}
                                {!isRearrangingCrushes && (
                                  deletingCrushId === crush.id ? (
                                    <div className="absolute top-3 right-3 flex items-center gap-1 bg-red-50 px-2 py-1 rounded-xl shadow-sm border border-red-100/50">
                                      <span className="text-[9px] font-bold text-red-600">Delete?</span>
                                      <button
                                        onClick={() => executeSecuredAction(
                                          () => {
                                            deleteCrush(crush.id);
                                            setDeletingCrushId(null);
                                          },
                                          "Authenticate to Delete",
                                          `Verify password to confirm deleting "${crush.name}"`
                                        )}
                                        className="px-1.5 py-0.5 bg-red-500 text-white rounded text-[8px] font-bold hover:bg-red-600 transition-colors"
                                      >
                                        Yes
                                      </button>
                                      <button
                                        onClick={() => setDeletingCrushId(null)}
                                        className="px-1.5 py-0.5 bg-stone-200 text-stone-700 rounded text-[8px] font-bold hover:bg-stone-300 transition-colors"
                                      >
                                        No
                                      </button>
                                    </div>
                                  ) : (
                                    <div className="absolute top-3 right-3 flex items-center gap-1 bg-white/95 backdrop-blur-md px-1.5 py-1 rounded-xl shadow-sm border border-stone-100 opacity-80 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-200">
                                      <button
                                        onClick={() => executeSecuredAction(
                                          () => startEditCrush(crush),
                                          "Authenticate to Edit",
                                          `Verify password to edit "${crush.name}"`
                                        )}
                                        className="p-1 text-stone-400 hover:text-amber-600 rounded-md transition-colors"
                                        title="Edit Crush"
                                      >
                                        <Edit2 className="w-3.5 h-3.5" />
                                      </button>
                                      <button
                                        onClick={() => executeSecuredAction(
                                          () => setDeletingCrushId(crush.id),
                                          "Authenticate to Delete",
                                          `Verify password to delete "${crush.name}"`
                                        )}
                                        className="p-1 text-stone-400 hover:text-red-500 rounded-md transition-colors"
                                        title="Delete Crush"
                                      >
                                        <Trash2 className="w-3.5 h-3.5" />
                                      </button>
                                    </div>
                                  )
                                )}
                              </div>

                              {/* Card Content Area */}
                              <div className="p-4 flex-1 flex flex-col justify-between">
                                <div className="space-y-2">
                                  <div className="flex items-start justify-between gap-2">
                                    <h4 className="font-bold text-stone-900 text-base group-hover:text-amber-600 transition-colors leading-snug">
                                      {crush.name}
                                    </h4>
                                    {crush.series && (
                                      <span className="shrink-0 text-[10px] font-semibold text-stone-500 bg-stone-100 px-2 py-0.5 rounded-md self-start mt-0.5">
                                        {crush.series}
                                      </span>
                                    )}
                                  </div>

                                  {crush.note && (
                                    <p className="text-xs text-stone-600 font-serif leading-relaxed italic border-l-2 border-pink-200 pl-2 py-0.5 mt-2">
                                      "{crush.note}"
                                    </p>
                                  )}
                                </div>

                                {/* Rearranging Handles (on bottom if rearranging) */}
                                {isRearrangingCrushes && (
                                  <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between gap-2">
                                    <div className="flex items-center gap-1 text-stone-400 font-mono text-[10px]">
                                      <GripVertical className="w-4 h-4 text-stone-400 cursor-grab active:cursor-grabbing shrink-0" />
                                      <span>Drag to sort</span>
                                    </div>
                                    <div className="flex gap-1 shrink-0">
                                      <button
                                        type="button"
                                        disabled={idx === 0}
                                        onClick={() => moveCrush(idx, 'up')}
                                        className="p-1 text-stone-400 hover:text-amber-500 hover:bg-stone-50 rounded disabled:opacity-30"
                                        title="Move Up"
                                      >
                                        <ChevronUp className="w-4 h-4" />
                                      </button>
                                      <button
                                        type="button"
                                        disabled={idx === crushes.length - 1}
                                        onClick={() => moveCrush(idx, 'down')}
                                        className="p-1 text-stone-400 hover:text-amber-500 hover:bg-stone-50 rounded disabled:opacity-30"
                                        title="Move Down"
                                      >
                                        <ChevronDown className="w-4 h-4" />
                                      </button>
                                    </div>
                                  </div>
                                )}
                              </div>
                            </>
                          )}
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>

                  {crushes.length === 0 && (
                    <div className="text-center text-stone-400 py-16 border-2 border-dashed border-stone-200 rounded-2xl bg-white italic">
                      No crushes added yet! Let your heart run wild and add your first crush above.
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {isAuthModalOpen && (
          <PasswordVerifyModal
            isOpen={isAuthModalOpen}
            onClose={() => {
              setIsAuthModalOpen(false);
              setPendingAction(null);
            }}
            onSuccess={() => {
              if (pendingAction) {
                pendingAction();
              }
              setIsAuthModalOpen(false);
              setPendingAction(null);
            }}
            title={authTitle}
            subtitle={authSubtitle}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}
