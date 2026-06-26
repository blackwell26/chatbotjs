# Implementation Tasks

This task list is derived from `specs/design.md` and organizes the work needed to implement the chatbot system in a practical build order.

---

## 1. Project Foundation

- [x] Confirm the repository layout for frontend, backend, ingestion, deployment, and monitoring assets.
- [x] Set up the Node.js backend project structure for the API gateway.
- [x] Define shared TypeScript types or interfaces for chat requests, chat responses, session state, retrieval results, and error payloads.
- [x] Add environment-based configuration loading for all backend services.
- [x] Establish baseline linting, formatting, and test tooling for the Node.js codebase.

## 2. Backend API Gateway

- [ ] Implement the HTTP server bootstrap for the Node.js API gateway.
- [ ] Add route registration for `POST /api/v1/chat`, `GET /api/v1/health`, and `GET /metrics`.
- [ ] Implement request validation for chat payloads, including size and field checks.
- [ ] Add consistent JSON error handling for validation, upstream failures, timeout, and security rejection cases.
- [ ] Implement structured request and response logging with session ID, duration, status code, method, and path.
- [ ] Add CORS handling for the configured frontend origin.
- [ ] Add request body size enforcement and rate limiting.

## 3. Session Management

- [ ] Define the session store abstraction for server-side conversation history.
- [ ] Implement in-memory session storage for the initial version.
- [ ] Add session creation when no session ID is supplied.
- [ ] Add session lookup and reuse when a valid session ID is provided.
- [ ] Add session expiration handling for idle sessions.
- [ ] Add trimming logic for maximum turn counts.
- [ ] Add response flags for missing or expired history.

## 4. Input Security

- [ ] Implement user input sanitization before prompt assembly.
- [ ] Add prompt injection pattern detection and rejection behavior.
- [ ] Enforce the maximum user message length at the backend.
- [ ] Add support for TLS certificate and key path configuration.

## 5. Ollama Integration

- [ ] Implement a dedicated Ollama client module.
- [ ] Add configuration for host, port, model name, timeout, and streaming behavior.
- [ ] Implement non-streaming chat/completion requests to Ollama.
- [ ] Implement streaming response handling and forwarding.
- [ ] Add explicit transport-level and HTTP-level error propagation.
- [ ] Add prompt assembly with system prompt, retrieved context, conversation history, and current user message.
- [ ] Add context window estimation and oldest-turn pruning.

## 6. Retrieval Pipeline

- [ ] Implement the RAG service entry point used by the API gateway.
- [ ] Add embedding generation integration behind a dedicated abstraction.
- [ ] Implement vector database query support for top-K similarity search.
- [ ] Add similarity threshold filtering and metadata filtering support.
- [ ] Implement context block formatting for retrieved chunks.
- [ ] Add retrieval failure fallback behavior when embeddings or lookup fail.

## 7. Vector Database Integration

- [ ] Define the chunk metadata and vector record schema.
- [ ] Implement the vector database client used by the backend.
- [ ] Add persistence-aware read and write operations for embeddings and metadata.
- [ ] Add health check and metrics endpoints for the vector database service.
- [ ] Add support for filtered retrieval by document name and document category.

## 8. Ingestion Pipeline

- [ ] Implement the Node.js ingestion CLI or worker entry point.
- [ ] Add recursive directory traversal for supported document types.
- [ ] Implement document text extraction for PDF, TXT, and Markdown sources.
- [ ] Add chunking with configurable size and overlap.
- [ ] Integrate embedding generation for chunk records.
- [ ] Implement upsert or replacement logic for already ingested documents.
- [ ] Add handling for unsupported files, partial embedding failures, and fatal ingestion failures.
- [ ] Produce a stdout summary report for processed files and chunk counts.

## 9. Frontend Chat UI

- [ ] Implement the Angular chat window layout.
- [ ] Add scrollable conversation history rendering.
- [ ] Add message input, send action, and Enter-to-send behavior.
- [ ] Add loading state and disabled input behavior while awaiting a response.
- [ ] Add markdown rendering for assistant messages.
- [ ] Add a new conversation control that resets the current session state.
- [ ] Enforce client-side message length limits and show a character counter.

## 10. Observability

- [ ] Add Prometheus metric collection to the API gateway.
- [ ] Expose request count, request duration, active session count, and RAG latency metrics.
- [ ] Add a `/metrics` endpoint in Prometheus exposition format.
- [ ] Add health check aggregation for downstream dependencies.
- [ ] Add Grafana-friendly metric naming and labels.
- [ ] Ensure logs are emitted in structured JSON format to stdout.

## 11. Containerization

- [ ] Create Dockerfiles for the Angular UI, Node.js API gateway, and ingestion pipeline.
- [ ] Define the local Docker Compose topology for all services.
- [ ] Add a dedicated network and service discovery configuration.
- [ ] Add a compose profile for the ingestion service.
- [ ] Add named volume configuration for vector database persistence.
- [ ] Verify the local ports and service entry points match the design.

## 12. Kubernetes Deployment

- [ ] Add Kubernetes manifests for the UI, API gateway, vector database, and ingestion job.
- [ ] Add ConfigMaps for non-sensitive runtime configuration.
- [ ] Add Secret templates with placeholder values for sensitive settings.
- [ ] Add readiness and liveness probes for the UI and API gateway.
- [ ] Add the StatefulSet and persistent volume claim for the vector database.
- [ ] Add resource requests needed for CPU-based autoscaling.
- [ ] Add the Horizontal Pod Autoscaler for the API gateway.

## 13. Monitoring Stack

- [ ] Add Prometheus configuration for scraping the API gateway and vector database.
- [ ] Add alert rules for high error rate and high latency.
- [ ] Add Grafana provisioning for the dashboard and data source setup.
- [ ] Add the monitoring Docker Compose overlay with Prometheus, Grafana, and log aggregation.

## 14. Verification

- [ ] Add backend tests for validation, session handling, retrieval fallback, and Ollama integration.
- [ ] Add ingestion tests for chunking, failure handling, and unsupported file types.
- [ ] Add API contract tests for chat, health, and metrics endpoints.
- [ ] Add end-to-end checks for the chat flow through the backend and local Ollama runtime.
- [ ] Verify Docker Compose startup and Kubernetes manifest consistency.
