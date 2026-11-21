from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field

class TokenMintRequest(BaseModel):
    agent_id: str = Field(..., description="Unique agent identifier (e.g. agent-researcher-01)")
    scopes: List[str] = Field(..., description="Allowed capability scopes (e.g. ['web:search', 'web:scrape', 'wallet:pay'])")
    budget_limit: float = Field(default=25.0, description="Maximum cumulative spend permitted (USD)")
    per_tx_limit: float = Field(default=10.0, description="Maximum single-transaction spend permitted (USD)")
    allowed_merchants: List[str] = Field(default=["*"], description="Allowlist of vendor domains or '*' for any verified")
    expires_in_seconds: int = Field(default=3600, description="Token validity duration in seconds")

class SubDelegationMintRequest(BaseModel):
    parent_token: str = Field(..., description="Valid signed parent delegation token string")
    sub_agent_id: str = Field(..., description="Target sub-agent identifier (e.g. agent-scraper-sub)")
    scopes: List[str] = Field(..., description="Attenuated subset of parent scopes")
    budget_limit: float = Field(default=5.0, description="Budget cap (must be <= parent remaining budget)")
    per_tx_limit: float = Field(default=5.0, description="Single-tx cap (must be <= parent per_tx_limit)")
    allowed_merchants: List[str] = Field(default=["*"], description="Allowlist of vendor domains")
    expires_in_seconds: int = Field(default=1800, description="Duration in seconds (must expire <= parent)")

class TokenMintResponse(BaseModel):
    token: str
    token_id: str
    parent_id: Optional[str] = None
    agent_id: str
    principal_id: str
    scopes: List[str]
    budget_limit: float
    per_tx_limit: float
    expires_at: int
    algorithm: str

class TokenClaims(BaseModel):
    jti: str
    parent_jti: Optional[str] = None
    iss: str
    sub: str
    agent_id: str
    scopes: List[str]
    budget_limit: float
    per_tx_limit: float
    allowed_merchants: List[str]
    iat: int
    exp: int

class AgentRegisterRequest(BaseModel):
    agent_id: str
    name: str
    role: str
    max_daily_budget: float = 50.0
    single_tx_cap: float = 15.0
    allowed_scopes: List[str]

class AgentResponse(BaseModel):
    agent_id: str
    name: str
    role: str
    principal_id: str
    max_daily_budget: float
    single_tx_cap: float
    allowed_scopes: List[str]
    status: str
    created_at: str

class ToolEvaluationRequest(BaseModel):
    agent_id: str
    delegation_token: str
    tool_name: str
    parameters: Dict[str, Any] = Field(default_factory=dict)
    prompt_context: Optional[str] = None

class ToolEvaluationResponse(BaseModel):
    decision: str  # ALLOW, DENY, REQUIRE_APPROVAL
    reason: str
    risk_score: float
    execution_token: Optional[str] = None
    approval_id: Optional[str] = None

class SpendRequest(BaseModel):
    agent_id: str
    delegation_token: str
    amount: float
    merchant_domain: str
    purpose: str

class SpendResponse(BaseModel):
    success: bool
    transaction_id: Optional[str] = None
    remaining_budget: float
    reason: str
    audit_hash: str

class ApprovalDecisionRequest(BaseModel):
    approval_id: str
    decision: str  # APPROVED, REJECTED
    decided_by: str = "human-operator"
    notes: Optional[str] = None

class AuditRecordResponse(BaseModel):
    index: int
    timestamp: str
    agent_id: str
    action: str
    status: str
    payload_hash: str
    prev_hash: str
    entry_hash: str
    details: Dict[str, Any]

class AuditIntegrityResponse(BaseModel):
    valid: bool
    total_events: int
    genesis_hash: str
    tip_hash: str
    broken_at_index: Optional[int] = None
