export interface ProjectStep {
  id: string
  title: string
  description: string
  instructions: string[]
  code: string
  language: "javascript" | "typescript" | "python" | "html" | "css"
  hints: string[]
  expectedOutput?: string
}

export interface Project {
  id: string
  title: string
  description: string
  difficulty: "beginner" | "intermediate" | "advanced"
  category: string
  duration: string
  technologies: string[]
  learningObjectives: string[]
  steps: ProjectStep[]
  finalDemo: string
}

export const PROJECTS: Project[] = [
  {
    id: "todo-app",
    title: "Interactive Todo Application",
    description: "Build a fully functional todo app with local storage, filters, and animations",
    difficulty: "beginner",
    category: "Web Development",
    duration: "2-3 hours",
    technologies: ["HTML", "CSS", "JavaScript", "LocalStorage"],
    learningObjectives: [
      "DOM manipulation and event handling",
      "Local storage for data persistence",
      "CSS animations and transitions",
      "Array methods for filtering and sorting",
    ],
    steps: [
      {
        id: "step-1",
        title: "Setup HTML Structure",
        description: "Create the basic HTML structure for the todo app",
        instructions: [
          "Create a container div for the app",
          "Add an input field for new todos",
          "Create an 'Add' button",
          "Add a ul element to display todo items",
          "Include filter buttons (All, Active, Completed)",
        ],
        code: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Todo App</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <div class="container">
    <h1>My Todo List</h1>
    <div class="input-container">
      <input type="text" id="todoInput" placeholder="Add a new task...">
      <button id="addBtn">Add</button>
    </div>
    <div class="filters">
      <button class="filter-btn active" data-filter="all">All</button>
      <button class="filter-btn" data-filter="active">Active</button>
      <button class="filter-btn" data-filter="completed">Completed</button>
    </div>
    <ul id="todoList"></ul>
  </div>
  <script src="script.js"></script>
</body>
</html>`,
        language: "html",
        hints: [
          "Use semantic HTML elements",
          "Add IDs to elements you'll need to access with JavaScript",
          "Keep the structure clean and organized",
        ],
      },
      {
        id: "step-2",
        title: "Style with CSS",
        description: "Add beautiful styling to your todo app",
        instructions: [
          "Style the container with centered layout",
          "Add hover effects to buttons",
          "Style todo items with checkboxes",
          "Add transition animations",
          "Make it responsive for mobile devices",
        ],
        code: `* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;
}

.container {
  background: white;
  border-radius: 15px;
  padding: 30px;
  width: 100%;
  max-width: 500px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

h1 {
  color: #667eea;
  text-align: center;
  margin-bottom: 30px;
}

.input-container {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
}

#todoInput {
  flex: 1;
  padding: 12px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 16px;
  transition: border-color 0.3s;
}

#todoInput:focus {
  outline: none;
  border-color: #667eea;
}

#addBtn {
  padding: 12px 24px;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 16px;
  transition: background 0.3s, transform 0.1s;
}

#addBtn:hover {
  background: #5568d3;
  transform: translateY(-2px);
}

.filters {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
  justify-content: center;
}

.filter-btn {
  padding: 8px 16px;
  border: 2px solid #e0e0e0;
  background: white;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s;
}

.filter-btn.active {
  background: #667eea;
  color: white;
  border-color: #667eea;
}

#todoList {
  list-style: none;
}

.todo-item {
  display: flex;
  align-items: center;
  padding: 15px;
  background: #f9f9f9;
  border-radius: 8px;
  margin-bottom: 10px;
  transition: all 0.3s;
  animation: slideIn 0.3s ease-out;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.todo-item:hover {
  background: #f0f0f0;
  transform: translateX(5px);
}

.todo-item.completed {
  opacity: 0.6;
}

.todo-item.completed .todo-text {
  text-decoration: line-through;
}

.todo-checkbox {
  width: 20px;
  height: 20px;
  margin-right: 15px;
  cursor: pointer;
}

.todo-text {
  flex: 1;
  font-size: 16px;
}

.delete-btn {
  background: #ff4757;
  color: white;
  border: none;
  padding: 6px 12px;
  border-radius: 6px;
  cursor: pointer;
  transition: background 0.3s;
}

.delete-btn:hover {
  background: #ff3838;
}`,
        language: "css",
        hints: [
          "Use CSS Grid or Flexbox for layouts",
          "Add transition properties for smooth animations",
          "Consider mobile-first responsive design",
        ],
      },
      {
        id: "step-3",
        title: "Add JavaScript Functionality",
        description: "Implement the core logic with local storage persistence",
        instructions: [
          "Create functions to add, delete, and toggle todos",
          "Implement filter functionality",
          "Save todos to localStorage",
          "Load todos from localStorage on page load",
          "Add keyboard support (Enter key to add)",
        ],
        code: `let todos = JSON.parse(localStorage.getItem('todos')) || [];
let currentFilter = 'all';

const todoInput = document.getElementById('todoInput');
const addBtn = document.getElementById('addBtn');
const todoList = document.getElementById('todoList');
const filterBtns = document.querySelectorAll('.filter-btn');

function saveTodos() {
  localStorage.setItem('todos', JSON.stringify(todos));
}

function addTodo() {
  const text = todoInput.value.trim();
  
  if (text === '') {
    alert('Please enter a task!');
    return;
  }
  
  const todo = {
    id: Date.now(),
    text: text,
    completed: false
  };
  
  todos.push(todo);
  saveTodos();
  todoInput.value = '';
  renderTodos();
}

function deleteTodo(id) {
  todos = todos.filter(todo => todo.id !== id);
  saveTodos();
  renderTodos();
}

function toggleTodo(id) {
  todos = todos.map(todo => 
    todo.id === id ? { ...todo, completed: !todo.completed } : todo
  );
  saveTodos();
  renderTodos();
}

function getFilteredTodos() {
  if (currentFilter === 'active') {
    return todos.filter(todo => !todo.completed);
  } else if (currentFilter === 'completed') {
    return todos.filter(todo => todo.completed);
  }
  return todos;
}

function renderTodos() {
  const filteredTodos = getFilteredTodos();
  
  todoList.innerHTML = '';
  
  filteredTodos.forEach(todo => {
    const li = document.createElement('li');
    li.className = \`todo-item \${todo.completed ? 'completed' : ''}\`;
    
    li.innerHTML = \`
      <input 
        type="checkbox" 
        class="todo-checkbox" 
        \${todo.completed ? 'checked' : ''}
        onchange="toggleTodo(\${todo.id})"
      >
      <span class="todo-text">\${todo.text}</span>
      <button class="delete-btn" onclick="deleteTodo(\${todo.id})">Delete</button>
    \`;
    
    todoList.appendChild(li);
  });
}

addBtn.addEventListener('click', addTodo);

todoInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    addTodo();
  }
});

filterBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    filterBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    currentFilter = btn.dataset.filter;
    renderTodos();
  });
});

// Initial render
renderTodos();`,
        language: "javascript",
        hints: [
          "Use array methods like map, filter, and forEach",
          "Always validate user input",
          "Store data as JSON in localStorage",
          "Use event delegation for better performance",
        ],
        expectedOutput: "A fully functional todo app with add, delete, complete, and filter features",
      },
    ],
    finalDemo: "/todo-app-interface.png",
  },
  {
    id: "weather-app",
    title: "Real-Time Weather Dashboard",
    description: "Create a weather app that fetches live data from an API and displays beautiful weather cards",
    difficulty: "intermediate",
    category: "API Integration",
    duration: "3-4 hours",
    technologies: ["JavaScript", "Fetch API", "OpenWeatherMap API", "CSS Grid"],
    learningObjectives: [
      "Working with REST APIs",
      "Async/await and promise handling",
      "Dynamic UI updates based on data",
      "Error handling and loading states",
    ],
    steps: [
      {
        id: "step-1",
        title: "Setup HTML and API Integration",
        description: "Create the structure and connect to weather API",
        instructions: [
          "Create search input for city names",
          "Add loading spinner element",
          "Create card containers for weather data",
          "Set up error message display",
        ],
        code: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Weather Dashboard</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <div class="container">
    <h1>🌤️ Weather Dashboard</h1>
    <div class="search-box">
      <input type="text" id="cityInput" placeholder="Enter city name...">
      <button id="searchBtn">Search</button>
    </div>
    <div id="loading" class="loading hidden">
      <div class="spinner"></div>
      <p>Fetching weather data...</p>
    </div>
    <div id="error" class="error hidden"></div>
    <div id="weatherCard" class="weather-card hidden">
      <!-- Weather data will be inserted here -->
    </div>
  </div>
  <script src="script.js"></script>
</body>
</html>`,
        language: "html",
        hints: ["Structure your HTML for dynamic content insertion", "Use semantic class names"],
      },
      {
        id: "step-2",
        title: "Fetch and Display Weather Data",
        description: "Implement API calls and data parsing",
        instructions: [
          "Use fetch API to get weather data",
          "Handle loading and error states",
          "Parse JSON response",
          "Update UI with weather information",
          "Add current location detection",
        ],
        code: `const API_KEY = 'YOUR_API_KEY'; // Get from openweathermap.org
const cityInput = document.getElementById('cityInput');
const searchBtn = document.getElementById('searchBtn');
const loading = document.getElementById('loading');
const error = document.getElementById('error');
const weatherCard = document.getElementById('weatherCard');

async function getWeather(city) {
  try {
    // Show loading state
    loading.classList.remove('hidden');
    error.classList.add('hidden');
    weatherCard.classList.add('hidden');
    
    const response = await fetch(
      \`https://api.openweathermap.org/data/2.5/weather?q=\${city}&appid=\${API_KEY}&units=metric\`
    );
    
    if (!response.ok) {
      throw new Error('City not found');
    }
    
    const data = await response.json();
    displayWeather(data);
    
  } catch (err) {
    showError(err.message);
  } finally {
    loading.classList.add('hidden');
  }
}

function displayWeather(data) {
  const { name, main, weather, wind } = data;
  
  weatherCard.innerHTML = \`
    <div class="weather-header">
      <h2>\${name}</h2>
      <img src="https://openweathermap.org/img/wn/\${weather[0].icon}@2x.png" alt="Weather icon">
    </div>
    <div class="weather-temp">
      <h1>\${Math.round(main.temp)}°C</h1>
      <p>\${weather[0].description}</p>
    </div>
    <div class="weather-details">
      <div class="detail">
        <span>Feels like</span>
        <strong>\${Math.round(main.feels_like)}°C</strong>
      </div>
      <div class="detail">
        <span>Humidity</span>
        <strong>\${main.humidity}%</strong>
      </div>
      <div class="detail">
        <span>Wind Speed</span>
        <strong>\${wind.speed} m/s</strong>
      </div>
    </div>
  \`;
  
  weatherCard.classList.remove('hidden');
}

function showError(message) {
  error.textContent = \`❌ Error: \${message}\`;
  error.classList.remove('hidden');
}

searchBtn.addEventListener('click', () => {
  const city = cityInput.value.trim();
  if (city) {
    getWeather(city);
  }
});

cityInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    const city = cityInput.value.trim();
    if (city) {
      getWeather(city);
    }
  }
});

// Get user's location weather on load
if (navigator.geolocation) {
  navigator.geolocation.getCurrentPosition(async (position) => {
    const { latitude, longitude } = position.coords;
    const response = await fetch(
      \`https://api.openweathermap.org/data/2.5/weather?lat=\${latitude}&lon=\${longitude}&appid=\${API_KEY}&units=metric\`
    );
    const data = await response.json();
    displayWeather(data);
  });
}`,
        language: "javascript",
        hints: [
          "Always handle API errors gracefully",
          "Use try-catch for async operations",
          "Provide user feedback for loading states",
        ],
        expectedOutput: "Live weather data displayed in beautiful cards with icons and details",
      },
    ],
    finalDemo: "/weather-dashboard-interface.png",
  },
  {
    id: "markdown-editor",
    title: "Live Markdown Editor with Preview",
    description: "Build a split-screen markdown editor that renders HTML in real-time",
    difficulty: "intermediate",
    category: "Text Processing",
    duration: "2-3 hours",
    technologies: ["JavaScript", "Marked.js", "CSS Grid", "Local Storage"],
    learningObjectives: [
      "Text parsing and rendering",
      "Split-pane layouts",
      "Debouncing for performance",
      "File export functionality",
    ],
    steps: [
      {
        id: "step-1",
        title: "Create Split-Pane Editor Layout",
        description: "Build the HTML structure with editor and preview panes",
        instructions: [
          "Create two-column layout",
          "Add textarea for markdown input",
          "Add div for HTML preview",
          "Include toolbar with actions",
        ],
        code: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Markdown Editor</title>
  <link rel="stylesheet" href="style.css">
  <script src="https://cdn.jsdelivr.net/npm/marked/marked.min.js"></script>
</head>
<body>
  <div class="toolbar">
    <h1>📝 Markdown Editor</h1>
    <div class="actions">
      <button id="downloadBtn">Download MD</button>
      <button id="clearBtn">Clear</button>
    </div>
  </div>
  <div class="editor-container">
    <div class="pane">
      <h3>Markdown Input</h3>
      <textarea id="markdown" placeholder="# Start typing markdown..."></textarea>
    </div>
    <div class="pane">
      <h3>Preview</h3>
      <div id="preview" class="preview"></div>
    </div>
  </div>
  <script src="script.js"></script>
</body>
</html>`,
        language: "html",
        hints: ["Use CSS Grid for responsive split-pane layout"],
      },
      {
        id: "step-2",
        title: "Implement Live Preview Rendering",
        description: "Convert markdown to HTML in real-time",
        instructions: [
          "Parse markdown using marked.js library",
          "Update preview pane on input",
          "Add debouncing for performance",
          "Save content to localStorage",
          "Implement download functionality",
        ],
        code: `const markdown = document.getElementById('markdown');
const preview = document.getElementById('preview');
const downloadBtn = document.getElementById('downloadBtn');
const clearBtn = document.getElementById('clearBtn');

// Load saved content
const savedContent = localStorage.getItem('markdown');
if (savedContent) {
  markdown.value = savedContent;
  updatePreview();
}

let debounceTimer;

function updatePreview() {
  const html = marked.parse(markdown.value);
  preview.innerHTML = html;
  localStorage.setItem('markdown', markdown.value);
}

// Debounce input for performance
markdown.addEventListener('input', () => {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(updatePreview, 300);
});

downloadBtn.addEventListener('click', () => {
  const blob = new Blob([markdown.value], { type: 'text/markdown' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'document.md';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
});

clearBtn.addEventListener('click', () => {
  if (confirm('Clear all content?')) {
    markdown.value = '';
    preview.innerHTML = '';
    localStorage.removeItem('markdown');
  }
});

// Initial render
updatePreview();`,
        language: "javascript",
        hints: [
          "Use debouncing to avoid excessive renders",
          "marked.parse() converts markdown to HTML",
          "Blob API helps with file downloads",
        ],
        expectedOutput: "Real-time markdown to HTML conversion with live preview",
      },
    ],
    finalDemo: "/markdown-editor-split-screen.jpg",
  },
]
