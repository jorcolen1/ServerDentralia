// This is your test secret API key.
const express = require('express');
const cors = require('cors')
const hbs = require('nodemailer-express-handlebars')
const nodemailer =require('nodemailer');
const res = require('express/lib/response');
const {db}=require('./firebase')
const path = require('path');
const { stringify } = require('querystring');
const jwt = require('jsonwebtoken')
const fs = require('fs');
const https = require('https');
const PDFDocument = require('pdfkit');
var QRCode = require('qrcode')
const fetch = require('node-fetch');
const RedsysAPI = require('redsys-api')

//var html_to_pdf = require('html-pdf-node');
//const { dictionary } = require('pdfkit/js/page');
//comment
const app = express();
app.use(express.static('public'));
app.use(express.json());//servidor entiende datos en formato JSON
app.use(express.urlencoded());//servidor entiende datos de formularios


//////0----------------------------------------------------------

/* app.get('/hi',(req,res) => {
  res.json({
    text:'api works!!!!'
  });
});

app.post('/api/login',(req,res)=>{
  const dateOffToken=Date.now();
  const user = {
          id: 4,
          Name: 'andres',
          dateOffToken: dateOffToken
            };
  const token = jwt.sign({user}, 'my_secret_key');//(ponerla como variavle de entorno)
  res.json({
    token
  });
});

app.get('/api/protected',ensureToken,(req,res)=>{
  jwt.verify(req.token, 'my_secret_key',(err,data) => {
    if(err){
      res.sendStatus(403)
    }
    else{
      res.json({
        text: 'protegido',
        data: data
     })
    }
  })
})

function ensureToken(req, res, next){
  console.log("la cabecera",req.headers)
  const bearerHeaders = req.headers['authorization'];
  console.log('bearerHeaders>>>',bearerHeaders);
  if(typeof bearerHeaders !== 'undefined'){
    const bearer = bearerHeaders.split(" ");
    const bearertoken= bearer[1];
    req.token= bearertoken;
    next()
  }else{
    res.sendStatus(403)// no permitido
  }
} */

//////0----------------------------------------------------------

// Configurar cabeceras y cors
  app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Authorization, X-API-KEY, Origin, X-Requested-With, Content-Type, Accept, Access-Control-Allow-Request-Method');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
  res.header('Allow', 'GET, POST, OPTIONS, PUT, DELETE');
  next();
});

function addPDf(req){  
  const doc = new PDFDocument({bufferPage: true} );
  const filename= Date.now()
  console.log("la fecha es:",filename)
  const stream = req.writeHead(200,{
    'Content-Type':'aplication/pdf',
    'Content-disposition':`attachment;filename=${filename}`
  })
  data.on('data',(data)=>{stream.write(data)});
  data.on('end',()=>{ stream.end()});
    doc.fontSize(25).text('probando descargar desde navegador!', 100, 100);
    //doc.pipe(fs.createWriteStream('output.pdf'))
    doc.end();
}

/* app.use((req, res, next) => {
  const origin = req.headers.origin
  console.log("eesss__>>>>>>>>",req.headers)
  const payload =request.body;
  const tipoRequest=payload.type;
  if (origin == undefined || origin !== YOUR_DOMAIN ) { 
    res.status(403).json({
      error: "Not allowed"
    })
  } else {
    next()  
  }
}); */

app.get('/', (req, res, next) => {
  const origin = req.headers.origin
  //console.log('dominio correcto ',origin)
  //console.log('la peticion',req)

  res.status(200).json({
    error: "ok vale esta bien"
  })
});



// Cambio de estados de los tickets
const buyTicket = async(data) =>{
  //console.log('la peticion',data)
  let tickets=data.carrito
  let dataUnix = Math.round((new Date()).getTime() / 1000)
  console.log('Antess<<<<<<<<<',data.carrito)
  
  let NumObjet0 = Object.keys(tickets);
  for (var i = 0; i < NumObjet0.length; i++) {  
    // Cambio de estado Principal
    //console.log('Antess<<<<<<<<<',tickets[i])

    const ticketRef = db
    .collection('Eventos').doc(data.eventoId)
    .collection('Entradas').doc(tickets[i].dbid);
    const res = await ticketRef.update({estado: 'Vendido'});

    //Escritura del Log de entradas
    const ticketRefLog = db
    .collection('Eventos').doc(data.eventoId)
    .collection('Entradas').doc(tickets[i].dbid)
    .collection('Logs').add({
      dateUnix:dataUnix,
      type:'Vendido',
      uidSourse:data.sellerId,
      placeIPBuy:data.direccionIP,
      executorFunction: 'server'
    });

    tickets[i].estado = 'Vendido'
    //console.log('Despues>>>>>>>>>',tickets[i])

  }
  data.carrito = tickets
  console.log('Despues>>>>>>>>>',data.carrito)

 
  let controlData={
    dateTransaction :dataUnix,
    statusTransaction :'Valida'
  }
  
  let dataAll = Object.assign(data,controlData)

  // escritura de Transactions respaldo de la compra 
  const transactionsRef = await db
  .collection('Eventos').doc(data.eventoId)
  .collection('Transactions').add(dataAll);

  console.log("de lo creado", transactionsRef.id)
  const transactRefLog = db
  .collection('Eventos').doc(data.eventoId)
  .collection('Transactions').doc(transactionsRef.id)
  .collection('Logs').add({
    dateUnix:dataUnix,
    type:'Valida',
    uidSourse:data.sellerId,
    placeIPBuy:data.direccionIP,
    executorFunction: 'server'
  });

  console.log('3 se escribe la base de datos')
}

//traer imagen de la web 
const fetchImage = async (src) => {
  src===""? src= "https://firebasestorage.googleapis.com/v0/b/eventicket-ee2d5.appspot.com/o/varios%2Flogo.png?alt=media&token=e937305b-6696-4683-8536-938980e52a28": src=src;
  const response = await fetch(src);
  const image = await response.buffer();
  return image;
};

//traer la fecha del evento 
const parseDate = (unixDate) => {
  if (unixDate === undefined || isNaN(unixDate)) {
    return ''
  } else {
    const newDate = new Date(unixDate * 1000).toISOString()
    return newDate.split('T')[0]
  }
}

//enviar notificacion de correo
const sentTicket = async(data) =>{
  // InitialDate
    // traer datos del Evento
    const EventoRef = db.collection('Eventos').doc(data.eventoId);
    const Evento = await EventoRef.get();
    if (!Evento.exists) {
      console.log('No such document!');
    } else {
      dataEvento=Evento.data();
    }
    //console.log('Evento data:', dataEvento);
  
    const RecintoRef = db.collection('Recintos').doc(dataEvento.recintoId);
    const Recinto = await RecintoRef.get();
    if (!Recinto.exists) {
      console.log('No such document!');
    } else {
      dataRecinto=Recinto.data();
    }
    //console.log('Recinto data:', dataRecinto);
  
  // initialize nodemailer
  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',//'smtp.ethereal.email',//servidor smtps
    port:465,//587,
    segure: true,//par no ssl
    auth:{
      user:'dentraliagestion@gmail.com',
      pass:'plafzsxeziqytyur'
    },
  });

  // point to the template folder
  const handlebarOptions = {
    viewEngine: {
        partialsDir: path.resolve('./views/'),
        defaultLayout: false,
    },
    viewPath: path.resolve('./views/'),
  };

  // use a template file with nodemailer
  transporter.use('compile', hbs(handlebarOptions))

  var mailOptions = {
    from:"'noreply'<dentraliagestion@gmail.com>", // sender address
    to:data.cliente.email,//req.body.email , // list of receivers
    subject: ` Aquí tienes tus entradas ${data.cliente.fullName}, de ${dataEvento.name} en ${dataRecinto.province}`,
    template: 'email', // the name of the template file i.e email.handlebars
    bcc: 'dentraliagestion@gmail.com',
    attachments: [{ filename: "output.pdf", path: "./views/images/output.pdf" }],
    context:{
        name: data.cliente.fullName, // replace {{name}} 
        nameEvento: dataEvento.name, // replace {{name}} 
        city: dataRecinto.province, // replace {{email}}
        date: parseDate(dataEvento.unixDateStart),
        hour: dataEvento.hour ,
        email:data.cliente.email
    }
  };

  // trigger the sending of the E-mail
  transporter.sendMail(mailOptions, function(error, info){
    if(error){
        return console.log(error);
    }
    console.log('2.Message sent: ' + info.response);
  });
}

//conseguir el QR e Insertarlo en el PDF
const getPdfQr = async(data) =>{

  let tickets=data.carrito
  let dataEvento='';
  let dataRecinto='';
  const doc = new PDFDocument({autoFirstPage: false});
  doc.pipe(fs.createWriteStream('./views/images/output.pdf'));
  
  // traer datos del Evento
  const EventoRef = db.collection('Eventos').doc(data.eventoId);
  const Evento = await EventoRef.get();
  if (!Evento.exists) {
    console.log('No such document!');
  } else {
    dataEvento=Evento.data();
  }
  //console.log('Evento data:', dataEvento);

  const RecintoRef = db.collection('Recintos').doc(dataEvento.recintoId);
  const Recinto = await RecintoRef.get();
  if (!Recinto.exists) {
    console.log('No such document!');
  } else {
    dataRecinto=Recinto.data();
  }
  //console.log('Recinto data:', dataRecinto);

  let NumObjet0 = Object.keys(tickets);
  data.seguro ? "":data.seguroPrice="0.00" ;

  for (var i = 0; i < NumObjet0.length; i++) {
    //console.log('longituddddd---->>',tickets[i].dbstring)
    try {
      await QRCode.toFile(`./views/images/imgQR${i}.jpg`,tickets[i].dbstring);
    } catch (err) {
      console.error('al generar el QR-->',err)
    }

    
    let pagoTotal=parseFloat((tickets[i].zonaPrice),10)+
                  parseFloat((tickets[i].zonaGDG),10)+
                  parseFloat((data.seguroPrice),10);

    doc.addPage()
    doc.image('views/images/logo.png', 50, 50, {width: 100});
    doc.image(`./views/images/imgQR${i}.jpg`, 430, 220, {width: 100});
    doc.fontSize(5).text(tickets[i].dbstring,440,315);
    doc.fontSize(20).text(dataEvento.name+'-'+dataRecinto.province,50,130,{ align: 'left'});
    doc.fontSize(18).text(dataRecinto.name,50,150,{ align: 'left'});
    doc.fontSize(14).text(dataRecinto.address,50,170,{ align: 'left'});
    doc.text(dataRecinto.location,50,190,{ align: 'left'});

    doc.text(`Fecha: ${parseDate(dataEvento.unixDateStart)} `+ ` Hora: ${dataEvento.hour}`,50,230,{ align: 'left'});
    doc.text(`Zona: ${tickets[i].zonaName}  Asiento: ${tickets[i].seatInfo}`,50,250,{ align: 'left'});
    
    doc.text(`Precio: ${pagoTotal.toFixed(2)}€`+`  Entrada: ${tickets[i].unit}/`+`${tickets[i].total}`,50,280,{ align: 'left'});
    doc.text(`(Entrada: ${tickets[i].zonaPrice}€ + Gastos: ${tickets[i].zonaGDG}€ + Seguro: ${data.seguroPrice}€ )`,50,300,{ align: 'left'});
    const imagenEvent = await fetchImage(dataEvento.webImage);
    doc.image(imagenEvent, 50, 350,{width: 150});
    doc.fontSize(8).text(`1) Es obligatorio para todos los asistentes llevar consigo el DNI. 2) Está reservado el derecho de admisión(Ley 17/97). 3)El horario de inicio y de apertura de puertas podrán sufrir cambios para cumplir con la normativa vigente en relación al Covid-19. 4) No se aceptaran cambios ni devoluciones. 5) La localidad adquirida da derecho a asistir al evento que corresponde y en la butaca/zona asignada. La suspension de dicho evento lleva consigo exclusivamente la devolucion del importe de la entrada(excluidos los gastos de gestión). 6) Es potestad de la organización permitir la entrada al recinto una vez comenzado el evento. 7) En caso de suspensión del evento, la organización se compromete a la devolución del importe de la entrada en el plazo máximo de 15 días hábiles a partir de la fecha del anuncio de la suspensión. 8) No será objeto de devolución aquellos supuestos en los que la suspensión o modificación se produjera una vez comenzado el evento o actividad recreativa y fuera por causa de fuerza mayor. Las malas condiciones climatológicas no dan derecho a devolución de la entrada. 9) Los menores de edad que tengan entre 0 y 13 años, ambos inclusive, podrán acceder al concierto acompañados por su padre/madre/tutor legal y presentar esta autorización correspondiente en el acceso al recinto. Los menores de edad que tengan entre 14 y 15 años, ambos inclusive, podrán acceder al concierto y presentando la autorización firmada por su padre/madre/tutor legal. 10) Cualquier entrada rota o con indicios de falsificación autorizará al organizador a privar a su portador del acceso al evento. 11) La organización del evento no se hace responsable de las entradas robadas. 12) Queda prohibido el acceso al recinto con cámara de foto y/o video (sea doméstica o profesional).Queda prohibido la utilización del flash para la realización de fotos con móviles. El incumplimiento de esta norma puede acarrear la expulsión del recinto sin derecho a devolución del importe de la entrada. 13) Queda prohibido introducir alcohol, sustancias ilegales, armas u objetos peligrosos. 14) Queda limitada la entrada y/o permanencia en el evento a toda persona que se encuentre en estado de embriaguez. 15) Todo asistente podrá ser sometido a un registro por el equipo de seguridad en el acceso al evento, siguiendo la normativa de Ley de Espectáculos Públicos y Seguridad Privada. 16) Salvo que se indique lo contrario a través de cartel informativo en el recinto, no está permitida la entrada de comida ni bebida del exterior salvo botella de agua pequeña (33cl) a la que se le quitará el tapón en el control de acceso.`
    ,50,500,{ align: 'justify'});
  }
  doc.end();
  //console.log('pdfCreado')

  try {
    for (var i = 0; i < NumObjet0.length; i++) {
      fs.unlinkSync(`./views/images/imgQR${i}.jpg`)
      console.log('QR removed')
    }
  } catch(err) {
    console.error('Something wrong happened removing the QR', err)
  }
  console.log('1. se genera el QR y el PDF')
  sentTicket(data);

}

const addCantTotal = async(data) =>{
  let tickets=data.carrito
  let NumObjet0 = Object.keys(tickets)
  for (var i = 0; i < NumObjet0.length; i++) {  
    tickets[i].unit = i+1
    tickets[i].total = NumObjet0.length
  }
  //console.log(tickets)
  data.carrito = tickets
  getPdfQr(data);
  buyTicket(data);
}

const executeTimer = (eventoId, entradasOBJ) => {
  console.log("llamando a los timers")
  setTimeout(async () => {
    console.log("Entrando en primer Timer", eventoId)
    const entradaStatus = await db
    .collection('Eventos').doc(eventoId)
    .collection('Entradas').doc(entradasOBJ[0].dbid).get()
    
    if (entradaStatus.data().estado === 'Reservado') {
      console.log("estado reservado")
      entradasOBJ.forEach(async (entrada) => {
        await db
        .collection('Eventos').doc(eventoId)
        .collection('Entradas').doc(entrada.dbid)
        .update({estado: 'Libre'})
      })
    } else if (entradaStatus.data().estado === 'Pendiente') {
      console.log("estado if pendiente")
      setTimeout(async () => {
        const entradaStatus = await db
        .collection('Eventos').doc(eventoId)
        .collection('Entradas').doc(entradasOBJ[0].dbid).get()
        if (entradaStatus.data().estado === 'Pendiente') {
          console.log("estado pendiente clausula")
          entradasOBJ.forEach(async (entrada) => {
            await db
          .collection('Eventos').doc(eventoId)
          .collection('Entradas').doc(entrada.dbid)
          .update({estado: 'Libre'})
          })
        }
      }, 300000/*300000*/)
    }
  }, 600000/*600000*/ )
}
// endpoint ticket comprado
app.post('/ticket/v1/bought1',(req,res)=>{
  const data = req.body;
  //console.log('la peticion',data)
  addCantTotal(data)

  res.json({status:`ok`,email:data.cliente.email})
})

app.post('/api/v1', async (req, res) => {
  const getOrder = await db.collection('TransaccionesN').doc('Contador').get()
  const tpvOrder = Number(getOrder.data().Numero)
  const totalZerosN = 12 - String(tpvOrder).length
  const newOrder = '0'.repeat(totalZerosN) + String(tpvOrder + 1) 
  const setOder = await db.collection('TransaccionesN').doc('Contador').set({Numero: newOrder})
  const redsys = new RedsysAPI()
  const payload = JSON.parse(req.body.payload)
  const carrito = payload.carrito
  const totalPrice = payload.totalPrice
  const unitPrice = payload.unitPrice
  const seguro = payload.seguro ? payload.seguro: 0
  const seguroPrice = payload.seguroPrice ? payload.seguroPrice : 0
  const direccionIP = payload.direccionIP
  const eventoId = payload.eventoId
  const quantity = payload.quantity
  const infoSeats = payload.info
  const cliente = payload.cliente

  const carritoActualizado = carrito.map(ticket => {
    ticket.estado = 'Reservado'
    return ticket
  })
  carrito.forEach(async (ticket) => {
    await db
          .collection('Eventos').doc(eventoId)
          .collection('Entradas').doc(ticket.dbid)
          .update({estado: 'Pendiente'})
  })
  const transactionId = await db
  .collection('Eventos').doc(eventoId)
  .collection('Transaction').add({
    carrito: carritoActualizado,
    cliente: cliente,
    dateTransaction: Math.floor(new Date().getTime() / 1000),
    direccionIP: direccionIP,
    eventoId: eventoId,
    seguro: seguro,
    seguroPrice: seguroPrice,
    sellerId: 'false',
    statusTransaction: 'Reservado',
    transactionType: 'Web',
    tpvOrder: newOrder
  })

  const setLog = await db.collection('Eventos').doc(eventoId)
  .collection('Transaction').doc(transactionId.id)
  .collection('Logs').add({
    dateUnix: Math.floor(new Date().getTime() / 1000),
    executorFunction: "server",
    placeIPBuy: direccionIP,
    type: 'Pendiente',
  })
  const transactionTPV = await db
  .collection('TransactionTPV')
  .doc(newOrder).set({
    eventoId: eventoId,
    orderTPV: newOrder,
    unixDate: Math.floor(new Date().getTime() / 1000)
  })
  const setPendiente = await db.collection('Eventos').doc(eventoId)
  .collection('Entradas').doc(transactionId.id)
  .collection('Logs').add({
    dateUnix: Math.floor(new Date().getTime() / 1000),
    executorFunction: "server",
    placeIPBuy: direccionIP,
    type: 'Pendiente',
  })

  const formatedPrice = Intl.NumberFormat('es-ES', {style:'currency', currency:'EUR'}).format(totalPrice)
  const ammount = Number(formatedPrice.replace(/[\,\€]/g, ''))
  
  redsys.setParameter('DS_MERCHANT_AMOUNT', ammount);
  redsys.setParameter('DS_MERCHANT_ORDER', newOrder);
  redsys.setParameter('DS_MERCHANT_MERCHANTCODE', '351796214');
  redsys.setParameter('DS_MERCHANT_PRODUCTDESCRIPTION', `Evento ID: ${eventoId}, Entradas: ${quantity}, Asientos: ${infoSeats}`);
  redsys.setParameter('DS_MERCHANT_CURRENCY', '978');
  redsys.setParameter('DS_MERCHANT_TRANSACTIONTYPE', '0');
  redsys.setParameter('DS_MERCHANT_TERMINAL', '2');
  redsys.setParameter('DS_MERCHANT_MERCHANTURL', 'http://www.dentralia.com/notification');
  redsys.setParameter('DS_MERCHANT_URLOK', `http://www.dentralia.com/ok`);
  redsys.setParameter('DS_MERCHANT_URLKO', 'http://www.dentralia.com/ko');

  const signatureVersion = 'HMAC_SHA256_V1'
  const key = 'sq7HjrUOBfKmC576ILgskD5srU870gJ7'
  const params = redsys.createMerchantParameters();
  const signature = redsys.createMerchantSignature(key);
  
  const uriRedsys = 'https://sis-t.redsys.es:25443/sis/realizarPago'
  res.write(`<form name="from" id="autosubmit" action="${uriRedsys}" method="POST">
	<input type="hidden" name="Ds_MerchantParameters" value="${params}"/>
	<input type="hidden" name="Ds_SignatureVersion" value="${signatureVersion}"/>
	<input type="hidden" name="Ds_Signature" value="${signature}"/>
  </form><script>document.getElementById('autosubmit').submit()</script>
  `);

  res.end();
})

app.post('/api/v1/timer', (req, res) => {
  const {eventoId, entradasOBJ} = req.body
  // console.log(req.body)
  executeTimer(eventoId, entradasOBJ)
  res.status(200).send('ok')
})

app.post('/ok', (req, res) => {
  const body = req.body
  console.log(body)
  res.status(200).send('OK')
})

app.post('/ko', (req,res) => {
  const body = req.body
  console.log(body)
  res.status(403).send('KO')
})
app.post('/notification', async (req,res) => {
  let transactionsDoc = {}
  const redsys = new RedsysAPI()
  const {
    Ds_SignaruteVersion,
    Ds_MerchantParameters,
    Ds_Signature } = req.body

  const decodedParams = redsys.decodeMerchantParameters(Ds_MerchantParameters)
  const orderTPV = decodedParams.Ds_Order
  if (Number(decodedParams.Ds_Response) > 100) {
    console.log(decodedParams)
    res.status(203).send('Fail')
  }
  const getId = await db.collection('TransactionTPV').doc(orderTPV).get()
  const eventoId = getId.data().eventoId

  const getTransaction = await db
  .collection('Eventos').doc(eventoId)
  .collection('Transaction').where('tpvOrder', '==', orderTPV).get()
  getTransaction.forEach((doc) => {
    transactionsDoc = doc.data()
    transactionsDoc.id = doc.id
  })

  const updateTransaction = await db
  .collection('Eventos').doc(eventoId)
  .collection('Transaction').doc(transactionsDoc.id)
  .update({
    carrito: transactionsDoc.carrito.map(ticket => ticket.estado = 'Vendido')
  })
  console.log(transactionsDoc)
  const updateEntradas = transactionsDoc.carrito.forEach(async (obj) => {
    await db
    .collection('Eventos').doc(eventoId)
    .collection('Entradas').doc(obj.dbid)
    .update({
      estado: 'Vendido'
    })
  })

  console.log(decodedParams)
  res.status(403).send(decodedParams)
})
const PORT = process.env.PORT || 4242

const server = app.listen(PORT, () => console.log(`Running on port ${PORT}`));