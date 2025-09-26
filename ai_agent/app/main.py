from app.api.supervisor import supervisor
from fastapi import FastAPI

# from app.api.enhanced_supervisor import enhanced_supervisor

app = FastAPI(title="AI-Powered PR Reviewer")

app.include_router(supervisor)
# app.include_router(enhanced_supervisor)


@app.get("/")
async def root():
    return {"message": "AI-Powered PR Reviewer is running!"}


@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "endpoints": {
            "basic": "/ai_agent/",
            # "enhanced": "/enhanced_ai_agent/",
            # "chunked": "/enhanced_ai_agent/chunked_review"
        },
    }
