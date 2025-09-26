from fastapi import FastAPI, Request

app = FastAPI(title="Test Receiver")

@app.post("/test/summary")
async def receive_summary(request: Request):
    data = await request.json()
    print("Received summary:", data)
    return {"status": "summary received", "data": data}

@app.post("/test/review")
async def receive_review(request: Request):
    data = await request.json()
    print("Received review:", data)
    return {"status": "review received", "data": data}