import React from 'react';
import './AnalysisResult.css';

function AnalysisResult({ result }) {
  const getScoreClass = (score) => {
    if (score >= 80) return 'score-excellent';
    if (score >= 60) return 'score-good';
    if (score >= 40) return 'score-fair';
    return 'score-poor';
  };

  // ✅ FIX: Add safety checks for all arrays
  if (!result) {
    return <div>No results available</div>;
  }

  return (
    <div className="analysis-result">
      {/* Score Circle */}
      <div className="score-container">
        <div className={`score-circle ${getScoreClass(result.matchPercentage || 0)}`}>
          <div className="score-value">{result.matchPercentage || 0}%</div>
          <div className="score-label">Match Score</div>
        </div>
      </div>

      {/* Summary */}
      <div className="summary-card">
        <h3>📊 Analysis Summary</h3>
        <p>{result.summary || 'No summary available'}</p>
      </div>

      {/* Matching Skills */}
      <div className="skills-section">
        <h3>✅ Matching Skills</h3>
        <div className="skills-grid">
          {result.matchingSkills && result.matchingSkills.length > 0 ? (
            result.matchingSkills.map((skill, index) => (
              <div key={index} className="skill-tag skill-match">
                {skill}
              </div>
            ))
          ) : (
            <p className="no-data">No matching skills found</p>
          )}
        </div>
      </div>

      {/* Skills to Develop */}
      <div className="skills-section">
        <h3>📚 Skills to Develop</h3>
        <div className="skills-grid">
          {result.skillsToDevelop && result.skillsToDevelop.length > 0 ? (
            result.skillsToDevelop.map((skill, index) => (
              <div key={index} className="skill-tag skill-develop">
                {skill}
              </div>
            ))
          ) : (
            <p className="no-data">No additional skills needed</p>
          )}
        </div>
      </div>

      {/* Strengths */}
      <div className="feedback-section">
        <h3>💪 Your Strengths</h3>
        <ul className="feedback-list">
          {result.strengths && result.strengths.length > 0 ? (
            result.strengths.map((strength, index) => (
              <li key={index}>{strength}</li>
            ))
          ) : (
            <li>Continue building your professional experience</li>
          )}
        </ul>
      </div>

      {/* Recommendations */}
      <div className="feedback-section">
        <h3>💡 Recommendations</h3>
        <ul className="feedback-list">
          {result.recommendations && result.recommendations.length > 0 ? (
            result.recommendations.map((rec, index) => (
              <li key={index}>{rec}</li>
            ))
          ) : (
            <li>Keep your resume updated with latest achievements</li>
          )}
        </ul>
      </div>
    </div>
  );
}

export default AnalysisResult;
