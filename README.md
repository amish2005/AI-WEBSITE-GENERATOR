# 🚀 AI Website Generator

An AI-powered website generator built with Next.js (App Router) and Tailwind CSS.  
This project enables users to generate modern, responsive website layouts using natural language prompts, focusing on clean architecture and a smooth developer experience.

---

## ✨ Features

- ⚡ Next.js App Router for scalable routing
- 🎨 Tailwind CSS for modern, responsive UI
- 🧠 AI-driven website generation using prompts
- 🧩 Modular and reusable component architecture
- 🗂 Workspace-based structure for generated websites
- 🔐 Environment-variable–based configuration
- 🛠 Developer-friendly TypeScript setup
- 🚀 Ready for Vercel deployment

---

## 🛠 Tech Stack

- Framework: Next.js (App Router)
- Language: TypeScript
- Styling: Tailwind CSS
- State Management: React Context API
- Backend: Next.js Route Handlers (API routes)
- Package Manager: npm

---

## 📂 Project Structure

ai-website-generator/
├── app/                    # App Router pages, layouts & API routes  
│   ├── (auth)/             # Authentication routes  
│   ├── api/                # Backend API routes  
│   ├── playground/         # AI generation playground  
│   ├── workspace/          # User workspace  
│   ├── layout.tsx  
│   └── page.tsx  
├── components/             # Reusable UI components  
├── config/                 # App & tool configurations  
├── context/                # Global state management  
├── hooks/                  # Custom React hooks  
├── lib/                    # Utility functions & helpers  
├── public/                 # Static assets  
├── .env.example            # Environment variable template  
├── next.config.ts  
├── tailwind.config.ts  
├── postcss.config.js  
└── package.json  

---

## ⚙️ Getting Started

### 1. Clone the repository

git clone https://github.com/amish2005/AI-WEBSITE-GENERATOR.git  
cd AI-WEBSITE-GENERATOR

---

### 2. Install dependencies

npm install

---

### 3. Setup environment variables

Create a `.env.local` file using the template:

cp .env.example .env.local

Add the required API keys and configuration values.

⚠️ Never commit `.env` or `.env.local` files.

---

### 4. Run the development server

npm run dev

Open http://localhost:3000 in your browser.

---

## 🔐 Environment Variables

All required environment variables are documented in the `.env.example` file.  
This includes placeholders for AI API keys and application-level configuration.

---

## 🚀 Deployment

This project is optimized for deployment on Vercel.

Steps:
1. Push the repository to GitHub  
2. Import the repository into Vercel  
3. Add environment variables in the Vercel dashboard  
4. Deploy  

---

## 📌 Future Enhancements

- Real-time AI streaming responses  
- Theme and layout presets  
- Export generated websites  
- Authentication and user dashboards  
- Prompt history and project persistence  

---

## 🤝 Contributing

Contributions are welcome.

1. Fork the repository  
2. Create a new branch  
3. Commit your changes  
4. Open a Pull Request  

---

## 📄 License

This project is licensed under the MIT License.

---

## 👤 Author

Amish
B.Tech Electronics & Communication Engineering  
Delhi Technological University (DTU)

Interested in full-stack development, AI-powered systems, and scalable frontend architecture.

---

⭐ If you find this project useful, consider starring the repository.
