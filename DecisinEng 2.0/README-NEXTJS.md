# 🏦 Credit Card Decision Engine - Next.js Version

## 📋 **Overview**
A modern, full-stack credit card decision engine built with Next.js 14, featuring real-time scoring, API routes, and a beautiful React frontend.

## 🚀 **Quick Start**

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation
```bash
cd DecisinEng
npm install
```

### Development
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### Production Build
```bash
npm run build
npm start
```

## 🏗️ **Architecture**

### **Next.js App Router Structure:**
```
DecisinEng/
├── app/
│   ├── api/
│   │   ├── applications/[id]/route.ts    # GET application data
│   │   ├── decision/route.ts             # POST decision calculation
│   │   └── process/route.ts              # POST full processing
│   ├── globals.css                       # Global styles
│   ├── layout.tsx                        # Root layout
│   └── page.tsx                          # Main application page
├── lib/
│   └── modules/                          # Decision engine modules
│       ├── SPU.ts                        # Special Purpose Unit
│       ├── EAMVU.ts                      # External Asset Management
│       ├── City.ts                       # Geographic risk assessment
│       ├── Age.ts                        # Demographic risk assessment
│       ├── DBR.ts                        # Debt-to-Income Ratio
│       ├── Income.ts                     # Financial capacity evaluation
│       ├── DecisionEngine.ts             # Main orchestrator
│       └── DataService.ts                # API and data handling
├── next.config.js                        # Next.js configuration
├── package.json                          # Dependencies and scripts
├── tsconfig.json                         # TypeScript configuration
└── README-NEXTJS.md                      # This file
```

## 🎯 **Features**

### **Frontend (React + Next.js)**
- ✅ **Real-time Decision Flow** with collapsible sections
- ✅ **Interactive Input Controls** for manual testing
- ✅ **Sample Data Loading** for quick testing
- ✅ **Progress Bars** and visual feedback
- ✅ **Module Score Breakdown** with detailed calculations
- ✅ **Report Download** functionality
- ✅ **Responsive Design** for all screen sizes
- ✅ **TypeScript Support** for type safety

### **Backend (Next.js API Routes)**
- ✅ **RESTful API** endpoints
- ✅ **Application Data Fetching** (`/api/applications/[id]`)
- ✅ **Decision Calculation** (`/api/decision`)
- ✅ **Full Processing Pipeline** (`/api/process`)
- ✅ **Error Handling** and validation
- ✅ **TypeScript** for server-side code

### **Decision Engine Modules**
- ✅ **SPU Module** - Blacklist and negative list checks
- ✅ **EAMVU Module** - Asset verification status
- ✅ **City Module** - Geographic risk and cluster scoring
- ✅ **Age Module** - Demographic risk assessment
- ✅ **DBR Module** - Debt-to-Income ratio calculation
- ✅ **Income Module** - Financial capacity evaluation

## 🔧 **API Endpoints**

### **GET /api/applications/[id]**
Fetch application data by ID.
```bash
curl http://localhost:3000/api/applications/141
```

### **POST /api/decision**
Calculate decision for provided application data.
```bash
curl -X POST http://localhost:3000/api/decision \
  -H "Content-Type: application/json" \
  -d '{"applicationData": {...}}'
```

### **POST /api/process**
Full processing pipeline: fetch data + calculate decision.
```bash
curl -X POST http://localhost:3000/api/process \
  -H "Content-Type: application/json" \
  -d '{"applicationId": 141}'
```

## 🎯 **Module Weights**
- **DBR (Debt-to-Income Ratio):** 55% - Primary risk indicator
- **SPU (Special Purpose Unit):** 10% - Blacklist/negative checks
- **EAMVU (External Asset Management Unit):** 10% - Asset verification
- **Income:** 15% - Financial capacity assessment
- **City:** 5% - Geographic risk assessment
- **Age:** 5% - Demographic risk factor

## 🔄 **Decision Logic**

### **Automatic Failures:**
1. Age outside acceptable range
2. DBR exceeds dynamic threshold
3. SPU critical hits
4. City Annexure A areas

### **Score-Based Decisions:**
- **≥90 points:** PASS (Very Low Risk)
- **80-89 points:** PASS (Low Risk)
- **70-79 points:** CONDITIONAL PASS (Medium Risk)
- **60-69 points:** CONDITIONAL PASS (High Risk)
- **<60 points:** FAIL (Very High Risk)

## 🌐 **Environment Configuration**

Create a `.env.local` file:
```env
# API Configuration
NEXT_PUBLIC_API_BASE_URL=http://localhost:5000
NEXT_PUBLIC_DATA_ENGINE_URL=http://localhost:3002

# Development
NODE_ENV=development
```

## 📱 **Usage**

### **1. Load Sample Data**
Click "📋 Load Sample Data" to populate the form with test data.

### **2. Fetch Real Data**
Enter an application ID and click "📥 Fetch Application Data".

### **3. Adjust Manual Inputs**
- **Cluster:** Select geographic cluster
- **Employment Type:** Choose employment category
- **Salary Transfer:** Select transfer type
- **Total Income:** Enter income amount

### **4. View Results**
- **Critical Checks:** Age, DBR, and SPU validation
- **Module Scoring:** City, Income, and EAMVU scoring
- **Final Decision:** Weighted score and decision

### **5. Download Report**
Click "📥 Download Report" to save a detailed text report.

## 🛠️ **Development**

### **Scripts**
```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint
```

### **Adding New Modules**
1. Create module in `lib/modules/`
2. Add to `DecisionEngine.ts`
3. Update weights in `moduleWeights`
4. Add to calculation logic

### **Styling**
- Global styles in `app/globals.css`
- CSS modules supported
- Responsive design included

## 🚀 **Deployment**

### **Vercel (Recommended)**
```bash
npm install -g vercel
vercel
```

### **Docker**
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

### **Traditional Hosting**
```bash
npm run build
npm start
```

## 🔍 **Testing**

### **Manual Testing**
1. Use "Load Sample Data" for quick testing
2. Test different cluster and employment combinations
3. Verify decision logic with various inputs

### **API Testing**
```bash
# Test application fetch
curl http://localhost:3000/api/applications/141

# Test decision calculation
curl -X POST http://localhost:3000/api/decision \
  -H "Content-Type: application/json" \
  -d '{"applicationData": {"age": 30, "employment_status": "permanent"}}'
```

## 📊 **Performance**

- **Server-Side Rendering** for fast initial loads
- **Client-Side Hydration** for interactivity
- **API Routes** for efficient data processing
- **TypeScript** for compile-time error checking
- **Optimized Builds** with Next.js

## 🔒 **Security**

- **Input Validation** on all API endpoints
- **Error Handling** with proper HTTP status codes
- **Type Safety** with TypeScript
- **Environment Variables** for configuration

## 📈 **Monitoring**

- **Console Logging** for development
- **Error Boundaries** for React components
- **API Error Handling** with proper responses
- **Performance Monitoring** with Next.js built-ins

## 🤝 **Contributing**

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 **License**

MIT License - see LICENSE file for details.

---

**Built with ❤️ using Next.js 14, React 18, and TypeScript**


