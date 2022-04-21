// This is your test secret API key.
const stripe = require('stripe')('sk_test_51KDsabCEfvUCezSL48udO57i0YcetQIW8fhmJDv7CmFccF1B0ZfOjgqUmJQHh8KKU1KANxzKa4MMFQiNxhZO8MWg00pJMhTfjX');
const express = require('express');
const cors = require('cors')
const hbs = require('nodemailer-express-handlebars')
const nodemailer =require('nodemailer');
const res = require('express/lib/response');
const {db}=require('./firebase')
const path = require('path')

//comment
const app = express();
app.use(express.static('public'));
app.use(cors());
//app.use(express.urlencoded({extended: false}));
app.use(express.json());//servidor entiende datos en formato JSON

const YOUR_DOMAIN = 'https://testingserver-vesta.herokuapp.com/Subpages';
app.get('/', (req, res) => {
  res.send("hello world!!!!!")
})
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

// endpoint de producto Enviado
app.post('/email/v1/sending',(req,res)=>{
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
  template: 'sending', // the name of the template file i.e email.handlebars
  context:{
      name: data.name, // replace {{name}} with Adebola
      company: 'es la compania' // replace {{company}} with My Company
  }
};


// trigger the sending of the E-mail
transporter.sendMail(mailOptions, function(error, info){
  if(error){
      return console.log(error);
  }
  console.log('Message sent: ' + info.response);
});


  res.send("welcome to vestaZ")
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
  <li>Fecha de pago: ${userDate.toLocaleString()}</li>
  </ul>
  <ul>Envio:
    <li>Receptor de envío: ${DireccionDefaul.nombre} ${DireccionDefaul.apellidos} </li>
    <li>Dirección de envío: ${DireccionDefaul.calle} ${DireccionDefaul.numero} , ${DireccionDefaul.ciudad} ${DireccionDefaul.cpcode} , ${DireccionDefaul.provincia}</li>
    <li>Indicaciones de envío: ${DireccionDefaul.indicaciones} movil:${DireccionDefaul.telefono}</li>
  </ul>
  `;
   const transporter = nodemailer.createTransport({
    /*host: 'smtp.gmail.com',//'smtp.ethereal.email',//servidor smtp
    port:465,//587,
    segure: true,//par no ssl
    auth:{
      user:'vestazproducts@gmail.com',
      pass:'hzxdstbjhtemkqgk'
    },*/
    //.......dev
    host:'smtp.ethereal.email',//servidor smtp
    port:587,
    segure: false,//par no ssl
    auth:{
      user:'jenifer.lowe82@ethereal.email',
      pass:'MRVfC1DCT3mY5N5wTk'
    },
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
    console.log('mail enviado.');
    res.status(200).jsonp(tipoRequest)
  }

  
})


}
// Funcion principal 
async function GuardarPedido(itemsBuy,userDate){
  let ItemsMeta=JSON.parse(itemsBuy[0]);
  let UserEmailPedido = ItemsMeta.email;
  let UserUidPedido = ItemsMeta.uid;
  delete ItemsMeta.email;
  delete ItemsMeta.uid;
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

  let irespTransacGlobal = await db.collection('Users').doc(UserUidPedido).collection('Pedidos').add(ItemsMeta);//Guarda Todos los pedidos id Auto
  let idTransacGlobal=irespTransacGlobal.id;
  //console.log("idTransacGlobal:",idTransacGlobal)

  for(var j=0; j<NumObjet.length ; j++){ //agregar la funcion de resta de la compra 
    let restarCompraRef = db.collection('Productos').doc(NumObjet[j]);
    let doc = await restarCompraRef.get();
    let stock=doc.data().cantidad;
    let uidSeller=doc.data().uidSeller;
    stock= stock-ItemsMeta[NumObjet[j]].cantidad;// control de stock
    console.log("En Productos:",stock)
    let res1 = await restarCompraRef.update({
      cantidad: stock
    });
    
    let restarCompraRef2 =db.collection('Sellers').doc(uidSeller).collection('Producto').doc(NumObjet[j]);
    let res2 = await restarCompraRef2.update({
      cantidad: stock
    });
    console.log("En Seller/Producto:",stock)

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





const endpointSecret = 'whsec_432f059542cb8902a743c0e177bb0f1e8acc6e78b30154e05ffc95caeeb35273'
app.post('/webhook',async(request,response)=>{
  // encender tunel: stripe listen --forward-to localhost:4242/webhook
  //const sig = request.headers['stripe-signature']
  const payload =request.body;
  //console.log('el payload: '+ JSON.stringify(payload));
  //console.log('el payload en variable: ',payload);
   const tipoRequest=payload.type;
   var userEmail='',userValor='',utcSeconds='',userDate='',itemsBuy='';
  if (tipoRequest === "checkout.session.completed"){
    //console.log('el payload: ',JSON.stringify(payload));
    userEmail=payload.data.object.customer_details.email;
    userValor=payload.data.object.amount_total;
    utcSeconds=payload.created;
    userDate= new Date(utcSeconds*1000);
    itemsBuy=payload.data.object.metadata;
    GuardarPedido(itemsBuy,userDate);
    //Guardartransaccion(itemsBuy);
    let ItemsMeta=JSON.parse(itemsBuy[0]);
    let UserEmailPedido = ItemsMeta.email;
    let UserUidPedido = ItemsMeta.uid;
    delete ItemsMeta.email;
    delete ItemsMeta.uid;
    let DireccionDefaul=  await traerDireccion(UserUidPedido)
    
    
    
    contentHTML =`
    <h1>Informacion de pago Realizado</h1>
    <ul>
      <li>Usuario: ${userEmail}</li>
      <li>Valor: € ${userValor/100}</li>
      <li>Fecha de pago: ${userDate.toLocaleString()}</li>
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
      console.log('mail enviado.');
      res.status(200).jsonp(tipoRequest)
    }
    
  })

  }else{

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


function  toArraycarrito(reqbody){
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

                  /*----Crear el pago en Stripe---- */
app.post('/create-checkout-session', async (req, res) => {
  //Encender servidor:npm rum dev
  //console.log(req.body);
  let itemsBuy = JSON.stringify(req.body);
  let UserEmail = req.body.email;
  let UserUid = req.body.uid;
  delete req.body.email;
  delete req.body.uid;
  let ArrayTtems= toArraycarrito(req.body);
  //console.log("el contenido del array",itemsBuy)
  //console.log("el contenido del array",ArrayTtems)
  const session = await stripe.checkout.sessions.create({
    line_items: ArrayTtems,  
    customer_email: UserEmail,
    //receipt_email: 'jorcolen@gmail.com',
    mode: 'payment',
    metadata:[itemsBuy],
    //metadata: {"email":"user1@gmail.com","uid":"DOP9zgsRoSgrRq8C9KOwKHw3GfB3"},
    success_url: `${YOUR_DOMAIN}/success.html`,
    cancel_url: `${YOUR_DOMAIN}/cancel.html`,
  });
  //console.log(session);
  //res.redirect(303, session.url);
  res.json({id:session.id})
});

const PORT = process.env.PORT || 4242
const server = app.listen(PORT, () => console.log(`Running on port ${PORT}`));
 

