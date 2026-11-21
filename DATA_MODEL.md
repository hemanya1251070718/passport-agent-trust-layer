# Passport: Data Model & Schema Specification
**Standard:** RFC 7519 (JWT) / Pydantic V2 / OpenAPI 3.1  
**Author:** Hemanya Devendra Gillurkar (`hemanya1251070718`)

---

## 1. Cryptographic Delegation Token (JWT Claims)

```json
{
  "iss": "passport-trust-gateway",
  "sub": "user_principal_99",
  "agent_id": "errand_agent_flight_refund",
  "scopes": [
    "web:scrape",
    "vendor:verify",
    "wallet:pay",
    "claims:write"
  ],
  "max_budget": 50.00,
  "currency": "USD",
  "iat": 1732176000,
  "exp": 1732179600,
  "jti": "d7b92648-91ac-4629-9fa9-43cfafe7bb6d"
}
```

### Claim Definitions:
- `iss`: Issuer identifier (`passport-trust-gateway`).
- `sub`: Principal ID (Human user or enterprise organization).
- `agent_id`: Globally unique identifier for the autonomous agent instance.
- `scopes`: Explicit allowed capabilities array. Wildcard (`*`) is restricted to super-administrators.
- `max_budget`: Maximum cumulative funds authorized for this agent delegation session.
- `exp`: Expiration timestamp in epoch seconds (default: 3600s / 1 hour).
- `jti`: JWT unique ID, tracked for revocation status.

---

## 2. Policy Evaluation Schema

### Request: `ToolEvaluationRequest`
```json
{
  "agent_id": "errand_agent_flight_refund",
  "delegation_token": "eyJhbGciOiJFZERTQSI...",
  "tool_name": "olostep_scrape",
  "parameters": {
    "url": "https://sandboxed-airline.example.com/refund-terms"
  }
}
```

### Response: `ToolEvaluationResponse`
```json
{
  "decision": "ALLOW",
  "reason": "Authorized tool and parameters verified under scope 'web:scrape'",
  "risk_score": 0.05,
  "execution_token": "exec_d7b9264891ac4629_ALLOW",
  "approval_required": false,
  "ticket_id": null
}
```

---

## 3. Sandboxed Wallet Schema

### Virtual Agent Account:
```json
{
  "agent_id": "errand_agent_flight_refund",
  "total_budget": 50.00,
  "spent_amount": 8.50,
  "remaining_balance": 41.50,
  "per_tx_cap": 25.00,
  "velocity_limit_tx_per_min": 5,
  "currency": "USD"
}
```

### Transaction Settlement Block:
```json
{
  "transaction_id": "tx_c93148f98aa3",
  "agent_id": "errand_agent_flight_refund",
  "amount": 8.50,
  "merchant_domain": "sandboxed-airline.example.com",
  "merchant_reputation": "LOW_RISK_VERIFIED",
  "timestamp": "2026-11-21T08:05:12.194Z",
  "status": "SETTLED"
}
```

---

## 4. Tamper-Evident Audit Block (Flight Recorder)

```json
{
  "index": 4,
  "timestamp": "2026-11-21T08:05:12.195Z",
  "agent_id": "errand_agent_flight_refund",
  "action": "WALLET_SPEND_SETTLED",
  "status": "ALLOW",
  "details": {
    "amount": 8.5,
    "merchant": "sandboxed-airline.example.com",
    "remaining_balance": 41.5
  },
  "previous_hash": "26a26d708369d76c6bb11fc349942a926ea0d414a3bfec69a475d4b553ad8d70",
  "block_hash": "f6236b23a9d9a0dce77ea724771aa19702ea48e8a60be6ffec01ff6c3e7f60b4"
}
```

### Hash Link Integrity Formula:
$$\text{block\_hash}_i = \text{SHA256}\left(\text{canonical\_json}(\text{block}_i \setminus \{\text{block\_hash}\}) \parallel \text{block\_hash}_{i-1}\right)$$
The genesis block ($i=0$) uses $\text{previous\_hash} = \text{"0" * 64}$.
