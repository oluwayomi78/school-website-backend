const axios = require('axios');
const Payment = require('../model/paymentModel');

const initializePayment = async (req, res) => {
    const { amount, email, studentId } = req.body;

    try {
        const response = await axios.post('https://api.paystack.co/transaction/initialize', {
            amount: amount * 100,
            email,
            reference: `TXN_${Date.now()}`
        }, {
            headers: { Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}` }
        });

        const newPayment = new Payment({
            studentId,
            amount,
            reference: response.data.data.reference,
            status: 'pending'
        });
        await newPayment.save();

        res.json(response.data);
    } catch (err) {
        res.status(500).json({ error: 'Payment initialization failed' });
    }
};

const getMyPayments = async (req, res) => {
    try {
        const studentId = req.user?.id;

        if (!studentId) {
            return res.status(401).json({ success: false, message: 'Unauthorized' });
        }

        const payments = await Payment.find({ studentId })
            .populate('studentId', 'fullname studentId email course')
            .sort({ paymentDate: -1, createdAt: -1 });

        const summary = payments.reduce((acc, payment) => {
            const status = String(payment.status || '').toLowerCase();
            acc.totalAmount += Number(payment.amount) || 0;
            if (status === 'paid') acc.paid += 1;
            else if (status === 'pending') acc.pending += 1;
            else if (status === 'failed') acc.failed += 1;
            else if (status === 'refunded') acc.refunded += 1;
            return acc;
        }, { totalAmount: 0, paid: 0, pending: 0, failed: 0, refunded: 0 });

        res.status(200).json({
            success: true,
            payments,
            summary,
        });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Unable to fetch payment history' });
    }
};

module.exports = {
    initializePayment,
    getMyPayments
};