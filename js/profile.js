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

        // Navigation - Hamburger menu shows sidebar
        hamburgerMenu.addEventListener("click", () => {
            sidebar.classList.toggle("active")
        })

        // Navigation - Feed button goes back to main page
        navFeed.addEventListener("click", () => {
            window.location.href = "../html/main.html"
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
            const dropdown = element.querySelector('.post-options-dropdown');
            const isVisible = dropdown.style.display === 'block';
            
            // Hide all other dropdowns
            document.querySelectorAll('.post-options-dropdown').forEach(d => {
                d.style.display = 'none';
            });
            
            // Toggle current dropdown
            dropdown.style.display = isVisible ? 'none' : 'block';
        }

        // Close dropdowns when clicking outside
        document.addEventListener('click', function(event) {
            if (!event.target.closest('.post-options')) {
                document.querySelectorAll('.post-options-dropdown').forEach(dropdown => {
                    dropdown.style.display = 'none';
                });
            }
        });

        // Initialize profile page
        function init() {
            updateProfileDisplay()
            setupEventListeners()
        }

        // Update profile display with current user data
        function updateProfileDisplay() {
            // Update profile avatar in nav
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

            // Update large profile avatar
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

            // Update profile info
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

            // Update edit form values
            document.getElementById("edit-name").value = currentUser.name
            document.getElementById("edit-username").value = currentUser.username.replace("@", "")
            document.getElementById("edit-role").value = currentUser.role
            document.getElementById("edit-contact").value = currentUser.contact

            // Update edit form avatar
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
            // Edit profile button
            editProfileBtn.addEventListener("click", () => {
                editProfileModal.classList.add("active")
                document.body.style.overflow = "hidden"
            })

            // Close modal functions
            function closeModal() {
                editProfileModal.classList.remove("active")
                document.body.style.overflow = "auto"
            }

            closeEditModalBtn.addEventListener("click", closeModal)
            cancelEditProfileBtn.addEventListener("click", closeModal)

            // Close modal when clicking outside
            editProfileModal.addEventListener("click", (e) => {
                if (e.target === editProfileModal) {
                    closeModal()
                }
            })

            // Profile form submission
            profileEditForm.addEventListener("submit", (e) => {
                e.preventDefault()

                // Update user data
                currentUser.name = document.getElementById("edit-name").value
                currentUser.username = "@" + document.getElementById("edit-username").value.replace("@", "")
                currentUser.role = document.getElementById("edit-role").value
                currentUser.contact = document.getElementById("edit-contact").value

                const imageFile = profileImageInput.files[0]
                if (imageFile) {
                    const reader = new FileReader()
                    reader.onload = (e) => {
                        currentUser.avatar = e.target.result

                        // Update localStorage
                        const storedUser = JSON.parse(localStorage.getItem("mockUser")) || {}
                        storedUser.avatar = currentUser.avatar
                        storedUser.username = currentUser.username.replace("@", "")
                        storedUser.role = currentUser.role
                        localStorage.setItem("mockUser", JSON.stringify(storedUser))

                        // Update display
                        updateProfileDisplay()
                        closeModal()
                    }
                    reader.readAsDataURL(imageFile)
                } else {
                    // Update localStorage without new image
                    const storedUser = JSON.parse(localStorage.getItem("mockUser")) || {}
                    storedUser.username = currentUser.username.replace("@", "")
                    storedUser.role = currentUser.role
                    localStorage.setItem("mockUser", JSON.stringify(storedUser))

                    // Update display
                    updateProfileDisplay()
                    closeModal()
                }
            })

            // Display file name when selected
            profileImageInput.addEventListener("change", (e) => {
                if (e.target.files.length > 0) {
                    profileFileNameDisplay.textContent = e.target.files[0].name
                } else {
                    profileFileNameDisplay.textContent = ""
                }
            })
        }

        // Initialize the profile page when the DOM is loaded
        document.addEventListener("DOMContentLoaded", init)