export const departments = [
  { id: 1, name: 'Anatomy', icon: 'fa-bone', description: 'Study of human body structure, organs, and systems', subjects: ['Human Anatomy', 'Embryology', 'Histology'], faculty: 4, courses: 3 },
  { id: 2, name: 'Physiology', icon: 'fa-heart-pulse', description: 'Functions and mechanisms of living systems', subjects: ['Human Physiology', 'Cell Biology'], faculty: 3, courses: 2 },
  { id: 3, name: 'Biochemistry', icon: 'fa-flask', description: 'Chemical processes within living organisms', subjects: ['Biochemistry', 'Molecular Biology'], faculty: 3, courses: 2 },
  { id: 4, name: 'Botany', icon: 'fa-leaf', description: 'Study of plant life and botanical sciences', subjects: ['Plant Biology', 'Ecology', 'Genetics'], faculty: 2, courses: 2 },
  { id: 5, name: 'Zoology', icon: 'fa-paw', description: 'Study of animal life and behavior', subjects: ['Animal Biology', 'Entomology', 'Parasitology'], faculty: 2, courses: 2 },
  { id: 6, name: 'Physics', icon: 'fa-atom', description: 'Fundamental physics for medical entrance exams', subjects: ['Mechanics', 'Optics', 'Thermodynamics', 'Electromagnetism'], faculty: 5, courses: 4 },
  { id: 7, name: 'Chemistry', icon: 'fa-vial', description: 'Organic, inorganic, and physical chemistry', subjects: ['Organic Chemistry', 'Inorganic Chemistry', 'Physical Chemistry'], faculty: 4, courses: 3 },
  { id: 8, name: 'Logical Reasoning', icon: 'fa-brain', description: 'Critical thinking and analytical reasoning', subjects: ['Verbal Reasoning', 'Quantitative Techniques', 'Data Interpretation'], faculty: 2, courses: 2 },
  { id: 9, name: 'Medical Admissions Guidance', icon: 'fa-graduation-cap', description: 'Counseling and preparation for medical entrance exams', subjects: ['Career Guidance', 'Application Support', 'Interview Prep'], faculty: 3, courses: 2 },
];

export const courses = [
  { id: 1, name: 'NEET Foundation', category: 'NEET', description: 'Complete foundation course covering all NEET subjects', subjects: ['Physics', 'Chemistry', 'Biology'], faculty: ['Dr. Sharma', 'Dr. Gupta'], students: 245, duration: '12 months', icon: 'fa-book-medical', color: '#0d9488' },
  { id: 2, name: 'NEET Physics', category: 'NEET', description: 'Focused physics preparation for NEET examination', subjects: ['Mechanics', 'Optics', 'Thermodynamics', 'Electromagnetism'], faculty: ['Dr. Verma'], students: 180, duration: '6 months', icon: 'fa-atom', color: '#3b82f6' },
  { id: 3, name: 'NEET Chemistry', category: 'NEET', description: 'Comprehensive chemistry for NEET aspirants', subjects: ['Organic', 'Inorganic', 'Physical Chemistry'], faculty: ['Dr. Patel'], students: 175, duration: '6 months', icon: 'fa-flask', color: '#8b5cf6' },
  { id: 4, name: 'NEET Biology', category: 'NEET', description: 'In-depth biology covering botany and zoology', subjects: ['Botany', 'Zoology', 'Genetics', 'Ecology'], faculty: ['Dr. Singh', 'Dr. Rao'], students: 220, duration: '8 months', icon: 'fa-dna', color: '#16a34a' },
  { id: 5, name: 'NEET Revision', category: 'NEET', description: 'Intensive revision and practice sessions', subjects: ['All Subjects'], faculty: ['Dr. Sharma', 'Dr. Gupta', 'Dr. Verma'], students: 150, duration: '3 months', icon: 'fa-redo', color: '#f59e0b' },
  { id: 6, name: 'NEET Mock Tests', category: 'NEET', description: 'Full-length mock tests with detailed analysis', subjects: ['All Subjects'], faculty: ['Dr. Sharma'], students: 200, duration: '4 months', icon: 'fa-clipboard-check', color: '#ef4444' },
  { id: 7, name: 'IMAT Foundation', category: 'IMAT', description: 'Complete IMAT preparation course', subjects: ['Biology', 'Chemistry', 'Physics', 'Math', 'Logic'], faculty: ['Dr. Rossi', 'Dr. Bianchi'], students: 85, duration: '10 months', icon: 'fa-globe-europe', color: '#0d9488' },
  { id: 8, name: 'IMAT Biology', category: 'IMAT', description: 'Biology preparation aligned with IMAT syllabus', subjects: ['Cell Biology', 'Genetics', 'Human Biology'], faculty: ['Dr. Rossi'], students: 65, duration: '5 months', icon: 'fa-microscope', color: '#16a34a' },
  { id: 9, name: 'IMAT Chemistry', category: 'IMAT', description: 'Chemistry for IMAT examination', subjects: ['Organic', 'Inorganic', 'Physical'], faculty: ['Dr. Bianchi'], students: 60, duration: '5 months', icon: 'fa-vial', color: '#8b5cf6' },
  { id: 10, name: 'IMAT Physics & Math', category: 'IMAT', description: 'Physics and mathematics for IMAT', subjects: ['Physics', 'Mathematics'], faculty: ['Dr. Conti'], students: 55, duration: '6 months', icon: 'fa-calculator', color: '#3b82f6' },
  { id: 11, name: 'IMAT Logical Reasoning', category: 'IMAT', description: 'Logical and critical reasoning for IMAT', subjects: ['Verbal Reasoning', 'Critical Thinking', 'Problem Solving'], faculty: ['Dr. Marino'], students: 70, duration: '4 months', icon: 'fa-brain', color: '#f59e0b' },
  { id: 12, name: 'IMAT Mock Tests', category: 'IMAT', description: 'IMAT-pattern mock tests with analysis', subjects: ['All IMAT Sections'], faculty: ['Dr. Rossi'], students: 75, duration: '3 months', icon: 'fa-file-alt', color: '#ef4444' },
  { id: 13, name: 'UCAT Preparation', category: 'UCAT', description: 'UK Clinical Aptitude Test preparation', subjects: ['Verbal Reasoning', 'Decision Making', 'Quantitative', 'Abstract'], faculty: ['Dr. Khan'], students: 40, duration: '4 months', icon: 'fa-stethoscope', color: '#06b6d4' },
  { id: 14, name: 'MCAT Preparation', category: 'MCAT', description: 'Medical College Admission Test preparation', subjects: ['Biological Sciences', 'Chemical Sciences', 'Psychology', 'CARS'], faculty: ['Dr. Ahmed'], students: 35, duration: '6 months', icon: 'fa-user-md', color: '#7c3aed' },
  { id: 15, name: 'Other Medical Entrance', category: 'Other', description: 'Preparation for other medical entrance examinations', subjects: ['Varies by exam'], faculty: ['Dr. Sharma'], students: 50, duration: '6 months', icon: 'fa-hospital', color: '#64748b' },
];

export const resources = [
  { id: 1, title: 'Human Anatomy Complete Notes', type: 'PDF', subject: 'Anatomy', course: 'NEET Biology', uploader: 'Dr. Singh', date: '2024-12-15', size: '15.2 MB', status: 'published' },
  { id: 2, title: 'Organic Chemistry Reactions', type: 'PDF', subject: 'Chemistry', course: 'NEET Chemistry', uploader: 'Dr. Patel', date: '2024-12-10', size: '8.7 MB', status: 'published' },
  { id: 3, title: 'Physics Mechanics Lecture', type: 'Video', subject: 'Physics', course: 'NEET Physics', uploader: 'Dr. Verma', date: '2024-12-12', size: '245 MB', duration: '1:23:45', status: 'published' },
  { id: 4, title: 'NEET 2023 Question Paper', type: 'PYQ', subject: 'All', course: 'NEET Mock Tests', uploader: 'Admin', date: '2024-11-20', size: '5.3 MB', status: 'published' },
  { id: 5, title: 'Botany Cell Division Notes', type: 'Notes', subject: 'Botany', course: 'NEET Biology', uploader: 'Dr. Rao', date: '2024-12-08', size: '3.1 MB', status: 'published' },
  { id: 6, title: 'IMAT Logical Reasoning Guide', type: 'PDF', subject: 'Logical Reasoning', course: 'IMAT Logical Reasoning', uploader: 'Dr. Marino', date: '2024-12-14', size: '12.4 MB', status: 'published' },
  { id: 7, title: 'Zoology Animal Kingdom', type: 'Video', subject: 'Zoology', course: 'NEET Biology', uploader: 'Dr. Singh', date: '2024-12-11', size: '320 MB', duration: '1:45:20', status: 'published' },
  { id: 8, title: 'Biochemistry Metabolism', type: 'PDF', subject: 'Biochemistry', course: 'IMAT Biology', uploader: 'Dr. Rossi', date: '2024-12-09', size: '9.8 MB', status: 'published' },
  { id: 9, title: 'IMAT 2023 Past Paper', type: 'PYQ', subject: 'All', course: 'IMAT Mock Tests', uploader: 'Admin', date: '2024-11-15', size: '6.1 MB', status: 'published' },
  { id: 10, title: 'Thermodynamics Practice Set', type: 'Assignment', subject: 'Physics', course: 'NEET Physics', uploader: 'Dr. Verma', date: '2024-12-13', size: '2.4 MB', status: 'published' },
];

export const announcements = [
  { id: 1, title: 'NEET 2025 Registration Open', content: 'Registration for NEET 2025 is now open. Last date: March 15, 2025. All students must complete their registration.', date: '2024-12-15', pinned: true, author: 'Admin' },
  { id: 2, title: 'IMAT Mock Test Series', content: 'New IMAT mock test series starting January 5, 2025. Register through the course page.', date: '2024-12-14', pinned: true, author: 'Dr. Rossi' },
  { id: 3, title: 'Holiday Schedule', content: 'Institute will remain closed from Dec 25 to Jan 1. Regular classes resume Jan 2.', date: '2024-12-13', pinned: false, author: 'Admin' },
  { id: 4, title: 'New Study Materials Added', content: 'Fresh study materials for Physics and Chemistry have been uploaded. Check the Resources section.', date: '2024-12-12', pinned: false, author: 'Dr. Verma' },
];

export const communityMessages = [
  { id: 1, author: 'Dr. Sharma', role: 'Faculty', message: 'Remember to practice at least 50 MCQs daily for NEET preparation. Consistency is key!', time: '2 hours ago', likes: 24, replies: 5 },
  { id: 2, author: 'Priya S.', role: 'Student', message: 'Just completed the Anatomy mock test. The questions were very helpful! Thank you Dr. Singh.', time: '4 hours ago', likes: 12, replies: 3 },
  { id: 3, author: 'Admin', role: 'Admin', message: 'Welcome to the new semester! We have exciting updates including new IMAT courses and mock test series.', time: '1 day ago', likes: 45, replies: 15 },
  { id: 4, author: 'Dr. Rossi', role: 'Faculty', message: 'IMAT aspirants: Focus on logical reasoning this week. New practice sets available in resources.', time: '1 day ago', likes: 18, replies: 7 },
  { id: 5, author: 'Rahul K.', role: 'Student', message: 'Can someone explain the Krebs cycle regulation? Having trouble with the feedback mechanisms.', time: '2 days ago', likes: 8, replies: 12 },
];

export const quizzes = [
  { id: 1, title: 'NEET Biology - Cell Division', subject: 'Biology', course: 'NEET Biology', questions: 30, duration: 45, marks: 120, negativeMarking: 1, status: 'active', createdBy: 'Dr. Singh', startDate: '2024-12-20', endDate: '2024-12-25' },
  { id: 2, title: 'NEET Physics - Mechanics', subject: 'Physics', course: 'NEET Physics', questions: 25, duration: 40, marks: 100, negativeMarking: 1, status: 'active', createdBy: 'Dr. Verma', startDate: '2024-12-18', endDate: '2024-12-22' },
  { id: 3, title: 'IMAT Logical Reasoning Test', subject: 'Logical Reasoning', course: 'IMAT Logical Reasoning', questions: 20, duration: 30, marks: 60, negativeMarking: 0.5, status: 'upcoming', createdBy: 'Dr. Marino', startDate: '2025-01-05', endDate: '2025-01-07' },
  { id: 4, title: 'Chemistry - Organic Reactions', subject: 'Chemistry', course: 'NEET Chemistry', questions: 35, duration: 50, marks: 140, negativeMarking: 1, status: 'completed', createdBy: 'Dr. Patel', startDate: '2024-12-01', endDate: '2024-12-05' },
  { id: 5, title: 'NEET Full Mock Test 1', subject: 'All', course: 'NEET Mock Tests', questions: 50, duration: 60, marks: 200, negativeMarking: 1, status: 'upcoming', createdBy: 'Dr. Sharma', startDate: '2025-01-10', endDate: '2025-01-12' },
];

export const sampleQuizQuestions = [
  {
    id: 1, question: 'Which organelle is known as the powerhouse of the cell?',
    options: ['Nucleus', 'Mitochondria', 'Ribosome', 'Golgi apparatus'],
    correctAnswer: 1, subject: 'Biology', marks: 4, negativeMarks: 1
  },
  {
    id: 2, question: 'The process of cell division in somatic cells is called:',
    options: ['Meiosis', 'Mitosis', 'Binary fission', 'Budding'],
    correctAnswer: 1, subject: 'Biology', marks: 4, negativeMarks: 1
  },
  {
    id: 3, question: 'Which phase of the cell cycle involves DNA replication?',
    options: ['G1 phase', 'S phase', 'G2 phase', 'M phase'],
    correctAnswer: 1, subject: 'Biology', marks: 4, negativeMarks: 1
  },
  {
    id: 4, question: 'Centrioles are found in:',
    options: ['Plant cells only', 'Animal cells', 'Both plant and animal cells', 'Bacterial cells'],
    correctAnswer: 1, subject: 'Biology', marks: 4, negativeMarks: 1
  },
  {
    id: 5, question: 'The spindle fibers are formed from:',
    options: ['Microtubules', 'Microfilaments', 'Intermediate filaments', 'Centromeres'],
    correctAnswer: 0, subject: 'Biology', marks: 4, negativeMarks: 1
  },
];

export const users = {
  admin: { id: 1, name: 'Administrator', email: 'admin@sultanatitalia.edu', role: 'admin', avatar: '👨‍💼' },
  faculty: { id: 2, name: 'Dr. Sharma', email: 'sharma@sultanatitalia.edu', role: 'faculty', avatar: '👨‍⚕️', department: 'Physics', courses: ['NEET Foundation', 'NEET Physics', 'NEET Mock Tests'] },
  student: { id: 3, name: 'Ayesha Khan', email: 'ayesha@student.edu', role: 'student', avatar: '👩‍🎓', enrolledCourses: ['NEET Foundation', 'NEET Physics', 'NEET Biology'], studentId: 'SIM-2024-0042' },
};

export const notifications = [
  { id: 1, title: 'New Quiz Available', message: 'NEET Biology - Cell Division quiz is now active', time: '1 hour ago', read: false, type: 'quiz' },
  { id: 2, title: 'Study Material Uploaded', message: 'New PDF: Human Anatomy Complete Notes', time: '3 hours ago', read: false, type: 'resource' },
  { id: 3, title: 'Announcement', message: 'NEET 2025 Registration is now open', time: '1 day ago', read: true, type: 'announcement' },
  { id: 4, title: 'Quiz Result Published', message: 'Your result for Chemistry - Organic Reactions is available', time: '2 days ago', read: true, type: 'result' },
  { id: 5, title: 'Community Update', message: 'Dr. Sharma posted in the community', time: '2 days ago', read: true, type: 'community' },
];

export const auditLogs = [
  { id: 1, action: 'User Login', user: 'Ayesha Khan', timestamp: '2024-12-15 09:30:00', ip: '192.168.1.***', details: 'Student login from mobile app' },
  { id: 2, action: 'Resource Accessed', user: 'Ayesha Khan', timestamp: '2024-12-15 09:35:00', ip: '192.168.1.***', details: 'Viewed: Human Anatomy Complete Notes' },
  { id: 3, action: 'Quiz Attempted', user: 'Rahul Kumar', timestamp: '2024-12-15 10:00:00', ip: '10.0.0.***', details: 'Started: NEET Physics - Mechanics' },
  { id: 4, action: 'Profile View', user: 'Admin', timestamp: '2024-12-15 11:00:00', ip: '172.16.0.***', details: 'Viewing as: Ayesha Khan (Reason: Support request)' },
  { id: 5, action: 'Resource Uploaded', user: 'Dr. Verma', timestamp: '2024-12-15 14:00:00', ip: '192.168.2.***', details: 'Uploaded: Thermodynamics Practice Set' },
];
