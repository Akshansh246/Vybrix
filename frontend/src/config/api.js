// Central API configuration
//
// Main backend (/api/*):
//   Uses relative URLs → Vite proxy forwards to http://localhost
//
// Agent subdomain (*.agent.localhost):
//   Uses absolute URLs directly — no proxy needed (browser allows same-TLD localhost subdomains)

export const ENDPOINTS = {
  // Main backend
  startSandbox: () => `/api/sandbox/start`,
  invokeAI:     () => `/api/ai/invoke`,

  // Sandbox agent — direct calls to the agent subdomain
  listFiles: (sandboxId) =>
    `http://${sandboxId}.agent.localhost/list-files`,

  readFiles: (sandboxId, filePath) =>
    `http://${sandboxId}.agent.localhost/read-files?files=${encodeURIComponent(filePath)}`,

  updateFiles: (sandboxId) =>
    `http://${sandboxId}.agent.localhost/update-files`,
}

// Socket.io connects directly to the agent subdomain.
// WebSocket connections are NOT subject to the same CORS fetch restrictions.
export const socketUrl = (sandboxId) =>
  `http://${sandboxId}.agent.localhost`
