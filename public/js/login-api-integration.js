// Example of how to integrate the API with your login/signup functionality

// Declare variables before using them
const iFindAPI = window.iFindAPI // Assuming iFindAPI is available globally
const Swal = window.Swal // Assuming Swal is available globally
const container = document.getElementById("container") // Assuming container is an element with id "container"

function showErrorModal(message) {
  Swal.fire({
    icon: "error",
    title: "Oops...",
    text: message,
  })
}

function showWelcomeModal() {
  Swal.fire({
    icon: "success",
    title: "Welcome!",
    text: "You have successfully logged in.",
  })
}

// Update the signup form handler to use the API
document.getElementById("signup-form").addEventListener("submit", async (event) => {
  event.preventDefault()

  const username = document.getElementById("signup-username").value.trim()
  const email = document.getElementById("signup-email").value.trim()
  const password = document.getElementById("signup-password").value

  // Basic validation
  if (!username || !email || !password) {
    showErrorModal("Please fill in all fields")
    return
  }

  if (password.length < 6) {
    showErrorModal("Password must be at least 6 characters long")
    return
  }

  // Email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    showErrorModal("Please enter a valid email address")
    return
  }

  try {
    // Call the API to create a user
    const response = await iFindAPI.User.createUser({
      full_name: username,
      email: email,
      password: password,
      user_type: "Student", // Default user type
    })

    if (response.success) {
      // Store user data in localStorage for session management
      localStorage.setItem(
        "ifindUserData",
        JSON.stringify({
          id: response.data.id,
          name: response.data.full_name,
          email: response.data.email,
          role: response.data.user_type.toLowerCase(),
          username: response.data.username,
          completedSetup: response.data.completed_setup,
        }),
      )

      // Show success notification
      await Swal.fire({
        position: "top-end",
        icon: "success",
        title: "Account created successfully!",
        showConfirmButton: false,
        timer: 1500,
        toast: true,
        background: "#fff",
        color: "#0a2342",
        iconColor: "#28a745",
      })

      // Switch to login form after the alert
      container.classList.remove("active")

      // Clear signup form
      document.getElementById("signup-form").reset()
    } else {
      showErrorModal(response.error || "Failed to create account")
    }
  } catch (error) {
    console.error("Error creating user:", error)
    showErrorModal("An error occurred. Please try again later.")
  }
})

// Login form handler with API integration
document.getElementById("login-form").addEventListener("submit", async (event) => {
  event.preventDefault()

  const email = document.getElementById("login-email").value.trim()
  const password = document.getElementById("login-password").value

  // Basic validation
  if (!email || !password) {
    showErrorModal("Please fill in all fields")
    return
  }

  try {
    // Note: You'll need to add a login endpoint to your API
    // For now, we'll simulate it by getting all users and finding a match
    const response = await iFindAPI.User.getAllUsers()

    if (response.success) {
      const user = response.data.find((u) => u.email === email)

      if (user) {
        // In a real app, you would verify the password on the server
        // This is just for demonstration purposes

        // Store user data in localStorage for session management
        localStorage.setItem(
          "ifindUserData",
          JSON.stringify({
            id: user.id,
            name: user.full_name,
            email: user.email,
            role: user.user_type.toLowerCase(),
            username: user.username,
            completedSetup: user.completed_setup,
          }),
        )

        // Show welcome modal
        showWelcomeModal()

        // Clear login form
        document.getElementById("login-form").reset()
      } else {
        showErrorModal("Invalid email or password")
      }
    } else {
      showErrorModal("Login failed. Please try again.")
    }
  } catch (error) {
    console.error("Error during login:", error)
    showErrorModal("An error occurred. Please try again later.")
  }
})
