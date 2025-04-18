const generatePrompt = (props) => {
  const {
    customTopics,
    selectedModules,
    selectedTopics,
    professorNotes,
    selectedSubject,
    pdfSummary,
    NumberOfQuestions,
  } = props;
  let prompt = null;
  if (customTopics) {
    prompt = `
     Generate multiple-choice questions (MCQs) based on the following topics. Each question should include one correct answer and three incorrect answers. The output should be formatted as JSON, containing the following fields:
    [
      {
        "difficulty": "Easy" | "Medium" | "Hard", 
        "question": "{the question text}",
        "correct_answer": "{the correct answer}",
        "incorrect_answers": ["{incorrect answer 1}", "{incorrect answer 2}", "{incorrect answer 3}"],
        "explanation": "{a brief explanation about the correct answer}",
        "topic": "{a short topic description}",
        "bloom_taxonomy": Generate a Bloom's Taxonomy level-based categorization choices:( Remember, Understand, Apply, Analyze, Evaluate, Create ) also consider the difficulty of the problem according to the bloom's taxonomy ("create" being the hardest and "remember" is the lowest ),
        "quality_metrics": {
          "content_validity": 0.0-1.0, // Measures how well the question aligns with the specified topic (higher is better)
          "difficulty_index": 0.0-1.0, // Predicted difficulty based on question complexity (lower means harder)
          "discrimination_index": 0.0-1.0, // How well the question might differentiate between high and low performers
          "distractor_quality": 0.0-1.0, // Quality of incorrect options (higher means more plausible distractors)
          "cognitive_complexity": 0.0-1.0, // Level of cognitive processing required (higher means more complex)
          "taxonomy_alignment": 0.0-1.0, // How well the question aligns with stated Bloom's taxonomy level
          "language_clarity": 0.0-1.0, // Clarity and precision of language used
          "reliability_estimate": 0.0-1.0 // Estimated reliability of the question
        }
      }
    ]
    Topics: ${customTopics}
    Number of questions required: ${NumberOfQuestions}

    For quality_metrics please ensure:
    1. All metrics are between 0.0 and 1.0, where higher values generally indicate better quality (except for difficulty_index)
    2. Metrics are assigned based on objective assessment of each question's characteristics
    3. Content validity reflects how well the question tests knowledge of the stated topic
    4. Difficulty index represents the estimated proportion of students who would answer correctly
    5. Discrimination index estimates how well the question distinguishes between knowledgeable and less knowledgeable students
    6. Distractor quality evaluates how plausible and effective the incorrect options are
    7. Taxonomy alignment measures congruence between the stated taxonomy level and actual cognitive demands
    `;
  } else {
    prompt = `
    Generate multiple-choice questions (MCQs) in JSON format based on the provided modules, notes, topics, and course outcomes. Each question should include one correct answer and three incorrect answers, structured as follows:
    [
      {
        "difficulty": "Easy" | "Medium" | "Hard",
        "category": "{subject name}",
        "question": "{question text}",
        "correct_answer": "{correct answer}",
        "incorrect_answers": ["{incorrect answer 1}", "{incorrect answer 2}", "{incorrect answer 3}"],
        "explanation": "{brief explanation of the correct answer}",
        "topic": "{related topic}",
        "fromNotes": true | false,
        "fromPDF": true | false,
        "bloom_taxonomy": "Remember" | "Understand" | "Apply" | "Analyze" | "Evaluate" | "Create", // Select based on question difficulty and taxonomy level (Create is hardest, Remember is easiest)
        "course_outcomes": "{matching course outcome, or null if none provided}",
        "CO": "CO1" | "CO2" | "CO3" | "CO4" | "CO5" | "CO6", // Select the relevant course outcome number
        "quality_metrics": {
          "content_validity": 0.0-1.0, // Measures how well the question aligns with the module content
          "difficulty_index": 0.0-1.0, // Predicted difficulty based on question complexity (lower means harder)
          "discrimination_index": 0.0-1.0, // How well the question might differentiate between high and low performers
          "distractor_quality": 0.0-1.0, // Quality of incorrect options (higher means more plausible distractors)
          "cognitive_complexity": 0.0-1.0, // Level of cognitive processing required (higher means more complex)
          "taxonomy_alignment": 0.0-1.0, // How well the question aligns with stated Bloom's taxonomy level
          "course_outcome_alignment": 0.0-1.0, // How well the question aligns with the specified course outcome
          "source_fidelity": 0.0-1.0, // How accurately the question reflects source material (notes/PDF)
          "reliability_estimate": 0.0-1.0 // Estimated reliability of the question
        }
      }
    ]
      Make sure that there is atleast one question from every CO.
    Modules to base questions on: ${selectedModules
      .map((mod) => mod.module_name)
      .join(", ")}
    Topics to consider: ${selectedTopics}
    Notes provided by the professor: ${
      professorNotes ? professorNotes : "No notes provided"
    }
    Course outcomes available: ${
      selectedSubject?.course_outcomes?.map((co) => co).join(", ") ||
      "No course outcomes provided"
    }
    PDF content summary: ${pdfSummary}
    Number of questions to generate: ${NumberOfQuestions}
    
    For quality_metrics please ensure:
    1. All metrics are between 0.0 and 1.0, where higher values generally indicate better quality (except for difficulty_index)
    2. Metrics are assigned based on objective assessment of each question's characteristics
    3. Content validity reflects how well the question tests knowledge from the provided modules
    4. Difficulty index represents the estimated proportion of students who would answer correctly
    5. Discrimination index estimates how well the question distinguishes between knowledgeable and less knowledgeable students
    6. Distractor quality evaluates how plausible and effective the incorrect options are
    7. Taxonomy alignment measures congruence between the stated taxonomy level and actual cognitive demands
    8. Course outcome alignment evaluates how well the question addresses the specified course outcome
    9. Source fidelity indicates how closely the question content matches the provided notes or PDF
    
    Please provide the output strictly in JSON format without any markdown, text, or extra characters. Do not include code blocks or escape characters.
  `;
  }
  return prompt;
};

export default generatePrompt;