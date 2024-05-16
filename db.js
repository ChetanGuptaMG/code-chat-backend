const mongoose=require('mongoose')
const dotenv=require("dotenv")
dotenv.config({path:'./config.env'})
const mongoURI=process.env.DATABASE;

const connectToMongo= async()=>{
  try{
    const connect=await mongoose.connect(mongoURI,{
      useNewUrlParser:true,
      useUnifiedTopology:true,
    });
    console.log("Connected to CodeChat DB")
  } catch(e){
    console.log(`Error: ${e.message}`);
    process.exit();
  }
}
module.exports=connectToMongo;     

//  request -- > middleWare  --  > controllers  --- >  mongoose --- >mongodb 