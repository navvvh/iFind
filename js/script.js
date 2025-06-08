const container = document.getElementById("container")
const registerBtn = document.getElementById("register")
const loginBtn = document.getElementById("login")
const welcomeModal = document.getElementById("welcome-modal")
const errorModal = document.getElementById("error-modal")

// Toggle between sign up and sign in
registerBtn.addEventListener("click", (e) => { 
  e.preventDefault()
  container.classList.add("active")
})

loginBtn.addEventListener("click", (e) => {
  e.preventDefault()
  container.classList.remove("active")
})

// Error modal functions
function showErrorModal(message = "Invalid username or password") {
  const errorMessage = document.querySelector(".error-message")
  errorMessage.textContent = message
  errorModal.classList.add("show")
}

function closeErrorModal() {
  errorModal.classList.remove("show")
}

// Close error modal when clicking outside
errorModal.addEventListener("click", (event) => {
  if (event.target === errorModal) {
    closeErrorModal()
  }
})

// Add the syncUserData function to script.js
function syncUserData(updatedData = {}) {
  // Get current data from all sources
  const userProfile = JSON.parse(localStorage.getItem("userProfile")) || {}
  const ifindUserData = JSON.parse(localStorage.getItem("ifindUserData")) || {}
  const mockUser = JSON.parse(localStorage.getItem("mockUser")) || {}
  const userData = JSON.parse(localStorage.getItem("userData")) || {}
  const sessionData = JSON.parse(localStorage.getItem("userSession")) || {}

  // Create updated userProfile (main source of truth)
  const newUserProfile = {
    ...userProfile,
    ...updatedData,
    name:
      updatedData.name ||
      userProfile.name ||
      ifindUserData.name ||
      mockUser.username ||
      userData.username ||
      sessionData.username,
    username:
      updatedData.username ||
      userProfile.username ||
      ifindUserData.name?.toLowerCase().replace(/\s+/g, "") ||
      mockUser.username ||
      userData.username ||
      sessionData.username,
    email: updatedData.email || userProfile.email || mockUser.email || userData.email || sessionData.email,
    role: updatedData.role || userProfile.role || ifindUserData.role?.toUpperCase() || mockUser.role,
    avatar: updatedData.avatar !== undefined ? updatedData.avatar : userProfile.avatar || mockUser.avatar,
    avatarId:
      updatedData.avatarId !== undefined
        ? updatedData.avatarId
        : userProfile.avatarId || ifindUserData.avatarId || mockUser.avatarId,
    avatarEmoji:
      updatedData.avatarEmoji !== undefined ? updatedData.avatarEmoji : userProfile.avatarEmoji || ifindUserData.avatar,
    completedSetup:
      updatedData.completedSetup !== undefined
        ? updatedData.completedSetup
        : userProfile.completedSetup || Boolean(ifindUserData.name && ifindUserData.role),
    lastUpdated: new Date().toISOString(),
  }

  // Generate initials if name exists
  if (newUserProfile.name) {
    newUserProfile.initials = newUserProfile.name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2)
  }

  // Format username with @ if needed
  if (newUserProfile.username && !newUserProfile.username.startsWith("@")) {
    newUserProfile.username = "@" + newUserProfile.username
  }

  // Update userProfile (main source of truth)
  localStorage.setItem("userProfile", JSON.stringify(newUserProfile))

  // Update ifindUserData
  const newIfindUserData = {
    ...ifindUserData,
    name: newUserProfile.name,
    role: newUserProfile.role?.toLowerCase(),
    avatar: newUserProfile.avatarEmoji,
    avatarId: newUserProfile.avatarId,
    uploadedImage: newUserProfile.avatar,
  }
  localStorage.setItem("ifindUserData", JSON.stringify(newIfindUserData))

  // Update mockUser
  const newMockUser = {
    ...mockUser,
    username: newUserProfile.username.replace("@", ""),
    email: newUserProfile.email,
    role: newUserProfile.role,
    avatar: newUserProfile.avatar,
    avatarId: newUserProfile.avatarId,
    avatarEmoji: newUserProfile.avatarEmoji,
  }
  localStorage.setItem("mockUser", JSON.stringify(newMockUser))

  // Update userData
  const newUserData = {
    ...userData,
    username: newUserProfile.username.replace("@", ""),
    email: newUserProfile.email,
  }
  localStorage.setItem("userData", JSON.stringify(newUserData))

  // Update userSession
  const newSessionData = {
    ...sessionData,
    username: newUserProfile.username.replace("@", ""),
    email: newUserProfile.email,
    profileComplete: true,
    lastUpdated: new Date().toISOString(),
  }
  localStorage.setItem("userSession", JSON.stringify(newSessionData))

  // Update all existing posts with new user information
  const allPosts = JSON.parse(localStorage.getItem("userPosts")) || []
  const updatedPosts = allPosts.map((post) => {
    if (post.userId === "current_user") {
      return {
        ...post,
        userName: newUserProfile.name,
        userHandle: newUserProfile.username,
        userRole: newUserProfile.role,
        userInitials: newUserProfile.initials,
        avatar: newUserProfile.avatar,
        avatarId: newUserProfile.avatarId,
        avatarEmoji: newUserProfile.avatarEmoji,
      }
    }
    return post
  })
  localStorage.setItem("userPosts", JSON.stringify(updatedPosts))

  // Dispatch storage event to notify other pages
  window.dispatchEvent(new Event("storage"))

  return newUserProfile
}

// Update the signup form handler to use SweetAlert2
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

  // Store user data using the centralized function
  syncUserData({
    username: username,
    email: email,
    completedSetup: false,
    signupDate: new Date().toISOString(),
  })

  // Also store password in userData for login verification
  const userData = JSON.parse(localStorage.getItem("userData")) || {}
  userData.password = password
  localStorage.setItem("userData", JSON.stringify(userData))

  // Show SweetAlert2 success notification
  await Swal.fire({
    position: "top-end",
    icon: "success",
    title: "Your work has been saved",
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
})

// Login form handler
document.getElementById("login-form").addEventListener("submit", (event) => {
  event.preventDefault()

  const email = document.getElementById("login-email").value.trim()
  const password = document.getElementById("login-password").value

  // Basic validation - only show error modal for actual validation issues
  if (!email || !password) {
    showErrorModal("Please fill in all fields")
    return
  }

  // Get stored user data
  const storedUserData = localStorage.getItem("userData")

  if (storedUserData) {
    const userData = JSON.parse(storedUserData)

    if (email === userData.email && password === userData.password) {
      // Successful login - show welcome modal
      showWelcomeModal()
      // Clear login form
      document.getElementById("login-form").reset()
    } else {
      // Show error modal only for wrong credentials
      showErrorModal("Invalid username or password")
    }
  } else {
    // Show error modal for no account found
    showErrorModal("No account found. Please sign up first.")
  }
})

// Show welcome modal function
function showWelcomeModal() {
  welcomeModal.classList.add("show")
}

// Proceed to setup/main application
function proceedToSetup() {
  // Redirect to setup page
  window.location.href = "../html/setup.html"
}

// Hide welcome modal if clicked outside
welcomeModal.addEventListener("click", (event) => {
  if (event.target === welcomeModal) {
    welcomeModal.classList.remove("show")
  }
})
