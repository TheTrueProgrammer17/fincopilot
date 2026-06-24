from fastapi import APIRouter, HTTPException
from models import InsightsRequest
from engine import calculate_metrics
from gemini import get_dashboard_insights

router = APIRouter()

@router.post("/insights")
async def insights(request: InsightsRequest):
    try:
        metrics = calculate_metrics(request.profile)
        explanation = get_dashboard_insights(
            profile=request.profile.dict(),
            metrics=metrics
        )
        return {"metrics": metrics, "insights": explanation}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
