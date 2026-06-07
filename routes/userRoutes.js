const express = require('express');
const router = express.Router();
const { registerUser, loginUser, getUserInfo, getAllCourses, getUserCourses, addCourseToUser, removeCourseFromUser, enrollInCourse, getAllAssignments, getAllSessions, joinSession, leaveSession, getMyGrades, getMyAttendance, getMyAnnouncements, getMyMessages, getMyExams, submitExamAttempt, getCurrentCGPA, getNextMilestone } = require('../controller/userController');
const { getMyPayments } = require('../controller/paymentController');
const authMiddleware = require("../middleware/authMiddleware");

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get("/getUserInfo", authMiddleware, getUserInfo);
router.get("/courses/all", authMiddleware, getAllCourses);
router.get("/my-courses", authMiddleware, getUserCourses);
router.post("/addCourse", authMiddleware, addCourseToUser);
router.delete("/removeCourse", authMiddleware, removeCourseFromUser);
router.post("/enrollInCourse/:courseId", authMiddleware, enrollInCourse);
router.get('/assignments/all', authMiddleware, getAllAssignments);
router.get('/sessions/all', authMiddleware, getAllSessions);
router.post('/sessions/:id/join', authMiddleware, joinSession);
router.post('/sessions/:id/leave', authMiddleware, leaveSession);
router.get('/grades/all', authMiddleware, getMyGrades);
router.get('/attendance/all', authMiddleware, getMyAttendance);
router.get('/fees/all', authMiddleware, getMyPayments);
router.get('/announcements/all', authMiddleware, getMyAnnouncements);
router.get('/messages/all', authMiddleware, getMyMessages);
router.get('/exams/all', authMiddleware, getMyExams);
router.post('/exams/submit', authMiddleware, submitExamAttempt);
router.get('/academics/cgpa', authMiddleware, getCurrentCGPA);
router.get('/academics/next-milestone', authMiddleware, getNextMilestone);

module.exports = router;
