// Example of how to integrate the API with your main.js file

// Declare variables before using them
let allPosts = []
const editingPostId = null
const postForm = document.getElementById("post-form")
const iFindAPI = {
  Post: {
    getAllPosts: async () => {
      // Mock implementation for demonstration
      return { success: true, data: [] }
    },
    createPost: async (postData) => {
      // Mock implementation for demonstration
      return { success: true }
    },
    updatePost: async (postId, postData) => {
      // Mock implementation for demonstration
      return { success: true }
    },
    deletePost: async (postId) => {
      // Mock implementation for demonstration
      return { success: true }
    },
  },
  Comment: {
    addComment: async (commentData) => {
      // Mock implementation for demonstration
      return { success: true }
    },
    getCommentsForPost: async (postId) => {
      // Mock implementation for demonstration
      return { success: true, data: [] }
    },
  },
}

function getCurrentUser() {
  // Mock implementation for demonstration
  return { completedSetup: true, id: 1 }
}

function closePostModal() {
  // Mock implementation for demonstration
  console.log("Post modal closed")
}

function addNotification(type, title, message) {
  // Mock implementation for demonstration
  console.log(`Notification (${type}): ${title} - ${message}`)
}

function createCommentsHTML(comments) {
  // Mock implementation for demonstration
  return comments.map((comment) => `<div>${comment.comment_text}</div>`).join("")
}

function initializeUserAvatar() {
  // Mock implementation for demonstration
  console.log("User avatar initialized")
}

function updateNotificationBadge() {
  // Mock implementation for demonstration
  console.log("Notification badge updated")
}

// When the page loads, fetch posts from the API instead of localStorage
async function loadPostsFromAPI() {
  try {
    const response = await iFindAPI.Post.getAllPosts()

    if (response.success) {
      allPosts = response.data
      filterPosts() // Your existing function to display posts
    } else {
      console.error("Failed to load posts:", response.error)
    }
  } catch (error) {
    console.error("Error loading posts:", error)
    // Fallback to localStorage if API fails
    loadPostsFromStorage()
  }
}

function loadPostsFromStorage() {
  // Mock implementation for demonstration
  console.log("Loading posts from localStorage")
}

// Replace your existing post form submission with API call
postForm.addEventListener("submit", async (event) => {
  event.preventDefault()

  const postType = document.getElementById("post-type").value
  const postLocation = document.getElementById("post-location").value
  const postDescription = document.getElementById("post-description").value
  const postImage = document.getElementById("post-image").files[0]
  const currentUser = getCurrentUser()

  // First, handle image upload if there is one
  let imagePath = null
  if (postImage) {
    // You'll need to implement image upload to your server
    // For now, we'll use a placeholder
    imagePath = "/images/placeholder.jpg"
  }

  if (editingPostId) {
    // Update existing post
    try {
      const response = await iFindAPI.Post.updatePost(editingPostId, {
        title: postDescription.substring(0, 50), // Use first 50 chars as title
        description: postDescription,
        campus: postLocation,
        post_type: postType,
        image_path: imagePath,
      })

      if (response.success) {
        // Refresh posts from API
        await loadPostsFromAPI()
        closePostModal()
        addNotification("edit", "Post Updated!", "Your post has been updated successfully")
      } else {
        alert("Failed to update post: " + response.error)
      }
    } catch (error) {
      console.error("Error updating post:", error)
      alert("An error occurred while updating your post.")
    }
  } else {
    // Create new post
    try {
      const response = await iFindAPI.Post.createPost({
        user_id: currentUser.id || 1, // Use actual user ID if available
        title: postDescription.substring(0, 50), // Use first 50 chars as title
        description: postDescription,
        campus: postLocation,
        post_type: postType,
        image_path: imagePath,
      })

      if (response.success) {
        // Refresh posts from API
        await loadPostsFromAPI()
        closePostModal()
        addNotification("found", "Post Created!", `Your ${postType} item post has been created successfully`)
      } else {
        alert("Failed to create post: " + response.error)
      }
    } catch (error) {
      console.error("Error creating post:", error)
      alert("An error occurred while creating your post.")
    }
  }
})

// Replace your existing comment submission with API call
function submitComment(postId, commentText, commentInput) {
  if (!commentText.trim()) return

  const currentUser = getCurrentUser()

  // Call the API to add a comment
  iFindAPI.Comment.addComment({
    post_id: postId,
    user_id: currentUser.id || 1, // Use actual user ID if available
    comment_text: commentText.trim(),
  })
    .then((response) => {
      if (response.success) {
        // Clear the input field
        commentInput.value = ""

        // Refresh the comments for this post
        iFindAPI.Comment.getCommentsForPost(postId)
          .then((commentsResponse) => {
            if (commentsResponse.success) {
              // Update the UI with the new comments
              const postElement = document.querySelector(`[data-post-id="${postId}"]`)
              const commentsList = postElement.querySelector(".comments-list")
              const commentCount = commentsResponse.data.length

              // Update comments HTML
              commentsList.innerHTML = createCommentsHTML(commentsResponse.data)

              // Update comment count in button
              const commentButton = postElement.querySelector('.post-action[onclick*="toggleComments"]')
              const commentSpan = commentButton.querySelector("span")
              commentSpan.textContent = `COMMENT${commentCount > 0 ? ` (${commentCount})` : ""}`

              // Show notification
              addNotification("comment", "Comment Added!", "You commented on this post")
            }
          })
          .catch((error) => {
            console.error("Error refreshing comments:", error)
          })
      } else {
        console.error("Failed to add comment:", response.error)
      }
    })
    .catch((error) => {
      console.error("Error adding comment:", error)
    })
}

// Replace your existing delete post function with API call
function deletePost(postId) {
  if (confirm("Are you sure you want to delete this post?")) {
    iFindAPI.Post.deletePost(postId)
      .then((response) => {
        if (response.success) {
          // Remove the post from the local array
          allPosts = allPosts.filter((post) => post.id !== postId)
          // Update the UI
          filterPosts()
          // Show notification
          addNotification("delete", "Post Deleted!", "Your post has been deleted successfully")
        } else {
          console.error("Failed to delete post:", response.error)
          alert("Failed to delete post: " + response.error)
        }
      })
      .catch((error) => {
        console.error("Error deleting post:", error)
        alert("An error occurred while deleting your post.")
      })
  }
}

function filterPosts() {
  // Mock implementation for demonstration
  console.log("Filtering posts")
}

// Update the document ready function to use the API
document.addEventListener("DOMContentLoaded", () => {
  // Check if user has completed setup
  const currentUser = getCurrentUser()
  if (!currentUser.completedSetup) {
    // Redirect to setup if not completed
    window.location.href = "setup.html"
    return
  }

  initializeUserAvatar()
  loadPostsFromAPI() // Use API instead of localStorage
  updateNotificationBadge()
})
