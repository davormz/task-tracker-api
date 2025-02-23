# Task Tracker REST API

In this project, we will build a RESTful API for a task tracker application using Node.js, Express, and MongoDB. The API will allow users to perform CRUD operations on tasks.

## Steps to Build a Task Tracker REST API

### Step 1: Project Setup & Docker Configuration

First, let's set up the project structure and Docker configuration for MongoDB:

```bash
# Create project directory structure
mkdir task-tracker-api
cd task-tracker
npm init -y
```

Create a `docker-compose.yml` file:

```yaml
version: '3.8'
services:
  mongodb:
    image: mongo:latest
    container_name: task-tracker-mongodb
    ports:
      - "27017:27017"
    volumes:
      - mongodb_data:/data/db
    environment:
      - MONGO_INITDB_ROOT_USERNAME=admin
      - MONGO_INITDB_ROOT_PASSWORD=password

volumes:
  mongodb_data:
```

### Step 2: Install Dependencies

```bash
npm install express mongoose dotenv cors
npm install nodemon --save-dev
```

Update `package.json` with start script:

```json
{
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js"
  }
}
```

### Step 3: Create Basic Server Structure

Create `.env` file:
```env
PORT=5000
MONGODB_URI=mongodb://admin:password@localhost:27017/tasktracker?authSource=admin
```

Create `server.js`:

```javascript
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('MongoDB connection error:', err));

// Basic route
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to Task Tracker API' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
```

### Step 4: Create Task Model

Create `models/Task.js`:

```javascript
const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Task title is required'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Task description is required'],
    trim: true
  },
  details: {
    type: String,
    trim: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Task', taskSchema);
```

### Step 5: Create Task Controller

Create `controllers/taskController.js`:

```javascript
const Task = require('../models/Task');

// Get all tasks
exports.getAllTasks = async (req, res) => {
  try {
    const tasks = await Task.find().sort({ createdAt: -1 });
    res.status(200).json(tasks);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching tasks' });
  }
};

// Create new task
exports.createTask = async (req, res) => {
  try {
    const task = await Task.create(req.body);
    res.status(201).json(task);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Get single task
exports.getTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }
    res.status(200).json(task);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching task' });
  }
};

// Update task
exports.updateTask = async (req, res) => {
  try {
    const task = await Task.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }
    res.status(200).json(task);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Delete task
exports.deleteTask = async (req, res) => {
  try {
    const task = await Task.findByIdAndDelete(req.params.id);
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }
    res.status(200).json({ message: 'Task deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Error deleting task' });
  }
};
```

### Step 6: Create Routes

Create `routes/taskRoutes.js`:

```javascript
const express = require('express');
const router = express.Router();
const {
  getAllTasks,
  createTask,
  getTask,
  updateTask,
  deleteTask
} = require('../controllers/taskController');

router.route('/')
  .get(getAllTasks)
  .post(createTask);

router.route('/:id')
  .get(getTask)
  .put(updateTask)
  .delete(deleteTask);

module.exports = router;
```

### Step 7: Update Server.js with Routes

Update `server.js` to include the routes:

```javascript
// ... previous code ...

const taskRoutes = require('./routes/taskRoutes');
app.use('/api/tasks', taskRoutes);

// ... rest of the code ...
```

### Step 8: Add Error Handling Middleware

Create `middleware/errorHandler.js`:

```javascript
const errorHandler = (err, req, res, next) => {
  console.error(err.stack);

  if (err.name === 'ValidationError') {
    return res.status(400).json({
      error: Object.values(err.errors).map(error => error.message)
    });
  }

  if (err.name === 'CastError') {
    return res.status(400).json({
      error: 'Invalid ID format'
    });
  }

  res.status(500).json({
    error: 'Something went wrong!'
  });
};

module.exports = errorHandler;
```

Update `server.js` to include error handling:

```javascript
const errorHandler = require('./middleware/errorHandler');

// ... other middleware and routes ...

app.use(errorHandler);
```

## Running the Application

1. Start MongoDB container:
```bash
docker-compose up -d
```

2. Start the backend server:
```bash
npm run dev
```

## Testing the API

You can test the API endpoints using tools like Postman or curl:

```bash
# Get all tasks
GET http://localhost:5000/api/tasks

# Create a task
POST http://localhost:5000/api/tasks
Content-Type: application/json

{
  "title": "Sample Task",
  "description": "This is a sample task",
  "details": "Additional details here"
}

# Get single task
GET http://localhost:5000/api/tasks/:id

# Update task
PUT http://localhost:5000/api/tasks/:id

# Delete task
DELETE http://localhost:5000/api/tasks/:id
```
