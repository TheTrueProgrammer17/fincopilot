import copy

def calculate_emi(principal: float, annual_rate: float, months: int) -> float:
    if annual_rate == 0 or months == 0:
        return principal / months if months > 0 else 0
    r = annual_rate / 12 / 100
    return principal * r * (1 + r)**months / ((1 + r)**months - 1)

def calculate_metrics(profile) -> dict:
    total_expenses = (
        profile.rent + profile.food + profile.transport +
        profile.entertainment + profile.other +
        (profile.emi if profile.has_loan else 0)
    )
    surplus = profile.income - total_expenses
    savings_rate = (surplus / profile.income * 100) if profile.income > 0 else 0
    debt_ratio = ((profile.emi / profile.income) * 100) if (profile.has_loan and profile.income > 0) else 0
    emf_months = (profile.savings / total_expenses) if total_expenses > 0 else 0

    savings_score = min(100, savings_rate * 5)
    debt_score = max(0, 100 - debt_ratio * 2)
    emf_score = min(100, (emf_months / 6) * 100)
    goal_score = 10

    overall = round(savings_score * 0.30 + debt_score * 0.30 + emf_score * 0.25 + goal_score * 0.15)

    return {
        "total_expenses": round(total_expenses, 2),
        "surplus": round(surplus, 2),
        "savings_rate": round(savings_rate, 1),
        "debt_ratio": round(debt_ratio, 1),
        "emergency_fund_months": round(emf_months, 1),
        "scores": {
            "overall": overall,
            "savings": round(savings_score),
            "debt": round(debt_score),
            "emergency_fund": round(emf_score),
            "goals": round(goal_score)
        }
    }

def simulate_purchase(profile, total_cost: float, is_loan: bool,
                      loan_amount: float, interest_rate: float, loan_months: int) -> dict:
    before = calculate_metrics(profile)

    additional_emi = 0
    if is_loan and loan_months > 0:
        additional_emi = calculate_emi(loan_amount, interest_rate, loan_months)

    cash_monthly_impact = (total_cost / 12) if not is_loan else 0

    new_profile = copy.deepcopy(profile)
    new_profile.other += cash_monthly_impact
    if is_loan:
        new_profile.has_loan = True
        new_profile.emi = (profile.emi or 0) + additional_emi

    after = calculate_metrics(new_profile)

    return {
        "before": before,
        "after": after,
        "delta": {
            "overall": after["scores"]["overall"] - before["scores"]["overall"],
            "savings_rate": round(after["savings_rate"] - before["savings_rate"], 1),
            "emergency_fund_months": round(after["emergency_fund_months"] - before["emergency_fund_months"], 1),
            "surplus": round(after["surplus"] - before["surplus"], 2)
        },
        "additional_emi": round(additional_emi, 2)
    }
