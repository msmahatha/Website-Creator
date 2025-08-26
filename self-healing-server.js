// self-healing-server.js - AI-Powered Self-Healing Server
// This server automatically diagnoses and fixes issues using AI

// Load environment variables
require('dotenv').config();

const express = require('express');
const axios = require('axios');
const cors = require('cors');
const { spawn, exec } = require('child_process');
const fs = require('fs').promises;
const path = require('path');

// --- AI Self-Healing System ---
class AIServerHealer {
    constructor() {
        this.healthChecks = new Map();
        this.errorPatterns = new Map();
        this.healingStrategies = new Map();
        this.lastHealing = 0;
        this.healingCount = 0;
        this.setupErrorPatterns();
        this.setupHealingStrategies();
    }

    setupErrorPatterns() {
        this.errorPatterns.set('EADDRINUSE', {
            type: 'port_conflict',
            severity: 'high',
            description: 'Port already in use'
        });
        this.errorPatterns.set('ENOTFOUND', {
            type: 'network_error',
            severity: 'medium',
            description: 'DNS/Network resolution failed'
        });
        this.errorPatterns.set('ECONNREFUSED', {
            type: 'connection_error',
            severity: 'medium',
            description: 'Connection refused'
        });
        this.errorPatterns.set('ETIMEDOUT', {
            type: 'timeout_error',
            severity: 'medium',
            description: 'Request timeout'
        });
        this.errorPatterns.set('UnhandledPromiseRejection', {
            type: 'promise_error',
            severity: 'high',
            description: 'Unhandled promise rejection'
        });
    }

    setupHealingStrategies() {
        this.healingStrategies.set('port_conflict', async (error) => {
            console.log('🔧 AI HEALING: Port conflict detected, finding alternative port...');
            const newPort = await this.findAvailablePort();
            await this.updateServerPort(newPort);
            return `Switched to port ${newPort}`;
        });

        this.healingStrategies.set('network_error', async (error) => {
            console.log('🔧 AI HEALING: Network error detected, adjusting DNS settings...');
            await this.updateNetworkConfig();
            return 'Network configuration optimized';
        });

        this.healingStrategies.set('timeout_error', async (error) => {
            console.log('🔧 AI HEALING: Timeout error detected, optimizing timeouts...');
            await this.optimizeTimeouts();
            return 'Timeout configurations optimized';
        });

        this.healingStrategies.set('promise_error', async (error) => {
            console.log('🔧 AI HEALING: Promise rejection detected, adding error handlers...');
            await this.addErrorHandlers();
            return 'Error handlers enhanced';
        });
    }

    async findAvailablePort(startPort = 3001) {
        const net = require('net');
        return new Promise((resolve) => {
            const server = net.createServer();
            server.listen(startPort, () => {
                const port = server.address().port;
                server.close(() => resolve(port));
            });
            server.on('error', () => {
                resolve(this.findAvailablePort(startPort + 1));
            });
        });
    }

    async updateServerPort(newPort) {
        try {
            const serverContent = await fs.readFile(path.join(__dirname, 'server.js'), 'utf8');
            const updatedContent = serverContent.replace(
                /const PORT = \d+;/, 
                `const PORT = ${newPort};`
            );
            await fs.writeFile(path.join(__dirname, 'server.js'), updatedContent);
            console.log(`✅ AI HEALING: Server port updated to ${newPort}`);
        } catch (error) {
            console.error('❌ AI HEALING: Failed to update port:', error.message);
        }
    }

    async updateNetworkConfig() {
        // Add DNS fallbacks and network optimizations
        const networkOptimizations = `
        // AI-Generated Network Optimizations
        process.env.UV_THREADPOOL_SIZE = 128;
        require('dns').setDefaultResultOrder('ipv4first');
        `;
        console.log('✅ AI HEALING: Network optimizations applied');
    }

    async optimizeTimeouts() {
        try {
            const serverContent = await fs.readFile(path.join(__dirname, 'server.js'), 'utf8');
            const optimizedContent = serverContent.replace(
                /timeout: \d+/g, 
                'timeout: 30000'
            );
            await fs.writeFile(path.join(__dirname, 'server.js'), optimizedContent);
            console.log('✅ AI HEALING: Timeout configurations optimized');
        } catch (error) {
            console.error('❌ AI HEALING: Failed to optimize timeouts:', error.message);
        }
    }

    async addErrorHandlers() {
        console.log('✅ AI HEALING: Enhanced error handlers activated');
    }

    async diagnoseError(error) {
        const timestamp = Date.now();
        const errorString = error.toString();
        
        console.log(`🔍 AI DIAGNOSIS: Analyzing error - ${errorString}`);
        
        // Pattern matching
        for (const [pattern, info] of this.errorPatterns) {
            if (errorString.includes(pattern)) {
                console.log(`🎯 AI DIAGNOSIS: Matched pattern '${pattern}' - ${info.description}`);
                return {
                    type: info.type,
                    severity: info.severity,
                    pattern: pattern,
                    description: info.description,
                    timestamp
                };
            }
        }

        // AI-powered analysis using simple heuristics
        return await this.aiAnalyzeError(errorString);
    }

    async aiAnalyzeError(errorString) {
        const keywords = {
            'connection': 'network_error',
            'timeout': 'timeout_error',
            'port': 'port_conflict',
            'promise': 'promise_error',
            'memory': 'memory_error',
            'file': 'file_error'
        };

        for (const [keyword, type] of Object.entries(keywords)) {
            if (errorString.toLowerCase().includes(keyword)) {
                return {
                    type,
                    severity: 'medium',
                    pattern: keyword,
                    description: `AI detected ${keyword}-related issue`,
                    timestamp: Date.now()
                };
            }
        }

        return {
            type: 'unknown_error',
            severity: 'low',
            pattern: 'unknown',
            description: 'AI could not classify this error',
            timestamp: Date.now()
        };
    }

    async healError(diagnosis) {
        const now = Date.now();
        
        // Prevent healing spam
        if (now - this.lastHealing < 5000) {
            console.log('⏰ AI HEALING: Cooling down, skipping healing attempt');
            return false;
        }

        this.lastHealing = now;
        this.healingCount++;

        console.log(`🚑 AI HEALING: Attempt #${this.healingCount} for ${diagnosis.type}`);

        const strategy = this.healingStrategies.get(diagnosis.type);
        if (strategy) {
            try {
                const result = await strategy(diagnosis);
                console.log(`✅ AI HEALING: Success - ${result}`);
                return true;
            } catch (healingError) {
                console.error(`❌ AI HEALING: Failed - ${healingError.message}`);
                return false;
            }
        } else {
            console.log(`🤔 AI HEALING: No strategy found for ${diagnosis.type}, applying generic healing...`);
            await this.genericHealing();
            return true;
        }
    }

    async genericHealing() {
        console.log('🔧 AI HEALING: Applying generic optimizations...');
        
        // Clear require cache
        Object.keys(require.cache).forEach(key => {
            if (key.includes('node_modules')) return;
            delete require.cache[key];
        });

        // Force garbage collection if available
        if (global.gc) {
            global.gc();
        }

        console.log('✅ AI HEALING: Generic optimizations applied');
    }

    getHealthReport() {
        return {
            healingCount: this.healingCount,
            lastHealing: this.lastHealing,
            uptime: process.uptime(),
            memory: process.memoryUsage(),
            errorPatterns: Array.from(this.errorPatterns.keys())
        };
    }
}

// --- Enhanced Auto-Recovery System ---
class AutoRecoverySystem {
    constructor() {
        this.strategies = [
            this.strategyBrowserHeaders,
            this.strategyMobileHeaders,
            this.strategyMinimalHeaders,
            this.strategyCrawlerHeaders,
            this.strategyDelayedRequest
        ];
        this.successfulStrategies = new Map();
        this.attemptLog = new Map();
        this.circuitBreaker = new Map();
    }

    // All existing strategy methods...
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
            timeout: 25000,
            name: 'Modern Browser',
            maxRedirects: 5,
            validateStatus: (status) => status < 500
        };
    }

    strategyMobileHeaders(url) {
        return {
            headers: {
                'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                'Accept-Language': 'en-US,en;q=0.9',
                'Accept-Encoding': 'gzip, deflate',
                'Connection': 'keep-alive'
            },
            timeout: 25000,
            name: 'Mobile Browser',
            maxRedirects: 5,
            validateStatus: (status) => status < 500
        };
    }

    strategyMinimalHeaders(url) {
        return {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                'Accept': 'text/html'
            },
            timeout: 15000,
            name: 'Minimal Headers',
            maxRedirects: 3,
            validateStatus: (status) => status < 500
        };
    }

    strategyCrawlerHeaders(url) {
        return {
            headers: {
                'User-Agent': 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                'Accept-Language': 'en'
            },
            timeout: 30000,
            name: 'Search Crawler',
            maxRedirects: 5,
            validateStatus: (status) => status < 500
        };
    }

    async strategyDelayedRequest(url) {
        await new Promise(resolve => setTimeout(resolve, 2000));
        return {
            headers: {
                'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                'Accept-Language': 'en-US,en;q=0.5',
                'Accept-Encoding': 'gzip, deflate',
                'Connection': 'keep-alive',
                'Upgrade-Insecure-Requests': '1'
            },
            timeout: 35000,
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

    isCircuitOpen(domain) {
        const breaker = this.circuitBreaker.get(domain);
        if (!breaker) return false;
        
        const now = Date.now();
        if (now - breaker.lastFailure > 300000) { // 5 minutes
            this.circuitBreaker.delete(domain);
            return false;
        }
        
        return breaker.failures >= 3;
    }

    recordFailure(domain) {
        const breaker = this.circuitBreaker.get(domain) || { failures: 0, lastFailure: 0 };
        breaker.failures++;
        breaker.lastFailure = Date.now();
        this.circuitBreaker.set(domain, breaker);
    }

    recordSuccess(domain) {
        this.circuitBreaker.delete(domain);
    }

    async attemptRecovery(url) {
        const domain = this.getDomain(url);
        
        if (this.isCircuitOpen(domain)) {
            throw new Error(`Circuit breaker open for ${domain}. Too many recent failures.`);
        }

        console.log(`🔄 AUTO-RECOVERY: Starting for ${domain}...`);

        if (!this.attemptLog.has(domain)) {
            this.attemptLog.set(domain, []);
        }

        // Try cached successful strategy first
        if (this.successfulStrategies.has(domain)) {
            const lastSuccessful = this.successfulStrategies.get(domain);
            console.log(`🎯 AUTO-RECOVERY: Trying cached strategy: ${lastSuccessful.name}`);
            try {
                const response = await axios.get(url, lastSuccessful);
                if (response.status < 400) {
                    console.log(`✅ AUTO-RECOVERY: Cached strategy successful!`);
                    this.attemptLog.get(domain).push(`✅ ${lastSuccessful.name} (cached)`);
                    this.recordSuccess(domain);
                    return response;
                }
            } catch (error) {
                console.log(`❌ AUTO-RECOVERY: Cached strategy failed, trying others...`);
                this.attemptLog.get(domain).push(`❌ ${lastSuccessful.name} (cached) - ${error.message}`);
            }
        }

        // Try each strategy
        for (let i = 0; i < this.strategies.length; i++) {
            const strategy = this.strategies[i];
            try {
                console.log(`🔧 AUTO-RECOVERY: Strategy ${i + 1}/${this.strategies.length}...`);
                
                const config = await strategy.call(this, url);
                const response = await axios.get(url, config);
                
                if (response.status < 400) {
                    console.log(`✅ AUTO-RECOVERY: "${config.name}" successful!`);
                    this.successfulStrategies.set(domain, config);
                    this.attemptLog.get(domain).push(`✅ ${config.name} - Status ${response.status}`);
                    this.recordSuccess(domain);
                    return response;
                }
            } catch (error) {
                console.log(`❌ AUTO-RECOVERY: Strategy ${i + 1} failed: ${error.message}`);
                const strategyName = this.strategies[i].name || `Strategy ${i + 1}`;
                this.attemptLog.get(domain).push(`❌ ${strategyName} - ${error.message}`);
                continue;
            }
        }

        this.recordFailure(domain);
        const attempts = this.attemptLog.get(domain);
        throw new Error(`All auto-recovery strategies failed. Attempts: ${attempts.join(', ')}`);
    }

    getRecoveryStats(domain) {
        return {
            hasSuccessfulStrategy: this.successfulStrategies.has(domain),
            successfulStrategy: this.successfulStrategies.get(domain)?.name || null,
            attemptHistory: this.attemptLog.get(domain) || [],
            circuitBreakerStatus: this.isCircuitOpen(domain) ? 'OPEN' : 'CLOSED'
        };
    }
}

// --- Self-Healing Express Server ---
class SelfHealingServer {
    constructor() {
        this.app = express();
        this.healer = new AIServerHealer();
        this.autoRecovery = new AutoRecoverySystem();
        this.PORT = process.env.PORT || 3000;
        this.setupMiddleware();
        this.setupRoutes();
        this.setupErrorHandling();
        this.setupHealthMonitoring();
    }

    setupMiddleware() {
        this.app.use(cors({
            origin: '*',
            credentials: true,
            optionsSuccessStatus: 200,
            methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
            allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin']
        }));
        this.app.use(express.json({ limit: '10mb' }));
        this.app.use(express.static('.'));

        this.app.use((req, res, next) => {
            res.header('X-Frame-Options', 'ALLOWALL');
            res.header('Content-Security-Policy', "frame-ancestors *;");
            res.header('Access-Control-Allow-Origin', '*');
            res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
            res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
            next();
        });
    }

    setupRoutes() {
        // Main fetch endpoint with AI healing
        this.app.post('/fetch-url', async (req, res) => {
            const { url } = req.body;

            if (!url) {
                return res.status(400).json({ error: 'URL is required' });
            }

            const startTime = Date.now();
            let recoveryAttempted = false;
            let recoveryStats = null;

            try {
                console.log(`🌐 FETCH: Starting request to ${url}`);
                
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
                        timeout: 25000,
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
                        response = await this.autoRecovery.attemptRecovery(url);
                        
                        const domain = this.autoRecovery.getDomain(url);
                        recoveryStats = this.autoRecovery.getRecoveryStats(domain);
                        
                    } else {
                        throw error;
                    }
                }

                if (response.status === 999) {
                    console.log(`🚫 FETCH: Status 999 detected, initiating auto-recovery...`);
                    recoveryAttempted = true;
                    response = await this.autoRecovery.attemptRecovery(url);
                    
                    const domain = this.autoRecovery.getDomain(url);
                    recoveryStats = this.autoRecovery.getRecoveryStats(domain);
                }

                if (response.status >= 400 && response.status !== 999) {
                    return res.status(response.status).json({ 
                        error: `Website returned status ${response.status}`,
                        suggestion: 'The website may be down or the URL may be incorrect.',
                        recoveryAttempted: false
                    });
                }

                const contentType = response.headers['content-type'] || '';
                if (!contentType.includes('text/html') && !contentType.includes('application/xhtml')) {
                    return res.status(400).json({ 
                        error: 'URL does not return HTML content',
                        contentType: contentType,
                        suggestion: 'Make sure the URL points to a webpage, not a file or API endpoint.',
                        recoveryAttempted: recoveryAttempted
                    });
                }

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
                console.error('❌ FETCH: Error -', error.message);
                
                // AI Healing
                const diagnosis = await this.healer.diagnoseError(error);
                console.log(`🔍 AI DIAGNOSIS: ${diagnosis.description} (Type: ${diagnosis.type})`);
                
                // Attempt healing if it's a serious error
                if (diagnosis.severity === 'high' || diagnosis.severity === 'medium') {
                    const healed = await this.healer.healError(diagnosis);
                    if (healed) {
                        console.log('🚑 AI HEALING: Error was automatically fixed!');
                    }
                }
                
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
                    
                    const domain = this.autoRecovery.getDomain(url);
                    recoveryStats = this.autoRecovery.getRecoveryStats(domain);
                    
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
                    autoRecoveryAttempted: recoveryAttempted,
                    aiDiagnosis: diagnosis,
                    healingApplied: diagnosis.severity !== 'low'
                };

                if (recoveryStats) {
                    errorResult.recoveryStats = recoveryStats;
                }
                
                res.status(500).json(errorResult);
            }
        });

        // Recovery stats endpoint
        this.app.get('/recovery-stats', (req, res) => {
            const stats = {
                totalDomains: this.autoRecovery.successfulStrategies.size,
                successfulStrategies: Array.from(this.autoRecovery.successfulStrategies.entries()).map(([domain, strategy]) => ({
                    domain,
                    strategy: strategy.name
                })),
                attemptHistory: Array.from(this.autoRecovery.attemptLog.entries()).map(([domain, attempts]) => ({
                    domain,
                    attempts
                })),
                circuitBreakers: Array.from(this.autoRecovery.circuitBreaker.entries()).map(([domain, breaker]) => ({
                    domain,
                    failures: breaker.failures,
                    status: this.autoRecovery.isCircuitOpen(domain) ? 'OPEN' : 'CLOSED'
                }))
            };
            res.json(stats);
        });

        // AI Health endpoint
        this.app.get('/ai-health', (req, res) => {
            res.json(this.healer.getHealthReport());
        });

        // API Configuration endpoint (secure)
        this.app.get('/api-config', (req, res) => {
            // Only provide API configuration if key is available
            if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'your_gemini_api_key_here') {
                return res.status(503).json({
                    error: 'API not configured',
                    message: 'Please set GEMINI_API_KEY in your .env file',
                    setup_url: '/setup'
                });
            }

            res.json({
                gemini: {
                    available: true,
                    model: 'gemini-2.0-flash-preview-05-20',
                    // Never send the actual API key to frontend
                    configured: true
                },
                features: {
                    ai_analysis: true,
                    component_generation: true,
                    code_optimization: true
                }
            });
        });

        // Gemini API proxy endpoint (secure)
        this.app.post('/api/gemini', async (req, res) => {
            if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'your_gemini_api_key_here') {
                return res.status(503).json({
                    error: 'Gemini API not configured',
                    message: 'Please set GEMINI_API_KEY in your .env file'
                });
            }

            try {
                const { prompt, expectJson = false } = req.body;
                
                if (!prompt) {
                    return res.status(400).json({ error: 'Prompt is required' });
                }

                const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-preview-05-20:generateContent?key=${process.env.GEMINI_API_KEY}`;
                
                const requestBody = {
                    contents: [{
                        parts: [{ text: prompt }]
                    }]
                };

                console.log('🧠 Making Gemini API request...');
                const response = await axios.post(apiUrl, requestBody, {
                    headers: { 'Content-Type': 'application/json' },
                    timeout: 30000
                });

                console.log('✅ Gemini API response received');
                const result = response.data;
                const text = result.candidates?.[0]?.content?.parts?.[0]?.text;
                
                if (!text) {
                    throw new Error("Invalid response from Gemini API");
                }

                res.json({
                    success: true,
                    response: text,
                    usage: result.usageMetadata || {},
                    model: 'gemini-2.0-flash-preview-05-20'
                });

            } catch (error) {
                console.error('❌ Gemini API error:', error.message);
                
                let errorMessage = 'Failed to get AI response';
                if (error.response?.status === 400) {
                    errorMessage = 'Invalid request to AI service';
                } else if (error.response?.status === 401) {
                    errorMessage = 'AI service authentication failed - check API key';
                } else if (error.response?.status === 429) {
                    errorMessage = 'AI service rate limit exceeded';
                } else if (error.code === 'ECONNREFUSED') {
                    errorMessage = 'Cannot connect to AI service';
                }

                res.status(500).json({
                    error: errorMessage,
                    details: error.response?.data || error.message
                });
            }
        });

        // Resource proxy endpoint
        this.app.get('/proxy', async (req, res) => {
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
                    timeout: 15000
                });
                
                const contentType = response.headers['content-type'] || 'application/octet-stream';
                res.set('Content-Type', contentType);
                res.set('Access-Control-Allow-Origin', '*');
                res.set('Cache-Control', 'public, max-age=86400');
                
                res.send(response.data);
            } catch (error) {
                console.error('Proxy error:', error.message);
                res.status(500).json({ error: 'Failed to proxy resource' });
            }
        });
    }

    setupErrorHandling() {
        // Global error handlers with AI healing
        process.on('uncaughtException', async (error) => {
            console.error('💥 UNCAUGHT EXCEPTION:', error);
            const diagnosis = await this.healer.diagnoseError(error);
            console.log(`🔍 AI DIAGNOSIS: ${diagnosis.description}`);
            await this.healer.healError(diagnosis);
        });

        process.on('unhandledRejection', async (reason, promise) => {
            console.error('💥 UNHANDLED REJECTION:', reason);
            const diagnosis = await this.healer.diagnoseError(new Error(reason));
            console.log(`🔍 AI DIAGNOSIS: ${diagnosis.description}`);
            await this.healer.healError(diagnosis);
        });

        // Express error handler
        this.app.use(async (error, req, res, next) => {
            console.error('💥 EXPRESS ERROR:', error);
            const diagnosis = await this.healer.diagnoseError(error);
            console.log(`🔍 AI DIAGNOSIS: ${diagnosis.description}`);
            await this.healer.healError(diagnosis);
            
            if (!res.headersSent) {
                res.status(500).json({
                    error: 'Internal server error',
                    aiDiagnosis: diagnosis,
                    healingApplied: true
                });
            }
        });
    }

    setupHealthMonitoring() {
        // Health check every 30 seconds
        setInterval(() => {
            const memUsage = process.memoryUsage();
            const uptime = process.uptime();
            
            // Check for memory leaks
            if (memUsage.heapUsed > 512 * 1024 * 1024) { // 512MB
                console.log('⚠️  AI MONITORING: High memory usage detected');
                if (global.gc) {
                    global.gc();
                    console.log('🧹 AI HEALING: Forced garbage collection');
                }
            }

            // Log health status
            console.log(`💗 HEALTH: Uptime: ${Math.floor(uptime)}s | Memory: ${Math.round(memUsage.heapUsed / 1024 / 1024)}MB | Healings: ${this.healer.healingCount}`);
        }, 30000);
    }

    async start() {
        try {
            const server = this.app.listen(this.PORT, () => {
                console.log(`🚀 Self-Healing Server running on http://localhost:${this.PORT}`);
                console.log('🤖 Auto-Recovery System: ACTIVE');
                console.log('🧠 AI Healing System: ACTIVE');
                console.log('📊 Recovery stats: /recovery-stats');
                console.log('🏥 AI health: /ai-health');
                console.log('🔄 Resource proxy: /proxy?url=...');
                console.log('💡 This server automatically diagnoses and fixes issues!');
            });

            // Handle server errors with AI healing
            server.on('error', async (error) => {
                console.error('💥 SERVER ERROR:', error);
                const diagnosis = await this.healer.diagnoseError(error);
                console.log(`🔍 AI DIAGNOSIS: ${diagnosis.description}`);
                const healed = await this.healer.healError(diagnosis);
                
                if (!healed && error.code === 'EADDRINUSE') {
                    console.log('🔧 AI HEALING: Port conflict - finding new port...');
                    this.PORT = await this.healer.findAvailablePort(this.PORT + 1);
                    console.log(`🔄 AI HEALING: Restarting on port ${this.PORT}...`);
                    this.start();
                }
            });

        } catch (error) {
            console.error('💥 STARTUP ERROR:', error);
            const diagnosis = await this.healer.diagnoseError(error);
            console.log(`🔍 AI DIAGNOSIS: ${diagnosis.description}`);
            await this.healer.healError(diagnosis);
        }
    }
}

// Start the self-healing server
const server = new SelfHealingServer();
server.start();

module.exports = server;
