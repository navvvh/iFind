// DOM Elements
const nameInput = document.getElementById("nameInput")
const profileAvatar = document.getElementById("profileAvatar")
const roleOptions = document.querySelectorAll(".role-option")
const nextBtn = document.getElementById("nextBtn")
const progressBar = document.getElementById("progressBar")
const progressText = document.getElementById("progressText")
const avatarModal = document.getElementById("avatarModal")
const closeModalBtn = document.querySelector(".close-modal")
const cancelBtn = document.querySelector(".cancel-btn")
const saveBtn = document.querySelector(".save-btn")
const avatarOptions = document.querySelectorAll(".avatar-option")

// API URL
const API_URL = "http://localhost:3001/api"

// Setup Data - track user interactions separately
const setupData = {
  name: "",
  avatar: "👤",
  role: "", // No default role
  avatarId: null,
  uploadedImage: null,
}

// Track user interactions for progress calculation
const userInteractions = {
  nameChanged: false,
  avatarChanged: false,
  roleConfirmed: false,
}

// Progress Tracking
let progress = 0
updateProgress()

// Get current user data
function getCurrentUserData() {
  const ifindUserData = JSON.parse(localStorage.getItem("ifindUserData")) || {}
  const userData = JSON.parse(localStorage.getItem("userData")) || {}
  const sessionData = JSON.parse(localStorage.getItem("userSession")) || {}

  return {
    id: ifindUserData.id || null,
    name: ifindUserData.name || userData.username || sessionData.username || "",
    email: ifindUserData.email || userData.email || sessionData.email || "",
    role: ifindUserData.role || "",
    completedSetup: ifindUserData.completedSetup || false,
  }
}

// Scroll Animation Implementation
document.addEventListener("DOMContentLoaded", () => {
  // Add scroll-reveal class to elements we want to animate
  const header = document.querySelector(".header")
  const heroSection = document.querySelector(".hero-section")
  const setupSteps = document.querySelectorAll(".setup-step")

  if (header) header.classList.add("delay-100")
  if (heroSection) heroSection.classList.add("delay-200")

  // Add staggered delays to setup steps
  setupSteps.forEach((step, index) => {
    step.classList.add("delay-" + (index + 3) * 100)
  })

  // Initialize Intersection Observer
  const observerOptions = {
    threshold: 0.1,
    rootMargin: "0px 0px -50px 0px",
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible")
      }
    })
  }, observerOptions)

  // Observe scroll-reveal elements
  document.querySelectorAll(".scroll-reveal").forEach((element) => {
    observer.observe(element)
  })

  // Observe setup steps
  document.querySelectorAll(".setup-step").forEach((step) => {
    observer.observe(step)
  })

  // Load existing data
  loadExistingData()
})

// 3D hover effects
document.querySelectorAll(".element-3d").forEach((element) => {
  element.addEventListener("mousemove", (e) => {
    const rect = element.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    const centerX = rect.width / 2
    const centerY = rect.height / 2
    const rotateX = (y - centerY) / 10
    const rotateY = (centerX - x) / 10

    const container = element.querySelector(".avatar-container")
    if (container) {
      container.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`
    }
  })

  element.addEventListener("mouseleave", () => {
    const container = element.querySelector(".avatar-container")
    if (container) {
      container.style.transform = "rotateX(0deg) rotateY(0deg)"
    }
  })
})

// Name input event listener - track user changes
nameInput.addEventListener("input", function () {
  setupData.name = this.value.trim()

  // Only mark as changed if user actually typed something different from the pre-filled value
  const originalName = getOriginalUserName()
  userInteractions.nameChanged = setupData.name !== "" && setupData.name !== originalName

  updateProgress()
  saveProgressData()
})

// Enhanced avatar click handler
profileAvatar.addEventListener("click", (e) => {
  e.preventDefault()
  e.stopPropagation()

  setTimeout(() => {
    avatarOptions.forEach((opt) => {
      opt.classList.remove("selected")
      opt.style.transform = ""
      opt.style.borderColor = ""
    })

    avatarModal.classList.add("active")
    document.body.style.overflow = "hidden"
  }, 100)
})

// Modal close handlers
closeModalBtn.addEventListener("click", (e) => {
  e.preventDefault()
  e.stopPropagation()
  closeModal()
})

cancelBtn.addEventListener("click", (e) => {
  e.preventDefault()
  e.stopPropagation()
  closeModal()
})

// Close modal when clicking outside
avatarModal.addEventListener("click", (e) => {
  if (e.target === avatarModal) {
    closeModal()
  }
})

// Avatar option selection
avatarOptions.forEach((option) => {
  option.addEventListener("click", function (e) {
    e.preventDefault()
    e.stopPropagation()

    avatarOptions.forEach((opt) => {
      opt.classList.remove("selected")
      opt.style.transform = ""
      opt.style.borderColor = ""
    })

    this.classList.add("selected")
    this.style.transform = "scale(1.1)"
    this.style.borderColor = "#4CAF50"

    setupData.tempAvatar = this.textContent
    setupData.tempAvatarId = this.dataset.avatar
  })
})

// Save button handler
saveBtn.addEventListener("click", (e) => {
  e.preventDefault()
  e.stopPropagation()

  const selectedAvatar = document.querySelector(".avatar-option.selected")
  const avatarBase = profileAvatar.querySelector(".avatar-base")

  if (selectedAvatar) {
    avatarBase.innerHTML = selectedAvatar.textContent
    setupData.avatar = selectedAvatar.textContent
    setupData.avatarId = selectedAvatar.dataset.avatar
    setupData.uploadedImage = null
    userInteractions.avatarChanged = true
    updateProgress()
    closeModal()
  } else {
    closeModal()
  }
})

// Role selection
roleOptions.forEach((option) => {
  option.addEventListener("click", function () {
    roleOptions.forEach((opt) => opt.classList.remove("selected"))
    this.classList.add("selected")

    setupData.role = this.dataset.role
    userInteractions.roleConfirmed = true
    updateProgress()
    saveProgressData()
  })
})

nextBtn.addEventListener("click", completeSetup)

// Functions
function closeModal() {
  avatarModal.classList.remove("active")
  document.body.style.overflow = "auto"
}

// Progress calculation based on actual user interactions
function updateProgress() {
  progress = 0
  let completedSteps = 0

  if (userInteractions.nameChanged || (setupData.name && setupData.name !== getOriginalUserName())) {
    progress += 33.33
    completedSteps++
  }

  if (userInteractions.avatarChanged) {
    progress += 33.33
    completedSteps++
  }

  if (userInteractions.roleConfirmed) {
    progress += 33.34
    completedSteps++
  }

  const progressBar = document.getElementById("progressBar")
  if (progressBar) {
    progressBar.style.height = `${progress}%`
  }

  const progressText = document.getElementById("progressText")
  if (progressText) {
    const displayProgress = Math.round(progress / 25) * 25
    progressText.textContent = `${displayProgress}%`
  }

  updateStepIndicators(completedSteps)

  const hasAnyInteraction =
    userInteractions.nameChanged || userInteractions.avatarChanged || userInteractions.roleConfirmed
  nextBtn.disabled = !hasAnyInteraction

  saveProgressData()
}

function updateStepIndicators(completedSteps) {
  const steps = document.querySelectorAll(".progress-step")

  steps.forEach((step, index) => {
    const stepNumber = index + 1
    step.classList.remove("active", "completed")

    if (stepNumber <= completedSteps) {
      step.classList.add("completed")
    } else if (stepNumber === completedSteps + 1) {
      step.classList.add("active")
    }
  })
}

function saveProgressData() {
  const progressData = {
    setupData: { ...setupData },
    userInteractions: { ...userInteractions },
    timestamp: new Date().toISOString(),
  }
  localStorage.setItem("setupProgress", JSON.stringify(progressData))
}

function loadProgressData() {
  const progressData = JSON.parse(localStorage.getItem("setupProgress"))
  if (progressData) {
    Object.assign(setupData, progressData.setupData)
    Object.assign(userInteractions, progressData.userInteractions)
  }
}

function getOriginalUserName() {
  const currentUserData = getCurrentUserData()
  return currentUserData.name || ""
}

function prefillUserData() {
  const originalName = getOriginalUserName()

  if (originalName && !setupData.name) {
    nameInput.value = originalName
    setupData.name = originalName
    userInteractions.nameChanged = false
  }
}

// Enhanced completeSetup function with API integration
async function completeSetup() {
  const currentUserData = getCurrentUserData()

  if (!currentUserData.id) {
    alert("User ID not found. Please log in again.")
    window.location.href = "login.html"
    return
  }

  try {
    // Update user in database
    const response = await fetch(`${API_URL}/users/${currentUserData.id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        full_name: setupData.name,
        user_type: setupData.role,
        completed_setup: true,
      }),
    })

    const data = await response.json()

    if (data.success) {
      // Update localStorage with new data
      const updatedUserData = {
        id: data.data.id,
        name: data.data.full_name,
        email: data.data.email,
        role: data.data.user_type.toLowerCase(),
        username: data.data.username,
        completedSetup: data.data.completed_setup,
        avatar: setupData.uploadedImage,
        avatarId: setupData.avatarId,
        avatarEmoji: setupData.avatar,
      }

      // Store in multiple localStorage keys for compatibility
      localStorage.setItem("ifindUserData", JSON.stringify(updatedUserData))

      const userProfile = {
        name: updatedUserData.name,
        username: `@${updatedUserData.username}`,
        email: updatedUserData.email,
        role: updatedUserData.role.toUpperCase(),
        avatar: updatedUserData.avatar,
        avatarId: updatedUserData.avatarId,
        avatarEmoji: updatedUserData.avatarEmoji,
        contact: `fb.com/${updatedUserData.username.toLowerCase()}`,
        completedSetup: true,
        setupDate: new Date().toISOString(),
        initials: updatedUserData.name
          .split(" ")
          .map((n) => n[0])
          .join("")
          .toUpperCase()
          .substring(0, 2),
      }

      localStorage.setItem("userProfile", JSON.stringify(userProfile))

      // Initialize empty posts array if it doesn't exist
      if (!localStorage.getItem("userPosts")) {
        localStorage.setItem("userPosts", JSON.stringify([]))
      }

      // Show setup completion message
      const Swal = window.Swal // Declare Swal variable
      if (Swal) {
        await Swal.fire({
          title: "Setup Complete!",
          icon: "success",
          confirmButtonText: "Continue to iFind",
          confirmButtonColor: "#4CAF50",
          customClass: {
            popup: "custom-setup-complete-popup",
            title: "custom-setup-title",
            confirmButton: "custom-confirm-button",
          },
          width: 400,
          padding: "2em",
          background: "#fff",
          backdrop: "rgba(5, 35, 77, 0.8)",
        })
      } else {
        alert("Setup Complete!")
      }

      // Redirect to main page
      window.location.href = "main.html"
    } else {
      console.error("Failed to complete setup:", data.error)
      alert("Failed to complete setup: " + data.error)
    }
  } catch (error) {
    console.error("Error completing setup:", error)
    alert("An error occurred while completing setup. Please try again.")
  }
}

function loadExistingData() {
  prefillUserData()
  loadProgressData()
}

// Initialize step indicators and add enhanced role selection functionality on page load
document.addEventListener("DOMContentLoaded", () => {
  updateStepIndicators(0)

  // Enhanced role selection functionality
  roleOptions.forEach((option) => {
    option.addEventListener("mouseenter", function () {
      if (!this.classList.contains("selected")) {
        this.style.transform = "translateY(-8px) scale(1.05)"
      }
    })

    option.addEventListener("mouseleave", function () {
      if (!this.classList.contains("selected")) {
        this.style.transform = "translateY(0) scale(1)"
      }
    })

    // Add a subtle animation to confirm selection when clicked
    option.addEventListener("click", function () {
      this.style.animation = "none"
      setTimeout(() => {
        this.style.animation = "popIn 0.3s ease forwards"
      }, 10)
    })
  })

  // Load existing data
  loadExistingData()
})

// Storage event listener to handle setup data changes
window.addEventListener("storage", (e) => {
  if (e.key === "userProfile" || e.key === "ifindUserData") {
    loadExistingData()
  }
})
