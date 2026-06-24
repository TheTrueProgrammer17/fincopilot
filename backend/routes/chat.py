from fastapi import APIRouter, HTTPException
from models import ChatRequest
from engine import calculate_metrics
from gemini import get_chat_response

router = APIRouter()

@router.post("/chat")
async def chat(request: ChatRequest):
    try:
        metrics = calculate_metrics(request.profile)
        ms = request.metrics_summary.dict() if request.metrics_summary else None
        response = get_chat_response(
            profile=request.profile.dict(),
            metrics=metrics,
            user_message=request.message,
            history=[m.dict() for m in request.conversation_history],
            metrics_summary=ms
        )
        return {"response": response, "metrics": metrics}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
