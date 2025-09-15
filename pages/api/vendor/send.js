
export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    const { campaignId, customerId, message } = req.body;
    const deliveryStatus = Math.random() < 0.9 ? 'SENT' : 'FAILED';


    await new Promise(resolve => setTimeout(resolve, Math.random() * 1000));

    const proto = req.headers['x-forwarded-proto'] || 'https';
    const host = req.headers['x-forwarded-host'] || req.headers.host;
    const envBase = process.env.NEXTAUTH_URL || '';
    const origin = (envBase ? envBase : `${proto}://${host}`).replace(/\/$/, '');

    const postReceipt = async () => {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 5000);
        try {
            const res = await fetch(`${origin}/api/campaigns/deliveryreceipt`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ campaignId, customerId, status: deliveryStatus }),
                signal: controller.signal,
            });
            clearTimeout(timeout);
            if (!res.ok) {
                throw new Error(`Receipt POST failed: ${res.status}`);
            }
        } catch (err) {
            clearTimeout(timeout);
            throw err;
        }
    };

    const maxAttempts = 3;
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        try {
            await postReceipt();
            break; // success
        } catch (err) {
            if (attempt === maxAttempts) {
                console.error('Failed to POST delivery receipt after retries:', err);
            } else {
                const backoff = 200 * Math.pow(2, attempt - 1);
                await new Promise((r) => setTimeout(r, backoff));
            }
        }
    }

    res.status(200).json({ message: 'Message processing started' });
}