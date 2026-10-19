# VeltrixCRM (MERN Stack Edition)

**VeltrixCRM** is a modern, high-performance Customer Relationship Management (CRM) web application engineered on the **MERN Stack** (MongoDB, Express, React with `.jsx`, Node.js). Built with a focus on operational clarity, dynamic control, real-time analytics, and seamless team workflows.

---

## Tech Stack

* **Database:** [MongoDB](https://www.mongodb.com/) via [Mongoose](https://mongoosejs.com/) (Collections: Users, Customers, Tasks, ActivityLogs, Notifications, ContactMessages)
* **Backend:** [Node.js](https://nodejs.org/) & [Express.js](https://expressjs.com/) REST API
* **Frontend:** [React](https://react.dev/) 18 with modern component architecture (`.jsx` files) and [Vite](https://vitejs.dev/)
* **Styling:** Custom editorial Veltrix Design Tokens (`#2D3A2D` Deep Forest Green, `#9B5A46` Muted Terracotta, `#FBFBF9` Natural Base) + [Tailwind CSS](https://tailwindcss.com/)
* **Authentication:** JWT (JSON Web Tokens) with secure password hashing via `bcryptjs`
* **Real-time & Analytics:** Chart.js, WhatsApp direct communication integration, Veltrix AI Assistant widget

---

## Project Structure

```
VeltrixCRM/
├── server/                    # Node.js + Express Backend
│   ├── config/
│   │   └── db.js              # MongoDB Mongoose connection
│   ├── models/                # Mongoose schemas (User, Customer, Task, etc.)
│   ├── controllers/           # API business logic
│   ├── middleware/            # JWT authentication & role authorization
│   ├── routes/                # Express API endpoints
│   ├── seed/
│   │   └── seed.js            # MongoDB seeder with realistic demo CRM data
│   └── index.js               # Main Express application entry point
├── client/                    # React + Vite Frontend (.jsx)
│   ├── public/                # Static assets (images, animations, audio, favicon)
│   └── src/
│       ├── components/        # Reusable React components (Sidebar, Topbar, Modals, AI Widget)
│       ├── context/           # AuthContext & LanguageContext (English, Telugu, Hindi, Punjabi)
│       ├── pages/             # Page views (.jsx)
│       ├── services/          # Axios API service
│       ├── translations/      # Multilingual dictionaries
│       ├── App.jsx            # Router and protected layout orchestration
│       └── main.jsx           # React entry point
├── package.json               # Unified root scripts (dev, server, client, build, seed, start)
└── .env                       # Environment variables (PORT, MONGO_URI, JWT_SECRET, GEMINI_API_KEY)
```

---

## Prerequisites

* **Node.js** >= 18.x (Tested with Node v26)
* **npm** >= 9.x
* **MongoDB** (running locally on `mongodb://127.0.0.1:27017` or MongoDB Atlas URI)

---

## Quickstart Setup

### 1. Configure Environment Variables
Verify `.env` has your MongoDB connection:
```env
PORT=5050
MONGO_URI=mongodb://127.0.0.1:27017/veltrixcrm
JWT_SECRET=veltrix_crm_super_secure_jwt_secret_key_2026
GEMINI_API_KEY=your_gemini_api_key_optional
```

### 2. Seed MongoDB Database
Populate your MongoDB database with demo Admin, Staff, Leads/Customers, Tasks, and Activity Logs:
```bash
npm run seed
```

Default demo accounts created:
* **Admin:** `admin@veltrix.com` / `password123`
* **Staff:** `staff@veltrix.com` / `password123`

### 3. Start Development Server
Run both backend API and React Vite dev server concurrently:
```bash
npm run dev
```

* **Frontend:** `http://localhost:3000`
* **Backend API:** `http://localhost:5050`

---

## Deploy to Vercel

1. Push this repository to GitHub:
   ```bash
   git push -u origin main
   ```
2. Go to [Vercel](https://vercel.com/) and click **"Add New Project"**.
3. Import your GitHub repository: `phaniswar23/VeltrixCRM`.
4. Add the following **Environment Variables** in Vercel Project Settings:
   - `MONGO_URI`: Your MongoDB Atlas connection string (e.g., `mongodb+srv://<user>:<password>@cluster0.mongodb.net/veltrixcrm?retryWrites=true&w=majority`)
   - `JWT_SECRET`: A secure random string for JWT token signing
   - `GEMINI_API_KEY`: *(Optional)* For AI features
5. Click **Deploy**. Vercel will build the React frontend and deploy the serverless Express API automatically using `vercel.json`!

---

## Available NPM Scripts

| Script | Command | Description |
|---|---|---|
| `npm run dev` | `concurrently ...` | Runs both Node server and Vite React client simultaneously |
| `npm run server` | `node server/index.js` | Runs Express backend API |
| `npm run client` | `npm --prefix client run dev` | Runs Vite React frontend on port 3000 |
| `npm run seed` | `node server/seed/seed.js` | Seeds MongoDB with realistic initial data |
| `npm run build` | `npm --prefix client install && npm --prefix client run build` | Builds optimized production bundle |
| `npm start` | `node server/index.js` | Serves API and production React client |

