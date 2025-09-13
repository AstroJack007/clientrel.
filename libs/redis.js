
import { createClient } from "redis";

const REDIS_URL=process.env.REDIS_URL;
if(!REDIS_URL){
    throw new Error("REDIS_URL MISSING");
}
let cached=global.__redisClient;
if(!cached){
    cached=global.__redisClient={client:null,promise:null};
}

export async function redisClient(){
    if(cached.client) return cached.client;
    if(!cached.promise){
        const client =createClient({url:REDIS_URL});
        client.on('error',(err)=>console.error('Redis Client Error:',err));

        cached.promise=await client.connect().then(()=>{
            cached.client=client;
            return client;
        }).catch(err => {
                
                cached.promise = null;
                throw err;
            });
    }
    return await cached.promise;
}

export default redisClient;
