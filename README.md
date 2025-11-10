1. Projektets namn : Chappy – en chat-app

2. Kort beskrivning:

- Projektet är en chatt-app med kanaler och direktmeddelanden.
- Gästanvändare kan läsa och skriva i publika kanaler men inte skicka privata meddelanden.
- Funktioner: skapa kanaler (endast inloggade användare), skicka meddelanden, läsa meddelanden realtid.
- Teknologier: React, TypeScript, Express, AWS DynamoDB, Zod, CSS.

3. Funktioner:

Registrera och logga in som användare

Skapa, läsa och skicka meddelanden i kanaler

Skicka direktmeddelanden (DM) till specifika användare

Skapa och ta bort kanaler 

Ta bort eget konto

Låsta kanaler för inloggade användare

Responsiv och användarvänlig frontend


4. Teknologier:

Backend: Node.js, Express, REST API, DynamoDB

Frontend: React, React Router, Zustand, CSS 

Autentisering: JWT, bcrypt


5. ## .env:
Skapa en `.env`-fil med följande variabler:
PORT=4000
AWS_REGION=HEMLIG
AWS_ACCESS_KEY_ID=HEMLIG
AWS_SECRET_ACCESS_KEY=HEMLIG
JWT_SECRET=HEMLIG