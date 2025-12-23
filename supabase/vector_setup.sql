-- Enable pgvector extension
create extension if not exists vector;

-- Create documents table (if not exists)
create table if not exists documents (
  id bigserial primary key,
  content text,
  metadata jsonb,
  embedding vector(768) -- Gemini text-embedding-004 dimension
);

-- UPDATE: match_documents function with DEFAULTS for robust LangChain compatibility
-- LangChain sometimes omits match_threshold, so we default it to 0.0
create or replace function match_documents (
  query_embedding vector(768),
  match_threshold float default 0.0,
  match_count int default 10,
  filter jsonb default '{}'
)
returns table (
  id bigint,
  content text,
  metadata jsonb,
  similarity float
)
language plpgsql
as $$
begin
  return query (
    select
      documents.id,
      documents.content,
      documents.metadata,
      1 - (documents.embedding <=> query_embedding) as similarity
    from documents
    where 1 - (documents.embedding <=> query_embedding) > match_threshold
    and documents.metadata @> filter
    order by documents.embedding <=> query_embedding
    limit match_count
  );
end;
$$;
