# Dockerfile

FROM node:20-alpine

# Establece directorio de trabajo
WORKDIR /app

# Copia los archivos necesarios primero (para aprovechar cache)
COPY package*.json ./
COPY prisma ./prisma

# Instala dependencias
RUN npm install

# Genera el cliente de Prisma
RUN npx prisma generate

# Copia el resto del código
COPY . .

# Compila el proyecto de Next.js
RUN npm run build

# Expone el puerto de Next.js
EXPOSE 3000

# Inicia la app
CMD ["npm", "start"]