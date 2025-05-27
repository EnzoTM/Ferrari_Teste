# FerrariStore - Project Setup (Next.js + Node.js)

This project is divided into two parts:

* `frontend` (Next.js)
* `backend` (Node.js)

Follow the steps below to run the application locally.

---

## 🚀 Getting Started

### 1. Open Two Terminals and Navigate to the Project Folders

In the root directory of the project, open **two separate terminals**:

* In Terminal 1:

  ```bash
  cd FerrariStore/frontend
  ```

* In Terminal 2:

  ```bash
  cd FerrariStore/backend
  ```

---

### 2. Install Dependencies

In **both** terminals, run the following command:

```bash
npm install --force
```

This will install all the required dependencies for both frontend and backend.

---

### 3. Set Environment Variables

#### In the `frontend` folder:

Create a file named `.env` and add the following:

```
NEXT_PUBLIC_API_URL=http://localhost:5000
```

#### In the `backend` folder:

Create a file named `.env` and add the following:

```
PORT=5000
MONGODB_URI=your_mongodb_connection_string_here
JWT_SECRET=ferrari_secret_jwt_2024
```

Replace `your_mongodb_connection_string_here` with the actual MongoDB URI you'll get in the next step.

---

### 4. Configure MongoDB Atlas

1. Go to [MongoDB Atlas](https://www.mongodb.com/products/platform/atlas-database).
2. Create an account or log in.
3. Create a new **cluster** (or use an existing one).
4. Click **"Connect"** to get your **MongoDB connection string (URI)**.
5. Copy the URI and paste it in the `.env` file inside the `backend` folder where it says `your_mongodb_connection_string_here`.
6. Go to **Network Access** in MongoDB Atlas.
7. Add your **current IP address** to the list of allowed IPs.

---

### 5. Run the Project

In both terminals, run:

```bash
npm run dev
```

* The **frontend** will be available at: `http://localhost:3000`
* The **backend** will be running at: `http://localhost:5000`

---

✅ You're all set! The project should now be running locally.
