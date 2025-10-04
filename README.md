# Finance Tracker
Manage and Track my Income, Expenses, and Investments @ https://sgv-fintrack.mooo.com/

## Tech Stack

### Frontend
- **Next.js 15** - React framework with server-side rendering and app router
- **React 19** - UI library
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first CSS framework
- **tRPC** - End-to-end typesafe APIs

### Backend
- **Next.js API Routes** - Serverless API endpoints
- **tRPC Server** - Type-safe API layer
- **NextAuth.js** - Authentication
- **Prisma** - ORM for database management
- **PostgreSQL** - Relational database (hosted on AWS RDS)

### DevOps & Tools
- **Docker** - Containerization platform
- **ESLint** - Code linting
- **Prettier** - Code formatting
- **Zod** - Schema validation
- **Claude Code** - AI-powered development assistant

## System Architecture

### Infrastructure
- **AWS EC2** - Hosting environment within VPC
- **AWS RDS** - PostgreSQL database hosting
- **AWS S3** - Image storage (planned for future implementation)
- **Nginx** - Reverse proxy server running on EC2

### Networking & Security
- **Domain** - FreeDNS from afraid.org (sgv-fintrack.mooo.com)
- **SSL/TLS** - Let's Encrypt certificate via Certbot
- **Reverse Proxy** - Nginx for routing and SSL termination
