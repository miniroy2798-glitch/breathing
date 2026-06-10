import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { Save, Bold, Italic, Underline, PenTool, CheckCircle2, Bookmark, FileText } from 'lucide-react';

interface Story {
  id: string;
  title: string;
  content: string; // HTML string
  lastModified: string;
  progress: number;
}

export function StoryEditor() {
  const [stories, setStories] = useState<Story[]>([]);
  const [currentId, setCurrentId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const editorRef = useRef<HTMLDivElement>(null);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');

  useEffect(() => {
    const saved = localStorage.getItem('app_stories');
    if (saved) {
      const parsed = JSON.parse(saved);
      setStories(parsed);
      
      // Auto-resume from the last edited story if it exists
      const lastEditedId = localStorage.getItem('app_last_edited_story');
      if (lastEditedId && parsed.find((s: Story) => s.id === lastEditedId)) {
        loadStory(lastEditedId, parsed);
      }
    }
  }, []);

  const saveProgress = () => {
    setSaveStatus('saving');
    
    // Calculate progress based on a rough word count goal of 500 words per chapter/story
    const content = editorRef.current?.innerHTML || '';
    const textContent = editorRef.current?.innerText || '';
    
    // Calculate word count ignoring zero length words
    const words = textContent.trim().split(/\s+/).filter(w => w.length > 0);
    const wordCount = words.length;
    const progressPerc = Math.min(100, Math.round((wordCount / 500) * 100));

    const newStory: Story = {
      id: currentId || Date.now().toString(),
      title: title || 'Untitled Story',
      content: content,
      lastModified: new Date().toISOString(),
      progress: progressPerc,
    };

    let updatedStories = [...stories];
    if (currentId) {
      updatedStories = updatedStories.map(s => s.id === currentId ? newStory : s);
    } else {
      updatedStories.unshift(newStory);
    }
    
    setStories(updatedStories);
    setCurrentId(newStory.id);
    localStorage.setItem('app_stories', JSON.stringify(updatedStories));
    localStorage.setItem('app_last_edited_story', newStory.id);
    
    setTimeout(() => setSaveStatus('saved'), 500);
    setTimeout(() => setSaveStatus('idle'), 2000);
  };

  const loadStory = (id: string, customStoriesList: Story[] = stories) => {
    const story = customStoriesList.find(s => s.id === id);
    if (story) {
      setCurrentId(story.id);
      setTitle(story.title);
      localStorage.setItem('app_last_edited_story', story.id);
      if (editorRef.current) {
        editorRef.current.innerHTML = story.content;
      }
    }
  };

  const createNew = () => {
    setCurrentId(null);
    setTitle('');
    localStorage.removeItem('app_last_edited_story');
    if (editorRef.current) {
      editorRef.current.innerHTML = '';
      editorRef.current.focus();
    }
  };

  const execCommand = (command: string) => {
    document.execCommand(command, false, '');
    editorRef.current?.focus();
  };

  const currentStory = stories.find(s => s.id === currentId);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 flex flex-col h-full"
      style={{ minHeight: 'calc(100vh - 8rem)' }}
    >
      <header className="space-y-4">
        <div className="flex items-center space-x-3">
          <PenTool className="w-8 h-8 text-amber-500" />
          <h2 className="text-3xl font-bold tracking-tight text-black">Story Editor</h2>
        </div>
        <p className="text-stone-600 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <span>Write, edit, and save your narratives. Auto-tracks writing progress.</span>
        </p>
        <div className="w-16 h-1 bg-amber-500 rounded-full"></div>
      </header>

      <div className="flex flex-col lg:flex-row gap-6 flex-1 min-h-[500px]">
        {/* Sidebar: Projects / Checkpoints */}
        <div className="w-full lg:w-1/3 xl:w-1/4 bg-white border border-stone-100 drop-shadow-sm rounded-xl p-4 flex flex-col gap-4">
          <button 
            onClick={createNew}
            className="w-full bg-stone-900 hover:bg-stone-800 text-white font-medium py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
          >
            <FileText className="w-4 h-4" />
            New Draft
          </button>
          
          <div className="flex-1 overflow-y-auto space-y-2 pr-2">
            {stories.map(story => (
              <div 
                key={story.id} 
                className={`p-4 rounded-xl cursor-pointer border transition-colors ${currentId === story.id ? 'bg-amber-50 border-amber-200' : 'bg-stone-50 border-stone-100 hover:bg-stone-100'}`}
                onClick={() => loadStory(story.id)}
              >
                <h4 className="font-medium text-stone-900 truncate mb-2">{story.title || 'Untitled'}</h4>
                <div className="flex flex-col gap-2">
                  <div className="flex justify-between items-center text-xs text-stone-500">
                    <span>{new Date(story.lastModified).toLocaleDateString()}</span>
                    <span className="font-mono text-amber-600">{story.progress}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-stone-200 rounded-full overflow-hidden">
                    <div className="h-full bg-amber-500 transition-all duration-500" style={{ width: `${story.progress}%` }} />
                  </div>
                </div>
              </div>
            ))}
            {stories.length === 0 && (
              <div className="text-center text-stone-400 py-12 text-sm italic font-serif">
                No saved drafts found.<br/>Start writing to create a checkpoint!
              </div>
            )}
          </div>
        </div>

        {/* Editor Engine */}
        <div className="w-full lg:w-2/3 xl:w-3/4 bg-white border border-stone-100 drop-shadow-sm rounded-xl flex flex-col overflow-hidden">
          {/* Action Toolbar */}
          <div className="border-b border-stone-100 p-3 sm:p-4 flex flex-wrap gap-3 items-center bg-stone-50 justify-between">
            <div className="flex gap-1 bg-white p-1 rounded-lg border border-stone-200 drop-shadow-sm">
              <button onClick={() => execCommand('bold')} className="p-2 hover:bg-stone-100 rounded text-stone-700 transition-colors focus:bg-stone-200" title="Bold">
                <Bold className="w-4 h-4" />
              </button>
              <button onClick={() => execCommand('italic')} className="p-2 hover:bg-stone-100 rounded text-stone-700 transition-colors focus:bg-stone-200" title="Italic">
                <Italic className="w-4 h-4" />
              </button>
              <button onClick={() => execCommand('underline')} className="p-2 hover:bg-stone-100 rounded text-stone-700 transition-colors focus:bg-stone-200" title="Underline">
                <Underline className="w-4 h-4" />
              </button>
            </div>
            
            <div className="flex items-center gap-4">
              {currentStory && (
                <div className="hidden sm:flex items-center gap-2 text-xs font-medium text-stone-500 bg-white px-3 py-1.5 rounded-full border border-stone-200">
                  <Bookmark className="w-3.5 h-3.5 text-amber-500" />
                  <span>{currentStory.progress}% Word Goal</span>
                </div>
              )}
              <button 
                onClick={saveProgress}
                className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white px-5 py-2 rounded-lg font-medium transition-colors text-sm shadow-sm"
              >
                {saveStatus === 'saved' ? <CheckCircle2 className="w-4 h-4" /> : <Save className="w-4 h-4" />}
                {saveStatus === 'saving' ? 'Saving...' : saveStatus === 'saved' ? 'Saved' : 'Save Checkpoint'}
              </button>
            </div>
          </div>
          
          {/* Content Area */}
          <div className="p-6 sm:p-8 flex-1 flex flex-col overflow-y-auto bg-white">
            <input 
              type="text" 
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (saveStatus === 'saved') setSaveStatus('idle');
              }}
              placeholder="Enter Story Title..."
              className="text-2xl sm:text-3xl font-bold border-none outline-none text-stone-900 bg-transparent placeholder-stone-300 mb-6"
            />
            <div 
              ref={editorRef}
              className="flex-1 outline-none text-stone-800 leading-relaxed font-serif text-lg min-h-[300px] __editor-content"
              contentEditable
              suppressContentEditableWarning
              onInput={() => {
                 if (saveStatus === 'saved') setSaveStatus('idle');
              }}
            />
            
            {/* Custom placeholder injection using CSS in a style tag */}
            <style dangerouslySetInnerHTML={{__html: `
              .__editor-content:empty:before {
                content: "Begin your narrative journey here...";
                color: #cbd5e1;
                pointer-events: none;
                display: block;
              }
            `}} />
          </div>
        </div>
      </div>
    </motion.div>
  );
}
