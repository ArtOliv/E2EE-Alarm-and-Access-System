# Imagen base
FROM node:22-alpine

# Diretório de trabalho do container
WORKDIR /usr/src/app

# Primeiramente copia os arquivos de dependências ajustando o dono
COPY --chown=node:node package.json package-lock.json ./

# Instala as dependências
RUN npm ci --only=production

# Copia o código fonte ajustando o dono
COPY --chown=node:node . .

# Rebaixa os privilégios do container alterando usuário (Low Privilege)
USER node

# Expoẽ a porta do Backend
EXPOSE 3000

# Comando de inicialização
CMD ["npm", "start"]