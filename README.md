# Plantão Fácil - Medical Document OCR Dashboard

A modern React.js application for managing and viewing medical documents processed by AWS Textract OCR.

## Overview

This application provides a professional interface for viewing surgical reports, medical records, and other healthcare documents that have been processed by an AWS Lambda + Textract OCR pipeline.

### System Architecture

```
WhatsApp → Twilio → S3 → Lambda (Textract) → DynamoDB → API Gateway → This App (React Dashboard)
```

## Tech Stack

- **Frontend Framework**: Next.js 15 (App Router)
- **Language**: TypeScript (strict mode)
- **Styling**: TailwindCSS 4.x
- **State Management**: TanStack Query (React Query) + Zustand
- **HTTP Client**: Axios
- **Date Handling**: date-fns (with pt-BR locale)
- **Icons**: Lucide React
- **Notifications**: Sonner
- **Component Library**: shadcn/ui (planned)

## Features

### Phase 1 (Current - Foundation)
- ✅ Project setup with Next.js 15 + TypeScript
- ✅ TailwindCSS 4 configuration
- ✅ API client with Axios (ready for AWS API Gateway)
- ✅ TypeScript interfaces for Document data model
- ✅ Utility functions for Brazilian formats (CPF, CRM, dates)
- ✅ Home page with feature overview
- ✅ TanStack Query provider setup
- ⏳ Documents list page (in progress)
- ⏳ Document detail page (in progress)

### Phase 2 (Planned - Search & Analytics)
- Search and filtering across documents
- Advanced filters (hospital, specialty, date range, confidence)
- Analytics dashboard with charts
- CSV export functionality

### Phase 3 (Planned - Authentication)
- AWS Cognito integration
- Role-based access control (Admin, Medical Staff, Viewer)
- Protected routes

### Phase 4 (Planned - Polish & Deployment)
- Vercel deployment
- GitHub CI/CD pipeline
- Performance optimization
- Comprehensive testing

## Getting Started

### Prerequisites

- Node.js 18+ (recommended: Node.js 20)
- npm
- AWS API Gateway endpoint (for document data)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd plantao-facil-app
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables:
```bash
# Copy the example file
cp .env.example .env.local

# Edit .env.local and add your AWS API Gateway endpoint
NEXT_PUBLIC_API_BASE_URL=https://your-api-gateway-url.execute-api.us-east-1.amazonaws.com/prod
```

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Available Scripts

- `npm run dev` - Start development server (with Turbopack)
- `npm run build` - Build for production
- `npm start` - Run production build locally
- `npm run lint` - Run ESLint

## Project Structure

```
plantao-facil-app/
├── app/                       # Next.js App Router
│   ├── layout.tsx            # Root layout with providers
│   ├── page.tsx              # Home page
│   ├── providers.tsx         # TanStack Query provider
│   └── globals.css           # Global styles
├── components/               # React components
│   ├── ui/                  # shadcn/ui components (planned)
│   ├── documents/           # Document-related components (planned)
│   ├── layout/              # Layout components (planned)
│   └── common/              # Common/shared components (planned)
├── lib/                      # Utilities and configurations
│   ├── api/
│   │   ├── client.ts        # Axios instance
│   │   └── documents.ts     # Document API functions
│   ├── utils/
│   │   ├── date.ts          # Date formatting (pt-BR)
│   │   ├── formatting.ts    # CPF, CRM, phone formatting
│   │   └── cn.ts            # className utility
│   └── constants.ts         # App constants
├── hooks/                    # Custom React hooks (planned)
├── types/                    # TypeScript type definitions
│   └── document.ts          # Document interface
├── public/                   # Static assets
├── .env.local               # Environment variables (not in git)
├── .env.example             # Example environment file
├── next.config.mjs          # Next.js configuration
├── tailwind.config.ts       # TailwindCSS configuration
├── tsconfig.json            # TypeScript configuration
└── package.json             # Dependencies and scripts
```

## Environment Variables

### Required

- `NEXT_PUBLIC_API_BASE_URL` - AWS API Gateway endpoint URL

### Optional

- `NEXT_PUBLIC_APP_NAME` - Application name (default: "Plantão Fácil")
- `NEXT_PUBLIC_APP_VERSION` - App version (default: "1.0.0")

### Phase 3 (Authentication - Future)

- `NEXTAUTH_URL` - NextAuth URL
- `NEXTAUTH_SECRET` - NextAuth secret key
- `COGNITO_CLIENT_ID` - AWS Cognito client ID
- `COGNITO_CLIENT_SECRET` - AWS Cognito client secret
- `COGNITO_ISSUER` - Cognito issuer URL

## API Integration

This application integrates with an AWS API Gateway that provides access to DynamoDB document data.

### Endpoints

- `GET /documents` - List all documents (with pagination)
- `GET /documents/{id}` - Get single document by ID
- `GET /health` - Health check

### Document Data Structure

Documents contain:
- **Patient Info**: Name, CPF, DOB, medical record number, gender
- **Hospital Info**: Hospital name, specialty
- **Medical Professional Info**: Doctor name, CRM, assistants
- **Clinical Data**: Procedure, surgery date
- **Metadata**: OCR confidence, timestamps, document type

## Brazilian Localization

- All dates formatted as DD/MM/YYYY
- CPF formatted as 123.456.789-00
- CRM formatted as "CRM 123456"
- Medical terminology in Portuguese
- pt-BR locale for date-fns

## Development Roadmap

### Week 1-2: Foundation ✅ (Current)
- [x] Project setup
- [x] API integration layer
- [x] TypeScript interfaces
- [x] Utility functions
- [x] Home page
- [ ] Documents list page
- [ ] Document detail page

### Week 3: Search & Analytics
- [ ] Search functionality
- [ ] Advanced filters
- [ ] Analytics dashboard
- [ ] Export to CSV

### Week 4: Authentication
- [ ] AWS Cognito setup
- [ ] Login/logout
- [ ] Role-based access control

### Week 5: Deployment
- [ ] Testing & QA
- [ ] Performance optimization
- [ ] Vercel deployment
- [ ] GitHub CI/CD

## Contributing

This is a professional migration project. For questions or contributions, please contact the development team.

## License

MIT

## Acknowledgments

- Built with Next.js, TypeScript, and TailwindCSS
- Integrated with AWS Lambda, Textract, and DynamoDB
- Designed for medical administrators at SPDM hospitals
