import React, { useState } from 'react';
import {
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  ExternalLink,
  Info,
  Edit3,
  Trash2,
  Check,
  Zap,
  UserCheck,
  BookOpen,
  X,
  PlusCircle,
} from 'lucide-react';
import { Dua, UserSession } from '../types';
import { checkSchemaProblems, evaluateAuthenticity } from '../data/duas';

interface AuditSectionProps {
  allDuas: Dua[];
  onUpdateDua: (updatedDua: Dua) => void;
  onDeleteDua: (id: string) => void;
  onVerifyDua: (id: string, verifierName?: string) => void;
  onAutoVerify: (verifierName?: string) => void;
  currentUser?: UserSession | null;
  onOpenAddModal?: () => void;
}

export const AuditSection: React.FC<AuditSectionProps> = ({
  allDuas,
  onUpdateDua,
  onDeleteDua,
  onVerifyDua,
  onAutoVerify,
  currentUser,
  onOpenAddModal,
}) => {
  const [activeTab, setActiveTab] = useState<'needs_verification' | 'verified' | 'all'>('needs_verification');
  const [isAuditing, setIsAuditing] = useState(false);
  const [auditMessage, setAuditMessage] = useState<string | null>(null);

  // Edit Dua modal state
  const [editingDua, setEditingDua] = useState<Dua | null>(null);
  const [editArabic, setEditArabic] = useState('');
  const [editBengali, setEditBengali] = useState('');
  const [editCategory, setEditCategory] = useState('');
  const [editSourceType, setEditSourceType] = useState<'quran' | 'hadith' | 'other'>('hadith');
  const [editSourceRef, setEditSourceRef] = useState('');
  const [editSourceAyahs, setEditSourceAyahs] = useState('');
  const [editContext, setEditContext] = useState('');
  const [editRepetition, setEditRepetition] = useState('');

  // Compute audit status for all duas
  const auditedDuas = allDuas.map((d) => {
    const problems = checkSchemaProblems(d);
    const authCheck = evaluateAuthenticity(d);
    const isOk = d.status === 'verified' && problems.length === 0;
    return {
      ...d,
      isVerified: isOk,
      problems,
      authCheck,
    };
  });

  const verifiedList = auditedDuas.filter((d) => d.isVerified);
  const unverifiedList = auditedDuas.filter((d) => !d.isVerified);

  const handleRunAudit = () => {
    setIsAuditing(true);
    setTimeout(() => {
      setIsAuditing(false);
      setAuditMessage(
        `অডিট সমাপ্ত: মোট ${allDuas.length}টি দোয়ার মধ্যে ${verifiedList.length}টি শতভাগ যাচাইকৃত ও সক্রিয়, এবং ${unverifiedList.length}টি দোয়ার পর্যালোচনা/যাচাই প্রয়োজন।`
      );
      setTimeout(() => setAuditMessage(null), 6000);
    }, 600);
  };

  const handleTriggerAutoVerify = () => {
    const verifier = currentUser ? currentUser.name : 'অটো ভেরিফায়ার';
    onAutoVerify(verifier);
    setAuditMessage('স্বয়ংক্রিয় ভেরিফিকেশন স্ক্যান সম্পন্ন হয়েছে! যোগ্য রেফারেন্সযুক্ত দোয়া যাচাইকৃত তালিকায় উত্তীর্ণ করা হয়েছে।');
    setTimeout(() => setAuditMessage(null), 5000);
  };

  const handleSingleVerify = (duaId: string) => {
    const verifier = currentUser ? currentUser.name : 'কমিউনিটি যাচাইকারী';
    onVerifyDua(duaId, verifier);
    setAuditMessage('দোয়াটি সফলভাবে যাচাই ও অনুমোদিত হয়েছে এবং মূল ভাণ্ডারে যুক্ত হয়েছে!');
    setTimeout(() => setAuditMessage(null), 4000);
  };

  const handleOpenEdit = (d: Dua) => {
    setEditingDua(d);
    setEditArabic(d.arabic || '');
    setEditBengali(d.bengali || '');
    setEditCategory(d.category || 'সাধারণ');
    setEditSourceType(d.source?.type || 'hadith');
    setEditSourceRef(d.source?.ref || '');
    setEditSourceAyahs(d.source?.ayahs ? d.source.ayahs.join(', ') : '');
    setEditContext(d.context || '');
    setEditRepetition(d.repetition || '১ বার');
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDua) return;

    const ayahsList = editSourceAyahs
      ? editSourceAyahs.split(',').map((s) => s.trim()).filter(Boolean)
      : undefined;

    const updated: Dua = {
      ...editingDua,
      arabic: editArabic.trim(),
      bengali: editBengali.trim(),
      category: editCategory.trim() || 'সাধারণ',
      source: {
        type: editSourceType,
        ref: editSourceRef.trim(),
        ayahs: ayahsList,
      },
      context: editContext.trim(),
      repetition: editRepetition.trim(),
    };

    onUpdateDua(updated);
    setEditingDua(null);
    setAuditMessage('দোয়ার তথ্য সফলভাবে হালনাগাদ করা হয়েছে!');
    setTimeout(() => setAuditMessage(null), 4000);
  };

  const displayedList =
    activeTab === 'needs_verification'
      ? unverifiedList
      : activeTab === 'verified'
      ? verifiedList
      : auditedDuas;

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Rule & Audit Notice Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-teal-100 dark:bg-teal-950 text-teal-700 dark:text-teal-400 flex items-center justify-center font-bold">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                দোয়া যাচাইকরণ ও অডিট সিস্টেম
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                যে কেউ নতুন দোয়া যোগ করতে পারেন এবং নির্ভরযোগ্য রেফারেন্স যাচাই করে অনুমোদন করতে পারেন।
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleTriggerAutoVerify}
              className="flex items-center justify-center gap-1.5 py-2 px-3.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs sm:text-sm font-bold transition cursor-pointer shadow-xs whitespace-nowrap"
              title="রেফারেন্স ঠিক থাকা দোয়াগুলো স্বয়ংক্রিয় যাচাই করুন"
            >
              <Zap className="w-4 h-4 text-slate-950" />
              <span>রেফারেন্স অটো-ভেরিফাই</span>
            </button>

            <button
              onClick={handleRunAudit}
              disabled={isAuditing}
              className="flex items-center justify-center gap-1.5 py-2 px-3.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs sm:text-sm font-semibold transition cursor-pointer shadow-xs whitespace-nowrap"
            >
              <RefreshCw className={`w-4 h-4 ${isAuditing ? 'animate-spin' : ''}`} />
              <span>{isAuditing ? 'যাচাই করা হচ্ছে...' : 'অডিট চালান'}</span>
            </button>
          </div>
        </div>

        {/* Audit Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/60 flex items-center justify-between">
            <span className="text-xs font-medium text-slate-600 dark:text-slate-300">মোট সংগৃহীত দোয়া</span>
            <span className="font-mono text-xl font-bold text-slate-900 dark:text-white">
              {allDuas.length}
            </span>
          </div>

          <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/50 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span className="text-xs font-semibold text-emerald-800 dark:text-emerald-300">
                যাচাইকৃত ও সক্রিয়
              </span>
            </div>
            <span className="font-mono text-xl font-bold text-emerald-700 dark:text-emerald-300">
              {verifiedList.length}
            </span>
          </div>

          <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/50 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              <span className="text-xs font-semibold text-amber-800 dark:text-amber-300">
                যাচাই / অনুমোদন প্রয়োজন
              </span>
            </div>
            <span className="font-mono text-xl font-bold text-amber-700 dark:text-amber-300">
              {unverifiedList.length}
            </span>
          </div>
        </div>

        {auditMessage && (
          <div className="p-3 rounded-xl bg-teal-50 dark:bg-teal-950 border border-teal-200/70 dark:border-teal-800 text-teal-800 dark:text-teal-200 text-xs font-semibold flex items-center gap-2 animate-fadeIn">
            <Info className="w-4 h-4 shrink-0 text-teal-600" />
            <span>{auditMessage}</span>
          </div>
        )}

        {/* Rules Box */}
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300 space-y-2">
          <div className="flex items-center justify-between">
            <p className="font-bold text-slate-800 dark:text-slate-200">
              📌 দোয়া যোগ ও যাচাইকরণের শর্তাবলী (Verification Guidelines):
            </p>
            {onOpenAddModal && (
              <button
                onClick={onOpenAddModal}
                className="text-teal-600 dark:text-teal-400 font-bold hover:underline flex items-center gap-1 text-[11px]"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>নতুন দোয়া যোগ করুন</span>
              </button>
            )}
          </div>
          <ul className="list-disc list-inside space-y-1 pl-1 text-[11px] leading-relaxed text-slate-500 dark:text-slate-400">
            <li>
              যে কেউ যে কোনো সময় নতুন কুরআন বা হাদিসের দোয়া অ্যাপে যুক্ত করতে পারেন।
            </li>
            <li>
              যুক্ত করা দোয়াটি মূল অ্যাপের প্রধান তালিকায় প্রদর্শিত হতে হলে তার স্ট্যাটাস অবশ্যই <strong>verified</strong> (যাচাইকৃত) হতে হবে।
            </li>
            <li>
              আরবি পাঠ, প্রামাণ্য উৎস (যেমন: বুখারী, মুসলিম, তিরমিযী, আবু দাউদ বা কুরআনের সূরা ও আয়াত), বাংলা অর্থ এবং প্রেক্ষাপট আবশ্যক।
            </li>
            <li>
              আপনি নিচে তালিকাভুক্ত দোয়ার রেফারেন্স পরীক্ষা করে সরাসরি <strong>“যাচাই ও অনুমোদন করুন”</strong> বাটনে ক্লিক করে অনুমোদন করতে পারেন।
            </li>
          </ul>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
        <button
          onClick={() => setActiveTab('needs_verification')}
          className={`py-2 px-4 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'needs_verification'
              ? 'bg-amber-500 text-slate-950 shadow-xs'
              : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300'
          }`}
        >
          <AlertTriangle className="w-3.5 h-3.5" />
          <span>যাচাই প্রয়োজন ({unverifiedList.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('verified')}
          className={`py-2 px-4 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'verified'
              ? 'bg-teal-700 text-white shadow-xs'
              : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300'
          }`}
        >
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>যাচাইকৃত ({verifiedList.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('all')}
          className={`py-2 px-4 rounded-xl text-xs font-bold transition cursor-pointer whitespace-nowrap ${
            activeTab === 'all'
              ? 'bg-slate-800 text-white dark:bg-slate-700'
              : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300'
          }`}
        >
          সবগুলো ({allDuas.length})
        </button>
      </div>

      {/* Display List */}
      <div className="space-y-3">
        {displayedList.length === 0 ? (
          <div className="text-center py-12 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 space-y-2">
            <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto opacity-80" />
            <h3 className="text-base font-semibold text-slate-800 dark:text-slate-100">
              {activeTab === 'needs_verification'
                ? 'মাশাআল্লাহ! পর্যালোচনার জন্য কোনো মুলতুবি দোয়া নেই'
                : 'কোনো দোয়া পাওয়া যায়নি'}
            </h3>
            <p className="text-xs text-slate-400">
              {activeTab === 'needs_verification'
                ? 'সমস্ত দোয়া সফলভাবে যাচাইকৃত ও প্রকাশিত হয়েছে।'
                : 'নতুন দোয়া যোগ করতে উপরের বাটনে ক্লিক করুন।'}
            </p>
          </div>
        ) : (
          displayedList.map((item) => {
            const sunnahSearchUrl = `https://sunnah.com/search?q=${encodeURIComponent(item.source?.ref || item.arabic)}`;

            return (
              <div
                key={item.id}
                className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-xs space-y-3"
              >
                {/* Header status and actions */}
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800/80 pb-2.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`px-2.5 py-0.5 rounded-md text-[11px] font-bold ${
                        item.isVerified
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                          : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                      }`}
                    >
                      {item.isVerified ? '✓ যাচাইকৃত ও অনুমোদিত' : '⚠ যাচাই ও অনুমোদন প্রয়োজন'}
                    </span>

                    <span className="text-[11px] font-mono text-slate-400">ID: {item.id}</span>

                    {item.submittedBy && (
                      <span className="text-[11px] text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
                        যুক্ত করেছেন: <strong className="text-slate-700 dark:text-slate-200">{item.submittedBy}</strong>
                      </span>
                    )}

                    {item.verifiedBy && (
                      <span className="text-[11px] text-teal-700 dark:text-teal-300 bg-teal-50 dark:bg-teal-950/60 px-2 py-0.5 rounded-md flex items-center gap-1">
                        <UserCheck className="w-3 h-3" />
                        যাচাই করেছেন: {item.verifiedBy} {item.verifiedAt ? `(${item.verifiedAt})` : ''}
                      </span>
                    )}
                  </div>

                  {/* Actions for this item */}
                  <div className="flex items-center gap-1.5 ml-auto">
                    {/* If unverified, show Verify & Approve button */}
                    {!item.isVerified && (
                      <button
                        onClick={() => handleSingleVerify(item.id)}
                        className="py-1 px-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition cursor-pointer flex items-center gap-1 shadow-xs"
                        title="রেফারেন্স সত্যতা নিশ্চিত করে দোয়াটি অনুমোদন করুন"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>যাচাই ও অনুমোদন করুন</span>
                      </button>
                    )}

                    {/* Edit button */}
                    <button
                      onClick={() => handleOpenEdit(item)}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-teal-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                      title="দোয়াটি সম্পাদনা ও রেফারেন্স সংশোধন করুন"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>

                    {/* Delete button (for custom or community added duas) */}
                    {(item.isCustom || item.id.startsWith('custom-')) && (
                      <button
                        onClick={() => onDeleteDua(item.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                        title="দোয়াটি মুছে ফেলুন"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Authenticity Format Assessment */}
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold ${
                      item.authCheck.isAuthenticFormat
                        ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/40'
                        : 'bg-amber-50 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300 border border-amber-200 dark:border-amber-800/40'
                    }`}
                  >
                    {item.authCheck.isAuthenticFormat ? <CheckCircle2 className="w-3 h-3" /> : <AlertTriangle className="w-3 h-3" />}
                    {item.authCheck.reason}
                  </span>

                  {item.source?.ref && (
                    <a
                      href={sunnahSearchUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-[11px] text-teal-600 dark:text-teal-400 hover:underline font-semibold"
                      title="sunnah.com-এ রেফারেন্স সার্চ করে নিশ্চিত হন"
                    >
                      <ExternalLink className="w-3 h-3" />
                      <span>sunnah.com-এ খুঁজুন</span>
                    </a>
                  )}
                </div>

                {/* Audit problems if any */}
                {item.problems.length > 0 && (
                  <div className="p-3 rounded-xl bg-amber-50/80 dark:bg-amber-950/40 border border-amber-200/60 dark:border-amber-800/40 text-xs text-amber-900 dark:text-amber-200 space-y-1">
                    <span className="font-semibold block text-[11px]">অনুমোদনের জন্য যা পূরণ করা আবশ্যক:</span>
                    <ul className="list-disc list-inside space-y-0.5 text-[11px]">
                      {item.problems.map((p, idx) => (
                        <li key={idx}>{p}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Dua snippet */}
                <div className="space-y-1.5 pt-1">
                  <p className="font-arabic text-lg text-right text-teal-900 dark:text-teal-200 leading-loose" dir="rtl">
                    {item.arabic || '(আরবি পাঠ অনুপস্থিত)'}
                  </p>
                  <p className="text-xs sm:text-sm text-slate-800 dark:text-slate-200 font-medium">
                    {item.bengali || '(বাংলা অর্থ অনুপস্থিত)'}
                  </p>
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-slate-500 dark:text-slate-400 pt-1">
                    <span>
                      <strong>উৎস:</strong> {item.source?.ref || '(উৎস উল্লেখ নেই)'}
                    </span>
                    <span>•</span>
                    <span>
                      <strong>কখন পড়বেন:</strong> {item.context || '(উল্লেখ নেই)'}
                    </span>
                    <span>•</span>
                    <span>
                      <strong>পুনরাবৃত্তি:</strong> {item.repetition || '১ বার'}
                    </span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Edit Dua Modal */}
      {editingDua && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-lg w-full p-5 sm:p-6 shadow-2xl max-h-[90vh] overflow-y-auto space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-teal-600" />
                <h3 className="font-bold text-slate-900 dark:text-white">
                  দোয়া সম্পাদনা ও রেফারেন্স পরিমার্জন
                </h3>
              </div>
              <button
                onClick={() => setEditingDua(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  আরবি পাঠ (হরকতসহ) *
                </label>
                <textarea
                  value={editArabic}
                  onChange={(e) => setEditArabic(e.target.value)}
                  dir="rtl"
                  rows={3}
                  required
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-right font-arabic text-base focus:ring-2 focus:ring-teal-500/30 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  বাংলা অনুবাদ *
                </label>
                <textarea
                  value={editBengali}
                  onChange={(e) => setEditBengali(e.target.value)}
                  rows={2}
                  required
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:ring-2 focus:ring-teal-500/30 focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    ক্যাটাগরি
                  </label>
                  <input
                    type="text"
                    value={editCategory}
                    onChange={(e) => setEditCategory(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    উৎস প্রকার
                  </label>
                  <select
                    value={editSourceType}
                    onChange={(e) => setEditSourceType(e.target.value as 'quran' | 'hadith' | 'other')}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950"
                  >
                    <option value="hadith">হাদিস (Hadith)</option>
                    <option value="quran">কুরআন (Quran)</option>
                    <option value="other">অন্যান্য (Other)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  রেফারেন্স ও হাদিস গ্রন্থ *
                </label>
                <input
                  type="text"
                  value={editSourceRef}
                  onChange={(e) => setEditSourceRef(e.target.value)}
                  required
                  placeholder="যেমন: Sahih al-Bukhari 6389 বা সূরা বাকারা ২:২০১"
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:ring-2 focus:ring-teal-500/30 focus:outline-hidden"
                />
              </div>

              {editSourceType === 'quran' && (
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    সূরা ও আয়াত নম্বর (কমা দিয়ে পৃথক করুন)
                  </label>
                  <input
                    type="text"
                    value={editSourceAyahs}
                    onChange={(e) => setEditSourceAyahs(e.target.value)}
                    placeholder="যেমন: 2:255 অথবা 20:25, 20:26"
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950"
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    কখন পড়বেন / প্রেক্ষাপট *
                  </label>
                  <input
                    type="text"
                    value={editContext}
                    onChange={(e) => setEditContext(e.target.value)}
                    required
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    পুনরাবৃত্তি *
                  </label>
                  <input
                    type="text"
                    value={editRepetition}
                    onChange={(e) => setEditRepetition(e.target.value)}
                    required
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingDua(null)}
                  className="py-2 px-4 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="py-2 px-5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold transition shadow-xs"
                >
                  সংরক্ষণ করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
