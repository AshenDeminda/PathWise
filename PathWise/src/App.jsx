import { useState, useEffect } from "react";
import { getLearningPath } from "./api/geminiapi"; // Updated import
import "./App.css";

function App() {
  const [form, setForm] = useState({ skills: "", goals: "", interests: "" });
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [apiKeyValid, setApiKeyValid] = useState(true);

  // Check if API key exists on component mount
  useEffect(() => {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (!apiKey || apiKey.trim() === "") {
      setApiKeyValid(false);
      setError("Gemini API key is missing or invalid. Please add a valid key to your .env file.");
    } else {
      setApiKeyValid(true);
    }
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    // Reset states
    setLoading(true);
    setError("");
    
    // Validate inputs
    if (!form.skills.trim() || !form.goals.trim() || !form.interests.trim()) {
      setError("Please fill in all fields before generating your roadmap.");
      setLoading(false);
      return;
    }

    // Check if API key is valid
    if (!apiKeyValid) {
      setError("Gemini API key is missing or invalid. Please add a valid key to your .env file.");
      setLoading(false);
      return;
    }
    
    const prompt = `
I'm a learner with these skills: ${form.skills}.
My goals: ${form.goals}.
I'm interested in: ${form.interests}.

Please create a detailed 8-week personalized learning roadmap with topics and resources.
`;
    try {
      const result = await getLearningPath(prompt);
      setOutput(result);
    } catch (err) {
      console.error("Error generating roadmap:", err);
      // Display the specific error message from the API
      setError(err.message || "Failed to generate your roadmap. Please try again later.");
      setOutput("");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-container">
      <div className="backdrop"></div>
      
      <header>
        <div className="logo">
          <div className="logo-icon">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2L4 6V18L12 22L20 18V6L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M12 22V12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M12 12L20 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M12 12L4 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <h1>PathWise</h1>
        </div>
        <p>Your Personalized AI Learning Roadmap</p>
      </header>

      <div className="main-content">
        <div className="left-panel">
          <h2>Create Your Learning Roadmap</h2>
          
          {error && <div className="error-message">{error}</div>}
          
          <div className="input-group">
            <label htmlFor="skills">Current Skills</label>
            <textarea
              id="skills"
              name="skills"
              placeholder="List your current skills and expertise..."
              onChange={handleChange}
              value={form.skills}
            />
          </div>
          
          <div className="input-group">
            <label htmlFor="goals">Learning Goals</label>
            <textarea
              id="goals"
              name="goals"
              placeholder="What do you want to achieve with this learning plan?"
              onChange={handleChange}
              value={form.goals}
            />
          </div>
          
          <div className="input-group">
            <label htmlFor="interests">Interests & Domain</label>
            <textarea
              id="interests"
              name="interests"
              placeholder="What fields, topics or domains are you interested in?"
              onChange={handleChange}
              value={form.interests}
            />
          </div>
          
          <button 
            className={`generate-btn ${loading ? 'loading' : ''}`}
            onClick={handleSubmit} 
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="loader"></span>
                <span>Generating...</span>
              </>
            ) : (
              "Generate My Roadmap"
            )}
          </button>
        </div>

        <div className="right-panel">
          <div className="output-container">
            <h2>Your 8-Week Learning Plan</h2>
            
            {output ? (
              <div className="output-content">
                {output}
              </div>
            ) : (
              <div className="placeholder-content">
                {loading ? (
                  <div className="loading-state">
                    <div className="loading-animation">
                      <div className="pulse"></div>
                    </div>
                    <p>Crafting your personalized learning roadmap...</p>
                  </div>
                ) : (
                    <div className="empty-state">
                      <div className="empty-icon">
                        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M12 8V12L15 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </div>
                      <h3>Ready when you are</h3>
                      <p className="desktop-instructions">Complete the form on the left and click "Generate My Roadmap" to create your personalized learning plan.</p>
                      <p className="mobile-instructions">Complete the form above and click "Generate My Roadmap" to create your personalized learning plan.</p>
                    </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
      
      <footer>
        <p>© {new Date().getFullYear()} PathWise • AI-Powered Learning Paths</p>
      </footer>
    </div>
  );
}

export default App;