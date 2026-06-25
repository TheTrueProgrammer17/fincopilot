import logging
import os

from dotenv import load_dotenv
from google import genai

load_dotenv()
client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))
MODEL = "gemini-3.1-flash-lite"

SYSTEM_PROMPT = """You are FinCopilot.

Only answer questions related to:
- budgeting
- banking
- saving
- investing
- insurance
- loans
- credit score
- taxation
- fintech
- personal finance
- financial planning
- debt management

If a question is unrelated, respond:
"FinCopilot only answers finance-related questions."

RULES:
1. Always use the user's actual financial numbers provided — never invent or recalculate numbers.
2. Explain WHY before WHAT.
3. Give educational guidance only — not regulated financial advice.
4. Never recommend specific stocks, mutual funds, or financial products by name.
5. End every response with one practical action the user can take today.
6. Speak simply and conversationally — like a knowledgeable friend, not a banker.
7. Keep responses under 180 words.
8. Use ₹ for all currency values. Use Indian financial context.
9. Never calculate EMI, health scores, savings rates, or any financial metrics — these are always provided to you."""


def _generate(prompt: str) -> str:
    try:
        response = client.models.generate_content(model=MODEL, contents=prompt)
        return (response.text or "").strip()
    except Exception as e:
        logging.error(f"Gemini API Error: {e}")
        return "I'm currently experiencing high demand or a temporary issue. Please try again in a few moments!"


def get_chat_response(
    profile: dict,
    metrics: dict,
    user_message: str,
    history: list,
    metrics_summary: dict | None = None,
) -> str:
    tx_context = ""
    if metrics_summary and metrics_summary.get("transaction_count", 0) > 0:
        top_cats = metrics_summary.get("top_spending_categories", {})
        top_cats_str = (
            ", ".join([f"{k}: ₹{v:,.0f}" for k, v in top_cats.items()])
            if top_cats
            else "None recorded"
        )
        tx_context = f"""
REAL TRANSACTION DATA (this month — use these over profile estimates):
- Monthly Income (from transactions): ₹{metrics_summary.get("monthly_income", 0):,.0f}
- Monthly Expenses (from transactions): ₹{metrics_summary.get("monthly_expenses", 0):,.0f}
- Net Savings: ₹{metrics_summary.get("net_savings", 0):,.0f}
- Savings Rate: {metrics_summary.get("savings_rate", 0)}%
- Health Score: {metrics_summary.get("health_score", 0)}/100
- Emergency Fund: {metrics_summary.get("emergency_fund_months", 0)} months
- Top Spending Categories: {top_cats_str}
- Total transactions recorded: {metrics_summary.get("transaction_count", 0)}
"""

    context = f"""
USER FINANCIAL PROFILE (onboarding baseline):
- Monthly Income: ₹{profile["income"]:,.0f}
- Current Savings: ₹{profile["savings"]:,.0f}
- Financial Goal: {profile["goal"]}
- Has Active Loan: {profile["has_loan"]}
{tx_context}
CALCULATED METRICS (treat as facts — do not recalculate):
- Financial Health Score: {metrics["scores"]["overall"]}/100
- Savings Rate: {metrics["savings_rate"]}%
- Emergency Fund Coverage: {metrics["emergency_fund_months"]} months
- Debt Ratio: {metrics["debt_ratio"]}%
"""
    history_text = ""
    for msg in history[-4:]:
        role = "User" if msg["role"] == "user" else "FinCopilot"
        history_text += f"{role}: {msg['content']}\n"

    full_prompt = f"{SYSTEM_PROMPT}\n\n{context}\n\nConversation so far:\n{history_text}\nUser: {user_message}\nFinCopilot:"
    return _generate(full_prompt)


def get_simulator_explanation(
    profile: dict, item_name: str, simulation_result: dict
) -> str:
    before = simulation_result["before"]
    after = simulation_result["after"]
    delta = simulation_result["delta"]

    prompt = f"""{SYSTEM_PROMPT}

USER PROFILE:
- Income: ₹{profile["income"]:,.0f}/month
- Current Savings: ₹{profile["savings"]:,.0f}
- Goal: {profile["goal"]}

SIMULATION — User is considering: {item_name}
Additional monthly cost/EMI: ₹{simulation_result["additional_emi"]:,.0f}

BEFORE (engine-calculated facts):
- Health Score: {before["scores"]["overall"]}/100
- Savings Rate: {before["savings_rate"]}%
- Emergency Fund: {before["emergency_fund_months"]} months
- Monthly Surplus: ₹{before["surplus"]:,.0f}

AFTER (engine-calculated facts):
- Health Score: {after["scores"]["overall"]}/100
- Savings Rate: {after["savings_rate"]}%
- Emergency Fund: {after["emergency_fund_months"]} months
- Monthly Surplus: ₹{after["surplus"]:,.0f}

Score change: {delta["overall"]:+d} points

Explain what this means for the user in 3-4 sentences. Should they proceed now or wait?
If they should wait, tell them exactly when and what condition to meet first.
End with one concrete action they can take today."""

    return _generate(prompt)


def get_dashboard_insights(profile: dict, metrics: dict) -> str:
    prompt = f"""{SYSTEM_PROMPT}

USER PROFILE:
- Income: ₹{profile["income"]:,.0f}/month
- Savings: ₹{profile["savings"]:,.0f}
- Goal: {profile["goal"]}

CALCULATED METRICS (treat as facts):
- Health Score: {metrics["scores"]["overall"]}/100
- Savings Rate: {metrics["savings_rate"]}%
- Emergency Fund: {metrics["emergency_fund_months"]} months covered
- Debt Ratio: {metrics["debt_ratio"]}%
- Monthly Surplus: ₹{metrics["surplus"]:,.0f}

Write exactly 3 short financial insights for this user.
Separate each with a blank line.
Each insight: 2 sentences maximum.
Be specific — use their actual numbers.
End the third insight with the single most important action they should take this week."""

    return _generate(prompt)
