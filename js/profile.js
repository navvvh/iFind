// ===================== State =====================
let currentDeletePostId = null
let currentDeleteCommentData = null
let currentEditPostId = null
let currentClaimedPostId = null
const currentUser = getCurrentUserData()

// ===================== DOM Elements =====================
const hamburgerMenu = document.getElementById("hamburger-menu")
const sidebar = document.getElementById("sidebar")
const editProfileBtn = document.getElementById("edit-profile-btn")
const editProfileModal = document.getElementById("edit-profile-modal")
const closeEditModalBtn = document.getElementById("close-edit-modal")
const cancelEditProfileBtn = document.getElementById("cancel-edit-profile")
const profileEditForm = document.getElementById("profile-edit-form")
const profileImageInput = document.getElementById("edit-profile-image")
const profileFileNameDisplay = document.getElementById("edit-profile-file-name")
const navFeed = document.getElementById("nav-feed")
const navAbout = document.getElementById("nav-about")
const navClaimed = document.getElementById("nav-claimed")
const navProfile = document.getElementById("nav-profile")
const navLogout = document.getElementById("nav-logout")

// ===================== User Data Functions =====================
function getCurrentUserData() {
  // Priority order: userProfile > ifindUserData > mockUser > userData > userSession
  const userProfile = JSON.parse(localStorage.getItem("userProfile")) || {}
  const ifindUserData = JSON.parse(localStorage.getItem("ifindUserData")) || {}
  const mockUser = JSON.parse(localStorage.getItem("mockUser")) || {}
  const userData = JSON.parse(localStorage.getItem("userData")) || {}
  const sessionData = JSON.parse(localStorage.getItem("userSession")) || {}

  // Create unified user object with proper fallback chain
  return {
    name:
      userProfile.name ||
      ifindUserData.name ||
      mockUser.username ||
      userData.username ||
      sessionData.username ||
      "Vhan Hajj",
    username:
      userProfile.username ||
      ifindUserData.name?.toLowerCase().replace(/\s+/g, "") ||
      mockUser.username ||
      userData.username ||
      sessionData.username ||
      "pagodsimima",
    email: userProfile.email || mockUser.email || userData.email || sessionData.email || "user@example.com",
    role: userProfile.role || ifindUserData.role?.toUpperCase() || mockUser.role || "STUDENT",

    // Enhanced avatar handling
    avatar: userProfile.avatar || mockUser.avatar || null,
    avatarId: userProfile.avatarId || ifindUserData.avatarId || mockUser.avatarId || null,
    avatarEmoji: userProfile.avatarEmoji || ifindUserData.avatar || null,

    contact:
      userProfile.contact ||
      `fb.com/${(userProfile.username || ifindUserData.name?.toLowerCase().replace(/\s+/g, "") || mockUser.username || userData.username || sessionData.username || "username").toLowerCase()}`,

    // Setup completion status
    completedSetup: userProfile.completedSetup || Boolean(ifindUserData.name && ifindUserData.role),
  }
}

function refreshCurrentUser() {
  Object.assign(currentUser, getCurrentUserData())
}

function updateExistingCommentsAvatar(newUserData) {
  const allPosts = JSON.parse(localStorage.getItem("userPosts")) || []
  let postsUpdated = false

  allPosts.forEach((post) => {
    if (post.comments && post.comments.length > 0) {
      post.comments.forEach((comment) => {
        // Update comments made by the current user
        if (comment.authorHandle === newUserData.username || comment.author === newUserData.name) {
          comment.author = newUserData.name
          comment.authorHandle = newUserData.username
          comment.authorInitials = newUserData.initials
          comment.avatar = newUserData.avatar
          comment.avatarId = newUserData.avatarId
          comment.avatarEmoji = newUserData.avatarEmoji
          postsUpdated = true
        }
      })
    }
  })

  if (postsUpdated) {
    localStorage.setItem("userPosts", JSON.stringify(allPosts))
    loadUserPosts() // Refresh display
  }
}

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

  // NEW: Update existing comments with new avatar data
  updateExistingCommentsAvatar(newUserProfile)

  // Dispatch storage event to notify other pages
  window.dispatchEvent(new Event("storage"))

  return newUserProfile
}

// ===================== Modal Functions =====================
function deletePost(postId) {
  currentDeletePostId = postId

  // Create delete post modal if it doesn't exist
  if (!document.getElementById("delete-post-modal")) {
    const deletePostModalHTML = `
      <div class="modal" id="delete-post-modal">
        <div class="modal-content delete-modal-content">
          <button class="delete-x-btn" id="delete-post-x-btn">
            <i class="fas fa-times"></i>
          </button>
          
          <div class="delete-modal-body">
            <div class="delete-icon">
              <i class="fas fa-trash-alt"></i>
            </div>
            
            <div class="delete-message">
              <p>Are you sure you want to delete this post?</p>
            </div>
            
            <div class="delete-actions">
              <button class="delete-btn delete-cancel-btn" id="delete-post-cancel-btn">
                Cancel
              </button>
              <button class="delete-btn delete-confirm-btn" id="delete-post-ok-btn">
                Confirm
              </button>
            </div>
          </div>
        </div>
      </div>
    `
    document.body.insertAdjacentHTML("beforeend", deletePostModalHTML)

    // Add event listeners for delete post modal
    document.getElementById("delete-post-ok-btn").addEventListener("click", () => {
      if (currentDeletePostId) {
        const postElement = document.querySelector(`[data-post-id="${currentDeletePostId}"]`)
        if (postElement) {
          // Add animation class
          postElement.classList.add("slide-out-bck-center")

          // Wait for animation to complete before removing from DOM and storage
          setTimeout(() => {
            let allPosts = JSON.parse(localStorage.getItem("userPosts")) || []
            allPosts = allPosts.filter((post) => post.id !== currentDeletePostId)
            localStorage.setItem("userPosts", JSON.stringify(allPosts))
            loadUserPosts()
            if (window.addNotification) {
              window.addNotification("delete", "Post Deleted!", "Your post has been deleted successfully")
            }
          }, 500) // Match animation duration
        } else {
          // If element not found, just delete from storage
          let allPosts = JSON.parse(localStorage.getItem("userPosts")) || []
          allPosts = allPosts.filter((post) => post.id !== currentDeletePostId)
          localStorage.setItem("userPosts", JSON.stringify(allPosts))
          loadUserPosts()
          if (window.addNotification) {
            window.addNotification("delete", "Post Deleted!", "Your post has been deleted successfully")
          }
        }
      }
      closeDeletePostModal()
    })

    document.getElementById("delete-post-cancel-btn").addEventListener("click", closeDeletePostModal)
    document.getElementById("delete-post-x-btn").addEventListener("click", closeDeletePostModal)

    document.getElementById("delete-post-modal").addEventListener("click", (e) => {
      if (e.target.id === "delete-post-modal") closeDeletePostModal()
    })
  }

  document.getElementById("delete-post-modal").classList.add("active")
  document.body.style.overflow = "hidden"
}
function closeDeletePostModal() {
  document.getElementById("delete-post-modal").classList.remove("active")
  document.body.style.overflow = "auto"
  currentDeletePostId = null
}
function deleteComment(postId, commentId) {
  currentDeleteCommentData = { postId, commentId }

  // Create delete comment modal if it doesn't exist
  if (!document.getElementById("delete-comment-modal")) {
    const deleteCommentModalHTML = `
      <div class="modal" id="delete-comment-modal">
        <div class="modal-content delete-modal-content">
          <button class="delete-x-btn" id="delete-comment-x-btn">
            <i class="fas fa-times"></i>
          </button>
          
          <div class="delete-modal-body">
            <div class="delete-icon">
              <i class="fas fa-trash-alt"></i>
            </div>
            
            <div class="delete-message">
              <p>Are you sure you want to delete this comment?</p>
            </div>
            
            <div class="delete-actions">
              <button class="delete-btn delete-cancel-btn" id="delete-comment-cancel-btn">
                Cancel
              </button>
              <button class="delete-btn delete-confirm-btn" id="delete-comment-ok-btn">
                Confirm
              </button>
            </div>
          </div>
        </div>
      </div>
    `
    document.body.insertAdjacentHTML("beforeend", deleteCommentModalHTML)

    // Add event listeners for delete comment modal
    document.getElementById("delete-comment-ok-btn").addEventListener("click", () => {
      if (currentDeleteCommentData) {
        const allPosts = JSON.parse(localStorage.getItem("userPosts")) || []
        const post = allPosts.find((p) => p.id === currentDeleteCommentData.postId)
        if (post && post.comments) {
          const commentIndex = post.comments.findIndex((c) => c.id === currentDeleteCommentData.commentId)
          if (commentIndex !== -1) {
            post.comments.splice(commentIndex, 1)
            localStorage.setItem("userPosts", JSON.stringify(allPosts))
            loadUserPosts()
            if (window.addNotification) {
              window.addNotification("delete", "Comment Deleted!", "Your comment has been deleted successfully")
            }
          }
        }
      }
      closeDeleteCommentModal()
    })

    document.getElementById("delete-comment-cancel-btn").addEventListener("click", closeDeleteCommentModal)
    document.getElementById("delete-comment-x-btn").addEventListener("click", closeDeleteCommentModal)

    document.getElementById("delete-comment-modal").addEventListener("click", (e) => {
      if (e.target.id === "delete-comment-modal") closeDeleteCommentModal()
    })
  }

  document.getElementById("delete-comment-modal").classList.add("active")
  document.body.style.overflow = "hidden"
}
function closeDeleteCommentModal() {
  document.getElementById("delete-comment-modal").classList.remove("active")
  document.body.style.overflow = "auto"
  currentDeleteCommentData = null
}
window.deleteComment = deleteComment

// ===================== Profile Display & Edit =====================
function updateProfileDisplay() {
  const profileNavAvatar = document.getElementById("profile-nav-avatar")
  if (profileNavAvatar) {
    const profilePic = profileNavAvatar.querySelector(".profile-pic")
    if (profilePic) {
      if (currentUser.avatar) {
        // User uploaded image
        profilePic.innerHTML = `<img src="${currentUser.avatar}" alt="${currentUser.name}" style="width: 100%; height: 100%; object-fit: cover;">`
      } else if (currentUser.avatarEmoji && currentUser.avatarEmoji !== "👤") {
        // Emoji avatar from setup
        profilePic.innerHTML = `<div class="default-avatar" style="font-size: 16px;">${currentUser.avatarEmoji}</div>`
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
        const emoji = avatarEmojis[currentUser.avatarId - 1] || "👤"
        profilePic.innerHTML = `<div class="default-avatar" style="font-size: 16px;">${emoji}</div>`
      } else {
        // Default initials
        const initials = currentUser.name
          .split(" ")
          .map((n) => n[0])
          .join("")
        profilePic.innerHTML = `<div class="default-avatar">${initials}</div>`
      }
    }
  }

  const profileAvatarLarge = document.querySelector(".profile-avatar-large")
  if (profileAvatarLarge) {
    if (currentUser.avatar) {
      // User uploaded image
      profileAvatarLarge.innerHTML = `<img src="${currentUser.avatar}" alt="${currentUser.name}" style="width: 100%; height: 100%; object-fit: cover;">`
    } else if (currentUser.avatarEmoji && currentUser.avatarEmoji !== "👤") {
      // Emoji avatar from setup
      profileAvatarLarge.innerHTML = `<div class="default-avatar-large" style="font-size: 48px;">${currentUser.avatarEmoji}</div>`
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
      const emoji = avatarEmojis[currentUser.avatarId - 1] || "👤"
      profileAvatarLarge.innerHTML = `<div class="default-avatar-large" style="font-size: 48px;">${emoji}</div>`
    } else {
      // Default initials
      const initials = currentUser.name
        .split(" ")
        .map((n) => n[0])
        .join("")
      profileAvatarLarge.innerHTML = `<div class="default-avatar-large">${initials}</div>`
    }
  }

  const profileNameLarge = document.querySelector(".profile-name-large")
  if (profileNameLarge) {
    profileNameLarge.textContent = currentUser.name
  }

  const profileUsernameLarge = document.querySelector(".profile-username-large")
  if (profileUsernameLarge) {
    const username = currentUser.username.startsWith("@") ? currentUser.username : "@" + currentUser.username
    profileUsernameLarge.textContent = username
  }

  const profileRoleLarge = document.querySelector(".profile-role-large")
  if (profileRoleLarge) {
    profileRoleLarge.textContent = currentUser.role
  }

  const profileContactValue = document.querySelector(".profile-contact-value a")
  if (profileContactValue) {
    profileContactValue.textContent = currentUser.contact
    profileContactValue.href = `https://${currentUser.contact}`
  }

  // Update edit form values
  const editNameInput = document.getElementById("edit-name")
  const editUsernameInput = document.getElementById("edit-username")
  const editContactInput = document.getElementById("edit-contact")

  if (editNameInput) editNameInput.value = currentUser.name
  if (editUsernameInput) editUsernameInput.value = currentUser.username.replace("@", "")
  if (editContactInput) editContactInput.value = currentUser.contact

  const profileEditAvatar = document.querySelector(".profile-edit-avatar")
  if (profileEditAvatar) {
    if (currentUser.avatar) {
      // User uploaded image
      profileEditAvatar.innerHTML = `<img src="${currentUser.avatar}" alt="${currentUser.name}" style="width: 100%; height: 100%; object-fit: cover;">`
    } else if (currentUser.avatarEmoji && currentUser.avatarEmoji !== "👤") {
      // Emoji avatar from setup
      profileEditAvatar.innerHTML = `<div class="default-avatar" style="font-size: 36px;">${currentUser.avatarEmoji}</div>`
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
      const emoji = avatarEmojis[currentUser.avatarId - 1] || "👤"
      profileEditAvatar.innerHTML = `<div class="default-avatar" style="font-size: 36px;">${emoji}</div>`
    } else {
      // Default initials
      const initials = currentUser.name
        .split(" ")
        .map((n) => n[0])
        .join("")
      profileEditAvatar.innerHTML = `<div class="default-avatar">${initials}</div>`
    }
  }
}
function showSuccessModal() {
  Swal.fire({
    width: "480px",
    customClass: {
      popup: "profile-success-popup",
      confirmButton: "profile-success-btn",
    },
    title: "Your profile has been updated successfully!",
    icon: "success",
    confirmButtonColor: "#0F9D6B",
    confirmButtonText: "OK",
  })
}

// ===================== Sidebar & Navigation =====================
function initializeSidebarNavigation() {
  // Create overlay if it doesn't exist
  let overlay = document.getElementById("sidebar-overlay")
  if (!overlay) {
    overlay = document.createElement("div")
    overlay.className = "sidebar-overlay"
    overlay.id = "sidebar-overlay"
    document.body.appendChild(overlay)
  }

  // Setup event listeners
  setupSidebarEvents()
  setActiveNavItem()
}
function setupSidebarEvents() {
  // Hamburger menu click handler
  if (hamburgerMenu) {
    hamburgerMenu.addEventListener("click", (e) => {
      e.stopPropagation()
      toggleSidebar()
    })
  }

  // Overlay click handler
  const overlay = document.getElementById("sidebar-overlay")
  if (overlay) {
    overlay.addEventListener("click", () => {
      closeSidebar()
    })
  }

  // Navigation handlers
  setupNavigationHandlers()

  // Close sidebar when clicking outside on mobile
  document.addEventListener("click", (event) => {
    if (window.innerWidth <= 768) {
      if (
        !sidebar.contains(event.target) &&
        !hamburgerMenu.contains(event.target) &&
        sidebar.classList.contains("active")
      ) {
        closeSidebar()
      }
    }
  })

  // Handle window resize
  window.addEventListener("resize", () => {
    if (window.innerWidth > 768) {
      // Desktop view - remove mobile classes
      const overlay = document.getElementById("sidebar-overlay")
      if (overlay) {
        overlay.classList.remove("active")
      }
      document.body.style.overflow = "auto"
    }
  })

  // Handle escape key to close sidebar
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && sidebar.classList.contains("active")) {
      closeSidebar()
    }
  })
}
function toggleSidebar() {
  const overlay = document.getElementById("sidebar-overlay")
  const hamburger = document.getElementById("hamburger-menu")

  // Toggle hamburger menu animation
  if (hamburger) {
    hamburger.classList.toggle("active")
  }

  if (window.innerWidth <= 768) {
    // Mobile behavior - toggle sidebar with overlay
    sidebar.classList.toggle("active")
    if (overlay) {
      overlay.classList.toggle("active")
    }

    // Prevent body scroll when sidebar is open
    if (sidebar.classList.contains("active")) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = "auto"
    }
  } else {
    // Desktop behavior - just toggle sidebar
    sidebar.classList.toggle("active")
  }
}
function closeSidebar() {
  const overlay = document.getElementById("sidebar-overlay")
  const hamburger = document.getElementById("hamburger-menu")

  sidebar.classList.remove("active")

  // Reset hamburger animation
  if (hamburger) {
    hamburger.classList.remove("active")
  }

  if (overlay) {
    overlay.classList.remove("active")
  }
  document.body.style.overflow = "auto"
}
function setupNavigationHandlers() {
  // Navigation item click handlers
  if (navProfile) {
    navProfile.addEventListener("click", (e) => {
      e.preventDefault()
      // Already on profile page, just close sidebar on mobile
      if (window.innerWidth <= 768) {
        closeSidebar()
      }
    })
  }

  if (navFeed) {
    navFeed.addEventListener("click", (e) => {
      e.preventDefault()
      window.location.href = "main.html"
    })
  }

  if (navAbout) {
    navAbout.addEventListener("click", (e) => {
      e.preventDefault()
      window.location.href = "about.html"
    })
  }

  if (navClaimed) {
    navClaimed.addEventListener("click", (e) => {
      e.preventDefault()
      window.location.href = "claim.html"
    })
  }

  if (navLogout) {
    navLogout.addEventListener("click", (e) => {
      e.preventDefault()
      if (confirm("Are you sure you want to log out?")) {
        localStorage.clear()
        window.location.href = "login.html"
      }
    })
  }
}
function setActiveNavItem() {
  // Remove active class from all nav items
  document.querySelectorAll(".nav-item").forEach((item) => {
    item.classList.remove("active")
  })

  // Add active class to profile nav item
  if (navProfile) {
    navProfile.classList.add("active")
  }
}

// ===================== Notifications =====================
function initializeNotifications() {
  const notificationBell = document.getElementById("notification-bell")
  const notificationDropdown = document.getElementById("notification-dropdown")
  const announcementIcon = document.getElementById("announcement-icon")
  const announcementDropdown = document.getElementById("announcement-dropdown")
  const markAllRead = document.getElementById("mark-all-read")
  const notificationCount = document.getElementById("notification-count")

  // Track unread notifications
  let unreadNotifications = 3 // Starting with 3 as shown in the HTML

  // Notification Bell functionality
  if (notificationBell) {
    notificationBell.addEventListener("click", (e) => {
      e.stopPropagation()
      notificationDropdown.classList.toggle("active")
      announcementDropdown.classList.remove("active")
    })
  }

  // Announcement Icon functionality
  if (announcementIcon) {
    announcementIcon.addEventListener("click", (e) => {
      e.stopPropagation()
      announcementDropdown.classList.toggle("active")
      notificationDropdown.classList.remove("active")
    })
  }

  // Mark all notifications as read
  if (markAllRead) {
    markAllRead.addEventListener("click", () => {
      const unreadItems = document.querySelectorAll(".notification-item.unread")
      unreadItems.forEach((item) => {
        item.classList.remove("unread")
      })
      unreadNotifications = 0
      updateNotificationBadge()
    })
  }

  // Close dropdowns when clicking outside
  document.addEventListener("click", (e) => {
    if (notificationBell && !notificationBell.contains(e.target)) {
      notificationDropdown.classList.remove("active")
    }
    if (announcementIcon && !announcementIcon.contains(e.target)) {
      announcementDropdown.classList.remove("active")
    }
  })

  // Update notification badge
  function updateNotificationBadge() {
    if (notificationCount) {
      if (unreadNotifications > 0) {
        notificationCount.textContent = unreadNotifications
        notificationCount.style.display = "flex"
      } else {
        notificationCount.style.display = "none"
      }
    }
  }

  // Add new notification function
  function addNotification(type, title, message) {
    const notificationList = document.getElementById("notification-list")
    if (!notificationList) return

    const newNotification = document.createElement("div")
    newNotification.className = "notification-item unread"

    let iconClass = "fas fa-info-circle"
    let iconColor = "#05234d"

    switch (type) {
      case "claimed":
        iconClass = "fas fa-check-circle"
        iconColor = "#059669"
        break
      case "found":
        iconClass = "fas fa-search"
        iconColor = "#05234d"
        break
      case "liked":
        iconClass = "fas fa-heart"
        iconColor = "#dc2626"
        break
      case "comment":
        iconClass = "fas fa-comment"
        iconColor = "#05234d"
        break
      case "share":
        iconClass = "fas fa-share"
        iconColor = "#0891b2"
        break
      case "edit":
        iconClass = "fas fa-edit"
        iconColor = "#f59e0b"
        break
      case "delete":
        iconClass = "fas fa-trash"
        iconColor = "#dc2626"
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

  // Make functions available globally
  window.addNotification = addNotification
  window.updateNotificationBadge = updateNotificationBadge

  // Initialize notification badge on load
  updateNotificationBadge()
}

// ===================== Posts =====================
function loadUserPosts() {
  const allPosts = JSON.parse(localStorage.getItem("userPosts")) || []
  const userPosts = allPosts.filter((post) => post.userId === "current_user")
  displayUserPosts(userPosts)
}
function displayUserPosts(posts) {
  const profilePostsContainer = document.getElementById("profile-posts")

  profilePostsContainer.innerHTML = ""

  if (posts.length === 0) {
    profilePostsContainer.innerHTML = `
            <div class="no-posts">
                <p>You haven't posted anything yet.</p>
            </div>
        `
    return
  }

  posts.forEach((post) => {
    const postElement = createProfilePostElement(post)
    profilePostsContainer.appendChild(postElement)
  })
}
function createProfilePostElement(postData) {
  const postElement = document.createElement("div")
  postElement.className = "post"
  postElement.dataset.postId = postData.id

  // Enhanced avatar display - support uploaded images, emoji avatars, and setup data
  let avatarHTML = ""
  if (postData.avatar) {
    // User uploaded image
    avatarHTML = `<img src="${postData.avatar}" alt="${postData.userName}" style="width: 100%; height: 100%; object-fit: cover;">`
  } else if (postData.avatarEmoji && postData.avatarEmoji !== "👤") {
    // Emoji avatar from setup
    avatarHTML = `<div class="default-avatar" style="font-size: 16px;">${postData.avatarEmoji}</div>`
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
    const emoji = avatarEmojis[postData.avatarId - 1] || "👤"
    avatarHTML = `<div class="default-avatar" style="font-size: 16px;">${emoji}</div>`
  } else {
    // Default initials
    avatarHTML = `<div class="default-avatar">${postData.userInitials}</div>`
  }

  // Create image HTML with proper container
  let imageHTML = ""
  if (postData.image) {
    imageHTML = `
      <div class="post-image-container loading" id="profile-image-container-${postData.id}">
        <img src="${postData.image}" 
             alt="${postData.type} item" 
             class="post-image"
             onload="handleProfileImageLoad(this, '${postData.id}')"
             onerror="handleProfileImageError(this, '${postData.id}')">
      </div>
    `
  }

  // UPDATED: Create comments HTML with current user avatar check
  let commentsHTML = ""
  const commentCount = (postData.comments && postData.comments.length) || 0
  if (postData.comments && postData.comments.length > 0) {
    commentsHTML = `
    <div class="comments-list" style="display: none;">
      ${postData.comments
        .map((comment) => {
          const currentUser = getCurrentUserData()
          let commentAvatarHTML = ""

          // Check if this comment is from the current user
          if (comment.authorHandle === currentUser.username || comment.author === currentUser.name) {
            // Use current user's avatar
            if (currentUser.avatar) {
              commentAvatarHTML = `<img src="${currentUser.avatar}" alt="${currentUser.name}" style="width: 100%; height: 100%; object-fit: cover;">`
            } else if (currentUser.avatarEmoji && currentUser.avatarEmoji !== "👤") {
              commentAvatarHTML = `<div class="default-avatar" style="font-size: 12px;">${currentUser.avatarEmoji}</div>`
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
              commentAvatarHTML = `<div class="default-avatar" style="font-size: 12px;">${emoji}</div>`
            } else {
              commentAvatarHTML = `<div class="default-avatar" style="font-size: 12px;">${currentUser.name
                .split(" ")
                .map((n) => n[0])
                .join("")
                .toUpperCase()
                .substring(0, 2)}</div>`
            }
          } else {
            // Use stored comment avatar data
            if (comment.avatar) {
              commentAvatarHTML = `<img src="${comment.avatar}" alt="${comment.author}" style="width: 100%; height: 100%; object-fit: cover;">`
            } else if (comment.avatarEmoji && comment.avatarEmoji !== "👤") {
              commentAvatarHTML = `<div class="default-avatar" style="font-size: 12px;">${comment.avatarEmoji}</div>`
            } else {
              commentAvatarHTML = `<div class="default-avatar" style="font-size: 12px;">${comment.author
                .split(" ")
                .map((n) => n[0])
                .join("")
                .toUpperCase()
                .substring(0, 2)}</div>`
            }
          }

          return `
          <div class="comment">
            <div class="comment-avatar">
              ${commentAvatarHTML}
            </div>
            <div class="comment-bubble">
              <div class="comment-author">${comment.author}</div>
              <div class="comment-text">${comment.text}</div>
              <button class="delete-comment" onclick="deleteComment('${postData.id}', '${comment.id}')">
                <i class="fas fa-trash-alt"></i>
              </button>
            </div>
          </div>
          <div class="comment-time">${formatPostTime(comment.timestamp)}</div>
        `
        })
        .join("")}
    </div>
  `
  }

  // Get current user for comment input avatar
  const currentUserForInput = getCurrentUserData()
  let currentUserAvatarHTML = ""
  if (currentUserForInput.avatar) {
    currentUserAvatarHTML = `<img src="${currentUserForInput.avatar}" alt="${currentUserForInput.name}" style="width: 100%; height: 100%; object-fit: cover;">`
  } else if (currentUserForInput.avatarEmoji && currentUserForInput.avatarEmoji !== "👤") {
    currentUserAvatarHTML = `<div class="default-avatar" style="font-size: 12px;">${currentUserForInput.avatarEmoji}</div>`
  } else if (currentUserForInput.avatarId) {
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
    const avatarIndex = Number.parseInt(currentUserForInput.avatarId) - 1
    const emoji = avatarEmojis[avatarIndex] || "👤"
    currentUserAvatarHTML = `<div class="default-avatar" style="font-size: 12px;">${emoji}</div>`
  } else {
    currentUserAvatarHTML = `<div class="default-avatar" style="font-size: 12px;">${currentUserForInput.name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2)}</div>`
  }

  // FIXED: Updated to match main.js format with post-user-name-time container
  postElement.innerHTML = `
        <div class="post-header">
            <div class="post-user">
                <div class="profile-pic">
                    ${avatarHTML}
                </div>
                <div class="post-user-info">
                    <div class="post-user-name-time">
                        <div class="post-user-name">${postData.userName}</div>
                        <div class="post-time">${formatPostTime(postData.timestamp)}</div>
                    </div>
                    <div class="post-user-meta">${postData.userHandle}<br>${postData.userRole}</div>
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
                <span class="post-tag ${postData.type}">${
                  postData.type.charAt(0).toUpperCase() + postData.type.slice(1)
                }</span>
                ${postData.description} — <strong>${postData.location}</strong>
            </div>
            ${imageHTML}
        </div>
        <div class="post-actions">
            <div class="post-action ${postData.liked ? "liked" : ""}" onclick="toggleHeart('${postData.id}', this)">
                <i class="${postData.liked ? "fas" : "far"} fa-heart" ${
                  postData.liked ? 'style="color: #dc2626;"' : ""
                }></i>
                <span ${postData.liked ? 'style="color: #dc2626;"' : ""}>HEART</span>
            </div>
            <div class="post-action" onclick="toggleComments('${postData.id}', this)">
                <i class="far fa-comment"></i>
                <span>COMMENT${commentCount > 0 ? ` (${commentCount})` : ""}</span>
            </div>
            <div class="post-action" onclick="sharePost('${postData.id}')">
                <i class="fas fa-share"></i>
                <span>SHARE</span>
            </div>
        </div>
        <div class="post-comments">
            ${commentsHTML}
            <div class="comment-input">
                <div class="comment-input-avatar">
                    ${currentUserAvatarHTML}
                </div>
                <input type="text" class="comment-text" placeholder="Write your comment..." onkeypress="handleCommentKeypress(event, '${
                  postData.id
                }', this)">
                <button class="send-comment" onclick="handleCommentSubmit('${postData.id}', this)">
                    <i class="fas fa-paper-plane"></i>
                </button>
            </div>
        </div>
    `

  return postElement
}

// ===================== Post Actions =====================
function toggleHeart(postId, element) {
  const allPosts = JSON.parse(localStorage.getItem("userPosts")) || []
  const post = allPosts.find((p) => p.id === postId)
  if (!post) return

  const icon = element.querySelector("i")
  const span = element.querySelector("span")

  if (!post.liked) {
    post.liked = true
    post.likeCount = (post.likeCount || 0) + 1
    icon.classList.remove("far")
    icon.classList.add("fas")
    icon.style.color = "#dc2626"
    span.style.color = "#dc2626"
    element.classList.add("liked")
  } else {
    post.liked = false
    post.likeCount = Math.max((post.likeCount || 1) - 1, 0)
    icon.classList.remove("fas")
    icon.classList.add("far")
    icon.style.color = ""
    span.style.color = ""
    element.classList.remove("liked")
  }

  localStorage.setItem("userPosts", JSON.stringify(allPosts))
  syncLikeStateAcrossPages(postId, post.liked, post.likeCount)
}
function syncLikeStateAcrossPages(postId, liked, likeCount) {
  const likeEvent = new CustomEvent("likeStateChanged", {
    detail: { postId, liked, likeCount },
  })
  window.dispatchEvent(likeEvent)

  localStorage.setItem(
    "lastLikeUpdate",
    JSON.stringify({
      postId,
      liked,
      likeCount,
      timestamp: Date.now(),
    }),
  )
}
function sharePost(postId) {
  const allPosts = JSON.parse(localStorage.getItem("userPosts")) || []
  const post = allPosts.find((p) => p.id === postId)
  if (!post) return

  const shareText = `Check out this ${post.type} item: ${post.description} - ${post.location}`

  if (navigator.share) {
    navigator
      .share({
        title: `iFind - ${post.type.charAt(0).toUpperCase() + post.type.slice(1)} Item`,
        text: shareText,
        url: window.location.href,
      })
      .then(() => {
        console.log("Post shared successfully")
      })
      .catch((err) => {
        console.log("Error sharing:", err)
        fallbackShare(shareText)
      })
  } else {
    fallbackShare(shareText)
  }
}
function fallbackShare(text) {
  navigator.clipboard
    .writeText(text)
    .then(() => {
      const shareMsg = document.createElement("div")
      shareMsg.textContent = "Link copied to clipboard!"
      shareMsg.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: #10b981;
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
    })
}
function markAsClaimed(postId) {
  currentClaimedPostId = postId

  // Create claimed modal if it doesn't exist
  if (!document.getElementById("claimed-modal")) {
    const claimedModalHTML = `
      <div class="modal" id="claimed-modal">
        <div class="modal-content">
          <div class="modal-header">
            <h3 class="modal-title">Mark as Claimed</h3>
            <button class="close-modal" id="close-claimed-modal">×</button>
          </div>
          <div class="modal-body">
            <div class="claimed-message">
              <p>Are you sure you want to mark this item as claimed?</p>
            </div>
            <div class="claimed-actions">
              <button id="claimed-ok-btn" class="btn btn-primary">Mark as Claimed</button>
              <button id="claimed-cancel-btn" class="btn btn-secondary">Cancel</button>
            </div>
          </div>
        </div>
      </div>
    `
    document.body.insertAdjacentHTML("beforeend", claimedModalHTML)

    // Add event listeners for claimed modal
    document.getElementById("claimed-ok-btn").addEventListener("click", () => {
      if (currentClaimedPostId) {
        const allPosts = JSON.parse(localStorage.getItem("userPosts")) || []
        const postIndex = allPosts.findIndex((p) => p.id === currentClaimedPostId)
        if (postIndex !== -1) {
          allPosts[postIndex].type = "claimed"
          localStorage.setItem("userPosts", JSON.stringify(allPosts))
          loadUserPosts()
          if (window.addNotification) {
            window.addNotification("claimed", "Item Claimed!", "Your item has been marked as claimed")
          }
        }
      }
      closeClaimedModal()
    })

    document.getElementById("claimed-cancel-btn").addEventListener("click", closeClaimedModal)
    document.getElementById("close-claimed-modal").addEventListener("click", closeClaimedModal)

    document.getElementById("claimed-modal").addEventListener("click", (e) => {
      if (e.target.id === "claimed-modal") closeClaimedModal()
    })
  }

  document.getElementById("claimed-modal").classList.add("active")
  document.body.style.overflow = "hidden"
}
function closeClaimedModal() {
  document.getElementById("claimed-modal").classList.remove("active")
  document.body.style.overflow = "auto"
  currentClaimedPostId = null
}
function editPost(postId) {
  currentEditPostId = postId

  // Create edit post modal if it doesn't exist
  if (!document.getElementById("edit-post-modal")) {
    const editPostModalHTML = `
      <div class="modal" id="edit-post-modal">
        <div class="modal-content">
          <div class="modal-header">
            <h3 class="modal-title">Edit Post</h3>
            <button class="close-modal" id="close-edit-post-modal">×</button>
          </div>
          <div class="modal-body">
            <div class="edit-message">
              <p>You will be redirected to the main page to edit this post.</p>
            </div>
            <div class="edit-actions">
              <button id="edit-post-ok-btn" class="btn btn-primary">Continue</button>
              <button id="edit-post-cancel-btn" class="btn btn-secondary">Cancel</button>
            </div>
          </div>
        </div>
      </div>
    `
    document.body.insertAdjacentHTML("beforeend", editPostModalHTML)

    // Add event listeners for edit post modal
    document.getElementById("edit-post-ok-btn").addEventListener("click", () => {
      if (currentEditPostId) {
        localStorage.setItem("editPostId", currentEditPostId)
        window.location.href = "main.html?edit=" + currentEditPostId
      }
      closeEditPostModal()
    })

    document.getElementById("edit-post-cancel-btn").addEventListener("click", closeEditPostModal)
    document.getElementById("close-edit-post-modal").addEventListener("click", closeEditPostModal)

    document.getElementById("edit-post-modal").addEventListener("click", (e) => {
      if (e.target.id === "edit-post-modal") closeEditPostModal()
    })
  }

  document.getElementById("edit-post-modal").classList.add("active")
  document.body.style.overflow = "hidden"
}
function closeEditPostModal() {
  document.getElementById("edit-post-modal").classList.remove("active")
  document.body.style.overflow = "auto"
  currentEditPostId = null
}
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

// ===================== Comments =====================
function toggleComments(postId, element) {
  const post = document.querySelector(`[data-post-id="${postId}"]`)
  if (!post) return

  const commentsList = post.querySelector(".comments-list")
  const commentInput = post.querySelector(".comment-input")

  if (commentsList) {
    const isHidden = commentsList.style.display === "none"
    commentsList.style.display = isHidden ? "block" : "none"

    // Update button state
    if (isHidden) {
      element.classList.add("active")
      // Focus on comment input when opening
      setTimeout(() => {
        const input = commentInput?.querySelector(".comment-text")
        if (input) input.focus()
      }, 100)
    } else {
      element.classList.remove("active")
    }
  }
}
function handleCommentKeypress(event, postId, input) {
  if (event.key === "Enter") {
    event.preventDefault()
    submitComment(postId, input.value, input)
  }
}
function handleCommentSubmit(postId, button) {
  const input = button.previousElementSibling
  submitComment(postId, input.value, input)
}
function submitComment(postId, commentText, commentInput) {
  if (!commentText.trim()) return

  const allPosts = JSON.parse(localStorage.getItem("userPosts")) || []
  const post = allPosts.find((p) => p.id === postId)
  if (!post) return

  if (!post.comments) post.comments = []

  const currentUser = getCurrentUserData()
  const newComment = {
    id: Date.now().toString(),
    text: commentText.trim(),
    author: currentUser.name,
    authorHandle: currentUser.username,
    authorInitials: currentUser.name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2),
    avatar: currentUser.avatar,
    avatarId: currentUser.avatarId,
    avatarEmoji: currentUser.avatarEmoji,
    timestamp: new Date(),
  }

  post.comments.push(newComment)
  localStorage.setItem("userPosts", JSON.stringify(allPosts))

  commentInput.value = ""

  // Refresh the display to update comment count
  loadUserPosts()
}

// ===================== Image Viewer =====================
function getImageContainerClass(img) {
  const aspectRatio = img.naturalWidth / img.naturalHeight

  if (aspectRatio > 2) {
    return "wide-image"
  } else if (aspectRatio < 0.75) {
    return "tall-image"
  }
  return ""
}
window.handleProfileImageLoad = (img, postId) => {
  const container = document.getElementById(`profile-image-container-${postId}`)
  if (container) {
    container.classList.remove("loading")

    const containerClass = getImageContainerClass(img)
    if (containerClass) {
      container.classList.add(containerClass)
    }

    // Add click event to open image viewer
    container.addEventListener("click", () => {
      openImageViewer(img.src)
    })
    container.style.cursor = "pointer"
  }
}
window.handleProfileImageError = (img, postId) => {
  const container = document.getElementById(`profile-image-container-${postId}`)
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
function openImageViewer(imageUrl) {
  // Check if image viewer modal exists, create if not
  let imageViewerModal = document.getElementById("image-viewer-modal")
  if (!imageViewerModal) {
    imageViewerModal = document.createElement("div")
    imageViewerModal.id = "image-viewer-modal"
    imageViewerModal.className = "modal"

    imageViewerModal.innerHTML = `
      <div class="modal-content image-view-modal-content">
        <div class="modal-header">
          <div class="modal-title"></div>
          <button class="close-modal" id="close-image-viewer">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="image-view-body">
          <img id="full-size-image" src="/placeholder.svg" alt="Full size image">
        </div>
      </div>
    `

    document.body.appendChild(imageViewerModal)

    // Add event listener to close button
    document.getElementById("close-image-viewer").addEventListener("click", closeImageViewer)

    // Close when clicking outside the image
    imageViewerModal.addEventListener("click", (e) => {
      if (e.target === imageViewerModal) {
        closeImageViewer()
      }
    })

    // Close on escape key
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && imageViewerModal.classList.contains("active")) {
        closeImageViewer()
      }
    })
  }

  // Set the image source and open the modal
  const fullSizeImage = document.getElementById("full-size-image")
  fullSizeImage.src = imageUrl

  imageViewerModal.classList.add("active")
  document.body.style.overflow = "hidden"
}
function closeImageViewer() {
  const imageViewerModal = document.getElementById("image-viewer-modal")
  if (imageViewerModal) {
    imageViewerModal.classList.remove("active")
    document.body.style.overflow = "auto"
  }
}
function injectProfileImageViewerCSS() {
  // Check if style element already exists
  let styleElement = document.getElementById("profile-image-viewer-styles")

  // If it doesn't exist, create it
  if (!styleElement) {
    styleElement = document.createElement("style")
    styleElement.id = "profile-image-viewer-styles"
    document.head.appendChild(styleElement)
  }

  // Add the CSS for image viewer
  styleElement.textContent = `
    
    .modal-content.image-view-modal-content {
      width: auto;
      max-width: 90vw;
      max-height: 90vh;
      background-color: transparent;
      border-radius: 0;
      border: none;
      box-shadow: none;
      overflow: visible;
    }

    .image-view-body {
      padding: 0;
      display: flex;
      justify-content: center;
      align-items: center;
      background: transparent;
    }

    .image-view-body img {
      max-width: 55vw;
      max-height: 55vh;
      object-fit: contain;
      border-radius: 10px;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
    }
    
    .image-view-modal-content .modal-header {
        display: none !important;
    }
  `
}

// ===================== Edit Profile Modal & Form =====================
function setupEventListeners() {
  if (editProfileBtn) {
    editProfileBtn.addEventListener("click", () => {
      editProfileModal.classList.add("active")
      document.body.style.overflow = "hidden"

      // Add bounce-in animation to the modal content
      const modalContent = editProfileModal.querySelector(".modal-content")
      modalContent.classList.add("bounce-in-top")
    })
  }

  function closeModal() {
    if (editProfileModal) {
      editProfileModal.classList.remove("active")
      document.body.style.overflow = "auto"

      // Remove animation class to reset for next time
      const modalContent = editProfileModal.querySelector(".modal-content")
      modalContent.classList.remove("bounce-in-top")
    }
  }

  if (closeEditModalBtn) {
    closeEditModalBtn.addEventListener("click", closeModal)
  }

  if (cancelEditProfileBtn) {
    cancelEditProfileBtn.addEventListener("click", closeModal)
  }

  if (editProfileModal) {
    editProfileModal.addEventListener("click", (e) => {
      if (e.target === editProfileModal) {
        closeModal()
      }
    })
  }

  // UPDATED: Enhanced profile form submission with SweetAlert2
  if (profileEditForm) {
    profileEditForm.addEventListener("submit", (e) => {
      e.preventDefault()

      const editNameInput = document.getElementById("edit-name")
      const editUsernameInput = document.getElementById("edit-username")
      const editContactInput = document.getElementById("edit-contact")

      const newName = editNameInput ? editNameInput.value.trim() : ""
      const newUsername = editUsernameInput ? editUsernameInput.value.replace("@", "").trim() : ""
      const newContact = editContactInput ? editContactInput.value.trim() : ""

      // Validation
      if (!newName) {
        alert("Name is required")
        return
      }

      if (!newUsername) {
        alert("Username is required")
        return
      }

      if (!newContact) {
        alert("Contact is required")
        return
      }

      // Update current user object
      const updatedData = {
        name: newName,
        username: newUsername,
        contact: newContact,
      }

      const imageFile = profileImageInput ? profileImageInput.files[0] : null
      if (imageFile) {
        // Validate file type
        if (!imageFile.type.startsWith("image/")) {
          alert("Please select a valid image file.")
          return
        }

        // Validate file size (max 5MB)
        if (imageFile.size > 5 * 1024 * 1024) {
          alert("File size must be less than 5MB.")
          return
        }

        const reader = new FileReader()
        reader.onload = (e) => {
          updatedData.avatar = e.target.result
          updatedData.avatarId = null // Clear emoji avatar when uploading image
          updatedData.avatarEmoji = null // Clear setup emoji when uploading image

          // Use the centralized data synchronization function
          syncUserData(updatedData)
          refreshCurrentUser()
          updateProfileDisplay()
          loadUserPosts()
          closeModal()

          // Show SweetAlert2 success modal
          showSuccessModal()
        }
        reader.readAsDataURL(imageFile)
      } else {
        // Use the centralized data synchronization function
        syncUserData(updatedData)
        refreshCurrentUser()
        updateProfileDisplay()
        loadUserPosts()
        closeModal()

        // Show SweetAlert2 success modal
        showSuccessModal()
      }
    })
  }

  // ENHANCED: Profile image input with validation and preview
  if (profileImageInput) {
    profileImageInput.addEventListener("change", (e) => {
      const file = e.target.files[0]

      if (file) {
        // Validate file type
        if (!file.type.startsWith("image/")) {
          alert("Please select a valid image file.")
          e.target.value = ""
          if (profileFileNameDisplay) profileFileNameDisplay.textContent = ""
          return
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
          alert("File size must be less than 5MB.")
          e.target.value = ""
          if (profileFileNameDisplay) profileFileNameDisplay.textContent = ""
          return
        }

        if (profileFileNameDisplay) {
          profileFileNameDisplay.textContent = file.name
        }

        // Show preview
        const reader = new FileReader()
        reader.onload = (e) => {
          const profileEditAvatar = document.querySelector(".profile-edit-avatar")
          if (profileEditAvatar) {
            profileEditAvatar.innerHTML = `<img src="${e.target.result}" alt="Preview" style="width: 100%; height: 100%; object-fit: cover;">`
          }
        }
        reader.readAsDataURL(file)
      } else {
        if (profileFileNameDisplay) {
          profileFileNameDisplay.textContent = ""
        }
        updateProfileDisplay() // Reset to current avatar
      }
    })
  }
}

// ===================== Misc =====================
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

// ===================== Initialization =====================
function init() {
  if (!currentUser.completedSetup) {
    window.location.href = "setup.html"
    return
  }
  initializeSidebarNavigation()
  initializeNotifications()
  injectProfileImageViewerCSS()
  updateProfileDisplay()
  setupEventListeners()
  loadUserPosts()

  window.addEventListener("likeStateChanged", (e) => {
    const { postId, liked, likeCount } = e.detail
    const postElement = document.querySelector(`[data-post-id="${postId}"]`)
    if (postElement) {
      const heartButton = postElement.querySelector('.post-action[onclick*="toggleHeart"]')
      if (heartButton) {
        const icon = heartButton.querySelector("i")
        const span = heartButton.querySelector("span")
        if (liked) {
          icon.classList.remove("far")
          icon.classList.add("fas")
          icon.style.color = "#dc2626"
          span.style.color = "#dc2626"
          heartButton.classList.add("liked")
        } else {
          icon.classList.remove("fas")
          icon.classList.add("far")
          icon.style.color = ""
          span.style.color = ""
          heartButton.classList.remove("liked")
        }
      }
    }
  })
  window.addEventListener("storage", (e) => {
    if (e.key === "lastLikeUpdate") {
      const updateData = JSON.parse(e.newValue)
      if (updateData) {
        window.dispatchEvent(new CustomEvent("likeStateChanged", { detail: updateData }))
      }
    }
  })
}
window.addEventListener("storage", (e) => {
  if (e.key === "userProfile" || e.key === "ifindUserData") {
    refreshCurrentUser()
    updateProfileDisplay()
    loadUserPosts()
  } else if (e.key === "userPosts") {
    loadUserPosts()
  }
})
document.addEventListener("DOMContentLoaded", init)
