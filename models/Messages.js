const mongoose=require("mongoose")
const { Schema } = mongoose;

const MessageSchema = new Schema({
    sender:{
        type:Schema.Types.ObjectId,
        ref:"users"
    },
    content:{
        type:String,
        trim:true
    },
    chat:{
        type:Schema.Types.ObjectId,
        ref:"chat"
    },
},{
    timestamps:true,
});
const Message=mongoose.model('message',MessageSchema);
module.exports= Message;