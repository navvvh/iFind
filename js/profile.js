// Get user data from localStorage
const storedUser = JSON.parse(localStorage.getItem("mockUser")) || {}

// Create currentUser object
const currentUser = {
  id: 1,
  name: storedUser.username || "Ang Pogi",
  username: storedUser.username ? `@${storedUser.username}` : "@angpogi",
  email: storedUser.email || "user@example.com",
  role: storedUser.role || "STUDENT",
  contact: "fb.com/username",
  avatar: storedUser.avatar || null,
}

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

// Track if we're editing a post
let editingPostId = null

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
    return 'wide-image'
  } else if (aspectRatio < 0.75) {
    return 'tall-image'
  }
  return ''
}

// Create post element for profile page with improved image handling
function createProfilePostElement(postData) {
  const postElement = document.createElement("div")
  postElement.className = "post"
  postElement.dataset.postId = postData.id

  const avatarHTML = postData.avatar
    ? `<img src="${postData.avatar}" alt="${postData.userName}" style="width: 100%; height: 100%; object-fit: cover;">`
    : `<div class="default-avatar">${postData.userInitials}</div>`

  // Create image HTML with proper container - same as main feed
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
            <div class="post-action">
                <i class="far fa-heart"></i>
                <span>Heart</span>
            </div>
            <div class="post-action">
                <i class="far fa-comment"></i>
                <span>COMMENT</span>
            </div>
            <div class="post-action">
                <i class="fas fa-share"></i>
                <span>SHARE</span>
            </div>
        </div>
        <div class="post-comments">
            <div class="comment-input">
                <div class="profile-pic">
                    ${avatarHTML}
                </div>
                <input type="text" class="comment-text" placeholder="Write your comment...">
                <button class="send-comment">
                    <i class="fas fa-paper-plane"></i>
                </button>
            </div>
        </div>
    `

  return postElement
}

// Global functions for profile image handling
window.handleProfileImageLoad = function(img, postId) {
  const container = document.getElementById(`profile-image-container-${postId}`)
  if (container) {
    container.classList.remove('loading')
    
    // Add appropriate class based on image dimensions
    const containerClass = getImageContainerClass(img)
    if (containerClass) {
      container.classList.add(containerClass)
    }
  }
}

window.handleProfileImageError = function(img, postId) {
  const container = document.getElementById(`profile-image-container-${postId}`)
  if (container) {
    container.classList.remove('loading')
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
  // Store the post ID and redirect to main page with edit parameter
  localStorage.setItem("editPostId", postId)
  window.location.href = "main.html?edit=" + postId
}

// Navigation
hamburgerMenu.addEventListener("click", () => {
  sidebar.classList.toggle("active")
})

navFeed.addEventListener("click", () => {
  window.location.href = "main.html"
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
  updateProfileDisplay()
  setupEventListeners()
  loadUserPosts()
}

// Update profile display with current user data
function updateProfileDisplay() {
  const profileNavAvatar = document.getElementById("profile-nav-avatar")
  if (profileNavAvatar) {
    if (currentUser.avatar) {
      profileNavAvatar.innerHTML = `<img src="${currentUser.avatar}" alt="${currentUser.name}">`
    } else {
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
      profileAvatarLarge.innerHTML = `<img src="${currentUser.avatar}" alt="${currentUser.name}">`
    } else {
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
    profileUsernameLarge.textContent = currentUser.username
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

  // Update edit form values (removed role field)
  document.getElementById("edit-name").value = currentUser.name
  document.getElementById("edit-username").value = currentUser.username.replace("@", "")
  document.getElementById("edit-contact").value = currentUser.contact

  const profileEditAvatar = document.querySelector(".profile-edit-avatar")
  if (profileEditAvatar) {
    if (currentUser.avatar) {
      profileEditAvatar.innerHTML = `<img src="${currentUser.avatar}" alt="${currentUser.name}">`
    } else {
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

  // Profile form submission (removed role handling)
  profileEditForm.addEventListener("submit", (e) => {
    e.preventDefault()

    currentUser.name = document.getElementById("edit-name").value
    currentUser.username = "@" + document.getElementById("edit-username").value.replace("@", "")
    currentUser.contact = document.getElementById("edit-contact").value

    const imageFile = profileImageInput.files[0]
    if (imageFile) {
      const reader = new FileReader()
      reader.onload = (e) => {
        currentUser.avatar = e.target.result

        const storedUser = JSON.parse(localStorage.getItem("mockUser")) || {}
        storedUser.avatar = currentUser.avatar
        storedUser.username = currentUser.username.replace("@", "")
        localStorage.setItem("mockUser", JSON.stringify(storedUser))

        updateProfileDisplay()
        closeModal()
      }
      reader.readAsDataURL(imageFile)
    } else {
      const storedUser = JSON.parse(localStorage.getItem("mockUser")) || {}
      storedUser.username = currentUser.username.replace("@", "")
      localStorage.setItem("mockUser", JSON.stringify(storedUser))

      updateProfileDisplay()
      closeModal()
    }
  })

  profileImageInput.addEventListener("change", (e) => {
    if (e.target.files.length > 0) {
      profileFileNameDisplay.textContent = e.target.files[0].name
    } else {
      profileFileNameDisplay.textContent = ""
    }
  })
}

// Listen for storage changes
window.addEventListener("storage", (e) => {
  if (e.key === "userPosts") {
    loadUserPosts()
  }
})

document.addEventListener("visibilitychange", () => {
  if (!document.hidden) {
    loadUserPosts()
  }
})

document.addEventListener("DOMContentLoaded", init)