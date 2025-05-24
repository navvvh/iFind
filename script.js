const container = document.getElementById("container");
const registerBtn = document.getElementById("register");
const loginBtn = document.getElementById("login");

// Role selection variables
let selectedUserRole = null;

registerBtn.addEventListener("click", () => {
  container.classList.add("active");
});

loginBtn.addEventListener("click", () => {
  container.classList.remove("active");
});

// Role selection functions
function showRoleSelection() {
    document.getElementById('roleSelectionModal').classList.add('show');
    document.body.style.overflow = 'hidden';
}

function selectRole(role) {
    selectedUserRole = role;
    
    // Reset all cards
    document.querySelectorAll('.role-card').forEach(card => {
        card.classList.remove('selected');
    });
    
    // Mark the selected card
    if (role === 'Student') {
        document.getElementById('studentCard').classList.add('selected');
    } else {
        document.getElementById('facultyCard').classList.add('selected');
    }
    
    // Enable continue button
    document.getElementById('continueBtn').disabled = false;
}

function confirmRole() {
    if (!selectedUserRole) return;
    
    // Hide role selection screen
    document.getElementById('roleSelectionScreen').style.display = 'none';
    
    // Update success message
    document.getElementById('welcomeMessage').textContent = `Welcome ${selectedUserRole}!`;
    document.getElementById('successMessage').textContent = 
        `Your account has been set up successfully. Set up now`;
    
    // Show success screen
    document.getElementById('successScreen').classList.add('show');
    
    // Save the role to the user data in localStorage
    const user = JSON.parse(localStorage.getItem('mockUser'));
    if (user) {
        user.role = selectedUserRole;
        localStorage.setItem('mockUser', JSON.stringify(user));
    }
    
    console.log(`User selected role: ${selectedUserRole}`);
}

function closeRoleModal() {
    document.getElementById('roleSelectionModal').classList.remove('show');
    document.body.style.overflow = 'auto';
    
    // Reset the modal for next use
    setTimeout(() => {
        document.getElementById('roleSelectionScreen').style.display = 'block';
        document.getElementById('successScreen').classList.remove('show');
        document.querySelectorAll('.role-card').forEach(card => {
            card.classList.remove('selected');
        });
        // continueBtn removed
        selectedUserRole = null;
    }, 300);
    
    // Switch to login form
    container.classList.remove('active');
}



// Close modal when clicking outside of it
document.getElementById('roleSelectionModal').addEventListener('click', function(e) {
    if (e.target === this) {
        closeRoleModal();
    }
});

// Updated signup form handler
document.querySelector('.sign-up form').addEventListener('submit', function(event) {
  event.preventDefault();

  const username = document.getElementById('signup-username').value;
  const email = document.getElementById('signup-email').value;
  const password = document.getElementById('signup-password').value;

  // Save user data to localStorage (without role initially)
  localStorage.setItem('mockUser', JSON.stringify({ username, email, password }));

  // Show role selection modal instead of alert
  showRoleSelection();
});

// Updated login form handler
document.querySelector('.sign-in form').addEventListener('submit', function(event) {
  event.preventDefault();

  const email = document.getElementById('login-email').value;
  const password = document.getElementById('login-password').value;

  const user = JSON.parse(localStorage.getItem('mockUser'));

  if (user && email === user.email && password === user.password) {
    alert('Login successful!');
    window.location.href = 'main.html'; 
  } else {
    alert('Invalid email or password');
  }
});