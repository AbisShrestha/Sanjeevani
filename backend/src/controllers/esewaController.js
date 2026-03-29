/**
 * eSewa Payment Controller
 * Handles payment initiation with HMAC-SHA256 signature and verification
 */
const crypto = require('crypto');
const axios = require('axios');

// eSewa Test Environment Config
const ESEWA_CONFIG = {
  // Test credentials from developer.esewa.com.np
  SECRET_KEY: '8gBm/:&EnhH.1/q',
  PRODUCT_CODE: 'EPAYTEST',
  // Test URLs
  PAYMENT_URL: 'https://rc-epay.esewa.com.np/api/epay/main/v2/form',
  VERIFY_URL: 'https://rc-epay.esewa.com.np/api/epay/transaction/status/',
};

/**
 * Generate HMAC-SHA256 signature for eSewa
 * The signed field order: total_amount,transaction_uuid,product_code
 */
const generateSignature = (message) => {
  const hmac = crypto.createHmac('sha256', ESEWA_CONFIG.SECRET_KEY);
  hmac.update(message);
  return hmac.digest('base64');
};

/**
 * POST /api/esewa/initiate
 * Generates signed payment data for the frontend to render in WebView
 */
const initiatePayment = async (req, res) => {
  try {
    const { amount, transactionId, productName } = req.body;

    if (!amount || !transactionId) {
      return res.status(400).json({ error: 'Amount and transactionId are required' });
    }

    const totalAmount = Number(amount);
    const taxAmount = 0;
    const productServiceCharge = 0;
    const productDeliveryCharge = 0;

    // Message to sign: total_amount,transaction_uuid,product_code
    const signatureMessage = `total_amount=${totalAmount},transaction_uuid=${transactionId},product_code=${ESEWA_CONFIG.PRODUCT_CODE}`;
    const signature = generateSignature(signatureMessage);

    const paymentData = {
      amount: totalAmount.toString(),
      tax_amount: taxAmount.toString(),
      total_amount: totalAmount.toString(),
      transaction_uuid: transactionId,
      product_code: ESEWA_CONFIG.PRODUCT_CODE,
      product_service_charge: productServiceCharge.toString(),
      product_delivery_charge: productDeliveryCharge.toString(),
      success_url: 'https://sanjeevani-health.com/payment/success',
      failure_url: 'https://sanjeevani-health.com/payment/failure',
      signed_field_names: 'total_amount,transaction_uuid,product_code',
      signature: signature,
    };

    res.json({
      paymentUrl: ESEWA_CONFIG.PAYMENT_URL,
      paymentData,
    });
  } catch (error) {
    console.error('eSewa initiate error:', error);
    res.status(500).json({ error: 'Failed to initiate payment' });
  }
};

/**
 * POST /api/esewa/verify
 * Verifies a completed eSewa transaction
 */
const verifyPayment = async (req, res) => {
  try {
    const { encodedData } = req.body;

    if (!encodedData) {
      return res.status(400).json({ error: 'Encoded data is required' });
    }

    // Decode the base64 response from eSewa
    const decodedString = Buffer.from(encodedData, 'base64').toString('utf-8');
    const decodedData = JSON.parse(decodedString);

    // Verify signature dynamically based on the signed_field_names returned by eSewa
    const signedFieldNames = decodedData.signed_field_names.split(',');
    const signatureMessage = signedFieldNames.map(field => `${field}=${decodedData[field] || ''}`).join(',');
    
    const expectedSignature = generateSignature(signatureMessage);

    if (expectedSignature !== decodedData.signature) {
      console.error('eSewa Verification Signature mismatch!');
      console.error('Expected:', expectedSignature);
      console.error('Received:', decodedData.signature);
      console.error('Signature Message payload:', signatureMessage);
      return res.status(400).json({ error: 'Invalid signature. Payment may be tampered.' });
    }

    // Also verify with eSewa's status API
    const verifyResponse = await axios.get(
      `${ESEWA_CONFIG.VERIFY_URL}?product_code=${ESEWA_CONFIG.PRODUCT_CODE}&total_amount=${decodedData.total_amount}&transaction_uuid=${decodedData.transaction_uuid}`,
      {
        headers: {
          'Content-Type': 'application/json',
        }
      }
    );

    const pool = require('../config/db');

    if (verifyResponse.data.status === 'COMPLETE') {
      const txn = decodedData.transaction_uuid;
      
      if (txn.startsWith('ORDER-')) {
        const orderId = txn.replace('ORDER-', '');
        try {
          await pool.query(
            "UPDATE orders SET paymentstatus = 'Completed', orderstatus = 'Processing' WHERE orderid = $1", 
            [orderId]
          );
        } catch (dbErr) {
          console.error("Critical: Failed to update order status post-payment", dbErr);
        }
      } 
      else if (txn.startsWith('APT-')) {
        // Example format: APT-{consultationId}-{timestamp}
        const parts = txn.split('-');
        if (parts.length >= 2) {
          const consultationId = parts[1];
          try {
            await pool.query(
              "UPDATE consultations SET status = 'scheduled' WHERE consultationid = $1", 
              [consultationId]
            );
          } catch (dbErr) {
            console.error("Critical: Failed to update consultation status post-payment", dbErr);
          }
        }
      }
    }

    res.json({
      status: verifyResponse.data.status,
      transactionData: decodedData,
      verificationResponse: verifyResponse.data,
    });
  } catch (error) {
    console.error('eSewa verify error:', error);
    res.status(500).json({ error: 'Failed to verify payment' });
  }
};

module.exports = { initiatePayment, verifyPayment };
