- [ ] Inspect existing lib/api.ts SSE helper patterns
- [ ] Define KommuneState TypeScript types and SSE generator utility in lib/api.ts
- [ ] Implement async generator that POSTs payload to NEXT_PUBLIC_API_URL/stream and yields KommuneState objects from SSE JSON chunks
- [ ] Add safe SSE parsing (handles partial lines/frames), network-drop error handling, and explicit CORS-related headers
- [ ] Ensure exports don’t break existing imports
- [ ] Run typecheck/build (if feasible) to confirm no TS errors

