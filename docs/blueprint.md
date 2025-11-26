# **App Name**: SmartBackpack Pro

## Core Features:

- Smart Book Requirement Analysis: AI workflow that compares a student's detected books with required homework books and generates a report of missing books. LLM uses the missing book analysis as a tool when crafting the status.
- Daily Reward System: Workflow triggered when the book check passes, awarding points and increasing the streak for complete checks. Firebase Cloud Function resets streak and updates the leaderboard upon detecting missing books.
- Leaderboard Updater: Cloud function that listens to changes in user points, sorts users by points, and rewrites the leaderboard collection in Firestore.
- Attendance Anomaly Detection: Teacher marks attendance; the AI validates abnormal patterns (e.g., repeated absence) and notifies parents or teachers. LLM validates the attendance against past absences before sending notification.
- Leave Request AI Helper: AI generates automatic reasoning suggestions for teacher approval of leave requests based on the student's attendance and academic history.  The workflow triggers when there is a leave request, then assesses past leave requests, past attendance, grades, and whether or not the leave request makes sense based on the aforementioned criteria, prior to summarizing.
- Firestore Integration: Use Firestore as the primary database to store student data, book requirements, homework details, attendance records, leaderboard information, and AI analysis results under aiAnalysis/{uid}/{date}.
- RFID Integration: Capture the RFID data from a simulated smart backpack

## Style Guidelines:

- Primary color: Vibrant blue (#29ABE2) to convey intelligence and reliability.
- Background color: Light gray (#F0F4F7), desaturated to 20% lightness, creating a clean, unobtrusive backdrop.
- Accent color: Green (#8BC34A) to highlight rewards, success, and positive feedback.
- Headline font: 'Space Grotesk', sans-serif, providing a techy feel.
- Body font: 'Inter', sans-serif, used where longer text is anticipated for comfortable reading.
- Code font: 'Source Code Pro' for displaying backend and configuration snippets.
- Use flat, minimalist icons for navigation and feature representation.
- Subtle animations for reward confirmations and data updates.