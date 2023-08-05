import { MongoClient } from "mongodb";

const mongoURI = process.env.MONGODB_URI;
const client = new MongoClient(mongoURI);

export function connectToMongo(callback){
    client.connect().then((client)=>{
        return callback();
    }).catch(err=>{
        callback(err)
    })
}

export function getDb(dbName = process.env.DB_NAME){
    return client.db(dbName)
}

function signalHandler() {
    console.log("Closing MongoDB Connection...")
    client.close();
    process.exit();
}

process.on("SIGINT", signalHandler)
process.on("SIGTERM", signalHandler)
process.on("SIGQUIT", signalHandler) 

// const LoginSchema = new mongoose.Schema({
//     username:{
//         type:String,
//         required:true
//     },
//     password:{
//         type:String,
//         required:true
//     }
// });
// const Login = mongoose.model("LoginCollection", LoginSchema);
// module.exports = Login;