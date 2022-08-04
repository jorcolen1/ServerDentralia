// This is your test secret API key.
const stripe = require('stripe')('sk_test_51KDsabCEfvUCezSL48udO57i0YcetQIW8fhmJDv7CmFccF1B0ZfOjgqUmJQHh8KKU1KANxzKa4MMFQiNxhZO8MWg00pJMhTfjX');
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
//const pdf = require('html-pdf');
var QRCode = require('qrcode')
//var html_to_pdf = require('html-pdf-node');
//const { dictionary } = require('pdfkit/js/page');
//comment
const app = express();
app.use(express.static('public'));
app.use(express.json());//servidor entiende datos en formato JSON

const YOUR_DOMAIN = 'https://testingserver-vesta.herokuapp.com';
const YOUR_DOMAIN1 = 'https://testingserver-vesta.herokuapp.com/Subpages';
//const YOUR_DOMAIN = 'http://192.168.1.98/';


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

//conseguir el QR e Insertarlo en el PDF
const getPdfQr = async(data) =>{
  let uuid='121234234534hjnnbkjhfd'
  try {
    await QRCode.toFile('./views/images/imgQR.jpg', uuid);
  } catch (err) {
    console.error(err)
  }
  const doc = new PDFDocument();
  doc.pipe(fs.createWriteStream('./views/images/output.pdf'));
  //.text(`hola mundo con pdf kit ${filename} !`, 100, 100);
  doc.image('views/images/logo.png', 50, 50, {width: 100});
  doc.image('views/images/imgQR.jpg', 430, 115, {width: 100});
  doc.fontSize(8).text(uuid,430,210);
  doc.fontSize(20).text('Nombre del Evento-'+'(Ciudad)',50,130,{ align: 'left'});
  doc.fontSize(18).text('Nombre del Recinto',50,150,{ align: 'left'});
  doc.fontSize(14).text('Direccion del Recinto',50,170,{ align: 'left'});
  doc.text('Ciudad del recinto',50,190,{ align: 'left'});

  doc.text('Fecha:24/06/2022 '+' Hora:21:30',50,230,{ align: 'left'});
  doc.text('Zona: Tendido',50,250,{ align: 'left'});
  
  doc.text('Precio: 41,80$',50,280,{ align: 'left'});
  doc.text('(38,00 + 4,80 gastos + seguro)',50,300,{ align: 'left'});

  doc.fontSize(8).text(`1) Es obligatorio para todos los asistentes llevar consigo el DNI. 2) Está reservado el derecho de admisión(Ley 17/97). 3)El horario de inicio y de apertura de puertas podrán sufrir cambios para cumplir con la normativa vigente en relación al Covid-19. 4) No se aceptaran cambios ni devoluciones. 5) La localidad adquirida da derecho a asistir al evento que corresponde y en la butaca/zona asignada. La suspension de dicho evento lleva consigo exclusivamente la devolucion del importe de la entrada(excluidos los gastos de gestión). 6) Es potestad de la organización permitir la entrada al recinto una vez comenzado el evento. 7) En caso de suspensión del evento, la organización se compromete a la devolución del importe de la entrada en el plazo máximo de 15 días hábiles a partir de la fecha del anuncio de la suspensión. 8) No será objeto de devolución aquellos supuestos en los que la suspensión o modificación se produjera una vez comenzado el evento o actividad recreativa y fuera por causa de fuerza mayor. Las malas condiciones climatológicas no dan derecho a devolución de la entrada. 9) Los menores de edad que tengan entre 0 y 13 años, ambos inclusive, podrán acceder al concierto acompañados por su padre/madre/tutor legal y presentar esta autorización correspondiente en el acceso al recinto. Los menores de edad que tengan entre 14 y 15 años, ambos inclusive, podrán acceder al concierto y presentando la autorización firmada por su padre/madre/tutor legal. 10) Cualquier entrada rota o con indicios de falsificación autorizará al organizador a privar a su portador del acceso al evento. 11) La organización del evento no se hace responsable de las entradas robadas. 12) Queda prohibido el acceso al recinto con cámara de foto y/o video (sea doméstica o profesional).Queda prohibido la utilización del flash para la realización de fotos con móviles. El incumplimiento de esta norma puede acarrear la expulsión del recinto sin derecho a devolución del importe de la entrada. 13) Queda prohibido introducir alcohol, sustancias ilegales, armas u objetos peligrosos. 14) Queda limitada la entrada y/o permanencia en el evento a toda persona que se encuentre en estado de embriaguez. 15) Todo asistente podrá ser sometido a un registro por el equipo de seguridad en el acceso al evento, siguiendo la normativa de Ley de Espectáculos Públicos y Seguridad Privada. 16) Salvo que se indique lo contrario a través de cartel informativo en el recinto, no está permitida la entrada de comida ni bebida del exterior salvo botella de agua pequeña (33cl) a la que se le quitará el tapón en el control de acceso.`
  ,50,400,{ align: 'justify'});

  doc.end();
  console.log('pdfCreado')
}

//enviar notificacion de correo
const sentTicket = async(data) =>{
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
    subject: ` Aquí tienes tus entradas ${data.cliente.fullName}, de SEBASTIÁN YATRA - 'DHARMA TOUR' (VALENCIA)`,
    template: 'email', // the name of the template file i.e email.handlebars
    bcc: 'dentraliagestion@gmail.com',
    attachments: [{ filename: "output.pdf", path: "./views/images/output.pdf" }],
    context:{
        name: data.cliente.fullName, // replace {{name}} 
        email: data.email, // replace {{email}}
        uidUser:data.uidUser  
    }
  };

  // trigger the sending of the E-mail
  transporter.sendMail(mailOptions, function(error, info){
    if(error){
        return console.log(error);
    }
    console.log('Message sent: ' + info.response);
  });
}

// endpoint ticket comprado
app.post('/ticket/v1/bought1',(req,res)=>{
  const data = req.body;
  console.log('la peticion',data)
  async function traerdatos(){  
    const cityRef = db.collection('Eventos').doc('QGjIeXgeDv8qxKxcKQGn');
    const doc = await cityRef.get();
    if (!doc.exists) {
      console.log('No such document!');
    } else {
      console.log('Document data:', doc.data());
    }
  }
//traerdatos();
  getPdfQr(data);
  res.json({Bien:"ok"})
})

// endpoint de bienvenida
app.post('/ticket/v1/bought',(req,res)=>{
  const data = req.body;
  console.log('Parametros de Compra:',data);
  
  getPdfQr(data);
  sentTicket(data);

  res.json({Bien:"ok"})
  //res.send("welcome to vestaZ")
})


const PORT = process.env.PORT || 4242

/*https.createServer({
  cert:fs.readFileSync('mi_certificado.crt'),
  key:fs.readFileSync('mi_certificado.key')
  },app).listen(PORT, () => console.log(`Running on port ${PORT}`));*/
const server = app.listen(PORT, () => console.log(`Running on port ${PORT}`));
