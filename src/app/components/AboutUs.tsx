import { Target, Zap, Shield, TrendingUp, Github } from "lucide-react";
import { GlitchText } from "./GlitchText";
import { NeonSeparator } from "./NeonSeparator";
import { CollaboratorCard } from "./CollaboratorCard";

const features = [
  {
    icon: <Target size={20} color="#00ff9d" />,
    title: "Accurate Predictions",
    description:
      "Deep learning model trained on thousands of URLs delivers high-precision phishing detection.",
  },
  {
    icon: <Zap size={20} color="#00ff9d" />,
    title: "Fast Analysis",
    description:
      "Real-time URL analysis completes in seconds, so you stay protected without slowing down.",
  },
  {
    icon: <Shield size={20} color="#00ff9d" />,
    title: "Privacy First",
    description:
      "URLs are analyzed locally without storing your data. Your browsing stays private.",
  },
  {
    icon: <TrendingUp size={20} color="#00ff9d" />,
    title: "Continuous Improvement",
    description:
      "The model is regularly updated with new phishing patterns to stay ahead of threats.",
  },
];

export function AboutUs() {
  return (
    <div
      style={{
        background: "#0a0f0f",
        minHeight: "100%",
        padding: "32px 24px",
        fontFamily: "monospace",
      }}
    >
      <div
        className="max-w-6xl mx-auto"
        style={{ maxWidth: 1152, margin: "0 auto" }}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* ── Left Column ── */}
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            {/* Header */}
            <div>
              <GlitchText
                text="About Link Predictor"
                style={{
                  fontSize: 32,
                  fontWeight: 800,
                  letterSpacing: "0.2em",
                  textTransform: "uppercase",
                  display: "block",
                  lineHeight: 1.2,
                }}
              />
              <p
                style={{
                  color: "rgba(0,255,255,0.5)",
                  fontSize: 11,
                  letterSpacing: "0.25em",
                  marginTop: 8,
                  marginBottom: 16,
                  textTransform: "uppercase",
                }}
              >
                PHISHING DETECTION SYSTEM v3.0
              </p>

              {/* Decorative divider — two gradient lines + diamond */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  marginBottom: 4,
                }}
              >
                <div
                  style={{
                    flex: 1,
                    height: 1,
                    background:
                      "linear-gradient(90deg, transparent, #00ff9d, transparent)",
                    boxShadow: "0 0 6px #00ff9d",
                  }}
                />
                <div
                  style={{
                    width: 8,
                    height: 8,
                    background: "#00ff9d",
                    transform: "rotate(45deg)",
                    boxShadow: "0 0 8px #00ff9d",
                    flexShrink: 0,
                  }}
                />
                <div
                  style={{
                    flex: 1,
                    height: 1,
                    background:
                      "linear-gradient(90deg, transparent, #00ff9d, transparent)",
                    boxShadow: "0 0 6px #00ff9d",
                  }}
                />
              </div>
            </div>

            <NeonSeparator />

            {/* Project description */}
            <p
              style={{
                color: "rgba(224,224,224,0.7)",
                fontSize: 14,
                lineHeight: 1.8,
                margin: 0,
              }}
            >
              PhishGuard is an advanced phishing detection system powered by
              deep learning. Using a fine-tuned sentence transformer model, it
              analyzes URLs in real-time to identify malicious links with high
              accuracy — protecting users before they click.
            </p>

            <NeonSeparator label="OUR MISSION" />

            {/* Mission */}
            <p
              style={{
                color: "rgba(224,224,224,0.7)",
                fontSize: 14,
                lineHeight: 1.8,
                margin: 0,
              }}
            >
              Our mission is to make the internet safer by giving everyone
              access to professional-grade phishing detection. We believe
              security tools should be fast, accessible, and transparent — no
              technical expertise required.
            </p>

            <NeonSeparator label="WHAT WE OFFER" />

            {/* Feature grid 2x2 */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 16,
              }}
            >
              {features.map((f) => (
                <div
                  key={f.title}
                  style={{ display: "flex", flexDirection: "column", gap: 8 }}
                >
                  <div
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 8,
                      background: "rgba(0,255,157,0.08)",
                      border: "1px solid rgba(0,255,157,0.2)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    {f.icon}
                  </div>
                  <span
                    style={{
                      color: "#e0e0e0",
                      fontSize: 13,
                      fontWeight: 600,
                    }}
                  >
                    {f.title}
                  </span>
                  <span
                    style={{
                      color: "rgba(224,224,224,0.5)",
                      fontSize: 12,
                      lineHeight: 1.6,
                    }}
                  >
                    {f.description}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* ── Right Column ── */}
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <NeonSeparator label="CORE COLLABORATORS" />

            {/* Collaborator cards */}
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <CollaboratorCard
                name="Nehemiah Gantenk Abiez"
                role="Lead Developer & AI Engineer"
                description="Deep learning model architecture, frontend engineering & system design."
              />
              <CollaboratorCard
                name="Collaborator 2"
                role="TBA"
                description="TBA"
              />
              <CollaboratorCard
                name="Collaborator 3"
                role="TBA"
                description="TBA"
              />
            </div>

            {/* View GitHub button */}
            <button
              onClick={() => window.open("https://github.com", "_blank")}
              style={{
                width: "100%",
                padding: "12px",
                borderRadius: 10,
                background: "rgba(0,255,157,0.07)",
                border: "1px solid rgba(0,255,157,0.3)",
                color: "#00ff9d",
                fontSize: 12,
                fontWeight: 700,
                letterSpacing: "0.15em",
                textTransform: "uppercase",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
              }}
            >
              <Github size={16} />
              View GitHub
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
