import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes.chat import router as chat_router
from routes.insights import router as insights_router
from routes.simulator import router as simulator_router

app = FastAPI(title="FinCopilot API", version="1.0.0")

# Allow all origins by default for easy Vercel deployment,
# or restrict via ALLOWED_ORIGINS env var
allowed_origins = os.getenv("ALLOWED_ORIGINS", "*").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(chat_router, prefix="/api")
app.include_router(simulator_router, prefix="/api")
app.include_router(insights_router, prefix="/api")


@app.get("/")
def root():
    return {"status": "FinCopilot API running", "version": "1.0.0"}
