from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes.chat import router as chat_router
from routes.simulator import router as simulator_router
from routes.insights import router as insights_router

app = FastAPI(title="FinCopilot API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(chat_router, prefix="/api")
app.include_router(simulator_router, prefix="/api")
app.include_router(insights_router, prefix="/api")

@app.get("/")
def root():
    return {"status": "FinCopilot API running", "version": "1.0.0"}
