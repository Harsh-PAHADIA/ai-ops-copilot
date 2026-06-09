from fastapi import FastAPI
from app.routes import chat, document, workflow

app = FastAPI()

# include routes
app.include_router(chat.router, tags=["Chat"])
app.include_router(document.router, tags=["Document Ops"])
app.include_router(workflow.router, tags=["Workflow Automation"])

@app.get("/")
def root():
    return {"message": "AI Ops Copilot Backend Running 🚀"}