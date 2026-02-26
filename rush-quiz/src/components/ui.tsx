import React, { CSSProperties, ReactNode } from "react";
import { C, FONT_BODY, FONT_DISPLAY } from "../constants";

// ─── BTN ─────────────────────────────────────────────────────────────────────

type BtnVariant = "primary" | "cyan" | "ghost" | "danger" | "success" | "warning";
type BtnSize    = "xs" | "sm" | "md" | "lg";

interface BtnProps {
  children: ReactNode;
  onClick?: () => void;
  variant?: BtnVariant;
  size?: BtnSize;
  disabled?: boolean;
  style?: CSSProperties;
  type?: "button" | "submit";
  title?: string;
}

export const Btn: React.FC<BtnProps> = ({
  children, onClick, variant = "primary", size = "md", disabled, style = {}, type = "button", title,
}) => {
  const sizes: Record<BtnSize, CSSProperties> = {
    xs: { padding: "5px 12px",  fontSize: 11 },
    sm: { padding: "8px 16px",  fontSize: 13 },
    md: { padding: "11px 26px", fontSize: 15 },
    lg: { padding: "15px 38px", fontSize: 17 },
  };
  const variants: Record<BtnVariant, CSSProperties> = {
    primary: { background: `linear-gradient(135deg, ${C.accent}, #b8003a)`, color: "#fff",      boxShadow: `0 4px 18px ${C.accentGlow}` },
    cyan:    { background: `linear-gradient(135deg, ${C.cyan},  #008fa8)`,  color: C.bg,        boxShadow: `0 4px 18px ${C.cyanGlow}` },
    ghost:   { background: "transparent", border: `1px solid ${C.border}`, color: C.text },
    danger:  { background: `linear-gradient(135deg, #ff1744, #8b0000)`,    color: "#fff",      boxShadow: "0 4px 18px rgba(255,23,68,0.3)" },
    success: { background: `linear-gradient(135deg, ${C.success}, #00813e)`, color: C.bg,      boxShadow: "0 4px 18px rgba(0,230,118,0.3)" },
    warning: { background: `linear-gradient(135deg, ${C.warning}, #c67c00)`, color: C.bg,      boxShadow: "0 4px 18px rgba(255,171,0,0.3)" },
  };
  return (
    <button
      type={type}
      title={title}
      disabled={disabled}
      onClick={disabled ? undefined : onClick}
      style={{
        fontFamily: FONT_BODY,
        fontWeight: 700,
        letterSpacing: "0.07em",
        textTransform: "uppercase" as const,
        border: "none",
        borderRadius: 5,
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.45 : 1,
        transition: "all 0.15s ease",
        ...sizes[size],
        ...variants[variant],
        ...style,
      }}
    >
      {children}
    </button>
  );
};

// ─── CARD ─────────────────────────────────────────────────────────────────────

interface CardProps {
  children: ReactNode;
  style?: CSSProperties;
  glow?: "accent" | "cyan" | "gold";
  onClick?: () => void;
  className?: string;
}

export const Card: React.FC<CardProps> = ({ children, style = {}, glow, onClick, className }) => {
  const glowMap = {
    accent: { border: `1px solid ${C.accent}`, boxShadow: `0 0 28px ${C.accentGlow}` },
    cyan:   { border: `1px solid ${C.cyan}`,   boxShadow: `0 0 28px ${C.cyanGlow}` },
    gold:   { border: `1px solid ${C.gold}`,   boxShadow: `0 0 28px rgba(255,215,0,0.3)` },
  };
  return (
    <div
      className={className}
      onClick={onClick}
      style={{
        background: C.card,
        border: `1px solid ${C.border}`,
        borderRadius: 9,
        padding: 22,
        ...(glow ? glowMap[glow] : {}),
        ...(onClick ? { cursor: "pointer", transition: "all 0.2s" } : {}),
        ...style,
      }}
    >
      {children}
    </div>
  );
};

// ─── LOGO ─────────────────────────────────────────────────────────────────────

export const Logo: React.FC<{ size?: number }> = ({ size = 32 }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
    <div style={{
      width: size, height: size,
      background: `linear-gradient(135deg, ${C.accent}, ${C.cyan})`,
      borderRadius: 7, display: "flex", alignItems: "center", justifyContent: "center",
      fontFamily: FONT_DISPLAY, fontWeight: 900, fontSize: size * 0.46, color: "#fff",
      boxShadow: `0 0 18px ${C.accentGlow}`,
      flexShrink: 0,
    }}>R</div>
    <span style={{
      fontFamily: FONT_DISPLAY, fontWeight: 900, fontSize: size * 0.72,
      background: `linear-gradient(90deg, ${C.accent}, ${C.cyan})`,
      WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
      letterSpacing: "0.1em",
    }}>RUSH</span>
  </div>
);

// ─── TIMER ────────────────────────────────────────────────────────────────────

export const Timer: React.FC<{ seconds: number; max: number }> = ({ seconds, max }) => {
  const pct   = (seconds / max) * 100;
  const color = seconds <= 5 ? C.accent : seconds <= 10 ? C.warning : C.cyan;
  return (
    <div style={{ textAlign: "center" }}>
      <div style={{
        fontFamily: FONT_DISPLAY, fontSize: 46, fontWeight: 900,
        color, textShadow: `0 0 16px ${color}`, lineHeight: 1,
        animation: seconds <= 5 ? "pulseGlow 0.5s ease-in-out infinite" : "none",
      }}>{seconds}</div>
      <div style={{ height: 4, background: C.border, borderRadius: 2, marginTop: 7, overflow: "hidden", width: 80 }}>
        <div style={{
          height: "100%", width: `${pct}%`,
          background: color, transition: "width 1s linear", borderRadius: 2,
        }} />
      </div>
    </div>
  );
};

// ─── BADGE ────────────────────────────────────────────────────────────────────

interface BadgeProps { children: ReactNode; color?: string; }
export const Badge: React.FC<BadgeProps> = ({ children, color = C.muted }) => (
  <span style={{
    display: "inline-block", padding: "3px 10px",
    background: `${color}22`, border: `1px solid ${color}55`,
    borderRadius: 20, fontSize: 12, color,
    fontFamily: FONT_DISPLAY, letterSpacing: "0.08em",
  }}>{children}</span>
);

// ─── INPUT FIELD ─────────────────────────────────────────────────────────────

interface FieldProps {
  label?: string;
  hint?: string;
  children: ReactNode;
  required?: boolean;
}
export const Field: React.FC<FieldProps> = ({ label, hint, children, required }) => (
  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
    {label && (
      <label style={{ fontSize: 12, color: C.muted, letterSpacing: "0.12em", textTransform: "uppercase", display: "flex", gap: 4 }}>
        {label}{required && <span style={{ color: C.accent }}>*</span>}
      </label>
    )}
    {children}
    {hint && <span style={{ fontSize: 12, color: C.muted }}>{hint}</span>}
  </div>
);

// ─── SECTION HEADING ─────────────────────────────────────────────────────────

export const SectionHead: React.FC<{ title: string; sub?: string }> = ({ title, sub }) => (
  <div style={{ marginBottom: 28 }}>
    <h2 style={{ fontFamily: FONT_DISPLAY, fontSize: 20, fontWeight: 700, letterSpacing: "0.05em" }}>{title}</h2>
    {sub && <p style={{ color: C.muted, fontSize: 14, marginTop: 5 }}>{sub}</p>}
  </div>
);

// ─── BACK BUTTON ─────────────────────────────────────────────────────────────

export const BackBtn: React.FC<{ onClick: () => void; label?: string }> = ({ onClick, label = "Back" }) => (
  <button onClick={onClick} style={{
    background: "none", border: "none", color: C.muted, cursor: "pointer",
    fontSize: 14, display: "flex", alignItems: "center", gap: 6,
    fontFamily: FONT_BODY, letterSpacing: "0.05em", marginBottom: 26, padding: 0,
    transition: "color 0.15s",
  }}>
    ← {label}
  </button>
);

// ─── LIVE DOT ─────────────────────────────────────────────────────────────────

export const LiveDot: React.FC<{ count?: number }> = ({ count }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
    <div style={{ position: "relative", width: 10, height: 10 }}>
      <div style={{ position: "absolute", inset: 0, borderRadius: "50%", background: C.success, animation: "ping 1.6s ease-in-out infinite" }} />
      <div style={{ position: "absolute", inset: 0, borderRadius: "50%", background: C.success }} />
    </div>
    {count !== undefined && (
      <span style={{ fontSize: 13, color: C.success, fontFamily: FONT_DISPLAY, letterSpacing: "0.05em" }}>
        {count} LIVE
      </span>
    )}
  </div>
);

// ─── DIVIDER ─────────────────────────────────────────────────────────────────

export const Divider: React.FC<{ label?: string }> = ({ label }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "18px 0" }}>
    <div style={{ flex: 1, height: 1, background: C.border }} />
    {label && <span style={{ fontSize: 12, color: C.muted, letterSpacing: "0.1em", textTransform: "uppercase" }}>{label}</span>}
    <div style={{ flex: 1, height: 1, background: C.border }} />
  </div>
);

// ─── QUESTION TYPE ICON ───────────────────────────────────────────────────────

export const QTypeIcon: React.FC<{ type: string }> = ({ type }) => {
  const map: Record<string, { icon: string; color: string; label: string }> = {
    multiple_choice: { icon: "⊞", color: C.cyan,    label: "Multiple Choice" },
    short_answer:    { icon: "✎", color: C.warning,  label: "Short Answer" },
    numeric:         { icon: "#", color: C.success,  label: "Numeric" },
  };
  const info = map[type] || { icon: "?", color: C.muted, label: type };
  return (
    <span title={info.label} style={{
      display: "inline-flex", alignItems: "center", justifyContent: "center",
      width: 28, height: 28, borderRadius: 5,
      background: `${info.color}18`, border: `1px solid ${info.color}44`,
      color: info.color, fontSize: 14, fontWeight: 700,
    }}>{info.icon}</span>
  );
};

// ─── EMPTY STATE ─────────────────────────────────────────────────────────────

export const Empty: React.FC<{ icon?: string; title: string; sub?: string }> = ({ icon = "📭", title, sub }) => (
  <div style={{ textAlign: "center", padding: "56px 24px", color: C.muted }}>
    <div style={{ fontSize: 48, marginBottom: 16 }}>{icon}</div>
    <div style={{ fontSize: 17, fontWeight: 700, color: C.text, marginBottom: 6 }}>{title}</div>
    {sub && <div style={{ fontSize: 14 }}>{sub}</div>}
  </div>
);
