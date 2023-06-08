import fs from "fs"
import express from "express"
import { WebSocketServer } from "ws"
import { PeerId, Repo } from 'automerge-repo'
import { NodeWSServerAdapter } from "automerge-repo-network-websocket"
import { NodeFSStorageAdapter } from "automerge-repo-storage-nodefs"
import os from "os"

const dir = ".amrg"
if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir)
}

const hostname = os.hostname()

//based on https://github.com/automerge/automerge-repo/tree/main/packages/automerge-repo-sync-server
const wsServer = new WebSocketServer({ noServer: true })
const PORT = process.env.PORT !== undefined ? parseInt(process.env.PORT) : 3030
const app = express()

const serverRepo = new Repo({
  network: [new NodeWSServerAdapter(wsServer)],
  storage: new NodeFSStorageAdapter(),
  peerId: `storage-server-${hostname}` as PeerId,
  // Since this is a server, we don't share generously — meaning we only sync documents they already
  // know about and can ask for by ID.
  sharePolicy: async () => false,
})

app.get("/", (req, res) => {
  res.send(`👍 automerge-repo-sync-server is running`)
})

const server = app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`)
})

server.on("upgrade", (request, socket, head) => {
  wsServer.handleUpgrade(request, socket, head, (socket) => {
    wsServer.emit("connection", socket, request)
  })
})
