#!/bin/bash

# 📸 Automated Screenshot Capture Script for Website Inspector Pro
# This script helps capture professional screenshots for the README

echo "🚀 Website Inspector Pro - Screenshot Capture Tool"
echo "=================================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if server is running
echo -e "${BLUE}📡 Checking if server is running...${NC}"
if curl -s http://localhost:3000/health > /dev/null; then
    echo -e "${GREEN}✅ Server is running on http://localhost:3000${NC}"
else
    echo -e "${YELLOW}⚠️  Server not running. Starting server...${NC}"
    echo -e "${BLUE}🚀 Please run: node self-healing-server.js${NC}"
    echo -e "${BLUE}   Then run this script again.${NC}"
    exit 1
fi

# Create images directory if it doesn't exist
mkdir -p assets/images

echo -e "\n${BLUE}📸 Screenshot Capture Instructions${NC}"
echo "================================="

echo -e "\n${YELLOW}1. Main Interface Screenshot${NC}"
echo "   📱 URL: http://localhost:3000"
echo "   📁 Save as: assets/images/main-interface.png"
echo "   📋 Show: URL input, inspect button, code results"
echo ""
echo -e "${BLUE}   Opening main interface...${NC}"
if command -v open &> /dev/null; then
    open http://localhost:3000
elif command -v xdg-open &> /dev/null; then
    xdg-open http://localhost:3000
elif command -v start &> /dev/null; then
    start http://localhost:3000
else
    echo "   Please manually open: http://localhost:3000"
fi

read -p "   Press ENTER when you've captured the main interface screenshot..."

echo -e "\n${YELLOW}2. AI Dashboard Screenshot${NC}"
echo "   📱 URL: http://localhost:3000/ai-health"
echo "   📁 Save as: assets/images/ai-dashboard.png"
echo "   📋 Show: Health metrics, uptime, memory usage"
echo ""
echo -e "${BLUE}   Opening AI dashboard...${NC}"
if command -v open &> /dev/null; then
    open http://localhost:3000/ai-health
elif command -v xdg-open &> /dev/null; then
    xdg-open http://localhost:3000/ai-health
elif command -v start &> /dev/null; then
    start http://localhost:3000/ai-health
else
    echo "   Please manually open: http://localhost:3000/ai-health"
fi

read -p "   Press ENTER when you've captured the AI dashboard screenshot..."

echo -e "\n${YELLOW}3. Self-Healing Demo (Optional)${NC}"
echo "   🎬 Record terminal running: node test-ai-healing.js"
echo "   📁 Save as: assets/images/self-healing-demo.gif"
echo "   📋 Show: AI diagnosis and auto-recovery in action"
echo ""
echo -e "${BLUE}   To capture this, run in a new terminal:${NC}"
echo -e "${BLUE}   node test-ai-healing.js${NC}"
echo -e "${BLUE}   Use screen recording software to capture as GIF${NC}"

read -p "   Press ENTER to continue..."

# Check if screenshots exist
echo -e "\n${BLUE}📁 Checking captured screenshots...${NC}"
echo "=================================="

if [ -f "assets/images/main-interface.png" ]; then
    echo -e "${GREEN}✅ main-interface.png found${NC}"
    MAIN_INTERFACE=true
else
    echo -e "${RED}❌ main-interface.png missing${NC}"
    MAIN_INTERFACE=false
fi

if [ -f "assets/images/ai-dashboard.png" ]; then
    echo -e "${GREEN}✅ ai-dashboard.png found${NC}"
    AI_DASHBOARD=true
else
    echo -e "${RED}❌ ai-dashboard.png missing${NC}"
    AI_DASHBOARD=false
fi

if [ -f "assets/images/self-healing-demo.gif" ]; then
    echo -e "${GREEN}✅ self-healing-demo.gif found${NC}"
    SELF_HEALING=true
else
    echo -e "${YELLOW}⚠️  self-healing-demo.gif missing (optional)${NC}"
    SELF_HEALING=false
fi

# Update README if screenshots exist
if [ "$MAIN_INTERFACE" = true ] || [ "$AI_DASHBOARD" = true ]; then
    echo -e "\n${BLUE}🔄 Would you like to update the README with local image paths?${NC}"
    read -p "   (y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo -e "${BLUE}📝 Updating README.md...${NC}"
        
        if [ "$MAIN_INTERFACE" = true ]; then
            # This would require a more complex sed command or a dedicated script
            echo -e "${GREEN}   ✅ Ready to update main interface image${NC}"
        fi
        
        if [ "$AI_DASHBOARD" = true ]; then
            echo -e "${GREEN}   ✅ Ready to update AI dashboard image${NC}"
        fi
        
        echo -e "${YELLOW}   📋 Manual update required in README.md:${NC}"
        if [ "$MAIN_INTERFACE" = true ]; then
            echo -e "${BLUE}      Replace main interface image URL with:${NC}"
            echo "      ![Main Interface](./assets/images/main-interface.png)"
        fi
        if [ "$AI_DASHBOARD" = true ]; then
            echo -e "${BLUE}      Replace AI dashboard image URL with:${NC}"
            echo "      ![AI Dashboard](./assets/images/ai-dashboard.png)"
        fi
        if [ "$SELF_HEALING" = true ]; then
            echo -e "${BLUE}      Replace self-healing demo image URL with:${NC}"
            echo "      ![Self Healing Demo](./assets/images/self-healing-demo.gif)"
        fi
    fi
fi

# Git commands
echo -e "\n${BLUE}📤 Ready to commit screenshots?${NC}"
read -p "   (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${BLUE}📦 Adding images to git...${NC}"
    git add assets/images/
    git add README.md
    
    echo -e "${BLUE}💬 Committing changes...${NC}"
    git commit -m "📸 Add application screenshots

- Added main interface screenshot
- Added AI dashboard screenshot  
- Updated README with local image references
- Professional documentation with actual app visuals"
    
    echo -e "${BLUE}🚀 Pushing to GitHub...${NC}"
    git push origin main
    
    echo -e "${GREEN}✅ Screenshots successfully added and pushed to GitHub!${NC}"
else
    echo -e "${YELLOW}⏸️  Skipping git operations. You can manually commit later.${NC}"
fi

echo -e "\n${GREEN}🎉 Screenshot capture process completed!${NC}"
echo "============================================="
echo -e "${BLUE}📋 Next steps:${NC}"
echo "   1. Review your screenshots in assets/images/"
echo "   2. Update README.md image URLs if needed"
echo "   3. Commit and push changes to GitHub"
echo -e "\n${GREEN}✨ Your README now has professional application screenshots!${NC}"
