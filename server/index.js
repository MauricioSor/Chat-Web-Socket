import { Server } from "socket.io"
import { createServer } from "node:http"
import express from "express";
import logger from "morgan"
import dotenv from "dotenv"
const port = process.env.PORT ?? 4001;

const app = express();
const server = createServer(app)
const io = new Server(server)
dotenv.config()

io.on('connection', (socket) => {
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
/*         try {
            result = await db.execute({
                sql: 'INSERT INTO messages (content, user) VALUES (:msg, :username)',
                args: { msg, username }
            })
        } catch (e) {
            console.error(e)
            return
        } */
        io.emit('chat message', msg)
    })
})
app.use(logger('dev'));
app.get("/", (req, res) => {
    res.sendFile(process.cwd() + "/client/index.html")
})

server.listen(port, () => {
    console.log(`Corriendo servidor en el puerto ${port}`)
})
