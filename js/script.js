const container = document.getElementById("container");
    const registerBtn = document.getElementById("register");
    const loginBtn = document.getElementById("login");
    const welcomeModal = document.getElementById("welcome-modal");

    // Toggle between sign up and sign in
    registerBtn.addEventListener("click", (e) => {
      e.preventDefault();
      container.classList.add("active");
    });

    loginBtn.addEventListener("click", (e) => {
      e.preventDefault();
      container.classList.remove("active");
    });

    // Sign up form handler
    document.getElementById('signup-form').addEventListener('submit', function(event) {
      event.preventDefault();

      const username = document.getElementById('signup-username').value;
      const email = document.getElementById('signup-email').value;
      const password = document.getElementById('signup-password').value;

      // Basic validation
      if (!username || !email || !password) {
        alert('Please fill in all fields');
        return;
      }

      if (password.length < 6) {
        alert('Password must be at least 6 characters long');
        return;
      }

      // Store user data in localStorage
      const userData = {
        username: username,
        email: email,
        password: password,
        signupDate: new Date().toISOString()
      };

      localStorage.setItem('userData', JSON.stringify(userData));
      
      // Show success message and switch to login
      alert('Account created successfully! Please log in.');
      container.classList.remove("active"); // Switch to login form
      
      // Clear signup form
      document.getElementById('signup-form').reset();
    });

    // Login form handler
    document.getElementById('login-form').addEventListener('submit', function(event) {
      event.preventDefault();

      const email = document.getElementById('login-email').value;
      const password = document.getElementById('login-password').value;

      // Get stored user data
      const storedUserData = localStorage.getItem('userData');

      if (storedUserData) {
        const userData = JSON.parse(storedUserData);

        if (email === userData.email && password === userData.password) {
          // Successful login - show welcome modal
          showWelcomeModal();
        } else {
          alert('Invalid email or password');
        }
      } else {
        alert('No account found. Please sign up first.');
      }
    });

    // Show welcome modal function
    function showWelcomeModal() {
      welcomeModal.classList.add('show');
    }

    // Proceed to setup/main application
    function proceedToSetup() {
      // Redirect to setup page
      window.location.href = '../html/setup.html';
    }

    // Hide welcome modal if clicked outside
    welcomeModal.addEventListener('click', function(event) {
      if (event.target === welcomeModal) {
        welcomeModal.classList.remove('show');
      }
    });