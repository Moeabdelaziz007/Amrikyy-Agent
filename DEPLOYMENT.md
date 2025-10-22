# Amrikyy SAAAAS Platform - Deployment Guide

**Version:** 1.0  
**Last Updated:** January 20, 2025

This guide provides step-by-step instructions for deploying the Amrikyy SAAAAS platform.

---

## 🏗️ Architecture Overview

The project is a monorepo with a decoupled frontend and backend, which is the standard for modern, scalable web applications.

- **Frontend**: A React (Vite) application located in the `/frontend` directory. Deployed to **Vercel**.
- **Backend**: A Node.js (Express) server located in the `/backend` directory. Deployed to **Railway** or **Render**.
- **Database**: A **Supabase** (PostgreSQL) instance.

## ✅ Prerequisites

1.  **GitHub Repository**: All code is pushed to a GitHub repository.
2.  **Vercel Account**: For deploying the frontend.
3.  **Railway/Render Account**: For deploying the backend.
4.  **Supabase Project**: For the database.
5.  **`vercel.json`**: Ensure a `vercel.json` file exists in the project's root directory to correctly configure the monorepo deployment on Vercel.

## 🚀 Deployment Process

The deployment must be done in a specific order: **Backend first, then Frontend.**

---

### **Step 1: Deploy the Backend (Railway or Render)**

1.  **Create a New Project**:
    - On your Railway or Render dashboard, create a new "Web Service".
    - Connect it to your GitHub repository.

2.  **Configure the Service**:
    - **Root Directory**: `backend` (This is crucial for a monorepo).
    - **Build Command**: `npm install`
    - **Start Command**: `npm start`

3.  **Add Environment Variables**:
    - Navigate to the "Variables" or "Environment" section.
    - Add all the keys from your local `backend/.env` file.

    | Key                 | Example Value                      | Description                         |
    | ------------------- | ---------------------------------- | ----------------------------------- |
    | `DATABASE_URL`      | `postgres://...`                   | Your Supabase connection string.    |
    | `JWT_SECRET`        | `a-very-strong-secret-key`         | Secret for signing JSON Web Tokens. |
    | `GEMINI_API_KEY`    | `AIza...`                          | Your Google AI API key.             |
    | `STRIPE_SECRET_KEY` | `sk_test_...`                      | Your Stripe secret key.             |
    | `FRONTEND_URL`      | `https://your-app-name.vercel.app` | **Leave this blank for now.**       |
    | `PORT`              | `10000`                            | The port provided by the host.      |

4.  **Deploy**:
    - Trigger the deployment.
    - Once complete, the service will have a public URL (e.g., `https://amrikyy-backend-prod.up.railway.app`). **Copy this URL.**

---

### **Step 2: Deploy the Frontend (Vercel)**

1.  **Create a New Project**:
    - On your Vercel dashboard, create a new project.
    - Connect it to the same GitHub repository.

2.  **Configure the Project**:
    - Vercel should auto-detect the Vite project.
    - Set the **Root Directory** to `frontend`.
    - The `vercel.json` file in the root will handle the rest of the build configuration.

3.  **Add Environment Variable**:
    - Navigate to the project's "Settings" -> "Environment Variables".
    - Add the following variable:

    | Key            | Value                                         | Description                           |
    | -------------- | --------------------------------------------- | ------------------------------------- |
    | `VITE_API_URL` | `https://amrikyy-backend-prod.up.railway.app` | The backend URL you copied in Step 1. |

4.  **Deploy**:
    - Trigger the deployment.
    - Once complete, Vercel will provide the final URL for your live application (e.g., `https://amrikyy-saaaas.vercel.app`). **Copy this URL.**

---

### **Step 3: Final Connection**

This final step is crucial for security (CORS) to work correctly.

1.  **Update Backend Environment**:
    - Go back to your backend project on Railway/Render.
    - Navigate to the "Variables" / "Environment" section.
    - Update the `FRONTEND_URL` variable with the Vercel URL you copied in Step 2.

2.  **Redeploy Backend**:
    - The change in environment variables should automatically trigger a new deployment of the backend.
    - Wait for it to complete.

---

## 🎉 Deployment Complete!

Your SAAAAS platform is now live and fully connected.

- **Frontend URL**: `https://amrikyy-saaaas.vercel.app`
- **Backend URL**: `https://amrikyy-backend-prod.up.railway.app`
