# PullSight AI 🧠✨

PullSight AI is an open-source, AI-powered pull request reviewer designed to streamline and improve code reviews using advanced Large Language Models. It integrates seamlessly with GitHub and Bitbucket, delivering smart, contextual feedback directly within your version control workflow to boost code quality and speed up development.

This repository provides the open-source edition of [PullSight AI](https://pullsight.ai/). For enhanced features, you can try the redesigned Pro version at [app.pullsight.ai](https://app.pullsight.ai/), which delivers even more effective reviews that adapt and improve based on your usage.

## 📞 Stay Connected

- 🌍 **Website**: [pullsight.ai](https://pullsight.ai)
- 🐛 **Issues**: [GitHub Issues](https://github.com/melioraweb/pullsight/issues)
- 💬 **Discussions**: [GitHub Discussions](https://github.com/melioraweb/pullsight/discussions)
- 👥 **Discord**: [Join our community](https://discord.com/invite/Bg4SszVgnC)

## 🚀 Features

- **Pull Request Summary & Walkthrough:**  
  Get a concise overview of each pull request, including a guided walkthrough of the main changes.

- **Pre-Change File Overview (Tabular Format):**  
  See a table summarizing all files affected before diving into the details.

- **Estimated Code Review Effort:**  
  Receive an estimate of the time and effort required to review the pull request.

- **Individual Issue Detection:**  
  Automatically identify specific issues within the code changes.

- **Issue Clarification:**  
  Each detected issue includes a brief explanation for better understanding.

- **Code Suggestions:**  
  Get actionable code suggestions to resolve detected issues and improve code quality.

## Examples

Some of the reviews done by PullSight after integration with your own application on GitHub.

![Review Summery](https://imgur.com/9rnv3j1.png)

![Code Suggestion](https://imgur.com/yKkMP7L.png)

## 🔧 Prerequisites

- **Node.js 18+** and npm/yarn
- **Python 3.9+**
- **MongoDB** (local or cloud)
- **Git**
- **Claude API Key** from [Anthropic Console](https://console.anthropic.com/)
- **ngrok** for local development tunneling

## 📦 Tech Stack

| Component | Tech            |
| --------- | --------------- |
| Backend   | NestJS          |
| Frontend  | Next.js         |
| AI Agent  | Python, FastAPI |
| Database  | MongoDB         |

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/melioraweb/pullsight
cd pullsightai
```

## 🔗 Platform Integration Setup

### Prerequisites for Local Development

Before setting up platform integrations, install and configure ngrok for secure tunneling:

```bash
# Install ngrok

# macOS
brew install ngrok

# Ubuntu/Debian
curl -s https://ngrok-agent.s3.amazonaws.com/ngrok.asc | sudo tee /etc/apt/trusted.gpg.d/ngrok.asc >/dev/null
echo "deb https://ngrok-agent.s3.amazonaws.com buster main" | sudo tee /etc/apt/sources.list.d/ngrok.list
sudo apt update && sudo apt install ngrok

# Windows (using Chocolatey)
choco install ngrok

# Or download directly from https://ngrok.com/download
# Extract the executable and add to your PATH

# Sign up at https://ngrok.com and get your auth token
# Configure ngrok with your auth token (all platforms)
ngrok config add-authtoken YOUR_AUTH_TOKEN

# Start ngrok tunnel (keep this running during development)
ngrok http 3333
```

Copy the HTTPS URL from ngrok (e.g., `https://abc123.ngrok.io`) - this will be your `{API_BASE_URL}` for local setup.

### 🐙 GitHub App Setup

1. **Create GitHub App**

   - Go to GitHub → Settings → Developer Settings → GitHub Apps
   - Click **"New GitHub App"**

2. **Configure App Settings**

   ```
   App name: PullSight-Dev (or your preferred name)
   Callback URL: {BASE_URL}/v1/github/callback
   Webhook URL: {API_BASE_URL}/v1/github/events

   ⚠️ IMPORTANT: {API_BASE_URL} should be your ngrok URL (e.g., https://abc123.ngrok.io)
   You'll need to update these URLs after starting ngrok in the development setup.

   Under Webhook

   - ✅  Request user authorization (OAuth) during installation

   Under Webhook

   - ✅ Active We will deliver event details when this hook is triggered.

   Example with ngrok:
   Homepage URL: https://abc123.ngrok.io
   Authorization callback URL: https://abc123.ngrok.io/v1/github/callback
   Webhook URL: https://abc123.ngrok.io/v1/github/events
   ```

3. **Enable OAuth**

   - ✅ Request user authorization (OAuth) during installation

4. **Set Permissions**

   ```
   Contents → Read-only
   Issues → Read & Write
   Metadata → Read-only
   Pull requests → Read & Write
   Events → Read-only
   Members → Read-only
   Organization codespaces → Read-only
   Webhooks → Read-only
   ```

5. **Subscribe to Events**

   - ✅ Pull requests
   - ✅ Pull request review commen
   - ✅ Pull request review

6. **Save Configuration**

   - Click **"Create GitHub App"**
   - Note down: **App ID** (for GITHUB_APP_ID)
   - Generate and download **Private Key** (.pem file)
   - Save the .pem file in your backend directory

   ⚠️ **IMPORTANT**: After creating your GitHub App:

   - Go to **"Advanced"** tab in your GitHub App settings
   - Check **"Make Public"**
   - This allows other users/organizations to install your app for testing

### 🔑 GitHub OAuth App Setup

In addition to the GitHub App, you also need to create a GitHub OAuth App for user authentication:

1. **Create GitHub OAuth App**

   - Go to GitHub → Settings → Developer Settings → OAuth Apps
   - Click **"New OAuth App"**

2. **Configure OAuth App Settings**

   ```
   Application name: PullSight-OAuth (or your preferred name)
   Homepage URL: {BASE_URL}
   Authorization callback URL: {BASE_URL}/v1/auth/github/callback

   ⚠️ IMPORTANT: {BASE_URL} should be your localhost backend (http://localhost:3333)
   You'll need to update these URLs after starting ngrok in the development setup.

   Example:
   Homepage URL: http://localhost:3333
   Authorization callback URL: http://localhost:3333/v1/auth/github/callback
   ```

3. **Register Application and Get Credentials**

   - Click **"Register application"**
   - Note down the **Client ID** (for GITHUB_CLIENT_ID)
   - Click **"Generate a new client secret"**
   - Copy and store the **Client Secret** (for GITHUB_CLIENT_SECRET)

   ⚠️ **Important**: Store the client secret immediately as it won't be shown again!

### 🪣 Bitbucket OAuth Setup

1. **Create OAuth Consumer**

   - Go to Bitbucket → Workspace Settings → OAuth Consumers
   - Click **"Add consumer"**

2. **Configure Consumer**

   ```
   Name: PullSight-Dev
   Callback URL: {BASE_URL}/v1/auth/bitbucket/callback
   ```

⚠️ IMPORTANT: {BASE_URL} should be your localhost backend (http://localhost:3333)
You'll need to update this URL after starting ngrok in the development setup.

Example with ngrok:
Callback URL : http://localhost:3333/v1/auth/github/callback

```
3. Set Permissions
```

Account → Read ✅
Workspace → Read ✅
Issues → Write ✅
Pull requests → Read ✅
Webhooks → Write ✅ 4. **Save Configuration**

- Click **"Save"**
- Note down: Key (Client ID) and Secret (Client Secret)

### 📝 Environment Configuration

This project uses separate environment files for different development modes:

- **Local Development:**  
  Use `.env.local` in each service directory (backend, frontend, ai_agent).  
  These files should reference `localhost` and your ngrok URL.

- **Docker Development:**  
  Use `.env.docker` in each service directory.  
  These files should reference Docker container names (e.g., `pullsightai-backend:3333`) instead of `localhost`.

Create the appropriate `.env` files in each directory based on your setup:

**Backend (`backend/.env.local` for local development):**

```bash
# GitHub App Configuration
GITHUB_APP_ID=123456
GITHUB_APP_SLUG=your-github-app-slug
GITHUB_PRIVATE_KEY_PATH=app.private-key.pem

# GitHub OAuth Configuration
GITHUB_CLIENT_ID=Ov23liUR3p5e3TtYLLio
GITHUB_CLIENT_SECRET=your_github_oauth_client_secret_here

# AI Agent Integration
AI_AGENT_PR_POST_URL=http://localhost:8030/ai_agent

# Bitbucket Configuration
BITBUCKET_CLIENT_ID=your_bitbucket_client_id
BITBUCKET_CLIENT_SECRET=your_bitbucket_client_secret

# Application Configuration
DOMAIN=localhost
MAX_PR_FILES_TO_PROCESS=500

# Database
MONGODB_URI=mongodb://localhost:27017/pullsight

# Security
JWT_SECRET=your-super-secret-jwt-key-here

# URLs (update with your ngrok URL for local development)
CLIENT_URL=http://localhost:3000
BASE_URL=http://localhost:3333

# Server Configuration
PORT=3333
NODE_ENV=development
```

**For Docker development, use `backend/.env.docker` and update URLs to use container names instead of `localhost`.**

Repeat similar steps for `frontend` and `ai_agent` directories, using `.env.local` for local development and `.env.docker` for Docker.

**AI Agent (.env.local for local development)**

```bash
# Claude API Configuration
CLAUDE_API_KEY=sk-ant-api03-your-claude-api-key-here

# Backend API Endpoints - Must match your ngrok URL or localhost URL
BACKEND_BASE_URL=http://localhost:3333/
BACKEND_SUMMARY_ENDPOINT=http://localhost:3333/v1/analysis/summary
BACKEND_REVIEW_ENDPOINT=http://localhost:3333/v1/analysis/reviews

# AI Model Configuration
DEFAULT_MODEL_NAME=claude-3-sonnet-20240229

```

**Frontend (.env.local for local development)**

```bash
# Environment Configuration
NODE_ENV=development
NEXT_TELEMETRY_DISABLED=1

# API Configuration - Use your ngrok URL for local development
NEXT_PUBLIC_API_URL=http://localhost:3333/v1
```

### 🚀 Local Development Setup

#### 1. **Install Dependencies**

First, install dependencies for each service:

**Backend Dependencies**

```bash
cd backend
npm install
# or
yarn install
```

**Frontend Dependencies**

```bash
cd frontend
npm install
# or
yarn install
```

**AI Agent Dependencies**

```bash
cd ai_agent

# Option 1: Direct installation
pip install -r requirements.txt

# Option 2: Using virtual environment (recommended)
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

#### 2. **Environment Files Setup**

Create the appropriate `.env` files in their respective directories based on your development approach:

**For Local Development (without Docker):**
✅ **Required Files:**

- `backend/.env.local` - Copy from "Backend (.env.local)" section above
- `frontend/.env.local` - Copy from "Frontend (.env.local)" section above
- `ai_agent/.env.local` - Copy from "AI Agent (.env.local)" section above

**For Docker Development:**
✅ **Required Files:**

- `backend/.env.docker` - Backend Docker configuration
- `frontend/.env.docker` - Frontend Docker configuration
- `ai_agent/.env.docker` - AI Agent Docker configuration

The Docker `.env.docker` files should use container network references (e.g., `http://pullsightai-backend:3333`) instead of localhost.

**Example Docker Configuration Differences:**

**AI Agent (.env.docker for Docker development):**

```bash
# Claude API Configuration
CLAUDE_API_KEY=sk-ant-api03-your-claude-api-key-here

# Backend API Endpoints - Use container names for Docker networking
BACKEND_BASE_URL=http://pullsightai-backend:3333/
BACKEND_SUMMARY_ENDPOINT=http://pullsightai-backend:3333/v1/analysis/summary
BACKEND_REVIEW_ENDPOINT=http://pullsightai-backend:3333/v1/analysis/reviews

# AI Model Configuration
DEFAULT_MODEL_NAME=claude-3-sonnet-20240229
```

**Frontend (.env.docker for Docker development):**

```bash
# Environment Configuration
NODE_ENV=development
NEXT_TELEMETRY_DISABLED=1

# API Configuration - Use container name for Docker networking
NEXT_PUBLIC_API_URL=http://pullsightai-backend:3333/v1
```

⚠️ **Important Setup Steps:**

1. **Replace URLs**: Update `https://abc123.ngrok.io` with your actual ngrok URL in ALL `.env` files
2. **GitHub App**: Make sure your GitHub App is set to **PUBLIC** in the Advanced settings
3. **Private Key**: Place your GitHub App private key file (`.pem`) in the `backend/` directory
4. **API Keys**: Add your actual API keys:
   - Claude API key from [Anthropic Console](https://console.anthropic.com/)
   - GitHub App credentials from your GitHub App settings
   - Bitbucket OAuth credentials from your Bitbucket workspace
5. **Database**: Ensure MongoDB is running locally or update the connection string
6. **Ports**: Make sure ports 3000, 3333, and 8030 are available

#### 3. **Start Services**

Choose one of the following methods:

**Method A: Manual Startup (Step-by-step)**

```bash
# Step 1: Start ngrok tunnel (Terminal 1)
ngrok http 3333
# Copy the HTTPS URL (e.g., https://abc123.ngrok.io) and update all .env files

# Step 2: IMPORTANT - Update GitHub and Bitbucket Settings
# After getting your ngrok URL, you MUST update the following:
#
# GitHub App Settings:
# - Go to your GitHub App → General → Basic information
# - Update Homepage URL: https://your-ngrok-url.ngrok.io
# - Update Authorization callback URL: https://your-ngrok-url.ngrok.io/v1/auth/github/callback
# - Update Webhook URL: https://your-ngrok-url.ngrok.io/v1/github/events
#
# GitHub OAuth App Settings:
# - Go to your GitHub OAuth App → General
# - Update Homepage URL: https://your-ngrok-url.ngrok.io
# - Update Authorization callback URL: http://localhost:3333/v1/auth/github/callback
#
# Bitbucket OAuth Consumer Settings:
# - Go to your Bitbucket OAuth Consumer
# - Update Callback URL: http://localhost:3333/v1/auth/bitbucket/callback

# Step 3: Start MongoDB (Terminal 2) - Skip if using cloud MongoDB
mongod

# Step 4: Start backend service (Terminal 3)
cd backend
npm run start:dev
# or: yarn start:dev

# Step 5: Start AI agent service (Terminal 4)
cd ai_agent
source venv/bin/activate  # if using virtual environment
python -m uvicorn app.main:app --reload --port 8030

# Step 6: Start frontend service (Terminal 5)
cd frontend
npm run dev
# or: yarn dev
```

**Method B: Docker Compose (Recommended for production-like setup)**

```bash
# Ensure all .env.docker files are configured with your actual values
# The docker-compose.yml uses .env.docker files from each service directory
docker-compose up --build

# To run in background:
docker-compose up -d --build

# To view logs:
docker-compose logs -f

# To stop all services:
docker-compose down
```

**Note**: Docker setup uses service-specific `.env.docker` files with container network references instead of localhost URLs.

#### 4. **Access Your Application**

Once all services are running successfully:

| Service            | Local URL                       | Description           |
| ------------------ | ------------------------------- | --------------------- |
| 🌐 **Frontend**    | http://localhost:3000           | Main web application  |
| ⚡ **Backend API** | http://localhost:3333           | REST API server       |
| 🤖 **AI Agent**    | http://localhost:8030           | AI processing service |
| 📊 **MongoDB**     | mongodb://localhost:27017       | Database (if local)   |
| 🔗 **Public URL**  | https://your-ngrok-url.ngrok.io | Webhooks endpoint     |

#### 5. **Verify Your Setup**

**Health Check Commands:**

```bash
# Test backend API
curl http://localhost:3333/health

# Test AI agent
curl http://localhost:8030/health

# Test public access (replace with your ngrok URL)
curl https://abc123.ngrok.io/health
```

**End-to-End Testing:**

1. Open http://localhost:3000 in your browser
2. Sign in with GitHub or Bitbucket
3. Install your GitHub App on a test repository
4. Create a test pull request
5. Check logs to confirm webhooks are received and processed

#### 6. **Development Tips & Troubleshooting**

**🔧 Common Commands:**

```bash
# View Docker logs for specific service
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f ai_agent

# Restart specific service
docker-compose restart backend

# Rebuild specific service
docker-compose up --build backend
```

**⚠️ Important Notes:**

- **Ngrok URL Updates**: When ngrok restarts, you MUST update:
  1. All `.env` files with the new ngrok URL
  2. GitHub App settings (Homepage, Authorization callback, Webhook URLs)
  3. GitHub OAuth App settings (Homepage, Authorization callback URLs)
  4. Bitbucket OAuth Consumer settings (Callback URL)
- **GitHub App Public**: Ensure your GitHub App is set to PUBLIC in Advanced settings
- **Hot Reload**: All services support hot reloading during development
- **Database Tools**: Use MongoDB Compass to inspect database during development
- **Port Conflicts**: Ensure ports 3000, 3333, 8030 are not used by other applications

**🐛 Common Issues:**

- **"Connection refused"**: Check if all services are running
- **"Webhook not received"**:
  - Verify ngrok URL is updated in GitHub App webhook settings
  - Check that ngrok is still running (URLs change when restarted)
  - Ensure the webhook URL format is correct: https://your-ngrok-url.ngrok.io/v1/github/events
- **"Unauthorized"**: Check API keys and GitHub App configuration
- **"OAuth callback error"**: Verify callback URLs are updated in GitHub/Bitbucket OAuth settings
- **"Database connection failed"**: Ensure MongoDB is running or connection string is correct

**🐳 Docker Networking Configuration:**

When running with Docker Compose, services communicate using their container names instead of `localhost`. The project includes separate environment configurations:

- **`.env.docker`**: Used by Docker Compose (services use container names like `pullsightai-backend:3333`)
- **`.env.local`**: Used for local development without Docker (services use `localhost:3333`)

If you see `ECONNREFUSED 127.0.0.1:3333` errors in Docker logs, it means a service is trying to use localhost instead of the Docker service name. The correct configurations are automatically applied when using `docker-compose up`.

### 📊 Docker Services Overview

The `docker-compose.yml` includes:

- **backend**: NestJS API server
- **frontend**: Next.js web application
- **ai_agent**: Python FastAPI service

Make sure all `.env.docker` files are properly configured before running `docker-compose up`.

⚠️ **Important**: Update your ngrok URL in GitHub App settings and `.env.local` files whenever you restart ngrok.

## 🤝 Contributing

We welcome community contributions! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for details.

## 🆘 Need Help?

**Common Issues:**

- **Ngrok URL changes**: Remember to update all `.env.local` files when ngrok restarts
- **MongoDB connection**: Ensure MongoDB is running locally or update connection string
- **API keys**: Verify all API keys are correctly set in environment files
- **Port conflicts**: Make sure ports 3000, 3333, and 8030 are available

**Getting Support:**

- Check the [Issues](https://github.com/melioraweb/pullsight/issues) page
- Create a new issue if you encounter problems
- Provide logs and configuration details when asking for help

## � Stay Connected

- 🌍 **Website**: [pullsight.ai](https://pullsight.ai)
- 🐛 **Issues**: [GitHub Issues](https://github.com/melioraweb/pullsight/issues)
- � **Discussions**: [GitHub Discussions](https://github.com/melioraweb/pullsight/discussions)

## ⭐ Star History

If you find this project useful, please consider giving it a star! ⭐
