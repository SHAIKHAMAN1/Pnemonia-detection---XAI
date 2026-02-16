import { Activity, ArrowLeft, Brain, Loader2, ShieldCheck, Sparkles } from 'lucide-react'
import { Badge } from '../components/ui/badge'
import { Button } from '../components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'

function XaiReportPage({ report, generatedAt, isLoading, errorMessage, onBackToPrediction, onBackToForm, onRetry }) {
  const xaiImages = [
    { key: 'gradcam', label: 'Grad-CAM', src: report.gradcam },
    { key: 'lime', label: 'LIME', src: report.lime },
    { key: 'occlusion', label: 'Occlusion', src: report.occlusion },
  ]

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <header className="mb-7 flex flex-col gap-3 border-b border-slate-200 pb-5 md:flex-row md:items-start md:justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-slate-900">Pneumonia Diagnosis Workspace</h1>
          <p className="mt-1 text-sm text-slate-500">XAI report generated from the explainability pipeline.</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Badge className="gap-1"><Activity className="h-3 w-3" /> Session Overview</Badge>
          <Badge tone="success" className="gap-1"><Sparkles className="h-3 w-3" /> Explainable output</Badge>
          <Badge className="gap-1"><ShieldCheck className="h-3 w-3" /> Workflow-safe</Badge>
        </div>
      </header>

      <Card className="mx-auto max-w-4xl">
        <CardHeader className="flex flex-row items-start justify-between gap-4">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-sky-600" />
              XAI Report
            </CardTitle>
            <CardDescription>Generated at {generatedAt}</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="secondary" onClick={onBackToPrediction}>Back to Prediction</Button>
            <Button variant="ghost" className="gap-2" onClick={onBackToForm}>
              <ArrowLeft className="h-4 w-4" />
              Back to Form
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {isLoading ? (
            <div className="flex min-h-52 flex-col items-center justify-center gap-3 rounded-lg border border-slate-200 bg-slate-50">
              <Loader2 className="h-8 w-8 animate-spin text-sky-600" />
              <p className="text-sm font-medium text-slate-700">Generating XAI report...</p>
              <p className="text-xs text-slate-500">Waiting for backend `/explain` response.</p>
            </div>
          ) : (
            <div className="grid gap-3 md:grid-cols-3">
              {xaiImages.map((image) => (
                <div key={image.key} className="overflow-hidden rounded-lg border border-slate-200 bg-slate-50">
                  <div className="border-b border-slate-200 px-3 py-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    {image.label}
                  </div>
                  <div className="flex h-52 items-center justify-center p-2">
                    {image.src ? (
                      <img src={image.src} alt={`${image.label} explanation`} className="h-full w-full rounded object-cover" />
                    ) : (
                      <span className="text-xs text-slate-400">No image returned by backend</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {errorMessage ? (
            <div className="space-y-3 rounded-lg border border-rose-200 bg-rose-50 p-3">
              <p className="text-sm text-rose-700">{errorMessage}</p>
              <Button variant="secondary" onClick={onRetry} disabled={isLoading}>Retry XAI Report</Button>
            </div>
          ) : null}
        </CardContent>
      </Card>
    </div>
  )
}

export default XaiReportPage
