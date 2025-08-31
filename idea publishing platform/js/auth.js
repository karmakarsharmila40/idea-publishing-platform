// Auth-related functions

// Register a new user
async function registerUser(username, email, password) {
  try {
    const data = await apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ username, email, password })
    });
    
    setToken(data.token);
    return data;
  } catch (error) {
    throw error;
  }
}

// Login user
async function loginUser(email, password) {
  try {
    const data = await apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
    
    setToken(data.token);
    return data;
  } catch (error) {
    throw error;
  }
}

// Logout user
function logoutUser() {
  removeToken();
  window.location.href = 'index.html';
}

// Get current user profile
async function getCurrentUser() {
  try {
    if (!isAuthenticated()) {
      return null;
    }
    
    return await apiRequest('/auth/user');
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
}

// Update UI based on authentication state
async function updateAuthUI() {
  const authLinks = document.getElementById('authLinks');
  const userInfo = document.getElementById('userInfo');
  
  if (!authLinks || !userInfo) return;
  
  if (isAuthenticated()) {
    try {
      const user = await getCurrentUser();
      
      if (user) {
        authLinks.innerHTML = `
          <button id="logoutBtn" class="auth-btn">Logout</button>
        `;
        
        userInfo.innerHTML = `
          <span>Welcome, ${user.username}</span>
          <a href="profile.html" class="profile-link">My Profile</a>
        `;
        
        document.getElementById('logoutBtn').addEventListener('click', logoutUser);
      } else {
        // Token invalid
        removeToken();
        showAuthButtons();
      }
    } catch (error) {
      console.error('Error updating auth UI:', error);
      removeToken();
      showAuthButtons();
    }
  } else {
    showAuthButtons();
  }
}

// Show login/register buttons
function showAuthButtons() {
  const authLinks = document.getElementById('authLinks');
  const userInfo = document.getElementById('userInfo');
  
  if (!authLinks || !userInfo) return;
  
  authLinks.innerHTML = `
    <button id="loginBtn" class="auth-btn">Login</button>
    <button id="registerBtn" class="auth-btn">Register</button>
  `;
  
  userInfo.innerHTML = '';
  
  document.getElementById('loginBtn').addEventListener('click', () => {
    window.location.href = 'login.html';
  });
  
  document.getElementById('registerBtn').addEventListener('click', () => {
    window.location.href = 'register.html';
  });
}