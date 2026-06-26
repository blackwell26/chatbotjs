# Design Specification Document

## 1. Purpose

This document describes the technical design for implementing the AI-powered customer service chatbot defined in `specs/requirements.md`.

The implementation target is:

- Frontend: Angular web application
- Backend: Node.js API service
- AI runtime: Ollama running a local LLM model on-premises
- Retrieval layer: RAG pipeline with vector database support
- Packaging: Docker and Kubernetes
- Observability: Prometheus, Grafana, and structured logging

The design focuses on how the system is decomposed, how requests flow through the backend, and how each requirement is satisfied by implementation components.

---

## 2. Design Goals

1. Keep all model inference local by routing requests to Ollama rather than external AI services.
2. Use Node.js for the backend orchestration layer so chat, retrieval, validation, and session logic live in one service boundary.
3. Keep the design deployment-friendly across local Docker Compose and Kubernetes.
4. Preserve a clean separation between user interface, orchestration, retrieval, persistence, and infrastructure.
5. Support observability, security controls, and failure handling from the outset rather than as add-ons.

---

## 3. Scope

### In Scope

- Angular chat user interface
- Node.js API gateway
- Ollama integration with a local LLM model
- RAG retrieval flow against a vector database
- Ingestion pipeline for knowledge base documents
- Session tracking and conversation history retention
- Containerization, Kubernetes manifests, and monitoring

### Out of Scope

- Training or fine-tuning the base LLM
- External cloud AI APIs
- Multi-tenant authentication and authorization
- Human handoff workflows

---

## 4. System Architecture

The system is organized as five primary runtime parts:

1. Chat_UI
2. API_Gateway
3. Ollama_Server
4. Vector_DB
5. Ingestion_Pipeline

### High-Level Flow

1. The customer submits a message in the Angular UI.
2. The UI sends the message, session ID, and conversation history to the Node.js API.
3. The API validates the request, loads session state, and sanitizes the input.
4. The API invokes the RAG pipeline to retrieve relevant knowledge base chunks.
5. The API sends a prompt to Ollama with system instructions, retrieved context, and recent conversation history.
6. Ollama returns a response, which the API stores in session history and sends back to the UI.

### Design Choice: Node.js Backend

Node.js is the implementation platform for the backend because it fits the request/response orchestration model well and keeps the API, session store, streaming responses, and Ollama client in one language/runtime. This also simplifies integration with common JavaScript ecosystem tooling for validation, HTTP clients, metrics, and structured logging.

### Design Choice: Local Ollama Runtime

The model layer is intentionally local. The backend connects to Ollama over HTTP on the configured host and port, with defaults pointing to the local on-premise server. This preserves data locality, keeps inference off external services, and aligns the implementation with the operational constraints described in the requirements.

---

## 5. Backend Design

## 5.1 API Gateway

The API_Gateway is a Node.js service that owns:

- HTTP routing
- request validation
- session lifecycle management
- prompt assembly
- Ollama client integration
- RAG orchestration
- response shaping
- metrics and logging

### Suggested Node.js Structure

- `src/server` for HTTP bootstrap and middleware
- `src/routes` for REST endpoints
- `src/controllers` for request handling
- `src/services` for business logic
- `src/clients` for Ollama and Vector_DB access
- `src/state` for session storage abstractions
- `src/metrics` for Prometheus instrumentation
- `src/utils` for sanitization, token estimation, and formatting

### API Endpoints

- `POST /api/v1/chat`
- `GET /api/v1/health`
- `GET /metrics`

### Chat Request Handling

1. Parse and validate the request body.
2. Enforce size limits and content limits.
3. Resolve or create the session.
4. Sanitize user input.
5. Retrieve relevant knowledge base context.
6. Build the final prompt.
7. Send the prompt to Ollama.
8. Store the user turn and assistant turn.
9. Return the response payload and status metadata.

### Error Handling Strategy

The API returns clear, typed failures for:

- validation errors
- request timeout
- upstream Ollama failures
- vector database failures
- session expiration or missing state
- prompt injection rejection

Errors are translated into JSON responses with consistent fields so the UI can render friendly messages without needing backend-specific logic.

---

## 6. RAG Design

The RAG pipeline is split into two phases.

### 6.1 Query-Time Retrieval

At chat time:

1. Convert the customer message into an embedding.
2. Query the vector database for nearest chunks.
3. Filter by similarity threshold and optional metadata.
4. Format the retrieved chunks into a numbered context block.
5. Prepend that context block to the prompt sent to Ollama.

### 6.2 Embedding Service

The embedding layer is abstracted so the Node.js backend can call an embedding provider without embedding concerns leaking into controller code.

Implementation options include:

- a local embedding model served separately
- a compatible model endpoint behind an HTTP client
- a library wrapper if embeddings are generated in-process

The design only requires that embeddings remain compatible with the vector database schema and that failures degrade gracefully.

### 6.3 Retrieval Failure Behavior

If embedding generation fails or retrieval returns no useful matches, the system proceeds with the LLM call without context and flags the response accordingly. That keeps the chatbot operational while making retrieval quality observable.

---

## 7. Ollama Integration

The backend talks to Ollama through a dedicated client wrapper.

### Responsibilities

- Resolve configuration from environment variables
- Send chat/completion requests to Ollama
- Support streaming and non-streaming modes
- Enforce request timeout
- Surface upstream HTTP and transport failures distinctly

### Prompt Assembly

Each LLM request includes:

1. A system prompt defining customer service behavior and domain boundaries
2. Retrieved RAG context, if present
3. Recent conversation history, bounded by session limits and context window constraints
4. The current customer message

### Context Window Management

The backend estimates the combined prompt size and removes the oldest turns first until the request fits the configured model context window. This keeps requests valid without discarding the most recent interaction context.

### Local AI Platform Constraint

Ollama is the only model-serving platform assumed by this design. The backend does not depend on external model APIs, which keeps the runtime self-contained and deployable inside private networks.

---

## 8. Session Design

The Node.js backend maintains server-side session state keyed by session ID.

### Session Data

Each session stores:

- session ID
- last activity timestamp
- conversation history
- history truncation metadata
- expiration metadata

### Storage Approach

For initial implementation, the session store can be in-memory with a clean abstraction around it. That allows a later swap to Redis or another durable store without changing request handling logic.

### Session Lifecycle

- Create when no session ID is supplied
- Resume when the session ID is active
- Recreate when the session ID is expired or missing
- Trim oldest turns when maximum history is reached

---

## 9. Ingestion Pipeline Design

The ingestion pipeline is a Node.js CLI service or worker process.

### Responsibilities

- Traverse a directory recursively
- Accept PDF, TXT, and Markdown files
- Extract text
- Chunk documents
- Generate embeddings
- Store chunk records in the vector database
- Produce a summary report

### Chunking Strategy

Documents are split into configurable chunks with overlap to preserve semantic continuity. Chunk metadata includes:

- source document name
- source path
- chunk index
- raw chunk text
- optional category

### Failure Strategy

- Unsupported file types are skipped
- Chunk-level embedding failures are stored without embeddings
- Serious file or storage failures stop the run and are reported

---

## 10. Vector Database Design

The vector database stores chunk embeddings and metadata for retrieval.

### Required Data Model

- unique chunk ID
- source document name
- source path
- document category
- chunk index
- raw chunk text
- embedding vector
- timestamps

### Query Behavior

- return K nearest neighbors by cosine similarity
- support metadata filters
- persist data to disk
- expose a health endpoint and metrics endpoint

The backend treats the vector database as an external dependency with explicit health checks and timeout-aware communication.

---

## 11. Frontend Design

The Angular Chat_UI is responsible for a focused conversational experience.

### UI Elements

- message history panel
- text input
- send control
- loading indicator
- new conversation control
- markdown rendering for assistant replies
- character count and length enforcement

### Interaction Model

The UI keeps the current session state in browser memory for the duration of the browser session and sends messages to the Node.js API as the source of truth for assistant responses and server-side history.

---

## 12. Security Design

The backend applies several controls:

- environment-based configuration
- request size limits
- rate limiting
- input sanitization
- prompt injection detection
- CORS restriction to the configured frontend origin
- TLS support through certificate path configuration

Security controls are enforced in the Node.js API layer before data is forwarded to Ollama or persisted.

---

## 13. Observability Design

### Metrics

The API emits Prometheus metrics for:

- request counts by status code
- request duration by endpoint
- active sessions
- RAG retrieval latency

### Logs

The API emits structured JSON logs to stdout with at least:

- session ID
- request duration
- HTTP status code
- request path
- request method

### Health Checks

The health endpoint verifies the API's downstream dependencies within the configured timeout and reports dependency-specific status.

---

## 14. Deployment Design

### Docker

Each major runtime component is packaged as a container:

- Angular app served by Nginx
- Node.js API gateway
- ingestion worker/CLI
- vector database

### Kubernetes

The Kubernetes layer defines:

- deployments for the UI and API
- a StatefulSet for the vector database
- a Job for ingestion
- services and config maps
- secrets templates
- probes and autoscaling support

### Monitoring Stack

Prometheus, Grafana, and a log aggregator are included through separate monitoring manifests and compose files.

---

## 15. Configuration Model

The Node.js backend reads runtime values from environment variables rather than source code constants.

Typical configuration includes:

- Ollama host
- Ollama port
- Ollama model name
- Ollama timeout
- vector database URL
- session timeout
- CORS origin
- request and body limits
- retrieval settings

This keeps the same artifact deployable across local development, Docker Compose, and Kubernetes.

---

## 16. Mapping to Requirements

This design satisfies the requirements by assigning them to the following implementation areas:

- UI requirements: Angular Chat_UI
- API and session requirements: Node.js API_Gateway
- inference requirements: Ollama client and prompt assembly
- retrieval requirements: RAG service and vector database client
- ingestion requirements: Node.js CLI ingestion pipeline
- deployment requirements: Docker and Kubernetes manifests
- observability requirements: metrics, logs, and dashboards
- security requirements: validation, sanitization, and rate limiting

---

## 17. Implementation Notes

1. The backend should use a typed Node.js setup so request and response contracts stay explicit.
2. The Ollama client should be isolated behind a small interface so testing can mock upstream behavior.
3. Session storage should remain abstract so an in-memory implementation can be replaced later without changing the API contract.
4. Retrieval and prompt formatting should be separated so each part can be tested independently.
5. Observability should be wired into the request middleware early to avoid missing metrics on failure paths.

---

## 18. Conclusion

The design keeps the system local, operationally simple, and maintainable. The backend is a Node.js service that coordinates chat requests, session state, retrieval, and Ollama inference. The AI platform remains Ollama-backed and fully on-premises, which satisfies the core product direction while leaving room for later replacement of internal components such as session storage or embedding providers.
