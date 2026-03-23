// src/components/ResumeAnalyzer.js
import React, { useState } from 'react';
import Header from './ResumeAnalyzer/Header';
import JobRoleSelector from './ResumeAnalyzer/JobRoleSelector';
import ResumeUpload from './ResumeAnalyzer/ResumeUpload';
import AnalysisResult from './ResumeAnalyzer/AnalysisResult';
import LoadingState from './ResumeAnalyzer/LoadingState';
import './ResumeAnalyzer/Header.css';
import './ResumeAnalyzer/JobRoleSelector.css';
import './ResumeAnalyzer/ResumeUpload.css';
import './ResumeAnalyzer/AnalysisResult.css';

const ResumeAnalyzer = () => {
  const [jobRole, setJobRole] = useState('');
  const [customRole, setCustomRole] = useState('');
  const [customSkills, setCustomSkills] = useState('');
  const [resumeText, setResumeText] = useState('');
  const [fileName, setFileName] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  // Hugging Face API Configuration
  const HF_API_KEY = process.env.REACT_APP_HF_API_KEY || '';
  const HF_MODEL = 'mistralai/Mistral-7B-Instruct-v0.2';

  // Main analysis function
  const analyzeResume = async () => {
    const effectiveRole = customRole || jobRole;
    
    if (!effectiveRole && !customSkills) {
      setError('⚠️ Please select a job role OR enter specific skills to analyze');
      return;
    }

    if (!resumeText.trim()) {
      setError('⚠️ Please upload your resume or paste resume text');
      return;
    }

    setError('');
    setIsAnalyzing(true);
    setResult(null);

    try {
      const analysis = await analyzeWithHuggingFace(
        resumeText, 
        effectiveRole || 'Custom Skills Analysis',
        customSkills
      );
      setResult(analysis);

    } catch (err) {
      console.error('Analysis error:', err);
      
      let errorMessage = 'Analysis failed';
      
      if (err.message.includes('fetch') || err.message.includes('NetworkError')) {
        errorMessage = '❌ Network error. Please check your internet connection.';
      } else if (err.message.includes('401') || err.message.includes('403')) {
        errorMessage = '❌ Invalid API key. Please check your Hugging Face API key in .env file.';
      } else if (err.message.includes('429')) {
        errorMessage = '❌ API rate limit exceeded. Please wait a few minutes and try again.';
      } else if (err.message.includes('503') || err.message.includes('loading')) {
        errorMessage = '❌ AI model is loading. Please wait 20-30 seconds and try again.';
      } else if (err.message.includes('No API key')) {
        errorMessage = '❌ Missing API key. Please add REACT_APP_HF_API_KEY to your .env file.';
      } else {
        errorMessage = `❌ ${err.message}`;
      }
      
      setError(errorMessage);
      
      console.log('Falling back to local analysis...');
      try {
        const localAnalysis = analyzeResumeLocally(
          resumeText, 
          effectiveRole || 'Custom Skills',
          customSkills
        );
        setResult(localAnalysis);
        setError('⚠️ Using local analysis (AI unavailable)');
      } catch (localErr) {
        console.error('Local analysis also failed:', localErr);
      }
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Hugging Face API Analysis with custom skills support
  const analyzeWithHuggingFace = async (resume, role, skills) => {
    if (!HF_API_KEY) {
      throw new Error('No API key found. Please add REACT_APP_HF_API_KEY to your .env file.');
    }

    const truncatedResume = resume.slice(0, 4500);

    let targetSkills = '';
    if (skills) {
      targetSkills = skills;
    } else {
      const roleExamples = {
        'software-engineer': 'Programming, JavaScript, Python, Java, Git, Algorithms, Data Structures, OOP',
        'frontend-developer': 'HTML, CSS, JavaScript, React, Vue, Angular, TypeScript, SASS, Redux, Webpack',
        'backend-developer': 'Python, Java, Node.js, Express, SQL, MongoDB, REST API, GraphQL, Microservices',
        'full-stack-developer': 'JavaScript, React, Node.js, SQL, MongoDB, REST API, HTML, CSS, Express',
        'data-scientist': 'Python, R, Machine Learning, Statistics, Pandas, NumPy, TensorFlow, SQL',
        'data-analyst': 'SQL, Excel, Python, Tableau, Power BI, Statistics, Data Visualization',
        'product-manager': 'Product Strategy, Agile, Scrum, User Research, JIRA, Roadmapping',
        'ui-ux-designer': 'Figma, Adobe XD, Sketch, Prototyping, User Research, Wireframing',
        'devops-engineer': 'Docker, Kubernetes, CI/CD, Jenkins, AWS, Linux, Terraform, Ansible',
        'cloud-architect': 'AWS, Azure, Cloud Architecture, Microservices, Docker, Kubernetes',
        'machine-learning-engineer': 'Python, TensorFlow, PyTorch, Deep Learning, Neural Networks, NLP, Computer Vision',
        'qa-engineer': 'Test Automation, Selenium, Cypress, Jest, API Testing, Manual Testing',
        'project-manager': 'Project Management, Agile, Scrum, JIRA, Risk Management, Leadership',
        'business-analyst': 'Requirements Analysis, Data Analysis, SQL, Business Process, Documentation',
        'marketing-manager': 'Digital Marketing, SEO, Content Strategy, Social Media, Analytics',
        'cybersecurity': 'Network Security, Penetration Testing, Firewall, Encryption, Vulnerability Assessment',
        'mobile-developer': 'React Native, Swift, Kotlin, Flutter, iOS, Android, Firebase',
        'game-developer': 'Unity, Unreal Engine, C#, C++, Game Design, 3D Modeling'
      };

      const roleKey = role.toLowerCase().replace(/ /g, '-');
      targetSkills = roleExamples[roleKey] || 'relevant technical skills';
    }

    const analysisType = skills ? 'specific skills' : `"${role}" position`;

    const prompt = `You are an expert ATS system analyzing a resume for ${analysisType}.

Resume Content:
"""
${truncatedResume}
"""

Target Skills to Analyze: ${targetSkills}

Your Task: Create a PERSONALIZED analysis based on the ACTUAL resume content.

Instructions:
1. MATCHING SKILLS: Extract ONLY skills from the target list that appear in the resume
2. SKILLS TO DEVELOP: List 4 missing skills from the target list that would be valuable
3. STRENGTHS: Write 4 SPECIFIC strengths based on WHAT YOU READ in the resume
4. RECOMMENDATIONS: Write 4 UNIQUE suggestions based on what's MISSING

Return ONLY this JSON format:
{
  "match_percentage": 65,
  "summary": "Brief assessment",
  "matching_skills": ["skill1", "skill2"],
  "skills_to_develop": ["skill1", "skill2", "skill3", "skill4"],
  "strengths": ["strength1", "strength2", "strength3", "strength4"],
  "recommendations": ["rec1", "rec2", "rec3", "rec4"]
}`;

    try {
      const response = await fetch(
        `https://api-inference.huggingface.co/models/${HF_MODEL}`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${HF_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            inputs: prompt,
            parameters: {
              max_new_tokens: 2000,
              temperature: 0.9,
              top_p: 0.95,
              top_k: 50,
              repetition_penalty: 1.2,
              return_full_text: false,
              do_sample: true
            }
          })
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error Response:', errorText);
        
        if (response.status === 401 || response.status === 403) {
          throw new Error('Invalid API key (401/403)');
        } else if (response.status === 429) {
          throw new Error('Rate limit exceeded (429)');
        } else if (response.status === 503) {
          throw new Error('Model is loading (503)');
        } else {
          throw new Error(`API Error: ${response.status}`);
        }
      }

      const apiResult = await response.json();
      console.log('Full API Response:', JSON.stringify(apiResult, null, 2));

      let generatedText = '';
      if (Array.isArray(apiResult) && apiResult[0]?.generated_text) {
        generatedText = apiResult[0].generated_text;
      } else if (apiResult.generated_text) {
        generatedText = apiResult.generated_text;
      } else if (apiResult[0]) {
        generatedText = JSON.stringify(apiResult[0]);
      } else {
        generatedText = JSON.stringify(apiResult);
      }

      console.log('Generated Text:', generatedText);

      let jsonMatch = generatedText.match(/\{[\s\S]*\}/);
      
      if (!jsonMatch) {
        console.warn('No JSON found in AI response, using fallback');
        throw new Error('AI did not return valid JSON format');
      }

      let parsed;
      try {
        parsed = JSON.parse(jsonMatch[0]);
      } catch (parseError) {
        console.error('JSON Parse Error:', parseError);
        throw new Error('Could not parse AI response');
      }

      if (!parsed.matching_skills || !parsed.strengths || !parsed.recommendations) {
        console.warn('Missing required fields in AI response');
        throw new Error('Incomplete AI response structure');
      }

      let strengths = Array.isArray(parsed.strengths) 
        ? parsed.strengths.filter(s => s && typeof s === 'string' && s.trim().length > 10)
        : [];
      
      let recommendations = Array.isArray(parsed.recommendations)
        ? parsed.recommendations.filter(s => s && typeof s === 'string' && s.trim().length > 10)
        : [];

      let skillsToDevelop = Array.isArray(parsed.skills_to_develop)
        ? parsed.skills_to_develop.filter(s => s && typeof s === 'string' && s.trim())
        : [];

      let matchingSkills = Array.isArray(parsed.matching_skills)
        ? parsed.matching_skills.filter(s => s && typeof s === 'string' && s.trim())
        : [];

      if (strengths.length < 3 || recommendations.length < 3 || skillsToDevelop.length < 3) {
        console.warn(`Insufficient AI content`);
        throw new Error('AI provided insufficient analysis');
      }

      strengths = strengths.slice(0, 4);
      recommendations = recommendations.slice(0, 4);
      skillsToDevelop = skillsToDevelop.slice(0, 4);

      while (strengths.length < 4) {
        strengths.push(`Professional experience in relevant domain`);
      }
      while (recommendations.length < 4) {
        recommendations.push(`Continue developing expertise`);
      }
      while (skillsToDevelop.length < 4) {
        skillsToDevelop.push(`Advanced techniques`);
      }

      // FIXED: Calculate percentage based on match ratio
      let matchPercentage = parseInt(parsed.match_percentage) || 0;
      const matchingSkillsCount = matchingSkills.length;

      const targetSkillsArray = skills 
        ? skills.split(/[,;\n]+/).map(s => s.trim()).filter(s => s.length > 0)
        : [];

      const totalTargetSkills = targetSkillsArray.length > 0 ? targetSkillsArray.length : 15;

      if (matchingSkillsCount > 0) {
        const matchRatio = matchingSkillsCount / totalTargetSkills;
        let calculatedPercentage = 0;
        
        if (matchRatio === 1.0) {
          calculatedPercentage = 95;
        } else if (matchRatio >= 0.9) {
          calculatedPercentage = 85 + (matchRatio - 0.9) * 100;
        } else if (matchRatio >= 0.7) {
          calculatedPercentage = 70 + (matchRatio - 0.7) * 75;
        } else if (matchRatio >= 0.5) {
          calculatedPercentage = 55 + (matchRatio - 0.5) * 75;
        } else if (matchRatio >= 0.3) {
          calculatedPercentage = 40 + (matchRatio - 0.3) * 75;
        } else if (matchRatio > 0) {
          calculatedPercentage = 25 + (matchRatio * 50);
        } else {
          calculatedPercentage = 10;
        }
        
        matchPercentage = Math.max(matchPercentage, Math.round(calculatedPercentage));
      }

      matchPercentage = Math.min(95, Math.max(15, matchPercentage));

      const result = {
        matchPercentage: matchPercentage,
        summary: parsed.summary || `Analysis complete`,
        matchingSkills: matchingSkills.slice(0, 15),
        skillsToDevelop: skillsToDevelop,
        strengths: strengths,
        recommendations: recommendations
      };

      if (result.matchingSkills.length === 0) {
        throw new Error('No skills extracted by AI');
      }

      console.log('✅ Successfully generated AI analysis:', result);
      return result;

    } catch (error) {
      console.error('AI Analysis failed:', error.message);
      throw error;
    }
  };

  // Local analysis fallback with FIXED percentage calculation
  const analyzeResumeLocally = (resume, role, skills) => {
    const resumeLower = resume.toLowerCase();

    let targetSkills = [];
    
    if (skills) {
      targetSkills = skills
        .split(/[,;\n]+/)
        .map(s => s.trim())
        .filter(s => s.length > 0);
    } else {
      const roleSkillsDatabase = {
        'software-engineer': ['Programming', 'JavaScript', 'Python', 'Java', 'C++', 'Git', 'Algorithms', 'Data Structures', 'OOP', 'Design Patterns', 'React', 'Node.js', 'SQL', 'API', 'Agile', 'Docker', 'Testing'],
        'frontend-developer': ['HTML', 'CSS', 'JavaScript', 'React', 'Vue', 'Angular', 'TypeScript', 'SASS', 'Redux', 'Webpack', 'Responsive Design', 'UI/UX', 'Bootstrap', 'Tailwind CSS'],
        'backend-developer': ['Python', 'Java', 'Node.js', 'Express', 'SQL', 'MongoDB', 'PostgreSQL', 'REST API', 'GraphQL', 'Microservices', 'Redis', 'Authentication'],
        'full-stack-developer': ['JavaScript', 'HTML', 'CSS', 'React', 'Node.js', 'SQL', 'MongoDB', 'REST API', 'Git', 'Docker', 'TypeScript', 'Express', 'Redux', 'Authentication', 'AWS', 'CI/CD', 'PostgreSQL'],
        'data-scientist': ['Python', 'R', 'SQL', 'Machine Learning', 'Statistics', 'Pandas', 'NumPy', 'TensorFlow', 'Scikit-learn', 'Data Visualization', 'Jupyter', 'Deep Learning', 'A/B Testing', 'Data Mining'],
        'data-analyst': ['SQL', 'Excel', 'Python', 'Tableau', 'Power BI', 'Data Visualization', 'Statistics', 'ETL', 'R', 'Google Analytics', 'Data Cleaning', 'Reporting'],
        'product-manager': ['Product Strategy', 'Roadmapping', 'Agile', 'Scrum', 'User Research', 'Data Analysis', 'JIRA', 'Stakeholder Management', 'A/B Testing', 'Market Research', 'Wireframing', 'Sprint Planning', 'KPIs'],
        'ui-ux-designer': ['Figma', 'Adobe XD', 'Sketch', 'Prototyping', 'User Research', 'Wireframing', 'UI Design', 'Usability Testing', 'Design Systems', 'User Journey', 'Personas', 'InVision', 'HTML/CSS'],
        'devops-engineer': ['Docker', 'Kubernetes', 'CI/CD', 'Jenkins', 'AWS', 'Linux', 'Terraform', 'Ansible', 'Git', 'Monitoring', 'Bash', 'Python', 'Infrastructure as Code', 'Azure', 'Cloud'],
        'cloud-architect': ['AWS', 'Azure', 'Cloud Architecture', 'Microservices', 'Docker', 'Kubernetes', 'Terraform', 'Security', 'Networking', 'Scalability', 'Cost Optimization', 'Infrastructure as Code'],
        'machine-learning-engineer': ['Python', 'TensorFlow', 'PyTorch', 'Machine Learning', 'Deep Learning', 'Neural Networks', 'NLP', 'Computer Vision', 'Scikit-learn', 'Keras', 'MLOps', 'Model Deployment', 'Data Processing'],
        'qa-engineer': ['Test Automation', 'Selenium', 'Cypress', 'Jest', 'API Testing', 'Manual Testing', 'Bug Tracking', 'JIRA', 'Performance Testing', 'Test Cases', 'Agile', 'CI/CD'],
        'project-manager': ['Project Management', 'Agile', 'Scrum', 'JIRA', 'Risk Management', 'Stakeholder Management', 'Budget Management', 'Communication', 'Team Leadership', 'Planning', 'Reporting'],
        'business-analyst': ['Requirements Analysis', 'Data Analysis', 'SQL', 'Business Process', 'Documentation', 'JIRA', 'Stakeholder Communication', 'Reporting', 'Excel', 'Process Improvement'],
        'marketing-manager': ['Digital Marketing', 'SEO', 'Content Strategy', 'Social Media', 'Analytics', 'Campaign Management', 'Brand Management', 'Email Marketing', 'Google Analytics', 'Marketing Automation'],
        'cybersecurity': ['Network Security', 'Penetration Testing', 'Security Auditing', 'Firewall', 'Encryption', 'Vulnerability Assessment', 'Linux', 'Security Protocols', 'Incident Response', 'Compliance'],
        'mobile-developer': ['React Native', 'Swift', 'Kotlin', 'Flutter', 'iOS', 'Android', 'Mobile UI', 'Firebase', 'REST API', 'Redux', 'App Store', 'Native Development', 'Xcode'],
        'game-developer': ['Unity', 'Unreal Engine', 'C#', 'C++', 'Game Design', '3D Modeling', 'Physics', 'Animation', 'Scripting', 'Game Mechanics', 'Graphics', 'Multiplayer', 'VR/AR']
      };

      const roleLower = role.toLowerCase().replace(/ /g, '-');
      targetSkills = roleSkillsDatabase[roleLower] || ['Communication', 'Problem Solving', 'Teamwork', 'Leadership'];
    }

    const matchingSkills = targetSkills.filter(skill => 
      resumeLower.includes(skill.toLowerCase())
    );

    const skillsToDevelop = targetSkills
      .filter(skill => !matchingSkills.includes(skill))
      .slice(0, 4);

    while (skillsToDevelop.length < 4) {
      skillsToDevelop.push('Industry best practices');
    }

    // FIXED: Calculate percentage based on match ratio
    let matchPercentage = 0;
    const totalSkills = targetSkills.length;
    const matchedCount = matchingSkills.length;

    if (totalSkills > 0) {
      const matchRatio = matchedCount / totalSkills;
      
      if (matchRatio === 1.0) {
        matchPercentage = 95;
      } else if (matchRatio >= 0.9) {
        matchPercentage = 85 + (matchRatio - 0.9) * 100;
      } else if (matchRatio >= 0.7) {
        matchPercentage = 70 + (matchRatio - 0.7) * 75;
      } else if (matchRatio >= 0.5) {
        matchPercentage = 55 + (matchRatio - 0.5) * 75;
      } else if (matchRatio >= 0.3) {
        matchPercentage = 40 + (matchRatio - 0.3) * 75;
      } else if (matchRatio > 0) {
        matchPercentage = 25 + (matchRatio * 50);
      } else {
        matchPercentage = 10;
      }
      
      matchPercentage = Math.round(matchPercentage);
    }

    matchPercentage = Math.min(95, Math.max(10, matchPercentage));

    const analysisTarget = skills ? 'specified skills' : role;
    const matchSummary = skills 
      ? `Found ${matchedCount} out of ${totalSkills} specified skills in your resume`
      : `Your resume shows ${matchedCount} matching skills for ${analysisTarget}`;

    return {
      matchPercentage,
      summary: `${matchSummary}. ${matchPercentage >= 60 ? 'Strong foundation!' : 'Consider developing more relevant skills.'}`,
      matchingSkills: matchingSkills.slice(0, 15),
      skillsToDevelop: skillsToDevelop,
      strengths: [
        `Demonstrates ${matchedCount} out of ${totalSkills} target skills`,
        matchedCount > 0 ? `Shows proficiency in ${matchingSkills.slice(0, 3).join(', ')}` : 'Professional resume presentation',
        'Clear presentation of professional experience',
        'Well-organized resume structure'
      ],
      recommendations: [
        skillsToDevelop.length > 0 && skillsToDevelop[0] !== 'Industry best practices'
          ? `Focus on developing ${skillsToDevelop.slice(0, 2).join(' and ')}`
          : `Continue expanding your expertise`,
        'Add quantifiable achievements with metrics',
        'Include links to projects demonstrating these skills',
        'Highlight specific outcomes and technologies used'
      ]
    };
  };

  const handleStartOver = () => {
    setJobRole('');
    setCustomRole('');
    setCustomSkills('');
    setResumeText('');
    setFileName('');
    setResult(null);
    setError('');
  };

  return (
    <div className="resume-analyzer-container">
      <div className="resume-analyzer-content">
        <Header />

        {!result ? (
          <>
            <div className="analyzer-section">
              <h3 className="section-title">💼 Select Your Target Role</h3>
              <JobRoleSelector 
                value={jobRole} 
                onChange={(roleId) => {
                  setJobRole(roleId);
                  setCustomRole('');
                  setCustomSkills('');
                }} 
              />
              
              <div className="custom-role-divider">
                <span>✏️ Or Enter a Custom Role</span>
              </div>
              
              <input
                type="text"
                className="custom-role-input"
                placeholder="e.g., Blockchain Developer, AI Research Scientist..."
                value={customRole}
                onChange={(e) => {
                  setCustomRole(e.target.value);
                  setJobRole('');
                  setCustomSkills('');
                }}
              />

              <div className="custom-role-divider">
                <span>🎯 Or Analyze by Specific Skills</span>
              </div>
              
              <textarea
                className="custom-skills-input"
                placeholder="Enter specific skills to analyze (comma-separated)&#10;Example: Python, Machine Learning, TensorFlow, Docker, AWS, React"
                value={customSkills}
                rows={3}
                onChange={(e) => {
                  setCustomSkills(e.target.value);
                  setJobRole('');
                  setCustomRole('');
                }}
              />
              <small className="helper-text">
                💡 Separate multiple skills with commas
              </small>
            </div>

            <div className="upload-section-grid">
              <div className="upload-card">
                <h3 className="section-title">📄 Upload Resume</h3>
                <ResumeUpload 
                  value={resumeText} 
                  onChange={(text) => {
                    setResumeText(text);
                    setResult(null);
                  }}
                />
              </div>

              <div className="paste-card">
                <h3 className="section-title">📋 Or Paste Your Resume</h3>
                <textarea
                  className="resume-paste-textarea"
                  placeholder="Paste your resume content here..."
                  value={resumeText}
                  onChange={(e) => {
                    setResumeText(e.target.value);
                    setResult(null);
                  }}
                  rows={12}
                />
                <small className="char-count">{resumeText.length} characters</small>
              </div>
            </div>

            {error && <div className="error-alert">{error}</div>}

            <button 
              className="analyze-button" 
              onClick={analyzeResume} 
              disabled={isAnalyzing}
            >
              {isAnalyzing ? '⏳ Analyzing Your Resume...' : '✨ Analyze My Resume'}
            </button>

            {isAnalyzing && <LoadingState />}

            <div className="tip-section">
              💡 Tip: You can analyze by job role OR specific skills you want to highlight
            </div>

            <footer className="analyzer-footer">
              🤗 Powered by Hugging Face AI • Intelligent Resume Analysis
            </footer>
          </>
        ) : (
          <>
            <AnalysisResult result={result} />
            
            <button className="start-over-button" onClick={handleStartOver}>
              🔄 Analyze Another Resume
            </button>

            <footer className="analyzer-footer">
              🤗 Powered by Hugging Face AI • Intelligent Resume Analysis
            </footer>
          </>
        )}
      </div>
    </div>
  );
};

export default ResumeAnalyzer;
