FROM node:20-alpine

WORKDIR /app

# Copiar archivos necesarios
COPY package*.json tsconfig.json ./
COPY prisma ./prisma
COPY app/backend ./app/backend

# Instala dependencias y tipos
RUN npm install

# Compilar el backend TypeScript a JavaScript
RUN npx tsc

# Expón el puerto
EXPOSE 4000

# Ejecuta el archivo transpilado (ajusta si tu tsconfig cambia ruta)
CMD ["node", "/app/backend/index.js"]