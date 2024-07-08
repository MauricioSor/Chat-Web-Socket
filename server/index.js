import {Server} from "socket.io"
import {createServer} from "node:http" 
import express from "express";
import logger from "morgan"
const port = process.env.PORT??4001;

const app= express();
const server = createServer(app)
const io= new Server(server)

io.on('connection',(socket)=>{
    console.log("Se conecto un usuario")
    
    socket.on("disconnect",()=>{
        console.log("usuario desconectado")
    })
})
app.use(logger('dev'));
app.get("/",(req,res)=>{
    res.sendFile(process.cwd()+"/client/index.html")
})

server.listen(port,()=>{
    console.log(`Corriendo servidor en el puerto ${port}`)
})
