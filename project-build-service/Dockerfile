FROM node

WORKDIR /usr/home/app
COPY package*.json ./
RUN npm install

COPY . ./
RUN chmod +x index.js
CMD ["node", "index.js"]