from __future__ import annotations

import hashlib
from dataclasses import dataclass
from typing import Optional


@dataclass(frozen=True)
class VaultEntry:
    """An append-only ledger entry.

    TODO (production):
    - Persist to DB (or write-ahead log)
    - Use Merkle/chain-hash strategy if desired
    - Enforce per-action read/write hashing
    """

    id: str
    actor: str
    action: str  # e.g. "READ" | "WRITE"
    resource: str
    metadata: dict
    sha256: str
    previous_sha256: Optional[str] = None


def sha256_of_bytes(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def compute_entry_hash(
    *,
    actor: str,
    action: str,
    resource: str,
    metadata: dict,
) -> str:
    # Stable hash input: define a canonical serialization strategy later.
    # For now, use deterministic repr on sorted keys.
    canonical = (
        f"actor={actor};action={action};resource={resource};metadata="
        f"{str(sorted(metadata.items()))}"
    ).encode("utf-8")
    return sha256_of_bytes(canonical)


def write_entry(*, actor: str, action: str, resource: str, metadata: dict) -> VaultEntry:
    """Write-ahead style in-memory ledger entry.

    This repo currently doesn't persist Vault entries to a DB table.
    This function creates a hash-chained VaultEntry object and returns it.

    Fails fast: if callers want fails-open behavior, catch exceptions at the call site.
    """

    # In a production system, previous_sha256 would come from persisted state.
    previous_sha256: Optional[str] = None

    entry_id = str(sha256_of_bytes(
        f"{actor}|{action}|{resource}|{metadata}".encode("utf-8")
    ))

    sha256 = compute_entry_hash(
        actor=actor,
        action=action,
        resource=resource,
        metadata=metadata,
    )

    return VaultEntry(
        id=entry_id,
        actor=actor,
        action=action,
        resource=resource,
        metadata=metadata,
        sha256=sha256,
        previous_sha256=previous_sha256,
    )


