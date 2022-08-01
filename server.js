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
  console.log('dominio correcto ',origin)
  res.status(200).json({
    error: "ok vale esta bien"
  }) 
});
// endpoint ticket comprado
app.post('/ticket/v1/bought',(req,res)=>{

  res.json({Bien:"ok"})
  async function traerdatos(){  
    const cityRef = db.collection('Eventos').doc('QGjIeXgeDv8qxKxcKQGn');
    const doc = await cityRef.get();
    if (!doc.exists) {
      console.log('No such document!');
    } else {
      console.log('Document data:', doc.data());
    }
  }
traerdatos();
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


const PORT = process.env.PORT || 4242

/*https.createServer({
  cert:fs.readFileSync('mi_certificado.crt'),
  key:fs.readFileSync('mi_certificado.key')
  },app).listen(PORT, () => console.log(`Running on port ${PORT}`));*/
const server = app.listen(PORT, () => console.log(`Running on port ${PORT}`));
