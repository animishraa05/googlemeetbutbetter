#!/usr/bin/env node
/**
 * Test script for authentication system.
 * Run: NODE_ENV=development node test-auth.js
 * 
 * Note: Make sure server is running: npm run dev
 */

const API_BASE = "http://localhost:3001";

// Use a random IP header to avoid rate limiting during tests
const testHeaders = {
  "Content-Type": "application/json",
  "X-Forwarded-For": `10.0.0.${Math.floor(Math.random() * 255)}`,
};

const testUser = {
  email: `test+${Date.now()}@example.com`,
  password: "TestPass123",
  name: "Test User",
  role: "teacher",
};

let accessToken, refreshToken;

async function request(url, options = {}) {
  const res = await fetch(`${API_BASE}${url}`, {
    ...options,
    headers: {
      ...testHeaders,
      ...options.headers,
    },
  });
  const data = await res.json();
  return { status: res.status, data };
}

async function runTests() {
  console.log("🧪 Testing Authentication System\n");

  // Test 1: Register
  console.log("1️⃣  Testing POST /auth/register");
  const registerRes = await request("/auth/register", {
    method: "POST",
    body: JSON.stringify(testUser),
  });
  console.log(`   Status: ${registerRes.status}`);
  if (registerRes.status === 201) {
    console.log("   ✅ Registration successful");
    accessToken = registerRes.data.tokens.accessToken;
    refreshToken = registerRes.data.tokens.refreshToken;
  } else {
    console.log("   ❌ Registration failed:", registerRes.data.error);
  }

  // Test 2: Duplicate registration
  console.log("\n2️⃣  Testing duplicate registration");
  const dupRes = await request("/auth/register", {
    method: "POST",
    body: JSON.stringify(testUser),
  });
  console.log(`   Status: ${dupRes.status}`);
  if (dupRes.status === 409) {
    console.log("   ✅ Correctly rejected duplicate email");
  } else {
    console.log("   ❌ Should have rejected duplicate");
  }

  // Test 3: Login
  console.log("\n3️⃣  Testing POST /auth/login");
  const loginRes = await request("/auth/login", {
    method: "POST",
    body: JSON.stringify({
      email: testUser.email,
      password: testUser.password,
    }),
  });
  console.log(`   Status: ${loginRes.status}`);
  if (loginRes.status === 200) {
    console.log("   ✅ Login successful");
    accessToken = loginRes.data.tokens.accessToken;
    refreshToken = loginRes.data.tokens.refreshToken;
  } else {
    console.log("   ❌ Login failed:", loginRes.data.error);
  }

  // Test 4: Invalid login
  console.log("\n4️⃣  Testing invalid credentials");
  const invalidRes = await request("/auth/login", {
    method: "POST",
    body: JSON.stringify({
      email: testUser.email,
      password: "WrongPassword123",
    }),
  });
  console.log(`   Status: ${invalidRes.status}`);
  if (invalidRes.status === 401) {
    console.log("   ✅ Correctly rejected invalid password");
  } else {
    console.log("   ❌ Should have rejected invalid password");
  }

  // Test 5: Get current user (protected route)
  console.log("\n5️⃣  Testing GET /auth/me (protected)");
  const meRes = await request("/auth/me", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
  console.log(`   Status: ${meRes.status}`);
  if (meRes.status === 200) {
    console.log("   ✅ Retrieved user info:", meRes.data.user.name);
  } else {
    console.log("   ❌ Failed to get user info:", meRes.data.error);
  }

  // Test 6: Access protected route without token
  console.log("\n6️⃣  Testing protected route without token");
  const noTokenRes = await request("/auth/me", { method: "GET" });
  console.log(`   Status: ${noTokenRes.status}`);
  if (noTokenRes.status === 401) {
    console.log("   ✅ Correctly rejected unauthenticated request");
  } else {
    console.log("   ❌ Should have rejected unauthenticated request");
  }

  // Test 7: Refresh token
  console.log("\n7️⃣  Testing POST /auth/refresh");
  const refreshRes = await request("/auth/refresh", {
    method: "POST",
    body: JSON.stringify({ refreshToken }),
  });
  console.log(`   Status: ${refreshRes.status}`);
  if (refreshRes.status === 200) {
    console.log("   ✅ Token refreshed successfully");
    accessToken = refreshRes.data.tokens.accessToken;
  } else {
    console.log("   ❌ Token refresh failed:", refreshRes.data.error);
  }

  // Test 8: Validation errors
  console.log("\n8️⃣  Testing validation (weak password)");
  const weakPassRes = await request("/auth/register", {
    method: "POST",
    body: JSON.stringify({
      email: "test2@example.com",
      password: "weak", // Too short, no number
      name: "Test",
      role: "student",
    }),
  });
  console.log(`   Status: ${weakPassRes.status}`);
  if (weakPassRes.status === 400) {
    console.log("   ✅ Correctly rejected weak password:", weakPassRes.data.error);
  } else {
    console.log("   ❌ Should have rejected weak password");
  }

  // Test 9: Logout
  console.log("\n9️⃣  Testing POST /auth/logout");
  const logoutRes = await request("/auth/logout", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({ refreshToken }),
  });
  console.log(`   Status: ${logoutRes.status}`);
  if (logoutRes.status === 200) {
    console.log("   ✅ Logout successful");
  } else {
    console.log("   ❌ Logout failed:", logoutRes.data.error);
  }

  console.log("\n✅ Authentication tests completed!\n");
}

runTests().catch((err) => {
  console.error("❌ Test suite failed:", err.message);
  console.error("Make sure the server is running: npm run dev");
  process.exit(1);
});
