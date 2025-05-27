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
const profilePicNav = document.getElementById("profile-pic-nav")
const navProfile = document.getElementById("nav-profile")

// Store all posts for filtering
let allPosts = []
const currentFilters = {
  types: [],
  locations: [],
}

// Track if we're editing a post
let editingPostId = null

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

// Get current user data
function getCurrentUser() {
  const storedUser = JSON.parse(localStorage.getItem("mockUser")) || {}
  return {
    name: storedUser.username || "You",
    username: storedUser.username ? `@${storedUser.username}` : "@user",
    role: storedUser.role || "STUDENT",
    initials: storedUser.username ? storedUser.username.substring(0, 2).toUpperCase() : "AP",
    avatar: storedUser.avatar || null,
  }
}

// Navigation - Go to Profile
profilePicNav.addEventListener("click", () => {
  window.location.href = "profile.html"
})

navProfile.addEventListener("click", () => {
  window.location.href = "profile.html"
})

// Mobile sidebar toggle
hamburgerMenu.addEventListener("click", () => {
  sidebar.classList.toggle("active")
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
  
  // Update modal title and button text back to default
  const modalTitle = document.querySelector("#post-modal h2")
  const submitButton = document.querySelector("#post-modal button[type='submit']")
  if (modalTitle) modalTitle.textContent = "Create New Post"
  if (submitButton) submitButton.textContent = "Post"
  
  // Clear image preview
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

// File input handler with preview
fileInput.addEventListener("change", (event) => {
  const file = event.target.files[0]
  const imagePreview = document.getElementById("image-preview")
  
  if (file) {
    fileName.textContent = file.name
    
    // Show image preview
    const reader = new FileReader()
    reader.onload = (e) => {
      imagePreview.innerHTML = `<img src="${e.target.result}" alt="Preview">`
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
  // Get selected types
  currentFilters.types = []
  document.querySelectorAll(".filter-checkbox[data-type]").forEach((checkbox) => {
    if (checkbox.checked) {
      currentFilters.types.push(checkbox.dataset.type)
    }
  })

  // Get selected locations
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

  // Clear current posts (except empty state)
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
    return 'wide-image'
  } else if (aspectRatio < 0.75) {
    return 'tall-image'
  }
  return ''
}

// Create post element function with improved image handling
function createPostElement(postData, index) {
  const postElement = document.createElement("div")
  postElement.className = "post"
  postElement.dataset.type = postData.type
  postElement.dataset.location = postData.location
  postElement.dataset.postId = postData.id

  const avatarHTML = postData.avatar
    ? `<img src="${postData.avatar}" alt="${postData.userName}" style="width: 100%; height: 100%; object-fit: cover;">`
    : `<div class="default-avatar" style="display: flex;">${postData.userInitials}</div>`

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
                    <img src="/placeholder.svg" alt="Your Avatar" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
                    <div class="default-avatar" style="display: none;">AP</div>
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

// Global functions for image handling
window.handleImageLoad = function(img, postId) {
  const container = document.getElementById(`image-container-${postId}`)
  if (container) {
    container.classList.remove('loading')
    
    // Add appropriate class based on image dimensions
    const containerClass = getImageContainerClass(img)
    if (containerClass) {
      container.classList.add(containerClass)
    }
  }
}

window.handleImageError = function(img, postId) {
  const container = document.getElementById(`image-container-${postId}`)
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
    allPosts = allPosts.filter((post) => post.id !== postId)
    savePostsToStorage()
    filterPosts()
  }
}

function markAsClaimed(postId) {
  const postIndex = allPosts.findIndex((post) => post.id === postId)
  if (postIndex !== -1) {
    allPosts[postIndex].type = "claimed"
    savePostsToStorage()
    filterPosts()
  }
}

function editPost(postId) {
  const post = allPosts.find((p) => p.id === postId)
  if (!post) return

  // Set editing mode
  editingPostId = postId

  // Populate form with existing data
  document.getElementById("post-type").value = post.type
  document.getElementById("post-location").value = post.location
  document.getElementById("post-description").value = post.description

  // Handle existing image
  if (post.image) {
    const imagePreview = document.getElementById("image-preview")
    imagePreview.innerHTML = `<img src="${post.image}" alt="Current image">`
    imagePreview.style.display = "block"
    fileName.textContent = "Current image"
  }

  // Update modal title and button text
  const modalTitle = document.querySelector("#post-modal h2")
  const submitButton = document.querySelector("#post-modal button[type='submit']")
  if (modalTitle) modalTitle.textContent = "Edit Post"
  if (submitButton) submitButton.textContent = "Update Post"

  // Open modal
  openPostModal()
}

// Toggle post options dropdown
function togglePostOptions(element) {
  const dropdown = element.querySelector(".post-options-dropdown")
  const isVisible = dropdown.style.display === "block"

  // Hide all other dropdowns
  document.querySelectorAll(".post-options-dropdown").forEach((d) => {
    d.style.display = "none"
  })

  // Toggle current dropdown
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

// Form submission
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
      
      // Only update image if a new one was selected
      if (postImage) {
        allPosts[postIndex].image = URL.createObjectURL(postImage)
      }
      
      allPosts[postIndex].timestamp = new Date()
    }
  } else {
    // Create new post
    const newPost = {
      id: Date.now().toString(),
      type: postType,
      location: postLocation,
      description: postDescription,
      image: postImage ? URL.createObjectURL(postImage) : null,
      userName: currentUser.name,
      userHandle: currentUser.username,
      userRole: currentUser.role,
      userInitials: currentUser.initials,
      avatar: currentUser.avatar,
      timestamp: new Date(),
      userId: "current_user",
    }

    // Add to posts array
    allPosts.unshift(newPost)
  }

  // Save to localStorage for syncing with profile
  savePostsToStorage()

  // Refresh display
  filterPosts()

  closePostModal()
})

// Initialize page
document.addEventListener("DOMContentLoaded", () => {
  loadPostsFromStorage()
})