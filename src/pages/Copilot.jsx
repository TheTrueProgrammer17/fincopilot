import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useUser } from "../context/UserContext";
import {
  formatINR,
  buildProfile,
  calculateDashboardMetrics,
} from "../utils/helpers";
import { Send, Bot, ArrowLeft } from "lucide-react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";

const SUGGESTIONS = [
  "Should I start a SIP?",
  "Can I afford a new bike?",
  "Should I take a personal loan?",
  "How much rent can I afford in Bangalore?",
  "How much emergency fund do I need?",
];

function TypingIndicator() {
  return (
    <div className="flex items-end gap-3 mb-4">
      <div
        className="w-8 h-8 flex items-center justify-center flex-shrink-0"
        style={{
          background: "#FDEBD0",
          border: "2px solid #F39C12",
          boxShadow: "2px 2px 0px #F39C12",
        }}
      >
        <Bot size={16} color="#F39C12" />
      </div>
      <div style={{
        background: '#F0E8D8',
        border: '2px solid #2C1810',
        boxShadow: '2px 2px 0px #2C1810',
        padding: '12px 16px',
      }}>
        <div className="flex items-center gap-1.5">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="typing-dot"
              style={{
                animationDelay: `${i * 0.15}s`,
                animationDuration: "1s",
                animationName: "typing-bounce",
                animationIterationCount: "infinite",
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default function Copilot() {
  const navigate = useNavigate();
  const { user, hasProfile, transactions } = useUser();
  const { user: authUser } = useAuth();
  const metrics = calculateDashboardMetrics(transactions, user);
  const defaultMessage = {
    role: "ai",
    text: `👋 Hi${user.name ? " " + user.name : ""}! I'm FinCopilot, your personal financial advisor. Ask me anything about your money, investments, or financial decisions. I'll give you advice tailored to your profile.`,
  };
  const [messages, setMessages] = useState([defaultMessage]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [started, setStarted] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    if (!authUser) return;
    const loadChat = async () => {
      const { data } = await supabase
        .from("chats")
        .select("messages")
        .eq("user_id", authUser.id)
        .single();
      if (data && data.messages && data.messages.length > 0) {
        setMessages(data.messages);
        setStarted(true);
      } else {
        const local = localStorage.getItem("fincopilot_chat");
        if (local) {
          const parsed = JSON.parse(local);
          setMessages(parsed);
          setStarted(true);
          saveChat(parsed);
        }
      }
    };
    loadChat();
  }, [authUser]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing]);

  const saveChat = async (msgs) => {
    if (!authUser) return;
    localStorage.setItem("fincopilot_chat", JSON.stringify(msgs));
    const { data: existing } = await supabase
      .from("chats")
      .select("id")
      .eq("user_id", authUser.id)
      .single();
    if (existing) {
      await supabase
        .from("chats")
        .update({ messages: msgs })
        .eq("user_id", authUser.id);
    } else {
      await supabase
        .from("chats")
        .insert([{ user_id: authUser.id, messages: msgs }]);
    }
  };

  const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000/api";

  const sendMessage = async (text) => {
    const msg = text || input.trim();
    if (!msg) return;
    setInput("");
    setStarted(true);

    const newMessages = [...messages, { role: "user", text: msg }];
    setMessages(newMessages);
    await saveChat(newMessages);
    setTyping(true);

    try {
      const res = await fetch(`${API_BASE}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          profile: buildProfile(user),
          metrics_summary: {
            monthly_income: metrics.monthlyIncome,
            monthly_expenses: metrics.monthlyExpenses,
            net_savings: metrics.netSavings,
            savings_rate: metrics.savingsRate,
            health_score: metrics.scores.overall,
            emergency_fund_months: metrics.emfMonths,
            top_spending_categories: Object.fromEntries(
              Object.entries(metrics.categorySpend)
                .sort(([, a], [, b]) => b - a)
                .slice(0, 3),
            ),
            transaction_count: transactions.length,
          },
          message: msg,
          conversation_history: messages.map((m) => ({
            role: m.role,
            content: m.text,
          })),
        }),
      });
      if (!res.ok) {
        throw new Error(`API Error: ${res.status}`);
      }
      const data = await res.json();
      setTyping(false);
      const aiResponse = [...newMessages, { role: "ai", text: data.response }];
      setMessages(aiResponse);
      await saveChat(aiResponse);
    } catch (e) {
      setTyping(false);
      const errorMsg =
        e instanceof TypeError
          ? "Network error: Make sure you have a stable internet connection and the backend is reachable."
          : "Sorry, I ran into an error processing your request. Please try again later.";
      const errResponse = [...newMessages, { role: "ai", text: errorMsg }];
      setMessages(errResponse);
      await saveChat(errResponse);
    }
  };

  const handleKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col h-screen pb-16 md:pb-0"
      style={{ background: "#F5F5F0" }}
    >
      {/* Header titlebar */}
      <div
        className="px-4 py-3 flex items-center gap-3 flex-shrink-0 retro-titlebar-blue retro-titlebar"
        style={{ fontSize: '14px', padding: '10px 16px' }}
      >
        <button
          onClick={() => navigate(-1)}
          className="mr-1"
          style={{ color: '#F0E8D8', background: 'none', border: 'none', cursor: 'pointer' }}
          aria-label="Go back"
        >
          <ArrowLeft size={18} />
        </button>
        <div
          className="w-8 h-8 flex items-center justify-center"
          style={{
            background: "rgba(240,232,216,0.2)",
            border: "1px solid rgba(240,232,216,0.4)",
          }}
        >
          <Bot size={16} color="#F0E8D8" />
        </div>
        <div>
          <span style={{ fontWeight: 800, letterSpacing: '0.08em' }}>🤖 FINCOPILOT CHAT</span>
          <p style={{ fontSize: '10px', color: 'rgba(240,232,216,0.7)', fontWeight: 500, textTransform: 'none', letterSpacing: 0 }}>
            Always answers based on your financial profile
          </p>
        </div>
        <div className="ml-auto flex items-center gap-1.5">
          <div className="w-2 h-2 bg-[#2D6A2D] animate-pulse-slow" style={{ border: '1px solid #2C1810' }} />
          <span style={{ fontSize: '10px', fontWeight: 700, color: '#F0E8D8' }}>ONLINE</span>
        </div>
      </div>

      {/* Chat area */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-1">
        {/* Suggestions */}
        <AnimatePresence>
          {!started && (
            <motion.div
              initial={{ opacity: 1 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-6"
            >
              <p style={{ color: '#4A3728', fontSize: '12px', textAlign: 'center', marginBottom: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                Suggested Questions
              </p>
              <div className="flex flex-wrap gap-2 justify-center">
                {SUGGESTIONS.map((s) => (
                  <motion.button
                    key={s}
                    whileTap={{ scale: 0.96 }}
                    onClick={() => sendMessage(s)}
                    className="retro-btn"
                    style={{ fontSize: '11px', padding: '6px 12px', textTransform: 'none', letterSpacing: 0 }}
                  >
                    {s}
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Messages */}
        {messages.map((msg, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className={`flex items-end gap-3 mb-4 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
          >
            {msg.role === "ai" && (
              <div
                className="w-8 h-8 flex items-center justify-center flex-shrink-0"
                style={{
                  background: "#FDEBD0",
                  border: "2px solid #F39C12",
                  boxShadow: "2px 2px 0px #F39C12",
                }}
              >
                <Bot size={16} color="#F39C12" />
              </div>
            )}
            <div
              style={
                msg.role === "user"
                  ? {
                      background: "#D4A843",
                      border: "2px solid #2C1810",
                      boxShadow: "2px 2px 0px #2C1810",
                      fontFamily: "Space Grotesk",
                      color: "#1A0A00",
                      padding: "10px 14px",
                      maxWidth: "70%",
                      fontSize: "14px",
                      lineHeight: 1.5,
                    }
                  : {
                      background: "#F0E8D8",
                      border: "2px solid #2C1810",
                      boxShadow: "2px 2px 0px #2C1810",
                      fontFamily: "Space Grotesk",
                      color: "#1A0A00",
                      padding: "10px 14px",
                      maxWidth: "70%",
                      fontSize: "14px",
                      lineHeight: 1.5,
                    }
              }
            >
              {msg.text}
            </div>
          </motion.div>
        ))}

        {typing && <TypingIndicator />}
        <div ref={bottomRef} />
      </div>

      {/* Input bar */}
      <div
        style={{ borderTop: "2.5px solid #2C1810", background: "#E8DCC8", padding: "12px", display: "flex", gap: "8px", flexShrink: 0 }}
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKey}
          placeholder="Ask FinCopilot anything..."
          className="retro-input flex-1"
          style={{ border: "2.5px solid #2C1810" }}
        />
        <button
          onClick={() => sendMessage()}
          disabled={!input.trim()}
          className="retro-btn retro-btn-green"
        >
          Send ▶
        </button>
      </div>
    </motion.div>
  );
}
