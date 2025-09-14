import redisClient from "../../../libs/redis";

const STREAM_NAME = 'order_stream';

export default async function (req, res){
    if(req.method !== 'POST'){
        return res.status(405).json({message:'METHOD NOT ALLOWED'});
    }

    try{
        const client = await redisClient();
        const {customerId, amount, purchaseDate} = req.body;

        if(!customerId || !amount) {
            return res.status(400).json({message : 'customerId and amount are required'});
        }

        await client.xAdd(STREAM_NAME, '*', {
            customerId,
            amount: String(amount),
            purchaseDate: purchaseDate || new Date().toISOString(),
        });

        console.log(`Published order for customer ${customerId} to stream`);
        return res.status(202).json({message: 'Order data accepted for processing'});

    }catch(err){
        console.error('Error publishing to Redis : ',err);
        return res.status(500).json({message: 'Internal Server Error'});
    }
}