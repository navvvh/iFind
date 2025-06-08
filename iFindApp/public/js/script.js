console.log("🔧 Fixed script.js loaded");

//const API_URL = "http://127.0.0.1:3001";
const container = document.getElementById("container");
const registerBtn = document.getElementById("register");
const loginBtn = document.getElementById("login");

document.addEventListener("DOMContentLoaded", () => {
  console.log("DOM loaded");

  const signupForm = document.getElementById("signup-form");
  const loginForm = document.getElementById("login-form");

  if (!signupForm && !loginForm) {
    console.error("❌ No forms found. Check HTML.");
    return;
  }

  testAPIConnection();

  if (registerBtn) {
    registerBtn.addEventListener("click", (e) => {
      e.preventDefault();
      container.classList.add("active");
    });
  }

  if (loginBtn) {
    loginBtn.addEventListener("click", (e) => {
      e.preventDefault();
      container.classList.remove("active");
    });
  }

  if (signupForm) {
    signupForm.addEventListener("submit", handleSignup);
  }

  if (loginForm) {
    loginForm.addEventListener("submit", handleLogin);
  }
});

function showError(message) {
  const Swal = window.Swal;
  if (Swal) {
    Swal.fire({ icon: "error", title: "Oops...", text: message });
  } else {
    alert("Error: " + message);
  }
}

function showSuccess(message) {
  const Swal = window.Swal;
  if (Swal) {
    Swal.fire({ icon: "success", title: "Success!", text: message });
  } else {
    alert("Success: " + message);
  }
}

async function testAPIConnection() {
  try {
    const res = await fetch(`${API_URL}/health`);
    if (!res.ok) throw new Error(`Status: ${res.status}`);
    const data = await res.json();
    console.log("✅ API Health Check:", data);
    return true;
  } catch (err) {
    console.error("❌ API not reachable:", err);
    showError("Cannot connect to API server on port 3001.");
    return false;
  }
}


async function handleSignup(event) {
  event.preventDefault();
  const username = document.getElementById("signup-username").value.trim();
  const email = document.getElementById("signup-email").value.trim();
  const password = document.getElementById("signup-password").value;

  if (!username || !email || !password) return showError("All fields required.");
  if (password.length < 6) return showError("Password must be at least 6 characters.");
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return showError("Invalid email address.");

  try {
    const res = await fetch(`${API_URL}/users`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        full_name: username,
        email,
        password,
        user_type: "Student",
      }),
    });

    const data = await res.json();
    console.log("Signup response:", data);

    if (data.success) {
      localStorage.setItem("ifindUserData", JSON.stringify(data.data));
      showSuccess("Account created!");
      container.classList.remove("active");
      document.getElementById("signup-form").reset();
    } else {
      showError(data.error || "Could not create user.");
    }
  } catch (err) {
    console.error("Signup error:", err);
    showError("Something went wrong. Try again.");
  }
}

async function handleLogin(event) {
  event.preventDefault();
  const email = document.getElementById("login-email").value.trim();
  const password = document.getElementById("login-password").value;

  if (!email || !password) return showError("All fields required.");

  try {
    const res = await fetch(`${API_URL}/users/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();
    console.log("Login response:", data);

    if (!data.success) return showError(data.error || "Invalid login credentials.");

    const user = data.data;
    const userData = {
      id: user.user_id,
      name: user.full_name,
      email: user.email,
      role: user.user_type.toLowerCase(),
      username: user.username || "",
      completedSetup: user.completed_setup || false,
    };

    localStorage.setItem("ifindUserData", JSON.stringify(userData));
    showSuccess("Login successful!");

    setTimeout(() => {
      window.location.href = userData.completedSetup ? "main.html" : "setup.html";
    }, 1500);
  } catch (err) {
    console.error("Login error:", err);
    showError("Login failed. Please try again.");
  }
}
