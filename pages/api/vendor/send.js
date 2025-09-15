
export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    const { campaignId, customerId, message } = req.body;
    const deliveryStatus = Math.random() < 0.9 ? 'SENT' : 'FAILED';


    await new Promise(resolve => setTimeout(resolve, Math.random() * 1000));

    // Derive a robust origin to call internal APIs
    const proto = req.headers['x-forwarded-proto'] || 'https';
    const host = req.headers['x-forwarded-host'] || req.headers.host;
    const envBase = process.env.NEXTAUTH_URL || '';
    const origin = (envBase ? envBase : `${proto}://${host}`).replace(/\/$/, '');

    try {
        await fetch(`${origin}/api/campaigns/deliveryreceipt`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                campaignId,
                customerId,
                status: deliveryStatus,
            }),
        });
    } catch (e) {
        console.error('Failed to POST delivery receipt:', e);
    }

    res.status(200).json({ message: 'Message processing started' });
}