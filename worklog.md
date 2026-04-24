---
Task ID: 1
Agent: Main Agent
Task: CV Checker Overhaul — Full pricing, payments, file uploads, email, PDF, SMS, Pro subscriptions

Work Log:
- Reviewed existing CV checker codebase (page.tsx, result/page.tsx, /api/cv-scan, /api/cv-scan/[id], schema)
- Installed dependencies: mammoth, pdf-parse, @types/pdf-parse, nodemailer
- Updated Prisma schema with 5 new models: ScanCredit, MpesaPayment, ProSubscription, SmsLog + new enums (ScanType, MpesaStatus, SubStatus)
- Added phone, fileName, scanType, creditId fields to CVScan model
- Added scanCredits, mpesaPayments, proSubscription relations to User model
- Added all credentials to .env: M-Pesa sandbox + production, Talk-Sasa SMS, SMTP email, ZAI API key
- Pushed schema to database successfully
- Created src/lib/mpesa.ts — M-Pesa Daraja STK Push library with sandbox/production support
- Created src/lib/email.ts — Nodemailer email transport with sendCVResults() and sendOTP()
- Created src/lib/sms.ts — Talk-Sasa SMS gateway with sendOTP() and formatPhoneKenya()
- Created src/lib/file-parser.ts — mammoth.js (DOCX) + pdf-parse (PDF) file parsing
- Created src/app/api/mpesa/initiate/route.ts — POST endpoint for M-Pesa STK push initiation
- Created src/app/api/mpesa/callback/route.ts — POST callback handler for Daraja (handles scan credits + pro subscriptions)
- Created src/app/api/mpesa/status/route.ts — GET payment status checker
- Created src/app/api/credits/check/route.ts — GET scan credits checker (phone or userId)
- Created src/app/api/cv-parse/route.ts — POST file parsing endpoint (PDF/DOCX → text)
- Created src/app/api/cv-scan/[id]/pdf/route.ts — GET PDF/HTML report generation
- Created src/app/api/sms/send-otp/route.ts — POST OTP send with rate limiting
- Created src/app/api/sms/verify-otp/route.ts — POST OTP verification with constant-time compare
- Created src/app/api/subscribe/pro/route.ts — POST Pro subscription M-Pesa initiation
- Rewrote src/app/api/cv-scan/route.ts — Added credit checking, file upload support, email sending, pro daily limits
- Rewrote src/app/cv-checker/page.tsx — Pricing cards, file upload tabs, M-Pesa payment modal, session-aware credits
- Rewrote src/app/cv-checker/result/page.tsx — PDF download, WhatsApp share with scores, 5th score card, session-aware upsells

Stage Summary:
- Build passes with zero errors and zero warnings
- All new TypeScript files have zero type errors
- Database schema pushed successfully
- 20+ new/modified files created
- Complete pricing system: Anonymous KES 100/4 scans, Logged-in 1 free + KES 40/scan, Pro KES 500/month
