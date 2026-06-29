import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useUser } from "../context/UserContext";
import { getScoreColor, formatINR, buildProfile } from "../utils/helpers";
import EmptyState from "../components/EmptyState";
import { Loader2, ChevronRight, ArrowLeft } from "lucide-react";

const SCENARIOS = [
  {
    id: "vehicle",
    emoji: "🚲",
    label: "Buy a Vehicle",
    defaultName: "New Vehicle",
  },
  {
    id: "apartment",
    emoji: "🏠",
    label: "Move Apartments",
    defaultName: "New Apartment",
  },
  {
    id: "laptop",
    emoji: "💻",
    label: "Buy a Laptop / Device",
    defaultName: "New Laptop",
  },
  {
    id: "education",
    emoji: "🎓",
    label: "Take Education Loan",
    defaultName: "Education Loan",
  },
  { id: "custom", emoji: "✏️", label: "Custom Scenario", defaultName: "" },
];

function AnimatedNumber({ from, to, duration = 1500 }) {
  const [val, setVal] = useState(from);
  useEffect(() => {
    let start = null;
    const step = (ts) => {
      if (!start) start = ts;
      const progress = Math.min((ts - start) / duration, 1);
      setVal(Math.round(from + (to - from) * progress));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [from, to]);
  return <>{val}</>;
}

export default function Simulator() {
  const navigate = useNavigate();
  const { user, hasProfile } = useUser();
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState({
    name: "",
    cost: "",
    isLoan: false,
    rate: "",
    months: "",
  });
  const [calculating, setCalculating] = useState(false);
  const [result, setResult] = useState(null);

  if (!hasProfile)
    return (
      <EmptyState message="Set up your financial profile to use the simulator." />
    );

  const { income, expenses, savings, loans, scores } = user;
  const totalExpenses =
    Object.values(expenses || {}).reduce((a, b) => a + Number(b), 0) +
    (loans?.hasLoan ? Number(loans?.emi || 0) : 0);
  const existingEmi = loans?.hasLoan ? Number(loans?.emi || 0) : 0;
  const goalScore = 10;

  const handleScenarioSelect = (s) => {
    setSelected(s);
    setForm((f) => ({ ...f, name: s.defaultName }));
    setResult(null);
  };

  const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000/api";

  const handleSimulate = async () => {
    if (!form.cost) return;
    setCalculating(true);

    const totalCost = Number(form.cost);
    const loanAmount = form.isLoan ? totalCost : 0;
    const interestRate = Number(form.rate) || 10;
    const loanMonths = Number(form.months) || 24;

    try {
      const res = await fetch(`${API_BASE}/simulate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          profile: buildProfile(user),
          item_name: form.name || selected?.label || "Purchase",
          total_cost: totalCost,
          is_loan: form.isLoan,
          loan_amount: loanAmount,
          interest_rate: interestRate,
          loan_months: loanMonths,
        }),
      });
      if (!res.ok) {
        throw new Error(`API Error: ${res.status}`);
      }
      const data = await res.json();
      setResult({
        before: {
          overall: data.before.scores.overall,
          savingsRate: Math.round(data.before.savings_rate),
          emfMonths: String(data.before.emergency_fund_months),
        },
        after: {
          overall: data.after.scores.overall,
          savingsRate: Math.round(data.after.savings_rate),
          emfMonths: String(data.after.emergency_fund_months),
        },
        emi: data.additional_emi,
        drop: -data.delta.overall,
        explanation: data.explanation,
      });
    } catch (e) {
      const rate = interestRate;
      const months = loanMonths;
      const emi =
        loanAmount > 0
          ? (loanAmount * (rate / 1200) * Math.pow(1 + rate / 1200, months)) /
            (Math.pow(1 + rate / 1200, months) - 1)
          : 0;
      const newTotalExpenses =
        totalExpenses + emi + (!form.isLoan ? totalCost / 12 : 0);
      const newSavingsRate =
        income > 0 ? (income - newTotalExpenses) / income : 0;
      const newDebtRatio = income > 0 ? (existingEmi + emi) / income : 0;
      const newEmfMonths =
        newTotalExpenses > 0 ? savings / newTotalExpenses : 0;
      const newSavingsScore = Math.min(100, Math.max(0, newSavingsRate * 500));
      const newDebtScore = Math.max(0, 100 - newDebtRatio * 200);
      const newEmfScore = Math.min(100, (newEmfMonths / 6) * 100);
      const newOverall = Math.round(
        newSavingsScore * 0.3 +
          newDebtScore * 0.3 +
          newEmfScore * 0.25 +
          goalScore * 0.15,
      );
      const currentSavingsRate =
        income > 0 ? (income - totalExpenses) / income : 0;
      const currentEmf = totalExpenses > 0 ? savings / totalExpenses : 0;
      setResult({
        before: {
          overall: scores.overall,
          savingsRate: Math.round(currentSavingsRate * 100),
          emfMonths: currentEmf.toFixed(1),
        },
        after: {
          overall: newOverall,
          savingsRate: Math.round(newSavingsRate * 100),
          emfMonths: newEmfMonths.toFixed(1),
        },
        emi: Math.round(emi),
        drop: scores.overall - newOverall,
        explanation: null,
      });
    }
    setCalculating(false);
  };

  const aiMessage = result
    ? result.explanation ||
      (result.drop > 15
        ? "This decision would significantly impact your financial health. Consider waiting until your emergency fund reaches 3 months of expenses."
        : result.drop > 5
          ? "This decision has a moderate impact. Make sure your emergency fund is stable before proceeding."
          : "This decision has minimal financial impact given your current profile. You can proceed with confidence.")
    : "";

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="min-h-screen pb-24 md:pb-8 px-4 py-6 max-w-2xl mx-auto"
    >
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center gap-3 mb-3">
          <button
            onClick={() => navigate(-1)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#4A3728' }}
            aria-label="Go back"
          >
            <ArrowLeft size={20} />
          </button>
          <div
            className="retro-badge"
            style={{ background: '#D4A843' }}
          >
            ⚡ Decision Engine
          </div>
        </div>
        <h1 style={{ fontFamily: "'Space Grotesk'", fontWeight: 800, fontSize: '28px', color: '#1A0A00', textTransform: 'uppercase', letterSpacing: '0.03em' }}>
          Decision Simulator
        </h1>
        <p style={{ color: '#4A3728', fontSize: '14px', marginTop: '4px' }}>
          See the impact of financial decisions before you make them
        </p>
      </motion.div>

      {/* Scenario grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
        {SCENARIOS.map((s, i) => (
          <motion.button
            key={s.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => handleScenarioSelect(s)}
            className="retro-card text-center"
            style={{ cursor: 'pointer', padding: 0 }}
          >
            <div className={`retro-titlebar ${selected?.id === s.id ? 'retro-titlebar-green' : ''}`}
              style={{ justifyContent: 'center', fontSize: '10px', padding: '4px 8px' }}>
              {selected?.id === s.id ? '✓ SELECTED' : 'CLICK TO SELECT'}
            </div>
            <div style={{ padding: '16px 8px', background: '#F0E8D8' }}>
              <span style={{ fontSize: '28px', display: 'block', marginBottom: '6px' }}>{s.emoji}</span>
              <span style={{
                fontSize: '11px',
                fontWeight: 700,
                color: selected?.id === s.id ? '#2D6A2D' : '#4A3728',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}>
                {s.label}
              </span>
            </div>
          </motion.button>
        ))}
      </div>

      {/* Input Panel */}
      <AnimatePresence>
        {selected && (
          <motion.div
            key="input-panel"
            initial={{ opacity: 0, y: -20, height: 0 }}
            animate={{ opacity: 1, y: 0, height: "auto" }}
            exit={{ opacity: 0, y: -20, height: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden mb-6"
          >
            <div className="retro-card">
              <div className="retro-titlebar">
                <span>📋 Configure Scenario: {selected.label}</span>
                <span className="retro-controls" />
              </div>
              <div style={{ padding: '20px', background: '#F0E8D8' }} className="space-y-5">
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#4A3728', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Scenario Name
                  </label>
                  <input
                    value={form.name}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, name: e.target.value }))
                    }
                    className="retro-input"
                    placeholder="e.g. Honda Activa"
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#4A3728', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Total Cost (₹)
                  </label>
                  <div className="relative">
                    <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#2D6A2D', fontWeight: 700, fontSize: '16px' }}>
                      ₹
                    </span>
                    <input
                      type="number"
                      value={form.cost}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, cost: e.target.value }))
                      }
                      className="retro-input"
                      style={{ paddingLeft: '28px' }}
                      placeholder="80,000"
                    />
                  </div>
                </div>

                {/* Loan toggle */}
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#4A3728', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Paying with loan?
                  </label>
                  <div className="flex gap-3">
                    {[true, false].map((val) => (
                      <button
                        key={String(val)}
                        onClick={() => setForm((f) => ({ ...f, isLoan: val }))}
                        className={`flex-1 retro-btn ${form.isLoan === val ? 'retro-btn-green' : ''}`}
                        style={{ padding: '10px' }}
                      >
                        {val ? "Yes (Loan)" : "No (Cash)"}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Loan details slide-in */}
                <AnimatePresence>
                  {form.isLoan && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="grid grid-cols-2 gap-4 overflow-hidden"
                    >
                      <div>
                        <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#4A3728', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                          Interest Rate (%)
                        </label>
                        <input
                          type="number"
                          value={form.rate}
                          onChange={(e) =>
                            setForm((f) => ({ ...f, rate: e.target.value }))
                          }
                          className="retro-input"
                          placeholder="10.5"
                        />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#4A3728', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                          Duration (months)
                        </label>
                        <input
                          type="number"
                          value={form.months}
                          onChange={(e) =>
                            setForm((f) => ({ ...f, months: e.target.value }))
                          }
                          className="retro-input"
                          placeholder="24"
                        />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <button
                  onClick={handleSimulate}
                  disabled={calculating || !form.cost}
                  className="retro-btn retro-btn-green w-full"
                  style={{ padding: '14px', fontSize: '14px' }}
                >
                  {calculating ? (
                    <>
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{
                          repeat: Infinity,
                          duration: 1,
                          ease: "linear",
                        }}
                      >
                        <Loader2 size={18} />
                      </motion.div>{" "}
                      Calculating...
                    </>
                  ) : (
                    "Simulate Impact ⚡"
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Results */}
      <AnimatePresence>
        {result && (
          <motion.div
            key="results"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="space-y-5"
          >
            {/* Before / After */}
            <h2 style={{ fontFamily: "'Space Grotesk'", fontWeight: 800, fontSize: '20px', color: '#1A0A00', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              📊 Impact Analysis
            </h2>
            <div className="flex items-stretch gap-3">
              {/* Before */}
              <div className="retro-card flex-1">
                <div className="retro-titlebar">
                  <span>Before</span>
                  <span className="retro-controls" />
                </div>
                <div style={{ padding: '16px', background: '#F0E8D8' }} className="space-y-4">
                  {[
                    {
                      label: "Health Score",
                      before: result.before.overall,
                      after: result.after.overall,
                    },
                    {
                      label: "Savings Rate",
                      before: result.before.savingsRate,
                      after: result.after.savingsRate,
                    },
                  ].map(({ label, before }) => (
                    <div key={label}>
                      <p style={{ color: '#4A3728', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>{label}</p>
                      <p style={{ fontFamily: "'Space Grotesk'", fontWeight: 800, fontSize: '28px', color: '#1A0A00' }}>
                        {before}
                        {label.includes("Rate") ? "%" : ""}
                      </p>
                    </div>
                  ))}
                  <div>
                    <p style={{ color: '#4A3728', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>
                      Emergency Fund
                    </p>
                    <p style={{ fontFamily: "'Space Grotesk'", fontWeight: 800, fontSize: '28px', color: '#1A0A00' }}>
                      {result.before.emfMonths} mo
                    </p>
                  </div>
                </div>
              </div>

              {/* Arrow */}
              <div className="flex items-center justify-center px-1">
                <div style={{ fontSize: '24px', color: '#4A3728', fontWeight: 700 }}>→</div>
              </div>

              {/* After */}
              <div className="retro-card flex-1" style={{
                borderColor: result.drop > 10 ? '#C0392B' : result.drop < 0 ? '#2D6A2D' : '#2C1810',
                boxShadow: `4px 4px 0px ${result.drop > 10 ? '#C0392B' : result.drop < 0 ? '#2D6A2D' : '#2C1810'}`,
              }}>
                <div className={`retro-titlebar ${result.drop > 10 ? 'retro-titlebar-red' : result.drop < 0 ? 'retro-titlebar-green' : ''}`}>
                  <span>After</span>
                  <span className="retro-controls" />
                </div>
                <div style={{ padding: '16px', background: '#F0E8D8' }} className="space-y-4">
                  <div>
                    <p style={{ color: '#4A3728', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>Health Score</p>
                    <p style={{ fontFamily: "'Space Grotesk'", fontWeight: 800, fontSize: '28px', color: result.drop > 10 ? '#C0392B' : result.drop < 0 ? '#2D6A2D' : '#D4A843' }}>
                      <AnimatedNumber
                        from={result.before.overall}
                        to={result.after.overall}
                      />
                    </p>
                  </div>
                  <div>
                    <p style={{ color: '#4A3728', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>Savings Rate</p>
                    <p style={{ fontFamily: "'Space Grotesk'", fontWeight: 800, fontSize: '28px', color: result.after.savingsRate < 15 ? '#C0392B' : '#2D6A2D' }}>
                      <AnimatedNumber
                        from={result.before.savingsRate}
                        to={result.after.savingsRate}
                      />
                      %
                    </p>
                  </div>
                  <div>
                    <p style={{ color: '#4A3728', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>
                      Emergency Fund
                    </p>
                    <p style={{ fontFamily: "'Space Grotesk'", fontWeight: 800, fontSize: '28px', color: '#1A0A00' }}>
                      {result.after.emfMonths} mo
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {result.emi > 0 && (
              <div className="retro-card">
                <div style={{ padding: '12px 16px', background: '#F0E8D8', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ color: '#4A3728', fontSize: '13px', fontWeight: 600 }}>
                    Monthly EMI added
                  </span>
                  <span style={{ fontFamily: "'Space Grotesk'", fontWeight: 800, fontSize: '18px', color: '#C0392B' }}>
                    {formatINR(result.emi)}/mo
                  </span>
                </div>
              </div>
            )}

            {/* Score delta badge */}
            <div className="retro-card">
              <div style={{ padding: '12px 16px', background: '#F0E8D8', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ color: '#4A3728', fontSize: '13px', fontWeight: 600 }}>Score impact:</span>
                <span
                  style={{ fontFamily: "'Space Grotesk'", fontWeight: 800, fontSize: '18px', color: result.drop > 0 ? '#C0392B' : '#2D6A2D' }}
                >
                  {result.drop > 0 ? "-" : "+"}
                  {Math.abs(result.drop)} points
                </span>
              </div>
            </div>

            {/* AI card */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="retro-card"
            >
              <div className="retro-titlebar-blue retro-titlebar">
                <span>🤖 FinCopilot Says</span>
                <span className="retro-controls" />
              </div>
              <div style={{ padding: '16px', background: '#F0E8D8', fontStyle: 'italic', color: '#1A0A00', fontSize: '14px', lineHeight: 1.6 }}>
                {aiMessage}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
