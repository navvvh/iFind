// UPDATED: Enhanced getCurrentUserData with setup data synchronization
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
      "Ang Pogi",
    username:
      userProfile.username ||
      ifindUserData.name?.toLowerCase().replace(/\s+/g, "") ||
      mockUser.username ||
      userData.username ||
      sessionData.username ||
      "angpogi",
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

// Add function to refresh current user data
function refreshCurrentUser() {
  Object.assign(currentUser, getCurrentUserData())
}

// NEW: Function to update existing comments with new user avatar data
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

// Add the syncUserData function to profile.js
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

// Create currentUser object - will be updated dynamically
const currentUser = getCurrentUserData()

// DOM Elements
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
const navClaimed = document.getElementById("nav-claimed")

// Track if we're editing a post
const editingPostId = null

// Load user posts from localStorage
function loadUserPosts() {
  const allPosts = JSON.parse(localStorage.getItem("userPosts")) || []
  const userPosts = allPosts.filter((post) => post.userId === "current_user")
  displayUserPosts(userPosts)
}

// Display user posts in profile
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

// UPDATED: Enhanced createProfilePostElement with setup data avatar support
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
    avatarHTML = `<div class="default-avatar" style="font-size: 20px;">${postData.avatarEmoji}</div>`
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
    avatarHTML = `<div class="default-avatar" style="font-size: 20px;">${emoji}</div>`
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

  postElement.innerHTML = `
        <div class="post-header">
            <div class="post-user">
                <div class="profile-pic">
                    ${avatarHTML}
                </div>
                <div class="post-user-info">
                    <div class="post-user-name">${postData.userName}</div>
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
            <div class="post-action" onclick="toggleComments('${postData.id}', this)">
                <i class="far fa-comment"></i>
                <span>COMMENT${commentCount > 0 ? ` (${commentCount})` : ""}</span>
            </div>
            <div class="post-action">
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
  <input type="text" class="comment-text" placeholder="Write your comment..." onkeypress="handleCommentKeypress(event, '${postData.id}', this)">
  <button class="send-comment" onclick="handleCommentSubmit('${postData.id}', this)">
    <i class="fas fa-paper-plane"></i>
  </button>
</div>
        </div>
    `

  return postElement
}

// Add this function after the createProfilePostElement function
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
    icon.style.color = "#dc3545"
    span.style.color = "#dc3545"
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

// Global functions for profile image handling
window.handleProfileImageLoad = (img, postId) => {
  const container = document.getElementById(`profile-image-container-${postId}`)
  if (container) {
    container.classList.remove("loading")

    const containerClass = getImageContainerClass(img)
    if (containerClass) {
      container.classList.add(containerClass)
    }
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

// Post management functions
function deletePost(postId) {
  if (confirm("Are you sure you want to delete this post?")) {
    let allPosts = JSON.parse(localStorage.getItem("userPosts")) || []
    allPosts = allPosts.filter((post) => post.id !== postId)
    localStorage.setItem("userPosts", JSON.stringify(allPosts))
    loadUserPosts()
  }
}

function markAsClaimed(postId) {
  const allPosts = JSON.parse(localStorage.getItem("userPosts")) || []
  const postIndex = allPosts.findIndex((post) => post.id === postId)
  if (postIndex !== -1) {
    allPosts[postIndex].type = "claimed"
    localStorage.setItem("userPosts", JSON.stringify(allPosts))
    loadUserPosts()
  }
}

function editPost(postId) {
  localStorage.setItem("editPostId", postId)
  window.location.href = "main.html?edit=" + postId
}

// Toggle comments visibility
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

// Comment functionality
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

// Navigation
hamburgerMenu.addEventListener("click", () => {
  sidebar.classList.toggle("active")
})

navFeed.addEventListener("click", () => {
  window.location.href = "main.html"
})

navClaimed.addEventListener("click", () => {
  window.location.href = "claim.html"
})

// Close sidebar when clicking outside on mobile
document.addEventListener("click", (event) => {
  if (window.innerWidth <= 768) {
    if (!sidebar.contains(event.target) && !hamburgerMenu.contains(event.target)) {
      sidebar.classList.remove("active")
    }
  }
})

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

// Initialize profile page
function init() {
  // Check if user has completed setup
  if (!currentUser.completedSetup) {
    // Redirect to setup if not completed
    window.location.href = "setup.html"
    return
  }

  updateProfileDisplay()
  setupEventListeners()
  loadUserPosts()

  // Add this in the init function or at the end of the file
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
          icon.style.color = "#dc3545"
          span.style.color = "#dc3545"
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
        window.dispatchEvent(
          new CustomEvent("likeStateChanged", {
            detail: updateData,
          }),
        )
      }
    }
  })
}

// UPDATED: Enhanced updateProfileDisplay with setup data avatar support
function updateProfileDisplay() {
  const profileNavAvatar = document.getElementById("profile-nav-avatar")
  if (profileNavAvatar) {
    if (currentUser.avatar) {
      // User uploaded image
      profileNavAvatar.innerHTML = `<img src="${currentUser.avatar}" alt="${currentUser.name}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%;">`
    } else if (currentUser.avatarEmoji && currentUser.avatarEmoji !== "👤") {
      // Emoji avatar from setup
      profileNavAvatar.innerHTML = `<div class="default-avatar-nav" style="font-size: 20px;">${currentUser.avatarEmoji}</div>`
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
      profileNavAvatar.innerHTML = `<div class="default-avatar-nav" style="font-size: 20px;">${emoji}</div>`
    } else {
      // Default initials
      const initials = currentUser.name
        .split(" ")
        .map((n) => n[0])
        .join("")
      profileNavAvatar.innerHTML = `<div class="default-avatar-nav">${initials}</div>`
    }
  }

  const profileAvatarLarge = document.querySelector(".profile-avatar-large")
  if (profileAvatarLarge) {
    if (currentUser.avatar) {
      // User uploaded image
      profileAvatarLarge.innerHTML = `<img src="${currentUser.avatar}" alt="${currentUser.name}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%;">`
    } else if (currentUser.avatarEmoji && currentUser.avatarEmoji !== "👤") {
      // Emoji avatar from setup
      profileAvatarLarge.innerHTML = `<div class="default-avatar-large" style="font-size: 60px;">${currentUser.avatarEmoji}</div>`
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
      profileAvatarLarge.innerHTML = `<div class="default-avatar-large" style="font-size: 60px;">${emoji}</div>`
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
  document.getElementById("edit-name").value = currentUser.name
  document.getElementById("edit-username").value = currentUser.username.replace("@", "")
  document.getElementById("edit-contact").value = currentUser.contact

  const profileEditAvatar = document.querySelector(".profile-edit-avatar")
  if (profileEditAvatar) {
    if (currentUser.avatar) {
      // User uploaded image
      profileEditAvatar.innerHTML = `<img src="${currentUser.avatar}" alt="${currentUser.name}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%;">`
    } else if (currentUser.avatarEmoji && currentUser.avatarEmoji !== "👤") {
      // Emoji avatar from setup
      profileEditAvatar.innerHTML = `<div class="default-avatar" style="font-size: 40px;">${currentUser.avatarEmoji}</div>`
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
      profileEditAvatar.innerHTML = `<div class="default-avatar" style="font-size: 40px;">${emoji}</div>`
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

// Setup event listeners
function setupEventListeners() {
  editProfileBtn.addEventListener("click", () => {
    editProfileModal.classList.add("active")
    document.body.style.overflow = "hidden"
  })

  function closeModal() {
    editProfileModal.classList.remove("active")
    document.body.style.overflow = "auto"
  }

  closeEditModalBtn.addEventListener("click", closeModal)
  cancelEditProfileBtn.addEventListener("click", closeModal)

  editProfileModal.addEventListener("click", (e) => {
    if (e.target === editProfileModal) {
      closeModal()
    }
  })

  // UPDATED: Enhanced profile form submission with setup data synchronization and image validation
  profileEditForm.addEventListener("submit", (e) => {
    e.preventDefault()

    const newName = document.getElementById("edit-name").value.trim()
    const newUsername = document.getElementById("edit-username").value.replace("@", "").trim()
    const newContact = document.getElementById("edit-contact").value.trim()

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

    const imageFile = profileImageInput.files[0]
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
        refreshCurrentUser() // Add this line
        updateProfileDisplay()
        loadUserPosts()
        closeModal()
        alert("Profile updated successfully!")
      }
      reader.readAsDataURL(imageFile)
    } else {
      // Use the centralized data synchronization function
      syncUserData(updatedData)
      refreshCurrentUser() // Add this line
      updateProfileDisplay()
      loadUserPosts()
      closeModal()
      alert("Profile updated successfully!")
    }
  })

  // ENHANCED: Profile image input with validation and preview
  profileImageInput.addEventListener("change", (e) => {
    const file = e.target.files[0]

    if (file) {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        alert("Please select a valid image file.")
        e.target.value = ""
        profileFileNameDisplay.textContent = ""
        return
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert("File size must be less than 5MB.")
        e.target.value = ""
        profileFileNameDisplay.textContent = ""
        return
      }

      profileFileNameDisplay.textContent = file.name

      // Show preview
      const reader = new FileReader()
      reader.onload = (e) => {
        const profileEditAvatar = document.querySelector(".profile-edit-avatar")
        if (profileEditAvatar) {
          profileEditAvatar.innerHTML = `<img src="${e.target.result}" alt="Preview" style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%;">`
        }
      }
      reader.readAsDataURL(file)
    } else {
      profileFileNameDisplay.textContent = ""
      updateProfileDisplay() // Reset to current avatar
    }
  })
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

// UPDATED: Enhanced storage event listener to handle setup data changes
window.addEventListener("storage", (e) => {
  if (e.key === "userProfile" || e.key === "ifindUserData") {
    refreshCurrentUser()
    updateProfileDisplay()
    loadUserPosts()
  } else if (e.key === "userPosts") {
    loadUserPosts()
  }
})

// Initialize when DOM is loaded
document.addEventListener("DOMContentLoaded", init)
