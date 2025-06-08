// Ultra simple script.js - no dependencies, direct API calls
console.log("Ultra simple script loaded")

// Wait for DOM to be fully loaded
document.addEventListener("DOMContentLoaded", () => {
  console.log("DOM fully loaded")

  // Get elements
  const container = document.getElementById("container")
  const registerBtn = document.getElementById("register")
  const loginBtn = document.getElementById("login")
  const signupForm = document.getElementById("signup-form")
  const loginForm = document.getElementById("login-form")

  console.log("Elements found:", {
    container: !!container,
    registerBtn: !!registerBtn,
    loginBtn: !!loginBtn,
    signupForm: !!signupForm,
    loginForm: !!loginForm,
  })

  // Toggle between sign up and sign in
  if (registerBtn) {
    registerBtn.addEventListener("click", (e) => {
      console.log("Register button clicked")
      e.preventDefault()
      container.classList.add("active")
    })
  }

  if (loginBtn) {
    loginBtn.addEventListener("click", (e) => {
      console.log("Login button clicked")
      e.preventDefault()
      container.classList.remove("active")
    })
  }

  // Handle signup form submission
  if (signupForm) {
    signupForm.addEventListener("submit", async (e) => {
      console.log("Signup form submitted")
      e.preventDefault()

      // Get form data
      const username = document.getElementById("signup-username").value.trim()
      const email = document.getElementById("signup-email").value.trim()
      const password = document.getElementById("signup-password").value

      console.log("Form data:", { username, email, passwordLength: password.length })

      // Basic validation
      if (!username || !email || !password) {
        alert("Please fill in all fields")
        return
      }

      try {
        console.log("Making API request")

        // Make API call directly
        const response = await fetch("http://localhost:3001/api/users", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            full_name: username,
            email: email,
            password: password,
            user_type: "Student",
          }),
        })

        console.log("API response status:", response.status)

        const data = await response.json()
        console.log("API response:", data)

        if (data.success) {
          console.log("User created successfully!")

          // Store user data
          localStorage.setItem(
            "ifindUserData",
            JSON.stringify({
              id: data.data.id,
              name: data.data.full_name,
              email: data.data.email,
              role: data.data.user_type.toLowerCase(),
              username: data.data.username,
              completedSetup: data.data.completed_setup,
            }),
          )

          // Show success message
          alert("Account created successfully!")

          // Reset form
          signupForm.reset()

          // Switch to login
          container.classList.remove("active")
        } else {
          console.error("API error:", data.error)
          alert("Error: " + (data.error || "Failed to create account"))
        }
      } catch (error) {
        console.error("Error:", error)
        alert("An error occurred: " + error.message)
      }
    })
  }

  // Handle login form submission
  if (loginForm) {
    loginForm.addEventListener("submit", async (e) => {
      console.log("Login form submitted")
      e.preventDefault()

      // Get form data
      const email = document.getElementById("login-email").value.trim()
      const password = document.getElementById("login-password").value

      // Basic validation
      if (!email || !password) {
        alert("Please fill in all fields")
        return
      }

      try {
        // Get all users
        const response = await fetch("http://localhost:3001/api/users")
        const data = await response.json()

        if (data.success) {
          const user = data.data.find((u) => u.email === email)

          if (user) {
            // Simple password check
            const storedUserData = localStorage.getItem("userData")
            let passwordMatch = false

            if (storedUserData) {
              const userData = JSON.parse(storedUserData)
              passwordMatch = userData.email === email && userData.password === password
            }

            if (passwordMatch) {
              // Store session data
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

              alert("Login successful!")

              // Redirect
              setTimeout(() => {
                if (user.completed_setup) {
                  window.location.href = "../html/main.html"
                } else {
                  window.location.href = "../html/setup.html"
                }
              }, 1000)
            } else {
              alert("Invalid username or password")
            }
          } else {
            alert("No account found. Please sign up first.")
          }
        } else {
          alert("Login failed. Please try again.")
        }
      } catch (error) {
        console.error("Error:", error)
        alert("An error occurred: " + error.message)
      }
    })
  }
})

// Make functions available globally
window.proceedToSetup = () => {
  const userData = JSON.parse(localStorage.getItem("ifindUserData") || "{}")

  if (userData.completedSetup) {
    window.location.href = "../html/main.html"
  } else {
    window.location.href = "../html/setup.html"
  }
}

window.closeErrorModal = () => {
  const errorModal = document.getElementById("error-modal")
  if (errorModal) {
    errorModal.classList.remove("show")
  }
}
