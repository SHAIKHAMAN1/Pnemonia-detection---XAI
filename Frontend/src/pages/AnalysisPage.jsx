import {
  Activity,
  AlertCircle,
  ArrowLeft,
  CircleCheckBig,
  Microscope,
  ShieldCheck,
  Sparkles,
} from 'lucide-react'
import { Badge } from '../components/ui/badge'
import { Button } from '../components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'

function AnalysisPage({ report, generatedAt, onBack, onOpenReport, isLoading, errorMessage }) {
  const highRisk = report.confidence >= 90

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <header className="mb-7 flex flex-col gap-3 border-b border-slate-200 pb-5 md:flex-row md:items-start md:justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-slate-900">Pneumonia Diagnosis Workspace</h1>
          <p className="mt-1 text-sm text-slate-500">Inference summary and explainability report for the submitted patient.</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Badge tone={highRisk ? 'success' : 'neutral'} className="gap-1">
            <span className={`h-1.5 w-1.5 rounded-full ${highRisk ? 'bg-emerald-500' : 'bg-slate-500'}`} />
            {highRisk ? 'High confidence result' : 'Review advised'}
          </Badge>
          <Badge className="gap-1"><Activity className="h-3 w-3" /> Session Overview</Badge>
          <Badge className="gap-1"><Sparkles className="h-3 w-3" /> Explainable output</Badge>
          <Badge className="gap-1"><ShieldCheck className="h-3 w-3" /> Workflow-safe</Badge>
        </div>
      </header>

      <Card className="mx-auto max-w-3xl">
        <CardHeader className="flex flex-row items-start justify-between gap-4">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Microscope className="h-5 w-5 text-sky-600" />
              Analysis Report
            </CardTitle>
            <CardDescription>Generated at {generatedAt}</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="secondary" onClick={onOpenReport} disabled={isLoading}>
              {isLoading ? 'Generating...' : 'Open XAI Report'}
            </Button>
            <Button variant="ghost" className="gap-2" onClick={onBack}>
              <ArrowLeft className="h-4 w-4" />
              Back to Form
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="grid gap-4 rounded-lg border border-slate-200 bg-slate-50 p-4 md:grid-cols-2">
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-500">Patient Name</p>
              <p className="mt-1 text-sm font-medium text-slate-900">{report.patientName}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-500">Patient ID</p>
              <p className="mt-1 text-sm font-medium text-slate-900">{report.patientId}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-500">Demographics</p>
              <p className="mt-1 text-sm font-medium text-slate-900">Age {report.age}, {report.gender}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-500">Source Image</p>
              <p className="mt-1 truncate text-sm font-medium text-slate-900">{report.fileName}</p>
            </div>
          </div>

          <div className="rounded-lg border border-slate-200 p-4">
            <p className="flex items-center gap-2 text-sm font-semibold text-slate-900">
              {highRisk ? <AlertCircle className="h-4 w-4 text-rose-500" /> : <CircleCheckBig className="h-4 w-4 text-emerald-500" />}
              {report.diagnosis}
            </p>
            <p className="mt-1 text-sm text-slate-600">Model confidence: {report.confidence}%</p>
          </div>

          <div className="rounded-lg border border-slate-200 p-4">
            <p className="mb-3 text-sm font-semibold text-slate-900">Next Step</p>
            <div className="space-y-2">
              {report.saliencyFocus.map((point) => (
                <div key={point} className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700">
                  {point}
                </div>
              ))}
            </div>
          </div>

          {errorMessage ? (
            <p className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">{errorMessage}</p>
          ) : null}
        </CardContent>
      </Card>
    </div>
  )
}

export default AnalysisPage
