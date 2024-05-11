# Usamos una imagen base de Node.js
FROM node:22-alpine
ARG GMAIL_APP_EMAIL=${GMAIL_APP_EMAIL}
ENV GMAIL_APP_PASSWORD=${GMAIL_APP_PASSWORD}
# Establecemos el directorio de trabajo en /app
WORKDIR /app

# Copiamos el archivo package.json y package-lock.json al directorio de trabajo
COPY package*.json ./

# Instalamos las dependencias del proyecto
RUN npm install

# Copiamos todo el contenido de la carpeta al directorio de trabajo
COPY . .

RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
