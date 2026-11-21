import os
from typing import List
from pydantic import BaseModel
from dotenv import load_dotenv

# Load local .env
load_dotenv()

class Settings(BaseModel):
    PROJECT_NAME: str = "Passport: Agent Trust & Control Layer"
    VERSION: str = "1.0.0"
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development")
    PORT: int = int(os.getenv("PORT", "8000"))
    API_BASE_URL: str = os.getenv("API_BASE_URL", "http://localhost:8000")
    FRONTEND_URL: str = os.getenv("FRONTEND_URL", "http://localhost:3000")
    CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:8000",
        "https://crypgo-shadcn-ui-landingpage-v1.21st.app"
    ]
    
    # GCP Config
    GCP_PROJECT_ID: str = os.getenv("GCP_PROJECT_ID", "project-c678e6e8-2896-441b-a53")
    GCP_REGION: str = os.getenv("GCP_REGION", "asia-south1")
    
    # Cryptographic Signing
    SIGNING_ALGORITHM: str = os.getenv("PASSPORT_SIGNING_ALGORITHM", "Ed25519")
    
    # Partner APIs
    OLOSTEP_API_KEY: str = os.getenv("OLOSTEP_API_KEY", "")
    CRUSTDATA_API_KEY: str = os.getenv("CRUSTDATA_API_KEY", "")
    N8N_WEBHOOK_URL: str = os.getenv("N8N_WEBHOOK_URL", "")
    BITSBEE_OPS_API_KEY: str = os.getenv("BITSBEE_OPS_API_KEY", "")
    
    # Simulation & Policy
    SIMULATED_WALLET_ENABLED: bool = True
    MERCHANT_SANDBOX_STRICT_MODE: bool = True
    APPROVAL_SPEND_THRESHOLD: float = 50.0

settings = Settings()
