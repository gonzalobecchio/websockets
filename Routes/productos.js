const express = require('express')
const { Router }  = express

const productos = Router()
const dirFiles = 'Uploads'


productos.post('/productos', (req, res) => {
    const { body } = req
    // console.log(body.length)
    res.render('listadoProductos', {
        productos: body,
        message: body.length !== 0 ? null : 'Sin Datos',
    })
})

productos.post('/chat', (req, res) => {
    const { body} = req
    res.render('listadoChat',{
        messages: body
    })
})

module.exports = { productos }