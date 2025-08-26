#!/usr/bin/env node
// server-watchdog.js - AI-Powered Server Watchdog
// Monitors server health and automatically restarts with AI diagnostics

const { spawn, exec } = require('child_process');
const axios = require('axios');
const fs = require('fs').promises;
const path = require('path');

class ServerWatchdog {
    constructor() {
        this.serverProcess = null;
        this.restartCount = 0;
        this.maxRestarts = 10;
        this.healthCheckInterval = 5000; // 5 seconds
        this.serverPort = 3000;
        this.startTime = Date.now();
        this.lastHealthCheck = 0;
        this.consecutiveFailures = 0;
        this.isRestarting = false;
    }

    log(message, type = 'INFO') {
        const timestamp = new Date().toISOString();
        const emoji = {
            'INFO': '📋',
            'SUCCESS': '✅',
            'WARNING': '⚠️',
            'ERROR': '❌',
            'HEALING': '🧠',
            'RESTART': '🔄'
        }[type] || '📋';
        
        console.log(`${emoji} [${timestamp}] ${type}: ${message}`);
    }

    async startServer() {
        if (this.serverProcess) {
            this.log('Server process already running', 'WARNING');
            return;
        }

        this.log('Starting self-healing server...', 'INFO');
        
        this.serverProcess = spawn('node', ['self-healing-server.js'], {
            cwd: process.cwd(),
            stdio: ['pipe', 'pipe', 'pipe'],
            env: { ...process.env, PORT: this.serverPort }
        });

        this.serverProcess.stdout.on('data', (data) => {
            process.stdout.write(`[SERVER] ${data}`);
        });

        this.serverProcess.stderr.on('data', (data) => {
            process.stderr.write(`[SERVER ERROR] ${data}`);
            this.handleServerError(data.toString());
        });

        this.serverProcess.on('close', (code) => {
            this.log(`Server process exited with code ${code}`, code === 0 ? 'INFO' : 'ERROR');
            this.serverProcess = null;
            
            if (code !== 0 && this.restartCount < this.maxRestarts && !this.isRestarting) {
                this.scheduleRestart(`Server crashed with code ${code}`);
            }
        });

        this.serverProcess.on('error', (error) => {
            this.log(`Server process error: ${error.message}`, 'ERROR');
            this.scheduleRestart(`Process error: ${error.message}`);
        });

        // Wait for server to start
        await this.waitForServer();
    }

    async waitForServer(maxAttempts = 20) {
        for (let i = 0; i < maxAttempts; i++) {
            try {
                await axios.get(`http://localhost:${this.serverPort}/ai-health`, { timeout: 2000 });
                this.log('Server is ready and responding', 'SUCCESS');
                this.consecutiveFailures = 0;
                return true;
            } catch (error) {
                await new Promise(resolve => setTimeout(resolve, 1000));
            }
        }
        
        this.log('Server failed to start within timeout', 'ERROR');
        return false;
    }

    async checkServerHealth() {
        if (this.isRestarting) return;

        const now = Date.now();
        this.lastHealthCheck = now;

        try {
            // Check if process is running
            if (!this.serverProcess || this.serverProcess.killed) {
                throw new Error('Server process is not running');
            }

            // Health check request
            const response = await axios.get(`http://localhost:${this.serverPort}/ai-health`, { 
                timeout: 3000 
            });
            
            const health = response.data;
            const uptime = Math.floor(health.uptime);
            const memoryMB = Math.round(health.memory.heapUsed / 1024 / 1024);
            
            this.log(`Health OK - Uptime: ${uptime}s, Memory: ${memoryMB}MB, Healings: ${health.healingCount}`, 'SUCCESS');
            this.consecutiveFailures = 0;

            // Check for concerning metrics
            if (memoryMB > 800) {
                this.log(`High memory usage detected: ${memoryMB}MB`, 'WARNING');
                await this.triggerGarbageCollection();
            }

            if (health.healingCount > 50) {
                this.log(`High healing count detected: ${health.healingCount}`, 'WARNING');
            }

        } catch (error) {
            this.consecutiveFailures++;
            this.log(`Health check failed (${this.consecutiveFailures}/3): ${error.message}`, 'ERROR');
            
            if (this.consecutiveFailures >= 3) {
                this.scheduleRestart(`Failed ${this.consecutiveFailures} consecutive health checks`);
            }
        }
    }

    async triggerGarbageCollection() {
        try {
            await axios.post(`http://localhost:${this.serverPort}/ai-health`, {
                action: 'gc'
            });
            this.log('Triggered garbage collection', 'HEALING');
        } catch (error) {
            this.log(`Failed to trigger GC: ${error.message}`, 'WARNING');
        }
    }

    handleServerError(errorData) {
        const errorString = errorData.toString().toLowerCase();
        
        // Detect critical errors
        if (errorString.includes('eaddrinuse')) {
            this.log('Port conflict detected - will find new port on restart', 'HEALING');
            this.serverPort = this.serverPort + 1;
        } else if (errorString.includes('out of memory') || errorString.includes('heap out of memory')) {
            this.log('Memory overflow detected - immediate restart needed', 'HEALING');
            this.scheduleRestart('Memory overflow detected');
        } else if (errorString.includes('uncaught exception')) {
            this.log('Uncaught exception detected - restart may be needed', 'WARNING');
        }
    }

    async scheduleRestart(reason) {
        if (this.isRestarting) {
            this.log('Restart already in progress', 'WARNING');
            return;
        }

        if (this.restartCount >= this.maxRestarts) {
            this.log(`Maximum restart attempts (${this.maxRestarts}) reached. Stopping watchdog.`, 'ERROR');
            process.exit(1);
        }

        this.isRestarting = true;
        this.restartCount++;
        
        this.log(`Scheduling restart #${this.restartCount} - Reason: ${reason}`, 'RESTART');
        
        // Kill current server
        if (this.serverProcess && !this.serverProcess.killed) {
            this.log('Terminating current server process...', 'INFO');
            this.serverProcess.kill('SIGTERM');
            
            // Force kill after 5 seconds
            setTimeout(() => {
                if (this.serverProcess && !this.serverProcess.killed) {
                    this.log('Force killing server process...', 'WARNING');
                    this.serverProcess.kill('SIGKILL');
                }
            }, 5000);
        }

        // Wait before restart
        const restartDelay = Math.min(5000 * this.restartCount, 30000); // Max 30 seconds
        this.log(`Waiting ${restartDelay/1000}s before restart...`, 'INFO');
        
        setTimeout(async () => {
            this.isRestarting = false;
            await this.startServer();
        }, restartDelay);
    }

    async createServerBackup() {
        try {
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            const backupName = `server-backup-${timestamp}.js`;
            
            await fs.copyFile('self-healing-server.js', backupName);
            this.log(`Server backup created: ${backupName}`, 'INFO');
        } catch (error) {
            this.log(`Failed to create backup: ${error.message}`, 'WARNING');
        }
    }

    setupGracefulShutdown() {
        const shutdown = (signal) => {
            this.log(`Received ${signal} - Shutting down gracefully...`, 'INFO');
            
            if (this.serverProcess && !this.serverProcess.killed) {
                this.log('Terminating server process...', 'INFO');
                this.serverProcess.kill('SIGTERM');
                
                setTimeout(() => {
                    if (this.serverProcess && !this.serverProcess.killed) {
                        this.serverProcess.kill('SIGKILL');
                    }
                    process.exit(0);
                }, 5000);
            } else {
                process.exit(0);
            }
        };

        process.on('SIGINT', () => shutdown('SIGINT'));
        process.on('SIGTERM', () => shutdown('SIGTERM'));
    }

    async start() {
        this.log('🐕 Starting AI-Powered Server Watchdog...', 'INFO');
        this.log(`Max restarts: ${this.maxRestarts}`, 'INFO');
        this.log(`Health check interval: ${this.healthCheckInterval/1000}s`, 'INFO');
        
        this.setupGracefulShutdown();
        await this.createServerBackup();
        await this.startServer();
        
        // Start health monitoring
        const healthCheckTimer = setInterval(async () => {
            await this.checkServerHealth();
        }, this.healthCheckInterval);

        // Cleanup timer on exit
        process.on('exit', () => {
            clearInterval(healthCheckTimer);
        });

        this.log('Watchdog is now monitoring server health 🐕‍🦺', 'SUCCESS');
    }

    getStatus() {
        const now = Date.now();
        const uptimeSeconds = Math.floor((now - this.startTime) / 1000);
        
        return {
            watchdogUptime: uptimeSeconds,
            serverRunning: this.serverProcess && !this.serverProcess.killed,
            restartCount: this.restartCount,
            lastHealthCheck: this.lastHealthCheck,
            consecutiveFailures: this.consecutiveFailures,
            currentPort: this.serverPort,
            isRestarting: this.isRestarting
        };
    }
}

// Handle CLI commands
if (require.main === module) {
    const watchdog = new ServerWatchdog();
    
    // Handle CLI arguments
    const args = process.argv.slice(2);
    if (args.includes('--help') || args.includes('-h')) {
        console.log(`
🐕 AI-Powered Server Watchdog

Usage: node server-watchdog.js [options]

Options:
  --help, -h     Show this help message
  --port PORT    Set server port (default: 3000)
  --max-restarts N  Set maximum restart attempts (default: 10)

The watchdog monitors server health and automatically restarts on failures.
        `);
        process.exit(0);
    }

    // Parse arguments
    const portIndex = args.findIndex(arg => arg === '--port');
    if (portIndex !== -1 && args[portIndex + 1]) {
        watchdog.serverPort = parseInt(args[portIndex + 1]);
    }

    const maxRestartsIndex = args.findIndex(arg => arg === '--max-restarts');
    if (maxRestartsIndex !== -1 && args[maxRestartsIndex + 1]) {
        watchdog.maxRestarts = parseInt(args[maxRestartsIndex + 1]);
    }

    // Start watchdog
    watchdog.start().catch(error => {
        console.error('💥 Watchdog startup failed:', error);
        process.exit(1);
    });
}

module.exports = ServerWatchdog;
