/**
 * Typed API Client for Passport Trust Gateway.
 * Connects to live Cloud Run backend or local development gateway.
 */

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "https://passport-trust-gateway-58223756937.asia-south1.run.app/api/v1";

export interface TokenMintRequest {
  agent_id: string;
  scopes: string[];
  budget_limit?: number;
  per_tx_limit?: number;
  allowed_merchants?: string[];
  expires_in_seconds?: number;
}

export interface TokenMintResponse {
  delegation_token: string;
  token_id: string;
  expires_at: number;
  algorithm: string;
}

export interface ToolEvaluationRequest {
  agent_id: string;
  delegation_token: string;
  tool_name: string;
  parameters: Record<string, any>;
  prompt_context?: string;
}

export interface ToolEvaluationResponse {
  decision: "ALLOW" | "DENY" | "REQUIRE_APPROVAL";
  reason: string;
  risk_score: number;
  execution_token?: string;
  approval_required: boolean;
  ticket_id?: string;
}

export interface SubDelegationMintRequest {
  parent_token: string;
  sub_agent_id: string;
  scopes: string[];
  budget_limit?: number;
  per_tx_limit?: number;
  allowed_merchants?: string[];
  expires_in_seconds?: number;
}

export interface AgentProfile {
  agent_id: string;
  name: string;
  role: string;
  principal_id: string;
  max_daily_budget: number;
  single_tx_cap: number;
  allowed_scopes: string[];
  status: string;
  created_at: string;
}

export interface DelegationRecord {
  jti: string;
  parent_jti?: string | null;
  principal_id: string;
  agent_id: string;
  token_prefix: string;
  scopes: string[];
  budget_limit: number;
  per_tx_limit: number;
  iat: number;
  exp: number;
  is_revoked: boolean;
  revoked_reason?: string;
  created_at: string;
}

export interface SpendRequest {
  agent_id: string;
  amount: number;
  merchant_domain: string;
  purpose: string;
  delegation_token: string;
}

export interface SpendResponse {
  success: boolean;
  transaction_id?: string;
  amount: number;
  remaining_balance: number;
  message: string;
}

export interface AuditRecord {
  index: number;
  timestamp: string;
  agent_id: string;
  action: string;
  status: string;
  details: Record<string, any>;
  previous_hash: string;
  block_hash: string;
}

export interface AuditIntegrityResponse {
  valid: boolean;
  total_events: number;
  head_hash: string;
  broken_index?: number;
  error?: string;
}

export interface ApprovalTicket {
  ticket_id: string;
  agent_id: string;
  tool_name: string;
  parameters: Record<string, any>;
  risk_score: number;
  reason: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  created_at: string;
}

class PassportApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl.replace(/\/$/, "");
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    try {
      const resp = await fetch(url, {
        ...options,
        headers: {
          "Content-Type": "application/json",
          ...(options.headers || {}),
        },
      });

      if (!resp.ok) {
        const errorBody = await resp.text();
        throw new Error(`API error ${resp.status} on ${endpoint}: ${errorBody}`);
      }

      return await resp.json();
    } catch (err: any) {
      console.warn(`[Passport API] Offline fallback for ${endpoint}:`, err.message);
      throw err;
    }
  }

  // Health
  async getHealth(): Promise<Record<string, any>> {
    return this.request<Record<string, any>>("/health");
  }

  // JWKS
  async getJwks(): Promise<Record<string, any>> {
    return this.request<Record<string, any>>("/auth/jwks");
  }

  // Mint Token
  async mintToken(data: TokenMintRequest): Promise<TokenMintResponse> {
    return this.request<TokenMintResponse>("/auth/mint", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  // Revoke Token
  async revokeToken(tokenId: string): Promise<{ success: boolean; message: string }> {
    return this.request<{ success: boolean; message: string }>(`/auth/revoke/${tokenId}`, {
      method: "POST",
    });
  }

  // Evaluate Action
  async evaluateAction(data: ToolEvaluationRequest): Promise<ToolEvaluationResponse> {
    return this.request<ToolEvaluationResponse>("/policy/evaluate", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  // Spend from Sandboxed Wallet
  async spend(data: SpendRequest): Promise<SpendResponse> {
    return this.request<SpendResponse>("/wallet/spend", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  // Audit Records & Integrity
  async getAuditLedger(): Promise<AuditRecord[]> {
    return this.request<AuditRecord[]>("/audit/records");
  }

  async verifyAuditIntegrity(): Promise<AuditIntegrityResponse> {
    return this.request<AuditIntegrityResponse>("/audit/integrity");
  }

  // Approvals Queue
  async getPendingApprovals(): Promise<ApprovalTicket[]> {
    return this.request<ApprovalTicket[]>("/approvals/pending");
  }

  async resolveApproval(ticketId: string, approved: boolean, reason: string): Promise<any> {
    return this.request("/approvals/resolve", {
      method: "POST",
      body: JSON.stringify({
        ticket_id: ticketId,
        decision: approved ? "APPROVE" : "REJECT",
        reviewer_id: "human_reviewer_admin",
        notes: reason,
      }),
    });
  }

  // Sub-Delegation Chains (Day 3 Flagship)
  async mintSubDelegation(data: SubDelegationMintRequest): Promise<TokenMintResponse> {
    return this.request<TokenMintResponse>("/auth/sub-delegate", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async getDelegations(): Promise<DelegationRecord[]> {
    return this.request<DelegationRecord[]>("/auth/delegations");
  }

  // Agent Fleet Registry
  async getAgentFleet(): Promise<AgentProfile[]> {
    return this.request<AgentProfile[]>("/agents/list");
  }

  async registerAgent(data: Partial<AgentProfile>): Promise<AgentProfile> {
    return this.request<AgentProfile>("/agents/register", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  // Wallet Transactions
  async getWalletTransactions(): Promise<any[]> {
    return this.request<any[]>("/wallet/transactions");
  }

  // SSE Real-time Stream URL
  getAuditStreamUrl(): string {
    return `${this.baseUrl}/audit/stream`;
  }

  // Run Demo Errand
  async runErrandDemo(agentId: string = "errand_agent_flight_refund"): Promise<any> {
    return this.request(`/errand/run?agent_id=${encodeURIComponent(agentId)}`, {
      method: "POST",
    });
  }
}

export const passportApi = new PassportApiClient();
