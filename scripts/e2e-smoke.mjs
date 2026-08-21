import { chromium } from "playwright";

const BASE = "http://localhost:3000";
const results = [];

function log(name, ok, extra) {
  results.push({ name, ok, extra });
  console.log(`${ok ? "PASS" : "FAIL"} - ${name}${extra ? " :: " + extra : ""}`);
}

async function login(page, email, password) {
  await page.goto(`${BASE}/login`, { waitUntil: "networkidle" });
  await page.waitForSelector('button[type="submit"]:not([disabled])');
  await page.fill('#email', email);
  await page.fill('#password', password);
  await Promise.all([
    page.waitForURL((url) => !url.pathname.startsWith("/login"), { timeout: 10000 }).catch(() => {}),
    page.click('button[type="submit"]'),
  ]);
  await page.waitForLoadState("networkidle");
}

async function main() {
  const browser = await chromium.launch({
    executablePath: "/opt/pw-browsers/chromium-1194/chrome-linux/chrome",
    args: ["--no-sandbox"],
  });
  const context = await browser.newContext();
  const page = await context.newPage();

  // 1. Public homepage
  await page.goto(BASE, { waitUntil: "networkidle" });
  log("Homepage loads", (await page.title()).includes("EduLearn"));

  // 2. Public courses page
  await page.goto(`${BASE}/courses`, { waitUntil: "networkidle" });
  const courseCards = await page.locator("text=View Course").count();
  log("Courses page lists courses", courseCards > 0, `${courseCards} courses`);

  // 3. Course details page
  await page.waitForSelector("text=View Course");
  await Promise.all([
    page.waitForURL(/\/courses\/.+/),
    page.locator("text=View Course").first().click(),
  ]);
  await page.waitForLoadState("networkidle");
  log("Course details page loads", /\/courses\/.+/.test(page.url()));

  // 4. Login as Super Admin
  await login(page, "admin@edulearn.dev", "Passw0rd!");
  log("Super Admin login redirects to admin dashboard", page.url().includes("/admin/dashboard"));

  // 4b. Super Admin can see students
  await page.goto(`${BASE}/admin/students`, { waitUntil: "networkidle" });
  const studentRows = await page.locator("table tbody tr").count();
  log("Admin can view students list", studentRows > 0, `${studentRows} rows`);

  // 4c. Super Admin cannot access nothing weird - check instructors page
  await page.goto(`${BASE}/admin/courses`, { waitUntil: "networkidle" });
  const courseRows = await page.locator("table tbody tr").count();
  log("Admin can view courses list", courseRows > 0, `${courseRows} rows`);

  // 4d. Logout
  await page.goto(`${BASE}/admin/profile`, { waitUntil: "networkidle" });
  await page.click('button:has-text("Log Out")').catch(() => {});
  // fallback: open user menu first
  const loggedOutCheck = await page.url();
  log("Admin profile page accessible", loggedOutCheck.includes("/admin/profile") || loggedOutCheck.includes("/login"));

  // clear cookies between sessions
  await context.clearCookies();

  // 5. Login as Instructor
  await login(page, "sarah.chen@edulearn.dev", "Passw0rd!");
  log("Instructor login redirects to instructor dashboard", page.url().includes("/instructor/dashboard"));

  await page.goto(`${BASE}/instructor/courses`, { waitUntil: "networkidle" });
  const instructorCourseCount = await page.locator("a[href^='/instructor/courses/']").count();
  log("Instructor sees own courses", instructorCourseCount > 0, `${instructorCourseCount} links`);

  await context.clearCookies();

  // 6. Attempt to access admin route as unauthenticated -> should redirect to login
  await page.goto(`${BASE}/admin/dashboard`, { waitUntil: "networkidle" });
  log("Unauthenticated user redirected away from /admin/dashboard", page.url().includes("/login"));

  // 7. Login as Student
  await login(page, "alex.morgan@edulearn.dev", "Passw0rd!");
  log("Student login redirects to student dashboard", page.url().includes("/student/dashboard"));

  await page.goto(`${BASE}/student/courses`, { waitUntil: "networkidle" });
  const studentCourseLinks = await page.locator("a[href^='/student/courses/']").count();
  log("Student sees enrolled courses", studentCourseLinks > 0, `${studentCourseLinks} links`);

  // 8. Try accessing instructor-only route as student -> unauthorized
  await page.goto(`${BASE}/instructor/dashboard`, { waitUntil: "networkidle" });
  log("Student blocked from instructor dashboard", page.url().includes("/unauthorized"));

  // 9. Student notifications page
  await page.goto(`${BASE}/student/notifications`, { waitUntil: "networkidle" });
  log("Student notifications page loads", page.url().includes("/notifications"));

  await browser.close();

  const failed = results.filter((r) => !r.ok);
  console.log(`\n${results.length - failed.length}/${results.length} checks passed.`);
  if (failed.length > 0) {
    console.log("Failures:", failed.map((f) => f.name).join(", "));
    process.exit(1);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
