# Provenance (v0.1.0, 2026-10-25)

Sources: getpack-api `dcd2a56` (main), getproperty-api `fa8e987` (feat/b7-landlords-free-pricing).

| Package path                                     | From                                                                                | Notes                                                                     |
| ------------------------------------------------ | ----------------------------------------------------------------------------------- | ------------------------------------------------------------------------- |
| integrations/src/http/resilient-http.ts (+spec)  | getpack `src/integrations/http`                                                     |                                                                           |
| integrations/src/http/provider-fetch.ts          | getproperty `src/integrations/http/provider-http.ts`                                | Nest `Logger` → `integrationsLogger()`                                    |
| integrations/src/identity/*                      | getpack `src/integrations/identity`                                                 | Firebase ID tokens (phone, Google, Apple), LINE                           |
| integrations/src/sms/*                           | getpack `src/integrations/sms`                                                      | ThaiBulkSMS; getproperty's adapter superseded                             |
| integrations/src/line/*                          | getproperty `src/integrations/line`                                                 | LINE Login + Messaging; getpack's messaging client superseded             |
| integrations/src/email/*                         | getpack `src/integrations/email`                                                    | SES with MIME attachments; getproperty's superseded                       |
| integrations/src/storage/*                       | getproperty `src/integrations/s3`                                                   | port identical to getpack's plus `mode`                                   |
| integrations/src/secrets/*                       | getpack `src/integrations/secrets`                                                  |                                                                           |
| integrations/src/pdf/*                           | getpack `src/integrations/pdf`                                                      | incl. PDF/A-3; getproperty's queue renderer stays in getproperty (BullMQ) |
| integrations/src/virus-scan/*                    | getpack `src/integrations/virus-scan`                                               | storage import → `../storage`                                             |
| integrations/src/web-push/_, webhooks/_, teams/* | getpack                                                                             | `webhooks` = getpack `webhooks-out`                                       |
| integrations/src/payments/gateways/*             | getpack `src/integrations/payments`                                                 | SCB, 2C2P, Slip2Go                                                        |
| integrations/src/payments/qr/*                   | getproperty `src/integrations/payments`                                             | KBank, SCB, Opn QR, EasySlip, Thai QR                                     |
| integrations/src/etax/_, ocr/_, ai/*             | getproperty                                                                         | `@integrations/*` aliases → relative                                      |
| documents/*                                      | new (D-276)                                                                         |                                                                           |
| content/*                                        | new (D-277), model from getproperty-web guides                                      |                                                                           |
| web-kit/*                                        | new; JSON-LD and llms.txt from getproperty-web marketing, return-to/phone rewritten |                                                                           |

Not moved (product-specific): getproperty kms, locks, mqtt, integration-webhooks, queue PDF renderer; getpack carriers, dieline, material-price-index, bank-files.
Planned for 0.2: one payments port for gateways and QR; the OTP service and phone login from getpack `modules/auth/login`; image renditions (sharp) in documents; CMS API module in content.
