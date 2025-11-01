// ====================================================================
// CONFIGURATION & STATE
// ====================================================================

const API_BASE_URL = 'http://localhost:5000/api';
const DAILY_CALORIE_GOAL = 2000; // Hardcoded goal for frontend display

// Global state variables, retrieved from local/session storage on load
let CURRENT_USER = JSON.parse(sessionStorage.getItem('fndb_currentUser')) || null;
let AUTH_TOKEN = localStorage.getItem('fndb_token') || null;

// Food search state
let activeRegionFilter = 'All';
let currentSearchQuery = '';
let selectedFood = null; // Food object selected for meal logging

// ====================================================================
// UTILITY FUNCTIONS (UI & Persistence)
// ====================================================================

/**
 * Saves user data and token to storage.
 * @param {string} token - JWT token.
 * @param {object} user - User object.
 */
function setAuthSession(token, user) {
    AUTH_TOKEN = token;
    CURRENT_USER = user;
    localStorage.setItem('fndb_token', token);
    sessionStorage.setItem('fndb_currentUser', JSON.stringify(user));
}

/**
 * Clears all session data on logout.
 */
function clearAuthSession() {
    AUTH_TOKEN = null;
    CURRENT_USER = null;
    localStorage.removeItem('fndb_token');
    sessionStorage.removeItem('fndb_currentUser');
}

/**
 * Shows a toast notification.
 * @param {string} message - The message to display.
 * @param {'success' | 'error'} type - The type of notification.
 */
function showNotification(message, type) {
    const notification = document.getElementById('notification');
    notification.textContent = message;
    notification.className = `notification ${type} show`;
    setTimeout(() => {
        notification.classList.remove('show');
    }, 3000);
}

/**
 * Toggles the active view and calls necessary render functions.
 * @param {string} viewId - The ID of the view to show (e.g., 'home', 'login').
 */
function showView(viewId) {
    document.querySelectorAll('.view').forEach(view => {
        view.classList.remove('active');
    });
    document.getElementById(viewId + 'View').classList.add('active');
    updateNavBar(); 
    
    if (viewId === 'dashboard' && CURRENT_USER) {
        setupDashboard();
        fetchDashboardData();
    }
    
    if (viewId === 'search') {
        renderFoodGrid();
    }
}

/**
 * Updates the navigation bar links based on the current user session.
 */
function updateNavBar() {
    const menu = document.getElementById('navbarMenu');
    menu.innerHTML = '';
    
    if (CURRENT_USER) {
        menu.innerHTML = `
            <a class="nav-link" onclick="showView('dashboard')">Dashboard</a>
            <a class="nav-link" onclick="showView('search')">Food Database</a>
            <button class="btn btn-secondary" onclick="handleLogout()">Logout</button>
        `;
    } else {
        menu.innerHTML = `
            <a class="nav-link" onclick="showView('home')">Home</a>
            <a class="nav-link" onclick="showView('search')">Food Database</a>
            <button class="btn btn-secondary" onclick="showView('login')">Login</button>
        `;
    }
}

/**
 * Utility to format today's date for API and display.
 * @returns {string} Date in YYYY-MM-DD format.
 */
function getTodayDate() {
    return new Date().toISOString().split('T')[0];
}

/**
 * Simple debounce utility for search inputs.
 * @param {Function} func - The function to debounce.
 * @param {number} delay - The debounce delay in ms.
 */
function debounce(func, delay) {
    let timeout;
    return function(...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), delay);
    };
}

// ====================================================================
// AUTHENTICATION LOGIC (API Calls)
// ====================================================================

/**
 * Handles user registration.
 * @param {Event} event - The form submission event.
 */
async function handleRegister(event) {
    event.preventDefault();
    const username = document.getElementById('regUsername').value;
    const email = document.getElementById('regEmail').value;
    const password = document.getElementById('regPassword').value;
    const confirmPassword = document.getElementById('regConfirmPassword').value;

    if (password !== confirmPassword) {
        showNotification('Passwords do not match!', 'error');
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, email, password })
        });

        const data = await response.json();

        if (response.ok) {
            showNotification('Registration successful. Please log in.', 'success');
            showView('login');
        } else {
            showNotification(data.error || 'Registration failed.', 'error');
        }
    } catch (error) {
        showNotification('Network error. Check if backend is running on port 5000.', 'error');
    }
}

/**
 * Handles user login.
 * @param {Event} event - The form submission event.
 */
async function handleLogin(event) {
    event.preventDefault();
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;

    try {
        const response = await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (response.ok) {
            setAuthSession(data.token, data.user);
            showNotification(`Welcome back, ${data.user.username}!`, 'success');
            showView('dashboard');
        } else {
            showNotification(data.error || 'Login failed. Invalid credentials.', 'error');
        }
    } catch (error) {
        showNotification('Network error. Check if backend is running on port 5000.', 'error');
    }
}

/**
 * Handles user logout.
 */
function handleLogout() {
    clearAuthSession();
    showNotification('Logged out successfully.', 'success');
    showView('home');
}

// ====================================================================
// DASHBOARD & MEAL LOGGING LOGIC (API Calls)
// ====================================================================

/**
 * Sets up initial dashboard display elements.
 */
function setupDashboard() {
    document.getElementById('userName').textContent = CURRENT_USER.username;
    document.getElementById('currentDate').textContent = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    
    // Reset inputs on dashboard load
    document.getElementById('foodSearch').value = '';
    document.getElementById('mealType').value = '';
    document.getElementById('quantity').value = '';
    selectedFood = null;
}

/**
 * Fetches and renders all dashboard data (summary and logs).
 */
async function fetchDashboardData() {
    if (!AUTH_TOKEN) return showView('home');

    const date = getTodayDate();

    // 1. Fetch Summary
    const summaryResponse = await fetch(`${API_BASE_URL}/meals/summary?date=${date}`, {
        headers: { 'Authorization': `Bearer ${AUTH_TOKEN}` }
    });
    const summaryData = await summaryResponse.json();

    // 2. Fetch Logs
    const logsResponse = await fetch(`${API_BASE_URL}/meals/logs?date=${date}`, {
        headers: { 'Authorization': `Bearer ${AUTH_TOKEN}` }
    });
    let logsData = await logsResponse.json();

    if (!summaryResponse.ok || !logsResponse.ok) {
         showNotification('Error loading dashboard data.', 'error');
         logsData = []; // Fallback to empty
    }

    renderDashboard(summaryData, logsData);
}

/**
 * Renders the dashboard UI with data from the backend.
 * @param {object} summary - The nutritional summary object.
 * @param {Array} logs - The meal logs array.
 */
function renderDashboard(summary, logs) {
    const totalCalories = summary.total_calories ? Math.round(summary.total_calories) : 0;
    const totalProtein = summary.total_protein ? parseFloat(summary.total_protein).toFixed(1) : 0;
    const totalCarbs = summary.total_carbs ? parseFloat(summary.total_carbs).toFixed(1) : 0;
    const totalFat = summary.total_fat ? parseFloat(summary.total_fat).toFixed(1) : 0;

    // 1. Update Summary Stats
    document.getElementById('totalCalories').textContent = totalCalories;
    document.getElementById('totalProtein').textContent = totalProtein;
    document.getElementById('totalCarbs').textContent = totalCarbs;
    document.getElementById('totalFat').textContent = totalFat;

    // 2. Update Calorie Goal Progress Bar
    const goal = DAILY_CALORIE_GOAL;
    const percentage = Math.min(100, (totalCalories / goal) * 100).toFixed(0);
    const progressFill = document.getElementById('progressFill');
    const progressText = document.getElementById('progressText');
    
    progressFill.style.width = `${percentage}%`;
    document.getElementById('calorieProgress').textContent = percentage;
    
    if (percentage > 5) {
        progressText.textContent = `${totalCalories} kcal / ${goal} kcal`;
    } else {
        progressText.textContent = '';
    }
    
    progressFill.style.backgroundColor = totalCalories > goal ? 
        'var(--color-red-500)' : 'var(--color-primary)';


    // 3. Render Meals Table & 4. Chart Data Preparation
    const tableBody = document.getElementById('mealsTableBody');
    tableBody.innerHTML = '';
    const mealCalories = {};

    if (logs.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="9" class="empty-state">No meals logged today. Start tracking your nutrition!</td></tr>';
    } else {
        logs.forEach(log => {
            const calculatedCalories = Math.round(log.calories * log.quantity);
            const calculatedProtein = (log.protein * log.quantity).toFixed(1);
            const calculatedCarbs = (log.carbohydrates * log.quantity).toFixed(1);
            const calculatedFat = (log.fat * log.quantity).toFixed(1);

            mealCalories[log.meal_type] = (mealCalories[log.meal_type] || 0) + calculatedCalories;

            const row = tableBody.insertRow();
            row.innerHTML = `
                <td>${log.log_time.substring(0, 5)}</td>
                <td>${log.name}</td>
                <td><span class="meal-badge ${log.meal_type}">${log.meal_type}</span></td>
                <td>${log.quantity}</td>
                <td>${calculatedCalories}</td>
                <td>${calculatedProtein}g</td>
                <td>${calculatedCarbs}g</td>
                <td>${calculatedFat}g</td>
                <td><button class="btn-delete" onclick="deleteMealLog(${log.log_id})">Delete</button></td>
            `;
        });
    }
    
    // 5. Render Calorie Breakdown Chart
    renderCalorieChart(mealCalories);
}

/**
 * Handles live food search for the meal logger (API Call).
 * @param {string} query - The search term.
 */
const handleFoodSearch = debounce(async (query) => {
    const searchResults = document.getElementById('searchResults');
    searchResults.innerHTML = '';
    selectedFood = null; // Reset selection

    if (query.length < 2) {
        searchResults.style.display = 'none';
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/foods/search?name=${query}`);
        const matches = await response.json();

        if (matches.length > 0) {
            matches.slice(0, 5).forEach(food => {
                const item = document.createElement('div');
                item.className = 'search-result-item';
                item.textContent = food.name;
                item.onclick = () => selectFood(food);
                searchResults.appendChild(item);
            });
            searchResults.style.display = 'block';
        } else {
            searchResults.style.display = 'none';
        }
    } catch (error) {
        // console.error('Food search error:', error);
        searchResults.style.display = 'none';
    }
}, 300);

/**
 * Selects a food item from the search results.
 * @param {object} food - The selected food object.
 */
function selectFood(food) {
    selectedFood = food;
    document.getElementById('foodSearch').value = food.name;
    document.getElementById('searchResults').style.display = 'none';
}

/**
 * Handles logging a new meal (API Call).
 * @param {Event} event - The form submission event.
 */
async function handleMealLog(event) {
    event.preventDefault();

    if (!selectedFood) {
        showNotification('Please select a valid food item from the search results.', 'error');
        return;
    }
    if (!AUTH_TOKEN) return showView('home');

    const mealType = document.getElementById('mealType').value;
    const quantity = parseFloat(document.getElementById('quantity').value);

    if (!mealType || isNaN(quantity) || quantity <= 0) {
        showNotification('Please enter a valid meal type and serving size.', 'error');
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/meals/log`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${AUTH_TOKEN}`
            },
            body: JSON.stringify({ food_id: selectedFood.food_id, meal_type: mealType, quantity })
        });

        const data = await response.json();

        if (response.ok) {
            // Reset form and update dashboard
            document.getElementById('foodSearch').value = '';
            document.getElementById('mealType').value = '';
            document.getElementById('quantity').value = '';
            selectedFood = null;
            
            showNotification('Meal logged successfully!', 'success');
            await fetchDashboardData(); // Re-fetch data to update UI
        } else {
            showNotification(data.error || 'Failed to log meal.', 'error');
        }
    } catch (error) {
        showNotification('Network error. Failed to connect to backend.', 'error');
    }
}

/**
 * Handles deleting a meal log (API Call).
 * @param {number} logId - The ID of the log to delete.
 */
async function deleteMealLog(logId) {
    if (!AUTH_TOKEN || !confirm('Are you sure you want to delete this meal log?')) return;

    try {
        const response = await fetch(`${API_BASE_URL}/meals/logs/${logId}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${AUTH_TOKEN}` }
        });

        const data = await response.json();

        if (response.ok) {
            showNotification('Meal deleted successfully.', 'success');
            await fetchDashboardData(); // Re-fetch data to update UI
        } else {
            showNotification(data.error || 'Failed to delete meal log.', 'error');
        }
    } catch (error) {
        showNotification('Network error. Failed to connect to backend.', 'error');
    }
}

/**
 * Renders the calorie breakdown chart.
 * @param {object} mealCalories - Object containing calorie totals by meal type.
 */
function renderCalorieChart(mealCalories) {
    const chartContainer = document.getElementById('calorieChart');
    chartContainer.innerHTML = '';

    const mealTypes = ['breakfast', 'lunch', 'dinner', 'snacks'];
    const maxCalorie = Math.max(...Object.values(mealCalories), 1); 
    
    if (maxCalorie <= 1) { // Only the default 1 if nothing is logged
        chartContainer.innerHTML = '<div class="empty-state">Log a meal to see the chart.</div>';
        return;
    }

    mealTypes.forEach(type => {
        const calories = mealCalories[type] || 0;
        // Map 0-maxCalorie to a min-height of 10px up to 200px
        const height = calories === 0 ? 0 : Math.max(10, (calories / maxCalorie) * 200);
        
        const bar = document.createElement('div');
        bar.className = 'bar';
        bar.style.height = `${height}px`;
        bar.style.backgroundColor = calories === 0 ? 'var(--color-gray-300)' : ''; 
        
        if (calories > 0) {
            bar.textContent = calories;
        }

        const barWrapper = document.createElement('div');
        barWrapper.style.display = 'flex';
        barWrapper.style.flexDirection = 'column';
        barWrapper.style.alignItems = 'center';
        
        barWrapper.innerHTML = `
            ${bar.outerHTML}
            <div class="bar-label">${type.charAt(0).toUpperCase() + type.slice(1)}</div>
        `;
        chartContainer.appendChild(barWrapper);
    });
}


// ====================================================================
// FOOD DATABASE VIEW LOGIC (API Calls)
// ====================================================================

/**
 * Filters the displayed foods by region (sets state, triggers API call).
 * @param {string} region - The region to filter by ('All', 'North', etc.).
 */
function filterByRegion(region) {
    activeRegionFilter = region;
    
    // Update active class on filter buttons
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.textContent.includes(region) || (region === 'All' && btn.textContent.includes('All Regions'))) {
            btn.classList.add('active');
        }
    });

    renderFoodGrid();
}

/**
 * Debounced function to handle input on the food search page.
 */
const debounceFilterFoods = debounce(() => {
    currentSearchQuery = document.getElementById('foodSearchPage').value;
    renderFoodGrid();
}, 300);

/**
 * Fetches foods from the API based on current filters and renders the grid.
 */
async function renderFoodGrid() {
    const foodGrid = document.getElementById('foodGrid');
    foodGrid.innerHTML = '<div class="empty-state">Loading food data...</div>';

    let url = `${API_BASE_URL}/foods/search?name=${currentSearchQuery}`;
    if (activeRegionFilter !== 'All') {
        url += `&region=${activeRegionFilter}`;
    }

    try {
        const response = await fetch(url);
        const filteredFoods = await response.json();
        
        foodGrid.innerHTML = '';

        if (filteredFoods.length === 0) {
            foodGrid.innerHTML = `<div class="empty-state">No foods found matching the criteria.</div>`;
            return;
        }

        filteredFoods.forEach(food => {
            const card = document.createElement('div');
            card.className = 'food-card';
            card.innerHTML = `
                <div class="food-card-header">
                    <div class="food-name">${food.name}</div>
                    <div class="food-region">${food.region} Indian</div>
                </div>
                
                <div class="food-nutrients">
                    <div class="nutrient-row">
                        <span>🔥 **Calories (kcal)**</span>
                        <span>**${Math.round(food.calories)}**</span>
                    </div>
                    <div class="nutrient-row">
                        <span>💪 Protein (g)</span>
                        <span>${food.protein.toFixed(1)}</span>
                    </div>
                    <div class="nutrient-row">
                        <span>🍚 Carbs (g)</span>
                        <span>${food.carbohydrates.toFixed(1)}</span>
                    </div>
                    <div class="nutrient-row">
                        <span>🧈 Fat (g)</span>
                        <span>${food.fat.toFixed(1)}</span>
                    </div>
                </div>
                <button class="btn btn-primary btn-full" onclick="quickLog(${food.food_id}, '${food.name}')">Quick Log (1 Serving)</button>
            `;
            foodGrid.appendChild(card);
        });
    } catch (error) {
        foodGrid.innerHTML = `<div class="empty-state error">Error fetching food data. Check backend connection.</div>`;
    }
}

/**
 * Logs a single serving of a food item directly from the food search page (API Call).
 * @param {number} food_id - The ID of the food.
 * @param {string} foodName - The name of the food (for notification).
 */
async function quickLog(food_id, foodName) {
    if (!CURRENT_USER) {
        showNotification('Please log in to log a meal.', 'error');
        showView('login');
        return;
    }
    if (!AUTH_TOKEN) return showView('home');

    try {
        const response = await fetch(`${API_BASE_URL}/meals/log`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${AUTH_TOKEN}`
            },
            body: JSON.stringify({ food_id: food_id, meal_type: 'snacks', quantity: 1.0 })
        });

        const data = await response.json();

        if (response.ok) {
            showNotification(`${foodName} (1 serving) logged successfully!`, 'success');
            showView('dashboard');
        } else {
            showNotification(data.error || 'Failed to log meal.', 'error');
        }
    } catch (error) {
        showNotification('Network error. Failed to connect to backend.', 'error');
    }
}


// ====================================================================
// INITIALIZATION
// ====================================================================

/**
 * Initializes the application on load.
 */
function init() {
    if (AUTH_TOKEN && CURRENT_USER) {
        showView('dashboard');
    } else {
        showView('home');
    }
    updateNavBar();
}

// Ensure init runs when the page loads
window.onload = init;