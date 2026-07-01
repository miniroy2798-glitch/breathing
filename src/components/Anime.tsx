import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { animes as initialAnimes, watchedAnimes as initialWatchedAnimes } from '../data';
import { Star, CheckCircle, Plus, Pencil, Trash2, Save, X, Sparkles, GripVertical, ChevronUp, ChevronDown, ArrowUpDown } from 'lucide-react';
import { Anime as AnimeType, Drama as WatchedAnimeType } from '../types';
import { PasswordVerifyModal } from './PasswordVerifyModal';

export function Anime() {
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

  // --- State for Anime Rankings ---
  const [rankList, setRankList] = useState<AnimeType[]>([]);
  const [isAddingRank, setIsAddingRank] = useState(false);
  const [editingRankId, setEditingRankId] = useState<string | null>(null);
  const [deletingRankId, setDeletingRankId] = useState<string | null>(null);
  const [isRearrangingRank, setIsRearrangingRank] = useState(false);
  const [draggedIndexRank, setDraggedIndexRank] = useState<number | null>(null);

  // Form states for adding rank
  const [addRankNumber, setAddRankNumber] = useState<number>(11);
  const [addRankTitle, setAddRankTitle] = useState('');
  const [addRankNote, setAddRankNote] = useState('');

  // Form states for editing rank
  const [editRankNumber, setEditRankNumber] = useState<number>(0);
  const [editRankTitle, setEditRankTitle] = useState('');
  const [editRankNote, setEditRankNote] = useState('');

  // --- State for Watched Animes ---
  const [watchedList, setWatchedList] = useState<WatchedAnimeType[]>([]);
  const [isAddingWatched, setIsAddingWatched] = useState(false);
  const [editingWatchedId, setEditingWatchedId] = useState<string | null>(null);
  const [deletingWatchedId, setDeletingWatchedId] = useState<string | null>(null);
  const [isRearrangingWatched, setIsRearrangingWatched] = useState(false);
  const [draggedIndexWatched, setDraggedIndexWatched] = useState<number | null>(null);

  // Form states for adding watched
  const [addWatchedTitle, setAddWatchedTitle] = useState('');
  const [addWatchedStatus, setAddWatchedStatus] = useState('Completed');
  const [addWatchedNote, setAddWatchedNote] = useState('');

  // Form states for editing watched
  const [editWatchedTitle, setEditWatchedTitle] = useState('');
  const [editWatchedStatus, setEditWatchedStatus] = useState('');
  const [editWatchedNote, setEditWatchedNote] = useState('');

  // --- Load and Initialize Data ---
  useEffect(() => {
    // Rankings load
    const savedRank = localStorage.getItem('app_animes_v2');
    if (savedRank) {
      try {
        setRankList(JSON.parse(savedRank));
      } catch (e) {
        setRankList(initialAnimes);
      }
    } else {
      setRankList(initialAnimes);
    }

    // Watched load
    const savedWatched = localStorage.getItem('app_watched_animes_v2');
    if (savedWatched) {
      try {
        setWatchedList(JSON.parse(savedWatched));
      } catch (e) {
        setWatchedList(initialWatchedAnimes);
      }
    } else {
      setWatchedList(initialWatchedAnimes);
    }
  }, []);

  // --- Rankings Operations ---
  const saveRankings = (updated: AnimeType[]) => {
    setRankList(updated);
    localStorage.setItem('app_animes_v2', JSON.stringify(updated));
    // Update next rank helper
    const maxRank = updated.reduce((max, item) => Math.max(max, item.rank), 0);
    setAddRankNumber(maxRank + 1);
  };

  const handleDragStartRank = (e: React.DragEvent, index: number) => {
    setDraggedIndexRank(index);
    if (e.dataTransfer) {
      e.dataTransfer.effectAllowed = 'move';
    }
  };

  const handleDragEnterRank = (e: React.DragEvent, index: number) => {
    if (draggedIndexRank === null || draggedIndexRank === index) return;
    
    const sorted = [...rankList].sort((a, b) => a.rank - b.rank);
    const item = sorted[draggedIndexRank];
    sorted.splice(draggedIndexRank, 1);
    sorted.splice(index, 0, item);
    
    // Re-assign ranks 1..N based on new order
    const updated = sorted.map((item, i) => ({
      ...item,
      rank: i + 1
    }));
    
    setDraggedIndexRank(index);
    setRankList(updated);
  };

  const handleDragEndRank = () => {
    setDraggedIndexRank(null);
    saveRankings(rankList);
  };

  const moveItemRank = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= rankList.length) return;
    
    const sorted = [...rankList].sort((a, b) => a.rank - b.rank);
    const temp = sorted[index];
    sorted[index] = sorted[targetIndex];
    sorted[targetIndex] = temp;
    
    // Re-assign ranks 1..N based on new order
    const updated = sorted.map((item, i) => ({
      ...item,
      rank: i + 1
    }));
    
    saveRankings(updated);
  };

  const handleAddRankSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!addRankTitle.trim()) return;

    const newItem: AnimeType = {
      id: Date.now().toString(),
      title: addRankTitle.trim(),
      rank: Number(addRankNumber) || (rankList.length + 1),
      note: addRankNote.trim() || undefined
    };

    const updated = [...rankList, newItem];
    saveRankings(updated);

    // Reset Form
    setAddRankTitle('');
    setAddRankNote('');
    setIsAddingRank(false);
  };

  const startEditRank = (anime: AnimeType) => {
    setEditingRankId(anime.id);
    setEditRankNumber(anime.rank);
    setEditRankTitle(anime.title);
    setEditRankNote(anime.note || '');
  };

  const handleEditRankSubmit = (e: React.FormEvent, id: string) => {
    e.preventDefault();
    if (!editRankTitle.trim()) return;

    const updated = rankList.map(item => {
      if (item.id === id) {
        return {
          ...item,
          title: editRankTitle.trim(),
          rank: Number(editRankNumber),
          note: editRankNote.trim() || undefined
        };
      }
      return item;
    });

    saveRankings(updated);
    setEditingRankId(null);
  };

  const handleDeleteRank = (id: string) => {
    const updated = rankList.filter(item => item.id !== id);
    saveRankings(updated);
  };

  // --- Watched Operations ---
  const saveWatched = (updated: WatchedAnimeType[]) => {
    setWatchedList(updated);
    localStorage.setItem('app_watched_animes_v2', JSON.stringify(updated));
  };

  const handleDragStartWatched = (e: React.DragEvent, index: number) => {
    setDraggedIndexWatched(index);
    if (e.dataTransfer) {
      e.dataTransfer.effectAllowed = 'move';
    }
  };

  const handleDragEnterWatched = (e: React.DragEvent, index: number) => {
    if (draggedIndexWatched === null || draggedIndexWatched === index) return;
    const newList = [...watchedList];
    const item = newList[draggedIndexWatched];
    newList.splice(draggedIndexWatched, 1);
    newList.splice(index, 0, item);
    setDraggedIndexWatched(index);
    setWatchedList(newList);
  };

  const handleDragEndWatched = () => {
    setDraggedIndexWatched(null);
    saveWatched(watchedList);
  };

  const moveItemWatched = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= watchedList.length) return;
    const newList = [...watchedList];
    const temp = newList[index];
    newList[index] = newList[targetIndex];
    newList[targetIndex] = temp;
    saveWatched(newList);
  };

  const handleAddWatchedSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!addWatchedTitle.trim()) return;

    const newItem: WatchedAnimeType = {
      id: Date.now().toString(),
      title: addWatchedTitle.trim(),
      status: addWatchedStatus,
      note: addWatchedNote.trim() || undefined
    };

    const updated = [newItem, ...watchedList];
    saveWatched(updated);

    // Reset Form
    setAddWatchedTitle('');
    setAddWatchedStatus('Completed');
    setAddWatchedNote('');
    setIsAddingWatched(false);
  };

  const startEditWatched = (anime: WatchedAnimeType) => {
    setEditingWatchedId(anime.id);
    setEditWatchedTitle(anime.title);
    setEditWatchedStatus(anime.status || 'Completed');
    setEditWatchedNote(anime.note || '');
  };

  const handleEditWatchedSubmit = (e: React.FormEvent, id: string) => {
    e.preventDefault();
    if (!editWatchedTitle.trim()) return;

    const updated = watchedList.map(item => {
      if (item.id === id) {
        return {
          ...item,
          title: editWatchedTitle.trim(),
          status: editWatchedStatus,
          note: editWatchedNote.trim() || undefined
        };
      }
      return item;
    });

    saveWatched(updated);
    setEditingWatchedId(null);
  };

  const handleDeleteWatched = (id: string) => {
    const updated = watchedList.filter(item => item.id !== id);
    saveWatched(updated);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-12"
    >
      {/* SECTION 1: Anime Rankings */}
      <section className="space-y-8">
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center space-x-3">
              <Star className="w-8 h-8 text-amber-500" />
              <h2 className="text-3xl font-bold tracking-tight text-black">Anime Rankings</h2>
            </div>
            <p className="text-stone-600">My personal favorites. Ranked.</p>
            <div className="w-16 h-1 bg-amber-500 rounded-full"></div>
          </div>

          <div className="flex flex-wrap gap-2 self-start sm:self-center">
            <button
              onClick={() => {
                if (isRearrangingRank) {
                  setIsRearrangingRank(false);
                } else {
                  executeSecuredAction(
                    () => {
                      setIsRearrangingRank(true);
                      setIsAddingRank(false);
                    },
                    "Authenticate to Rearrange",
                    "Verify password to sort your Anime rankings"
                  );
                }
              }}
              className={`font-medium px-4 py-2 rounded-xl transition-all duration-200 flex items-center gap-2 shadow-sm hover:shadow active:scale-95 text-sm ${
                isRearrangingRank 
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white' 
                  : 'bg-stone-100 hover:bg-stone-200 text-stone-700'
              }`}
            >
              <ArrowUpDown className="w-4 h-4" />
              {isRearrangingRank ? 'Done Sorting' : 'Rearrange'}
            </button>

            <button
              onClick={() => {
                if (isAddingRank) {
                  setIsAddingRank(false);
                } else {
                  executeSecuredAction(
                    () => {
                      setIsAddingRank(true);
                      setIsRearrangingRank(false);
                    },
                    "Authenticate to Add Ranked",
                    "Verify password to add a ranked Anime"
                  );
                }
              }}
              className="bg-amber-500 hover:bg-amber-600 text-white font-medium px-4 py-2 rounded-xl transition-all duration-200 flex items-center gap-2 shadow-sm hover:shadow active:scale-95 text-sm"
            >
              {isAddingRank ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
              {isAddingRank ? 'Cancel' : 'Add Ranked'}
            </button>
          </div>
        </header>

        {/* Expandable Add Rank Form */}
        <AnimatePresence>
          {isAddingRank && (
            <motion.div
              initial={{ opacity: 0, height: 0, y: -10 }}
              animate={{ opacity: 1, height: 'auto', y: 0 }}
              exit={{ opacity: 0, height: 0, y: -10 }}
              className="overflow-hidden bg-white border border-stone-200 rounded-2xl p-6 shadow-sm space-y-4"
            >
              <h3 className="text-lg font-medium text-stone-900 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-500" />
                Add to Rankings
              </h3>
              
              <form onSubmit={handleAddRankSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-stone-500 uppercase tracking-wider">Rank (#)</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={addRankNumber}
                    onChange={e => setAddRankNumber(Number(e.target.value))}
                    className="w-full px-4 py-2.5 rounded-xl border border-stone-200 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 bg-stone-50 text-stone-900 transition-colors"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-stone-500 uppercase tracking-wider">Anime Name</label>
                  <input
                    type="text"
                    required
                    value={addRankTitle}
                    onChange={e => setAddRankTitle(e.target.value)}
                    placeholder="e.g. Jujutsu Kaisen"
                    className="w-full px-4 py-2.5 rounded-xl border border-stone-200 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 bg-stone-50 text-stone-900 transition-colors"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-stone-500 uppercase tracking-wider">Note</label>
                  <input
                    type="text"
                    value={addRankNote}
                    onChange={e => setAddRankNote(e.target.value)}
                    placeholder="e.g. Best fights ever"
                    className="w-full px-4 py-2.5 rounded-xl border border-stone-200 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 bg-stone-50 text-stone-900 transition-colors"
                  />
                </div>

                <div className="md:col-span-3 flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsAddingRank(false)}
                    className="px-4 py-2 rounded-xl text-stone-500 hover:bg-stone-100 transition-colors text-sm font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-amber-500 hover:bg-amber-600 text-white font-medium px-5 py-2 rounded-xl transition-colors text-sm shadow-sm"
                  >
                    Add to List
                  </button>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="space-y-3">
          {isRearrangingRank && (
            <motion.div 
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-3 bg-amber-50 border border-amber-200/60 rounded-xl text-stone-700 text-xs flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
              <span>Rearrange mode active: Drag cards by their handles, or use the <strong>↑ / ↓</strong> buttons to sort. Ranks will update automatically.</span>
            </motion.div>
          )}

          <AnimatePresence initial={false}>
            {[...rankList].sort((a, b) => a.rank - b.rank).map((anime, idx) => (
              <motion.div 
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.2 }}
                key={anime.id} 
                draggable={isRearrangingRank}
                onDragStart={(e) => handleDragStartRank(e, idx)}
                onDragEnter={(e) => handleDragEnterRank(e, idx)}
                onDragEnd={handleDragEndRank}
                onDragOver={(e) => e.preventDefault()}
                className={`p-4 rounded-xl border bg-white shadow-sm flex flex-col group transition-all duration-200 ${
                  isRearrangingRank 
                    ? 'border-dashed border-amber-300 hover:bg-amber-50/20 cursor-grab active:cursor-grabbing' 
                    : 'border-stone-100 hover:bg-amber-50/30'
                }`}
              >
                {editingRankId === anime.id ? (
                  /* Edit Rank Inline */
                  <form onSubmit={(e) => handleEditRankSubmit(e, anime.id)} className="w-full space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-stone-400 uppercase">Rank (#)</label>
                        <input
                          type="number"
                          required
                          min="1"
                          value={editRankNumber}
                          onChange={e => setEditRankNumber(Number(e.target.value))}
                          className="w-full px-3 py-2 rounded-lg border border-stone-200 focus:outline-none focus:border-amber-500 bg-stone-50 text-sm"
                        />
                      </div>
                      
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-stone-400 uppercase">Title</label>
                        <input
                          type="text"
                          required
                          value={editRankTitle}
                          onChange={e => setEditRankTitle(e.target.value)}
                          className="w-full px-3 py-2 rounded-lg border border-stone-200 focus:outline-none focus:border-amber-500 bg-stone-50 text-sm"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-stone-400 uppercase">Note</label>
                        <input
                          type="text"
                          value={editRankNote}
                          onChange={e => setEditRankNote(e.target.value)}
                          className="w-full px-3 py-2 rounded-lg border border-stone-200 focus:outline-none focus:border-amber-500 bg-stone-50 text-sm"
                        />
                      </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => setEditingRankId(null)}
                        className="p-1.5 text-stone-400 hover:text-stone-600 hover:bg-stone-100 rounded-lg transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                      <button
                        type="submit"
                        className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white text-xs font-semibold rounded-lg shadow-sm flex items-center gap-1.5"
                      >
                        <Save className="w-3.5 h-3.5" />
                        Save
                      </button>
                    </div>
                  </form>
                ) : (
                  /* Display Rank List Row */
                  <div className="flex items-center justify-between w-full gap-4">
                    <div className="flex items-center space-x-4 flex-1">
                      {isRearrangingRank && (
                        <div className="flex items-center gap-1.5 pr-2 border-r border-stone-100 shrink-0 select-none">
                          <GripVertical className="w-5 h-5 text-stone-400" />
                          <div className="flex flex-col gap-1">
                            <button
                              type="button"
                              disabled={idx === 0}
                              onClick={() => moveItemRank(idx, 'up')}
                              className="p-1 text-stone-400 hover:text-amber-500 hover:bg-stone-100 rounded disabled:opacity-30 disabled:hover:bg-transparent"
                              title="Move Up"
                            >
                              <ChevronUp className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              disabled={idx === rankList.length - 1}
                              onClick={() => moveItemRank(idx, 'down')}
                              className="p-1 text-stone-400 hover:text-amber-500 hover:bg-stone-100 rounded disabled:opacity-30 disabled:hover:bg-transparent"
                              title="Move Down"
                            >
                              <ChevronDown className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      )}

                      <span className="text-2xl font-black text-amber-500/40 min-w-[2.5rem] text-center font-mono">#{anime.rank}</span>
                      <div>
                        <h3 className="text-lg font-semibold text-stone-900 leading-tight">{anime.title}</h3>
                        {anime.note && <p className="text-sm text-stone-600 italic mt-0.5">"{anime.note}"</p>}
                      </div>
                    </div>

                    {/* Actions */}
                    {!isRearrangingRank && (
                      deletingRankId === anime.id ? (
                        <div className="flex items-center space-x-1.5 shrink-0 bg-red-50 px-2 py-1 rounded-lg border border-red-100">
                          <span className="text-[10px] font-bold text-red-600">Delete?</span>
                          <button
                            onClick={() => {
                              handleDeleteRank(anime.id);
                              setDeletingRankId(null);
                            }}
                            className="px-1.5 py-0.5 bg-red-500 text-white rounded text-[9px] font-bold hover:bg-red-600 transition-colors"
                          >
                            Yes
                          </button>
                          <button
                            onClick={() => setDeletingRankId(null)}
                            className="px-1.5 py-0.5 bg-stone-200 text-stone-700 rounded text-[9px] font-bold hover:bg-stone-300 transition-colors"
                          >
                            No
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-1 opacity-80 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-200 shrink-0">
                          <button
                            onClick={() => executeSecuredAction(
                              () => startEditRank(anime),
                              "Authenticate to Edit",
                              `Verify password to edit "${anime.title}"`
                            )}
                            className="p-1.5 text-stone-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                            title="Edit Item"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => executeSecuredAction(
                              () => setDeletingRankId(anime.id),
                              "Authenticate to Delete",
                              `Verify password to delete "${anime.title}"`
                            )}
                            className="p-1.5 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete Item"
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
          {rankList.length === 0 && (
            <div className="text-center text-stone-400 py-12 border-2 border-dashed border-stone-200 rounded-2xl bg-white italic">
              No ranked anime. Add your favorites above!
            </div>
          )}
        </div>
      </section>

      {/* SECTION 2: Watched Animes */}
      <section className="space-y-8">
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center space-x-3">
              <CheckCircle className="w-8 h-8 text-amber-500" />
              <h2 className="text-2xl font-bold tracking-tight text-black">Watched Animes</h2>
            </div>
            <p className="text-stone-600">Animes I have completed or am currently tracking.</p>
            <div className="w-16 h-1 bg-amber-500 rounded-full"></div>
          </div>

          <div className="flex flex-wrap gap-2 self-start sm:self-center">
            <button
              onClick={() => {
                if (isRearrangingWatched) {
                  setIsRearrangingWatched(false);
                } else {
                  executeSecuredAction(
                    () => {
                      setIsRearrangingWatched(true);
                      setIsAddingWatched(false);
                    },
                    "Authenticate to Rearrange",
                    "Verify password to sort your watched Anime list"
                  );
                }
              }}
              className={`font-medium px-4 py-2 rounded-xl transition-all duration-200 flex items-center gap-2 shadow-sm hover:shadow active:scale-95 text-sm ${
                isRearrangingWatched 
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white' 
                  : 'bg-stone-100 hover:bg-stone-200 text-stone-700'
              }`}
            >
              <ArrowUpDown className="w-4 h-4" />
              {isRearrangingWatched ? 'Done Sorting' : 'Rearrange'}
            </button>

            <button
              onClick={() => {
                if (isAddingWatched) {
                  setIsAddingWatched(false);
                } else {
                  executeSecuredAction(
                    () => {
                      setIsAddingWatched(true);
                      setIsRearrangingWatched(false);
                    },
                    "Authenticate to Add Watched",
                    "Verify password to add a watched Anime"
                  );
                }
              }}
              className="bg-amber-500 hover:bg-amber-600 text-white font-medium px-4 py-2 rounded-xl transition-all duration-200 flex items-center gap-2 shadow-sm hover:shadow active:scale-95 text-sm"
            >
              {isAddingWatched ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
              {isAddingWatched ? 'Cancel' : 'Add Watched'}
            </button>
          </div>
        </header>

        {/* Expandable Add Watched Form */}
        <AnimatePresence>
          {isAddingWatched && (
            <motion.div
              initial={{ opacity: 0, height: 0, y: -10 }}
              animate={{ opacity: 1, height: 'auto', y: 0 }}
              exit={{ opacity: 0, height: 0, y: -10 }}
              className="overflow-hidden bg-white border border-stone-200 rounded-2xl p-6 shadow-sm space-y-4"
            >
              <h3 className="text-lg font-medium text-stone-900 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-500" />
                Add to Watched List
              </h3>
              
              <form onSubmit={handleAddWatchedSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-stone-500 uppercase tracking-wider">Title</label>
                  <input
                    type="text"
                    required
                    value={addWatchedTitle}
                    onChange={e => setAddWatchedTitle(e.target.value)}
                    placeholder="e.g. Frieren: Beyond Journey's End"
                    className="w-full px-4 py-2.5 rounded-xl border border-stone-200 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 bg-stone-50 text-stone-900 transition-colors"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-stone-500 uppercase tracking-wider">Status</label>
                  <select
                    value={addWatchedStatus}
                    onChange={e => setAddWatchedStatus(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-stone-200 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 bg-stone-50 text-stone-900 transition-colors"
                  >
                    <option value="Completed">Completed</option>
                    <option value="Watching">Watching</option>
                    <option value="Incompleted">Incompleted</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-stone-500 uppercase tracking-wider">Thoughts / Notes</label>
                  <input
                    type="text"
                    value={addWatchedNote}
                    onChange={e => setAddWatchedNote(e.target.value)}
                    placeholder="e.g. Masterpiece animation"
                    className="w-full px-4 py-2.5 rounded-xl border border-stone-200 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 bg-stone-50 text-stone-900 transition-colors"
                  />
                </div>

                <div className="md:col-span-3 flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsAddingWatched(false)}
                    className="px-4 py-2 rounded-xl text-stone-500 hover:bg-stone-100 transition-colors text-sm font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-amber-500 hover:bg-amber-600 text-white font-medium px-5 py-2 rounded-xl transition-colors text-sm shadow-sm"
                  >
                    Save Show
                  </button>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="space-y-3">
          {isRearrangingWatched && (
            <motion.div 
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-3 bg-amber-50 border border-amber-200/60 rounded-xl text-stone-700 text-xs flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
              <span>Rearrange mode active: Drag cards by their handles, or use the <strong>↑ / ↓</strong> buttons to sort. Click <strong>Done Sorting</strong> above to save.</span>
            </motion.div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <AnimatePresence initial={false}>
              {watchedList.map((anime, idx) => (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  key={anime.id} 
                  draggable={isRearrangingWatched}
                  onDragStart={(e) => handleDragStartWatched(e, idx)}
                  onDragEnter={(e) => handleDragEnterWatched(e, idx)}
                  onDragEnd={handleDragEndWatched}
                  onDragOver={(e) => e.preventDefault()}
                  className={`p-4 rounded-xl border bg-white shadow-sm flex flex-col justify-between group transition-all duration-200 ${
                    isRearrangingWatched 
                      ? 'border-dashed border-amber-300 hover:bg-amber-50/20 cursor-grab active:cursor-grabbing' 
                      : 'border-stone-100 hover:bg-amber-50/30'
                  }`}
                >
                  {editingWatchedId === anime.id ? (
                    /* Edit Watched Inline */
                    <form onSubmit={(e) => handleEditWatchedSubmit(e, anime.id)} className="w-full space-y-4">
                      <div className="space-y-3">
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-stone-400 uppercase">Title</label>
                          <input
                            type="text"
                            required
                            value={editWatchedTitle}
                            onChange={e => setEditWatchedTitle(e.target.value)}
                            className="w-full px-3 py-1.5 rounded-lg border border-stone-200 focus:outline-none focus:border-amber-500 bg-stone-50 text-sm"
                          />
                        </div>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-stone-400 uppercase">Status</label>
                            <select
                              value={editWatchedStatus}
                              onChange={e => setEditWatchedStatus(e.target.value)}
                              className="w-full px-3 py-1.5 rounded-lg border border-stone-200 focus:outline-none focus:border-amber-500 bg-stone-50 text-sm"
                            >
                              <option value="Completed">Completed</option>
                              <option value="Watching">Watching</option>
                              <option value="Incompleted">Incompleted</option>
                            </select>
                          </div>

                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-stone-400 uppercase">Note</label>
                            <input
                              type="text"
                              value={editWatchedNote}
                              onChange={e => setEditWatchedNote(e.target.value)}
                              className="w-full px-3 py-1.5 rounded-lg border border-stone-200 focus:outline-none focus:border-amber-500 bg-stone-50 text-sm"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="flex justify-end gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => setEditingWatchedId(null)}
                          className="p-1.5 text-stone-400 hover:text-stone-600 hover:bg-stone-100 rounded-lg transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                        <button
                          type="submit"
                          className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white text-xs font-semibold rounded-lg shadow-sm flex items-center gap-1.5"
                        >
                          <Save className="w-3.5 h-3.5" />
                          Save
                        </button>
                      </div>
                    </form>
                  ) : (
                    /* Display Watched Anime Row */
                    <div className="flex items-center justify-between w-full gap-4">
                      <div className="flex items-center gap-3 flex-1">
                        {isRearrangingWatched && (
                          <div className="flex items-center gap-1.5 pr-2 border-r border-stone-100 shrink-0 select-none">
                            <GripVertical className="w-5 h-5 text-stone-400" />
                            <div className="flex flex-col gap-1">
                              <button
                                type="button"
                                disabled={idx === 0}
                                onClick={() => moveItemWatched(idx, 'up')}
                                className="p-1 text-stone-400 hover:text-amber-500 hover:bg-stone-100 rounded disabled:opacity-30 disabled:hover:bg-transparent"
                                title="Move Up"
                              >
                                <ChevronUp className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                disabled={idx === watchedList.length - 1}
                                onClick={() => moveItemWatched(idx, 'down')}
                                className="p-1 text-stone-400 hover:text-amber-500 hover:bg-stone-100 rounded disabled:opacity-30 disabled:hover:bg-transparent"
                                title="Move Down"
                              >
                                <ChevronDown className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        )}

                        <div className="flex-1">
                          <div className="flex items-center space-x-2.5 flex-wrap gap-y-1">
                            <h3 className="font-semibold text-stone-900 leading-tight">{anime.title}</h3>
                            {anime.status && (
                              <span className={`px-2.5 py-0.5 text-[10px] rounded-full font-semibold tracking-wide ${
                                anime.status === 'Completed' ? 'bg-green-100 text-green-700' : 
                                anime.status === 'Watching' ? 'bg-blue-100 text-blue-700' :
                                'bg-amber-100 text-amber-800'
                              }`}>
                                {anime.status}
                              </span>
                            )}
                          </div>
                          {anime.note && <p className="text-xs text-stone-500 italic mt-1">"{anime.note}"</p>}
                        </div>
                      </div>

                      {/* Actions */}
                      {!isRearrangingWatched && (
                        deletingWatchedId === anime.id ? (
                          <div className="flex items-center space-x-1.5 shrink-0 bg-red-50 px-2 py-1 rounded-lg border border-red-100">
                            <span className="text-[10px] font-bold text-red-600">Delete?</span>
                            <button
                              onClick={() => {
                                handleDeleteWatched(anime.id);
                                setDeletingWatchedId(null);
                              }}
                              className="px-1.5 py-0.5 bg-red-500 text-white rounded text-[9px] font-bold hover:bg-red-600 transition-colors"
                            >
                              Yes
                            </button>
                            <button
                              onClick={() => setDeletingWatchedId(null)}
                              className="px-1.5 py-0.5 bg-stone-200 text-stone-700 rounded text-[9px] font-bold hover:bg-stone-300 transition-colors"
                            >
                              No
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center space-x-0.5 opacity-80 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-200 shrink-0">
                            <button
                              onClick={() => executeSecuredAction(
                                () => startEditWatched(anime),
                                "Authenticate to Edit",
                                `Verify password to edit "${anime.title}"`
                              )}
                              className="p-1.5 text-stone-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                              title="Edit Item"
                            >
                              <Pencil className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => executeSecuredAction(
                                () => setDeletingWatchedId(anime.id),
                                "Authenticate to Delete",
                                `Verify password to delete "${anime.title}"`
                              )}
                              className="p-1.5 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Delete Item"
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
          </div>
        </div>
        {watchedList.length === 0 && (
          <div className="text-center text-stone-400 py-12 border-2 border-dashed border-stone-200 rounded-2xl bg-white italic">
            Watched list is empty. Add shows above to start tracking!
          </div>
        )}
      </section>

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
