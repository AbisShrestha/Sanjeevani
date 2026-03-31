import api from './api';

/**
 * eSewa Payment Service
 * Handles payment initiation and verification via the backend
 */

/**
 * Get signed payment data from backend, then generate
 * an auto-submitting HTML form for WebView
 */
export const initiateEsewaPayment = async (
  amount: number,
  transactionId: string,
  productName: string
) => {
  const response = await api.post('/esewa/initiate', {
    amount,
    transactionId,
    productName,
  });

  return response.data;
};

/**
 * Generate the HTML form that auto-submits to eSewa's payment gateway.
 * This HTML is loaded inside a WebView.
 */
export const generateEsewaFormHTML = (paymentUrl: string, paymentData: any): string => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body {
          display: flex;
          justify-content: center;
          align-items: center;
          height: 100vh;
          margin: 0;
          background-color: #f0f8f0;
          font-family: -apple-system, BlinkMacSystemFont, sans-serif;
        }
        .loading {
          text-align: center;
          color: #60BB46;
        }
        .loading p {
          font-size: 16px;
          margin-top: 15px;
          color: #333;
        }
        .spinner {
          width: 40px;
          height: 40px;
          border: 4px solid #e0e0e0;
          border-top: 4px solid #60BB46;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin: 0 auto;
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        .error { color: red; font-size: 14px; margin-top: 10px; word-break: break-all; padding: 0 20px; }
      </style>
    </head>
    <body>
      <div class="loading" id="loadingDiv">
        <div class="spinner"></div>
        <p>Redirecting to eSewa...</p>
        <p class="error" id="errorMsg" style="display:none;"></p>
      </div>
      <form id="esewaForm" action="${paymentUrl}" method="POST">
        ${Object.entries(paymentData)
          .map(([key, value]) => `<input type="hidden" name="${key}" value="${value}" />`)
          .join('\n        ')}
      </form>
      <script>
        window.onload = function() {
          try {
            document.getElementById('esewaForm').submit();
          } catch(e) {
            document.getElementById('errorMsg').style.display = 'block';
            document.getElementById('errorMsg').textContent = 'Form submit error: ' + e.message;
          }
        };
        // Fallback: if form hasn't navigated after 5s, show debug info
        setTimeout(function() {
          if (document.getElementById('loadingDiv')) {
            var el = document.getElementById('errorMsg');
            el.style.display = 'block';
            el.textContent = 'Still loading... Form action: ${paymentUrl}';
          }
        }, 5000);
      </script>
    </body>
    </html>
  `;
};

/**
 * Verify a completed eSewa payment via the backend
 */
export const verifyEsewaPayment = async (encodedData: string) => {
  const response = await api.post('/esewa/verify', { encodedData });
  return response.data;
};
