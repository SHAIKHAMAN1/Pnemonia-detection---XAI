import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Upload, FileCheck2, Activity, Loader2, ChevronRight, ShieldCheck, Stethoscope, BrainCircuit } from 'lucide-react';

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
    if (fileInputRef.current) fileInputRef.current.disabled = true;

    try {
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
    const liveFile = fileInputRef.current?.files?.[0] ?? file;
    if (!liveFile || !patientData.patientId) {
      alert("Missing image or patient ID");
      return;
    }

    setAnalysisLoading(true);
    if (fileInputRef.current) fileInputRef.current.disabled = true;

    try {
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
      alert('Failed to fetch analysis: ' + (err.message || err));
    } finally {
      setAnalysisLoading(false);
      if (fileInputRef.current) fileInputRef.current.disabled = false;
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row bg-white">
      {/* Left Panel - Branding & Visuals */}
      <div className="w-full lg:w-[45%] bg-slate-900 relative overflow-hidden flex flex-col justify-between p-8 lg:p-16 text-white">
        {/* Abstract Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <path d="M0 0 L100 0 L100 100 L0 100 Z" fill="url(#grad1)" />
            <defs>
              <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style={{ stopColor: '#0891B2', stopOpacity: 1 }} />
                <stop offset="100%" style={{ stopColor: '#0F172A', stopOpacity: 1 }} />
              </linearGradient>
            </defs>
          </svg>
        </div>

        {/* Content */}
        <div className="relative z-10">
          <div className="inline-flex items-center gap-3 mb-8">
            <div className="p-2.5 bg-cyan-500/10 rounded-lg border border-cyan-500/20 backdrop-blur-sm">
              <Activity className="w-6 h-6 text-cyan-400" />
            </div>
            <span className="text-lg font-semibold tracking-wide text-cyan-100/90">MED-AI DIAGNOSTICS</span>
          </div>

          <h1 className="text-4xl lg:text-6xl font-bold leading-tight mb-6">
            Advanced <span className="text-cyan-400">Pneumonia</span> Detection
          </h1>

          <p className="text-lg text-slate-300 leading-relaxed max-w-md">
            Powered by state-of-the-art explainable AI to provide accurate, transparent, and rapid chest X-ray analysis for medical professionals.
          </p>
        </div>

        {/* Trust Indicators */}
        <div className="relative z-10 mt-12 space-y-6">
          <div className="flex items-center gap-4 text-slate-300">
            <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center border border-slate-700">
              <BrainCircuit className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <p className="font-medium text-white">XAI Powered Analysis</p>
              <p className="text-sm opacity-70">GradCAM, LIME & Occlusion maps</p>
            </div>
          </div>

          <div className="flex items-center gap-4 text-slate-300">
            <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center border border-slate-700">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <p className="font-medium text-white">Secure Environment</p>
              <p className="text-sm opacity-70">HIPAA compliant data processing</p>
            </div>
          </div>

          <div className="flex items-center gap-4 text-slate-300">
            <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center border border-slate-700">
              <Stethoscope className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <p className="font-medium text-white">Clinical Grade</p>
              <p className="text-sm opacity-70">Optimized for medical workflows</p>
            </div>
          </div>
        </div>

        <div className="relative z-10 mt-12 pt-8 border-t border-slate-800">
          <p className="text-xs text-slate-500">© 2025 MedAI Systems Inc. All rights reserved.</p>
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="w-full lg:w-[55%] h-full min-h-screen overflow-y-auto bg-slate-50 flex flex-col items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-xl !p-8">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-slate-900">Patient Diagnosis</h2>
            <p className="text-slate-500 mt-1">Enter patient details and upload scan to begin analysis</p>
          </div>

          <Card className="shadow-none border-0 bg-transparent sm:bg-white sm:shadow-sm sm:border !p-4 sm:border-slate-200">
            <CardContent className="p-10 sm:p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Patient Name & ID */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <Label htmlFor="patientName" className="text-sm  font-medium text-slate-700">Patient Name</Label>
                    <Input
                      id="patientName"
                      name="patientName"
                      value={patientData.patientName}
                      onChange={handleInputChange}
                      placeholder="e.g. John Doe"
                      className="h-12 bg-white border-slate-200 focus:border-cyan-500 focus:ring-cyan-500/20 transition-all"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="patientId" className="text-sm font-medium text-slate-700">Patient ID</Label>
                    <Input
                      id="patientId"
                      name="patientId"
                      value={patientData.patientId}
                      onChange={handleInputChange}
                      placeholder="e.g. PID-88392"
                      className="h-12 bg-white border-slate-200 focus:border-cyan-500 focus:ring-cyan-500/20 transition-all"
                      required
                    />
                  </div>
                </div>

                {/* Age & Gender */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <Label htmlFor="patientAge" className="text-sm font-medium text-slate-700">Age</Label>
                    <Input
                      id="patientAge"
                      name="patientAge"
                      type="number"
                      value={patientData.patientAge}
                      onChange={handleInputChange}
                      placeholder="Years"
                      className="h-12 bg-white border-slate-200 focus:border-cyan-500 focus:ring-cyan-500/20 transition-all"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="patientGender" className="text-sm font-medium text-slate-700">Gender</Label>
                    <Select
                      id="patientGender"
                      name="patientGender"
                      value={patientData.patientGender}
                      onChange={handleInputChange}
                      className="h-12 bg-white border-slate-200 focus:border-cyan-500 focus:ring-cyan-500/20 transition-all"
                      required
                    >
                      <option value="">Select Gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </Select>
                  </div>
                </div>

                {/* File Upload Zone */}
                <div className="space-y-2 pt-2">
                  <Label className="text-sm font-medium text-slate-700">Chest X-Ray Scan</Label>
                  <div
                    className={`relative border-2 border-dashed rounded-xl p-8 transition-all duration-300 ease-in-out group ${file
                      ? 'border-emerald-500 bg-emerald-50/30'
                      : 'border-slate-300 hover:border-cyan-500 hover:bg-cyan-50/30 bg-white'
                      }`}
                  >
                    <input
                      id="xray-upload"
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
                      required
                      disabled={loading || analysisLoading}
                    />

                    <div className="text-center pointer-events-none relative z-10">
                      {!file ? (
                        <div className="flex flex-col items-center gap-3">
                          <div className="w-14 h-14 rounded-full bg-slate-100 text-slate-400 group-hover:bg-cyan-100 group-hover:text-cyan-600 flex items-center justify-center transition-colors duration-300">
                            <Upload className="w-7 h-7" strokeWidth={2} />
                          </div>
                          <div>
                            <p className="text-base font-semibold text-slate-700 group-hover:text-cyan-700 transition-colors">
                              Click to upload or drag & drop
                            </p>
                            <p className="text-sm text-slate-400 mt-1">
                              Supports PNG, JPG, JPEG (max 10MB)
                            </p>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center gap-4">
                          <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shadow-sm">
                            <FileCheck2 className="w-6 h-6" strokeWidth={2} />
                          </div>
                          <div className="text-left">
                            <p className="font-semibold text-slate-900 text-base truncate max-w-[200px]">{file.name}</p>
                            <p className="text-sm text-emerald-600 font-medium">Ready for analysis</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  disabled={!file || loading || analysisLoading}
                  className="w-full h-14 text-base font-semibold bg-cyan-600 hover:bg-cyan-700 text-white shadow-lg shadow-cyan-600/20 rounded-xl transition-all duration-300 transform hover:-translate-y-0.5"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Processing Scan...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      <Activity className="w-5 h-5" />
                      Run AI Diagnosis
                    </span>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Results Section */}
          {result && (
            <div className="mt-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <Card className="bg-white border-slate-200 overflow-hidden shadow-lg shadow-slate-200/50">
                <div className={`h-2 w-full ${result.label === 'NORMAL' ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">Diagnosis Result</p>
                      <h3 className={`text-2xl font-bold mt-1 ${result.label === 'NORMAL' ? 'text-emerald-700' : 'text-rose-700'}`}>
                        {result.label}
                      </h3>
                    </div>
                    <Badge
                      className={`px-4 py-1.5 text-sm font-semibold rounded-full ${result.label === 'NORMAL'
                        ? 'bg-emerald-100 text-emerald-700 border-emerald-200'
                        : 'bg-rose-100 text-rose-700 border-rose-200'
                        }`}
                    >
                      {result.confidence}% Confidence
                    </Badge>
                  </div>

                  <Button
                    onClick={handleAnalysisClick}
                    disabled={analysisLoading || loading}
                    variant="outline"
                    className="w-full h-12 text-base font-medium border-slate-200 hover:bg-slate-50 hover:text-slate-900 transition-colors"
                  >
                    {analysisLoading ? (
                      <span className="flex items-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Generating Visualization...
                      </span>
                    ) : (
                      <span className="flex items-center justify-between w-full px-2">
                        View Detailed Analysis
                        <ChevronRight className="w-4 h-4" />
                      </span>
                    )}
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default PredictionForm;
