// DOM Elements
const hamburgerMenu = document.getElementById("hamburger-menu")
const sidebar = document.getElementById("sidebar")
const addPostBtn = document.getElementById("add-post-btn")
const postModal = document.getElementById("post-modal")
const filterModal = document.getElementById("filter-modal")
const closeModal = document.getElementById("close-modal")
const closeFilterModal = document.getElementById("close-filter-modal")
const cancelPost = document.getElementById("cancel-post")
const postForm = document.getElementById("post-form")
const feed = document.getElementById("feed")
const emptyState = document.getElementById("empty-state")
const fileInput = document.getElementById("post-image")
const fileName = document.getElementById("file-name")
const filterBtn = document.getElementById("filter-btn")
const searchInput = document.getElementById("search-input")
const clearFiltersBtn = document.getElementById("clear-filters")
const applyFiltersBtn = document.getElementById("apply-filters")
const navProfile = document.getElementById("nav-profile")
const navAbout = document.getElementById("nav-about")
const navClaimed = document.getElementById("nav-claimed")
const navLogout = document.getElementById("nav-logout")

// Notification and Announcement Elements
const notificationBell = document.getElementById("notification-bell")
const notificationDropdown = document.getElementById("notification-dropdown")
const announcementIcon = document.getElementById("announcement-icon")
const announcementDropdown = document.getElementById("announcement-dropdown")
const markAllRead = document.getElementById("mark-all-read")
const notificationCount = document.getElementById("notification-count")

// Debug function to check localStorage
function debugLocalStorage(message) {
  console.log("DEBUG " + message + ":", {
    userProfile: JSON.parse(localStorage.getItem("userProfile") || "null"),
    mockUser: JSON.parse(localStorage.getItem("mockUser") || "null"),
    ifindUserData: JSON.parse(localStorage.getItem("ifindUserData") || "null"),
  })
}

// Store all posts for filtering
let allPosts = []
const currentFilters = {
  types: [],
  locations: [],
}

// Track if we're editing a post
let editingPostId = null

// Notification functionality - Start with 0 notifications
let unreadNotifications = 0

// Load posts from localStorage on page load
function loadPostsFromStorage() {
  const storedPosts = localStorage.getItem("userPosts")
  if (storedPosts) {
    allPosts = JSON.parse(storedPosts)
    filterPosts()
  }
}

// Save posts to localStorage
function savePostsToStorage() {
  localStorage.setItem("userPosts", JSON.stringify(allPosts))
}

// UPDATED: Enhanced getCurrentUser function with setup data synchronization
function getCurrentUser() {
  // Priority order: userProfile > ifindUserData > mockUser > userData > userSession
  const userProfile = JSON.parse(localStorage.getItem("userProfile")) || {}
  const ifindUserData = JSON.parse(localStorage.getItem("ifindUserData")) || {}
  const mockUser = JSON.parse(localStorage.getItem("mockUser")) || {}
  const userData = JSON.parse(localStorage.getItem("userData")) || {}
  const sessionData = JSON.parse(localStorage.getItem("userSession")) || {}

  // Create unified user object with proper fallback chain
  const user = {
    name:
      userProfile.name || ifindUserData.name || mockUser.username || userData.username || sessionData.username || "You",
    username:
      userProfile.username ||
      ifindUserData.name?.toLowerCase().replace(/\s+/g, "") ||
      mockUser.username ||
      userData.username ||
      sessionData.username ||
      "user",
    email: userProfile.email || mockUser.email || userData.email || sessionData.email || "",
    role: userProfile.role || ifindUserData.role?.toUpperCase() || mockUser.role || "STUDENT",

    // Enhanced avatar handling
    avatar: userProfile.avatar || mockUser.avatar || null,
    avatarId: userProfile.avatarId || ifindUserData.avatarId || mockUser.avatarId || null,
    avatarEmoji: userProfile.avatarEmoji || ifindUserData.avatar || null,

    contact:
      userProfile.contact ||
      `fb.com/${(userProfile.username || ifindUserData.name?.toLowerCase().replace(/\s+/g, "") || mockUser.username || userData.username || sessionData.username || "user").toLowerCase()}`,

    // Setup completion status
    completedSetup: userProfile.completedSetup || Boolean(ifindUserData.name && ifindUserData.role),
  }

  // Generate initials
  user.initials = user.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .substring(0, 2)

  // Format username with @
  if (!user.username.startsWith("@")) {
    user.username = "@" + user.username
  }

  return user
}

// Add this new function to synchronize user data across all storage keys
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

// Enhanced user avatar initialization with setup data support
function initializeUserAvatar() {
  const currentUser = getCurrentUser()
  const hamburgerProfilePic = hamburgerMenu.querySelector(".profile-pic")

  if (hamburgerProfilePic) {
    if (currentUser.avatar) {
      // User uploaded image
      hamburgerProfilePic.innerHTML = `<img src="${currentUser.avatar}" alt="${currentUser.name}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%;">`
    } else if (currentUser.avatarEmoji && currentUser.avatarEmoji !== "👤") {
      // Emoji avatar from setup
      hamburgerProfilePic.innerHTML = `<div class="default-avatar" style="font-size: 20px; display: flex; align-items: center; justify-content: center;">${currentUser.avatarEmoji}</div>`
    } else if (currentUser.avatarId) {
      // Legacy emoji avatar system
      const avatarEmojis = [
        "👨‍💼",
        "👩‍💼",
        "👨‍🎓",
        "👩‍🎓",
        "👨‍🏫",
        "👩‍🏫",
        "👨‍💻",
        "👩‍💻",
        "👨‍🔬",
        "👩‍🔬",
        "👨‍🎨",
        "👩‍🎨",
      ]
      const avatarIndex = Number.parseInt(currentUser.avatarId) - 1
      const emoji = avatarEmojis[avatarIndex] || "👤"
      hamburgerProfilePic.innerHTML = `<div class="default-avatar" style="font-size: 20px; display: flex; align-items: center; justify-content: center;">${emoji}</div>`
    } else {
      // Default initials
      hamburgerProfilePic.innerHTML = `<div class="default-avatar" style="display: flex; align-items: center; justify-content: center;">${currentUser.initials}</div>`
    }
  }
}

// Format timestamp for posts
function formatPostTime(timestamp) {
  const now = new Date()
  const postTime = new Date(timestamp)
  const diffInSeconds = Math.floor((now - postTime) / 1000)
  const diffInMinutes = Math.floor(diffInSeconds / 60)
  const diffInHours = Math.floor(diffInMinutes / 60)
  const diffInDays = Math.floor(diffInHours / 24)

  if (diffInSeconds < 60) {
    return "Just now"
  } else if (diffInMinutes < 60) {
    return `${diffInMinutes}m ago`
  } else if (diffInHours < 24) {
    return `${diffInHours}h ago`
  } else if (diffInDays === 1) {
    return "Yesterday"
  } else if (diffInDays < 7) {
    return `${diffInDays}d ago`
  } else {
    return postTime.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: postTime.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
    })
  }
}

// Notification Bell functionality
notificationBell.addEventListener("click", (e) => {
  e.stopPropagation()
  notificationDropdown.classList.toggle("active")
  announcementDropdown.classList.remove("active")
})

// Announcement Icon functionality
announcementIcon.addEventListener("click", (e) => {
  e.stopPropagation()
  announcementDropdown.classList.toggle("active")
  notificationDropdown.classList.remove("active")
})

// Mark all notifications as read
markAllRead.addEventListener("click", () => {
  const unreadItems = document.querySelectorAll(".notification-item.unread")
  unreadItems.forEach((item) => {
    item.classList.remove("unread")
  })
  unreadNotifications = 0
  updateNotificationBadge()
})

// Update notification badge
function updateNotificationBadge() {
  if (unreadNotifications > 0) {
    notificationCount.textContent = unreadNotifications
    notificationCount.style.display = "flex"
  } else {
    notificationCount.style.display = "none"
  }
}

// Close dropdowns when clicking outside
document.addEventListener("click", (e) => {
  if (!notificationBell.contains(e.target)) {
    notificationDropdown.classList.remove("active")
  }
  if (!announcementIcon.contains(e.target)) {
    announcementDropdown.classList.remove("active")
  }
})

// Add new notification function
function addNotification(type, title, message) {
  const notificationList = document.getElementById("notification-list")
  const newNotification = document.createElement("div")
  newNotification.className = "notification-item unread"

  let iconClass = "fas fa-info-circle"
  let iconColor = "#007bff"

  switch (type) {
    case "claimed":
      iconClass = "fas fa-check-circle"
      iconColor = "#28a745"
      break
    case "found":
      iconClass = "fas fa-search"
      iconColor = "#007bff"
      break
    case "liked":
      iconClass = "fas fa-heart"
      iconColor = "#dc3545"
      break
    case "comment":
      iconClass = "fas fa-comment"
      iconColor = "#007bff"
      break
    case "share":
      iconClass = "fas fa-share"
      iconColor = "#17a2b8"
      break
    case "edit":
      iconClass = "fas fa-edit"
      iconColor = "#ffc107"
      break
    case "delete":
      iconClass = "fas fa-trash"
      iconColor = "#dc3545"
      break
  }

  newNotification.innerHTML = `
    <div class="notification-icon-small">
      <i class="${iconClass}" style="color: ${iconColor};"></i>
    </div>
    <div class="notification-content">
      <p><strong>${title}</strong></p>
      <p>${message}</p>
      <span class="notification-time">Just now</span>
    </div>
  `

  notificationList.insertBefore(newNotification, notificationList.firstChild)
  unreadNotifications++
  updateNotificationBadge()
}

// Navigation functions
hamburgerMenu.addEventListener("click", () => {
  if (window.innerWidth <= 768) {
    sidebar.classList.toggle("active")
  } else {
    window.location.href = "profile.html"
  }
})

navProfile.addEventListener("click", () => {
  window.location.href = "profile.html"
})

navAbout.addEventListener("click", () => {
  window.location.href = "about.html"
})

navClaimed.addEventListener("click", () => {
  window.location.href = "claimed.html"
})

navLogout.addEventListener("click", () => {
  if (confirm("Are you sure you want to log out?")) {
    localStorage.removeItem("userProfile")
    localStorage.removeItem("mockUser")
    localStorage.removeItem("userSession")
    localStorage.removeItem("userPosts")
    localStorage.removeItem("ifindUserData")
    window.location.href = "login.html"
  }
})

// Close sidebar when clicking outside on mobile
document.addEventListener("click", (event) => {
  if (window.innerWidth <= 768) {
    if (!sidebar.contains(event.target) && !hamburgerMenu.contains(event.target)) {
      sidebar.classList.remove("active")
    }
  }
})

// Modal functions
function openPostModal() {
  postModal.classList.add("active")
  document.body.style.overflow = "hidden"
}

function closePostModal() {
  postModal.classList.remove("active")
  document.body.style.overflow = "auto"
  postForm.reset()
  fileName.textContent = ""
  editingPostId = null

  const modalTitle = document.querySelector("#post-modal h2")
  const submitButton = document.querySelector("#post-modal button[type='submit']")
  if (modalTitle) modalTitle.textContent = "Create New Post"
  if (submitButton) submitButton.textContent = "Post"

  const imagePreview = document.getElementById("image-preview")
  if (imagePreview) {
    imagePreview.style.display = "none"
    imagePreview.innerHTML = ""
  }
}

function openFilterModal() {
  filterModal.classList.add("active")
  document.body.style.overflow = "hidden"
}

function closeFilterModalFunc() {
  filterModal.classList.remove("active")
  document.body.style.overflow = "auto"
}

// Event listeners for modals
addPostBtn.addEventListener("click", openPostModal)
closeModal.addEventListener("click", closePostModal)
cancelPost.addEventListener("click", closePostModal)
filterBtn.addEventListener("click", openFilterModal)
closeFilterModal.addEventListener("click", closeFilterModalFunc)

// Close modals when clicking outside
postModal.addEventListener("click", (event) => {
  if (event.target === postModal) {
    closePostModal()
  }
})

filterModal.addEventListener("click", (event) => {
  if (event.target === filterModal) {
    closeFilterModalFunc()
  }
})

// ENHANCED: File input handler with validation and preview
fileInput.addEventListener("change", (event) => {
  const file = event.target.files[0]
  const imagePreview = document.getElementById("image-preview")

  if (file) {
    // Validate file type
    if (!file.type.startsWith("image/")) {
      alert("Please select a valid image file.")
      event.target.value = ""
      return
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      alert("File size must be less than 10MB.")
      event.target.value = ""
      return
    }

    fileName.textContent = file.name

    const reader = new FileReader()
    reader.onload = (e) => {
      imagePreview.innerHTML = `<img src="${e.target.result}" alt="Preview" style="max-width: 100%; max-height: 200px; object-fit: contain; border-radius: 8px;">`
      imagePreview.style.display = "block"
    }
    reader.readAsDataURL(file)
  } else {
    fileName.textContent = ""
    imagePreview.style.display = "none"
    imagePreview.innerHTML = ""
  }
})

// Search functionality
searchInput.addEventListener("input", () => {
  filterPosts()
})

// Filter functionality
clearFiltersBtn.addEventListener("click", () => {
  document.querySelectorAll(".filter-checkbox").forEach((checkbox) => {
    checkbox.checked = false
  })
})

applyFiltersBtn.addEventListener("click", () => {
  currentFilters.types = []
  document.querySelectorAll(".filter-checkbox[data-type]").forEach((checkbox) => {
    if (checkbox.checked) {
      currentFilters.types.push(checkbox.dataset.type)
    }
  })

  currentFilters.locations = []
  document.querySelectorAll(".filter-checkbox[data-location]").forEach((checkbox) => {
    if (checkbox.checked) {
      currentFilters.locations.push(checkbox.dataset.location)
    }
  })

  filterPosts()
  closeFilterModalFunc()
})

// Filter posts function
function filterPosts() {
  const searchTerm = searchInput.value.toLowerCase()
  const filteredPosts = allPosts.filter((post) => {
    const matchesSearch =
      post.description.toLowerCase().includes(searchTerm) || post.location.toLowerCase().includes(searchTerm)
    const matchesType = currentFilters.types.length === 0 || currentFilters.types.includes(post.type)
    const matchesLocation = currentFilters.locations.length === 0 || currentFilters.locations.includes(post.location)

    return matchesSearch && matchesType && matchesLocation
  })

  displayPosts(filteredPosts)
}

// Display posts function
function displayPosts(posts) {
  const postsContainer = document.getElementById("feed")

  const existingPosts = postsContainer.querySelectorAll(".post")
  existingPosts.forEach((post) => post.remove())

  if (posts.length === 0) {
    emptyState.style.display = "block"
  } else {
    emptyState.style.display = "none"
    posts.forEach((post, index) => {
      const postElement = createPostElement(post, index)
      postsContainer.appendChild(postElement)
    })
  }
}

// Function to determine image container class based on dimensions
function getImageContainerClass(img) {
  const aspectRatio = img.naturalWidth / img.naturalHeight

  if (aspectRatio > 2) {
    return "wide-image"
  } else if (aspectRatio < 0.75) {
    return "tall-image"
  }
  return ""
}

// Heart/Like functionality
function toggleHeart(postId, element) {
  const post = allPosts.find((p) => p.id === postId)
  if (!post) return

  const icon = element.querySelector("i")
  const span = element.querySelector("span")

  if (!post.liked) {
    post.liked = true
    post.likeCount = (post.likeCount || 0) + 1
    icon.classList.remove("far")
    icon.classList.add("fas")
    icon.style.color = "#dc3545"
    span.style.color = "#dc3545"
    element.classList.add("liked")

    addNotification("liked", "Post Liked!", "You liked this post")
  } else {
    post.liked = false
    post.likeCount = Math.max((post.likeCount || 1) - 1, 0)
    icon.classList.remove("fas")
    icon.classList.add("far")
    icon.style.color = ""
    span.style.color = ""
    element.classList.remove("liked")
  }

  savePostsToStorage()
}

// Comment functionality
function submitComment(postId, commentText, commentInput) {
  if (!commentText.trim()) return

  const post = allPosts.find((p) => p.id === postId)
  if (!post) return

  if (!post.comments) post.comments = []

  const currentUser = getCurrentUser()
  const newComment = {
    id: Date.now().toString(),
    text: commentText.trim(),
    author: currentUser.name,
    authorHandle: currentUser.username,
    authorInitials: currentUser.initials,
    timestamp: new Date(),
  }

  post.comments.push(newComment)
  savePostsToStorage()

  commentInput.value = ""

  addNotification("comment", "Comment Added!", "You commented on this post")

  filterPosts()
}

// Share functionality
function sharePost(postId) {
  const post = allPosts.find((p) => p.id === postId)
  if (!post) return

  const shareText = `Check out this ${post.type} item: ${post.description} - ${post.location}`

  if (navigator.share) {
    navigator
      .share({
        title: `iFind - ${post.type} Item`,
        text: shareText,
        url: window.location.href,
      })
      .then(() => {
        addNotification("share", "Post Shared!", "You shared this post")
      })
      .catch((err) => {
        console.log("Error sharing:", err)
        fallbackShare(shareText)
      })
  } else {
    fallbackShare(shareText)
  }
}

// Fallback share function
function fallbackShare(text) {
  navigator.clipboard
    .writeText(text)
    .then(() => {
      addNotification("share", "Link Copied!", "Post link copied to clipboard")

      const shareMsg = document.createElement("div")
      shareMsg.textContent = "Link copied to clipboard!"
      shareMsg.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: #28a745;
      color: white;
      padding: 12px 24px;
      border-radius: 8px;
      z-index: 9999;
      font-weight: 500;
    `
      document.body.appendChild(shareMsg)

      setTimeout(() => {
        document.body.removeChild(shareMsg)
      }, 2000)
    })
    .catch((err) => {
      console.log("Could not copy text: ", err)
      addNotification("share", "Share Failed", "Could not copy link to clipboard")
    })
}

// UPDATED: Enhanced createPostElement with setup data avatar support
function createPostElement(postData, index) {
  const postElement = document.createElement("div")
  postElement.className = "post"
  postElement.dataset.type = postData.type
  postElement.dataset.location = postData.location
  postElement.dataset.postId = postData.id

  // Enhanced avatar display - support uploaded images, emoji avatars, and setup data
  let avatarHTML = ""
  if (postData.avatar) {
    // User uploaded image
    avatarHTML = `<img src="${postData.avatar}" alt="${postData.userName}" style="width: 100%; height: 100%; object-fit: cover;">`
  } else if (postData.avatarEmoji && postData.avatarEmoji !== "👤") {
    // Emoji avatar from setup
    avatarHTML = `<div class="default-avatar" style="font-size: 20px; display: flex; align-items: center; justify-content: center;">${postData.avatarEmoji}</div>`
  } else if (postData.avatarId) {
    // Legacy emoji avatar system
    const avatarEmojis = [
      "👨‍💼",
      "👩‍💼",
      "👨‍🎓",
      "👩‍🎓",
      "👨‍🏫",
      "👩‍🏫",
      "👨‍💻",
      "👩‍💻",
      "👨‍🔬",
      "👩‍🔬",
      "👨‍🎨",
      "👩‍🎨",
    ]
    const avatarIndex = Number.parseInt(postData.avatarId) - 1
    const emoji = avatarEmojis[avatarIndex] || "👤"
    avatarHTML = `<div class="default-avatar" style="font-size: 20px; display: flex; align-items: center; justify-content: center;">${emoji}</div>`
  } else {
    // Default initials
    avatarHTML = `<div class="default-avatar" style="display: flex; align-items: center; justify-content: center;">${postData.userInitials}</div>`
  }

  // Create image HTML with proper container
  let imageHTML = ""
  if (postData.image) {
    imageHTML = `
      <div class="post-image-container loading" id="image-container-${postData.id}">
        <img src="${postData.image}" 
             alt="${postData.type} item" 
             class="post-image"
             onload="handleImageLoad(this, '${postData.id}')"
             onerror="handleImageError(this, '${postData.id}')">
      </div>
    `
  }

  // Create comments HTML
  let commentsHTML = ""
  if (postData.comments && postData.comments.length > 0) {
    commentsHTML = `
      <div class="comments-list">
        ${postData.comments
          .map(
            (comment) => `
          <div class="comment">
            <div class="comment-author">
              <strong>${comment.author}</strong>
              <span class="comment-time">${new Date(comment.timestamp).toLocaleDateString()}</span>
            </div>
            <div class="comment-text">${comment.text}</div>
          </div>
        `,
          )
          .join("")}
      </div>
    `
  }

  // Get current user for comment input avatar
  const currentUser = getCurrentUser()
  let currentUserAvatarHTML = ""
  if (currentUser.avatar) {
    currentUserAvatarHTML = `<img src="${currentUser.avatar}" alt="${currentUser.name}" style="width: 100%; height: 100%; object-fit: cover;">`
  } else if (currentUser.avatarEmoji && currentUser.avatarEmoji !== "👤") {
    currentUserAvatarHTML = `<div class="default-avatar" style="font-size: 20px; display: flex; align-items: center; justify-content: center;">${currentUser.avatarEmoji}</div>`
  } else if (currentUser.avatarId) {
    const avatarEmojis = [
      "👨‍💼",
      "👩‍💼",
      "👨‍🎓",
      "👩‍🎓",
      "👨‍🏫",
      "👩‍🏫",
      "👨‍💻",
      "👩‍💻",
      "👨‍🔬",
      "👩‍🔬",
      "👨‍🎨",
      "👩‍🎨",
    ]
    const avatarIndex = Number.parseInt(currentUser.avatarId) - 1
    const emoji = avatarEmojis[avatarIndex] || "👤"
    currentUserAvatarHTML = `<div class="default-avatar" style="font-size: 20px; display: flex; align-items: center; justify-content: center;">${emoji}</div>`
  } else {
    currentUserAvatarHTML = `<div class="default-avatar" style="display: flex; align-items: center; justify-content: center;">${currentUser.initials}</div>`
  }

  postElement.innerHTML = `
        <div class="post-header">
            <div class="post-user">
                <div class="profile-pic">
                    ${avatarHTML}
                </div>
                <div class="post-user-info">
                    <div class="post-user-name">${postData.userName}</div>
                    <div class="post-user-meta">${postData.userHandle}<br>${postData.userRole}</div>
                    <div class="post-time">${formatPostTime(postData.timestamp)}</div>
                </div>
            </div>
            <div class="post-options" onclick="togglePostOptions(this)">
                <i class="fas fa-ellipsis-h"></i>
                <div class="post-options-dropdown">
                    <div class="dropdown-item" onclick="editPost('${postData.id}')">
                        <i class="fas fa-edit"></i>
                        <span>Edit</span>
                    </div>
                    <div class="dropdown-item" onclick="markAsClaimed('${postData.id}')">
                        <i class="fas fa-check"></i>
                        <span>Claimed</span>
                    </div>
                    <div class="dropdown-item" onclick="deletePost('${postData.id}')">
                        <i class="fas fa-trash"></i>
                        <span>Delete</span>
                    </div>
                </div>
            </div>
        </div>
        <div class="post-content">
            <div class="post-text">
                <span class="post-tag ${postData.type}">${postData.type.charAt(0).toUpperCase() + postData.type.slice(1)}</span>
                ${postData.description} — <strong>${postData.location}</strong>
            </div>
            ${imageHTML}
        </div>
        <div class="post-actions">
            <div class="post-action ${postData.liked ? "liked" : ""}" onclick="toggleHeart('${postData.id}', this)">
                <i class="${postData.liked ? "fas" : "far"} fa-heart" ${postData.liked ? 'style="color: #dc3545;"' : ""}></i>
                <span ${postData.liked ? 'style="color: #dc3545;"' : ""}>Heart</span>
            </div>
            <div class="post-action">
                <i class="far fa-comment"></i>
                <span>COMMENT</span>
            </div>
            <div class="post-action" onclick="sharePost('${postData.id}')">
                <i class="fas fa-share"></i>
                <span>SHARE</span>
            </div>
        </div>
        <div class="post-comments">
            ${commentsHTML}
            <div class="comment-input">
                <div class="profile-pic">
                    ${currentUserAvatarHTML}
                </div>
                <input type="text" class="comment-text" placeholder="Write your comment..." onkeypress="handleCommentKeypress(event, '${postData.id}', this)">
                <button class="send-comment" onclick="handleCommentSubmit('${postData.id}', this)">
                    <i class="fas fa-paper-plane"></i>
                </button>
            </div>
        </div>
    `

  return postElement
}

// Handle comment keypress (Enter to submit)
function handleCommentKeypress(event, postId, input) {
  if (event.key === "Enter") {
    event.preventDefault()
    submitComment(postId, input.value, input)
  }
}

// Handle comment submit button click
function handleCommentSubmit(postId, button) {
  const input = button.previousElementSibling
  submitComment(postId, input.value, input)
}

// Global functions for enhanced image handling
window.handleImageLoad = (img, postId) => {
  const container = document.getElementById(`image-container-${postId}`)
  if (container) {
    container.classList.remove("loading")

    const containerClass = getImageContainerClass(img)
    if (containerClass) {
      container.classList.add(containerClass)
    }
  }
}

window.handleImageError = (img, postId) => {
  const container = document.getElementById(`image-container-${postId}`)
  if (container) {
    container.classList.remove("loading")
    container.innerHTML = `
      <div style="padding: 40px; text-align: center; color: #666;">
        <i class="fas fa-image" style="font-size: 48px; margin-bottom: 16px;"></i>
        <p>Image could not be loaded</p>
      </div>
    `
  }
}

// Post management functions
function deletePost(postId) {
  if (confirm("Are you sure you want to delete this post?")) {
    allPosts = allPosts.filter((post) => post.id !== postId)
    savePostsToStorage()
    filterPosts()

    addNotification("delete", "Post Deleted!", "Your post has been deleted successfully")
  }
}

function markAsClaimed(postId) {
  const postIndex = allPosts.findIndex((post) => post.id === postId)
  if (postIndex !== -1) {
    allPosts[postIndex].type = "claimed"
    savePostsToStorage()
    filterPosts()

    addNotification("claimed", "Item Claimed!", "Your item has been marked as claimed")
  }
}

function editPost(postId) {
  const post = allPosts.find((p) => p.id === postId)
  if (!post) return

  editingPostId = postId

  document.getElementById("post-type").value = post.type
  document.getElementById("post-location").value = post.location
  document.getElementById("post-description").value = post.description

  if (post.image) {
    const imagePreview = document.getElementById("image-preview")
    imagePreview.innerHTML = `<img src="${post.image}" alt="Current image" style="max-width: 100%; max-height: 200px; object-fit: contain; border-radius: 8px;">`
    imagePreview.style.display = "block"
    fileName.textContent = "Current image"
  }

  const modalTitle = document.querySelector("#post-modal h2")
  const submitButton = document.querySelector("#post-modal button[type='submit']")
  if (modalTitle) modalTitle.textContent = "Edit Post"
  if (submitButton) submitButton.textContent = "Update Post"

  openPostModal()
}

// Toggle post options dropdown
function togglePostOptions(element) {
  const dropdown = element.querySelector(".post-options-dropdown")
  const isVisible = dropdown.style.display === "block"

  document.querySelectorAll(".post-options-dropdown").forEach((d) => {
    d.style.display = "none"
  })

  dropdown.style.display = isVisible ? "none" : "block"
}

// Close dropdowns when clicking outside
document.addEventListener("click", (event) => {
  if (!event.target.closest(".post-options")) {
    document.querySelectorAll(".post-options-dropdown").forEach((dropdown) => {
      dropdown.style.display = "none"
    })
  }
})

// UPDATED: Enhanced form submission with setup data integration
postForm.addEventListener("submit", (event) => {
  event.preventDefault()

  const postType = document.getElementById("post-type").value
  const postLocation = document.getElementById("post-location").value
  const postDescription = document.getElementById("post-description").value
  const postImage = document.getElementById("post-image").files[0]
  const currentUser = getCurrentUser()

  if (editingPostId) {
    // Update existing post
    const postIndex = allPosts.findIndex((post) => post.id === editingPostId)
    if (postIndex !== -1) {
      allPosts[postIndex].type = postType
      allPosts[postIndex].location = postLocation
      allPosts[postIndex].description = postDescription

      if (postImage) {
        const reader = new FileReader()
        reader.onload = (e) => {
          allPosts[postIndex].image = e.target.result
          allPosts[postIndex].timestamp = new Date()

          // Update user data in post
          allPosts[postIndex].userName = currentUser.name
          allPosts[postIndex].userHandle = currentUser.username
          allPosts[postIndex].userRole = currentUser.role
          allPosts[postIndex].userInitials = currentUser.initials
          allPosts[postIndex].avatar = currentUser.avatar
          allPosts[postIndex].avatarId = currentUser.avatarId
          allPosts[postIndex].avatarEmoji = currentUser.avatarEmoji

          savePostsToStorage()
          filterPosts()
          closePostModal()
          addNotification("edit", "Post Updated!", "Your post has been updated successfully")
        }
        reader.readAsDataURL(postImage)
      } else {
        allPosts[postIndex].timestamp = new Date()

        // Update user data in post
        allPosts[postIndex].userName = currentUser.name
        allPosts[postIndex].userHandle = currentUser.username
        allPosts[postIndex].userRole = currentUser.role
        allPosts[postIndex].userInitials = currentUser.initials
        allPosts[postIndex].avatar = currentUser.avatar
        allPosts[postIndex].avatarId = currentUser.avatarId
        allPosts[postIndex].avatarEmoji = currentUser.avatarEmoji

        savePostsToStorage()
        filterPosts()
        closePostModal()
        addNotification("edit", "Post Updated!", "Your post has been updated successfully")
      }
    }
  } else {
    // Create new post with enhanced user data
    const createPost = (imageData = null) => {
      const newPost = {
        id: Date.now().toString(),
        type: postType,
        location: postLocation,
        description: postDescription,
        image: imageData,
        userName: currentUser.name,
        userHandle: currentUser.username,
        userRole: currentUser.role,
        userInitials: currentUser.initials,
        avatar: currentUser.avatar,
        avatarId: currentUser.avatarId,
        avatarEmoji: currentUser.avatarEmoji,
        timestamp: new Date(),
        userId: "current_user",
        liked: false,
        likeCount: 0,
        comments: [],
      }

      allPosts.unshift(newPost)
      savePostsToStorage()
      filterPosts()
      closePostModal()
      addNotification("found", "Post Created!", `Your ${postType} item post has been created successfully`)
    }

    if (postImage) {
      const reader = new FileReader()
      reader.onload = (e) => {
        createPost(e.target.result)
      }
      reader.readAsDataURL(postImage)
    } else {
      createPost()
    }
  }
})

// ADDED: Listen for setup completion and refresh user data
window.addEventListener("storage", (e) => {
  if (e.key === "userProfile" || e.key === "ifindUserData") {
    // Refresh user avatar when setup data changes
    initializeUserAvatar()

    // Update any existing posts with new user data
    const currentUser = getCurrentUser()
    let postsUpdated = false

    allPosts.forEach((post) => {
      if (post.userId === "current_user") {
        post.userName = currentUser.name
        post.userHandle = currentUser.username
        post.userRole = currentUser.role
        post.userInitials = currentUser.initials
        post.avatar = currentUser.avatar
        post.avatarId = currentUser.avatarId
        post.avatarEmoji = currentUser.avatarEmoji
        postsUpdated = true
      }
    })

    if (postsUpdated) {
      savePostsToStorage()
      filterPosts()
    }
  }
})

// Add this function to listen for storage events from other tabs/windows
function setupStorageListener() {
  window.addEventListener("storage", (e) => {
    if (e.key === "userProfile" || e.key === "ifindUserData") {
      // Refresh user avatar when setup data changes
      initializeUserAvatar()

      // Update any existing posts with new user data
      const currentUser = getCurrentUser()
      let postsUpdated = false

      allPosts.forEach((post) => {
        if (post.userId === "current_user") {
          post.userName = currentUser.name
          post.userHandle = currentUser.username
          post.userRole = currentUser.role
          post.userInitials = currentUser.initials
          post.avatar = currentUser.avatar
          post.avatarId = currentUser.avatarId
          post.avatarEmoji = currentUser.avatarEmoji
          postsUpdated = true
        }
      })

      if (postsUpdated) {
        savePostsToStorage()
        filterPosts()
      }
    }
  })
}

// Modify the document.addEventListener("DOMContentLoaded") function to include setupStorageListener
document.addEventListener("DOMContentLoaded", () => {
  debugLocalStorage("On Main Page Load")

  // Check if user has completed setup
  const currentUser = getCurrentUser()
  if (!currentUser.completedSetup) {
    // Redirect to setup if not completed
    window.location.href = "setup.html"
    return
  }

  initializeUserAvatar()
  loadPostsFromStorage()
  updateNotificationBadge()
  setupStorageListener() // Add this line
})

