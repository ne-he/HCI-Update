import { useState, useRef, useEffect } from "react";
import {
  ClipboardPaste, Camera, Upload, X,
  ShieldAlert, ShieldCheck, Copy, ExternalLink,
  Terminal, ChevronDown, ChevronUp,
} from "lucide-react";
import { Html5Qrcode } from "html5-qrcode";
import { motion, AnimatePresence } from "framer-motion";
import { GlitchText } from "./GlitchText";
import { MatrixProgress } from "./MatrixProgress";
import { StatisticWidget, type PredictionRecord } from "./StatisticWidget";

const STORAGE_KEY = "phishguard_history";

function loadHistory(): PredictionRecord[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]");
  } catch {
    return [];
  }
}

function saveHistory(h: PredictionRecord[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(h.slice(0, 50)));
}

interface LinkPredictorProps {
  initialUrl?: string;
}

export function LinkPredictor({ initialUrl = "" }: LinkPredictorProps) {
  const [url, setUrl] = useState(initialUrl);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const [label, setLabel] = useState<string | null>(null);
  const [accuracy, setAccuracy] = useState<number | null>(null);
  const [legitProb, setLegitProb] = useState<number | null>(null);
  const [displayLegit, setDisplayLegit] = useState(100);
  const [progress, setProgress] = useState(0);

  const [isScanning, setIsScanning] = useState(false);
  const [scanError, setScanError] = useState<string | null>(null);

  const [history, setHistory] = useState<PredictionRecord[]>(loadHistory);
  const [terminalLogs, setTerminalLogs] = useState<string[]>([]);
  const [showTerminal, setShowTerminal] = useState(false);
  const [copied, setCopied] = useState(false);

  const html5QrCodeRef = useRef<Html5Qrcode | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const terminalRef = useRef<HTMLDivElement>(null);

  // Auto-scroll terminal
  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [terminalLogs]);

  const addLog = (msg: string) => {
    const ts = new Date().toLocaleTimeString("en-US", { hour12: false });
    setTerminalLogs((prev) => [...prev, `[${ts}] ${msg}`]);
  };

  /* ── CLIPBOARD ── */
  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setUrl(text);
      addLog(`URL pasted from clipboard`);
    } catch {
      alert("Clipboard access denied");
    }
  };

  const handleCopyUrl = async () => {
    if (!url) return;
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  /* ── ANALYZE ── */
  const handleAnalyze = async () => {
    if (!url.trim()) return alert("Masukkan URL dulu");

    setIsAnalyzing(true);
    setProgress(0);
    setLabel(null);
    setAccuracy(null);
    setLegitProb(null);
    setDisplayLegit(100);
    setTerminalLogs([]);
    setShowTerminal(true);

    addLog("Initializing analysis engine...");

    const progressInterval = setInterval(() => {
      setProgress((p) => (p >= 98 ? p : p + 2));
    }, 100);

    setTimeout(() => addLog("Encoding URL with sentence-transformer..."), 600);
    setTimeout(() => addLog("Generating embedding vector [384-dim]..."), 1400);
    setTimeout(() => addLog("Running deep learning model inference..."), 2400);
    setTimeout(() => addLog("Post-processing prediction scores..."), 3600);
    setTimeout(() => addLog("Finalizing results..."), 4400);

    try {
      const res = await fetch("http://127.0.0.1:8000/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });

      if (!res.ok) throw new Error("Backend error");
      const data = await res.json();

      setTimeout(() => {
        clearInterval(progressInterval);
        setProgress(100);
        setLabel(data.label);
        setAccuracy(data.confidence);
        setLegitProb(data.legitimate_chance);
        setIsAnalyzing(false);

        addLog(`Result: ${data.label} (confidence: ${data.confidence.toFixed(1)}%)`);

        const record: PredictionRecord = {
          url,
          label: data.label,
          confidence: data.confidence,
          timestamp: Date.now(),
        };
        const updated = [record, ...history];
        setHistory(updated);
        saveHistory(updated);

        let current = 100;
        const target = data.legitimate_chance;
        const barInterval = setInterval(() => {
          current -= 1;
          setDisplayLegit(current);
          if (current <= target) {
            setDisplayLegit(target);
            clearInterval(barInterval);
          }
        }, 20);
      }, 5000);
    } catch (err) {
      clearInterval(progressInterval);
      setIsAnalyzing(false);
      addLog("ERROR: Could not connect to FastAPI backend");
      alert("Tidak bisa terhubung ke FastAPI");
      console.error(err);
    }
  };

  /* ── QR CAMERA ── */
  const startCameraScanning = async () => {
    setScanError(null);
    setIsScanning(true);
    addLog("Starting camera scanner...");
    try {
      const qr = new Html5Qrcode("qr-reader");
      html5QrCodeRef.current = qr;
      await qr.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: 250 },
        (decodedText) => {
          setUrl(decodedText);
          addLog(`QR decoded: ${decodedText}`);
          stopScanning();
        },
        () => {}
      );
    } catch {
      setScanError("Camera error / permission denied");
      setIsScanning(false);
    }
  };

  const stopScanning = async () => {
    if (html5QrCodeRef.current) {
      await html5QrCodeRef.current.stop();
      html5QrCodeRef.current.clear();
      html5QrCodeRef.current = null;
    }
    setIsScanning(false);
  };

  /* ── QR IMAGE UPLOAD ── */
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setScanError(null);
    addLog(`Scanning image: ${file.name}`);
    try {
      const qr = new Html5Qrcode("qr-file-reader");
      const result = await qr.scanFile(file, true);
      setUrl(result);
      addLog(`QR decoded from image: ${result}`);
      qr.clear();
    } catch {
      setScanError("QR / Barcode tidak terbaca");
      addLog("ERROR: Could not decode QR from image");
    }
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const isPhishing = label === "PHISHING";
  const hasResult = label !== null && accuracy !== null && legitProb !== null;

  /* ── RENDER ── */
  return (
    <div className="w-full max-w-7xl mx-auto" style={{ animation: "cyber-fade-in 0.4s ease-out" }}>

      {/* Page header */}
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold tracking-widest uppercase mb-2">
          <GlitchText text="Link Predictor" />
        </h1>
        <p className="text-sm tracking-widest" style={{ color: "rgba(0,255,255,0.5)" }}>
          DEEP LEARNING PHISHING DETECTION SYSTEM v3.0
        </p>
        {/* Decorative line */}
        <div className="flex items-center justify-center gap-3 mt-4">
          <div className="h-px flex-1 max-w-32" style={{ background: "linear-gradient(90deg, transparent, #00ff9d)" }} />
          <span className="text-xs tracking-widest" style={{ color: "#00ff9d", textShadow: "0 0 6px #00ff9d" }}>◆</span>
          <div className="h-px flex-1 max-w-32" style={{ background: "linear-gradient(90deg, #00ff9d, transparent)" }} />
        </div>
      </div>

      {/* 2-column grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* ── LEFT COLUMN: Input + Scanner ── */}
        <div className="flex flex-col gap-5">

          {/* Input card */}
          <div className="cyber-card rounded-2xl p-6">
            <p className="text-xs tracking-widest mb-4" style={{ color: "rgba(0,255,157,0.6)" }}>
              ▸ TARGET URL
            </p>

            {/* URL input row */}
            <div className="flex gap-2 mb-4">
              <div className="flex-1 relative">
                <input
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleAnalyze()}
                  placeholder="https://example.com"
                  className="cyber-input w-full px-4 py-3 rounded-lg text-sm pr-10"
                />
              </div>
              <button onClick={handlePaste} className="cyber-btn-icon px-3 rounded-lg" title="Paste">
                <ClipboardPaste className="w-4 h-4" />
              </button>
              <button onClick={handleCopyUrl} className="cyber-btn-icon px-3 rounded-lg" title="Copy">
                {copied
                  ? <span className="text-xs" style={{ color: "#00ff9d" }}>✓</span>
                  : <Copy className="w-4 h-4" />
                }
              </button>
            </div>

            {/* Analyze button */}
            <button
              onClick={handleAnalyze}
              disabled={isAnalyzing}
              className="cyber-btn-primary w-full py-3 rounded-xl relative overflow-hidden"
            >
              <span className="relative z-10 tracking-widest uppercase text-sm font-bold">
                {isAnalyzing ? "Scanning..." : "⚡ Analyze URL"}
              </span>
              {isAnalyzing && <div className="cyber-btn-sweep" />}
            </button>

            {/* Matrix progress */}
            <AnimatePresence>
              {isAnalyzing && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-4 overflow-hidden"
                >
                  <MatrixProgress progress={progress} />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* QR Scanner card */}
          <div className="cyber-card rounded-2xl p-6">
            <p className="text-xs tracking-widest mb-4" style={{ color: "rgba(0,255,255,0.6)" }}>
              ▸ QR / BARCODE SCANNER
            </p>

            {!isScanning && (
              <div className="flex gap-3">
                <button onClick={startCameraScanning} className="cyber-btn-secondary flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm flex-1 justify-center">
                  <Camera size={15} /> Camera
                </button>
                <label className="cyber-btn-secondary flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm flex-1 justify-center cursor-pointer">
                  <Upload size={15} /> Upload Image
                  <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                </label>
              </div>
            )}

            {isScanning && (
              <div>
                <button onClick={stopScanning} className="flex items-center gap-2 mb-3 text-sm" style={{ color: "#ff3b3b" }}>
                  <X size={15} /> Stop Camera
                </button>
                {/* QR overlay wrapper */}
                <div className="relative rounded-xl overflow-hidden" style={{ border: "1px solid rgba(0,255,157,0.3)" }}>
                  <div id="qr-reader" />
                  {/* Animated scan line overlay */}
                  <div className="qr-scan-overlay" />
                  {/* Corner decorations */}
                  {["tl","tr","bl","br"].map((c) => (
                    <div key={c} className={`qr-corner qr-corner-${c}`} />
                  ))}
                </div>
              </div>
            )}

            <div id="qr-file-reader" className="hidden" />
            {scanError && (
              <p className="text-xs mt-3" style={{ color: "#ff3b3b", textShadow: "0 0 6px #ff3b3b" }}>
                ⚠ {scanError}
              </p>
            )}
          </div>

          {/* Terminal log */}
          <div className="cyber-card rounded-2xl overflow-hidden">
            <button
              onClick={() => setShowTerminal((v) => !v)}
              className="w-full flex items-center justify-between px-6 py-4"
              style={{ color: "rgba(0,255,157,0.7)" }}
            >
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4" />
                <span className="text-xs tracking-widest">SYSTEM LOG</span>
                {terminalLogs.length > 0 && (
                  <span className="text-xs px-1.5 py-0.5 rounded" style={{ background: "rgba(0,255,157,0.15)", color: "#00ff9d" }}>
                    {terminalLogs.length}
                  </span>
                )}
              </div>
              {showTerminal ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>

            <AnimatePresence>
              {showTerminal && (
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: 160 }}
                  exit={{ height: 0 }}
                  className="overflow-hidden"
                >
                  <div
                    ref={terminalRef}
                    className="px-6 pb-4 overflow-y-auto"
                    style={{ height: 160, fontFamily: "monospace", fontSize: 11 }}
                  >
                    {terminalLogs.length === 0 ? (
                      <p style={{ color: "rgba(224,224,224,0.2)" }}>Awaiting input...</p>
                    ) : (
                      terminalLogs.map((log, i) => (
                        <p key={i} style={{ color: log.includes("ERROR") ? "#ff3b3b" : "rgba(0,255,157,0.7)", lineHeight: 1.8 }}>
                          {log}
                        </p>
                      ))
                    )}
                    {isAnalyzing && (
                      <span style={{ color: "#00ff9d", animation: "cyber-flicker 1s infinite" }}>█</span>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* ── RIGHT COLUMN: Result + Stats ── */}
        <div className="flex flex-col gap-5">

          {/* Result card */}
          <div className="cyber-card rounded-2xl p-6 min-h-64">
            <p className="text-xs tracking-widest mb-4" style={{ color: "rgba(0,255,255,0.6)" }}>
              ▸ ANALYSIS RESULT
            </p>

            <AnimatePresence mode="wait">
              {!hasResult && !isAnalyzing && (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-center justify-center py-12 gap-4"
                >
                  <div
                    className="w-16 h-16 rounded-full flex items-center justify-center"
                    style={{ background: "rgba(0,255,157,0.05)", border: "1px solid rgba(0,255,157,0.15)" }}
                  >
                    <ShieldAlert className="w-8 h-8" style={{ color: "rgba(0,255,157,0.3)" }} />
                  </div>
                  <p className="text-sm text-center" style={{ color: "rgba(224,224,224,0.3)" }}>
                    Enter a URL and click Analyze<br />to see the prediction result
                  </p>
                </motion.div>
              )}

              {isAnalyzing && (
                <motion.div
                  key="analyzing"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-center justify-center py-12 gap-3"
                >
                  <div
                    className="w-16 h-16 rounded-full flex items-center justify-center"
                    style={{
                      border: "2px solid rgba(0,255,157,0.4)",
                      boxShadow: "0 0 20px rgba(0,255,157,0.2)",
                      animation: "cyber-border-spin 2s linear infinite",
                    }}
                  >
                    <span style={{ color: "#00ff9d", fontSize: 24 }}>⚡</span>
                  </div>
                  <p className="text-sm tracking-widest" style={{ color: "rgba(0,255,157,0.6)" }}>
                    ANALYZING...
                  </p>
                </motion.div>
              )}

              {hasResult && !isAnalyzing && (
                <motion.div
                  key="result"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                >
                  {/* Status banner */}
                  <div
                    className="rounded-xl p-5 mb-4 flex items-center gap-4"
                    style={{
                      background: isPhishing ? "rgba(255,59,59,0.08)" : "rgba(0,255,157,0.08)",
                      border: `1px solid ${isPhishing ? "rgba(255,59,59,0.4)" : "rgba(0,255,157,0.4)"}`,
                      boxShadow: isPhishing ? "0 0 20px rgba(255,59,59,0.1)" : "0 0 20px rgba(0,255,157,0.1)",
                    }}
                  >
                    {isPhishing
                      ? <ShieldAlert className="w-10 h-10 flex-shrink-0" style={{ color: "#ff3b3b", filter: "drop-shadow(0 0 8px #ff3b3b)" }} />
                      : <ShieldCheck className="w-10 h-10 flex-shrink-0" style={{ color: "#00ff9d", filter: "drop-shadow(0 0 8px #00ff9d)" }} />
                    }
                    <div>
                      <p className="text-xs tracking-widest mb-0.5" style={{ color: "rgba(224,224,224,0.4)" }}>VERDICT</p>
                      <p
                        className="text-3xl font-bold tracking-widest"
                        style={{
                          color: isPhishing ? "#ff3b3b" : "#00ff9d",
                          textShadow: isPhishing ? "0 0 12px #ff3b3b" : "0 0 12px #00ff9d",
                        }}
                      >
                        {label}
                      </p>
                    </div>
                  </div>

                  {/* Confidence bar */}
                  <div className="mb-4">
                    <div className="flex justify-between text-xs mb-1.5" style={{ color: "rgba(224,224,224,0.5)" }}>
                      <span className="tracking-widest">CONFIDENCE</span>
                      <span style={{ color: "#00ffff" }}>{accuracy?.toFixed(1)}%</span>
                    </div>
                    <div className="h-2.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${accuracy}%` }}
                        transition={{ duration: 0.9, ease: "easeOut" }}
                        className="h-full rounded-full"
                        style={{
                          background: isPhishing ? "linear-gradient(90deg,#ff3b3b,#ff6b6b)" : "linear-gradient(90deg,#00ff9d,#00ffff)",
                          boxShadow: isPhishing ? "0 0 8px #ff3b3b" : "0 0 8px #00ff9d",
                        }}
                      />
                    </div>
                  </div>

                  {/* Legit probability bar */}
                  <div className="mb-5">
                    <div className="flex justify-between text-xs mb-1.5" style={{ color: "rgba(224,224,224,0.5)" }}>
                      <span className="tracking-widest">LEGITIMATE PROBABILITY</span>
                      <span style={{ color: "#00ffff" }}>{displayLegit.toFixed(1)}%</span>
                    </div>
                    <div className="h-2.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
                      <div
                        className="h-full rounded-full transition-all duration-75"
                        style={{
                          width: `${displayLegit}%`,
                          background: "linear-gradient(90deg,#00ff9d,#00ffff)",
                          boxShadow: "0 0 8px #00ff9d",
                        }}
                      />
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div className="flex gap-3">
                    <button
                      onClick={handleCopyUrl}
                      className="cyber-btn-secondary flex items-center gap-2 px-4 py-2 rounded-lg text-xs flex-1 justify-center"
                    >
                      <Copy size={13} />
                      {copied ? "Copied!" : "Copy URL"}
                    </button>
                    {!isPhishing && (
                      <a
                        href={url.startsWith("http") ? url : `https://${url}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="cyber-btn-secondary flex items-center gap-2 px-4 py-2 rounded-lg text-xs flex-1 justify-center"
                        style={{ textDecoration: "none" }}
                      >
                        <ExternalLink size={13} /> Open URL
                      </a>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Statistics widget */}
          <div className="cyber-card rounded-2xl p-6">
            <p className="text-xs tracking-widest mb-4" style={{ color: "rgba(0,255,157,0.6)" }}>
              ▸ STATISTICS & HISTORY
            </p>
            <StatisticWidget history={history} />
          </div>
        </div>
      </div>

      {/* Inline styles */}
      <style>{`
        .cyber-card {
          background: rgba(10,15,15,0.85);
          backdrop-filter: blur(12px);
          border: 1px solid rgba(0,255,157,0.15);
          box-shadow: 0 0 30px rgba(0,255,157,0.04), inset 0 0 30px rgba(0,0,0,0.2);
        }
        .cyber-input {
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(0,255,157,0.25);
          color: #e0e0e0;
          outline: none;
          transition: border-color 0.2s, box-shadow 0.2s;
          font-family: monospace;
        }
        .cyber-input:focus {
          border-color: #00ff9d;
          box-shadow: 0 0 12px rgba(0,255,157,0.3);
        }
        .cyber-input::placeholder { color: rgba(224,224,224,0.25); }
        .cyber-btn-icon {
          background: rgba(0,255,157,0.07);
          border: 1px solid rgba(0,255,157,0.2);
          color: #00ff9d;
          transition: all 0.2s;
          cursor: pointer;
        }
        .cyber-btn-icon:hover {
          background: rgba(0,255,157,0.14);
          box-shadow: 0 0 10px rgba(0,255,157,0.35);
        }
        .cyber-btn-primary {
          background: linear-gradient(135deg, rgba(0,255,157,0.12), rgba(0,255,255,0.08));
          border: 1px solid rgba(0,255,157,0.45);
          color: #00ff9d;
          text-shadow: 0 0 8px #00ff9d;
          transition: all 0.2s;
          cursor: pointer;
        }
        .cyber-btn-primary:hover:not(:disabled) {
          box-shadow: 0 0 20px rgba(0,255,157,0.45);
          border-color: #00ff9d;
          transform: translateY(-1px);
        }
        .cyber-btn-primary:active:not(:disabled) { transform: scale(0.98); }
        .cyber-btn-primary:disabled { opacity: 0.55; cursor: not-allowed; }
        .cyber-btn-sweep {
          position: absolute;
          top: 0; left: -60%; width: 50%; height: 100%;
          background: linear-gradient(90deg, transparent, rgba(0,255,157,0.25), transparent);
          animation: cyber-sweep 1.2s linear infinite;
        }
        .cyber-btn-secondary {
          background: rgba(0,255,255,0.05);
          border: 1px solid rgba(0,255,255,0.2);
          color: #00ffff;
          transition: all 0.2s;
          cursor: pointer;
          text-decoration: none;
        }
        .cyber-btn-secondary:hover {
          background: rgba(0,255,255,0.1);
          box-shadow: 0 0 10px rgba(0,255,255,0.25);
        }
        /* QR scanner overlay */
        .qr-scan-overlay {
          position: absolute;
          inset: 0;
          pointer-events: none;
          overflow: hidden;
        }
        .qr-scan-overlay::after {
          content: '';
          position: absolute;
          left: 0; right: 0;
          height: 2px;
          background: linear-gradient(90deg, transparent, #00ff9d, transparent);
          box-shadow: 0 0 8px #00ff9d;
          animation: cyber-scan-line 2s linear infinite;
        }
        .qr-corner {
          position: absolute;
          width: 18px; height: 18px;
          border-color: #00ff9d;
          border-style: solid;
          pointer-events: none;
        }
        .qr-corner-tl { top: 8px; left: 8px; border-width: 2px 0 0 2px; }
        .qr-corner-tr { top: 8px; right: 8px; border-width: 2px 2px 0 0; }
        .qr-corner-bl { bottom: 8px; left: 8px; border-width: 0 0 2px 2px; }
        .qr-corner-br { bottom: 8px; right: 8px; border-width: 0 2px 2px 0; }
      `}</style>
    </div>
  );
}
