"use client";
import React, { useState, useMemo } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  ScatterChart, Scatter, ZAxis, Cell,
  LineChart, Line
} from 'recharts';

const QualityMetricsVisualizer = ({ questions }) => {
  const [selectedView, setSelectedView] = useState('overview');
  const [selectedMetric, setSelectedMetric] = useState('content_validity');

  // Initialize with empty arrays/objects to prevent conditionally calling hooks
  const hasData = questions && questions.length > 0;
  const hasMetrics = hasData && questions.some(q => q.quality_metrics);
  
  // Calculate averages for each metric
  const averageMetrics = useMemo(() => {
    if (!hasData || !hasMetrics) return {};
    
    const metrics = {};
    const metricKeys = Object.keys(questions[0].quality_metrics);
    
    metricKeys.forEach(key => {
      const sum = questions.reduce((acc, q) => acc + (q.quality_metrics[key] || 0), 0);
      metrics[key] = sum / questions.length;
    });
    
    return metrics;
  }, [questions, hasData, hasMetrics]);

  // Format data for radar chart (overview of all metrics)
  const radarData = useMemo(() => {
    if (!hasData || !hasMetrics) return [];
    
    return Object.entries(averageMetrics).map(([name, value]) => ({
      name: name.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' '),
      value: value
    }));
  }, [averageMetrics, hasData, hasMetrics]);

  // Format data for distribution chart
  const distributionData = useMemo(() => {
    if (!hasData || !hasMetrics) return [];
    
    return questions.map((q, index) => ({
      id: index + 1,
      ...q.quality_metrics,
      difficulty: q.difficulty,
      bloom: q.bloom_taxonomy,
      topic: q.topic
    }));
  }, [questions, hasData, hasMetrics]);

  // Format data for correlation scatter plot (difficulty vs. selected metric)
  const scatterData = useMemo(() => {
    if (!hasData || !hasMetrics) return [];
    
    // Convert difficulty strings to numeric values
    const difficultyMap = { 'Easy': 0.25, 'Medium': 0.5, 'Hard': 0.75 };
    
    return questions.map((q, index) => ({
      id: index,
      x: difficultyMap[q.difficulty] || 0.5,
      y: q.quality_metrics[selectedMetric] || 0,
      bloom: q.bloom_taxonomy,
      topic: q.topic.substring(0, 20) + (q.topic.length > 20 ? '...' : '')
    }));
  }, [questions, selectedMetric, hasData, hasMetrics]);

  // Format data for trends chart (metrics across questions in sequence)
  const trendData = useMemo(() => {
    if (!hasData || !hasMetrics) return [];
    
    return questions.map((q, index) => ({
      id: index + 1,
      ...q.quality_metrics
    }));
  }, [questions, hasData, hasMetrics]);

  // No questions to analyze
  if (!hasData) {
    return (
      <div className="alert alert-info">
        No question data available to analyze metrics.
      </div>
    );
  }
  
  // Check if questions have quality_metrics
  if (!hasMetrics) {
    return (
      <div className="alert alert-warning">
        Questions do not contain quality metrics data. Generate new questions to see metrics.
      </div>
    );
  }

  // Colors for different metrics
  const COLORS = {
    content_validity: '#8884d8',
    difficulty_index: '#82ca9d',
    discrimination_index: '#ffc658',
    distractor_quality: '#ff8042',
    cognitive_complexity: '#0088fe',
    taxonomy_alignment: '#00c49f',
    course_outcome_alignment: '#ffbb28',
    source_fidelity: '#ff8042',
    reliability_estimate: '#a4de6c',
    language_clarity: '#d0ed57'
  };

  // Names for metrics (formatted for display)
  const metricNames = {
    content_validity: 'Content Validity',
    difficulty_index: 'Difficulty Index',
    discrimination_index: 'Discrimination Index',
    distractor_quality: 'Distractor Quality',
    cognitive_complexity: 'Cognitive Complexity',
    taxonomy_alignment: 'Taxonomy Alignment',
    course_outcome_alignment: 'Course Outcome Alignment',
    source_fidelity: 'Source Fidelity',
    reliability_estimate: 'Reliability Estimate',
    language_clarity: 'Language Clarity'
  };

  // Generate a mapping of all available metrics for the dropdown
  const metricOptions = Object.keys(questions[0].quality_metrics || {}).map(key => ({
    value: key,
    label: metricNames[key] || key.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
  }));

  return (
    <div className="quality-metrics-container">
      <h4 className="mb-4">Question Quality Metrics Analysis</h4>
      
      <div className="d-flex justify-content-between mb-4">
        <div className="btn-group" role="group">
          <button 
            className={`btn ${selectedView === 'overview' ? 'btn-dark' : 'btn-outline-dark'}`}
            onClick={() => setSelectedView('overview')}
          >
            Overview
          </button>
          <button 
            className={`btn ${selectedView === 'distribution' ? 'btn-dark' : 'btn-outline-dark'}`}
            onClick={() => setSelectedView('distribution')}
          >
            Distribution
          </button>
          <button 
            className={`btn ${selectedView === 'correlation' ? 'btn-dark' : 'btn-outline-dark'}`}
            onClick={() => setSelectedView('correlation')}
          >
            Correlation
          </button>
          <button 
            className={`btn ${selectedView === 'trends' ? 'btn-dark' : 'btn-outline-dark'}`}
            onClick={() => setSelectedView('trends')}
          >
            Trends
          </button>
        </div>
        
        {selectedView !== 'overview' && (
          <div className="form-group d-flex align-items-center">
            <label className="me-2 mb-0">Metric:</label>
            <select 
              className="form-select form-select-sm" 
              value={selectedMetric}
              onChange={(e) => setSelectedMetric(e.target.value)}
            >
              {metricOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      <div className="row">
        <div className="col-md-12">
          <div className="card">
            <div className="card-body">
              <div style={{ width: '100%', height: 400 }}>
                {selectedView === 'overview' && (
                  <ResponsiveContainer>
                    <RadarChart outerRadius={150} data={radarData}>
                      <PolarGrid />
                      <PolarAngleAxis dataKey="name" />
                      <PolarRadiusAxis domain={[0, 1]} />
                      <Radar
                        name="Average Metrics"
                        dataKey="value"
                        stroke="#8884d8"
                        fill="#8884d8"
                        fillOpacity={0.6}
                      />
                      <Tooltip formatter={(value) => [value?.toFixed(2), "Score"]} />
                    </RadarChart>
                  </ResponsiveContainer>
                )}

                {selectedView === 'distribution' && (
                  <ResponsiveContainer>
                    <BarChart data={distributionData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="id" label={{ value: 'Question Number', position: 'insideBottom', offset: -5 }} />
                      <YAxis domain={[0, 1]} label={{ value: metricNames[selectedMetric], angle: -90, position: 'insideLeft' }} />
                      <Tooltip 
                        formatter={(value, name, props) => [value?.toFixed(2), metricNames[name] || name]}
                        labelFormatter={(value) => `Question ${value}`}
                      />
                      <Legend />
                      <Bar 
                        dataKey={selectedMetric} 
                        fill={COLORS[selectedMetric] || "#8884d8"} 
                        name={metricNames[selectedMetric]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                )}

                {selectedView === 'correlation' && (
                  <ResponsiveContainer>
                    <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                      <CartesianGrid />
                      <XAxis 
                        type="number" 
                        dataKey="x" 
                        name="Difficulty" 
                        domain={[0, 1]}
                        tickFormatter={(value) => value <= 0.33 ? 'Easy' : value <= 0.66 ? 'Medium' : 'Hard'} 
                        label={{ value: 'Difficulty', position: 'insideBottom', offset: -5 }}
                      />
                      <YAxis 
                        type="number" 
                        dataKey="y" 
                        name={metricNames[selectedMetric]} 
                        domain={[0, 1]} 
                        label={{ value: metricNames[selectedMetric], angle: -90, position: 'insideLeft' }}
                      />
                      <ZAxis type="category" dataKey="bloom" range={[100, 100]} />
                      <Tooltip 
                        cursor={{ strokeDasharray: '3 3' }}
                        formatter={(value, name, props) => {
                          if (name === 'x') return [props.payload.x <= 0.33 ? 'Easy' : props.payload.x <= 0.66 ? 'Medium' : 'Hard', 'Difficulty'];
                          return [value?.toFixed(2), metricNames[selectedMetric]];
                        }}
                        labelFormatter={(value, payload) => `Q${payload[0].payload.id+1}: ${payload[0].payload.topic}`}
                      />
                      <Legend />
                      <Scatter 
                        name={`${metricNames[selectedMetric]} vs Difficulty`} 
                        data={scatterData} 
                        fill={COLORS[selectedMetric] || "#8884d8"}
                      >
                        {scatterData.map((entry, index) => (
                          <Cell 
                            key={`cell-${index}`} 
                            fill={entry.bloom === 'Remember' ? '#8884d8' : 
                                 entry.bloom === 'Understand' ? '#82ca9d' : 
                                 entry.bloom === 'Apply' ? '#ffc658' :
                                 entry.bloom === 'Analyze' ? '#ff8042' :
                                 entry.bloom === 'Evaluate' ? '#0088fe' : '#00c49f'} 
                          />
                        ))}
                      </Scatter>
                    </ScatterChart>
                  </ResponsiveContainer>
                )}

                {selectedView === 'trends' && (
                  <ResponsiveContainer>
                    <LineChart data={trendData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="id" label={{ value: 'Question Sequence', position: 'insideBottom', offset: -5 }} />
                      <YAxis domain={[0, 1]} label={{ value: 'Score', angle: -90, position: 'insideLeft' }} />
                      <Tooltip 
                        formatter={(value, name, props) => [value?.toFixed(2), metricNames[name] || name]}
                        labelFormatter={(value) => `Question ${value}`}
                      />
                      <Legend />
                      <Line 
                        type="monotone" 
                        dataKey={selectedMetric} 
                        stroke={COLORS[selectedMetric] || "#8884d8"} 
                        name={metricNames[selectedMetric]}
                        activeDot={{ r: 8 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Summary card with metrics averages */}
      <div className="row mt-4">
        <div className="col-md-12">
          <div className="card">
            <div className="card-header bg-light">
              <h5 className="card-title mb-0">Quality Metrics Summary</h5>
            </div>
            <div className="card-body">
              <div className="row">
                {Object.entries(averageMetrics).map(([key, value]) => (
                  <div key={key} className="col-md-3 mb-3">
                    <div className="d-flex align-items-center">
                      <div 
                        style={{ 
                          width: 16, 
                          height: 16, 
                          backgroundColor: COLORS[key] || '#8884d8', 
                          marginRight: 8,
                          borderRadius: '50%'
                        }} 
                      />
                      <div>
                        <div className="small text-muted">{metricNames[key] || key}</div>
                        <div className="fw-bold">{value?.toFixed(2)}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QualityMetricsVisualizer;