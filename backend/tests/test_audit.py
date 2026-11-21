import pytest
from backend.app.core.audit import AuditLedger

def test_audit_ledger_integrity():
    ledger = AuditLedger.get_instance()
    entry1 = ledger.record_event(
        agent_id="agent_1",
        action="TOOL_CALL",
        status="ALLOWED",
        details={"tool": "olostep_search", "query": "refund policy"}
    )
    entry2 = ledger.record_event(
        agent_id="agent_1",
        action="WALLET_SPEND",
        status="ALLOWED",
        details={"amount": 10.0, "merchant": "stripe.com"}
    )
    
    # Verify chain
    result = ledger.verify_integrity()
    assert result.valid is True
    assert result.total_events >= 3  # Genesis + 2 events
    assert result.broken_at_index is None

def test_audit_ledger_detects_tampering():
    ledger = AuditLedger.get_instance()
    # Intentionally corrupt a block
    original_details = ledger._chain[1].details
    ledger._chain[1].details = {"tampered": True}
    
    tampered_result = ledger.verify_integrity()
    assert tampered_result.valid is False
    assert tampered_result.broken_at_index == 1
    
    # Restore original details
    ledger._chain[1].details = original_details
    restored_result = ledger.verify_integrity()
    assert restored_result.valid is True
