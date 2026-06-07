const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../model/userModel");
const Curriculum = require("../model/curriculumModel");
const Attendance = require("../model/attendanceModel");
const Admission = require("../model/admissionModel");
const Notification = require("../model/notificationModel");
const SubjectAssignment = require("../model/subjectModel");
const Class = require("../model/classModel");
const Exam = require('../model/examModel');
const Library = require('../model/libraryModel');
const Transport = require('../model/transportModel');
const Hostel = require('../model/hostelModel');
const Event = require('../model/eventModel');
const Assignment = require('../model/assignmentModel');
const Course = require('../model/courseModel');
const Session = require('../model/scheduleModel');


require('dotenv').config();

const saltRounds = 10;
const jwtSecret = process.env.JWT_SECRET || "your_jwt_secret_key";

const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user || user.role !== "admin") {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const token = jwt.sign({ id: user._id, role: user.role }, jwtSecret, { expiresIn: '1h' });
    res.status(200).json({ token });
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message
    });
  }
};

const getAllUsers = async (req, res) => {
  try {
    const users = await User.find();
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message
    });
  }
};

const getAllStudent = async (req, res) => {
  try {
    const students = await User.find({ role: "student" });
    res.status(200).json(students);
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message
    });
  }
};

const getAllAdmin = async (req, res) => {
  try {
    const admins = await User.find({ role: "admin" }).select("-password");
    res.status(200).json(admins);
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message
    });
  }
};

const createAdmin = async (req, res) => {
  try {
    const { fullname, email, password } = req.body;

    if (!fullname || !email || !password) {
      return res.status(400).json({ message: "fullname, email, and password are required" });
    }
    if (password.length < 6) {
      return res.status(400).json({
        message: "Password must be at least 6 characters long"
      });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const newAdmin = new User({
      fullname,
      email,
      course: "administration",
      password: hashedPassword,
      role: "admin"
    });

    await newAdmin.save();

    res.status(201).json({
      message: "Admin created successfully",
      user: {
        _id: newAdmin._id,
        fullname: newAdmin.fullname,
        email: newAdmin.email,
        course: newAdmin.course,
        role: newAdmin.role
      }
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message
    });
  }
};

const updateUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { newRole } = req.body;

    const validRoles = ['student', 'admin', 'instructor', 'Registrar'];

    if (!validRoles.includes(newRole)) {
      return res.status(400).json({ message: "Invalid role selection" });
    }

    const updatedUser = await User.findByIdAndUpdate(
      id,
      { role: newRole },
      { returnDocument: "after" }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      message: "Role updated successfully",
      user: updatedUser
    });

  } catch (error) {
    console.log("Error updating user role:", error);
    res.status(500).json({
      message: "Server error",
      error: error.message
    });
  }
};

const getStaffRoles = async (req, res) => {
  try {
    const staff = await User.find({
      role: { $in: ['admin', 'instructor', 'Registrar'] }
    }).select('fullname email role');
    res.status(200).json(staff);
  } catch (error) {
    res.status(500).json({ message: "Error fetching staff data" });
  }
};



const createTeacher = async (req, res) => {
  try {
    const { fullname, email, password } = req.body;

    if (!fullname || !email || !password) {
      return res.status(400).json({ message: "fullname, email, and password are required" });
    }

    if (password.length < 6) {
      return res.status(400).json({
        message: "Password must be at least 6 characters long"
      });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const newTeacher = new User({
      fullname,
      email,
      course: "teaching",
      password: hashedPassword,
      role: "instructor"
    });

    await newTeacher.save();

    res.status(201).json({
      message: "Teacher created successfully",
      user: {
        _id: newTeacher._id,
        fullname: newTeacher.fullname,
        email: newTeacher.email,
        course: newTeacher.course,
        role: newTeacher.role
      }
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message
    });
  }
};

const getTeachers = async (req, res) => {
  try {
    const teachers = await User.find({ role: "instructor" }).select("-password");
    res.status(200).json(teachers);
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message
    });
  }
};

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

const createStudent = async (req, res) => {
  try {
    const { fullname, email, course, password, level } = req.body;

    if (!fullname || !email || !course || !password) {
      return res.status(400).json({ message: "fullname, email, course, and password are required" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }


    const hashedPassword = await bcrypt.hash(password, saltRounds);
    const studentId = await generateStudentId();
    if (!studentId) {
      return res.status(400).json({ message: "Student ID generation failed. Please try again." });
    }

    const newStudent = new User({
      fullname,
      email,
      course,
      password: hashedPassword,
      role: "student",
      studentId,
      level: Number(level) || 1
    });

    await newStudent.save();

    res.status(201).json({
      message: "Student created successfully",
      user: newStudent
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message
    });
  }
};

const updateStudent = async (req, res) => {
  try {
    const updatedStudent = await User.findByIdAndUpdate(
      req.params.id,
      req.body,
      { returnDocument: 'after'}
    );

    if (!updatedStudent) {
      return res.status(404).json({
        message: "Student not found"
      });
    }

    res.status(200).json(updatedStudent);
  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};

const getAttendance = async (req, res) => {
  try {
    const attendance = await Attendance.find().sort({ date: -1, createdAt: -1 });
    res.status(200).json(attendance);
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message
    });
  }
};

const getAdmissions = async (req, res) => {
  try {
    const admissions = await Admission.find().sort({ createdAt: -1 });
    res.status(200).json(admissions);
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message
    });
  }
};

const acceptAdmission = async (req, res) => {
  try {
    const applicant = await Admission.findById(req.params.id);

    const newStudent = new User({
      fullname: applicant.fullname,
      email: applicant.email,
      course: applicant.course,
      status: 'active',
      password: process.env.DEFAULT_ADMIN_PASSWORD || "TemporaryPassword123",
      parentGuardianName: applicant.parentGuardianName,
      parentGuardianPhone: applicant.parentGuardianPhone
    });
    await newStudent.save();

    await Admission.findByIdAndUpdate(req.params.id, { status: 'accepted' });

    res.json({ message: 'Applicant promoted to Student' });
  } catch (err) {
    res.status(500).json({ error: 'Promotion failed' });
    console.log("Error promoting applicant:", err);
  }
};

const getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find().sort({ createdAt: -1 });
    res.status(200).json(notifications);
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message
    });
  }
};

const createAttendance = async (req, res) => {
  try {
    const attendance = new Attendance(req.body);
    await attendance.save();
    res.status(201).json({ message: "Attendance record created successfully", attendance });
  } catch (error) {
    res.status(400).json({
      message: "Unable to create attendance record",
      error: error.message
    });
  }
};

const updateAttendance = async (req, res) => {
  try {
    const attendance = await Attendance.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!attendance) {
      return res.status(404).json({ message: "Attendance record not found" });
    }
    res.status(200).json({ message: "Attendance record updated successfully", attendance });
  } catch (error) {
    res.status(400).json({
      message: "Unable to update attendance record",
      error: error.message
    });
  }
};

const deleteAttendance = async (req, res) => {
  try {
    const attendance = await Attendance.findByIdAndDelete(req.params.id);
    if (!attendance) {
      return res.status(404).json({ message: "Attendance record not found" });
    }
    res.status(200).json({ message: "Attendance record deleted successfully" });
  } catch (error) {
    res.status(500).json({
      message: "Unable to delete attendance record",
      error: error.message
    });
  }
};

const createAdmission = async (req, res) => {
  try {
    const admission = new Admission(req.body);
    await admission.save();
    res.status(201).json({ message: "Admission created successfully", admission });
  } catch (error) {
    res.status(400).json({
      message: "Unable to create admission",
      error: error.message
    });
  }
};

const updateAdmission = async (req, res) => {
  try {
    const admission = await Admission.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!admission) {
      return res.status(404).json({ message: "Admission not found" });
    }
    res.status(200).json({ message: "Admission updated successfully", admission });
  } catch (error) {
    res.status(400).json({
      message: "Unable to update admission",
      error: error.message
    });
  }
};

const deleteAdmission = async (req, res) => {
  try {
    const admission = await Admission.findByIdAndDelete(req.params.id);
    if (!admission) {
      return res.status(404).json({ message: "Admission not found" });
    }
    res.status(200).json({ message: "Admission deleted successfully" });
  } catch (error) {
    res.status(500).json({
      message: "Unable to delete admission",
      error: error.message
    });
  }
};

const createNotification = async (req, res) => {
  try {
    const notification = new Notification(req.body);
    await notification.save();
    res.status(201).json({ message: "Notification created successfully", notification });
  } catch (error) {
    res.status(400).json({
      message: "Unable to create notification",
      error: error.message
    });
  }
};

const updateNotification = async (req, res) => {
  try {
    const notification = await Notification.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }
    res.status(200).json({ message: "Notification updated successfully", notification });
  } catch (error) {
    res.status(400).json({
      message: "Unable to update notification",
      error: error.message
    });
  }
};

const deleteNotification = async (req, res) => {
  try {
    const notification = await Notification.findByIdAndDelete(req.params.id);
    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }
    res.status(200).json({ message: "Notification deleted successfully" });
  } catch (error) {
    res.status(500).json({
      message: "Unable to delete notification",
      error: error.message
    });
  }
};

const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedUser = await User.findByIdAndDelete(id);
    if (!deletedUser) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message
    });
  }
};



const getCurriculum = async (req, res) => {
  try {
    const modules = await Curriculum.find().sort({ createdAt: -1 });
    res.status(200).json(modules);
  } catch (err) {
    res.status(500).json({ message: "Server error parsing datastream." });
  }
};

const deployModule = async (req, res) => {
  try {
    const newModule = new Curriculum(req.body);
    await newModule.save();
    res.status(201).json({ message: "Module deployed to neural network.", newModule });
  } catch (err) {
    res.status(400).json({ message: "Deployment rejected. Check parameter integrity." });
  }
};
const deleteModule = async (req, res) => {
  try {
    const deletedModule = await Curriculum.findByIdAndDelete(req.params.id);
    if (!deletedModule) {
      return res.status(404).json({ message: "Module not found in curriculum datastream." });
    }
    res.status(200).json({ message: "Module purged from curriculum datastream." });
  } catch (err) {
    res.status(500).json({ message: "Purge failed." });
  }
};


const getAllClasses = async (req, res) => {
  try {
    const classes = await Class.find().sort({ createdAt: -1 });
    res.status(200).json(classes);
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message
    });
  }
};

const createClass = async (req, res) => {
  try {
    const { name, cohort, level, room, teacher } = req.body;

    if (!name || !cohort || !level || !room) {
      return res.status(400).json({ message: "name, cohort, level, and room are required" });
    }

    const newClass = new Class({
      name,
      cohort,
      level,
      room,
      teacher: teacher || null
    });

    await newClass.save();

    res.status(201).json({
      message: "Class created successfully",
      class: newClass
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message
    });
  }
};

const updateClass = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedClass = await Class.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });

    if (!updatedClass) {
      return res.status(404).json({ message: "Class not found" });
    }

    res.status(200).json({
      message: "Class updated successfully",
      class: updatedClass
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message
    });
  }
};

const deleteClass = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedClass = await Class.findByIdAndDelete(id);

    if (!deletedClass) {
      return res.status(404).json({ message: "Class not found" });
    }

    res.status(200).json({
      message: "Class deleted successfully"
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message
    });
  }
};


const getAllSubjects = async (req, res) => {
  try {
    const subjects = await SubjectAssignment.find().sort({ createdAt: -1 });
    res.status(200).json(subjects);
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message
    });
  }
};

const createSubject = async (req, res) => {
  try {
    const { subject, className, classId, teacher, schedule, status } = req.body;

    if (!subject || !className || !teacher) {
      return res.status(400).json({ message: "subject, className, and teacher are required" });
    }

    const newSubject = new SubjectAssignment({
      subject,
      className,
      classId: classId || null,
      teacher,
      schedule: schedule || null,
      status: status || "active"
    });

    await newSubject.save();

    res.status(201).json({
      message: "Subject assignment created successfully",
      assignment: newSubject
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message
    });
  }
};

const updateSubject = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedSubject = await SubjectAssignment.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });

    if (!updatedSubject) {
      return res.status(404).json({ message: "Subject assignment not found" });
    }

    res.status(200).json({
      message: "Subject assignment updated successfully",
      assignment: updatedSubject
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message
    });
  }
};

const deleteSubject = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedSubject = await SubjectAssignment.findByIdAndDelete(id);

    if (!deletedSubject) {
      return res.status(404).json({ message: "Subject assignment not found" });
    }

    res.status(200).json({
      message: "Subject assignment deleted successfully"
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message
    });
  }
};


const addExamQuestion = async (req, res) => {
  try {
    const { course, level, subject, questionText, options, correctAnswer, points } = req.body;

    const question = await Exam.create({
      entryType: 'question',
      course,
      level,
      subject,
      questionText,
      options,
      correctAnswer,
      points
    });

    res.status(201).json({
      success: true,
      message: "Question node integrated into academic cluster.",
      question
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: "Question deployment rejected. Check parameter integrity.",
      error: err.message
    });
  }
};

const publishResult = async (req, res) => {
  try {
    const { studentName, subject, score, grade, term } = req.body;

    const result = await Exam.create({
      entryType: 'result',
      studentName,
      subject,
      score,
      grade,
      term
    });


    res.status(201).json({
      success: true,
      message: "Academic performance node published successfully.",
      result
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: "Result publication failed.",
      error: err.message
    });
    console.error("Error publishing result:", err);
  }
};

const getAllResults = async (req, res) => {
  try {
    const results = await Exam.find({ entryType: 'result' }).sort({ createdAt: -1 });
    res.status(200).json(results);
  } catch (err) {
    res.status(500).json({ message: "Error fetching result datastream." });
  }
};

const deleteExamEntry = async (req, res) => {
  try {
    const entry = await Exam.findById(req.params.id);

    if (!entry) {
      return res.status(404).json({ message: "Entry not found in cluster." });
    }

    await entry.deleteOne();
    res.status(200).json({ message: "Node purged successfully." });
  } catch (err) {
    res.status(500).json({ message: "Purge sequence failed." });
  }
};

const addBook = async (req, res) => {
  try {
    const { totalCopies } = req.body;
    const book = await Library.create({
      ...req.body,
      availableCopies: totalCopies
    });
    res.status(201).json({ success: true, book });
  } catch (err) {
    res.status(400).json({ message: "Cataloging failed. ISBN may already exist." });
  }
};

const getAllBooks = async (req, res) => {
  try {
    const books = await Library.find().sort({ title: 1 });
    res.status(200).json(books);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch library datastream." });
  }
};

const issueBook = async (req, res) => {
  try {
    const { bookId, studentId, studentName, durationDays } = req.body;
    const book = await Library.findById(bookId);

    if (book.availableCopies < 1) {
      return res.status(400).json({ message: "No physical copies available for deployment." });
    }

    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + (durationDays || 7));

    book.availableCopies -= 1;
    book.activeLoans.push({ studentId, studentName, dueDate });

    await book.save();
    res.status(200).json({ success: true, message: "Asset issued successfully.", book });
  } catch (err) {
    res.status(500).json({ message: "Issue sequence failed." });
  }
};

const returnBook = async (req, res) => {
  try {
    const { bookId, studentId } = req.body;
    const book = await Library.findById(bookId);

    const loanIndex = book.activeLoans.findIndex(l => l.studentId.toString() === studentId);
    if (loanIndex === -1) return res.status(404).json({ message: "Loan record not found." });

    const loan = book.activeLoans[loanIndex];
    const today = new Date();
    let fine = 0;

    if (today > loan.dueDate) {
      const diffTime = Math.abs(today - loan.dueDate);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      fine = diffDays * 500;
    }

    book.availableCopies += 1;
    book.activeLoans.splice(loanIndex, 1);
    await book.save();

    res.status(200).json({
      success: true,
      message: fine > 0 ? `Book returned with fine: ₦${fine}` : "Book returned successfully.",
      fine
    });
  } catch (err) {
    res.status(500).json({ message: "Return sequence failed." });
  }
};

const addTransportRoute = async (req, res) => {
  try {
    const route = await Transport.create(req.body);
    res.status(201).json({ success: true, route });
  } catch (err) {
    res.status(400).json({ message: "Deployment of transit node failed. Verify vehicle unique ID." });
  }
};

const getAllTransport = async (req, res) => {
  try {
    const fleet = await Transport.find().sort({ routeName: 1 });
    res.status(200).json(fleet);
  } catch (err) {
    res.status(500).json({ message: "Failed to synchronize with fleet database." });
  }
};

const updateVehicleStatus = async (req, res) => {
  try {
    const { id, status } = req.body;
    const route = await Transport.findByIdAndUpdate(id, { status }, { returnDocument: 'after'});
    res.status(200).json({ success: true, route });
  } catch (err) {
    res.status(400).json({ message: "Status update rejected by cluster." });
  }
};

const deleteTransportRoute = async (req, res) => {
  try {
    await Transport.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: "Transit node purged." });
  } catch (err) {
    res.status(500).json({ message: "Purge sequence failed." });
  }
};

const addHostelRoom = async (req, res) => {
  try {
    const room = await Hostel.create(req.body);
    res.status(201).json({ success: true, room });
  } catch (err) {
    res.status(400).json({ message: "Failed to initialize residential node." });
    console.error("Error adding hostel room:", err);
  }
};

const getAllHostelRooms = async (req, res) => {
  try {
    const rooms = await Hostel.find().populate('occupants', 'fullname email').sort({ blockName: 1 });
    res.status(200).json(rooms);
  } catch (err) {
    res.status(500).json({ message: "Sync with residential database failed." });
  }
};

const allocateRoom = async (req, res) => {
  try {
    const { roomId, studentId } = req.body;
    const room = await Hostel.findById(roomId);

    if (room.occupants.length >= room.capacity) {
      return res.status(400).json({ message: "Node capacity reached. Allocation rejected." });
    }

    room.occupants.push(studentId);
    await room.save();

    res.status(200).json({ success: true, message: "Student allocated successfully.", room });
  } catch (err) {
    res.status(500).json({ message: "Allocation sequence failed." });
  }
};

const deleteRoom = async (req, res) => {
  try {
    await Hostel.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: "Node purged." });
  } catch (err) {
    res.status(500).json({ message: "Deletion failed." });
  }
};


const getEvents = async (req, res) => {
  try {
    const events = await Event.find().sort({ date: 1 });
    res.json(events);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

const addEvent = async (req, res) => {
  try {
    const newEvent = new Event(req.body);
    await newEvent.save();
    res.status(201).json(newEvent);
  } catch (err) {
    res.status(400).json({ error: 'Failed to create event' });
  }
};

const deleteEvent = async (req, res) => {
  try {
    await Event.findByIdAndDelete(req.params.id);
    res.json({ message: 'Event purged' });
  } catch (err) {
    res.status(400).json({ error: 'Purge failed' });
  }
};

const createAssignment = async (req, res) => {
  try {
    const { title, description, courseName, dueDate, attachments } = req.body;

    const cls = await Class.findOne({
      $or: [
        { cohort: { $regex: new RegExp(`^${courseName.trim()}$`, 'i') } },
        { name: { $regex: new RegExp(`^${courseName.trim()}$`, 'i') } }
      ]
    });

    if (!cls) {
      const existing = await Class.find().limit(2);
      console.log("❌ Match failed. Sample DB entries:", JSON.stringify(existing, null, 2));

      return res.status(404).json({
        message: `Course '${courseName}' not found. Ensure the class is created in the 'Classes' tab.`
      });
    }

    const assignment = new Assignment({
      title,
      description: description || '',
      course: cls._id,
      dueDate: dueDate || null,
      attachments: attachments || [],
      createdBy: req.user.id
    });

    await assignment.save();

    const result = assignment.toObject();
    result.course = { cohort: cls.cohort, name: cls.name };

    res.status(201).json({
      success: true,
      message: 'Assignment deployed to portal successfully',
      assignment: result
    });

  } catch (err) {
    console.error("🔥 Database Save Error:", err);
    res.status(500).json({ success: false, message: err.message });
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

const deleteAssignment = async (req, res) => {
  try {
    await Assignment.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'Assignment purged successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete assignment' });
  }
};

const editAssignment = async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await Assignment.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });
    if (!updated) {
      return res.status(404).json({ message: 'Assignment not found' });
    }
    res.status(200).json({ message: 'Assignment updated successfully', assignment: updated });
  } catch (err) {
    res.status(400).json({ message: 'Failed to update assignment', error: err.message });
  }
};

const getAllCoursesAdmin = async (req, res) => {
  try {
    const courses = await Course.find({})
      .populate("students", "name email")
      .sort({ createdAt: -1 });

    return res.status(200).json({ success: true, courses });
  } catch (error) {
    console.error("Admin Fetch Error:", error);
    return res.status(500).json({ message: "Failed to fetch admin courses" });
  }
};

const createCourse = async (req, res) => {
  try {
    const { title, code, instructor, schedule, description } = req.body;

    if (!title || !code || !instructor || !schedule || !description) {
      return res.status(400).json({
        success: false,
        message: "All fields (Title, Code, Instructor, Schedule, Description) are required."
      });
    }

    const newCourse = new Course({
      title,
      code: code.trim().toUpperCase(),
      instructor,
      schedule,
      description,
      students: []
    });

    await newCourse.save();

    return res.status(201).json({
      success: true,
      message: "Course created successfully!",
      course: newCourse
    });

  } catch (error) {
    console.error("Error inside createCourse backend:", error);

    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "A course with this unique Course Code already exists."
      });
    }

    return res.status(500).json({
      success: false,
      message: "Internal server error while saving the course.",
      error: error.message
    });
  }
};

const editCourse = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, code, instructor, schedule, description } = req.body;

    if (!title || !code || !instructor || !schedule || !description) {
      return res.status(400).json({
        success: false,
        message: "All fields (Title, Code, Instructor, Schedule, Description) are required."
      });
    }

    const updatedCourse = await Course.findByIdAndUpdate(
      id,
      {
        title,
        code: code.trim().toUpperCase(),
        instructor,
        schedule,
        description
      },
      { new: true, runValidators: true }
    );

    if (!updatedCourse) {
      return res.status(404).json({
        success: false,
        message: "Course not found with the provided ID."
      });
    }

    return res.status(200).json({
      success: true,
      message: "Course updated successfully!",
      course: updatedCourse
    });

  } catch (error) {
    console.error("Error inside editCourse backend:", error);

    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "A course with this unique Course Code already exists."
      });
    }

    return res.status(500).json({
      success: false,
      message: "Internal server error while updating the course.",
      error: error.message
    });
  }
};

const deleteCourse = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedCourse = await Course.findByIdAndDelete(id);

    if (!deletedCourse) {
      return res.status(404).json({
        success: false,
        message: "Course not found with the provided ID."
      });
    }

    return res.status(200).json({
      success: true,
      message: "Course deleted successfully!"
    });

  } catch (error) {
    console.error("Error inside deleteCourse backend:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error while deleting the course.",
      error: error.message
    });
  }
};

const createSession = async (req, res) => {
  const { title,  time, date, location } = req.body;
  console.log("Received session data:", req.body);
  try {
    const newSession = new Session({
      title,
      time,
      date,
      location
    });
    await newSession.save();
    res.status(201).json({ success: true, session: newSession });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getAllSessions = async (req, res) => {
  try {
    const sessions = await Session.find().sort({ date: 1 });
    res.status(200).json({ success: true, sessions });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getSessionById = async (req, res) => {
  try {
    const { id } = req.params;
    const session = await Session.findById(id);
    if (!session) {
      return res.status(404).json({
        success: false,
        message: "Session not found with the provided ID."
      });
    }
    res.status(200).json({ success: true, session });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const updateSession = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedSession = await Session.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });
    if (!updatedSession) {
      return res.status(404).json({
        success: false,
        message: "Session not found with the provided ID."
      });
    }
    res.status(200).json({
      success: true,
      message: "Session updated successfully!",
      session: updatedSession
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const deleteSession = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedSession = await Session.findByIdAndDelete(id);
    if (!deletedSession) {
      return res.status(404).json({
        success: false,
        message: "Session not found with the provided ID."
      });
    }
    res.status(200).json({
      success: true,
      message: "Session deleted successfully!"
    });
  }
  catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


module.exports = {
  getAllUsers,
  deleteUser,
  getAllStudent,
  getAllAdmin,
  createAdmin,
  createTeacher,
  getTeachers,
  adminLogin,
  getCurriculum,
  deployModule,
  deleteModule,
  createStudent,
  updateStudent,
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
  addBook,
  getAllBooks,
  createAssignment,
  getAllAssignments,
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
};