import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

function PredictionForm() {
  const [file, setFile] = useState(null);
  const fileInputRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [analysisLoading, setAnalysisLoading] = useState(false);
  const [result, setResult] = useState(null);
  const navigate = useNavigate();

  const [patientData, setPatientData] = useState({
    patientName: '',
    patientAge: '',
    patientId: '',
    patientGender: '',
  });

  const handleFileChange = (e) => {
    const f = e.target.files?.[0] ?? null;
    setFile(f);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setPatientData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return;

    setLoading(true);
    // disable file input while uploading for safety
    if (fileInputRef.current) fileInputRef.current.disabled = true;

    try {
      // create a stable copy of the file
      const stableFile = new File([file], file.name, { type: file.type });

      const formData = new FormData();
      formData.append('file', stableFile);
      formData.append('patientName', patientData.patientName);
      formData.append('patientAge', patientData.patientAge);
      formData.append('patientId', patientData.patientId);
      formData.append('patientGender', patientData.patientGender);

      const res = await fetch('http://localhost:5000/predict', {
        method: 'POST',
        body: formData
      });

      if (!res.ok) {
        const text = await res.text().catch(() => '');
        throw new Error(`Server returned ${res.status} ${res.statusText} - ${text}`);
      }

      const data = await res.json();
      setResult(data);
    } catch (err) {
      console.error('Prediction failed', err);
      alert('Prediction failed: ' + (err.message || err));
    } finally {
      setLoading(false);
      if (fileInputRef.current) fileInputRef.current.disabled = false;
    }
  };

  const handleAnalysisClick = async () => {
    // read file directly from the input when starting the upload,
    // this reduces chances of a changed/stale reference
    const liveFile = fileInputRef.current?.files?.[0] ?? file;
    if (!liveFile || !patientData.patientId) {
      alert("Missing image or patient ID");
      return;
    }

    setAnalysisLoading(true);
    if (fileInputRef.current) fileInputRef.current.disabled = true;

    try {
      // create stable copy
      const stableFile = new File([liveFile], liveFile.name, { type: liveFile.type });

      const formData = new FormData();
      formData.append('file', stableFile);
      formData.append('patientId', patientData.patientId);

      const res = await fetch('http://localhost:5000/explain', {
        method: 'POST',
        body: formData
      });

      if (!res.ok) {
        const text = await res.text().catch(() => '');
        throw new Error(`Server ${res.status} ${res.statusText} - ${text}`);
      }

      const xaiData = await res.json();

      navigate('/analysis', {
        state: {
          imageFilename: stableFile.name,
          label: xaiData.label,
          confidence: xaiData.confidence,
          gradcam: xaiData.gradcam,
          lime: xaiData.lime,
          occlusion: xaiData.occlusion
        }
      });
    } catch (err) {
      console.error('Explanation failed', err);
      // show a friendlier message but include some diagnostic info
      alert('Failed to fetch analysis: ' + (err.message || err));
    } finally {
      setAnalysisLoading(false);
      if (fileInputRef.current) fileInputRef.current.disabled = false;
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center py-12 px-4">
      {/* Modern Header with Medical Theme */}
      <div className="w-full max-w-4xl mb-8 text-center animate-fade-in">
        <div className="inline-flex items-center justify-center w-20 h-20 mb-6 rounded-2xl bg-gradient-to-br from-cyan-500 via-teal-500 to-emerald-500 shadow-lg shadow-cyan-500/30 transform hover:scale-105 transition-transform duration-300">
          <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <h1 className="text-4xl md:text-5xl font-bold text-slate-800 mb-3 tracking-tight">
          Pneumonia <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-600 to-teal-600">Detection AI</span>
        </h1>
        <p className="text-slate-500 text-lg font-medium max-w-2xl mx-auto">
          Advanced chest X-ray analysis powered by explainable artificial intelligence
        </p>
      </div>

      {/* Main Form Card with Enhanced Design */}
      <div className="w-full max-w-3xl animate-slide-up delay-100">
        <div className="medical-card p-8 md:p-12 shadow-xl border border-slate-100 bg-white/80 backdrop-blur-xl">
          <div className="mb-8 pb-6 border-b border-slate-100">
            <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-3">
              <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-cyan-100 text-cyan-600 text-lg">👤</span>
              Patient Information
            </h2>
            <p className="text-slate-500 text-sm mt-2 ml-11">Please enter the patient's details and upload their X-ray scan.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Patient Name & ID Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="group">
                <label className="block text-sm font-semibold text-slate-700 mb-2 ml-1">
                  Patient Name
                </label>
                <div className="relative">
                  <input
                    type="text"
                    name="patientName"
                    value={patientData.patientName}
                    onChange={handleInputChange}
                    placeholder="John Doe"
                    className="w-full pl-4 pr-4 py-3.5 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/10 transition-all duration-200 outline-none text-slate-800 placeholder:text-slate-400"
                    required
                  />
                </div>
              </div>

              <div className="group">
                <label className="block text-sm font-semibold text-slate-700 mb-2 ml-1">
                  Patient ID
                </label>
                <div className="relative">
                  <input
                    type="text"
                    name="patientId"
                    value={patientData.patientId}
                    onChange={handleInputChange}
                    placeholder="ID-12345"
                    className="w-full pl-4 pr-4 py-3.5 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/10 transition-all duration-200 outline-none text-slate-800 placeholder:text-slate-400"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Age and Gender Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="group">
                <label className="block text-sm font-semibold text-slate-700 mb-2 ml-1">
                  Age
                </label>
                <input
                  type="number"
                  name="patientAge"
                  value={patientData.patientAge}
                  onChange={handleInputChange}
                  placeholder="Years"
                  className="w-full pl-4 pr-4 py-3.5 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/10 transition-all duration-200 outline-none text-slate-800 placeholder:text-slate-400"
                  required
                />
              </div>

              <div className="group">
                <label className="block text-sm font-semibold text-slate-700 mb-2 ml-1">
                  Gender
                </label>
                <div className="relative">
                  <select
                    name="patientGender"
                    value={patientData.patientGender}
                    onChange={handleInputChange}
                    className="w-full pl-4 pr-10 py-3.5 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/10 transition-all duration-200 outline-none text-slate-800 appearance-none cursor-pointer"
                    required
                  >
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none text-slate-500">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* File Upload - Enhanced */}
            <div className="group pt-2">
              <label className="block text-sm font-semibold text-slate-700 mb-3 ml-1">
                Chest X-Ray Scan
              </label>
              <div
                className={`relative border-2 border-dashed rounded-2xl p-8 transition-all duration-300 ease-in-out group-hover:border-cyan-400 ${file ? 'border-emerald-400 bg-emerald-50/30' : 'border-slate-300 hover:bg-slate-50/50'
                  }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  required
                  disabled={loading || analysisLoading}
                />
                <div className="text-center pointer-events-none">
                  {!file ? (
                    <div className="flex flex-col items-center">
                      <div className="w-16 h-16 mb-4 rounded-full bg-cyan-50 text-cyan-600 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                      </div>
                      <p className="text-base font-semibold text-slate-700">Click to upload or drag and drop</p>
                      <p className="text-sm text-slate-400 mt-1">SVG, PNG, JPG or GIF (max. 10MB)</p>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <div className="text-left">
                        <p className="font-semibold text-slate-800">{file.name}</p>
                        <p className="text-sm text-emerald-600 font-medium">Ready for analysis</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Submit Button - Enhanced */}
            <button
              type="submit"
              disabled={!file || loading || analysisLoading}
              className={`w-full py-5 px-8 rounded-xl font-bold text-white text-xl shadow-2xl transition-all duration-300 btn-medical relative overflow-hidden ${loading || !file
                  ? 'bg-slate-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-cyan-600 via-teal-600 to-emerald-600 hover:shadow-cyan-500/50 hover:scale-[1.02] active:scale-[0.98] hover:-translate-y-1'
                }`}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-3">
                  <svg className="animate-spin h-6 w-6" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Analyzing X-Ray...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-3">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                  </svg>
                  Run AI Diagnosis
                </span>
              )}
            </button>
          </form>

          {/* Results Display - Enhanced */}
          {result && (
            <div className="mt-8 pt-8 border-t border-slate-100 animate-fade-in">
              <div className="rounded-2xl bg-slate-50 p-6 border border-slate-200">
                <h3 className="text-lg font-semibold text-slate-700 mb-4 text-center">Analysis Result</h3>

                <div className="flex justify-center mb-6">
                  <div className={`inline-flex items-center gap-3 px-6 py-3 rounded-xl shadow-sm border ${result.label === 'NORMAL'
                      ? 'bg-emerald-50 border-emerald-100 text-emerald-700'
                      : 'bg-rose-50 border-rose-100 text-rose-700'
                    }`}>
                    <span className="text-2xl">{result.label === 'NORMAL' ? '✅' : '⚠️'}</span>
                    <div className="text-left">
                      <div className="font-bold text-lg leading-tight">{result.label}</div>
                      <div className="text-xs opacity-80 font-medium">
                        {result.confidence}% Confidence
                      </div>
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleAnalysisClick}
                  disabled={analysisLoading || loading}
                  className="w-full py-3.5 px-6 rounded-xl font-semibold text-white bg-slate-800 hover:bg-slate-900 transition-colors flex items-center justify-center gap-2 shadow-lg shadow-slate-800/20"
                >
                  {analysisLoading ? (
                    <>
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      <span>Analyzing...</span>
                    </>
                  ) : (
                    <>
                      <span>View Detailed Analysis</span>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="w-full max-w-3xl mt-8 text-center animate-fade-in delay-200">
        <p className="text-slate-400 text-sm font-medium flex items-center justify-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
          Secure Medical Analysis Environment
        </p>
      </div>
    </div>
  );
}

export default PredictionForm;
