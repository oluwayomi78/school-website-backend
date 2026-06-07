const express = require('express');
const router = express.Router();
const {
	getAllUsers,
	deleteUser,
	getCurriculum,
	deployModule,
	deleteModule,
	adminLogin,
	getAllAdmin,
	createAdmin,
	createTeacher,
	getAllStudent,
	getTeachers,
	createStudent,
	getAttendance,
	getAdmissions,
	getNotifications,
	createAttendance,
	updateAttendance,
	deleteAttendance,
	createAdmission,
	updateAdmission,
	deleteAdmission,
	createNotification,
	updateNotification,
	deleteNotification,
	getAllClasses,
	createClass,
	updateClass,
	deleteClass,
	getAllSubjects,
	createSubject,
	updateSubject,
	deleteSubject,
	addExamQuestion,
	publishResult,
	getAllResults,
	deleteExamEntry,
	createAssignment,
	getAllAssignments,
	addBook,
	getAllBooks,
	issueBook,
	returnBook,
	addTransportRoute,
	getAllTransport,
	updateVehicleStatus,
	deleteTransportRoute,
	addHostelRoom,
	getAllHostelRooms,
	allocateRoom,
	deleteRoom,
	updateStudent,
	getEvents,
    addEvent,
    deleteEvent,
	acceptAdmission,
	updateUserRole,
	getStaffRoles,
	getAllCoursesAdmin,
	createCourse,
	editCourse,
	deleteCourse,
	deleteAssignment,
	editAssignment,
	createSession,
	deleteSession,
	getAllSessions,
	getSessionById,
	updateSession
} = require('../controller/adminController');
const authMiddleware = require("../middleware/authMiddleware");

router.post('/login', adminLogin);
router.get('/admins/all', authMiddleware, getAllAdmin);
router.post('/admins', authMiddleware, createAdmin);
router.get('/students', authMiddleware, getAllUsers);
router.get('/students/all', authMiddleware, getAllStudent);
router.post('/students', authMiddleware, createStudent);
router.put('/students/:id', authMiddleware, updateStudent);
router.post('/teachers', authMiddleware, createTeacher);
router.delete('/students/:id', authMiddleware, deleteUser);
router.get('/curriculum/all', authMiddleware, getCurriculum);
router.post('/curriculum/deploy', authMiddleware, deployModule);
router.delete('/curriculum/:id', authMiddleware, deleteModule);
router.get('/teachers', authMiddleware, getTeachers);
router.get('/attendance', authMiddleware, getAttendance);
router.post('/attendance', authMiddleware, createAttendance);
router.put('/attendance/:id', authMiddleware, updateAttendance);
router.delete('/attendance/:id', authMiddleware, deleteAttendance);
router.get('/admissions', authMiddleware, getAdmissions);
router.post('/admissions', authMiddleware, createAdmission);
router.put('/admissions/:id', authMiddleware, updateAdmission);
router.delete('/admissions/:id', authMiddleware, deleteAdmission);
router.get('/notifications', authMiddleware, getNotifications);
router.post('/notifications', authMiddleware, createNotification);
router.put('/notifications/:id', authMiddleware, updateNotification);
router.delete('/notifications/:id', authMiddleware, deleteNotification);
router.get('/classes', authMiddleware, getAllClasses);
router.post('/classes', authMiddleware, createClass);
router.put('/classes/:id', authMiddleware, updateClass);
router.delete('/classes/:id', authMiddleware, deleteClass);
router.get('/subjects', authMiddleware, getAllSubjects);
router.post('/subjects', authMiddleware, createSubject);
router.put('/subjects/:id', authMiddleware, updateSubject);
router.delete('/subjects/:id', authMiddleware, deleteSubject);
router.post('/questions/add', authMiddleware, addExamQuestion);
router.post('/results', authMiddleware, publishResult);
router.get('/results/all', authMiddleware, getAllResults);
router.delete('/results/:id', authMiddleware, deleteExamEntry);
router.post('/assignments', authMiddleware, createAssignment);
router.get('/assignments/all', authMiddleware, getAllAssignments);
router.delete('/assignments/:id', authMiddleware, deleteAssignment);
router.put('/assignments/:id', authMiddleware, editAssignment);
router.post('/library/add', authMiddleware, addBook);
router.get('/library/all', authMiddleware, getAllBooks);
router.post('/library/issue', authMiddleware, issueBook);
router.post('/library/return', authMiddleware, returnBook);
router.post('/transport/add', authMiddleware, addTransportRoute);
router.get('/transport/all', authMiddleware, getAllTransport);
router.put('/transport/status', authMiddleware, updateVehicleStatus);
router.delete('/transport/:id', authMiddleware, deleteTransportRoute);
router.post('/hostel/add', authMiddleware, addHostelRoom);
router.get('/hostel/all', authMiddleware, getAllHostelRooms);
router.post('/hostel/allocate', authMiddleware, allocateRoom);
router.delete('/hostel/:id', authMiddleware, deleteRoom);
router.get('/events', authMiddleware, getEvents);
router.post('/events/add', authMiddleware, addEvent);
router.delete('/events/:id', authMiddleware, deleteEvent);
router.post('/admissions/:id/accept', authMiddleware, acceptAdmission);
router.get('/staff', authMiddleware, getStaffRoles);
router.put('/users/:id/role', authMiddleware, updateUserRole);
router.get("/courses", authMiddleware, getAllCoursesAdmin);
router.post("/courses/create", authMiddleware,  createCourse);
router.put("/courses/:id", authMiddleware, editCourse);
router.delete("/courses/:id", authMiddleware, deleteCourse);
router.post("/sessions/create", authMiddleware, createSession);
router.post("/sessions", authMiddleware, createSession);
router.delete("/sessions/:id", authMiddleware, deleteSession);
router.get("/sessions", authMiddleware, getAllSessions);
router.get("/sessions/:id", authMiddleware, getSessionById);
router.put("/sessions/:id", authMiddleware, updateSession);
module.exports = router;