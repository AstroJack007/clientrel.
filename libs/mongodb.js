import mongoose from "mongoose";

const MONGO_URI=process.env.MONGO_URI;

if(!MONGO_URI){
    throw new Error("MONGO_URI MISSING");
}

let cached =global.mongoose;
if(!cached){
    cached=global.mongoose={conn:null,promise:null} //only create connection once across multiple reload
}
async function connect() {
    if(cached.conn){
        return cached.conn;
    }
    if(!cached.promise){//prevents starting multiple connections at the same time.
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
