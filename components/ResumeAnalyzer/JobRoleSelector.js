// src/components/ResumeAnalyzer/JobRoleSelector.js
import React from 'react';
import './JobRoleSelector.css';

const JobRoleSelector = ({ value, onChange }) => {
  const roles = [
    { id: 'software-engineer', label: 'Software Engineer', emoji: '💻' },
    { id: 'frontend-developer', label: 'Frontend Developer', emoji: '🎨' },
    { id: 'backend-developer', label: 'Backend Developer', emoji: '📦' },
    { id: 'full-stack-developer', label: 'Full Stack Developer', emoji: '🔧' },
    { id: 'data-scientist', label: 'Data Scientist', emoji: '🧠' },
    { id: 'data-analyst', label: 'Data Analyst', emoji: '📊' },
    { id: 'product-manager', label: 'Product Manager', emoji: '📋' },
    { id: 'ui-ux-designer', label: 'UI/UX Designer', emoji: '✨' },
    { id: 'devops-engineer', label: 'DevOps Engineer', emoji: '☁️' },
    { id: 'cloud-architect', label: 'Cloud Architect', emoji: '🏗️' },
    { id: 'machine-learning-engineer', label: 'ML Engineer', emoji: '🤖' },
    { id: 'qa-engineer', label: 'QA Engineer', emoji: '🧪' },
    { id: 'project-manager', label: 'Project Manager', emoji: '👥' },
    { id: 'business-analyst', label: 'Business Analyst', emoji: '📈' },
    { id: 'marketing-manager', label: 'Marketing Manager', emoji: '📣' },
    { id: 'cybersecurity', label: 'Cybersecurity', emoji: '🛡️' },
    { id: 'mobile-developer', label: 'Mobile Developer', emoji: '📱' },
    { id: 'game-developer', label: 'Game Developer', emoji: '🎮' },
  ];

  return (
    <div className="role-selector-grid">
      {roles.map((role) => (
        <div
          key={role.id}
          className={`role-card ${value === role.id ? 'role-card-selected' : ''}`}
          onClick={() => onChange(role.id)}
        >
          <div className="role-emoji">{role.emoji}</div>
          <div className="role-label">{role.label}</div>
        </div>
      ))}
    </div>
  );
};

export default JobRoleSelector;
