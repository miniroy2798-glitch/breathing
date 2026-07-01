import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { kdramas as initialKdramas } from '../data';
import { Tv, Heart, Plus, Pencil, Trash2, Save, X, Sparkles, GripVertical, ChevronUp, ChevronDown, ArrowUpDown } from 'lucide-react';
import { Drama } from '../types';
import { PasswordVerifyModal } from './PasswordVerifyModal';

export function Kdramas() {
  const [dramas, setDramas] = useState<Drama[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isRearranging, setIsRearranging] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

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

  // Form states for adding
  const [addTitle, setAddTitle] = useState('');
  const [addStatus, setAddStatus] = useState('Completed');
  const [addNote, setAddNote] = useState('');
  const [addRank, setAddRank] = useState<number>(1);

  // Form states for editing
  const [editTitle, setEditTitle] = useState('');
  const [editStatus, setEditStatus] = useState('');
  const [editNote, setEditNote] = useState('');
  const [editRank, setEditRank] = useState<number>(1);

  // Load from LocalStorage or fallback
  useEffect(() => {
    const saved = localStorage.getItem('app_kdramas_v2');
    let loadedItems: Drama[] = [];
    if (saved) {
      try {
        loadedItems = JSON.parse(saved);
      } catch (e) {
        loadedItems = initialKdramas;
      }
    } else {
      // Migrate from older keys if any, otherwise default
      const oldSaved = localStorage.getItem('app_kdramas');
      if (oldSaved) {
        try {
          loadedItems = JSON.parse(oldSaved);
        } catch (e) {
          loadedItems = initialKdramas;
        }
      } else {
        loadedItems = initialKdramas;
      }
    }
    // Ensure ranks are assigned 1..N based on index
    const withRanks = loadedItems.map((item, index) => ({
      ...item,
      rank: item.rank || index + 1
    }));
    withRanks.sort((a, b) => (a.rank || 0) - (b.rank || 0));
    setDramas(withRanks);
  }, []);

  // Save to LocalStorage
  const saveToStorage = (updatedList: Drama[]) => {
    const sortedAndRanked = [...updatedList]
      .sort((a, b) => (a.rank || 0) - (b.rank || 0))
      .map((item, index) => ({
        ...item,
        rank: index + 1
      }));
    setDramas(sortedAndRanked);
    localStorage.setItem('app_kdramas_v2', JSON.stringify(sortedAndRanked));
  };

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    if (e.dataTransfer) {
      e.dataTransfer.effectAllowed = 'move';
    }
  };

  const handleDragEnter = (e: React.DragEvent, index: number) => {
    if (draggedIndex === null || draggedIndex === index) return;
    const newList = [...dramas];
    const item = newList[draggedIndex];
    newList.splice(draggedIndex, 1);
    newList.splice(index, 0, item);
    // Re-assign ranks right away for responsiveness
    const updated = newList.map((item, idx) => ({
      ...item,
      rank: idx + 1
    }));
    setDraggedIndex(index);
    setDramas(updated);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    saveToStorage(dramas);
  };

  const moveItem = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= dramas.length) return;
    const newList = [...dramas];
    const temp = newList[index];
    newList[index] = newList[targetIndex];
    newList[targetIndex] = temp;
    saveToStorage(newList);
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!addTitle.trim()) return;

    const newDrama: Drama = {
      id: Date.now().toString(),
      title: addTitle.trim(),
      status: addStatus,
      note: addNote.trim() || undefined,
      rank: addRank
    };

    const sorted = [...dramas].sort((a, b) => (a.rank || 0) - (b.rank || 0));
    const insertIndex = Math.max(0, Math.min(addRank - 1, sorted.length));
    sorted.splice(insertIndex, 0, newDrama);

    saveToStorage(sorted);

    // Reset Form
    setAddTitle('');
    setAddStatus('Completed');
    setAddNote('');
    setIsAdding(false);
  };

  const startEdit = (drama: Drama) => {
    setEditingId(drama.id);
    setEditTitle(drama.title);
    setEditStatus(drama.status || 'Completed');
    setEditNote(drama.note || '');
    setEditRank(drama.rank || 1);
  };

  const handleEditSubmit = (e: React.FormEvent, id: string) => {
    e.preventDefault();
    if (!editTitle.trim()) return;

    const updatedItem: Drama = {
      id,
      title: editTitle.trim(),
      status: editStatus,
      note: editNote.trim() || undefined,
      rank: editRank
    };

    const remaining = dramas.filter(item => item.id !== id).sort((a, b) => (a.rank || 0) - (b.rank || 0));
    const insertIndex = Math.max(0, Math.min(editRank - 1, remaining.length));
    remaining.splice(insertIndex, 0, updatedItem);

    saveToStorage(remaining);
    setEditingId(null);
  };

  const handleDelete = (id: string) => {
    const updated = dramas.filter(d => d.id !== id);
    saveToStorage(updated);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-2">
          <div className="flex items-center space-x-3">
            <Tv className="w-8 h-8 text-amber-500" />
            <h2 className="text-3xl font-bold tracking-tight text-black">K-Drama Archive</h2>
          </div>
          <p className="text-stone-600">Shows that ruined my sleep schedule and raised my standards.</p>
          <div className="w-16 h-1 bg-amber-500 rounded-full"></div>
        </div>
        
        <div className="flex flex-wrap gap-2 self-start sm:self-center">
          <button
            onClick={() => {
              if (isRearranging) {
                setIsRearranging(false);
              } else {
                executeSecuredAction(
                  () => {
                    setIsRearranging(true);
                    setIsAdding(false);
                  },
                  "Authenticate to Rearrange",
                  "Verify password to sort your K-Dramas"
                );
              }
            }}
            className={`font-medium px-4 py-2.5 rounded-xl transition-all duration-200 flex items-center gap-2 shadow-sm hover:shadow active:scale-95 text-sm ${
              isRearranging 
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white' 
                : 'bg-stone-100 hover:bg-stone-200 text-stone-700'
            }`}
          >
            <ArrowUpDown className="w-4 h-4" />
            {isRearranging ? 'Done Sorting' : 'Rearrange'}
          </button>

          <button
            onClick={() => {
              if (isAdding) {
                setIsAdding(false);
              } else {
                executeSecuredAction(
                  () => {
                    setIsAdding(true);
                    setIsRearranging(false);
                    setAddRank(dramas.length + 1);
                  },
                  "Authenticate to Add Show",
                  "Verify password to add a new K-Drama"
                );
              }
            }}
            className="bg-amber-500 hover:bg-amber-600 text-white font-medium px-4 py-2.5 rounded-xl transition-all duration-200 flex items-center gap-2 shadow-sm hover:shadow active:scale-95 text-sm"
          >
            {isAdding ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            {isAdding ? 'Cancel' : 'Add Show'}
          </button>
        </div>
      </header>

      {/* Expandable Add Form */}
      <AnimatePresence>
        {isAdding && (
          <motion.div
            initial={{ opacity: 0, height: 0, y: -10 }}
            animate={{ opacity: 1, height: 'auto', y: 0 }}
            exit={{ opacity: 0, height: 0, y: -10 }}
            className="overflow-hidden bg-white border border-stone-200 rounded-2xl p-6 shadow-sm space-y-4"
          >
            <h3 className="text-lg font-medium text-stone-900 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-500" />
              Add a New K-Drama
            </h3>
            
            <form onSubmit={handleAddSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-stone-500 uppercase tracking-wider">Title</label>
                <input
                  type="text"
                  required
                  value={addTitle}
                  onChange={e => setAddTitle(e.target.value)}
                  placeholder="e.g. Descendants of the Sun"
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-200 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 bg-stone-50 text-stone-900 transition-colors"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-stone-500 uppercase tracking-wider">Status</label>
                <select
                  value={addStatus}
                  onChange={e => setAddStatus(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-200 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 bg-stone-50 text-stone-900 transition-colors"
                >
                  <option value="Completed">Completed</option>
                  <option value="Watching">Watching</option>
                  <option value="Incompleted">Incompleted</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-stone-500 uppercase tracking-wider">Rank (1 is Top)</label>
                <input
                  type="number"
                  required
                  min={1}
                  max={dramas.length + 1}
                  value={addRank}
                  onChange={e => setAddRank(Math.max(1, parseInt(e.target.value, 10) || 1))}
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-200 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 bg-stone-50 text-stone-900 transition-colors"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-stone-500 uppercase tracking-wider">Notes / Thoughts</label>
                <input
                  type="text"
                  value={addNote}
                  onChange={e => setAddNote(e.target.value)}
                  placeholder="e.g. Best chemistry ever!"
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-200 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 bg-stone-50 text-stone-900 transition-colors"
                />
              </div>

              <div className="md:col-span-4 flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAdding(false)}
                  className="px-4 py-2 rounded-xl text-stone-500 hover:bg-stone-100 transition-colors text-sm font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-amber-500 hover:bg-amber-600 text-white font-medium px-5 py-2 rounded-xl transition-colors text-sm shadow-sm"
                >
                  Save to Archive
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="space-y-4">
        {isRearranging && (
          <motion.div 
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-3 bg-amber-50 border border-amber-200/60 rounded-xl text-stone-700 text-xs flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
            <span>Rearrange mode active: Drag cards by their handles, or use the <strong>↑ / ↓</strong> buttons to sort. Click <strong>Done Sorting</strong> above to save.</span>
          </motion.div>
        )}

        <AnimatePresence initial={false}>
          {dramas.map((drama, idx) => (
            <motion.div 
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.2 }}
              key={drama.id} 
              draggable={isRearranging}
              onDragStart={(e) => handleDragStart(e, idx)}
              onDragEnter={(e) => handleDragEnter(e, idx)}
              onDragEnd={handleDragEnd}
              onDragOver={(e) => e.preventDefault()}
              className={`p-5 rounded-xl border bg-white shadow-sm flex flex-col justify-between gap-4 group transition-all duration-200 ${
                isRearranging 
                  ? 'border-dashed border-amber-300 hover:bg-amber-50/20 cursor-grab active:cursor-grabbing' 
                  : 'border-stone-100 hover:bg-pink-200/20'
              }`}
            >
              {editingId === drama.id ? (
                /* Editing Mode Form */
                <form onSubmit={(e) => handleEditSubmit(e, drama.id)} className="w-full space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-stone-400 uppercase">Title</label>
                      <input
                        type="text"
                        required
                        value={editTitle}
                        onChange={e => setEditTitle(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-stone-200 focus:outline-none focus:border-amber-500 bg-stone-50 text-sm"
                      />
                    </div>
                    
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-stone-400 uppercase">Status</label>
                      <select
                        value={editStatus}
                        onChange={e => setEditStatus(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-stone-200 focus:outline-none focus:border-amber-500 bg-stone-50 text-sm"
                      >
                        <option value="Completed">Completed</option>
                        <option value="Watching">Watching</option>
                        <option value="Incompleted">Incompleted</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-stone-400 uppercase">Rank (1 is Top)</label>
                      <input
                        type="number"
                        required
                        min={1}
                        max={dramas.length}
                        value={editRank}
                        onChange={e => setEditRank(Math.max(1, parseInt(e.target.value, 10) || 1))}
                        className="w-full px-3 py-2 rounded-lg border border-stone-200 focus:outline-none focus:border-amber-500 bg-stone-50 text-sm"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-stone-400 uppercase">Notes / Thoughts</label>
                      <input
                        type="text"
                        value={editNote}
                        onChange={e => setEditNote(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-stone-200 focus:outline-none focus:border-amber-500 bg-stone-50 text-sm"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setEditingId(null)}
                      className="p-1.5 text-stone-400 hover:text-stone-600 hover:bg-stone-100 rounded-lg transition-colors"
                      title="Cancel"
                    >
                      <X className="w-4 h-4" />
                    </button>
                    <button
                      type="submit"
                      className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white text-xs font-semibold rounded-lg shadow-sm flex items-center gap-1.5 transition-colors"
                    >
                      <Save className="w-3.5 h-3.5" />
                      Save
                    </button>
                  </div>
                </form>
              ) : (
                /* Static Display Mode */
                <div className="flex items-start justify-between w-full gap-4">
                  <div className="flex items-center gap-3 flex-1">
                    {isRearranging && (
                      <div className="flex items-center gap-1.5 pr-2 border-r border-stone-100 shrink-0 select-none">
                        <GripVertical className="w-5 h-5 text-stone-400" />
                        <div className="flex flex-col gap-1">
                          <button
                            type="button"
                            disabled={idx === 0}
                            onClick={() => moveItem(idx, 'up')}
                            className="p-1 text-stone-400 hover:text-amber-500 hover:bg-stone-100 rounded disabled:opacity-30 disabled:hover:bg-transparent"
                            title="Move Up"
                          >
                            <ChevronUp className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            disabled={idx === dramas.length - 1}
                            onClick={() => moveItem(idx, 'down')}
                            className="p-1 text-stone-400 hover:text-amber-500 hover:bg-stone-100 rounded disabled:opacity-30 disabled:hover:bg-transparent"
                            title="Move Down"
                          >
                            <ChevronDown className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    )}

                    <div className="flex-1">
                      <div className="flex items-center space-x-2.5 flex-wrap gap-y-1.5 mb-1.5">
                        <span className="px-2 py-0.5 bg-amber-50 rounded text-[10px] font-extrabold text-amber-700 border border-amber-100/50 shrink-0">
                          Rank #{drama.rank || idx + 1}
                        </span>
                        <h3 className="text-lg font-semibold text-stone-900 leading-tight">{drama.title}</h3>
                        {drama.status && (
                          <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${
                            drama.status === 'Completed' ? 'bg-green-100 text-green-700' : 
                            drama.status === 'Watching' ? 'bg-blue-100 text-blue-700' :
                            'bg-amber-100 text-amber-800'
                          }`}>
                            {drama.status}
                          </span>
                        )}
                      </div>
                      {drama.note && <p className="text-sm text-stone-600 italic">"{drama.note}"</p>}
                    </div>
                  </div>

                  {/* Actions (visible on hover and always on mobile) */}
                  {!isRearranging && (
                    deletingId === drama.id ? (
                      <div className="flex items-center space-x-1.5 shrink-0 bg-red-50 px-2 py-1 rounded-lg border border-red-100">
                        <span className="text-[10px] font-bold text-red-600">Delete?</span>
                        <button
                          onClick={() => {
                            handleDelete(drama.id);
                            setDeletingId(null);
                          }}
                          className="px-1.5 py-0.5 bg-red-500 text-white rounded text-[9px] font-bold hover:bg-red-600 transition-colors"
                        >
                          Yes
                        </button>
                        <button
                          onClick={() => setDeletingId(null)}
                          className="px-1.5 py-0.5 bg-stone-200 text-stone-700 rounded text-[9px] font-bold hover:bg-stone-300 transition-colors"
                        >
                          No
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-1 opacity-80 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-200 self-center md:self-start shrink-0">
                        <button
                          onClick={() => executeSecuredAction(
                            () => startEdit(drama),
                            "Authenticate to Edit",
                            `Verify password to edit "${drama.title}"`
                          )}
                          className="p-1.5 text-stone-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                          title="Edit Drama"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => executeSecuredAction(
                            () => setDeletingId(drama.id),
                            "Authenticate to Delete",
                            `Verify password to delete "${drama.title}"`
                          )}
                          className="p-1.5 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete Drama"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    )
                  )}
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
        {dramas.length === 0 && (
          <div className="text-center text-stone-400 py-16 border-2 border-dashed border-stone-200 rounded-2xl bg-white italic">
            Your archive is empty. Add your favorite shows above!
          </div>
        )}
      </div>

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
    </motion.div>
  );
}

