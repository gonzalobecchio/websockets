const express = require('express')
const { engine } = require('express-handlebars')
const { Server } = require('socket.io')
const { createServer } = require("http");
const { productos } = require('../Routes/productos')
const fs = require('fs');
const { isModuleNamespaceObject } = require('util/types');

const PORT = 3000
const app = express()
const httpServer = createServer(app)

const io = new Server(httpServer)

let productoList = []
let allMesagges = []

app.use(express.static('Public'))
app.use(express.static('Uploads'))
app.use(express.json())
app.use(express.urlencoded({ extended: false }))

app.engine('handlebars', engine())
app.set('view engine', 'handlebars')
app.set('views', './views')


/*Funcion encargado de setear los mensajes en el archivo*/
const saveMesssageFile = (jsonStr) => {
    fs.writeFile('messages.txt', jsonStr, (err) => {
        if (err) { console.log(err) }
    })
}

const readMessagesFromFile = () => {
    fs.readFile('messages.txt', 'UTF-8', (err, messages) => {
        if (err) { 
            console.log(err) 
            return 
        }

        allMesagges = messages ? Object.values(JSON.parse(messages)) : []
    })
}

io.on('connection', (socket) => {
    console.log('Cliente conectado')
    /*Lectura mensajes desde archivo*/ 
    readMessagesFromFile()
    socket.emit('fromServerDates', productoList)
    socket.emit('fromServerChat', JSON.stringify(allMesagges))


    socket.on('fromClient', dates =>{
        productoList.push(dates)
        io.sockets.emit('fromServerDates', productoList)
    })

    socket.on('fromClientChat', msge => {        
        //Construyendo fecha
        const date = new Date()
        const create_at = `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()} ${date.getHours()}:${date.getMinutes() + 1}:${date.getSeconds()}`
        msge.create_at = create_at
        allMesagges.push(msge)
        saveMesssageFile(JSON.stringify(Object.values(allMesagges)))
        io.sockets.emit('fromServerChat', JSON.stringify(Object.values(allMesagges)))
    })        
})


/*Ruta Index API NoREST*/ 
app.get('/', (req, res) => {
    res.render('index',{
        messageSuccess: null,
        errores: null,
        prodVal: null
    })
})

app.use('/api', productos)





httpServer.listen(PORT, () => {
    console.log(`Corriendo en puerto ${PORT}`)
})

app.use('*', (req, res, next) => {
    res.status(404).json({message: "El rescurso buscado no existe"});
});

app.use((err, req, res, next) =>{
    // console.log(err.statusCode)
    res.status(err.statusCode ? err.statusCode : 500 ).json({
        message: err.message,
        status: err.statusCode
    })
});