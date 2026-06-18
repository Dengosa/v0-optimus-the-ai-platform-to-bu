-- Convention for resource = 'document' vault metadata (future-proofing)
-- This migration introduces vault_documents table metadata. Binary content lives in
-- Supabase Storage bucket named "vault-documents".
--
-- IMPORTANT: The Supabase Storage bucket "vault-documents" must be created manually
-- in the Supabase dashboard with private access (service-role key only — never public).

create table if not exists vault_documents (
    id uuid primary key,
    session_id text not null,
    user_id text not null,
    doc_type text not null,           -- 'section22' | 'section24' | 'passport'
                                       -- | 'proof_of_address' | 'other'
    filename text not null,
    storage_path text not null,       -- path in Supabase Storage bucket
    mime_type text not null,
    size_bytes integer not null,
    expiry_date date,                 -- nullable; null = no known expiry
    issued_date date,
    permit_number text,
    status text not null default 'active',  -- 'active' | 'superseded' | 'deleted'
    uploaded_at timestamptz not null default now()
);

create index if not exists vault_documents_session_idx
    on vault_documents (session_id, status);
create index if not exists vault_documents_expiry_idx
    on vault_documents (expiry_date) where expiry_date is not null;

