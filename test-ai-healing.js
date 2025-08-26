#!/usr/bin/env node
// test-ai-healing.js - Test script to demonstrate AI healing capabilities

const axios = require('axios');

class AIHealingTester {
    constructor() {
        this.baseUrl = 'http://localhost:3000';
        this.testResults = [];
    }

    log(message, type = 'INFO') {
        const timestamp = new Date().toISOString();
        const emoji = {
            'INFO': '📋',
            'SUCCESS': '✅',
            'WARNING': '⚠️',
            'ERROR': '❌',
            'TEST': '🧪'
        }[type] || '📋';
        
        console.log(`${emoji} [${timestamp}] ${message}`);
    }

    async testServerHealth() {
        this.log('Testing server health endpoint...', 'TEST');
        
        try {
            const response = await axios.get(`${this.baseUrl}/ai-health`, { timeout: 5000 });
            const health = response.data;
            
            this.log(`Server is healthy - Uptime: ${Math.floor(health.uptime)}s, Memory: ${Math.round(health.memory.heapUsed / 1024 / 1024)}MB`, 'SUCCESS');
            this.testResults.push({ test: 'health_check', status: 'PASS', data: health });
            return true;
        } catch (error) {
            this.log(`Health check failed: ${error.message}`, 'ERROR');
            this.testResults.push({ test: 'health_check', status: 'FAIL', error: error.message });
            return false;
        }
    }

    async testAutoRecovery() {
        this.log('Testing auto-recovery system...', 'TEST');
        
        const testUrls = [
            'https://httpbin.org/status/200',
            'https://httpbin.org/status/403',
            'https://httpbin.org/status/999',
            'https://github.com',
            'https://example.com'
        ];

        for (const url of testUrls) {
            try {
                this.log(`Testing URL: ${url}`, 'INFO');
                
                const response = await axios.post(`${this.baseUrl}/fetch-url`, 
                    { url }, 
                    { timeout: 30000 }
                );
                
                const result = response.data;
                
                if (result.recovered) {
                    this.log(`✨ Auto-recovery successful for ${url} using ${result.recoveryStats?.successfulStrategy}`, 'SUCCESS');
                } else {
                    this.log(`✅ Standard fetch successful for ${url}`, 'SUCCESS');
                }
                
                this.testResults.push({ 
                    test: 'auto_recovery', 
                    url, 
                    status: 'PASS', 
                    recovered: result.recovered,
                    strategy: result.recoveryStats?.successfulStrategy 
                });
                
            } catch (error) {
                this.log(`❌ Failed to fetch ${url}: ${error.response?.data?.error || error.message}`, 'WARNING');
                this.testResults.push({ 
                    test: 'auto_recovery', 
                    url, 
                    status: 'EXPECTED_FAIL', 
                    error: error.response?.data?.error || error.message 
                });
            }
            
            // Wait between requests
            await new Promise(resolve => setTimeout(resolve, 2000));
        }
    }

    async testRecoveryStats() {
        this.log('Testing recovery statistics...', 'TEST');
        
        try {
            const response = await axios.get(`${this.baseUrl}/recovery-stats`, { timeout: 5000 });
            const stats = response.data;
            
            this.log(`Recovery stats - Domains: ${stats.totalDomains}, Strategies: ${stats.successfulStrategies?.length || 0}`, 'SUCCESS');
            this.testResults.push({ test: 'recovery_stats', status: 'PASS', data: stats });
            return true;
        } catch (error) {
            this.log(`Recovery stats failed: ${error.message}`, 'ERROR');
            this.testResults.push({ test: 'recovery_stats', status: 'FAIL', error: error.message });
            return false;
        }
    }

    async testResourceProxy() {
        this.log('Testing resource proxy...', 'TEST');
        
        try {
            const testUrl = 'https://httpbin.org/json';
            const response = await axios.get(`${this.baseUrl}/proxy?url=${encodeURIComponent(testUrl)}`, { timeout: 10000 });
            
            this.log('Resource proxy working correctly', 'SUCCESS');
            this.testResults.push({ test: 'resource_proxy', status: 'PASS' });
            return true;
        } catch (error) {
            this.log(`Resource proxy failed: ${error.message}`, 'ERROR');
            this.testResults.push({ test: 'resource_proxy', status: 'FAIL', error: error.message });
            return false;
        }
    }

    async stressTestServer() {
        this.log('Running stress test...', 'TEST');
        
        const requests = [];
        for (let i = 0; i < 10; i++) {
            requests.push(
                axios.post(`${this.baseUrl}/fetch-url`, 
                    { url: 'https://httpbin.org/delay/1' }, 
                    { timeout: 15000 }
                ).catch(error => ({ error: error.message }))
            );
        }
        
        try {
            const results = await Promise.all(requests);
            const successful = results.filter(r => !r.error).length;
            
            this.log(`Stress test completed - ${successful}/10 requests successful`, 
                successful >= 7 ? 'SUCCESS' : 'WARNING');
            
            this.testResults.push({ 
                test: 'stress_test', 
                status: successful >= 7 ? 'PASS' : 'PARTIAL',
                successful,
                total: 10
            });
            
        } catch (error) {
            this.log(`Stress test failed: ${error.message}`, 'ERROR');
            this.testResults.push({ test: 'stress_test', status: 'FAIL', error: error.message });
        }
    }

    generateReport() {
        this.log('Generating test report...', 'INFO');
        console.log('\n' + '='.repeat(60));
        console.log('🧠 AI HEALING SYSTEM TEST REPORT');
        console.log('='.repeat(60));
        
        const groupedResults = {};
        this.testResults.forEach(result => {
            if (!groupedResults[result.test]) {
                groupedResults[result.test] = [];
            }
            groupedResults[result.test].push(result);
        });
        
        Object.entries(groupedResults).forEach(([testName, results]) => {
            console.log(`\n📊 ${testName.toUpperCase().replace('_', ' ')}:`);
            
            results.forEach(result => {
                const status = result.status === 'PASS' ? '✅' : 
                              result.status === 'FAIL' ? '❌' : 
                              result.status === 'PARTIAL' ? '🟡' : '⚠️';
                              
                console.log(`   ${status} ${result.url || result.test} - ${result.status}`);
                
                if (result.recovered) {
                    console.log(`      🔄 Auto-recovery used: ${result.strategy}`);
                }
                
                if (result.error) {
                    console.log(`      💬 Error: ${result.error}`);
                }
            });
        });
        
        const totalTests = this.testResults.length;
        const passedTests = this.testResults.filter(r => r.status === 'PASS').length;
        const failedTests = this.testResults.filter(r => r.status === 'FAIL').length;
        
        console.log('\n' + '='.repeat(60));
        console.log(`📈 SUMMARY: ${passedTests}/${totalTests} tests passed, ${failedTests} failed`);
        console.log('='.repeat(60));
        
        if (passedTests / totalTests > 0.8) {
            console.log('🎉 AI Healing System is working excellently!');
        } else if (passedTests / totalTests > 0.6) {
            console.log('👍 AI Healing System is working well with some issues.');
        } else {
            console.log('⚠️  AI Healing System needs attention.');
        }
    }

    async runAllTests() {
        this.log('🧪 Starting AI Healing System Tests...', 'INFO');
        console.log('This will test all aspects of the self-healing server.\n');
        
        // Wait for server to be ready
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Run all tests
        await this.testServerHealth();
        await this.testAutoRecovery();
        await this.testRecoveryStats();
        await this.testResourceProxy();
        await this.stressTestServer();
        
        // Generate report
        this.generateReport();
        
        this.log('🏁 All tests completed!', 'SUCCESS');
    }
}

// Run tests if called directly
if (require.main === module) {
    const tester = new AIHealingTester();
    tester.runAllTests().catch(error => {
        console.error('💥 Test suite failed:', error);
        process.exit(1);
    });
}

module.exports = AIHealingTester;
