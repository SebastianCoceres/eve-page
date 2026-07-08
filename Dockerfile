# Usamos una imagen base de Node.js
FROM node:24-alpine

WORKDIR /app

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
ENV COREPACK_ENABLE_DOWNLOAD_PROMPT=0
RUN corepack enable

# Copiamos los archivos de manifiesto y configuración de pnpm al directorio de trabajo
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

# Instalamos las dependencias del proyecto
RUN pnpm install --frozen-lockfile

# Copiamos todo el contenido de la carpeta al directorio de trabajo
COPY . .

RUN pnpm build

EXPOSE 3000

CMD ["pnpm", "start"]
