// server.js - Enhanced with Auto-Recovery System
// This is the back-end "engine" for our Website Inspector with intelligent auto-recovery.

// --- 1. Import necessary tools ---
const express = require('express');
const axios = require('axios');
const cors = require('cors');

// --- 2. Setup the Server ---
const app = express();
const PORT = 3001;

// --- 3. Configure Middleware ---
app.use(cors({
    origin: '*',
    credentials: true,
    optionsSuccessStatus: 200,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin']
}));
app.use(express.json());
app.use(express.static('.'));

// Add additional security headers for iframe compatibility
app.use((req, res, next) => {
    res.header('X-Frame-Options', 'ALLOWALL');
    res.header('Content-Security-Policy', "frame-ancestors *;");
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    next();
});

// --- 4. Enhanced Auto-Recovery System ---
class AutoRecoverySystem {
    constructor() {
        this.strategies = [
            this.strategyBrowserHeaders,
            this.strategyMobileHeaders,
            this.strategyMinimalHeaders,
            this.strategyCrawlerHeaders,
            this.strategyDelayedRequest
        ];
        this.successfulStrategies = new Map(); // Cache successful strategies per domain
        this.attemptLog = new Map(); // Log attempts per domain
    }

    // Strategy 1: Modern browser headers
    strategyBrowserHeaders(url) {
        return {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
                'Accept-Language': 'en-US,en;q=0.9',
                'Accept-Encoding': 'gzip, deflate, br',
                'DNT': '1',
                'Connection': 'keep-alive',
                'Upgrade-Insecure-Requests': '1',
                'Sec-Fetch-Dest': 'document',
                'Sec-Fetch-Mode': 'navigate',
                'Sec-Fetch-Site': 'none',
                'Sec-Fetch-User': '?1',
                'Cache-Control': 'max-age=0'
            },
            timeout: 15000,
            name: 'Modern Browser',
            maxRedirects: 5,
            validateStatus: (status) => status < 500
        };
    }

    // Strategy 2: Mobile browser headers
    strategyMobileHeaders(url) {
        return {
            headers: {
                'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                'Accept-Language': 'en-US,en;q=0.9',
                'Accept-Encoding': 'gzip, deflate',
                'Connection': 'keep-alive'
            },
            timeout: 20000,
            name: 'Mobile Browser',
            maxRedirects: 5,
            validateStatus: (status) => status < 500
        };
    }

    // Strategy 3: Minimal headers
    strategyMinimalHeaders(url) {
        return {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                'Accept': 'text/html'
            },
            timeout: 10000,
            name: 'Minimal Headers',
            maxRedirects: 3,
            validateStatus: (status) => status < 500
        };
    }

    // Strategy 4: Search engine crawler headers
    strategyCrawlerHeaders(url) {
        return {
            headers: {
                'User-Agent': 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                'Accept-Language': 'en'
            },
            timeout: 25000,
            name: 'Search Crawler',
            maxRedirects: 5,
            validateStatus: (status) => status < 500
        };
    }

    // Strategy 5: Delayed request
    async strategyDelayedRequest(url) {
        await new Promise(resolve => setTimeout(resolve, 2000)); // 2 second delay
        return {
            headers: {
                'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                'Accept-Language': 'en-US,en;q=0.5',
                'Accept-Encoding': 'gzip, deflate',
                'Connection': 'keep-alive',
                'Upgrade-Insecure-Requests': '1'
            },
            timeout: 30000,
            name: 'Delayed Request',
            maxRedirects: 5,
            validateStatus: (status) => status < 500
        };
    }

    getDomain(url) {
        try {
            return new URL(url).hostname;
        } catch {
            return url;
        }
    }

    // Try all strategies until one works
    async attemptRecovery(url) {
        const domain = this.getDomain(url);
        console.log(`🔄 AUTO-RECOVERY: Starting for ${domain}...`);

        // Initialize attempt log for this domain
        if (!this.attemptLog.has(domain)) {
            this.attemptLog.set(domain, []);
        }

        // First, try the last successful strategy for this domain
        if (this.successfulStrategies.has(domain)) {
            const lastSuccessful = this.successfulStrategies.get(domain);
            console.log(`🎯 AUTO-RECOVERY: Trying cached strategy: ${lastSuccessful.name}`);
            try {
                const response = await axios.get(url, lastSuccessful);
                if (response.status < 400) {
                    console.log(`✅ AUTO-RECOVERY: Cached strategy successful!`);
                    this.attemptLog.get(domain).push(`✅ ${lastSuccessful.name} (cached)`);
                    return response;
                }
            } catch (error) {
                console.log(`❌ AUTO-RECOVERY: Cached strategy failed, trying others...`);
                this.attemptLog.get(domain).push(`❌ ${lastSuccessful.name} (cached) - ${error.message}`);
            }
        }

        // Try each strategy in order
        for (let i = 0; i < this.strategies.length; i++) {
            const strategy = this.strategies[i];
            try {
                console.log(`🔧 AUTO-RECOVERY: Strategy ${i + 1}/${this.strategies.length}...`);
                
                const config = await strategy.call(this, url);
                const response = await axios.get(url, config);
                
                if (response.status < 400) {
                    console.log(`✅ AUTO-RECOVERY: "${config.name}" successful!`);
                    // Cache this successful strategy for future use
                    this.successfulStrategies.set(domain, config);
                    this.attemptLog.get(domain).push(`✅ ${config.name} - Status ${response.status}`);
                    return response;
                }
            } catch (error) {
                console.log(`❌ AUTO-RECOVERY: Strategy ${i + 1} failed: ${error.message}`);
                const strategyName = this.strategies[i].name || `Strategy ${i + 1}`;
                this.attemptLog.get(domain).push(`❌ ${strategyName} - ${error.message}`);
                continue;
            }
        }

        // If all strategies fail, throw detailed error
        const attempts = this.attemptLog.get(domain);
        throw new Error(`All auto-recovery strategies failed. Attempts: ${attempts.join(', ')}`);
    }

    // Get recovery statistics for a domain
    getRecoveryStats(domain) {
        return {
            hasSuccessfulStrategy: this.successfulStrategies.has(domain),
            successfulStrategy: this.successfulStrategies.get(domain)?.name || null,
            attemptHistory: this.attemptLog.get(domain) || []
        };
    }
}

// Create global auto-recovery instance
const autoRecovery = new AutoRecoverySystem();

// --- 5. API Endpoint with Auto-Recovery ---
app.post('/fetch-url', async (req, res) => {
    const { url } = req.body;

    if (!url) {
        return res.status(400).json({ error: 'URL is required' });
    }

    const startTime = Date.now();
    let recoveryAttempted = false;
    let recoveryStats = null;

    try {
        console.log(`🌐 FETCH: Starting request to ${url}`);
        
        // First attempt with standard configuration
        let response;
        try {
            const standardConfig = {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
                    'Accept-Language': 'en-US,en;q=0.9',
                    'Accept-Encoding': 'gzip, deflate, br',
                    'DNT': '1',
                    'Connection': 'keep-alive',
                    'Upgrade-Insecure-Requests': '1',
                    'Cache-Control': 'max-age=0'
                },
                timeout: 15000,
                maxRedirects: 5,
                validateStatus: function (status) {
                    return status < 500;
                }
            };

            response = await axios.get(url, standardConfig);
            console.log(`✅ FETCH: Standard request successful (${response.status})`);
            
        } catch (error) {
            if (error.response && (error.response.status === 999 || error.response.status === 403 || error.response.status === 429)) {
                console.log(`🚫 FETCH: Request blocked (${error.response.status}), initiating auto-recovery...`);
                
                recoveryAttempted = true;
                response = await autoRecovery.attemptRecovery(url);
                
                const domain = autoRecovery.getDomain(url);
                recoveryStats = autoRecovery.getRecoveryStats(domain);
                
            } else {
                throw error;
            }
        }

        // Handle status 999 even if no exception was thrown
        if (response.status === 999) {
            console.log(`🚫 FETCH: Status 999 detected, initiating auto-recovery...`);
            recoveryAttempted = true;
            response = await autoRecovery.attemptRecovery(url);
            
            const domain = autoRecovery.getDomain(url);
            recoveryStats = autoRecovery.getRecoveryStats(domain);
        }

        // Handle other problematic status codes
        if (response.status >= 400 && response.status !== 999) {
            return res.status(response.status).json({ 
                error: `Website returned status ${response.status}`,
                suggestion: 'The website may be down or the URL may be incorrect.',
                recoveryAttempted: false
            });
        }

        // Check content type
        const contentType = response.headers['content-type'] || '';
        if (!contentType.includes('text/html') && !contentType.includes('application/xhtml')) {
            return res.status(400).json({ 
                error: 'URL does not return HTML content',
                contentType: contentType,
                suggestion: 'Make sure the URL points to a webpage, not a file or API endpoint.',
                recoveryAttempted: recoveryAttempted
            });
        }

        // Success response with recovery information
        const responseTime = Date.now() - startTime;
        const result = { 
            html: response.data,
            status: response.status,
            contentType: contentType,
            responseTime: responseTime,
            recovered: recoveryAttempted,
            message: recoveryAttempted ? 
                `✨ Auto-recovery successful! Used "${recoveryStats?.successfulStrategy}" strategy.` :
                'Website fetched successfully!'
        };

        if (recoveryAttempted && recoveryStats) {
            result.recoveryStats = recoveryStats;
        }

        console.log(`✅ FETCH: Complete in ${responseTime}ms (Recovery: ${recoveryAttempted})`);
        res.json(result);

    } catch (error) {
        // Enhanced error handling
        console.error('❌ FETCH: Error -', error.message);
        
        const responseTime = Date.now() - startTime;
        let errorMessage = 'Failed to fetch URL';
        let suggestion = 'Please check the URL and try again.';
        
        if (error.code === 'ENOTFOUND') {
            errorMessage = 'Website not found (DNS error)';
            suggestion = 'Check if the website URL is correct and accessible.';
        } else if (error.code === 'ECONNREFUSED') {
            errorMessage = 'Connection refused';
            suggestion = 'The website server is not responding.';
        } else if (error.code === 'ETIMEDOUT') {
            errorMessage = 'Request timed out';
            suggestion = 'The website is taking too long to respond. Try again later.';
        } else if (error.message.includes('All auto-recovery strategies failed')) {
            errorMessage = 'All recovery strategies failed';
            suggestion = 'This website has very strong anti-bot protection. Try a different website or wait before retrying.';
            
            // Include recovery attempt details
            const domain = autoRecovery.getDomain(url);
            recoveryStats = autoRecovery.getRecoveryStats(domain);
            
        } else if (error.response) {
            if (error.response.status === 999) {
                errorMessage = 'Website blocked the request (Status 999)';
                suggestion = 'This website has extremely strong anti-bot protection.';
            } else {
                errorMessage = `Request failed with status code ${error.response.status}`;
                suggestion = `The website returned an error (${error.response.status}). It may be temporarily unavailable.`;
            }
        }
        
        const errorResult = { 
            error: errorMessage,
            suggestion: suggestion,
            details: error.message,
            responseTime: responseTime,
            autoRecoveryAttempted: recoveryAttempted
        };

        if (recoveryStats) {
            errorResult.recoveryStats = recoveryStats;
        }
        
        res.status(500).json(errorResult);
    }
});

// --- 6. Recovery Stats Endpoint ---
app.get('/recovery-stats', (req, res) => {
    const stats = {
        totalDomains: autoRecovery.successfulStrategies.size,
        successfulStrategies: Array.from(autoRecovery.successfulStrategies.entries()).map(([domain, strategy]) => ({
            domain,
            strategy: strategy.name
        })),
        attemptHistory: Array.from(autoRecovery.attemptLog.entries()).map(([domain, attempts]) => ({
            domain,
            attempts
        }))
    };
    res.json(stats);
});

// --- 7. Resource Proxy Endpoint (for CORS issues) ---
app.get('/proxy', async (req, res) => {
    const { url } = req.query;
    
    if (!url) {
        return res.status(400).json({ error: 'URL parameter is required' });
    }
    
    try {
        const response = await axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            },
            responseType: 'arraybuffer',
            timeout: 10000
        });
        
        // Set appropriate headers
        const contentType = response.headers['content-type'] || 'application/octet-stream';
        res.set('Content-Type', contentType);
        res.set('Access-Control-Allow-Origin', '*');
        res.set('Cache-Control', 'public, max-age=86400'); // 24 hours
        
        res.send(response.data);
    } catch (error) {
        console.error('Proxy error:', error.message);
        res.status(500).json({ error: 'Failed to proxy resource' });
    }
});

// --- 8. Start the Server ---
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log('🤖 Auto-Recovery System: ACTIVE');
    console.log('📊 Recovery stats available at: /recovery-stats');
    console.log('💡 This system automatically adapts when websites block requests!');
});
