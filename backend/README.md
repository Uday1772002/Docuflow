# DocuFlow Backend

Backend API for DocuFlow file sharing application.

## Setup

1. Install dependencies:

```bash
npm install
```

2. Create .env file:

```bash
cp .env.example .env
```

3. Update .env with your configuration:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/docuflow
JWT_SECRET=your_secret_key_here
FRONTEND_URL=http://localhost:3000
NODE_ENV=development
```

4. Start the server:

```bash
npm start
# or for development
npm run dev
```

## Dependencies

```bash
npm install express mongoose dotenv bcryptjs jsonwebtoken multer cors uuid express-validator
npm install --save-dev nodemon
```

## API Documentation

See main README.md for complete API documentation.
