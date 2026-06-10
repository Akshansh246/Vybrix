import express from 'express'
import morgan from 'morgan'
import http from 'http'
import { createProxyMiddleware } from 'http-proxy-middleware'

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
            ws: true
        })
    }

    return proxies[sandboxId]
}

function getAgentProxy(sandboxId) {
    const target = `http://sandbox-service-${sandboxId}:3000`

    if (!agentProxies[sandboxId]) {
        agentProxies[sandboxId] = createProxyMiddleware({
            target,
            changeOrigin: true,
            ws: true
        })
    }

    return agentProxies[sandboxId]
}

app.use((req, res, next) => {
    const host = req.headers.host || ''
    const parts = host.split('.')

    const sandboxId = parts[0]
    const subdomain = parts[1]

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
    const host = req.headers.host || ''
    const parts = host.split('.')

    const sandboxId = parts[0]
    const subdomain = parts[1]

    console.log(`WS Upgrade: ${host}`)

    if (subdomain === 'agent') {
        const proxy = getAgentProxy(sandboxId)

        if (proxy.upgrade) {
            proxy.upgrade(req, socket, head)
        } else {
            socket.destroy()
        }
    } else if (subdomain === 'preview') {
        const proxy = getProxy(sandboxId)

        if (proxy.upgrade) {
            proxy.upgrade(req, socket, head)
        } else {
            socket.destroy()
        }
    } else {
        socket.destroy()
    }
})

export default server