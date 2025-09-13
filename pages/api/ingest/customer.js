import redisClient from "../../../libs/redis";

const STREAM_NAME='customer_stream';
const client = await redisClient();
export default async function (req, res){
    if(req.method!='POST'){
        return res.status(405).json({message:'METHOD NOT ALLOWED'});

    }
    try{
        const {name,email}=req.body;
        if(!name || !email){
            return res.status(400).json({message : 'Name and email are required'});
        }
        await client.xAdd(STREAM_NAME,'*',{
            name,
            email,
        });

        console.log(`Published customer to ${email} to stream`);
        return res.status(202).json({message: 'Customer data accepted for processing'});
    }catch(err){
        console.error('Error publishing to Redis : ',err);
        return res.status(500).json({message: 'Internal Server Error'});
    }
}
