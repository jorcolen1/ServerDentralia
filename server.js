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
/* 
app.use((req, res, next) => {
  const origin = req.headers.origin
  console.log("eesss__>>>>>>>>",req.headers)
  if (origin == undefined || origin !== YOUR_DOMAIN) { 
    
    res.status(403).json({
      error: "Not allowed"
    })
  } else {
    next()  
  }
}); */

app.get('/', (req, res, next) => {
  const origin = req.headers.origin
  console.log('dominio correcto ',origin)
  res.status(200).json({
    error: "ok vale esta bien"
  }) 
});


// endpoint de bienvenida
app.post('/email/v1/welcome',(req,res)=>{
  console.log(req.body);
  const data = req.body;
  // initialize nodemailer
  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',//'smtp.ethereal.email',//servidor smtp
    port:465,//587,
    segure: true,//par no ssl
    auth:{
      user:'vestazproducts@gmail.com',
      pass:'hzxdstbjhtemkqgk'
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
    from:"'Vesta-Z Pedidos'<pedidos@vestaz.es>", // sender address
    to:data.email,//req.body.email , // list of receivers
    subject: 'Welcome!',
    template: 'email', // the name of the template file i.e email.handlebars
    bcc: 'vestazproducts@gmail.com',
    //attachments: [{ filename: "Vesta Z - Logo -dark-sin services.png", path: "./public/img/Vesta Z - Logo -dark-sin services.png" }],
    context:{
        name: data.name, // replace {{name}} 
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


  res.json({Bien:"correo enviado"})
  //res.send("welcome to vestaZ")
})

// endpoint de producto se esta tramitando
app.post('/email/v1/processing',(req,res)=>{
  console.log(req.body);
  const data = req.body;
  let tiempoTranscurrido= Date.now();
  var date = new Date(tiempoTranscurrido)
  console.log("es la fecha de compra-->>",)
  let DireccionDefaul = data.DireccionDefaul;
  // initialize nodemailer
  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',//'smtp.ethereal.email',//servidor smtp
    port:465,//587,
    segure: true,//par no ssl
    auth:{
      user:'vestazproducts@gmail.com',
      pass:'hzxdstbjhtemkqgk'
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
    from:"'Vesta-Z Procesos'<pedidos@vestaz.es>", // sender address
    to:data.email,//req.body.email , // list of receivers
    subject: 'Procesando Pedido',
    template: 'processing', // the name of the template file i.e email.handlebars
    context:{
      name: data.name, // replace {{name}} 
      email: data.email, // replace {{email}} 
      idPedido:data.idPedido,
      direccionDefaul:( DireccionDefaul.calle+" "+DireccionDefaul.numero+","+DireccionDefaul.ciudad+" "+DireccionDefaul.cpcode+","+DireccionDefaul.provincia),     
      DateSending:date  
    }
  };

  // trigger the processing of the E-mail
  transporter.sendMail(mailOptions, function(error, info){
    if(error){
        return console.log(error);
    }
    console.log('Message sent: ' + info.response);
  });
  const okMsg = JSON.stringify('Message sent properly')
    res.status(200).send(okMsg)
})
// endpoint de producto Enviado--ok
app.post('/email/v1/sending',(req,res)=>{
  console.log(req.body);
  const data = req.body;
  let tiempoTranscurrido= Date.now();
  var date = new Date(tiempoTranscurrido)
  console.log("es la fecha de compra-->>",)
  let DireccionDefaul = data.DireccionDefaul;
  // initialize nodemailer
  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',//'smtp.ethereal.email',//servidor smtp
    port:465,//587,
    segure: true,//par no ssl
    auth:{
      user:'vestazproducts@gmail.com',
      pass:'hzxdstbjhtemkqgk'
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
    from:"'Vesta-Z PedidosEnvio'<pedidos@vestaz.es>", // sender address
    to:data.email,//req.body.email , // list of receivers
    subject: 'Producto Enviado',
    template: 'sending', // the name of the template file i.e email.handlebars
    context:{
      name: data.name, // replace {{name}} 
      email: data.email, // replace {{email}} 
      idPedido:data.idPedido,
      direccionDefaul:( DireccionDefaul.calle+" "+DireccionDefaul.numero+","+DireccionDefaul.ciudad+" "+DireccionDefaul.cpcode+","+DireccionDefaul.provincia),     
      DateSending:date  
    }
  };

  // trigger the sending of the E-mail
  transporter.sendMail(mailOptions, function(error, info){
    if(error){
        return console.log(error);
    }
    console.log('Message sent: ' + info.response);
  });
  const okMsg = JSON.stringify('Message sent properly')
    res.status(200).send(okMsg)
})
// endpoint de producto se ha entregado
app.post('/email/v1/delivered',(req,res)=>{
  console.log(req.body);
  const data = req.body;
  let tiempoTranscurrido= Date.now();
  var date = new Date(tiempoTranscurrido)
  console.log("-->>",)
  let DireccionDefaul = data.DireccionDefaul;
  // initialize nodemailer
  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',//'smtp.ethereal.email',//servidor smtp
    port:465,//587,
    segure: true,//par no ssl
    auth:{
      user:'vestazproducts@gmail.com',
      pass:'hzxdstbjhtemkqgk'
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
    from:"'Vesta-Z Entrega'<pedidos@vestaz.es>", // sender address
    to:data.email,//req.body.email , // list of receivers
    subject: 'Producto Entregado',
    template: 'delivered', // the name of the template file i.e email.handlebars
    context:{
      name: data.name, // replace {{name}} 
      email: data.email, // replace {{email}} 
      idPedido:data.idPedido,
      direccionDefaul:( DireccionDefaul.calle+" "+DireccionDefaul.numero+","+DireccionDefaul.ciudad+" "+DireccionDefaul.cpcode+","+DireccionDefaul.provincia),     
      DateSending:date  
    }
  };

  // trigger the delivered of the E-mail
  transporter.sendMail(mailOptions, function(error, info){
    if(error){
        return console.log(error);
    }
    console.log('Message sent: ' + info.response);
  });
  const okMsg = JSON.stringify('Message sent properly')
    res.status(200).send(okMsg)
})
// endpoint de producto ha comenzado la devolucion
app.post('/email/v1/return',(req,res)=>{
  console.log(req.body);
  const data = req.body;
  let tiempoTranscurrido= Date.now();
  var date = new Date(tiempoTranscurrido)
  console.log("es la fecha -->>",)
  let DireccionDefaul = data.DireccionDefaul;
  // initialize nodemailer
  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',//'smtp.ethereal.email',//servidor smtp
    port:465,//587,
    segure: true,//par no ssl
    auth:{
      user:'vestazproducts@gmail.com',
      pass:'hzxdstbjhtemkqgk'
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
    from:"'Vesta-Z (Soporte)'<pedidos@vestaz.es>", // sender address
    to:data.email,//req.body.email , // list of receivers
    subject: 'Producto Devuelto',
    template: 'return', // the name of the template file i.e email.handlebars
    context:{
      name: data.name, // replace {{name}} 
      email: data.email, // replace {{email}} 
      idPedido:data.idPedido,
      direccionDefaul:( DireccionDefaul.calle+" "+DireccionDefaul.numero+","+DireccionDefaul.ciudad+" "+DireccionDefaul.cpcode+","+DireccionDefaul.provincia),     
      DateSending:date  
    }
  };

  // trigger the sending of the E-mail
  transporter.sendMail(mailOptions, function(error, info){
    if(error){
        return console.log(error);
    }
    console.log('Message sent: ' + info.response);
  });
  const okMsg = JSON.stringify('Message sent properly')
    res.status(200).send(okMsg)
})

// endpoint de Notificacion Cambio de Password 
app.post('/email/v1/passwordntf',(req,res)=>{
  console.log(req.body);

  const data = (req.body);
  console.log("datos parse",data)
  let tiempoTranscurrido= Date.now();
  var date = new Date(tiempoTranscurrido)
  // initialize nodemailer
  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',//'smtp.ethereal.email',//servidor smtp
    port:465,//587,
    segure: true,//par no ssl
    auth:{
      user:'vestazproducts@gmail.com',
      pass:'hzxdstbjhtemkqgk'
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
    from:"'Vesta-Z Admin'<pedidos@vestaz.es>", // sender address
    to:data.email,//req.body.email , // list of receivers
    subject: 'Cambio de Contraseña',
    template: 'passwordntf', // the name of the template file i.e email.handlebars
    context:{
      lugar:data.lugar,
      DateSending:date  
    }
  };

  // trigger the sending of the E-mail
  transporter.sendMail(mailOptions, function(error, info){
    if(error){
        return console.log(error);
    }
    console.log('Message sent: ' + info.response);
  });
  const okMsg = JSON.stringify('se cambio la contraseña')
    res.status(200).send(okMsg)
})

//funcion para detectar direccion por defecto
function DirecciondeEnvio(ArrayDirec) {
  let NumObjet = Object.keys(ArrayDirec);
  for(var i=0; i<NumObjet.length ; i++){
    let objet_Individual=ArrayDirec[NumObjet[i]];

    //console.log(i,objet_Individual.selected)

    if(objet_Individual.selected === true){
      //console.log("Objet_Individual",objet_Individual)
      return objet_Individual;
    }
  }
}

//Funcion para traer todas las direcciones 
async function traerDireccion(UserUidPedido){
  const cityRef = db.collection('Users').doc(UserUidPedido);
  doc = await cityRef.get()
    //console.log("los datos son",doc.data())
    const User = doc.data();
    User.id = doc.id;
    
    let DireccionDefaul=DirecciondeEnvio(User.direcciones)
      //console.log("direccion completaaaaaaaaaa")
      return DireccionDefaul;
}

// funcion para enviar Email de cada producto a su vendedor
async function SendConfirSellers(emailSeller,Contenido,DireccionDefaul,userDate){

  //console.log("Correo del vendedor de cada producto",emailSeller )
  //console.log('Datos de cada producto--->>>',Contenido)
  //console.log('Datos direccion de envio--->>>',DireccionDefaul)
  let total = Contenido.precio*Contenido.cantidad;
  contentHTML =`
  <h1>Informacion de pago Realizado</h1>
  <ul>Producto:
  <li>Id: ${Contenido.id}</li>
  <li>Nombre: ${Contenido.name}</li>
  <li>Precio unidad: € ${Contenido.precio}</li>
  <li>Cantidad: ${Contenido.cantidad}</li>
  <li>Total: € ${total}</li>
  <br>
  <li>Fecha de pago: ${userDate}</li>
  </ul>
  <ul>Envio:
    <li>Receptor de envío: ${DireccionDefaul.nombre} ${DireccionDefaul.apellidos} </li>
    <li>Dirección de envío: ${DireccionDefaul.calle} ${DireccionDefaul.numero} , ${DireccionDefaul.ciudad} ${DireccionDefaul.cpcode} , ${DireccionDefaul.provincia}</li>
    <li>Indicaciones de envío: ${DireccionDefaul.indicaciones} movil:${DireccionDefaul.telefono}</li>
  </ul>
  `;
   const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',//'smtp.ethereal.email',//servidor smtp
    port:465,//587,
    segure: true,//par no ssl
    auth:{
      user:'vestazproducts@gmail.com',
      pass:'hzxdstbjhtemkqgk'
    },
    //.......dev
    /*host:'smtp.ethereal.email',//servidor smtp
    port:587,
    segure: false,//par no ssl
    auth:{
      user:'jenifer.lowe82@ethereal.email',
      pass:'MRVfC1DCT3mY5N5wTk'
    },*/
    tls:{
     // rejectUnauthorized:false
    }
  });
  var mailconten ={
    from:"'Vesta-Z Pedidos'<pedidos@vestaz.es>",
    to: emailSeller ,//userEmail,
    subject: 'Reporte de pago',
    //text:'hello word',
    html:contentHTML,
  };
  
  const info= await transporter.sendMail(mailconten,(error,info)=>{ 
    if (error){
    res.status(500).send(error.message);
  }else{
    console.log('mail enviado a cada seller');
    res.status(200).jsonp(tipoRequest)
  }

  
})


}

// Funcion principal 
async function GuardarPedido(itemsBuy,userDate){

    let UserEmailPedido = itemsBuy.email;
    let UserUidPedido = itemsBuy.uid;
    delete itemsBuy.email;
    delete itemsBuy.uid;
    //console.log("eliminando algunos:",itemsBuy)// todo el Array

    let NumObjet0 = Object.keys(itemsBuy);
    let ArrayItems= {}
    for(var i=0; i<NumObjet0.length ; i++){
      ArrayItems[i]=JSON.parse(itemsBuy[i])
      ArrayItems[ArrayItems[NumObjet0[i]].id]=ArrayItems[i]
      delete ArrayItems[i];
    }
    console.log("-->>>>>decosificasdos desde stripe",ArrayItems)

  let ItemsMeta=ArrayItems;//decodificacion completada
  //console.log("datos",ItemsMeta)
  //console.log("uid Valida",UserUidPedido)
  
   let DireccionDefaul= await traerDireccion(UserUidPedido)
  //console.log("direccion Valida",DireccionDefaul)
 
   let tiempoTranscurrido= Date.now();
  //let datePayUnixUTC = datePay.getTime();
  let datePayHum = new Date(tiempoTranscurrido)
  //datePayGood= datePayHum.toLocaleDateString()+" "+datePayHum.toLocaleTimeString();
  let datePayGood2= datePayHum.toJSON();

  let Dia= datePayHum.getDate();
  let mes= (datePayHum.getMonth()+1);
  let anio= datePayHum.getFullYear();

  let hora= datePayHum.getHours();
  let minu= datePayHum.getMinutes();
  let seg= datePayHum.getSeconds();
  let TimeZone= datePayHum.getTimezoneOffset();
  
  let datePayGood = Dia+"-"+mes+"-"+anio+" "+hora+":"+minu+":"+seg+" UTC- "+TimeZone;
  //console.log(datePayGood,"...>>");
  let NumObjet = Object.keys(ItemsMeta);

  //console.log("los Datos del pedido",ItemsMeta)
  //console.log("id de productos-->>",NumObjet)
  let objet_Individual= '';
  let objet_Individual2= '';
  for(var i=0; i<NumObjet.length ; i++){//agregar los atributos de fechas de compra
    objet_Individual=ItemsMeta[NumObjet[i]];
    const estado = {
      estado: "Comprado",
      FechaPagoUnix:tiempoTranscurrido,
      FechaPago:datePayGood,
      uidPedidoUser:UserUidPedido,
      address: DireccionDefaul 
    };
    let ItemsMetaState = Object.assign(objet_Individual,estado)
    ItemsMeta[NumObjet[i]]=ItemsMetaState;
    //console.log("objeto-->>>",i,ItemsMetaState)
  } 
  //console.log ("despues de agregar la fecha",ItemsMeta)

   let irespTransacGlobal = await db.collection('Users').doc(UserUidPedido).collection('Pedidos').add(ItemsMeta);//Guarda Todos los pedidos id Auto
  let idTransacGlobal=irespTransacGlobal.id;
   console.log("idTransacGlobal:",idTransacGlobal)

   for(var j=0; j<NumObjet.length ; j++){ //agregar la funcion de resta de la compra 
    let restarCompraRef = db.collection('Productos').doc(NumObjet[j]);
    let doc = await restarCompraRef.get();
    let stock=doc.data().cantidad;
    console.log("En Productos stock:",stock)

    let uidSeller=doc.data().uidSeller;
    stock= stock-ItemsMeta[NumObjet[j]].cantidad;// control de stock
    console.log("En nuevo stock:",stock)
    let res1 = await restarCompraRef.update({
      cantidad: stock
    });
    
    let restarCompraRef2 =db.collection('Sellers').doc(uidSeller).collection('Producto').doc(NumObjet[j]);
    let res2 = await restarCompraRef2.update({
      cantidad: stock
    });
    console.log("En final Seller/Producto: ",stock)

  }
  for(var k=0; k<NumObjet.length ; k++){ //agregar uidSeller a la transaccion   
    let sellerVetaRef = db.collection('Productos').doc(NumObjet[k]);//busco el id del vendedor
    let doc = await sellerVetaRef.get();
    let uidSeller = doc.data().uidSeller;
    objet_Individual2 =ItemsMeta[NumObjet[k]];
    const estado2 = {idTransacGlobal:idTransacGlobal,uidPedidoSeller:uidSeller};
    let ItemsMetaState2 = Object.assign(objet_Individual2,estado2)
    ItemsMeta[NumObjet[k]]=ItemsMetaState2;
    //console.log("id del seller",uidSeller);
    //console.log("datos del producto vendido",ItemsMeta[NumObjet[k]]);
    await db.collection('Sellers').doc(uidSeller).collection('Ventas').add(ItemsMeta[NumObjet[k]]);//Guarda Todos los pedidos id Auto
  }
  for(var k=0; k<NumObjet.length ; k++){ //obtner Correo de cada seller y enviar correo   
    let sellerVetaRef = db.collection('Productos').doc(NumObjet[k]);//busco el id del vendedor
    let doc = await sellerVetaRef.get();
    let uidSeller = doc.data().uidSeller;
    let cityRef = db.collection('Sellers').doc(uidSeller);
    let doc1 = await cityRef.get();
    let emailSeller= doc1.data().email;
    let DireccionDefaul=  await traerDireccion(UserUidPedido)
    SendConfirSellers(emailSeller,ItemsMeta[NumObjet[k]],DireccionDefaul,userDate);

 }


  //await db.collection('PedidosUsers').doc(UserUidPedido).set(ItemsMeta);//Guarda el ultimo pedido
  await db.collection('CarritoUsers').doc(UserUidPedido).delete(); 
  
}

async function sendEmail(userEmail,userValor,userDate,itemsBuy2){
  console.log("valoresss",userEmail,userValor,itemsBuy2)
  let UserEmailPedido = itemsBuy2.email;
  let UserUidPedido = itemsBuy2.uid;

  let DireccionDefaul=  await traerDireccion(UserUidPedido)
  console.log("v222222",UserEmailPedido,UserUidPedido,DireccionDefaul)

  contentHTML =`
  <h1>Informacion de pago Realizado</h1>
  <ul>
    <li>Usuario: ${userEmail}</li>
    <li>Valor: € ${userValor/100}</li>
    <li>Fecha de pago: ${userDate}</li>
    <br>
    Envio: 
    <li>Receptor de envío: ${DireccionDefaul.nombre} ${DireccionDefaul.apellidos} </li>
    <li>Dirección de envío: ${DireccionDefaul.calle} ${DireccionDefaul.numero} , ${DireccionDefaul.ciudad} ${DireccionDefaul.cpcode} , ${DireccionDefaul.provincia}</li>
    <li>Indicaciones de envío: ${DireccionDefaul.indicaciones} movil:${DireccionDefaul.telefono}</li>
  </ul>
  `;
  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',//'smtp.ethereal.email',//servidor smtp
    port:465,//587,
    segure: true,//par no ssl
    auth:{
      user:'vestazproducts@gmail.com',
      pass:'hzxdstbjhtemkqgk'
    },
    /*//.......dev
    host:'smtp.ethereal.email',//servidor smtp
    port:587,
    segure: false,//par no ssl
    auth:{
      user:'jenifer.lowe82@ethereal.email',
      pass:'MRVfC1DCT3mY5N5wTk'
    },*/
    tls:{
     // rejectUnauthorized:false
    }
  });
  var mailconten ={
    from:"'Vesta-Z Pedidos'<pedidos@vestaz.es>",
    to: userEmail,
    subject: 'Reporte de pago',
    //text:'hello word',
    html:contentHTML,
  };
  
  const info= await transporter.sendMail(mailconten,(error,info)=>{ 
    if (error){
    res.status(500).send(error.message);
  }else{
    console.log('mail enviado al User.');
    res.status(200).jsonp(tipoRequest)
  }
  

  })
}

const endpointSecret = 'whsec_432f059542cb8902a743c0e177bb0f1e8acc6e78b30154e05ffc95caeeb35273'
app.post('/webhook',async(request,response)=>{
  // encender tunel: stripe listen --forward-to localhost:4242/webhook
  //const sig = request.headers['stripe-signature']
  const payload =request.body;
  /* console.log('el payload: '+ JSON.stringify(payload));
  console.log('el payload en variable: ',payload); */
   const tipoRequest=payload.type;
   var userEmail='',userValor='',utcSeconds='',userDate='',itemsBuy='';
  if (tipoRequest === "checkout.session.completed"){
    //console.log('el payload: ',JSON.stringify(payload));
    userEmail=payload.data.object.customer_details.email;
    userValor=payload.data.object.amount_total;
    utcSeconds=payload.created;
    userDate= new Date(utcSeconds*1000);
    itemsBuy=payload.data.object.metadata;//Aqui procesar a itemsBuy
    itemsBuy2=payload.data.object.metadata;//Aqui procesar a itemsBuy
    
    //console.log("los metadatos en stripe:",itemsBuy)// todo el Array
    sendEmail(userEmail,userValor,userDate,itemsBuy2);
    GuardarPedido(itemsBuy,userDate);

    

  }else{
    console.log('por el no del Webhook')
  }
  
  let event;
  try {
    //event = stripe.webhooks.constructEvent(payload,sig,endpointSecret)
  } catch (err) {
    //return response.status(400).send(`webhook Error: ${err.message}`)
  }

  response.json({userEmail})
  response.status(200);  
})

function  toArrayStripe(reqbody){
  let NumObjet = Object.keys(reqbody);
  let ArrayItems = Object.keys(reqbody);
  //console.log(reqbody[NumObjet[0]].name);
  for(var i=0; i<NumObjet.length ; i++){
    ArrayItems[i]={price_data:
              {
              currency:"EUR",
              product_data:
                {
                name:reqbody[NumObjet[i]].name,
                description:reqbody[NumObjet[i]].id,
                },
              unit_amount:
              parseFloat((reqbody[NumObjet[i]].precio),10)*100,
              },
            quantity: parseInt((reqbody[NumObjet[i]].cantidad),10),
          }
  }
  //console.log("el contenido del array",ArrayItems)
  return ArrayItems
}
function  toArrayMetadata(itemsBuy){
  //console.log("el contenido del array",itemsBuy)
  let ArrayData={"email": itemsBuy.email, "uid": itemsBuy.uid}
  delete itemsBuy.email
  delete itemsBuy.uid
  let itemsBuy1= itemsBuy
  let NumObjet = Object.keys(itemsBuy);
  let ArrayItems= {}
  //console.log(itemsBuy[NumObjet[0]]);
  for(var i=0; i<NumObjet.length ; i++){
    //ArrayItems[itemsBuy[NumObjet[i]].id]=JSON.stringify (itemsBuy[NumObjet[i]])
    ArrayItems[i]=JSON.stringify (itemsBuy[NumObjet[i]])
  }
  //console.log("solo identificadores",ArrayItems)
  //console.log("11111",ArrayData)
  //console.log("22222--->>>",ArrayItems)
  let allData= {...ArrayData, ...ArrayItems}
  //ArrayData=ArrayData.concat(ArrayItems);
  //console.log("=======",allData)

  return allData
}

                  /*----Crear el pago en Stripe---- */
app.post('/create-checkout-session', async (req, res) => {
  //Encender servidor:npm rum dev
  //console.log(JSON.stringify(req.body));
  let itemsBuy1 = req.body;
  let ArrayMeta= toArrayMetadata(itemsBuy1);
  let UserEmail = req.body.email;
  delete req.body.email;
  delete req.body.uid;
  let ArrayTtems= toArrayStripe(req.body);
  //console.log("el contenido del array para metadatos",ArrayMeta)
  //console.log("el contenido del array",ArrayTtems)
  let objetToStripe={
    line_items: ArrayTtems,  
    customer_email: UserEmail,
    //receipt_email: 'jorcolen@gmail.com',
    mode: 'payment',
    //metadata:itemsBuyNew,
    //metadata:[itemsBuy],
    metadata: ArrayMeta,
    success_url: `${YOUR_DOMAIN1}/success.html`,
    cancel_url: `${YOUR_DOMAIN1}/cancel.html`,
  }
  console.log('objeto a enviar:::::::::::::::::::::::::::::::::')
  console.log('----->',objetToStripe)
  const session = await stripe.checkout.sessions.create(objetToStripe);
  console.log("sessionId devuelto",session.id );
  //res.redirect(303, "session.url");
  res.json({id:session.id}) 
});

const PORT = process.env.PORT || 4242

/*https.createServer({
  cert:fs.readFileSync('mi_certificado.crt'),
  key:fs.readFileSync('mi_certificado.key')
  },app).listen(PORT, () => console.log(`Running on port ${PORT}`));*/
const server = app.listen(PORT, () => console.log(`Running on port ${PORT}`));
