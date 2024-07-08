import { Server } from "socket.io"
import { createServer } from "http"
import express from "express";
import logger from "morgan"
import dotenv from "dotenv"
import { createClient } from "@libsql/client";


dotenv.config()
const port = process.env.PORT ?? 4001;
const app = express();
const server = createServer(app)

/* CONFIGURACION DE DB */
const db = createClient({
    url: process.env.DB_URL,
    authToken: process.env.DB_TOKEN
})
await db.execute(`
    CREATE TABLE IF NOT EXISTS messages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        content TEXT,
        user TEXT
    )
`)

const io = new Server(server, {
    cors:{
        origin:'*',
        methods: ["GET", "POST"]

    },
    connectionStateRecovery: {}
})

io.on('connection', async(socket) => {

    console.log("Se conecto un usuario")
    socket.on("disconnect", () => {
        console.log("usuario desconectado")
    })
    socket.on('chat message', (msg) => {
        console.log("Mensaje:" + msg)
    })

    socket.on('chat message', async (msg) => {
        let result
        const username = socket.handshake.auth.username ?? 'anonymous'
        console.log({ username })
        try {
            result = await db.execute({
                sql: 'INSERT INTO messages (content, user) VALUES (:msg, :username)',
                args: { msg, username }
            })
        } catch (e) {
            console.error(e)
            return
        }
        io.emit('chat message', msg, result.lastInsertRowid.toString());
    })
    if (!socket.recovered) { // <- recuperase los mensajes sin conexión
        try {
            const results = await db.execute({
                sql: 'SELECT id, content, user FROM messages WHERE id > ?',
                args: [socket.handshake.auth.serverOffset ?? 0]
            })
            results.rows.forEach(row => {
                socket.emit('chat message', row.content, row.id.toString(), row.user)
            })
        } catch (e) {
            console.error(e)
        }
    }

})
app.use(logger('dev'));
app.get("/", (req, res) => {
    res.sendFile(process.cwd() + "/public/index.html")
})

server.listen(port, () => {
    console.log(`Corriendo servidor en el puerto ${port}`)
})
