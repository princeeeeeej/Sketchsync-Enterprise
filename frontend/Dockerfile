FROM node:20-alpine

WORKDIR /app

RUN corepack enable && corepack prepare pnpm@latest --activate

COPY package.json pnpm-lock.yaml* ./
COPY pnpm-workspace.yaml ./

RUN pnpm install --frozen-lockfile

COPY . .

ARG CORE_SERVICE_URL=http://localhost:8081
ENV CORE_SERVICE_URL=${CORE_SERVICE_URL}

RUN pnpm run build

EXPOSE 3000

CMD ["pnpm", "start"]
