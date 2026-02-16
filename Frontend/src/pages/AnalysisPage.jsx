import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

function AnalysisPage() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const {
    imageFilename,
    label,
    confidence,
    gradcam,
    lime,
    occlusion
  } = state || {};

  const [isImagesLoading, setIsImagesLoading] = useState(true);
  const [imagesLoaded, setImagesLoaded] = useState(0);

  useEffect(() => {
    if (!state) return;
    // Reset counters if state changes
    setImagesLoaded(0);
    setIsImagesLoading(true);
  }, [state]);

  const handleImageLoad = () => {
    setImagesLoaded(prev => {
      const updated = prev + 1;
      if (updated === 3) setIsImagesLoading(false);
      return updated;
    });
  };

  if (!state) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl text-slate-600 mb-4">No analysis data available.</p>
          <Button
            onClick={() => navigate('/')}
            variant="outline"
          >
            ← Back to Home
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center py-8 px-4">
      {/* Header with Diagnosis Result */}
      <div className="w-full max-w-6xl mb-8">
        <Button
          onClick={() => navigate('/')}
          variant="ghost"
          className="mb-6 text-slate-600 hover:text-cyan-600"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Home
        </Button>

        <Card className="shadow-lg">
          <CardContent className="p-8 text-center">
            <h1 className="text-3xl md:text-4xl font-bold text-slate-800 mb-6">
              Explainable Analysis
            </h1>

            <div className="flex flex-col md:flex-row items-center justify-center gap-6 mt-6">
              <div>
                <p className="text-sm font-semibold text-slate-500 mb-2">DIAGNOSIS</p>
                <Badge
                  className={`px-6 py-3 text-2xl ${label === 'NORMAL'
                      ? 'bg-gradient-to-r from-emerald-500 to-green-600 text-white hover:from-emerald-600 hover:to-green-700'
                      : 'bg-gradient-to-r from-red-500 to-rose-600 text-white hover:from-red-600 hover:to-rose-700'
                    }`}
                >
                  {label === 'NORMAL' ? '✓' : '⚠️'} {label}
                </Badge>
              </div>

              <div>
                <p className="text-sm font-semibold text-slate-500 mb-2">CONFIDENCE</p>
                <Badge
                  variant="secondary"
                  className="px-6 py-3 bg-gradient-to-r from-purple-100 to-indigo-100 text-purple-700 text-2xl"
                >
                  {confidence}%
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Loading Indicator */}
      {isImagesLoading && (
        <div className="w-full max-w-6xl mb-6">
          <Card>
            <CardContent className="p-6 text-center">
              <div className="flex items-center justify-center gap-3 text-cyan-600">
                <svg className="animate-spin h-6 w-6" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span className="font-semibold text-lg">Generating explainability visualizations...</span>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* XAI Visualizations Grid */}
      <div className="w-full max-w-6xl">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

          {/* Grad-CAM */}
          <Card className="group hover:shadow-xl transition-all duration-300">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center">
                  <span className="text-white font-bold text-lg">🔥</span>
                </div>
                <div>
                  <CardTitle className="text-xl text-slate-800">Grad-CAM</CardTitle>
                  <p className="text-xs text-slate-500">Activation Heatmap</p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="rounded-lg overflow-hidden bg-slate-100 border-2 border-slate-200 group-hover:border-cyan-400 transition-all duration-300">
                {isImagesLoading && (
                  <Skeleton className="w-full aspect-square" />
                )}
                <img
                  src={`${gradcam}`}
                  alt="GradCAM Visualization"
                  className={`w-full h-auto transition-all duration-300 group-hover:scale-105 ${isImagesLoading ? 'opacity-0' : 'opacity-100'}`}
                  onLoad={handleImageLoad}
                />
              </div>
              <p className="mt-3 text-sm text-slate-600">
                Shows which regions the model focused on during prediction
              </p>
            </CardContent>
          </Card>

          {/* LIME */}
          <Card className="group hover:shadow-xl transition-all duration-300">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
                  <span className="text-white font-bold text-lg">🎯</span>
                </div>
                <div>
                  <CardTitle className="text-xl text-slate-800">LIME</CardTitle>
                  <p className="text-xs text-slate-500">Local Interpretability</p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="rounded-lg overflow-hidden bg-slate-100 border-2 border-slate-200 group-hover:border-cyan-400 transition-all duration-300">
                {isImagesLoading && (
                  <Skeleton className="w-full aspect-square" />
                )}
                <img
                  src={`${lime}`}
                  alt="LIME Visualization"
                  className={`w-full h-auto transition-all duration-300 group-hover:scale-105 ${isImagesLoading ? 'opacity-0' : 'opacity-100'}`}
                  onLoad={handleImageLoad}
                />
              </div>
              <p className="mt-3 text-sm text-slate-600">
                Highlights superpixels that contributed to the diagnosis
              </p>
            </CardContent>
          </Card>

          {/* Occlusion */}
          <Card className="group hover:shadow-xl transition-all duration-300">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center">
                  <span className="text-white font-bold text-lg">📊</span>
                </div>
                <div>
                  <CardTitle className="text-xl text-slate-800">Occlusion</CardTitle>
                  <p className="text-xs text-slate-500">Sensitivity Map</p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="rounded-lg overflow-hidden bg-slate-100 border-2 border-slate-200 group-hover:border-cyan-400 transition-all duration-300">
                {isImagesLoading && (
                  <Skeleton className="w-full aspect-square" />
                )}
                <img
                  src={`${occlusion}`}
                  alt="Occlusion Sensitivity"
                  className={`w-full h-auto transition-all duration-300 group-hover:scale-105 ${isImagesLoading ? 'opacity-0' : 'opacity-100'}`}
                  onLoad={handleImageLoad}
                />
              </div>
              <p className="mt-3 text-sm text-slate-600">
                Reveals critical regions by systematically blocking areas
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Information Panel */}
        <Card className="mt-8 bg-gradient-to-br from-blue-50 to-cyan-50 border-cyan-200">
          <CardContent className="p-6">
            <h4 className="font-bold text-slate-800 mb-3 flex items-center gap-2">
              <span className="text-xl">ℹ️</span>
              Understanding the Visualizations
            </h4>
            <ul className="space-y-2 text-sm text-slate-700">
              <li className="flex items-start gap-2">
                <span className="text-cyan-600 font-bold">•</span>
                <span><strong>Grad-CAM:</strong> Red/yellow areas indicate regions the model found most important for its prediction</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-cyan-600 font-bold">•</span>
                <span><strong>LIME:</strong> Highlighted superpixels show which image segments support the diagnosis</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-cyan-600 font-bold">•</span>
                <span><strong>Occlusion:</strong> Sensitivity map shows how prediction changes when different areas are blocked</span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default AnalysisPage;
