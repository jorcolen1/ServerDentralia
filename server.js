// This is your test secret API key.
const stripe = require('stripe')('sk_test_51KDsabCEfvUCezSL48udO57i0YcetQIW8fhmJDv7CmFccF1B0ZfOjgqUmJQHh8KKU1KANxzKa4MMFQiNxhZO8MWg00pJMhTfjX');
const express = require('express');
const cors = require('cors')
const nodemailer =require('nodemailer');
const res = require('express/lib/response');
const {db}=require('./firebase')
//comment
const app = express();
app.use(express.static('public'));
app.use(cors());
//app.use(express.urlencoded({extended: false}));
app.use(express.json());//servidor entiende datos en formato JSON

const YOUR_DOMAIN = 'http://localhost:5500/Subpages';
app.get('/', (req, res) => {
  res.send("hi!")
})
app.get('/a',async(req,res)=>{

  const querySnapshot = await db.collection('CarritoUsers').get()
  console.log(querySnapshot.docs[0].data())
  res.send("hello <h3>y</h3>")
})

async function GuardarPedido(itemsBuy){
  let ItemsMeta=JSON.parse(itemsBuy[0]);
  let UserEmailPedido = ItemsMeta.email;
  let UserUidPedido = ItemsMeta.uid;
  delete ItemsMeta.email;
  delete ItemsMeta.uid;

  let tiempoTranscurrido= Date.now();
  //let datePayUnixUTC = datePay.getTime();
  let datePayHum = new Date(tiempoTranscurrido+3600000)

  let NumObjet = Object.keys(ItemsMeta);

  console.log(ItemsMeta)
  console.log("id de productos-->>",NumObjet)
  let objet_Individual= '';
  for(var i=0; i<NumObjet.length ; i++){//agregar los atributos de fechas de compra
    objet_Individual=ItemsMeta[NumObjet[i]];
    const estado = {estado: "comprado",FechaPagoUnix:tiempoTranscurrido,FechaPago:datePayHum.toUTCString()};
    let ItemsMetaState = Object.assign(objet_Individual,estado)
    ItemsMeta[NumObjet[i]]=ItemsMetaState;
  }

  for(var j=0; j<NumObjet.length ; j++){ //agregar la funcion de resta de la compra 

    let restarCompraRef = db.collection('Productos').doc(NumObjet[j]);
    let doc = await restarCompraRef.get();
    let stock =doc.data().cantidad;
    let uidSeller =doc.data().uidSeller;
    stock= stock-ItemsMeta[NumObjet[j]].cantidad;// control de sstock
    console.log("",stock)
    let res1 = await restarCompraRef.update({
      cantidad: stock
    });
    
    let restarCompraRef2 =db.collection('Sellers').doc(uidSeller).collection('Producto').doc(NumObjet[j]);
  
    let res2 = await restarCompraRef2.update({
      cantidad: stock
    });
    console.log("",stock)
  }


  //console.log(ItemsMeta[NumObjet[0]])
  //console.log(ItemsMeta)

  await db.collection('PedidosUsers').doc(UserUidPedido).set(ItemsMeta);
  await db.collection('Users').doc(UserUidPedido).collection('Pedidos').add(ItemsMeta);
  await db.collection('CarritoUsers').doc(UserUidPedido).delete();
}
async function Guardartransaccion(itemsBuy){
  let ItemsMeta=JSON.parse(itemsBuy[0]);
  let UserEmailPedido = ItemsMeta.email;
  let UserUidPedido = ItemsMeta.uid;
  delete ItemsMeta.email;
  delete ItemsMeta.uid;
  let NumObjet = Object.keys(ItemsMeta);
  //console.log("id de productos-->>",NumObjet)
  const estado = {estado: "Comprado"};
  let ItemsMetaState = Object.assign(ItemsMeta,estado)
  //console.log("modificado--->>>",Object.keys(ItemsMetaState))
  await db.collection('TransaccionesUserSeller').add(ItemsMetaState);
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
    console.log('el payload: ',JSON.stringify(payload));
    userEmail=payload.data.object.customer_details.email;
    userValor=payload.data.object.amount_total;
    utcSeconds=payload.created;
    userDate= new Date(utcSeconds*1000);
    itemsBuy=payload.data.object.metadata;
    GuardarPedido(itemsBuy);
    Guardartransaccion(itemsBuy);
    contentHTML =`
    <h1>Informacion de pago Realizado</h1>
    <ul>
      <li>Usuario: ${userEmail}</li>
      <li>Valor: € ${userValor/100}</li>
      <li>Fecha de pago: ${userDate.toLocaleString()}</li>
    </ul>
    `;
    const transporter = nodemailer.createTransport({
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
      from:"'Vesta-Z Server'<suport@vestaz.com>",
      to: userEmail,
      subject: 'Reporte de pago',
      //text:'hello word',
      html:contentHTML,
    };
    
    /*const info= await transporter.sendMail(mailconten,(error,info)=>{
    
      if (error){
      res.status(500).send(error.message);
    }else{
      console.log('mail enviado.');
      res.status(200).jsonp(tipoRequest)
    }

    
  })*/

//console.log('mensaje enviado', info.messageId)


  }else{

  }
  let event;
  try {
    //event = stripe.webhooks.constructEvent(payload,sig,endpointSecret)
  } catch (err) {
    //return response.status(400).send(`webhook Error: ${err.message}`)
  }
  //response.json({payload})
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
 

