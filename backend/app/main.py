from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes import chat, document, workflow
from app.config import github_token_debug_info

app = FastAPI()

# Enable CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


# include routes
app.include_router(chat.router, tags=["Chat"])
app.include_router(document.router, tags=["Document Ops"])
app.include_router(workflow.router, tags=["Workflow Automation"])

@app.get("/debug")
def debug():
    return github_token_debug_info()

@app.get("/")
def root():
    return {"message": "AI Ops Copilot Backend Running 🚀"}
