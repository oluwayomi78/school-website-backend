const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../model/userModel");
const Course = require("../model/courseModel");
const Assignment = require("../model/assignmentModel");
const Attendance = require("../model/attendanceModel");
const Class = require("../model/classModel");
const SubjectAssignment = require("../model/subjectModel");
const Session = require("../model/scheduleModel");
const Exam = require("../model/examModel");
const Notification = require("../model/notificationModel");
const Message = require("../model/messageModel");
const Activity = require("../model/activitiesModel");
const logActivity = require("../utils/activityLogger");
require('dotenv').config();


const saltRounds = 10;

const generateStudentId = async () => {
  const currentYear = new Date().getFullYear();

  const latestStudent = await User.findOne({
    role: "student",
    studentId: new RegExp(`^${currentYear}`)
  }).sort({ studentId: -1 });

  let nextNumber = 1;

  if (latestStudent && latestStudent.studentId) {
    const lastDigits = latestStudent.studentId.slice(4);
    nextNumber = parseInt(lastDigits, 10) + 1;
  }

  const paddedNumber = String(nextNumber).padStart(6, "0");
  return `${currentYear}${paddedNumber}`;
};

const registerUser = async (req, res) => {
  try {
    const { fullname, email, course, password } = req.body;

    if (password.length < 6) {
      return res.status(400).json({
        message: "Password must be at least 6 characters long"
      });
    }
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({
        message: "User already exists"
      });
    }

    const hashedPassword = await bcrypt.hash(password, saltRounds);
    const studentId = await generateStudentId();
    const newUser = new User({
      fullname,
      email,
      course,
      password: hashedPassword,
      role: "student",
      studentId
    });

    await newUser.save();
    await logActivity(newUser._id, "account", "Account Created", "Student registered");
    res.status(201).json({
      message: "User registered successfully",
      user: newUser
    });


  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message
    });
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({
        message: "Invalid email or password"
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({
        message: "Invalid email or password"
      });
    }

    const token = jwt.sign(
      {
        id: user._id,
        email: user.email
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d"
      }
    );

    await logActivity(user._id, "security", "Login", "Logged into portal");

    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        studentId: user.studentId,
        fullname: user.fullname,
        email: user.email,
        course: user.course,
        role: user.role
      }
    });

  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      message: "Server error",
      error: error.message
    });
  }
};


const getUserInfo = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      message: "User fetched successfully",
      user
    });

  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message
    });
  }
};

const getAllCourses = async (req, res) => {
  try {
    const courses = await Course.find();
    res.status(200).json({
      success: true,
      message: "Courses fetched successfully",
      courses
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

const getUserCourses = async (req, res) => {
  try {
    const courses = await Course.find({ students: req.user.id });

    res.status(200).json({
      success: true,
      message: "User courses fetched successfully",
      courses
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

const addCourseToUser = async (req, res) => {
  try {
    const userId = req.user._id;
    const { courseId } = req.body;

    const user = await User.findById(userId);
    const course = await Course.findById(courseId);

    if (!user || !course) {
      return res.status(404).json({ message: "User or Course not found" });
    }

    if (!course.students.includes(user._id)) {
      course.students.push(user._id);
      await course.save();
    }

    await logActivity(userId, "course", "Enrolled Course", "Joined a course");

    return res.status(200).json({ success: true, course });
  } catch (error) {
    console.error("Error adding course to user:", error);
    return res.status(500).json({ message: "Internal server error", error: error.message });
  }
};

const removeCourseFromUser = async (req, res) => {
  try {
    const userId = req.user._id;
    const { courseId } = req.body;

    const user = await User.findById(userId);
    const course = await Course.findById(courseId);

    if (!user || !course) {
      return res.status(404).json({ message: "User or Course not found" });
    }

    course.students = course.students.filter(
      (studentId) => studentId.toString() !== user._id.toString()
    );
    await course.save();
    await logActivity(userId, "course", "Enrolled Course", "Joined a course");

    return res.status(200).json({ success: true, course });
  } catch (error) {
    console.error("Error removing course to user:", error);
    return res.status(500).json({ message: "Internal server error", error: error.message });
  }
};

const enrollInCourse = async (req, res) => {
  try {
    const { courseId } = req.params;
    const studentId = req.user.id;

    const updatedCourse = await Course.findByIdAndUpdate(
      courseId,
      { $addToSet: { students: studentId } },
      { returnDocument: 'after' }
    );

    await logActivity(userId, "course", "Enrolled Course", "Joined a course");

    if (!updatedCourse) {
      return res.status(404).json({ success: false, message: "Course not found" });
    }

    res.json({ success: true, message: "Enrolled successfully!", course: updatedCourse });
  } catch (error) {
    res.status(500).json({ success: false, message: "Enrollment failed." });
  }
};

const getAllAssignments = async (req, res) => {
  try {
    const assignments = await Assignment.find().sort({ dueDate: 1 });
    res.status(200).json(assignments);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch assignments' });
  }
};

const getAllSessions = async (req, res) => {
  try {
    const userId = req.user?.id;
    const sessions = await Session.find().sort({ date: 1 }).populate('joinedStudents', '_id');

    const normalizedSessions = sessions.map((session) => {
      const plainSession = session.toObject();
      const joinedStudents = Array.isArray(plainSession.joinedStudents) ? plainSession.joinedStudents : [];

      return {
        ...plainSession,
        joinedCount: joinedStudents.length,
        isJoined: userId ? joinedStudents.some((student) => String(student?._id || student) === String(userId)) : false,
      };
    });

    res.status(200).json({ success: true, sessions: normalizedSessions });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const joinSession = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const session = await Session.findById(id);
    if (!session) {
      return res.status(404).json({ success: false, message: 'Session not found with the provided ID.' });
    }

    const alreadyJoined = session.joinedStudents.some((studentId) => String(studentId) === String(userId));
    if (!alreadyJoined) {
      session.joinedStudents.push(userId);
      await session.save();
      await logActivity(userId, "session", "Joined Session", session.title);
      await Activity.create({
        user: userId,
        type: 'session',
        title: 'Joined Session',
        desc: `Joined ${session.title}`,
      });
    }

    await session.populate('joinedStudents', '_id');

    res.status(200).json({
      success: true,
      message: alreadyJoined ? 'You already joined this session.' : 'Session joined successfully.',
      session,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
const leaveSession = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const session = await Session.findById(id);
    if (!session) {
      return res.status(404).json({ success: false, message: 'Session not found with the provided ID.' });
    }

    session.joinedStudents = session.joinedStudents.filter((studentId) => String(studentId) !== String(userId));
    await session.save();

    await session.populate('joinedStudents', '_id');

    await logActivity(userId, "session", "Left Session", session.title);

    res.status(200).json({
      success: true,
      message: 'Left session successfully.',
      session,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getMyGrades = async (req, res) => {
  try {
    const user = await User.findById(req.user?.id).select('fullname');

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const escapedName = user.fullname.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const grades = await Exam.find({
      entryType: 'result',
      studentName: { $regex: new RegExp(`^${escapedName}$`, 'i') },
    }).sort({ createdAt: -1 });

    res.status(200).json({ success: true, grades });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getMyAttendance = async (req, res) => {
  try {
    const user = await User.findById(req.user?.id).select('fullname course');

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const escapedName = user.fullname.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const attendance = await Attendance.find({
      studentName: { $regex: new RegExp(`^${escapedName}$`, 'i') },
    }).sort({ date: -1, createdAt: -1 });

    const summary = attendance.reduce((acc, record) => {
      const status = String(record.status || '').toLowerCase();
      if (status === 'present') acc.present += 1;
      else if (status === 'late') acc.late += 1;
      else acc.absent += 1;
      return acc;
    }, { present: 0, late: 0, absent: 0 });

    res.status(200).json({
      success: true,
      attendance,
      summary,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getMyAnnouncements = async (req, res) => {
  try {
    const announcements = await Notification.find({
      channel: { $in: ['announcement', 'in-app'] }
    }).sort({ createdAt: -1 });

    res.status(200).json({ success: true, announcements });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getMyMessages = async (req, res) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const messages = await Message.find({ recipient: userId })
      .populate('sender', 'fullname email role')
      .sort({ createdAt: -1 });

    const summary = messages.reduce((acc, message) => {
      if (message.read) acc.read += 1;
      else acc.unread += 1;
      return acc;
    }, { read: 0, unread: 0 });

    res.status(200).json({ success: true, messages, summary });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getMyExams = async (req, res) => {
  try {
    const user = await User.findById(req.user?.id).select('fullname course level');

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const userCourse = user.course;
    const userLevel = user.level;

    const [questions, results] = await Promise.all([
      Exam.find({
        entryType: 'question',
        course: userCourse,
        level: userLevel
      }).sort({ createdAt: -1 }),

      Exam.find({
        entryType: 'result',
        studentName: { $regex: new RegExp(`^${user.fullname.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') },
      }).sort({ createdAt: -1 }),
    ]);

    res.status(200).json({
      success: true,
      userContext: { course: userCourse, level: userLevel },
      questions,
      results,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const submitExamAttempt = async (req, res) => {
  try {
    const user = await User.findById(req.user?.id).select('fullname course');

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const { subject, term = 'First Term', answers = {} } = req.body;
    const examSubject = String(subject || user.course || '').toLowerCase();

    const questions = await Exam.find({ entryType: 'question', subject: examSubject });

    if (!questions.length) {
      return res.status(404).json({ success: false, message: 'No exam questions found for this course' });
    }

    let earnedPoints = 0;
    let totalPoints = 0;

    questions.forEach((question) => {
      totalPoints += Number(question.points) || 0;
      const selectedAnswer = answers[String(question._id)];
      if (selectedAnswer && String(selectedAnswer).trim() === String(question.correctAnswer).trim()) {
        earnedPoints += Number(question.points) || 0;
      }
    });

    const score = totalPoints > 0 ? Math.round((earnedPoints / totalPoints) * 100) : 0;
    const grade = score >= 70 ? 'A' : score >= 60 ? 'B' : score >= 50 ? 'C' : score >= 45 ? 'D' : 'F';

    const result = await Exam.create({
      entryType: 'result',
      studentName: user.fullname,
      subject: examSubject,
      score,
      grade,
      term,
    });

    await logActivity(req.user.id, "exam", "Exam Submitted", subject);

    res.status(201).json({
      success: true,
      message: 'Exam submitted successfully.',
      score,
      grade,
      totalPoints,
      earnedPoints,
      totalQuestions: questions.length,
      result,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
    console.log("Error submitting exam attempt:", error);
  }
};

const getCurrentCGPA = async (req, res) => {
  try {
    const user = await User.findById(req.user?.id).select('fullname');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    const escapedName = user.fullname.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const results = await Exam.find({
      entryType: 'result',
      studentName: { $regex: new RegExp(`^${escapedName}$`, 'i') },
    });

    const gradeToPoints = { A: 5, B: 4, C: 3, D: 2, F: 0 };
    const cgpaValues = results
      .map((r) => gradeToPoints[r.grade])
      .filter((v) => typeof v === 'number');

    const currentCGPA = cgpaValues.length
      ? (cgpaValues.reduce((sum, v) => sum + v, 0) / cgpaValues.length).toFixed(2)
      : '0.00';

    return res.status(200).json({ success: true, currentCGPA });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const getNextMilestone = async (req, res) => {
  try {
    const user = await User.findById(req.user?.id).select('fullname course');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    const courseName = String(user.course || '');

    const cls = await Class.findOne({
      $or: [
        { cohort: { $regex: new RegExp(`^${courseName.trim()}$`, 'i') } },
        { name: { $regex: new RegExp(`^${courseName.trim()}$`, 'i') } },
      ],
    });

    if (cls?._id) {
      const nextAssignment = await Assignment.find({
        course: cls._id,
        dueDate: { $ne: null },
      })
        .sort({ dueDate: 1 })
        .limit(1);

      if (nextAssignment.length) {
        const a = nextAssignment[0];
        return res.status(200).json({
          success: true,
          nextMilestoneText: `${a.title} • ${new Date(a.dueDate).toLocaleDateString()}`,
          nextAssignment: a,
        });
      }
    }

    const nextSession = await Session.find().sort({ date: 1 }).limit(1);
    if (nextSession.length) {
      const s = nextSession[0];
      const text = `${s.title} • ${new Intl.DateTimeFormat(undefined, { weekday: 'short', month: 'short', day: 'numeric' }).format(new Date(s.date))}`;
      return res.status(200).json({ success: true, nextMilestoneText: text, nextSession: s });
    }

    return res.status(200).json({ success: true, nextMilestoneText: 'No upcoming milestones' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};


const getActivities = async (req, res) => {
  try {
    const activities = await Activity.find({
      user: req.user.id,
    }).sort({ createdAt: -1 });

    res.json(activities);
  } catch (error) {
    res.status(500).json({
      message: 'Failed to fetch activities',
    });
  }
};

module.exports = {
  registerUser,
  loginUser,
  getUserInfo,
  getUserCourses,
  addCourseToUser,
  removeCourseFromUser,
  enrollInCourse,
  getAllCourses,
  getAllAssignments,
  getAllSessions,
  joinSession,
  getMyGrades,
  getMyAttendance,
  getMyAnnouncements,
  getMyMessages,
  getMyExams,
  submitExamAttempt,
  getCurrentCGPA,
  getNextMilestone,
  getActivities,
  leaveSession
};
