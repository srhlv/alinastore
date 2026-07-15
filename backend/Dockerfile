# Runsite/PaaS backend image for NestJS + Prisma.
# Copies prisma schema before npm ci so postinstall can run generate.

FROM node:22-alpine

WORKDIR /app

COPY package.json package-lock.json ./
COPY prisma ./prisma/

RUN npm ci

COPY . .

RUN npm run build

ENV NODE_ENV=production
EXPOSE 3000

CMD ["npm", "run", "start:prod"]
