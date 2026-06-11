const express = require('express');
const app = express();
const port = 3000;
const fs = require('fs');
const path = require('path');

const dataFile = path.join(__dirname, 'task.json');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Load tasks from file on each request to reflect in-memory mutations
const loadData = () => {
    const raw = fs.readFileSync(dataFile, 'utf-8');
    return JSON.parse(raw).tasks;
};

const saveData = (tasks) => {
    fs.writeFileSync(dataFile, JSON.stringify({ tasks }, null, 2));
};

const getNextId = (tasks) => {
    const ids = tasks.map(task => task.id);
    return ids.length ? Math.max(...ids) + 1 : 1;
};

// Validate task input - returns error message or null if valid
const validateTaskInput = (data) => {
    const { title, description, completed } = data || {};

    if (!data || typeof data !== 'object') {
        return 'Request body must be a JSON object';
    }
    if (title === undefined || description === undefined || completed === undefined) {
        return 'title, description, and completed are required';
    }
    if (typeof title !== 'string' || typeof description !== 'string' || typeof completed !== 'boolean') {
        return 'invalid data types: title and description must be strings, completed must be a boolean';
    }
    if (title.trim() === '' || description.trim() === '') {
        return 'title and description must not be empty';
    }
    return null;
};

// POST /tasks - create a new task
app.post('/tasks', (req, res) => {
    const validationError = validateTaskInput(req.body);
    if (validationError) {
        return res.status(400).json({ error: validationError });
    }

    const { title, description, completed } = req.body;
    const tasks = loadData();
    const newTask = {
        id: getNextId(tasks),
        title: title.trim(),
        description: description.trim(),
        completed
    };
    tasks.push(newTask);
    saveData(tasks);
    res.status(201).json(newTask);
});

// GET /tasks - get all tasks
app.get('/tasks', (req, res) => {
    res.status(200).json(loadData());
});

// GET /tasks/:id - get a single task
app.get('/tasks/:id', (req, res) => {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
        return res.status(400).json({ error: 'Invalid task ID: must be a number' });
    }
    const tasks = loadData();
    const task = tasks.find(t => t.id === id);
    if (!task) {
        return res.status(404).json({ error: 'Task not found' });
    }
    res.status(200).json(task);
});

// PUT /tasks/:id - update a task
app.put('/tasks/:id', (req, res) => {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
        return res.status(400).json({ error: 'Invalid task ID: must be a number' });
    }

    const validationError = validateTaskInput(req.body);
    if (validationError) {
        return res.status(400).json({ error: validationError });
    }

    const { title, description, completed } = req.body;
    const tasks = loadData();
    const taskIndex = tasks.findIndex(t => t.id === id);
    if (taskIndex === -1) {
        return res.status(404).json({ error: 'Task not found' });
    }

    tasks[taskIndex] = { id, title: title.trim(), description: description.trim(), completed };
    saveData(tasks);
    res.status(200).json(tasks[taskIndex]);
});

// DELETE /tasks/:id - delete a task
app.delete('/tasks/:id', (req, res) => {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
        return res.status(400).json({ error: 'Invalid task ID: must be a number' });
    }
    const tasks = loadData();
    const taskIndex = tasks.findIndex(t => t.id === id);
    if (taskIndex === -1) {
        return res.status(404).json({ error: 'Task not found' });
    }
    const deletedTask = tasks.splice(taskIndex, 1)[0];
    saveData(tasks);
    res.status(200).json(deletedTask);
});

if (require.main === module) {
    app.listen(port, (err) => {
        if (err) {
            return console.log('Something bad happened', err);
        }
        console.log(`Server is listening on ${port}`);
    });
}

module.exports = app;
