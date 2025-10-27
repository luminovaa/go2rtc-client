# Gunakan Node.js base image
FROM node:20

# Atur direktori kerja di dalam container
WORKDIR /app

# Copy file package dan install dependency
COPY package*.json ./
RUN npm install

# Copy seluruh project
COPY . .

# Expose port default Vite
EXPOSE 5173

# Jalankan Vite dev server dan izinkan akses dari luar container
CMD ["npm", "run", "dev", "--", "--host"]
