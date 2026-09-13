FROM node:22-alpine
RUN apk add --no-cache openssl libc6-compat

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npx prisma generate && npm run build

EXPOSE 3000

RUN chmod +x scripts/docker-start.sh

CMD ["npm", "run", "docker-start"]
