/**
 * start-tunnel.js
 * 
 * PERMANENT self-healing tunnel script:
 * 1. Kills ALL old Ngrok agents + waits for cloud-side release
 * 2. Automatically starts Docker containers if they are not running
 * 3. Waits for the backend to be healthy (up to 60 seconds)
 * 4. Opens an Ngrok tunnel with retry and injects the URL into frontend .env
 */
const ngrok = require('@ngrok/ngrok');
const fs = require('fs');
const path = require('path');
const http = require('http');
const { execSync } = require('child_process');
require('dotenv').config();

const PORT = 4000;
const FRONTEND_ENV_PATH = path.join(__dirname, '../frontend/.env');

/**
 * Kill ALL Ngrok agent processes (both the CLI binary and embedded JS ones).
 * Then wait for the cloud-side endpoint to fully release (~15s).
 */
const killAllNgrok = async () => {
    console.log('🧹 Cleaning up any existing Ngrok sessions...');
    try {
        // Kill the native ngrok binary agent
        execSync('killall ngrok 2>/dev/null || true', { stdio: 'ignore' });
    } catch (e) { /* no process to kill */ }
    try {
        // Also kill any node processes that may be running a previous tunnel
        execSync("lsof -ti:4040 | xargs kill -9 2>/dev/null || true", { stdio: 'ignore' });
    } catch (e) { /* ignore */ }
    // Wait for Ngrok's servers to fully deregister the old endpoint
    console.log('   Waiting for cloud session to expire (15s)...');
    await new Promise(r => setTimeout(r, 15000));
    console.log('✅ Cleanup done.\n');
};

/**
 * Ensure Docker containers are up. If not, start them automatically.
 */
const ensureDockerRunning = () => {
    console.log('🐳 Checking Docker containers...');
    try {
        const output = execSync('docker compose ps --services --filter "status=running"', {
            cwd: __dirname,
            encoding: 'utf-8',
            stdio: ['pipe', 'pipe', 'pipe'],
        }).trim();

        const runningServices = output.split('\n').filter(Boolean);

        if (!runningServices.includes('backend') || !runningServices.includes('sanjeevani-db')) {
            console.log('⚠️  Backend or Database not running. Starting Docker containers...');
            execSync('docker compose up -d --build', {
                cwd: __dirname,
                encoding: 'utf-8',
                stdio: 'inherit',
            });
            console.log('✅ Docker containers started!\n');
        } else {
            console.log('✅ Docker containers are already running.\n');
        }
    } catch (err) {
        console.log('⚠️  Could not detect running containers. Starting Docker...');
        try {
            execSync('docker compose up -d --build', {
                cwd: __dirname,
                encoding: 'utf-8',
                stdio: 'inherit',
            });
            console.log('✅ Docker containers started!\n');
        } catch (startErr) {
            console.error('❌ Failed to start Docker. Is Docker Desktop running?');
            console.error('   Please open Docker Desktop first, then try again.');
            process.exit(1);
        }
    }
};

/**
 * Wait for the backend /api/health to return HTTP 200.
 */
const waitForBackend = (retries = 60) => {
    return new Promise((resolve, reject) => {
        let attempt = 0;
        const tryConnect = () => {
            attempt++;
            const req = http.get(`http://localhost:${PORT}/api/health`, (res) => {
                if (res.statusCode === 200) {
                    resolve();
                } else if (attempt < retries) {
                    setTimeout(tryConnect, 1000);
                } else {
                    reject(new Error(`Backend returned status ${res.statusCode} after ${retries}s`));
                }
            });
            req.on('error', () => {
                if (attempt < retries) {
                    if (attempt % 10 === 0) {
                        console.log(`   Still waiting... (${attempt}s)`);
                    }
                    setTimeout(tryConnect, 1000);
                } else {
                    reject(new Error(`Backend not reachable on port ${PORT} after ${retries}s`));
                }
            });
            req.end();
        };
        tryConnect();
    });
};

/**
 * Start Ngrok tunnel with automatic retry.
 * If the old endpoint is still lingering, waits & retries.
 */
const startTunnel = async (maxAttempts = 5) => {
    for (let i = 1; i <= maxAttempts; i++) {
        try {
            const listener = await ngrok.forward({
                addr: PORT,
                authtoken: process.env.NGROK_AUTHTOKEN,
            });
            return listener;
        } catch (err) {
            const isCollision = err.message && err.message.includes('ERR_NGROK_334');
            if (isCollision && i < maxAttempts) {
                const waitSec = 15; // Increased to 15s for better reliability
                console.log(`⚠️  Ngrok endpoint is still "stuck" on the cloud from a previous session.`);
                console.log(`   Waiting ${waitSec}s for Ngrok to release it... (Attempt ${i}/${maxAttempts})`);
                await new Promise(r => setTimeout(r, waitSec * 1000));
            } else {
                throw err;
            }
        }
    }
};

(async () => {
    console.log('');
    console.log('╔══════════════════════════════════════════╗');
    console.log('║   🚀 Sanjeevani Tunnel Launcher          ║');
    console.log('╚══════════════════════════════════════════╝');
    console.log('');

    // Step 1: Kill ALL old Ngrok agents + wait for cloud release
    await killAllNgrok();

    // Step 2: Ensure Docker is running
    ensureDockerRunning();

    // Step 3: Wait for healthy backend
    console.log(`⏳ Waiting for backend on port ${PORT}...`);
    try {
        await waitForBackend();
        console.log('✅ Backend is healthy and ready!\n');
    } catch (err) {
        console.error('❌ ' + err.message);
        console.error('');
        console.error('   Troubleshooting:');
        console.error('   1. Is Docker Desktop open and running?');
        console.error('   2. Run: docker compose logs backend');
        console.error('   3. Try: docker compose up -d --build');
        process.exit(1);
    }

    // Step 4: Start Ngrok tunnel (with retry)
    try {
        console.log('🔗 Starting Ngrok tunnel...');
        const listener = await startTunnel(5);
        const tunnelUrl = listener.url();

        console.log('');
        console.log('✅ TUNNEL ACTIVE!');
        console.log(`🌐 Public URL: ${tunnelUrl}\n`);

        // Step 5: Write URL to frontend .env
        let envContent = '';
        if (fs.existsSync(FRONTEND_ENV_PATH)) {
            envContent = fs.readFileSync(FRONTEND_ENV_PATH, 'utf8');
        }

        if (envContent.includes('EXPO_PUBLIC_API_URL=')) {
            envContent = envContent.replace(
                /EXPO_PUBLIC_API_URL=.*/,
                `EXPO_PUBLIC_API_URL=${tunnelUrl}`
            );
        } else {
            envContent += `\nEXPO_PUBLIC_API_URL=${tunnelUrl}\n`;
        }

        fs.writeFileSync(FRONTEND_ENV_PATH, envContent, 'utf8');
        console.log('📝 Frontend .env updated with new URL!');
        console.log(`📱 Your Expo app will connect to: ${tunnelUrl}`);
        console.log('\n💡 Press Ctrl+C to stop the tunnel.\n');

        // Graceful shutdown
        const cleanup = () => {
            console.log('\n🛑 Shutting down tunnel...');
            try { execSync('killall ngrok 2>/dev/null || true', { stdio: 'ignore' }); } catch (e) {}
            process.exit(0);
        };
        process.on('SIGINT', cleanup);
        process.on('SIGTERM', cleanup);

        setInterval(() => {}, 1000 * 60 * 60);

    } catch (err) {
        console.error('❌ Failed to start Ngrok tunnel:', err.message);
        console.error('');
        console.error('   If this keeps happening, try:');
        console.error('   1. Close ALL terminals');
        console.error('   2. Wait 30 seconds');
        console.error('   3. Run: npm run dev:tunnel');
        process.exit(1);
    }
})();
