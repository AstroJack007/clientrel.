
export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    const { campaignId, customerId, message } = req.body;
    const deliveryStatus = Math.random() < 0.9 ? 'SENT' : 'FAILED';


    await new Promise(resolve => setTimeout(resolve, Math.random() * 1000));

    fetch(`${process.env.NEXTAUTH_URL}/api/campaigns/delivery-receipt`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            campaignId,
            customerId,
            status: deliveryStatus,
        }),
    });

    res.status(200).json({ message: 'Message processing started' });
}