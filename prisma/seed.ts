/**
 * Development seed script.
 * Run with: npm run db:seed
 *
 * Creates a realistic demo dataset: 1 Super Admin, 2 Instructors, 6 Students,
 * 7 categories, 6 courses (with modules + lessons), enrollments in every
 * status, meetings, announcements, conversations/messages and notifications.
 *
 * All demo accounts use the password: Passw0rd!
 */
import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const DEMO_PASSWORD = "Passw0rd!";

function slugify(text: string) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

async function main() {
  console.log("Seeding database...");
  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 10);

  // Clean slate (order matters due to FKs; children first)
  await prisma.$transaction([
    prisma.notification.deleteMany(),
    prisma.message.deleteMany(),
    prisma.conversation.deleteMany(),
    prisma.announcement.deleteMany(),
    prisma.meeting.deleteMany(),
    prisma.lessonProgress.deleteMany(),
    prisma.enrollment.deleteMany(),
    prisma.lessonMaterial.deleteMany(),
    prisma.lesson.deleteMany(),
    prisma.module.deleteMany(),
    prisma.course.deleteMany(),
    prisma.category.deleteMany(),
    prisma.activityLog.deleteMany(),
    prisma.passwordResetToken.deleteMany(),
    prisma.studentProfile.deleteMany(),
    prisma.instructorProfile.deleteMany(),
    prisma.user.deleteMany(),
  ]);

  // ---------------- USERS ----------------
  const admin = await prisma.user.create({
    data: {
      name: "Olivia Bennett",
      email: "admin@edulearn.dev",
      passwordHash,
      role: "SUPER_ADMIN",
      status: "ACTIVE",
      phone: "+1 (555) 010-0001",
    },
  });

  const sarah = await prisma.user.create({
    data: {
      name: "Sarah Chen",
      email: "sarah.chen@edulearn.dev",
      passwordHash,
      role: "INSTRUCTOR",
      status: "ACTIVE",
      phone: "+1 (555) 010-0002",
      instructorProfile: {
        create: {
          title: "Senior Full Stack Instructor",
          bio: "8+ years building production web applications and teaching full stack development. Passionate about helping students ship real projects.",
          expertise: "JavaScript, React, Next.js, Node.js, PostgreSQL",
          yearsExperience: 8,
        },
      },
    },
  });

  const james = await prisma.user.create({
    data: {
      name: "James Patel",
      email: "james.patel@edulearn.dev",
      passwordHash,
      role: "INSTRUCTOR",
      status: "ACTIVE",
      phone: "+1 (555) 010-0003",
      instructorProfile: {
        create: {
          title: "Data Science & AI Instructor",
          bio: "Former data scientist at a Fortune 500 company, now focused full-time on teaching practical machine learning and cybersecurity fundamentals.",
          expertise: "Python, Machine Learning, Data Analysis, Cybersecurity",
          yearsExperience: 6,
        },
      },
    },
  });

  const studentSeeds = [
    { name: "Alex Morgan", email: "alex.morgan@edulearn.dev" },
    { name: "Priya Sharma", email: "priya.sharma@edulearn.dev" },
    { name: "Liam O'Connor", email: "liam.oconnor@edulearn.dev" },
    { name: "Mia Rodriguez", email: "mia.rodriguez@edulearn.dev" },
    { name: "Noah Kim", email: "noah.kim@edulearn.dev" },
    { name: "Ava Johnson", email: "ava.johnson@edulearn.dev" },
  ];

  const students = [];
  for (const s of studentSeeds) {
    const student = await prisma.user.create({
      data: {
        name: s.name,
        email: s.email,
        passwordHash,
        role: "STUDENT",
        status: "ACTIVE",
        phone: "+1 (555) 020-0000",
        studentProfile: { create: { bio: `Aspiring learner exploring new skills on EduLearn.` } },
      },
    });
    students.push(student);
  }
  const [alex, priya, liam, mia, noah, ava] = students;

  // ---------------- CATEGORIES ----------------
  const categoryNames = [
    "Web Development",
    "Mobile Development",
    "Database",
    "Programming",
    "UI/UX Design",
    "AI & Machine Learning",
    "Cybersecurity",
  ];
  const categories: Record<string, Awaited<ReturnType<typeof prisma.category.create>>> = {};
  for (const name of categoryNames) {
    categories[name] = await prisma.category.create({
      data: { name, slug: slugify(name), status: "ACTIVE", description: `Courses focused on ${name.toLowerCase()}.` },
    });
  }

  // ---------------- COURSES ----------------
  const fullStack = await prisma.course.create({
    data: {
      title: "Full Stack Web Development",
      slug: slugify("Full Stack Web Development"),
      description:
        "Learn to build complete, production-ready web applications from scratch — from HTML/CSS fundamentals through React, Next.js, databases and REST APIs.",
      categoryId: categories["Web Development"].id,
      instructorId: sarah.id,
      level: "BEGINNER",
      duration: "10 weeks",
      objectives: [
        "Build responsive websites with HTML, CSS and JavaScript",
        "Create dynamic UIs with React and Next.js",
        "Design and query relational databases",
        "Build and consume REST APIs",
      ],
      requirements: ["A computer with internet access", "No prior programming experience required"],
      status: "ACTIVE",
      thumbnailUrl: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&auto=format&fit=crop&q=80",
      modules: {
        create: [
          {
            title: "HTML, CSS & JavaScript",
            order: 0,
            lessons: {
              create: [
                { title: "Introduction to HTML", order: 0, contentType: "TEXT", textContent: "HTML is the standard markup language for web pages. In this lesson we cover tags, elements, and document structure.", durationMinutes: 20 },
                { title: "Styling with CSS", order: 1, contentType: "VIDEO", videoUrl: "https://www.youtube.com/watch?v=1PnVor36_40", durationMinutes: 35 },
                { title: "JavaScript Fundamentals", order: 2, contentType: "VIDEO", videoUrl: "https://www.youtube.com/watch?v=W6NZfCO5SIk", durationMinutes: 45 },
                { title: "Module 1 Assignment: Build a Landing Page", order: 3, contentType: "ASSIGNMENT", assignmentInstructions: "Build a single-page responsive landing page using only HTML and CSS. Submit your GitHub repo link in the notes.", durationMinutes: 60 },
              ],
            },
          },
          {
            title: "React & Next.js",
            order: 1,
            lessons: {
              create: [
                { title: "React Components & Props", order: 0, contentType: "VIDEO", videoUrl: "https://www.youtube.com/watch?v=SqcY0GlETPk", durationMinutes: 40 },
                { title: "State & Hooks", order: 1, contentType: "TEXT", textContent: "React hooks like useState and useEffect let you manage component state and side effects without writing a class.", durationMinutes: 30 },
                { title: "Routing with Next.js App Router", order: 2, contentType: "EXTERNAL_LINK", externalUrl: "https://nextjs.org/docs/app", durationMinutes: 25 },
              ],
            },
          },
          {
            title: "Database & APIs",
            order: 2,
            lessons: {
              create: [
                { title: "Relational Database Design", order: 0, contentType: "TEXT", textContent: "Learn how to design normalized relational schemas with primary keys, foreign keys and indexes.", durationMinutes: 30 },
                { title: "Building REST APIs", order: 1, contentType: "VIDEO", videoUrl: "https://www.youtube.com/watch?v=l8WPWK9mS5M", durationMinutes: 40 },
                { title: "Final Project: Full Stack App", order: 2, contentType: "ASSIGNMENT", assignmentInstructions: "Combine everything you've learned to build a full stack CRUD application with a database-backed API.", durationMinutes: 120 },
              ],
            },
          },
        ],
      },
    },
    include: { modules: { include: { lessons: true } } },
  });

  const reactCourse = await prisma.course.create({
    data: {
      title: "React for Beginners",
      slug: slugify("React for Beginners"),
      description: "A focused, hands-on introduction to building interactive user interfaces with React.",
      categoryId: categories["Web Development"].id,
      instructorId: sarah.id,
      level: "BEGINNER",
      duration: "4 weeks",
      objectives: ["Understand components and JSX", "Manage state and events", "Fetch data from APIs"],
      requirements: ["Basic HTML/CSS/JavaScript knowledge"],
      status: "ACTIVE",
      thumbnailUrl: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&auto=format&fit=crop&q=80",
      modules: {
        create: [
          {
            title: "Getting Started with React",
            order: 0,
            lessons: {
              create: [
                { title: "Why React?", order: 0, contentType: "TEXT", textContent: "React is a JavaScript library for building user interfaces using a component-based architecture.", durationMinutes: 15 },
                { title: "Your First Component", order: 1, contentType: "VIDEO", videoUrl: "https://www.youtube.com/watch?v=Tn6-PIqc4UM", durationMinutes: 25 },
              ],
            },
          },
          {
            title: "Interactivity",
            order: 1,
            lessons: {
              create: [
                { title: "Handling Events", order: 0, contentType: "TEXT", textContent: "React uses synthetic events that wrap native browser events for consistent cross-browser behavior.", durationMinutes: 20 },
                { title: "Forms in React", order: 1, contentType: "VIDEO", videoUrl: "https://www.youtube.com/watch?v=IkMND33x0qQ", durationMinutes: 30 },
              ],
            },
          },
        ],
      },
    },
    include: { modules: { include: { lessons: true } } },
  });

  const pythonCourse = await prisma.course.create({
    data: {
      title: "Python Programming Fundamentals",
      slug: slugify("Python Programming Fundamentals"),
      description: "Master the fundamentals of Python programming, from syntax basics to writing clean, reusable functions.",
      categoryId: categories["Programming"].id,
      instructorId: james.id,
      level: "BEGINNER",
      duration: "6 weeks",
      objectives: ["Write and run Python scripts", "Use data structures effectively", "Write functions and handle errors"],
      requirements: ["No prior experience required"],
      status: "ACTIVE",
      thumbnailUrl: "https://images.unsplash.com/photo-1484417894907-623942c8ee29?w=800&auto=format&fit=crop&q=80",
      modules: {
        create: [
          {
            title: "Python Basics",
            order: 0,
            lessons: {
              create: [
                { title: "Variables & Data Types", order: 0, contentType: "TEXT", textContent: "Python is dynamically typed. Variables are created the moment you assign a value to them.", durationMinutes: 20 },
                { title: "Control Flow", order: 1, contentType: "VIDEO", videoUrl: "https://www.youtube.com/watch?v=6iF8Xb7Z3wQ", durationMinutes: 30 },
              ],
            },
          },
          {
            title: "Functions & Modules",
            order: 1,
            lessons: {
              create: [
                { title: "Writing Functions", order: 0, contentType: "TEXT", textContent: "Functions let you package reusable logic. Use `def` to define a function in Python.", durationMinutes: 25 },
                { title: "Practice Assignment", order: 1, contentType: "ASSIGNMENT", assignmentInstructions: "Write a Python script that reads a list of numbers and returns statistics: mean, median, and mode.", durationMinutes: 45 },
              ],
            },
          },
        ],
      },
    },
    include: { modules: { include: { lessons: true } } },
  });

  const mlCourse = await prisma.course.create({
    data: {
      title: "Machine Learning Foundations",
      slug: slugify("Machine Learning Foundations"),
      description: "An applied introduction to machine learning concepts, covering supervised learning, model evaluation, and real datasets.",
      categoryId: categories["AI & Machine Learning"].id,
      instructorId: james.id,
      level: "INTERMEDIATE",
      duration: "8 weeks",
      objectives: ["Understand supervised vs unsupervised learning", "Train and evaluate models", "Avoid overfitting"],
      requirements: ["Basic Python knowledge", "High school level statistics"],
      status: "ACTIVE",
      thumbnailUrl: "https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?w=800&auto=format&fit=crop&q=80",
      modules: {
        create: [
          {
            title: "Introduction to ML",
            order: 0,
            lessons: {
              create: [
                { title: "What is Machine Learning?", order: 0, contentType: "TEXT", textContent: "Machine learning is the study of algorithms that improve automatically through experience and data.", durationMinutes: 20 },
                { title: "Types of Learning", order: 1, contentType: "VIDEO", videoUrl: "https://www.youtube.com/watch?v=ukzFI9rgwfU", durationMinutes: 30 },
              ],
            },
          },
        ],
      },
    },
    include: { modules: { include: { lessons: true } } },
  });

  const uiuxCourse = await prisma.course.create({
    data: {
      title: "UI/UX Design Principles",
      slug: slugify("UI UX Design Principles"),
      description: "Learn the fundamentals of user interface and user experience design, from wireframes to high-fidelity prototypes.",
      categoryId: categories["UI/UX Design"].id,
      instructorId: sarah.id,
      level: "BEGINNER",
      duration: "5 weeks",
      objectives: ["Understand design thinking", "Create wireframes and prototypes", "Apply usability heuristics"],
      requirements: ["No design experience required"],
      status: "DRAFT",
      thumbnailUrl: "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800&auto=format&fit=crop&q=80",
      modules: {
        create: [
          {
            title: "Design Fundamentals",
            order: 0,
            lessons: {
              create: [
                { title: "Principles of Visual Design", order: 0, contentType: "TEXT", textContent: "Good design balances contrast, alignment, repetition and proximity.", durationMinutes: 20 },
              ],
            },
          },
        ],
      },
    },
    include: { modules: { include: { lessons: true } } },
  });

  const securityCourse = await prisma.course.create({
    data: {
      title: "Cybersecurity Essentials",
      slug: slugify("Cybersecurity Essentials"),
      description: "A practical introduction to cybersecurity concepts including network security, common attack vectors, and defensive best practices.",
      categoryId: categories["Cybersecurity"].id,
      instructorId: james.id,
      level: "INTERMEDIATE",
      duration: "6 weeks",
      objectives: ["Understand common attack vectors", "Apply security best practices", "Perform basic risk assessments"],
      requirements: ["Basic networking knowledge helpful but not required"],
      status: "ACTIVE",
      thumbnailUrl: "https://plus.unsplash.com/premium_photo-1682124651258-410b25fa9dc0?w=800&auto=format&fit=crop&q=80",
      modules: {
        create: [
          {
            title: "Security Fundamentals",
            order: 0,
            lessons: {
              create: [
                { title: "The CIA Triad", order: 0, contentType: "TEXT", textContent: "Confidentiality, Integrity and Availability form the foundation of information security.", durationMinutes: 20 },
                { title: "Common Attack Vectors", order: 1, contentType: "VIDEO", videoUrl: "https://www.youtube.com/watch?v=inWWhr5tnEA", durationMinutes: 35 },
              ],
            },
          },
        ],
      },
    },
    include: { modules: { include: { lessons: true } } },
  });

  // ---------------- ENROLLMENTS + PROGRESS ----------------
  async function enroll(
    student: typeof alex,
    course: typeof fullStack,
    status: "PENDING" | "ACTIVE" | "COMPLETED",
    completeFraction = 0
  ) {
    const allLessons = course.modules.flatMap((m) => m.lessons);
    const enrollment = await prisma.enrollment.create({
      data: {
        studentId: student.id,
        courseId: course.id,
        status,
        approvedAt: status === "PENDING" ? null : new Date(Date.now() - 1000 * 60 * 60 * 24 * 10),
        approvedById: status === "PENDING" ? null : admin.id,
        requestedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 14),
      },
    });

    if (status !== "PENDING" && allLessons.length > 0) {
      const completeCount = status === "COMPLETED" ? allLessons.length : Math.floor(allLessons.length * completeFraction);
      for (let i = 0; i < allLessons.length; i++) {
        const completed = i < completeCount;
        await prisma.lessonProgress.create({
          data: {
            enrollmentId: enrollment.id,
            lessonId: allLessons[i].id,
            completed,
            completedAt: completed ? new Date(Date.now() - 1000 * 60 * 60 * 24 * (allLessons.length - i)) : null,
          },
        });
      }
      const progressPercent = allLessons.length === 0 ? 0 : Math.round((completeCount / allLessons.length) * 1000) / 10;
      await prisma.enrollment.update({
        where: { id: enrollment.id },
        data: {
          progressPercent,
          status: progressPercent === 100 ? "COMPLETED" : status,
          lastAccessedLessonId: completeCount > 0 ? allLessons[Math.min(completeCount, allLessons.length - 1)].id : allLessons[0].id,
          lastActivityAt: new Date(Date.now() - 1000 * 60 * 60 * 6),
        },
      });
    }
    return enrollment;
  }

  await enroll(alex, fullStack, "ACTIVE", 0.6);
  await enroll(priya, fullStack, "COMPLETED");
  await enroll(liam, fullStack, "PENDING");
  await enroll(mia, reactCourse, "ACTIVE", 0.5);
  await enroll(noah, reactCourse, "ACTIVE", 0.2);
  await enroll(ava, pythonCourse, "ACTIVE", 0.4);
  await enroll(alex, mlCourse, "ACTIVE", 0.3);
  await enroll(priya, securityCourse, "PENDING");
  await enroll(noah, securityCourse, "ACTIVE", 0.7);
  await enroll(mia, pythonCourse, "COMPLETED");

  // ---------------- MEETINGS ----------------
  const inDays = (days: number, hour: number) => {
    const d = new Date();
    d.setDate(d.getDate() + days);
    d.setHours(hour, 0, 0, 0);
    return d;
  };

  await prisma.meeting.create({
    data: {
      courseId: fullStack.id,
      instructorId: sarah.id,
      title: "Week 5 Live Q&A: React Hooks Deep Dive",
      description: "Bring your questions about useState, useEffect and custom hooks.",
      meetingLink: "https://meet.google.com/abc-defg-hij",
      startTime: inDays(2, 18),
      endTime: inDays(2, 19),
      status: "UPCOMING",
    },
  });
  await prisma.meeting.create({
    data: {
      courseId: reactCourse.id,
      instructorId: sarah.id,
      title: "Project Review Session",
      description: "Live review of student mini-projects.",
      meetingLink: "https://meet.google.com/klm-nopq-rst",
      startTime: inDays(5, 17),
      endTime: inDays(5, 18),
      status: "UPCOMING",
    },
  });
  await prisma.meeting.create({
    data: {
      courseId: pythonCourse.id,
      instructorId: james.id,
      title: "Office Hours",
      description: "Open office hours for Python fundamentals questions.",
      meetingLink: "https://meet.google.com/uvw-xyz1-234",
      startTime: inDays(-3, 17),
      endTime: inDays(-3, 18),
      status: "COMPLETED",
    },
  });

  // ---------------- ANNOUNCEMENTS ----------------
  await prisma.announcement.create({
    data: {
      courseId: fullStack.id,
      instructorId: sarah.id,
      title: "Live class moved to 7:00 PM",
      content: "Tomorrow's live class will start at 7:00 PM instead of 6:00 PM. See you there!",
    },
  });
  await prisma.announcement.create({
    data: {
      courseId: pythonCourse.id,
      instructorId: james.id,
      title: "New assignment posted",
      content: "A new practice assignment on functions has been added to Module 2. Please complete it before next week's session.",
    },
  });

  // ---------------- MESSAGES ----------------
  const convo1 = await prisma.conversation.create({
    data: { studentId: alex.id, instructorId: sarah.id, courseId: fullStack.id },
  });
  await prisma.message.createMany({
    data: [
      { conversationId: convo1.id, senderId: alex.id, content: "Hi Sarah, I'm having trouble with the useEffect cleanup function. Could you point me to a good resource?", isRead: true },
      { conversationId: convo1.id, senderId: sarah.id, content: "Of course! Check the React docs section on effects with cleanup — I'll also cover it in this week's live session.", isRead: true },
      { conversationId: convo1.id, senderId: alex.id, content: "That would be great, thank you!", isRead: false },
    ],
  });

  const convo2 = await prisma.conversation.create({
    data: { studentId: noah.id, instructorId: james.id, courseId: securityCourse.id },
  });
  await prisma.message.createMany({
    data: [
      { conversationId: convo2.id, senderId: noah.id, content: "Is the reading for module 2 posted yet?", isRead: true },
      { conversationId: convo2.id, senderId: james.id, content: "Yes, it's now live under Module 2 → Common Attack Vectors.", isRead: false },
    ],
  });

  // ---------------- NOTIFICATIONS ----------------
  await prisma.notification.createMany({
    data: [
      { userId: alex.id, type: "NEW_MESSAGE", title: "New message from Sarah Chen", message: "Of course! Check the React docs...", link: `/student/messages/${convo1.id}` },
      { userId: alex.id, type: "MEETING_SCHEDULED", title: "New class scheduled", message: "Week 5 Live Q&A is scheduled for this week.", link: "/student/meetings" },
      { userId: priya.id, type: "ENROLLMENT_APPROVED", title: "Enrollment approved", message: "Your enrollment in Full Stack Web Development has been approved.", link: `/student/courses/${fullStack.id}` },
      { userId: liam.id, type: "SYSTEM", title: "Enrollment request submitted", message: "Your request to enroll in Full Stack Web Development is pending approval.", link: "/student/dashboard" },
      { userId: sarah.id, type: "ENROLLMENT_REQUEST", title: "New enrollment request", message: "Liam O'Connor requested to enroll in Full Stack Web Development.", link: `/instructor/courses/${fullStack.id}` },
      { userId: noah.id, type: "NEW_MESSAGE", title: "New message from James Patel", message: "Yes, it's now live under Module 2.", link: `/student/messages/${convo2.id}` },
      { userId: admin.id, type: "SYSTEM", title: "Platform seeded", message: "Demo data has been loaded successfully.", link: "/admin/dashboard" },
    ],
  });

  // ---------------- ACTIVITY LOG ----------------
  await prisma.activityLog.createMany({
    data: [
      { message: `Instructor "${sarah.name}" created course "Full Stack Web Development"`, userId: sarah.id },
      { message: `Instructor "${james.name}" created course "Machine Learning Foundations"`, userId: james.id },
      { message: `${priya.name}'s enrollment in "Full Stack Web Development" was approved`, userId: admin.id },
      { message: `${liam.name} requested enrollment in "Full Stack Web Development"`, userId: liam.id },
      { message: `Meeting "Week 5 Live Q&A: React Hooks Deep Dive" scheduled for "Full Stack Web Development"`, userId: sarah.id },
    ],
  });

  console.log("Seed complete.");
  console.log("");
  console.log("Demo accounts (password for all: Passw0rd!):");
  console.log(`  Super Admin: ${admin.email}`);
  console.log(`  Instructor:  ${sarah.email}`);
  console.log(`  Instructor:  ${james.email}`);
  console.log(`  Student:     ${alex.email}`);
  console.log(`  Student:     ${priya.email}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
