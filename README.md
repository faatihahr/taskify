# 📋 Taskify

<div align="center">
  <img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React" />
  <img src="https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white" alt="Node.js" />
  <img src="https://img.shields.io/github/stars/faatihahr/taskify?style=for-the-badge" alt="Stars" />
  <img src="https://img.shields.io/github/license/faatihahr/taskify?style=for-the-badge" alt="License" />
</div>

<br />

<p align="center">
  <strong>A modern, full-stack task management application built with TypeScript</strong>
</p>

<p align="center">
  Streamline your workflow, boost productivity, and never miss a deadline with Taskify's intuitive interface and powerful features.
</p>

---

## ✨ Features

🎯 **Smart Task Management**
- Create, update, and delete tasks with ease
- Organize tasks by priority, category, and due dates
- Set task status (To Do, In Progress, Completed)

⚡ **Real-time Updates**
- Instant synchronization across all your devices
- Live updates without page refresh

🎨 **Beautiful UI/UX**
- Clean and modern interface
- Responsive design that works on all devices
- Intuitive drag-and-drop functionality

🔐 **Secure & Reliable**
- User authentication and authorization
- Data persistence with robust backend
- Secure API endpoints

📊 **Productivity Insights**
- Track your task completion rates
- Visualize your productivity trends
- Stay motivated with progress tracking

---

## 🚀 Tech Stack

### Frontend
- **TypeScript** - Type-safe development
- **React** - Modern UI library
- **CSS3** - Custom styling and animations

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web application framework
- **TypeScript** - End-to-end type safety

---

## 📦 Installation

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Clone the repository
```bash
git clone https://github.com/faatihahr/taskify.git
cd taskify
```

### Install dependencies

**Client:**
```bash
cd client
npm install
```

**Server:**
```bash
cd server
npm install
```

---

## 🔧 Configuration

Create a `.env` file in the server directory:

```env
PORT=5000
DATABASE_URL=your_database_url
JWT_SECRET=your_jwt_secret
NODE_ENV=development
```

Create a `.env` file in the client directory:

```env
REACT_APP_API_URL=http://localhost:5000/api
```

---

## 🎮 Running the Application

### Development Mode

**Start the server:**
```bash
cd server
npm run dev
```

**Start the client:**
```bash
cd client
npm start
```

The application will be available at:
- Client: `http://localhost:3000`
- Server: `http://localhost:5000`

### Production Build

**Build the client:**
```bash
cd client
npm run build
```

**Start the production server:**
```bash
cd server
npm start
```

---

## 📁 Project Structure

```
taskify/
├── client/                 # Frontend React application
│   ├── public/            # Static files
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── pages/         # Page components
│   │   ├── services/      # API services
│   │   ├── styles/        # CSS styles
│   │   ├── types/         # TypeScript types
│   │   └── utils/         # Utility functions
│   └── package.json
│
├── server/                # Backend Node.js application
│   ├── src/
│   │   ├── controllers/   # Route controllers
│   │   ├── models/        # Data models
│   │   ├── routes/        # API routes
│   │   ├── middleware/    # Custom middleware
│   │   └── utils/         # Helper functions
│   └── package.json
│
└── start-server.js        # Server startup script
```

---

## 🎯 Usage

1. **Create an Account**
   - Sign up with your email and password
   - Verify your account

2. **Add Your First Task**
   - Click the "+" button or "Add Task"
   - Fill in task details (title, description, priority, due date)
   - Save your task

3. **Manage Tasks**
   - Drag and drop to reorder tasks
   - Update task status with a single click
   - Edit or delete tasks as needed

4. **Track Progress**
   - View your completed tasks
   - Monitor your productivity stats
   - Set and achieve your goals

---

## 🛠️ API Endpoints

### Authentication
```
POST   /api/auth/register    - Register new user
POST   /api/auth/login       - User login
POST   /api/auth/logout      - User logout
```

### Tasks
```
GET    /api/tasks            - Get all tasks
GET    /api/tasks/:id        - Get single task
POST   /api/tasks            - Create new task
PUT    /api/tasks/:id        - Update task
DELETE /api/tasks/:id        - Delete task
```

---

## 🤝 Contributing

Contributions are what make the open-source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📝 License

Distributed under the MIT License. See `LICENSE` for more information.

---

## 👤 Author

**Faatihah Rahmatillah**

- GitHub: [@faatihahr](https://github.com/faatihahr)
- Portfolio: [fahraaraa.vercel.app](https://fahraaraa.vercel.app/)

---

## 🙏 Acknowledgments

- Thanks to all contributors who have helped shape Taskify
- Inspired by modern task management solutions
- Built with passion for productivity

---

## 📸 Screenshots

<!-- Add your screenshots here -->
_Coming soon! Screenshots will be added to showcase the application interface._

---

## 🔮 Future Enhancements

- [ ] Task collaboration and sharing
- [ ] Mobile app (iOS & Android)
- [ ] Calendar integration
- [ ] Email notifications
- [ ] Task templates
- [ ] Dark mode
- [ ] Subtasks and checklists
- [ ] File attachments
- [ ] Advanced filtering and search

---

<div align="center">
  <p>If you found this project helpful, please consider giving it a ⭐️</p>
  <p>Made with ❤️ by Faatihah Rahmatillah</p>
</div>
