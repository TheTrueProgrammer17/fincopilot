from pydantic import BaseModel
from typing import Optional, List

class UserProfile(BaseModel):
    name: str
    income: float
    rent: float
    food: float
    transport: float
    entertainment: float
    other: float
    savings: float
    has_loan: bool
    loan_amount: Optional[float] = 0
    emi: Optional[float] = 0
    goal: str

class SimulatePurchaseRequest(BaseModel):
    profile: UserProfile
    item_name: str
    total_cost: float
    is_loan: bool
    loan_amount: Optional[float] = 0
    interest_rate: Optional[float] = 0
    loan_months: Optional[int] = 0

class ChatMessage(BaseModel):
    role: str
    content: str

class MetricsSummary(BaseModel):
    monthly_income: Optional[float] = 0
    monthly_expenses: Optional[float] = 0
    net_savings: Optional[float] = 0
    savings_rate: Optional[float] = 0
    health_score: Optional[int] = 0
    emergency_fund_months: Optional[float] = 0
    top_spending_categories: Optional[dict] = {}
    transaction_count: Optional[int] = 0

class ChatRequest(BaseModel):
    profile: UserProfile
    message: str
    conversation_history: Optional[List[ChatMessage]] = []
    metrics_summary: Optional[MetricsSummary] = None

class InsightsRequest(BaseModel):
    profile: UserProfile
