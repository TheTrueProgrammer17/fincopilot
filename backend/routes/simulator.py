from fastapi import APIRouter, HTTPException
from models import SimulatePurchaseRequest
from engine import simulate_purchase
from gemini import get_simulator_explanation

router = APIRouter()

@router.post("/simulate")
async def simulate(request: SimulatePurchaseRequest):
    try:
        result = simulate_purchase(
            profile=request.profile,
            total_cost=request.total_cost,
            is_loan=request.is_loan,
            loan_amount=request.loan_amount or 0,
            interest_rate=request.interest_rate or 0,
            loan_months=request.loan_months or 0
        )
        explanation = get_simulator_explanation(
            profile=request.profile.dict(),
            item_name=request.item_name,
            simulation_result=result
        )
        result["explanation"] = explanation
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
