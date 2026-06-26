import express from 'express'
import morgan from 'morgan'
import http from 'http'
import { createProxyMiddleware } from 'http-proxy-middleware'
import { createProxyServer } from 'httpxy';
import { refreshTTL } from './config/redis.js';

const app = express()
const server = http.createServer(app)

app.use(morgan('combined'))

app.get('/api/status/healthz', (req, res) => {
    res.status(200).json({ status: 'ok' })
})

app.get('/api/status/readyz', (req, res) => {
    res.status(200).json({ status: 'ready' })
})

const proxies = {}
const agentProxies = {}

function getProxy(sandboxId) {
    const target = `http://sandbox-service-${sandboxId}`

    if (!proxies[sandboxId]) {
        proxies[sandboxId] = createProxyMiddleware({
            target,
            changeOrigin: true,
        })
    }

    return proxies[sandboxId]
}

function getAgentProxy(sandboxId) {
    const target = `http://sandbox-service-${sandboxId}:3000`

    if (!agentProxies[sandboxId]) {
        agentProxies[sandboxId] = createProxyMiddleware({
            target,
            changeOrigin: true
        });
    }

    return agentProxies[sandboxId]
}

const wsProxy = createProxyServer({ changeOrigin: true });
wsProxy.on('error', (err, req, socket) => { socket?.destroy(); });

app.use(async (req, res, next) => {
    const host = req.headers.host || ''
    const parts = host.split('.')

    const sandboxId = parts[0]
    const subdomain = parts[1]

    await refreshTTL(sandboxId)

    if (subdomain === 'agent') {
        return getAgentProxy(sandboxId)(req, res, next)
    }

    if (subdomain === 'preview') {
        return getProxy(sandboxId)(req, res, next)
    }

    return res.status(404).json({
        message: 'Invalid subdomain'
    })
})

server.on('upgrade', (req, socket, head) => {
    socket.on('error', () => socket.destroy()); // guard against EPIPE during live pipe

    const host = req.headers.host || '';
    const parts = host.split('.')
    const sandboxId = parts[0]
    const subdomain = parts[1]

    if (subdomain === 'agent') {
        wsProxy.ws(req, socket, { target: `http://sandbox-service-${sandboxId}:3000` }, head)
            .catch(() => socket.destroy());
    } else if (subdomain === 'preview') {
        wsProxy.ws(req, socket, { target: `http://sandbox-service-${sandboxId}` }, head)
            .catch(() => socket.destroy());
    } else {
        socket.destroy();
    }
});

export default server