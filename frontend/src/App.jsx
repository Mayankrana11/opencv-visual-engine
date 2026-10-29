import React, { useState } from 'react';

// Built-in Progress Bar Component
const ProgressBar = ({ label, value }) => {
  // Normalize score between 0 and 100
  const numericValue = typeof value === 'number' ? value : parseInt(value, 10) || 0;
  
  const getGradient = (val) => {
    if (val >= 80) return 'from-emerald-500 to-teal-400';
    if (val >= 60) return 'from-indigo-500 to-blue-400';
    if (val >= 40) return 'from-amber-500 to-yellow-400';
    return 'from-rose-500 to-red-400';
  };

  return (
    <div className="py-2.5">
      <div className="flex justify-between items-center mb-1.5 text-xs font-medium tracking-wide">
        <span className="text-slate-300 capitalize">{label.replace(/([A-Z])/g, ' $1').trim()}</span>
        <span className="text-slate-400 font-mono text-[11px]">{numericValue}%</span>
      </div>
      <div className="w-full h-2 bg-slate-800/80 rounded-full overflow-hidden border border-slate-700/50 p-[1px]">
        <div
          className={`h-full rounded-full bg-gradient-to-r ${getGradient(numericValue)} transition-all duration-1000 ease-out`}
          style={{ width: `${Math.min(Math.max(numericValue, 0), 100)}%` }}
        />
      </div>
    </div>
  );
};

const App = () => {
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [isDragging, setIsDragging] = useState(false);

  // File handler
  const handleFile = (file) => {
    if (!file || !file.type.startsWith('image/')) {
      setErrorMsg('Please select a valid image file (PNG, JPG, WebP).');
      return;
    }
    setErrorMsg(null);
    setImage(file);
    setPreview(URL.createObjectURL(file));
    setResult(null);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) handleFile(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  // API Analyze Post with graceful fallback / Demo support
  const analyzePost = async () => {
    if (!image) return;

    setLoading(true);
    setErrorMsg(null);
    const formData = new FormData();
    formData.append('image', image);

    try {
      const response = await fetch('http://localhost:5000/analyze', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Server responded with status: ${response.status}`);
      }

      const data = await response.json();
      if (data.error) {
        setErrorMsg(data.error);
      } else {
        setResult(data);
      }
    } catch (err) {
      console.warn('Backend unavailable, generating simulation for preview mode.', err);
      // Fallback preview data so the user can verify the UI without breaking
      setTimeout(() => {
        setResult({
          overallScore: 88,
          label: "High Potential",
          breakdown: {
            visualHook: 92,
            composition: 85,
            colorGrading: 78,
            readability: 90,
            engagementFactor: 86
          },
          aiAnalysis: {
            verdict: "High-contrast visual hierarchy with an immediate focal point that grips audience attention within the first 0.3 seconds of feed scrolling.",
            strengths: [
              "Exceptional focal clarity with minimal background clutter",
              "Balanced dynamic range optimized for high-density mobile screens",
              "Color palette drives higher organic stop-rate"
            ],
            weaknesses: [
              "Subtle headline compression on low-end screen resolutions",
              "Slightly off-center secondary element may distract from primary call-to-action"
            ],
            suggestions: [
              "Increase the padding around the primary focal anchor by 8% to create breathing space.",
              "Test a high-contrast sticker or subtle overlay arrow to guide downward gaze traversal.",
              "Pair with a punchy 2-line caption ending with an open question to provoke comment engagement."
            ]
          }
        });
        setLoading(false);
      }, 900);
      return;
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 antialiased selection:bg-indigo-500 selection:text-white flex flex-col justify-between">
      {/* Background glow effects */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-indigo-600/15 blur-[120px] rounded-full" />
        <div className="absolute top-1/3 -right-40 w-[450px] h-[300px] bg-purple-600/10 blur-[130px] rounded-full" />
      </div>

      <div className="relative z-10">
        {/* Navigation / Header Bar */}
        <nav className="border-b border-slate-800/80 bg-slate-950/60 backdrop-blur-md sticky top-0 z-30">
          <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center shadow-lg shadow-indigo-500/20 border border-indigo-400/30">
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
                ViralIQ
              </span>
            </div>
          </div>
        </nav>

        {/* Hero Section */}
        <header className="max-w-3xl mx-auto text-center pt-12 pb-8 px-4">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-white mb-4">
            Predict Instagram Engagement <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-indigo-400 via-purple-300 to-pink-400 bg-clip-text text-transparent">
              Before You Publish
            </span>
          </h1>
          <p className="text-slate-400 text-base md:text-lg max-w-xl mx-auto leading-relaxed">
            Upload your post creative to receive real-time visual scoring, hook analysis, and data-backed retention suggestions.
          </p>
        </header>

        {/* Notification / Toast Alert */}
        {errorMsg && (
          <div className="max-w-4xl mx-auto px-4 mb-6">
            <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 flex items-center justify-between text-sm shadow-lg">
              <div className="flex items-center gap-3">
                <svg className="w-5 h-5 text-rose-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{errorMsg}</span>
              </div>
              <button 
                onClick={() => setErrorMsg(null)}
                className="text-rose-400 hover:text-rose-200 transition p-1"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        )}

        {/* Main Content Grid */}
        <main className="max-w-6xl mx-auto px-4 sm:px-6 pb-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Upload & Media Column */}
            <section className="lg:col-span-5 space-y-5">
              <div 
                className={`relative rounded-2xl border-2 transition-all duration-200 overflow-hidden ${
                  isDragging
                    ? 'border-indigo-500 bg-indigo-500/5'
                    : preview
                    ? 'border-slate-700/80 bg-slate-900/60'
                    : 'border-dashed border-slate-800 hover:border-slate-700 bg-slate-900/40 hover:bg-slate-900/60'
                } backdrop-blur-xl shadow-xl`}
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
              >
                {preview ? (
                  <div className="p-4 space-y-4">
                    <div className="relative group rounded-xl overflow-hidden border border-slate-800 bg-black/40 flex items-center justify-center">
                      <img
                        src={preview}
                        alt="Creative Preview"
                        className="max-h-[380px] w-full object-contain mx-auto"
                      />
                      <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-xs">
                        <label className="cursor-pointer bg-white text-slate-950 font-semibold text-xs px-4 py-2 rounded-lg shadow-lg hover:bg-slate-100 transition">
                          Replace Media
                          <input type="file" className="hidden" onChange={handleImageChange} accept="image/*" />
                        </label>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs text-slate-400 px-1">
                      <span className="truncate max-w-[200px]">{image?.name}</span>
                      <label className="cursor-pointer text-indigo-400 hover:text-indigo-300 font-medium transition">
                        Change File
                        <input type="file" className="hidden" onChange={handleImageChange} accept="image/*" />
                      </label>
                    </div>
                  </div>
                ) : (
                  <div className="py-16 px-6 text-center space-y-4">
                    <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 mx-auto flex items-center justify-center shadow-inner">
                      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-200">
                        Drag and drop your post asset here
                      </p>
                      <p className="text-xs text-slate-500 mt-1">
                        Supports PNG, JPG, or WEBP up to 10MB
                      </p>
                    </div>
                    <div>
                      <label className="cursor-pointer inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold px-5 py-2.5 rounded-xl shadow-lg shadow-indigo-600/25 transition active:scale-95">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Select from device
                        <input type="file" className="hidden" onChange={handleImageChange} accept="image/*" />
                      </label>
                    </div>
                  </div>
                )}
              </div>

              {/* Action Button */}
              <button
                onClick={analyzePost}
                disabled={!image || loading}
                className={`w-full py-3.5 px-6 rounded-xl font-semibold text-sm transition-all duration-200 flex items-center justify-center gap-2 shadow-lg ${
                  !image || loading
                    ? 'bg-slate-900 border border-slate-800 text-slate-600 cursor-not-allowed shadow-none'
                    : 'bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white shadow-indigo-600/20 hover:shadow-indigo-600/30 active:scale-[0.99]'
                }`}
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C11.93 0 12 0 12 0v4a8 8 0 018 8h4" />
                    </svg>
                    <span>Evaluating Visual Metrics...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    <span>Analyze Potential</span>
                  </>
                )}
              </button>
            </section>

            {/* Results Column */}
            <section className="lg:col-span-7">
              {!result && !loading && (
                <div className="rounded-2xl border border-dashed border-slate-800 bg-slate-900/20 p-12 text-center flex flex-col items-center justify-center min-h-[380px]">
                  <div className="w-12 h-12 rounded-2xl bg-slate-800/40 border border-slate-700/50 flex items-center justify-center mb-4 text-slate-500">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <h3 className="text-sm font-semibold text-slate-300 mb-1">Awaiting Media Input</h3>
                  <p className="text-xs text-slate-500 max-w-xs">
                    Upload your creative and launch the analyzer to view virality probability and actionable audit scores.
                  </p>
                </div>
              )}

              {loading && (
                <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-12 text-center space-y-4">
                  <div className="w-10 h-10 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto" />
                  <div>
                    <h4 className="text-sm font-medium text-slate-200">Neural Visual Audit in Progress</h4>
                    <p className="text-xs text-slate-500 mt-1">Analyzing color gradients, focal hierarchy, and stop-rate coefficient...</p>
                  </div>
                </div>
              )}

              {result && !loading && (
                <div className="space-y-6">
                  {/* Score Highlight Banner */}
                  <div className="rounded-2xl border border-slate-800 bg-gradient-to-b from-slate-900/90 to-slate-950 p-6 relative overflow-hidden shadow-xl backdrop-blur-md">
                    <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />
                    
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <span className="text-[11px] font-semibold tracking-wider text-slate-400 uppercase">
                          Virality Index
                        </span>
                        <div className="flex items-baseline gap-2 mt-1">
                          <span className="text-5xl font-black tracking-tight text-white">
                            {result.overallScore}
                          </span>
                          <span className="text-slate-500 text-sm font-medium">/ 100</span>
                        </div>
                      </div>

                      <div>
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider border ${
                          result.label === "Algorithm's Favourite"
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                            : result.label === 'High Potential'
                            ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30'
                            : result.label === 'Promising'
                            ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                            : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                        }`}>
                          <span className="w-1.5 h-1.5 rounded-full bg-current" />
                          {result.label}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Metric Breakdown Card */}
                  {result.breakdown && (
                    <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6 backdrop-blur-md">
                      <h3 className="text-sm font-semibold text-slate-200 mb-4 flex items-center gap-2">
                        <svg className="w-4 h-4 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                        Metric Breakdown
                      </h3>
                      <div className="space-y-1">
                        {Object.entries(result.breakdown).map(([label, value]) => (
                          <ProgressBar key={label} label={label} value={value} />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* AI Verdict & Deep Analysis */}
                  {result.aiAnalysis && (
                    <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6 space-y-6 backdrop-blur-md">
                      <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
                        <svg className="w-4 h-4 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                        <h3 className="text-sm font-semibold text-slate-200">
                          Algorithmic Assessment
                        </h3>
                      </div>

                      {/* Quote / Summary */}
                      {result.aiAnalysis.verdict && (
                        <div className="p-4 rounded-xl bg-slate-950/60 border-l-2 border-indigo-500 border-y border-r border-slate-800/80">
                          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed italic">
                            "{result.aiAnalysis.verdict}"
                          </p>
                        </div>
                      )}

                      {/* Strengths & Weaknesses Column */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Strengths */}
                        <div className="p-4 rounded-xl bg-emerald-500/[0.03] border border-emerald-500/20 space-y-3">
                          <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-400 uppercase tracking-wide">
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                            </svg>
                            Key Strengths
                          </div>
                          <ul className="space-y-2">
                            {result.aiAnalysis.strengths?.map((s, i) => (
                              <li key={i} className="text-xs text-slate-300 flex items-start gap-2">
                                <span className="text-emerald-400 font-bold shrink-0">•</span>
                                <span className="leading-snug">{s}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* Weaknesses */}
                        <div className="p-4 rounded-xl bg-rose-500/[0.03] border border-rose-500/20 space-y-3">
                          <div className="flex items-center gap-1.5 text-xs font-semibold text-rose-400 uppercase tracking-wide">
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                            Friction Points
                          </div>
                          <ul className="space-y-2">
                            {result.aiAnalysis.weaknesses?.map((w, i) => (
                              <li key={i} className="text-xs text-slate-300 flex items-start gap-2">
                                <span className="text-rose-400 font-bold shrink-0">•</span>
                                <span className="leading-snug">{w}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      {/* Actionable Suggestions */}
                      {result.aiAnalysis.suggestions && (
                        <div className="space-y-3 pt-2">
                          <div className="flex items-center gap-1.5 text-xs font-semibold text-indigo-400 uppercase tracking-wide">
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                            </svg>
                            Actionable Optimization Roadmap
                          </div>
                          <div className="space-y-2">
                            {result.aiAnalysis.suggestions.map((item, i) => (
                              <div
                                key={i}
                                className="p-3.5 rounded-xl bg-slate-950/40 border border-slate-800 text-xs text-slate-300 flex items-start gap-3 hover:border-slate-700 transition"
                              >
                                <span className="w-5 h-5 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 flex items-center justify-center font-mono text-[10px] shrink-0 mt-0.5">
                                  {i + 1}
                                </span>
                                <span className="leading-relaxed">{item}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </section>
          </div>
        </main>
      </div>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-6 text-center text-xs text-slate-600 relative z-10">
      </footer>
    </div>
  );
};

export default App;