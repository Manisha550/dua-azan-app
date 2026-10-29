import React, { useState, useRef, useEffect } from 'react';
import {
  Search,
  Star,
  Copy,
  Check,
  RotateCcw,
  Plus,
  BookOpen,
  Volume2,
  Share2,
  Sparkles,
  ShieldAlert,
  ArrowRight,
  UserCheck,
  CheckCircle2,
} from 'lucide-react';
import { Dua, UserSession } from '../types';
import { audioService } from '../services/audioService';

interface DuaSectionProps {
  duas: Dua[];
  favorites: string[];
  onToggleFavorite: (id: string) => void;
  onAddCustomDua: (newDua: Dua) => void;
  fontSize: 'normal' | 'large';
  currentUser?: UserSession | null;
  unverifiedCount?: number;
  onNavigateToAudit?: () => void;
}

const ARABIC_QUICK_PHRASES = [
  { label: 'رَبَّنَا', text: 'رَبَّنَا ' },
  { label: 'اللَّهُمَّ', text: 'اللَّهُمَّ ' },
  { label: 'بِسْمِ اللَّهِ', text: 'بِسْمِ اللَّهِ ' },
  { label: 'الْحَمْدُ لِلَّهِ', text: 'الْحَمْدُ لِلَّهِ ' },
  { label: 'لَا إِلَٰهَ إِلَّا اللَّهُ', text: 'لَا إِلَٰهَ إِلَّا اللَّهُ ' },
  { label: 'أَسْتَغْفِرُ اللَّهَ', text: 'أَسْتَغْفِرُ اللَّهَ ' },
  { label: 'سُبْحَانَ اللَّهِ', text: 'سُبْحَانَ اللَّهِ ' },
  { label: 'ﷺ', text: ' ﷺ ' },
];

const CITATION_PRESETS = [
  'Sahih al-Bukhari',
  'Sahih Muslim',
  'Jami at-Tirmidhi',
  'Sunan Abi Dawud',
  'Sunan an-Nasa\'i',
  'Sunan Ibn Majah',
  'Quran 2:255',
];

export const DuaSection: React.FC<DuaSectionProps> = ({
  duas,
  favorites,
  onToggleFavorite,
  onAddCustomDua,
  fontSize,
  currentUser,
  unverifiedCount = 0,
  onNavigateToAudit,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [counters, setCounters] = useState<Record<string, number>>({});
  const [showAddModal, setShowAddModal] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const arabicInputRef = useRef<HTMLTextAreaElement>(null);

  // Focus search with '/' shortcut for Windows & Desktop users
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '/' && document.activeElement !== searchInputRef.current) {
        const target = e.target as HTMLElement;
        if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA')) return;
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Add Dua Form State
  const [newArabic, setNewArabic] = useState('');
  const [newBengali, setNewBengali] = useState('');
  const [newCategory, setNewCategory] = useState('সাধারণ');
  const [newSourceType, setNewSourceType] = useState<'quran' | 'hadith'>('hadith');
  const [newSourceRef, setNewSourceRef] = useState('');
  const [newSourceAyahs, setNewSourceAyahs] = useState('');
  const [newContext, setNewContext] = useState('');
  const [newRepetition, setNewRepetition] = useState('১ বার');
  const [newSubmitter, setNewSubmitter] = useState(currentUser?.name || '');
  const [instantVerify, setInstantVerify] = useState(true);

  // Synchronize submitter name if current user changes
  useEffect(() => {
    if (currentUser?.name && !newSubmitter) {
      setNewSubmitter(currentUser.name);
    }
  }, [currentUser, newSubmitter]);

  // Increment counter for a specific dua
  const handleIncrement = (id: string) => {
    setCounters((prev) => ({
      ...prev,
      [id]: (prev[id] || 0) + 1,
    }));
    audioService.vibrate([35]);
    audioService.playAcousticTone(784, 0.08, 0.15);
  };

  const handleResetCounter = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setCounters((prev) => ({
      ...prev,
      [id]: 0,
    }));
    audioService.vibrate([25]);
  };

  // Copy dua to clipboard
  const handleCopy = (dua: Dua) => {
    const text = `${dua.arabic}\n\n${dua.bengali}\n\nউৎস: ${dua.source.ref}\nযখন পড়বেন: ${dua.context}\nকতবার: ${dua.repetition}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedId(dua.id);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  // Audio Speech Pronunciation
  const handlePronounce = (arabicText: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(arabicText);
      utterance.lang = 'ar-SA';
      utterance.rate = 0.85;
      window.speechSynthesis.speak(utterance);
    } else {
      audioService.playSynthesizedAdhan();
    }
  };

  // Insert Arabic phrase helper
  const handleInsertArabicPhrase = (phrase: string) => {
    setNewArabic((prev) => prev + phrase);
    arabicInputRef.current?.focus();
  };

  // Categories list
  const uniqueCategories = Array.from(new Set(duas.map((d) => d.category)));
  const categoryChips = [
    { key: 'all', label: 'সব দোয়া', count: duas.length },
    { key: 'fav', label: '★ প্রিয়', count: favorites.length },
    ...uniqueCategories.map((c) => ({
      key: c,
      label: c,
      count: duas.filter((d) => d.category === c).length,
    })),
  ];

  // Filtered duas
  const filteredDuas = duas.filter((d) => {
    const matchesCategory =
      selectedCategory === 'all' ||
      (selectedCategory === 'fav' ? favorites.includes(d.id) : d.category === selectedCategory);

    if (!matchesCategory) return false;

    if (!searchTerm.trim()) return true;
    const q = searchTerm.toLowerCase();
    return (
      d.bengali.toLowerCase().includes(q) ||
      d.arabic.includes(q) ||
      d.context.toLowerCase().includes(q) ||
      d.category.toLowerCase().includes(q) ||
      d.source.ref.toLowerCase().includes(q)
    );
  });

  // Handle Add Dua Form Submit
  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const ayahsList = newSourceAyahs
      ? newSourceAyahs.split(',').map((s) => s.trim()).filter(Boolean)
      : undefined;

    const submitterName = newSubmitter.trim() || (currentUser?.name ? currentUser.name : 'কমিউনিটি সদস্য');

    const newDuaItem: Dua = {
      id: `custom-${Date.now().toString(36)}`,
      category: newCategory.trim() || 'সাধারণ',
      status: instantVerify ? 'verified' : 'needs_verification',
      arabic: newArabic.trim(),
      bengali: newBengali.trim(),
      source: {
        type: newSourceType,
        ref: newSourceRef.trim(),
        ayahs: ayahsList,
      },
      context: newContext.trim(),
      repetition: newRepetition.trim(),
      isCustom: true,
      submittedBy: submitterName,
      verifiedBy: instantVerify ? (currentUser?.name || 'ব্যবহারকারী') : undefined,
      verifiedAt: instantVerify
        ? new Date().toLocaleDateString('bn-BD', { year: 'numeric', month: 'long', day: 'numeric' })
        : undefined,
    };

    onAddCustomDua(newDuaItem);
    setShowAddModal(false);

    // Reset form
    setNewArabic('');
    setNewBengali('');
    setNewSourceRef('');
    setNewSourceAyahs('');
    setNewContext('');
    setNewRepetition('১ বার');
  };

  return (
    <div className="space-y-5 animate-fadeIn">
      {/* Pending Duas Audit Notice Banner if any unverified duas exist */}
      {unverifiedCount > 0 && onNavigateToAudit && (
        <div className="p-3.5 sm:p-4 rounded-2xl bg-amber-500/10 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs animate-fadeIn">
          <div className="flex items-center gap-2.5">
            <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0" />
            <div>
              <p className="font-bold text-slate-800 dark:text-slate-100">
                {unverifiedCount}টি দোয়া যাচাই ও অনুমোদনের অপেক্ষায় রয়েছে
              </p>
              <p className="text-[11px] text-slate-600 dark:text-slate-400">
                যেকোনো ব্যবহারকারী অডিট সেকশনে গিয়ে হাদিস/কুরআনের রেফারেন্স পরীক্ষা করে অনুমোদন করতে পারেন।
              </p>
            </div>
          </div>
          <button
            onClick={onNavigateToAudit}
            className="self-start sm:self-center flex items-center gap-1.5 py-1.5 px-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold transition text-xs whitespace-nowrap cursor-pointer shadow-xs"
          >
            <span>যাচাইকরণ অডিটে যান</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Top Banner & Search */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-4 sm:p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mb-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-teal-600 dark:text-teal-400" />
              সহীহ ও যাচাইকৃত দোয়া ভাণ্ডার
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              কুরআন ও বিশুদ্ধ হাদিস (বুখারী, মুসলিম, তিরমিযী) থেকে সংগৃহীত {duas.length}টি যাচাইকৃত দোয়া।
            </p>
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs sm:text-sm font-bold transition cursor-pointer shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>নতুন দোয়া যোগ করুন</span>
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            ref={searchInputRef}
            type="search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="দোয়ার অর্থ, আরবি, উৎস (বুখারী/কুরআন) বা পরিস্থিতি দিয়ে খুঁজুন..."
            className="w-full pl-10 pr-12 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/60 text-slate-900 dark:text-slate-100 placeholder-slate-400 text-sm focus:outline-hidden focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 transition"
          />
          <kbd className="hidden sm:inline-flex items-center justify-center absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-mono py-0.5 px-1.5 rounded-md border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-slate-400 select-none pointer-events-none">
            /
          </kbd>
        </div>

        {/* Category Filter Chips */}
        <div className="flex items-center gap-2 mt-3.5 overflow-x-auto pb-1 no-scrollbar">
          {categoryChips.map((chip) => (
            <button
              key={chip.key}
              onClick={() => setSelectedCategory(chip.key)}
              className={`py-1.5 px-3 rounded-xl text-xs font-medium whitespace-nowrap transition cursor-pointer flex items-center gap-1.5 ${
                selectedCategory === chip.key
                  ? 'bg-teal-700 text-white font-semibold shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              <span>{chip.label}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                  selectedCategory === chip.key
                    ? 'bg-white/20 text-white'
                    : 'bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400'
                }`}
              >
                {chip.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Duas List */}
      <div className="space-y-4">
        {filteredDuas.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 space-y-2">
            <Sparkles className="w-10 h-10 text-slate-300 mx-auto" />
            <h3 className="text-base font-semibold text-slate-700 dark:text-slate-200">
              কোনো দোয়া পাওয়া যায়নি
            </h3>
            <p className="text-xs text-slate-400">
              অন্য কোনো শব্দ দিয়ে খুঁজুন অথবা উপরে &ldquo;নতুন দোয়া যোগ করুন&rdquo; বাটনে ক্লিক করে যোগ করুন।
            </p>
          </div>
        ) : (
          filteredDuas.map((dua) => {
            const count = counters[dua.id] || 0;
            const isFav = favorites.includes(dua.id);

            return (
              <article
                key={dua.id}
                className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800/90 rounded-3xl p-5 sm:p-6 shadow-xs hover:border-teal-500/40 transition-all group space-y-4"
              >
                {/* Dua Header Info */}
                <div className="flex items-center justify-between gap-3 text-xs">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-lg bg-teal-50 dark:bg-teal-950/80 text-teal-700 dark:text-teal-300 font-semibold text-[11px]">
                      {dua.category}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-medium text-[11px]">
                      {dua.source.ref}
                    </span>
                    {dua.submittedBy && (
                      <span className="text-[10px] text-slate-400 flex items-center gap-1">
                        যুক্ত করেছেন: {dua.submittedBy}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handlePronounce(dua.arabic)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-teal-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                      title="আরবি উচ্চারণ শুনুন"
                    >
                      <Volume2 className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => onToggleFavorite(dua.id)}
                      className={`p-1.5 rounded-lg transition cursor-pointer ${
                        isFav
                          ? 'text-amber-500 hover:text-amber-600'
                          : 'text-slate-400 hover:text-amber-500 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                      title={isFav ? 'প্রিয় তালিকা থেকে বাদ দিন' : 'প্রিয় তালিকায় যোগ করুন'}
                    >
                      <Star className={`w-4 h-4 ${isFav ? 'fill-current' : ''}`} />
                    </button>
                  </div>
                </div>

                {/* Arabic Text */}
                <div className="text-right">
                  <p
                    dir="rtl"
                    className={`font-arabic text-teal-950 dark:text-teal-100 leading-loose select-text ${
                      fontSize === 'large' ? 'text-2xl sm:text-3xl' : 'text-xl sm:text-2xl'
                    }`}
                  >
                    {dua.arabic}
                  </p>
                </div>

                {/* Bengali Meaning */}
                <div className="pt-1">
                  <p
                    className={`text-slate-800 dark:text-slate-200 font-normal leading-relaxed ${
                      fontSize === 'large' ? 'text-base sm:text-lg' : 'text-sm sm:text-base'
                    }`}
                  >
                    {dua.bengali}
                  </p>
                </div>

                {/* Context & Recitation Guide */}
                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200/60 dark:border-slate-800/60 text-xs text-slate-600 dark:text-slate-400 space-y-1">
                  <div className="flex items-start gap-1.5">
                    <span className="font-semibold text-slate-700 dark:text-slate-300 shrink-0">
                      কখন পড়বেন:
                    </span>
                    <span>{dua.context}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-semibold text-slate-700 dark:text-slate-300">
                      পুনরাবৃত্তি:
                    </span>
                    <span className="font-mono text-teal-700 dark:text-teal-300">
                      {dua.repetition}
                    </span>
                  </div>
                </div>

                {/* Action Bar (Counter, Reset, Copy) */}
                <div className="flex items-center justify-between gap-3 pt-1 border-t border-slate-100 dark:border-slate-800/80">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleIncrement(dua.id)}
                      className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-teal-50 dark:bg-teal-950/80 hover:bg-teal-100 text-teal-800 dark:text-teal-200 text-xs font-bold transition cursor-pointer active:scale-95"
                    >
                      <span>পাঠ করেছেন</span>
                      <span className="px-2 py-0.5 rounded-lg bg-teal-700 text-white font-mono text-xs">
                        {count}
                      </span>
                    </button>

                    {count > 0 && (
                      <button
                        onClick={(e) => handleResetCounter(dua.id, e)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition cursor-pointer"
                        title="কাউন্টার রিসেট করুন"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  <button
                    onClick={() => handleCopy(dua)}
                    className="flex items-center gap-1.5 py-1.5 px-3 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-medium transition cursor-pointer"
                  >
                    {copiedId === dua.id ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="text-emerald-600 font-semibold">কপি হয়েছে</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>কপি করুন</span>
                      </>
                    )}
                  </button>
                </div>
              </article>
            );
          })
        )}
      </div>

      {/* Add Custom Dua Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs animate-fadeIn">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 border border-teal-500/30 rounded-3xl p-6 shadow-2xl relative max-h-[92vh] overflow-y-auto text-slate-800 dark:text-slate-100">
            <h3 className="text-xl font-bold mb-1 flex items-center gap-2 text-teal-700 dark:text-teal-400">
              <Plus className="w-5 h-5" />
              নতুন দোয়া যুক্ত করুন
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              যেকোনো মুসলিম নতুন কুরআন বা হাদিসের দোয়া যুক্ত করতে পারেন। সঠিক রেফারেন্স সহকারে পূরণ করলে অবিলম্বে মূল সংগ্রহে যোগ হবে।
            </p>

            <form onSubmit={handleAddSubmit} className="space-y-3.5">
              {/* Submitter Name */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  আপনার নাম / পরিচয়
                </label>
                <input
                  type="text"
                  value={newSubmitter}
                  onChange={(e) => setNewSubmitter(e.target.value)}
                  placeholder="যেমন: মুহাম্মদ আবদুল্লাহ (ঐচ্ছিক)"
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-sm focus:ring-2 focus:ring-teal-500/20"
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  ক্যাটাগরি *
                </label>
                <input
                  type="text"
                  required
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  placeholder="যেমন: সাধারণ, ক্ষমা, রিজিক, অসুস্থতা, পিতা-মাতা"
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-sm focus:ring-2 focus:ring-teal-500/20"
                />
              </div>

              {/* Arabic Text with Quick Phrase Helpers */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300">
                    আরবি পাঠ (হরকতসহ) *
                  </label>
                  <span className="text-[10px] text-teal-600 dark:text-teal-400">
                    সহজ ইনসার্ট ট্যাপ করুন:
                  </span>
                </div>

                {/* Quick Arabic insertion chips */}
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {ARABIC_QUICK_PHRASES.map((chip, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleInsertArabicPhrase(chip.text)}
                      className="px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-teal-100 dark:hover:bg-teal-950 text-slate-700 dark:text-slate-200 font-arabic text-xs cursor-pointer transition border border-slate-200 dark:border-slate-700"
                    >
                      {chip.label}
                    </button>
                  ))}
                </div>

                <textarea
                  ref={arabicInputRef}
                  required
                  rows={3}
                  dir="rtl"
                  value={newArabic}
                  onChange={(e) => setNewArabic(e.target.value)}
                  placeholder="رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً..."
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-arabic text-lg text-right focus:ring-2 focus:ring-teal-500/20"
                />
              </div>

              {/* Bengali Translation */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  বাংলা অনুবাদ *
                </label>
                <textarea
                  required
                  rows={2}
                  value={newBengali}
                  onChange={(e) => setNewBengali(e.target.value)}
                  placeholder="হে আমাদের প্রতিপালক, আমাদের দুনিয়াতে কল্যাণ দান করুন..."
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-sm focus:ring-2 focus:ring-teal-500/20"
                />
              </div>

              {/* Source Type & Ref */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                    উৎসের ধরন (Source Type)
                  </label>
                  <select
                    value={newSourceType}
                    onChange={(e) => setNewSourceType(e.target.value as 'quran' | 'hadith')}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-sm focus:ring-2 focus:ring-teal-500/20"
                  >
                    <option value="hadith">হাদিস (Hadith)</option>
                    <option value="quran">কুরআন (Quran)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                    রেফারেন্স (কিতাব ও নম্বর) *
                  </label>
                  <input
                    type="text"
                    required
                    value={newSourceRef}
                    onChange={(e) => setNewSourceRef(e.target.value)}
                    placeholder="যেমন: Sahih al-Bukhari 6389"
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-sm focus:ring-2 focus:ring-teal-500/20"
                  />
                </div>
              </div>

              {/* Quick citation presets */}
              <div className="flex flex-wrap gap-1.5">
                <span className="text-[10px] text-slate-400 self-center">প্রামাণ্য উদাহরণ:</span>
                {CITATION_PRESETS.map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setNewSourceRef(preset)}
                    className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-[10px] text-slate-600 dark:text-slate-300 hover:bg-teal-50 dark:hover:bg-teal-950 border border-slate-200 dark:border-slate-700 cursor-pointer"
                  >
                    {preset}
                  </button>
                ))}
              </div>

              {newSourceType === 'quran' && (
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                    কুরআন সূরা ও আয়াত নম্বর (যেমন: 2:201, 20:25) *
                  </label>
                  <input
                    type="text"
                    required
                    value={newSourceAyahs}
                    onChange={(e) => setNewSourceAyahs(e.target.value)}
                    placeholder="2:201"
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-sm"
                  />
                </div>
              )}

              {/* Context & Repetition */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                    কখন পড়তে হবে *
                  </label>
                  <input
                    type="text"
                    required
                    value={newContext}
                    onChange={(e) => setNewContext(e.target.value)}
                    placeholder="যেমন: সকালে ও সন্ধ্যায়"
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                    পাঠের সংখ্যা *
                  </label>
                  <input
                    type="text"
                    required
                    value={newRepetition}
                    onChange={(e) => setNewRepetition(e.target.value)}
                    placeholder="যেমন: ১ বার / ৩ বার / যতবার ইচ্ছা"
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-sm"
                  />
                </div>
              </div>

              {/* Instant Verification Checkbox */}
              <div className="p-3 rounded-xl bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800/60 flex items-start gap-2.5">
                <input
                  type="checkbox"
                  id="instantVerifyCheckbox"
                  checked={instantVerify}
                  onChange={(e) => setInstantVerify(e.target.checked)}
                  className="mt-0.5 rounded text-teal-600 focus:ring-teal-500 cursor-pointer"
                />
                <label htmlFor="instantVerifyCheckbox" className="text-xs text-slate-700 dark:text-slate-300 cursor-pointer select-none">
                  <span className="font-bold text-teal-900 dark:text-teal-200 block">
                    সরাসরি যাচাই ও প্রকাশ করুন (Verified &amp; Published)
                  </span>
                  আমি নিশ্চিত করছি যে এই রেফারেন্সটি সত্য ও বিশুদ্ধ। আনচেক করলে দোয়াটি অডিট সেকশনে পর্যালোচনার জন্য সংরক্ষিত থাকবে।
                </label>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="py-2.5 px-4 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="py-2.5 px-5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold transition cursor-pointer shadow-xs"
                >
                  দোয়া সংরক্ষণ ও প্রকাশ করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
