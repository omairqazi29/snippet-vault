# Snippet Vault

A modern full-stack code snippet manager for developers. Save, organize, and share code snippets with syntax highlighting across 150+ languages.

🚀 **Live Demo**: [https://snippet-vault-f2ps.onrender.com](https://snippet-vault-f2ps.onrender.com)

## Features

- 🔐 User authentication (register/login)
- 📝 Create, read, update, and delete code snippets
- 🎨 Syntax highlighting for multiple programming languages
- 🔍 Search and filter snippets by language, tags, or content
- 🌐 Public/private snippet sharing
- 🏷️ Tag organization
- 📱 Responsive design

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Authentication**: NextAuth.js
- **Syntax Highlighting**: react-syntax-highlighter

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database

### Installation

1. Clone the repository:
```bash
git clone https://github.com/omairqazi29/snippet-vault.git
cd snippet-vault
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

Edit `.env` and add your database URL and NextAuth secret:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/snippet_vault"
NEXTAUTH_SECRET="your-random-secret-key"
NEXTAUTH_URL="http://localhost:3000"
```

4. Run database migrations:
```bash
npx prisma migrate dev --name init
npx prisma generate
```

5. Start the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Deployment on Render

### Step 1: Create PostgreSQL Database

1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click "New +" → "PostgreSQL"
3. Configure your database:
   - Name: `snippet-vault-db`
   - Region: Choose closest to you
   - Plan: Free
4. Click "Create Database"
5. Copy the "Internal Database URL" for later

### Step 2: Deploy Web Service

1. In Render Dashboard, click "New +" → "Web Service"
2. Connect your GitHub repository
3. Configure the service:
   - Name: `snippet-vault`
   - Region: Same as database
   - Branch: `main`
   - Runtime: `Node`
   - Build Command: `npm install && npx prisma generate && npx prisma migrate deploy && npm run build`
   - Start Command: `npm start`
   - Plan: Free

4. Add Environment Variables:
   - `DATABASE_URL`: Paste the Internal Database URL from Step 1
   - `NEXTAUTH_SECRET`: Generate with `openssl rand -base64 32`
   - `NEXTAUTH_URL`: Your Render URL (e.g., `https://snippet-vault.onrender.com`)
   - `NODE_ENV`: `production`

5. Click "Create Web Service"

### Step 3: Initialize Database

After deployment completes, run migrations via Render Shell:
```bash
npx prisma migrate deploy
```

Your app should now be live! 🎉

## Usage

### Creating a Snippet

1. Register or login to your account
2. Click "New Snippet" on the dashboard
3. Fill in title, code, language, and optional description/tags
4. Toggle "Make this snippet public" to share it
5. Click "Save Snippet"

### Sharing Snippets

Public snippets can be shared via their unique URL:
```
https://your-app.com/snippets/[snippet-id]
```

### Search and Filter

- Use the search bar to find snippets by title, description, or code content
- Filter by programming language using the dropdown
- Filter by tags (displayed under each snippet)

## Database Schema

### User
- `id`: Unique identifier
- `email`: User email (unique)
- `name`: User name (optional)
- `password`: Hashed password
- `snippets`: Relation to Snippet model

### Snippet
- `id`: Unique identifier
- `title`: Snippet title
- `description`: Optional description
- `code`: The actual code
- `language`: Programming language
- `isPublic`: Public/private visibility
- `tags`: Array of tags
- `userId`: Owner reference
- `createdAt`: Creation timestamp
- `updatedAt`: Last update timestamp

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npx prisma studio` - Open Prisma Studio (database GUI)
- `npx prisma migrate dev` - Create and apply migrations

## License

MIT

## Contributing

Pull requests are welcome! For major changes, please open an issue first to discuss what you would like to change.
