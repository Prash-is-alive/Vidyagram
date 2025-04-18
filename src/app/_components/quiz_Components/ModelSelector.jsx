// ModelSelector.jsx
import React from "react";

const ModelSelector = ({ selectedModel, setSelectedModel }) => {
  const models = [
    { id: "gemini-1.5-flash", name: "Gemini 1.5 Flash" },
    { id: "gemini-1.5-pro", name: "Gemini 1.5 Pro" },
    { id: "gemini-2.0-flash", name: "Gemini 2.0 Flash (Preview)" },
  ];

  return (
    <div className="form-group mb-3">
      <label htmlFor="model-selector" className="form-label">
        <strong>Select AI Model</strong>
      </label>
      <select
        id="model-selector"
        className="form-select"
        value={selectedModel}
        onChange={(e) => setSelectedModel(e.target.value)}
      >
        {models.map((model) => (
          <option key={model.id} value={model.id}>
            {model.name}
          </option>
        ))}
      </select>
      <small className="form-text text-muted">
        Choose the AI model to generate your quiz questions
      </small>
    </div>
  );
};

export default ModelSelector;