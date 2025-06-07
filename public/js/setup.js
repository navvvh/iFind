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

// Enhanced avatar click handler - Fixed to prevent immediate closing
profileAvatar.addEventListener("click", (e) => {
  e.preventDefault()
  e.stopPropagation()

  // Add a small delay to prevent immediate closing
  setTimeout(() => {
    // Clear any previous selections
    avatarOptions.forEach((opt) => {
      opt.classList.remove("selected")
      opt.style.transform = ""
      opt.style.borderColor = ""
    })

    // Show modal
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

// Avatar option selection - Fixed to maintain selection
avatarOptions.forEach((option) => {
  option.addEventListener("click", function (e) {
    e.preventDefault()
    e.stopPropagation()

    // Update selection - ensure only one is selected
    avatarOptions.forEach((opt) => {
      opt.classList.remove("selected")
      opt.style.transform = ""
      opt.style.borderColor = ""
    })

    this.classList.add("selected")
    this.style.transform = "scale(1.1)"
    this.style.borderColor = "#4CAF50"

    // Store temporary selection
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
    // User selected an emoji avatar
    avatarBase.innerHTML = selectedAvatar.textContent
    setupData.avatar = selectedAvatar.textContent
    setupData.avatarId = selectedAvatar.dataset.avatar
    setupData.uploadedImage = null
    userInteractions.avatarChanged = true
    updateProgress()
    closeModal()
  } else {
    // No selection made, just close modal
    closeModal()
  }
})

// Role selection - NO DEFAULT SELECTION, track user confirmation
roleOptions.forEach((option) => {
  option.addEventListener("click", function () {
    // Remove selected class from all options
    roleOptions.forEach((opt) => opt.classList.remove("selected"))

    // Add selected class to clicked option
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

  // Only count progress for actual user interactions
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

  // Update vertical progress bar
  const progressBar = document.getElementById("progressBar")
  if (progressBar) {
    progressBar.style.height = `${progress}%`
  }

  // Update progress text with exact percentage
  const progressText = document.getElementById("progressText")
  if (progressText) {
    // Round to nearest 25% increment to match the image
    const displayProgress = Math.round(progress / 25) * 25
    progressText.textContent = `${displayProgress}%`
  }

  // Update step indicators
  updateStepIndicators(completedSteps)

  // Enable next button when user has made at least one change
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

// Get original username from signup/login data
function getOriginalUserName() {
  const userData = JSON.parse(localStorage.getItem("userData")) || {}
  const sessionData = JSON.parse(localStorage.getItem("userSession")) || {}
  return userData.username || sessionData.username || ""
}

// Pre-fill name from signup data
function prefillUserData() {
  const originalName = getOriginalUserName()

  if (originalName && !setupData.name) {
    nameInput.value = originalName
    setupData.name = originalName
    // Don't mark as changed since this is just pre-filling
    userInteractions.nameChanged = false
  }
}

// Enhanced completeSetup function with proper completion message
async function completeSetup() {
  const existingSession = JSON.parse(localStorage.getItem("userSession")) || {}
  const existingUserData = JSON.parse(localStorage.getItem("userData")) || {}

  const completeUserProfile = {
    name: setupData.name,
    username: existingSession.username || existingUserData.username || setupData.name.toLowerCase().replace(/\s+/g, ""),
    email: existingSession.email || existingUserData.email || "",
    role: setupData.role.toUpperCase(),
    avatar: setupData.uploadedImage,
    avatarId: setupData.avatarId,
    avatarEmoji: setupData.avatar,
    contact: `fb.com/${(existingSession.username || existingUserData.username || setupData.name.toLowerCase().replace(/\s+/g, "")).toLowerCase()}`,
    completedSetup: true,
    setupDate: new Date().toISOString(),
    initials: setupData.name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2),
  }

  // Use the centralized data synchronization function
  syncUserData(completeUserProfile)

  if (!localStorage.getItem("userPosts")) {
    localStorage.setItem("userPosts", JSON.stringify([]))
  }

  // Show simplified setup completion message
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

  // Redirect to main page
  window.location.href = "main.html"
}

// Add the syncUserData function to setup.js
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

// Enhance the storage event listener to use the new syncUserData function
window.addEventListener("storage", (e) => {
  if (e.key === "userProfile" || e.key === "ifindUserData") {
    loadExistingData()
  }
})

function loadExistingData() {
  prefillUserData()
  loadProgressData()
}

// Initialize step indicators and add enhanced role selection functionality on page load
document.addEventListener("DOMContentLoaded", () => {
  updateStepIndicators(0)

  // Enhanced role selection functionality
  roleOptions.forEach((option) => {
    // Enhanced hover effects
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