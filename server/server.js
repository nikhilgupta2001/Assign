const express = require('express');
const app = express()
var port = process.env.PORT || 3000;
const mongoose = require('mongoose');
const User = require('./models/user.js')
const jwt = require('jsonwebtoken')
const {MONGOURI}=require('./keys');
const {JWT_SECRET}=require('./keys');
const bcrypt=require('bcryptjs')

app.use(express.json());

//signup 
mongoose.connect(MONGOURI,{
    useNewUrlParser:true,
    useUnifiedTopology:true
})
app.get('/',(req,res)=>{
    console.log("Hello WOrld");
})
app.post('/signup', (req, res) => {
    // console.log(req);
    console.log(req.body);
    const { name, email, password } = req.body;
    if (!email && !password && !name) {
        return res.status(422).json({ error: "please add all the fields" })
    }
    User.findOne({ email: email })
        .then((savedUser) => {
            console.log(savedUser);
            if (savedUser) {
                return res.status(422).json({ error: "email id already exists" })
            }

            bcrypt.hash(password, 12)
                .then(hashedpass => {
                    const user = new User({
                        name,
                        email,
                        password: hashedpass,
                    })
                    user.save().then(user=>{
                        res.json({messsage:"saved successfully"})
                    })
                    .catch(err=>{
                        console.log(err)
                    })
                })
        }).catch(err=>{
            console.log(err);
        })
})

//login

app.get('/login',(req,res)=>{
    const { email, password } = req.body
    if(!email || !password){
        res.status(422).json({ error: "please add correct email and password" })
    }
    User.findOne({email:email})
    .then(savedUser=>{
        if(!savedUser){
            return res.status(422).json({ error: "Invalid Email or password" })
        }
        bcrypt.compare(password,savedUser.password)
          .then(doMatch=>{
              if(doMatch){
                const token = jwt.sign({ _id: savedUser._id }, JWT_SECRET)
                res.json({auth:token}); 
              }
              else {
                return res.status(422).json({ error: "invalid password" })
            }
          }).catch(err=>{
             console.log(err);
          })
    })

})

app.post('/home',(req,res)=>{
   var token=req.headers['auth'];
   console.log(req.headers)
   jwt.verify(token,JWT_SECRET,(err,payload)=>{
       if(err) {
           return res.status(422).json({error:"Unauthorized"})
       }
       else{
           res.json("Success");
       }
   })
})

 
app.listen(port,  () => {
    console.log("Server is running on", port);
})

