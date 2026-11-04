import React, { useState, useEffect, useCallback } from 'react';
import {
  Sparkles,
  History,
  LayoutGrid,
  Package,
  GraduationCap,
  Briefcase,
  Cpu,
  PiggyBank,
  Users,
  Copy,
  Check,
  RotateCw,
  Edit3,
  ListFilter,
  BarChart2,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  FileText,
  User,
  ChevronDown,
  Menu,
  X,
} from 'lucide-react';
import {
  GenerateRequest,
  GenerateResponse,
  VerificationReportData,
  HealthResponse,
  WritingTone,
  DescriptionLength,
  AudienceType,
} from '../types';
import {
  generateDescriptions,
  verifyDescriptions,
  fetchHealth,
} from '../services/api';
import { ProductPreset } from '../constants/presets';
import { ExamplesModal } from '../components/ExamplesModal';
import { HistoryDrawer, HistoryItem } from '../components/HistoryDrawer';
import { ApiKeyModal } from '../components/ApiKeyModal';
import { EmptyState } from '../components/arc/EmptyState';
import { saveApiKey } from '../services/api';
import { clearUserApiKey, getUserApiKey, setUserApiKey } from '../services/userKey';

export const Home: React.FC = () => {
  // Navigation & Modals
  const [activeTab, setActiveTab] = useState<'generated' | 'comparison' | 'verification'>('generated');
  const [isExamplesOpen, setIsExamplesOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState(false);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [userApiKey, setUserApiKeyState] = useState<string | null>(() =>
    getUserApiKey()
  );

  // Health starts disconnected; the real status is fetched from the server.
  const [health, setHealth] = useState<HealthResponse>({
    status: 'ok',
    aiConnected: false,
    model: 'Checking AI engine...',
  });

  // Form State
  const [productName, setProductName] = useState('Wireless Headphones');
  const [features, setFeatures] = useState(
    '• Bluetooth connectivity\n• Lightweight design\n• Cushioned ear pads\n• Built-in microphone'
  );
  const [audience1, setAudience1] = useState<AudienceType>('Students');
  const [audience2, setAudience2] = useState<AudienceType>('Working professionals');
  const [tone, setTone] = useState<WritingTone>('Friendly and engaging');
  const [length, setLength] = useState<DescriptionLength>('short');

  // Generation & Verification State
  const [isGenerating, setIsGenerating] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [regeneratingTarget, setRegeneratingTarget] = useState<'audience1' | 'audience2' | null>(null);
  const [copied1, setCopied1] = useState(false);
  const [copied2, setCopied2] = useState(false);
  // These flags prevent the seed/demo data below from being shown as if the
  // user had already generated and verified it.
  const [hasGenerated, setHasGenerated] = useState(false);
  const [hasVerification, setHasVerification] = useState(false);
  const [resultFeatures, setResultFeatures] = useState('');

  // Default pre-populated result so the screen looks immediately complete and matching the screenshot
  const [generationResult, setGenerationResult] = useState<GenerateResponse>({
    productName: 'Wireless Headphones',
    description1: {
      audience: 'Students',
      text: 'These wireless headphones are a great everyday companion for students. Enjoy the freedom of Bluetooth connectivity, a lightweight fit for all-day use, cushioned ear pads for comfort, and a built-in microphone for clear calls and online classes.',
      wordCount: 48,
    },
    description2: {
      audience: 'Working Professionals',
      text: "Stay connected and focused at work with these wireless headphones. With reliable Bluetooth connectivity, a lightweight and comfortable design, cushioned ear pads, and a built-in microphone, they're ideal for calls, virtual meetings and everyday productivity.",
      wordCount: 49,
    },
    comparison: {
      messagingDifferences: 'Students: everyday use and learning.\nProfessionals: work, calls and productivity.',
      benefitsEmphasized: 'Students: portability and comfort.\nProfessionals: clear communication and reliability.',
      positioningSummary: 'Students: a handy, student-friendly companion.\nProfessionals: a reliable tool for work.',
      toneDifferences: 'Students: casual and relatable.\nProfessionals: slightly formal and professional.',
      audienceAddressingSummary: 'Both descriptions use the 4 verified features exclusively.',
    },
  });

  const [verificationResult, setVerificationResult] = useState<VerificationReportData>({
    totalClaims: 4,
    supportedCount: 4,
    unsupportedCount: 0,
    needsReviewCount: 0,
    overallStatus: 'PASSED',
    summary: 'All identified claims are supported by the provided product information.',
    claims: [
      {
        id: '1',
        claimText: 'Bluetooth connectivity',
        audience: 'Students & Professionals',
        classification: 'SUPPORTED',
        reason: 'Directly supported by verified feature #1',
      },
      {
        id: '2',
        claimText: 'Lightweight design',
        audience: 'Students & Professionals',
        classification: 'SUPPORTED',
        reason: 'Directly supported by verified feature #2',
      },
      {
        id: '3',
        claimText: 'Cushioned ear pads',
        audience: 'Students & Professionals',
        classification: 'SUPPORTED',
        reason: 'Directly supported by verified feature #3',
      },
      {
        id: '4',
        claimText: 'Built-in microphone',
        audience: 'Students & Professionals',
        classification: 'SUPPORTED',
        reason: 'Directly supported by verified feature #4',
      },
    ],
  });

  useEffect(() => {
    fetchHealth()
      .then((data) => setHealth(data))
      .catch((err) => console.warn('Backend health check error:', err));
  }, []);

  const handleGenerate = useCallback(
    async (overrideReq?: GenerateRequest) => {
      setIsGenerating(true);
      setErrorMessage(null);

      const rawFeatures = features
        .split('\n')
        .map((l) => l.replace(/^[•\-\*]\s*/, '').trim())
        .filter(Boolean)
        .join('\n');

      const req: GenerateRequest = overrideReq || {
        productName: productName.trim(),
        features: rawFeatures,
        audience1,
        audience2,
        tone,
        length,
      };

      try {
        const genData = await generateDescriptions(req);
        setGenerationResult(genData);
        setHasGenerated(true);
        setHasVerification(false);
        setResultFeatures(req.features);

        // Add to history
        setHistory((prev) => [
          {
            id: Date.now().toString(),
            timestamp: new Date().toISOString(),
            response: genData,
            features: req.features,
          },
          ...prev.slice(0, 19),
        ]);

        // Run Verification
        setIsVerifying(true);
        try {
          const verifyData = await verifyDescriptions({
            productName: genData.productName,
            features: req.features,
            description1: genData.description1,
            description2: genData.description2,
          });
          setVerificationResult(verifyData);
          setHasVerification(true);
        } catch (verifyErr: any) {
          console.error('Verification error:', verifyErr);
          setErrorMessage(
            `Descriptions were generated, but factual verification failed: ${
              verifyErr?.message || 'Unknown error'
            }`
          );
        } finally {
          setIsVerifying(false);
        }
      } catch (err: any) {
        console.error('Generation error:', err);
        setErrorMessage(
          err?.message ||
            'Could not generate descriptions. Make sure the backend server is running and try again.'
        );
      } finally {
        setIsGenerating(false);
      }
    },
    [features, productName, audience1, audience2, tone, length]
  );

  const handleRegenerateSingle = async (target: 'audience1' | 'audience2') => {
    if (!generationResult) return;

    setRegeneratingTarget(target);
    setErrorMessage(null);

    const rawFeatures = features
      .split('\n')
      .map((l) => l.replace(/^[•\-\*]\s*/, '').trim())
      .filter(Boolean)
      .join('\n');

    try {
      const req: GenerateRequest = {
        productName: productName.trim(),
        features: rawFeatures,
        audience1,
        audience2,
        tone,
        length,
        regenerateTarget: target,
        existingDescription1: generationResult.description1.text,
        existingDescription2: generationResult.description2.text,
      };

      const genData = await generateDescriptions(req);

      const updatedGen: GenerateResponse = {
        ...generationResult,
        description1: target === 'audience1' ? genData.description1 : generationResult.description1,
        description2: target === 'audience2' ? genData.description2 : generationResult.description2,
        comparison: genData.comparison,
      };
      setGenerationResult(updatedGen);
      setHasGenerated(true);
      setHasVerification(false);
      setResultFeatures(req.features);

      // Re-verify
      setIsVerifying(true);
      const verifyData = await verifyDescriptions({
        productName: updatedGen.productName,
        features: req.features,
        description1: updatedGen.description1,
        description2: updatedGen.description2,
      });
      setVerificationResult(verifyData);
      setHasVerification(true);
    } catch (e: any) {
      console.error(e);
      setErrorMessage(
        e?.message || 'Could not regenerate this description. Please try again.'
      );
    } finally {
      setRegeneratingTarget(null);
      setIsVerifying(false);
    }
  };

  const handleVerify = async () => {
    if (!generationResult) return;

    setIsVerifying(true);
    setErrorMessage(null);

    try {
      const verifyData = await verifyDescriptions({
        productName: generationResult.productName,
        features: resultFeatures || features,
        description1: generationResult.description1,
        description2: generationResult.description2,
      });
      setVerificationResult(verifyData);
      setHasVerification(true);
    } catch (err: any) {
      console.error('Verification error:', err);
      setErrorMessage(
        err?.message || 'Could not verify the descriptions. Please try again.'
      );
    } finally {
      setIsVerifying(false);
    }
  };

  const scrollToSection = (section: 'generated' | 'comparison' | 'verification') => {
    setActiveTab(section);
    document
      .getElementById(`section-${section}`)
      ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleCopy = async (text: string, which: 1 | 2) => {
    try {
      await navigator.clipboard.writeText(text);
      if (which === 1) {
        setCopied1(true);
        setTimeout(() => setCopied1(false), 2000);
      } else {
        setCopied2(true);
        setTimeout(() => setCopied2(false), 2000);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleSelectPreset = (preset: ProductPreset) => {
    setProductName(preset.name);
    // Format features with bullets
    const bulleted = preset.features
      .split('\n')
      .map((f) => `• ${f}`)
      .join('\n');
    setFeatures(bulleted);
    setAudience1(preset.audience1 as AudienceType);
    setAudience2(preset.audience2 as AudienceType);
    setTone(preset.tone);
    setLength(preset.length);
  };

  const audienceList: { value: AudienceType; label: string; icon: React.ReactNode }[] = [
    { value: 'Students', label: 'Students', icon: <GraduationCap className="w-4 h-4 text-indigo-600" /> },
    { value: 'Working professionals', label: 'Working Professionals', icon: <Briefcase className="w-4 h-4 text-purple-600" /> },
    { value: 'Tech enthusiasts', label: 'Tech Enthusiasts', icon: <Cpu className="w-4 h-4 text-blue-600" /> },
    { value: 'Budget-conscious buyers', label: 'Budget-conscious buyers', icon: <PiggyBank className="w-4 h-4 text-emerald-600" /> },
    { value: 'Luxury buyers', label: 'Luxury buyers', icon: <Sparkles className="w-4 h-4 text-amber-600" /> },
    { value: 'Everyday consumers', label: 'Everyday consumers', icon: <Users className="w-4 h-4 text-slate-600" /> },
  ];

  const getAudienceIcon = (aud: string) => {
    const found = audienceList.find((a) => a.value.toLowerCase() === aud.toLowerCase());
    return found ? found.icon : <Users className="w-5 h-5 text-indigo-600" />;
  };

  const renderComparisonContent = (text: string | undefined, _aud1: string, _aud2: string) => {
    if (!text) {
      return (
        <div className="text-[11px] text-slate-500 italic">No specific differences noted.</div>
      );
    }

    const lines = text.split('\n').map((l) => l.trim()).filter(Boolean);
    if (lines.length >= 2) {
      return (
        <div className="space-y-1">
          {lines.map((line, idx) => {
            const colonIdx = line.indexOf(':');
            if (colonIdx !== -1) {
              const prefix = line.substring(0, colonIdx).trim();
              const rest = line.substring(colonIdx + 1).trim();
              return (
                <div key={idx} className="leading-relaxed">
                  <span className="font-semibold text-slate-900">{prefix}:</span>{' '}
                  <span className="text-slate-700">{rest}</span>
                </div>
              );
            }
            return (
              <div key={idx} className="text-slate-700 leading-relaxed">
                {line}
              </div>
            );
          })}
        </div>
      );
    }

    return (
      <div className="text-[11px] text-slate-700 leading-relaxed">
        {text}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#F8F9FD] flex text-slate-800 font-sans antialiased selection:bg-indigo-100 selection:text-indigo-800 overflow-x-hidden">
      {/* ================= LEFT SIDEBAR (desktop) ================= */}
      <aside className="hidden lg:flex w-60 bg-white border-r border-slate-200/80 flex-col justify-between p-5 shrink-0 select-none">
        <div className="space-y-6">
          {/* Logo / Brand Header */}
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#5B46F6] text-white flex items-center justify-center shadow-sm">
              <Package className="w-5 h-5" />
            </div>
            <span className="font-bold text-base text-slate-900 tracking-tight">ProductCopy AI</span>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1">
            <button
              type="button"
              className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium text-sm transition-colors bg-[#F0EEFF] text-[#5B46F6]"
            >
              <Sparkles className="w-4 h-4" />
              <span>Generate</span>
            </button>

            <button
              type="button"
              onClick={() => setIsHistoryOpen(true)}
              className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium text-sm transition-colors text-slate-600 hover:text-slate-900 hover:bg-slate-50"
            >
              <History className="w-4 h-4 text-slate-500" />
              <span>History</span>
            </button>

            <button
              type="button"
              onClick={() => setIsExamplesOpen(true)}
              className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium text-sm transition-colors text-slate-600 hover:text-slate-900 hover:bg-slate-50"
            >
              <LayoutGrid className="w-4 h-4 text-slate-500" />
              <span>Examples</span>
            </button>
          </nav>
        </div>

        {/* Bottom AI Promo Card */}
        <div className="p-4 rounded-2xl bg-gradient-to-br from-[#F5F3FF] to-[#EDE9FE] border border-indigo-100/80 space-y-2">
          <div className="w-7 h-7 rounded-lg bg-[#5B46F6] text-white flex items-center justify-center">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h4 className="font-semibold text-xs text-slate-900">AI-Powered Product Copy</h4>
            <p className="text-[11px] text-slate-500 leading-relaxed mt-0.5">
              Generate, compare and verify with confidence.
            </p>
          </div>
        </div>
      </aside>

      {/* ================= MOBILE NAVIGATION DRAWER ================= */}
      {isMobileNavOpen && (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label="Main navigation">
          <button
            type="button"
            aria-label="Close navigation"
            onClick={() => setIsMobileNavOpen(false)}
            className="absolute inset-0 w-full h-full bg-slate-900/40 backdrop-blur-sm cursor-default"
          />
          <aside className="relative h-full w-72 max-w-[85vw] bg-white border-r border-slate-200 flex flex-col justify-between p-5 shadow-2xl">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-[#5B46F6] text-white flex items-center justify-center shadow-sm">
                    <Package className="w-5 h-5" />
                  </div>
                  <span className="font-bold text-base text-slate-900 tracking-tight">ProductCopy AI</span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsMobileNavOpen(false)}
                  aria-label="Close navigation"
                  className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <nav className="space-y-1" aria-label="Main navigation links">
                <button
                  type="button"
                  onClick={() => {
                    scrollToSection('generated');
                    setIsMobileNavOpen(false);
                  }}
                  className="w-full flex items-center gap-3 px-3.5 py-3 rounded-xl font-medium text-sm transition-colors bg-[#F0EEFF] text-[#5B46F6]"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Generate</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setIsHistoryOpen(true);
                    setIsMobileNavOpen(false);
                  }}
                  className="w-full flex items-center gap-3 px-3.5 py-3 rounded-xl font-medium text-sm transition-colors text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                >
                  <History className="w-4 h-4 text-slate-500" />
                  <span>History</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setIsExamplesOpen(true);
                    setIsMobileNavOpen(false);
                  }}
                  className="w-full flex items-center gap-3 px-3.5 py-3 rounded-xl font-medium text-sm transition-colors text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                >
                  <LayoutGrid className="w-4 h-4 text-slate-500" />
                  <span>Examples</span>
                </button>
              </nav>
            </div>

            <div className="p-4 rounded-2xl bg-gradient-to-br from-[#F5F3FF] to-[#EDE9FE] border border-indigo-100/80 space-y-2">
              <div className="w-7 h-7 rounded-lg bg-[#5B46F6] text-white flex items-center justify-center">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-semibold text-xs text-slate-900">AI-Powered Product Copy</h4>
                <p className="text-[11px] text-slate-500 leading-relaxed mt-0.5">
                  Generate, compare and verify with confidence.
                </p>
              </div>
            </div>
          </aside>
        </div>
      )}

      {/* ================= MAIN CONTENT AREA ================= */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile top bar */}
        <div className="lg:hidden sticky top-0 z-30 bg-white/95 backdrop-blur border-b border-slate-200/80 px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-[#5B46F6] text-white flex items-center justify-center shadow-sm shrink-0">
              <Package className="w-4 h-4" />
            </div>
            <span className="font-bold text-sm text-slate-900 tracking-tight truncate">ProductCopy AI</span>
          </div>
          <button
            type="button"
            onClick={() => setIsMobileNavOpen(true)}
            aria-label="Open navigation"
            className="p-2.5 -mr-1 rounded-lg text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>

        {/* Top Header Bar */}
        <header className="px-4 sm:px-6 lg:px-8 pt-5 sm:pt-7 pb-4 sm:pb-5 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4">
          <div className="min-w-0">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
              Product Description Generator
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Create audience-specific product descriptions and verify factual accuracy.
            </p>
          </div>

          <div className="flex items-center justify-between sm:justify-end gap-3 sm:pt-1 w-full sm:w-auto">
            {/* AI Status Badge */}
            <button
              type="button"
              onClick={() => setIsApiKeyModalOpen(true)}
              title="Configure your Gemini API key"
              className="flex items-center gap-2 px-3 py-2 sm:py-1.5 rounded-full bg-[#EDFDF3] border border-[#B7F4CA] text-[11px] sm:text-xs font-medium text-[#16A34A] hover:bg-[#E2FBEB] transition-colors cursor-pointer whitespace-nowrap"
            >
              <span
                className={`w-2 h-2 rounded-full shrink-0 ${
                  userApiKey || health.aiConnected
                    ? 'bg-[#16A34A] animate-pulse'
                    : 'bg-amber-500'
                }`}
              />
              <span>
                {userApiKey
                  ? 'Using your Gemini key'
                  : health.aiConnected
                  ? 'Gemini AI Connected'
                  : 'Connect Gemini API Key'}
              </span>
            </button>

            {/* User Profile Avatar */}
            <div className="w-9 h-9 sm:w-8 sm:h-8 rounded-full border border-slate-200 bg-white flex items-center justify-center text-slate-600 hover:border-slate-300 transition-colors shadow-sm shrink-0">
              <User className="w-4 h-4" />
            </div>
          </div>
        </header>

        {/* Main Dashboard Grid */}
        <main className="px-4 sm:px-6 lg:px-8 pb-8 sm:pb-10 flex-1 grid grid-cols-12 gap-4 lg:gap-6 items-start">
          {/* ================= LEFT COLUMN: PRODUCT DETAILS CARD ================= */}
          <div className="col-span-12 lg:col-span-4 bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-4 sm:p-5 shadow-[0_2px_8px_-2px_rgba(0,0,0,0.03)] space-y-4">
            {/* Card Title */}
            <div className="flex items-center gap-2.5 pb-1">
              <div className="w-7 h-7 rounded-lg bg-indigo-50 text-[#5B46F6] flex items-center justify-center">
                <Package className="w-4 h-4" />
              </div>
              <h2 className="font-bold text-sm text-slate-900">Product Details</h2>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleGenerate();
              }}
              className="space-y-3 sm:space-y-4"
            >
              {/* Product Name */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 flex items-center gap-0.5">
                  <span>Product Name</span>
                  <span className="text-red-500 font-bold">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                  placeholder="e.g. Wireless Headphones"
                  className="w-full bg-white text-base sm:text-xs text-slate-800 rounded-xl border border-slate-200 px-3.5 py-2.5 placeholder:text-slate-400 focus:outline-none focus:border-[#5B46F6] focus:ring-2 focus:ring-[#5B46F6]/10 transition-all shadow-sm"
                />
              </div>

              {/* Product Features / Specifications */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 flex items-center gap-0.5">
                  <span>Product Features / Specifications</span>
                  <span className="text-red-500 font-bold">*</span>
                </label>
                <textarea
                  required
                  rows={5}
                  value={features}
                  onChange={(e) => setFeatures(e.target.value)}
                  placeholder="• Bluetooth connectivity&#10;• Lightweight design&#10;• Cushioned ear pads&#10;• Built-in microphone"
                  className="w-full bg-white text-base sm:text-xs text-slate-800 rounded-xl border border-slate-200 p-3.5 placeholder:text-slate-400 focus:outline-none focus:border-[#5B46F6] focus:ring-2 focus:ring-[#5B46F6]/10 transition-all shadow-sm font-sans leading-relaxed resize-y"
                />
              </div>

              {/* Target Audience 1 */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 flex items-center gap-0.5">
                  <span>Target Audience 1</span>
                  <span className="text-red-500 font-bold">*</span>
                </label>
                <div className="relative flex items-center">
                  <div className="absolute left-3.5 pointer-events-none">
                    {getAudienceIcon(audience1)}
                  </div>
                  <select
                    value={audience1}
                    onChange={(e) => setAudience1(e.target.value as AudienceType)}
                    className="w-full appearance-none bg-white text-base sm:text-xs text-slate-800 rounded-xl border border-slate-200 pl-10 pr-9 py-2.5 focus:outline-none focus:border-[#5B46F6] focus:ring-2 focus:ring-[#5B46F6]/10 transition-all shadow-sm cursor-pointer font-medium"
                  >
                    {audienceList.map((a) => (
                      <option key={a.value} value={a.value} disabled={a.value === audience2}>
                        {a.label}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 pointer-events-none" />
                </div>
              </div>

              {/* Target Audience 2 */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 flex items-center gap-0.5">
                  <span>Target Audience 2</span>
                  <span className="text-red-500 font-bold">*</span>
                </label>
                <div className="relative flex items-center">
                  <div className="absolute left-3.5 pointer-events-none">
                    {getAudienceIcon(audience2)}
                  </div>
                  <select
                    value={audience2}
                    onChange={(e) => setAudience2(e.target.value as AudienceType)}
                    className="w-full appearance-none bg-white text-base sm:text-xs text-slate-800 rounded-xl border border-slate-200 pl-10 pr-9 py-2.5 focus:outline-none focus:border-[#5B46F6] focus:ring-2 focus:ring-[#5B46F6]/10 transition-all shadow-sm cursor-pointer font-medium"
                  >
                    {audienceList.map((a) => (
                      <option key={a.value} value={a.value} disabled={a.value === audience1}>
                        {a.label}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 pointer-events-none" />
                </div>
              </div>

              {/* Writing Tone & Description Length Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-0.5">
                {/* Writing Tone */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 block">Writing Tone</label>
                  <div className="relative flex items-center">
                    <Edit3 className="w-3.5 h-3.5 text-slate-400 absolute left-3 pointer-events-none" />
                    <select
                      value={tone}
                      onChange={(e) => setTone(e.target.value as WritingTone)}
                      className="w-full appearance-none bg-white text-base sm:text-xs text-slate-800 rounded-xl border border-slate-200 pl-8 pr-7 py-2.5 focus:outline-none focus:border-[#5B46F6] transition-all shadow-sm cursor-pointer font-medium truncate"
                    >
                      <option value="Friendly and engaging">Friendly and engaging</option>
                      <option value="Professional and informative">Professional</option>
                      <option value="Persuasive and sales-focused">Persuasive</option>
                    </select>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 pointer-events-none" />
                  </div>
                </div>

                {/* Description Length */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 block">Description Length</label>
                  <div className="relative flex items-center">
                    <ListFilter className="w-3.5 h-3.5 text-slate-400 absolute left-3 pointer-events-none" />
                    <select
                      value={length}
                      onChange={(e) => setLength(e.target.value as DescriptionLength)}
                      className="w-full appearance-none bg-white text-base sm:text-xs text-slate-800 rounded-xl border border-slate-200 pl-8 pr-7 py-2.5 focus:outline-none focus:border-[#5B46F6] transition-all shadow-sm cursor-pointer font-medium truncate"
                    >
                      <option value="short">Short (30–50 words)</option>
                      <option value="medium">Medium (50–80 words)</option>
                      <option value="detailed">Detailed (80–120 words)</option>
                    </select>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 pointer-events-none" />
                  </div>
                </div>
              </div>

              {/* Generate Descriptions Action Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isGenerating}
                  className="w-full min-h-[44px] bg-[#5B46F6] hover:bg-[#4D38E8] active:scale-[0.99] text-white font-semibold text-sm py-3 px-4 rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#5B46F6] focus-visible:ring-offset-2"
                >
                  {isGenerating ? (
                    <RotateCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <Sparkles className="w-4 h-4" />
                  )}
                  <span>Generate Descriptions</span>
                </button>
              </div>
            </form>
          </div>

          {/* ================= RIGHT COLUMN: OUTPUTS & AUDIT ================= */}
          <div className="col-span-12 lg:col-span-8 space-y-4 sm:space-y-5">
            {/* Top Navigation Tabs Header (scrolls horizontally on narrow screens) */}
            <div className="flex items-center gap-4 sm:gap-6 border-b border-slate-200/80 px-1 sm:px-2 pb-2 overflow-x-auto no-scrollbar">
              <button
                type="button"
                onClick={() => scrollToSection('generated')}
                aria-current={activeTab === 'generated' ? 'true' : undefined}
                className={`flex items-center gap-2 pb-2 text-xs sm:text-sm font-semibold transition-all relative shrink-0 min-h-[36px] ${
                  activeTab === 'generated'
                    ? 'text-[#5B46F6]'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <Sparkles className="w-4 h-4" />
                <span className="sm:hidden">Generated</span>
                <span className="hidden sm:inline">Generated Descriptions</span>
                {activeTab === 'generated' && (
                  <span className="absolute -bottom-2 left-0 right-0 h-0.5 bg-[#5B46F6] rounded-full" />
                )}
              </button>

              <button
                type="button"
                onClick={() => scrollToSection('comparison')}
                aria-current={activeTab === 'comparison' ? 'true' : undefined}
                className={`flex items-center gap-2 pb-2 text-xs sm:text-sm font-semibold transition-all relative shrink-0 min-h-[36px] ${
                  activeTab === 'comparison'
                    ? 'text-[#5B46F6]'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <BarChart2 className="w-4 h-4 text-slate-500" />
                <span className="sm:hidden">Comparison</span>
                <span className="hidden sm:inline">Audience Comparison</span>
                {activeTab === 'comparison' && (
                  <span className="absolute -bottom-2 left-0 right-0 h-0.5 bg-[#5B46F6] rounded-full" />
                )}
              </button>

              <button
                type="button"
                onClick={() => scrollToSection('verification')}
                aria-current={activeTab === 'verification' ? 'true' : undefined}
                className={`flex items-center gap-2 pb-2 text-xs sm:text-sm font-semibold transition-all relative shrink-0 min-h-[36px] ${
                  activeTab === 'verification'
                    ? 'text-[#5B46F6]'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <ShieldCheck className="w-4 h-4 text-slate-500" />
                <span className="sm:hidden">Verification</span>
                <span className="hidden sm:inline">Factual Verification</span>
                {activeTab === 'verification' && (
                  <span className="absolute -bottom-2 left-0 right-0 h-0.5 bg-[#5B46F6] rounded-full" />
                )}
              </button>
            </div>

            {/* Visible error state instead of silent console failures */}
            {errorMessage && (
              <div
                role="alert"
                className="flex items-start gap-2.5 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700"
              >
                <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
                <p className="text-xs leading-relaxed flex-1">{errorMessage}</p>
                <button
                  type="button"
                  onClick={() => setErrorMessage(null)}
                  aria-label="Dismiss error"
                  className="p-1 -m-1 rounded-md hover:bg-red-100 transition-colors shrink-0"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* TOP ROW: DUAL AUDIENCE DESCRIPTION CARDS (SIDE BY SIDE) */}
            {hasGenerated ? (
            <div id="section-generated" className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5 scroll-mt-20">
              {/* Card 1: Audience 1 */}
              <div className="bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-5 shadow-[0_2px_8px_-2px_rgba(0,0,0,0.03)] flex flex-col justify-between space-y-4">
                <div className="space-y-3">
                  {/* Card Header with Audience and Action Buttons */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      {getAudienceIcon(generationResult.description1.audience)}
                      <h3 className="font-bold text-sm text-slate-900 truncate">
                        {generationResult.description1.audience}
                      </h3>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleCopy(generationResult.description1.text, 1)}
                        title="Copy Description"
                        className="p-2.5 sm:p-1.5 min-h-[40px] min-w-[40px] sm:min-h-0 sm:min-w-0 inline-flex items-center justify-center rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-500 hover:text-slate-800 transition-colors"
                        aria-label="Copy description"
                      >
                        {copied1 ? (
                          <Check className="w-3.5 h-3.5 text-green-600" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={() => handleRegenerateSingle('audience1')}
                        disabled={regeneratingTarget === 'audience1'}
                        title="Regenerate Description"
                        className="p-2.5 sm:p-1.5 min-h-[40px] min-w-[40px] sm:min-h-0 sm:min-w-0 inline-flex items-center justify-center rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-500 hover:text-slate-800 transition-colors disabled:opacity-50"
                        aria-label="Regenerate description"
                      >
                        <RotateCw
                          className={`w-4 h-4 sm:w-3.5 sm:h-3.5 ${
                            regeneratingTarget === 'audience1' ? 'animate-spin text-indigo-600' : ''
                          }`}
                        />
                      </button>
                    </div>
                  </div>

                  {/* Description Text */}
                  <p className="text-sm sm:text-xs text-slate-700 leading-relaxed font-sans break-words">
                    {generationResult.description1.text}
                  </p>
                </div>

                {/* Bottom Word Count Pill */}
                <div>
                  <span className="inline-block text-[11px] font-mono font-medium px-2.5 py-1 rounded-full bg-slate-100 text-slate-600">
                    {generationResult.description1.wordCount} words
                  </span>
                </div>
              </div>

              {/* Card 2: Audience 2 */}
              <div className="bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-5 shadow-[0_2px_8px_-2px_rgba(0,0,0,0.03)] flex flex-col justify-between space-y-4">
                <div className="space-y-3">
                  {/* Card Header with Audience and Action Buttons */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      {getAudienceIcon(generationResult.description2.audience)}
                      <h3 className="font-bold text-sm text-slate-900 truncate">
                        {generationResult.description2.audience}
                      </h3>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleCopy(generationResult.description2.text, 2)}
                        title="Copy Description"
                        className="p-2.5 sm:p-1.5 min-h-[40px] min-w-[40px] sm:min-h-0 sm:min-w-0 inline-flex items-center justify-center rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-500 hover:text-slate-800 transition-colors"
                        aria-label="Copy description"
                      >
                        {copied2 ? (
                          <Check className="w-3.5 h-3.5 text-green-600" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={() => handleRegenerateSingle('audience2')}
                        disabled={regeneratingTarget === 'audience2'}
                        title="Regenerate Description"
                        className="p-2.5 sm:p-1.5 min-h-[40px] min-w-[40px] sm:min-h-0 sm:min-w-0 inline-flex items-center justify-center rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-500 hover:text-slate-800 transition-colors disabled:opacity-50"
                        aria-label="Regenerate description"
                      >
                        <RotateCw
                          className={`w-4 h-4 sm:w-3.5 sm:h-3.5 ${
                            regeneratingTarget === 'audience2' ? 'animate-spin text-purple-600' : ''
                          }`}
                        />
                      </button>
                    </div>
                  </div>

                  {/* Description Text */}
                  <p className="text-sm sm:text-xs text-slate-700 leading-relaxed font-sans break-words">
                    {generationResult.description2.text}
                  </p>
                </div>

                {/* Bottom Word Count Pill */}
                <div>
                  <span className="inline-block text-[11px] font-mono font-medium px-2.5 py-1 rounded-full bg-slate-100 text-slate-600">
                    {generationResult.description2.wordCount} words
                  </span>
                </div>
              </div>
            </div>
            ) : (
              <div id="section-generated" className="scroll-mt-20">
                <EmptyState
                  icon={<Sparkles className="w-5 h-5" />}
                  title="No descriptions generated yet"
                  description="Add your verified product details on the left, then click Generate Descriptions. Two audience-specific drafts will appear here."
                />
              </div>
            )}

            {/* BOTTOM ROW: COMPARISON SUMMARY & FACTUAL VERIFICATION CARDS */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
              {/* 1. Comparison Summary Card */}
              <div id="section-comparison" className="bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-5 shadow-[0_2px_8px_-2px_rgba(0,0,0,0.03)] space-y-4 scroll-mt-20">
                <div>
                  <div className="flex items-center gap-2">
                    <BarChart2 className="w-4 h-4 text-[#5B46F6]" />
                    <h3 className="font-bold text-sm text-slate-900">Comparison Summary</h3>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Key differences between the two descriptions.
                  </p>
                </div>

                {!hasGenerated && (
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Generate descriptions to see how the messaging, benefits and tone differ between your two audiences.
                  </p>
                )}

                {/* Structured Key-Value Comparison Rows */}
                <div className={hasGenerated ? 'space-y-2.5 text-xs' : 'hidden'}>
                  {/* Row 1: Messaging */}
                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-1 sm:gap-3 items-start">
                    <div className="sm:col-span-4">
                      <span className="inline-block px-2.5 py-1 rounded-lg bg-[#F3F1FD] text-slate-900 font-semibold text-[11px]">
                        Messaging
                      </span>
                    </div>
                    <div className="sm:col-span-8 text-xs sm:text-[11px] text-slate-700 leading-relaxed">
                      {renderComparisonContent(
                        generationResult.comparison.messagingDifferences,
                        generationResult.description1.audience,
                        generationResult.description2.audience
                      )}
                    </div>
                  </div>

                  {/* Row 2: Benefits Focus */}
                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-1 sm:gap-3 items-start">
                    <div className="sm:col-span-4">
                      <span className="inline-block px-2.5 py-1 rounded-lg bg-[#F3F1FD] text-slate-900 font-semibold text-[11px]">
                        Benefits Focus
                      </span>
                    </div>
                    <div className="sm:col-span-8 text-xs sm:text-[11px] text-slate-700 leading-relaxed">
                      {renderComparisonContent(
                        generationResult.comparison.benefitsEmphasized,
                        generationResult.description1.audience,
                        generationResult.description2.audience
                      )}
                    </div>
                  </div>

                  {/* Row 3: Positioning */}
                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-1 sm:gap-3 items-start">
                    <div className="sm:col-span-4">
                      <span className="inline-block px-2.5 py-1 rounded-lg bg-[#F3F1FD] text-slate-900 font-semibold text-[11px]">
                        Positioning
                      </span>
                    </div>
                    <div className="sm:col-span-8 text-xs sm:text-[11px] text-slate-700 leading-relaxed">
                      {renderComparisonContent(
                        generationResult.comparison.positioningSummary,
                        generationResult.description1.audience,
                        generationResult.description2.audience
                      )}
                    </div>
                  </div>

                  {/* Row 4: Tone */}
                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-1 sm:gap-3 items-start">
                    <div className="sm:col-span-4">
                      <span className="inline-block px-2.5 py-1 rounded-lg bg-[#F3F1FD] text-slate-900 font-semibold text-[11px]">
                        Tone
                      </span>
                    </div>
                    <div className="sm:col-span-8 text-xs sm:text-[11px] text-slate-700 leading-relaxed">
                      {renderComparisonContent(
                        generationResult.comparison.toneDifferences,
                        generationResult.description1.audience,
                        generationResult.description2.audience
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* 2. Factual Verification Card */}
              <div id="section-verification" className="bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-5 shadow-[0_2px_8px_-2px_rgba(0,0,0,0.03)] space-y-4 scroll-mt-20">
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <ShieldCheck className="w-4 h-4 text-[#5B46F6] shrink-0" />
                      <h3 className="font-bold text-sm text-slate-900">Factual Verification</h3>
                    </div>
                    {isVerifying && <RotateCw className="w-3.5 h-3.5 animate-spin text-slate-400" />}
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Check whether the generated descriptions use only the provided specifications.
                  </p>
                </div>

                {hasVerification ? (
                  <>
                {/* Verification Passed / Flagged Banner */}
                {verificationResult.overallStatus === 'PASSED' ? (
                  <div className="p-3.5 rounded-xl bg-[#EEFBF3] border border-[#C7F4D6] flex items-start gap-3">
                    <div className="w-7 h-7 rounded-full bg-[#16A34A] text-white flex items-center justify-center shrink-0">
                      <Check className="w-4 h-4 stroke-[3]" />
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-bold text-xs text-[#15803D]">Verification Passed</h4>
                      <p className="text-[11px] text-[#16A34A] mt-0.5 leading-tight break-words">
                        {verificationResult.summary}
                      </p>
                    </div>
                  </div>
                ) : verificationResult.overallStatus === 'FLAGGED' ? (
                  <div className="p-3.5 rounded-xl bg-[#FEF2F2] border border-[#FECACA] flex items-start gap-3">
                    <div className="w-7 h-7 rounded-full bg-[#DC2626] text-white flex items-center justify-center shrink-0">
                      <XCircle className="w-4 h-4 stroke-[3]" />
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-bold text-xs text-[#B91C1C]">Unsupported Specs Detected</h4>
                      <p className="text-[11px] text-[#DC2626] mt-0.5 leading-tight break-words">
                        {verificationResult.summary}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="p-3.5 rounded-xl bg-[#FFFBEB] border border-[#FDE68A] flex items-start gap-3">
                    <div className="w-7 h-7 rounded-full bg-[#D97706] text-white flex items-center justify-center shrink-0">
                      <AlertTriangle className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-bold text-xs text-[#B45309]">Needs Review</h4>
                      <p className="text-[11px] text-[#B45309] mt-0.5 leading-tight break-words">
                        {verificationResult.summary}
                      </p>
                    </div>
                  </div>
                )}

                {/* 4 Stat Tiles Row */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-center">
                  {/* Tile 1: Total Claims */}
                  <div className="p-2.5 rounded-xl bg-[#F8F7FF] border border-purple-100 flex flex-col items-center justify-center gap-0.5">
                    <FileText className="w-4 h-4 text-[#5B46F6]" />
                    <span className="text-base font-bold text-slate-900 font-mono">
                      {verificationResult.totalClaims}
                    </span>
                    <span className="text-[10px] text-slate-500 font-medium">Total Claims</span>
                  </div>

                  {/* Tile 2: Supported */}
                  <div className="p-2.5 rounded-xl bg-[#F0FDF4] border border-green-100 flex flex-col items-center justify-center gap-0.5">
                    <CheckCircle2 className="w-4 h-4 text-[#16A34A]" />
                    <span className="text-base font-bold text-[#16A34A] font-mono">
                      {verificationResult.supportedCount}
                    </span>
                    <span className="text-[10px] text-slate-500 font-medium">Supported</span>
                  </div>

                  {/* Tile 3: Unsupported */}
                  <div className="p-2.5 rounded-xl bg-[#FEF2F2] border border-red-100 flex flex-col items-center justify-center gap-0.5">
                    <XCircle className="w-4 h-4 text-[#DC2626]" />
                    <span className="text-base font-bold text-[#DC2626] font-mono">
                      {verificationResult.unsupportedCount}
                    </span>
                    <span className="text-[10px] text-slate-500 font-medium">Unsupported</span>
                  </div>

                  {/* Tile 4: Needs Review */}
                  <div className="p-2.5 rounded-xl bg-[#FFFBEB] border border-amber-100 flex flex-col items-center justify-center gap-0.5">
                    <AlertTriangle className="w-4 h-4 text-[#D97706]" />
                    <span className="text-base font-bold text-[#D97706] font-mono">
                      {verificationResult.needsReviewCount}
                    </span>
                    <span className="text-[10px] text-slate-500 font-medium">Needs Review</span>
                  </div>
                </div>

                {/* Audited Claims & Evidence Breakdown */}
                {verificationResult.claims && verificationResult.claims.length > 0 && (
                  <div className="pt-2 border-t border-slate-100 space-y-1.5">
                    <div className="text-[11px] font-semibold text-slate-700 flex items-center justify-between">
                      <span>Audited Claims &amp; Evidence</span>
                      <span className="text-[10px] text-slate-400 font-normal">
                        {verificationResult.claims.length} claims verified
                      </span>
                    </div>
                    <div className="max-h-36 overflow-y-auto space-y-1.5 pr-1">
                      {verificationResult.claims.map((claim) => (
                        <div
                          key={claim.id}
                          className="p-2 rounded-lg bg-slate-50 border border-slate-200/70 text-[11px] space-y-0.5"
                        >
                          <div className="flex items-start justify-between gap-1.5">
                            <span className="font-medium text-slate-800 line-clamp-2 sm:line-clamp-1 min-w-0 break-words">
                              {claim.claimText}
                            </span>
                            <span
                              className={`px-1.5 py-0.5 rounded text-[9px] font-semibold uppercase shrink-0 ${
                                claim.classification === 'SUPPORTED'
                                  ? 'bg-green-100 text-green-700'
                                  : claim.classification === 'UNSUPPORTED'
                                  ? 'bg-red-100 text-red-700'
                                  : 'bg-amber-100 text-amber-700'
                              }`}
                            >
                              {claim.classification}
                            </span>
                          </div>
                          <div className="text-[11px] sm:text-[10px] text-slate-500 leading-snug break-words">
                            {claim.reason}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                  </>
                ) : (
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-center space-y-2.5">
                    <p className="text-xs text-slate-600 leading-relaxed">
                      {hasGenerated
                        ? 'Run verification to check the generated claims against the specifications you supplied.'
                        : 'Verification runs automatically after you generate descriptions.'}
                    </p>
                    {hasGenerated && (
                      <button
                        type="button"
                        onClick={handleVerify}
                        disabled={isVerifying}
                        className="inline-flex items-center justify-center gap-1.5 min-h-[40px] px-3.5 py-2 rounded-lg bg-[#5B46F6] hover:bg-[#4D38E8] text-white text-xs font-semibold transition-colors disabled:opacity-60"
                      >
                        {isVerifying ? (
                          <RotateCw className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <ShieldCheck className="w-3.5 h-3.5" />
                        )}
                        <span>{isVerifying ? 'Verifying...' : 'Verify now'}</span>
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Examples Modal */}
      <ExamplesModal
        isOpen={isExamplesOpen}
        onClose={() => setIsExamplesOpen(false)}
        onSelect={handleSelectPreset}
        currentName={productName}
      />

      {/* History Drawer */}
      <HistoryDrawer
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        history={history}
        onSelect={(item) => {
          setProductName(item.response.productName);
          setGenerationResult(item.response);
          setHasGenerated(true);
          setHasVerification(false);
          setResultFeatures(item.features || '');
          if (item.features) setFeatures(item.features);
        }}
        onClear={() => setHistory([])}
      />

      {/* API Key Modal */}
      <ApiKeyModal
        isOpen={isApiKeyModalOpen}
        onClose={() => setIsApiKeyModalOpen(false)}
        isServerConnected={health.aiConnected}
        userApiKey={userApiKey}
        modelName={health.model}
        onSaveKey={async (key) => {
          // The API verifies the key without persisting it. The browser stores
          // it and attaches it to each generation/verification request.
          const res = await saveApiKey(key);
          if (!res.aiConnected) return false;

          setUserApiKey(key);
          setUserApiKeyState(key);
          return true;
        }}
        onRemoveKey={() => {
          clearUserApiKey();
          setUserApiKeyState(null);
        }}
      />
    </div>
  );
};
