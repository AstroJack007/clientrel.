import mongoose from "mongoose";

const MONGO_URI=process.env.MONGO_URI;

if(!MONGO_URI){
    throw new Error("MONGO_URI MISSING");
}

let cached =global.mongoose;
if(!cached){
    cached=global.mongoose={conn:null,promise:null} 
}
async function connect() {
    if(cached.conn){
        return cached.conn;
    }
    if(!cached.promise){
          const opts = {
            bufferCommands: false,
        }; 
        cached.promise=mongoose.connect(MONGO_URI,opts).then((m)=>{
            return m;
        });
    }
    cached.conn=await cached.promise;
    return cached.conn;
}
export default connect;
