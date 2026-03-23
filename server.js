const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-key-2026';

app.use(cors({ 
  origin: ['http://localhost:3000', 'http://192.168.1.2:3000'], 
  credentials: true 
}));
app.use(express.json({ limit: '10mb' }));

// 🔐 USERS FOR LOGIN (Your demo credentials)
const users = [
  { id: 1, username: 'admin', password: bcrypt.hashSync('admin@123', 10), role: 'admin' },
  { id: 2, username: 'student', password: bcrypt.hashSync('student@123', 10), role: 'student' }
];

// 📊 YOUR EXISTING RESUME ANALYZER (Unchanged)
const roleSkills = {
  'Software Engineer': ['JavaScript', 'Python', 'Git', 'Algorithms', 'OOP'],
  'Frontend Developer': ['React', 'HTML5', 'CSS3', 'Redux', 'TypeScript'],
  'Backend Developer': ['Node.js', 'Express', 'SQL', 'MongoDB', 'REST API'],
  'Full Stack Developer': ['React', 'Node.js', 'Database', 'Docker', 'AWS'],
  'Data Scientist': ['Python', 'Pandas', 'Machine Learning', 'TensorFlow', 'Statistics'],
  'Data Analyst': ['SQL', 'Excel', 'Tableau', 'Python', 'Data Visualization'],
  'Product Manager': ['Agile', 'Scrum', 'Roadmapping', 'Stakeholder Management', 'Metrics'],
  'UI/UX Designer': ['Figma', 'Sketch', 'User Research', 'Prototyping', 'Design Systems'],
  'DevOps Engineer': ['Docker', 'Kubernetes', 'CI/CD', 'AWS', 'Terraform'],
  'Cloud Architect': ['AWS', 'Azure', 'GCP', 'Serverless', 'Microservices'],
  'ML Engineer': ['TensorFlow', 'PyTorch', 'Scikit-learn', 'MLOps', 'Deployment'],
  'QA Engineer': ['Selenium', 'Cypress', 'Jira', 'Test Automation', 'API Testing']
};

// 🆕 NEW: LOGIN API (For your Admin/Student login)
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  
  const user = users.find(u => u.username === username);
  if (!user || !bcrypt.compareSync(password, user.password)) {
    return res.status(401).json({ error: '❌ Invalid credentials' });
  }
  
  const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '24h' });
  
  console.log(`✅ ${user.role} login: ${username}`);
  res.json({ 
    token, 
    role: user.role, 
    username: user.username,
    message: `Welcome ${user.role}!`
  });
});

// 📊 YOUR RESUME ANALYZER (Unchanged)
app.post('/api/analyze-resume', (req, res) => {
  try {
    const { resumeText, selectedRole, customRole } = req.body;
    
    let role = (customRole || selectedRole || '').replace(/[^\w\s]/g, '').trim();
    const requiredSkills = roleSkills[role];
    
    if (!resumeText?.trim()) {
      return res.status(400).json({ success: false, error: 'No resume text' });
    }
    
    if (!requiredSkills || requiredSkills.length === 0) {
      return res.status(400).json({ 
        success: false, 
        error: `Role "${role}" not found. Try: Frontend Developer, Software Engineer`
      });
    }
    
    const resumeLower = resumeText.toLowerCase();
    const matchingSkills = requiredSkills.filter(skill => 
      resumeLower.includes(skill.toLowerCase())
    );
    
    const matchScore = Math.round((matchingSkills.length / requiredSkills.length) * 100);
    const isGoodMatch = matchScore >= 70;
    
    console.log(`📊 ${role}: ${matchScore}% (${matchingSkills.length}/${requiredSkills.length})`);
    
    res.json({
      success: true,
      matchScore,
      isGoodMatch,
      matchingSkills,
      skillsToDevelop: requiredSkills.filter(skill => !matchingSkills.includes(skill)).slice(0, 4),
      role
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 🆕 NEW: Health Check + Demo Info
app.get('/api/health', (req, res) => {
  res.json({ 
    status: '✅ Backend ready!', 
    timestamp: new Date().toISOString(),
    loginDemo: {
      admin: 'admin@123',
      student: 'student@123'
    },
    endpoints: ['/api/login', '/api/analyze-resume']
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Backend: http://localhost:${PORT}`);
  console.log('🔑 Demo Login:');
  console.log('   admin / admin@123');
  console.log('   student / student@123');
  console.log('📱 Test: http://localhost:5000/api/health');
});
