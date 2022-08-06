import express from "express";
import { MongoClient } from "mongodb";
import dotenv from "dotenv";
import cors from "cors";
import bcrypt from "bcrypt";
import {ObjectId} from "mongodb"

const app = express()
dotenv.config()
const PORT=process.env.PORT;


app.use(express.json());



const MONGO_URL = process.env.MONGO;
// console.log(process.env)

async function Createconnection() {
  const Client = new MongoClient(MONGO_URL);
  await Client.connect();
  console.log("Mongo connected");
  return Client;
}

export const Client = await Createconnection();
app.use(cors());

app.get('/', function (req, res) {
  res.send('Hello World')
})



app.post("/login",async function(req,res){
  const {username,password} = req.body

 const userexist= await Client.db("Amazon-clone").collection("users").findOne({username:username})

  if(userexist){

    const ispasswordmatch = await bcrypt.compare(
      password,
      userexist.password
    );
    if(ispasswordmatch){
       res.status(200).send("password matched")
    }else{
       res.status(400).send("Invalid credentials")
        
    }
      
  }else{
      res.status(400).send("signup plz,Invalid credentials")
      
  }

})
app.post("/resetpassword",async function(req,res){
  const {username,password} = req.body

 const userexist= await Client.db("Amazon-clone").collection("users").findOne({username:username})

  if(userexist){
    const readyhashedpassword= await genhashedpassword(password)
    const restpassword = await Client.db("Amazon-clone").collection("users").updateOne({_id:ObjectId(userexist._id)},{$set:{
      username:username,
      password:readyhashedpassword
   }})
   if(restpassword){
    res.status(200).send("password successfully reseted ")
   }
   else{
    res.status(200).send("something went worng,can't reset password")

   }

   
      
  }else{
      res.status(400).send("Invalid username")
      
  }

})
app.post("/signup",async function(req,res){
  const {username,password} = req.body

 const userexist= await Client.db("Amazon-clone").collection("users").findOne({username:username})

  if(userexist){
      res.status(400).send("Username already exist")
  }else{
        const fullhashedpassword = await genhashedpassword(password)
        // console.log("password: ",fullhashedpassword)
 const Adduser= await Client.db("Amazon-clone").collection("users").insertOne({username:username,password:fullhashedpassword})
 res.status(200).send("Signup successfull")
      
  }

});

app.post("/product",async function(req,res){
const {title,price,img,rating} = req.body 
const Addproduct1= await Client.db("Amazon-clone").collection("product1").insertOne({title:title,price:price,img:img,rating:rating})
if(Addproduct1){
  res.status(200).send("product added")
}else{
  res.status(400).send("can't add something went worng")
}

})
app.get("/getproducts",async function(req,res){
// const {title,price,img,rating} = req.body 
const getproduct= await Client.db("Amazon-clone").collection("product1").find().toArray()
if(getproduct){
  res.status(200).send(getproduct)
}else{
  res.status(400).send("no product ,something went worng")
}

})
app.delete("/deleteproduct",async function(req,res){
const {id} = req.body 
const deleteproduct= await Client.db("Amazon-clone").collection("product1").deleteOne({_id:ObjectId(id)})
if(deleteproduct){
  res.status(200).send("product deleted successfully")
}else{
  res.status(400).send("can't delete ,something went worng")
}

})






async function genhashedpassword(password) {
  const rounds = 10;
  const salt = await bcrypt.genSalt(rounds);
  // console.log(salt,"this is salt")
  const hashedpassword = await bcrypt.hash(password, salt);
  // console.log("hassed",hashedpassword);
  return hashedpassword;
}


app.listen(PORT, () => console.log(`App started in ${PORT}`));


