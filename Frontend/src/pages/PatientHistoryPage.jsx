import { Activity, ArrowLeft, CalendarClock, Eye, ShieldCheck, Sparkles, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Badge } from '../components/ui/badge'
import { Button } from '../components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'

function formatDate(value) {
  if (!value) return 'Not available'
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return value
  return parsed.toLocaleString()
}

function PreviewTile({ src, alt, emptyLabel, onOpen }) {
  if (!src) {
    return (
      <div className="flex h-56 items-center justify-center rounded border border-dashed border-slate-200 bg-slate-50 p-4 text-xs text-slate-400">
        {emptyLabel}
      </div>
    )
  }

  return (
    <div className="h-56 rounded border border-slate-200 bg-slate-50 p-2">
      <button type="button" onClick={onOpen} className="h-full w-full cursor-zoom-in">
        <img src={src} alt={alt} className="h-full w-full rounded object-contain" />
      </button>
    </div>
  )
}

function getReportKey(report) {
  return report.reportId || `${report.patientId || 'unknown'}-${report.createdAt || report.updatedAt || report.imageFilename || 'report'}`
}

function ReportPreviewModal({ report, onClose }) {
  const [zoomImage, setZoomImage] = useState(null)

  if (!report) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4">
      <div className="max-h-[90vh] w-full max-w-5xl overflow-x-hidden overflow-y-auto rounded-xl bg-white p-4 shadow-2xl">
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            <p className="text-lg font-semibold text-slate-900">Report Preview</p>
            <p className="text-sm text-slate-500">
              {report.patientName || 'Unknown'} | {report.patientId || 'N/A'} | {formatDate(report.createdAt)}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
            aria-label="Close preview"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mb-4 grid gap-3 text-sm text-slate-700 md:grid-cols-3">
          <p><span className="font-medium">Diagnosis:</span> {report.diagnosis || 'Pending inference'}</p>
          <p><span className="font-medium">Confidence:</span> {report.confidence ?? 0}%</p>
          <p className="break-all"><span className="font-medium">Image:</span> {report.imageFilename || 'N/A'}</p>
        </div>

        <div className="grid gap-3 md:grid-cols-4">
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Source X-ray</p>
            <PreviewTile
              src={report.sourceImageUrl}
              alt="Source X-ray"
              emptyLabel="No source X-ray preview"
              onOpen={() => setZoomImage({ src: report.sourceImageUrl, alt: 'Source X-ray' })}
            />
          </div>
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Grad-CAM</p>
            <PreviewTile
              src={report.gradcam}
              alt="Grad-CAM explanation"
              emptyLabel="No Grad-CAM available"
              onOpen={() => setZoomImage({ src: report.gradcam, alt: 'Grad-CAM explanation' })}
            />
          </div>
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">LIME</p>
            <PreviewTile
              src={report.lime}
              alt="LIME explanation"
              emptyLabel="No LIME available"
              onOpen={() => setZoomImage({ src: report.lime, alt: 'LIME explanation' })}
            />
          </div>
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Occlusion</p>
            <PreviewTile
              src={report.occlusion}
              alt="Occlusion explanation"
              emptyLabel="No occlusion available"
              onOpen={() => setZoomImage({ src: report.occlusion, alt: 'Occlusion explanation' })}
            />
          </div>
        </div>

        <p className="mt-3 text-xs text-slate-500">Tip: click any image to view full size.</p>
      </div>

      {zoomImage ? (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 p-4"
          onClick={() => setZoomImage(null)}
        >
          <img
            src={zoomImage.src}
            alt={zoomImage.alt}
            className="max-h-[95vh] max-w-[95vw] object-contain"
            onClick={(event) => event.stopPropagation()}
          />
        </div>
      ) : null}
    </div>
  )
}

function PatientHistoryPage({ reports, isLoading, errorMessage, initialPatientId, onSearch, onBack }) {
  const [patientId, setPatientId] = useState(initialPatientId || '')
  const [selectedReportId, setSelectedReportId] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)

  useEffect(() => {
    setPatientId(initialPatientId || '')
  }, [initialPatientId])

  useEffect(() => {
    if (reports.length === 0) {
      setSelectedReportId('')
      setIsModalOpen(false)
      return
    }
  }, [reports, selectedReportId])

  const selectedReport = reports.find((report) => getReportKey(report) === selectedReportId) || null

  const openPreview = (report) => {
    setSelectedReportId(getReportKey(report))
    setIsModalOpen(true)
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <header className="mb-7 flex flex-col gap-3 border-b border-slate-200 pb-5 md:flex-row md:items-start md:justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-slate-900">Patient History</h1>
          <p className="mt-1 text-sm text-slate-500">Review past prediction and explainability reports for all patients.</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Badge className="gap-1"><Activity className="h-3 w-3" /> Records</Badge>
          <Badge tone="success" className="gap-1"><Sparkles className="h-3 w-3" /> Explainable output</Badge>
          <Badge className="gap-1"><ShieldCheck className="h-3 w-3" /> Audit-ready</Badge>
        </div>
      </header>

      <Card className="mx-auto max-w-5xl">
        <CardHeader className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <CardTitle>Past Reports</CardTitle>
            <CardDescription>{reports.length} report(s) loaded</CardDescription>
          </div>
          <div className="flex w-full flex-col gap-2 md:w-auto md:flex-row md:items-end">
            <div className="md:min-w-60">
              <Label htmlFor="history-patient-id">Patient ID</Label>
              <Input
                id="history-patient-id"
                value={patientId}
                onChange={(event) => setPatientId(event.target.value)}
                placeholder="Filter by patient ID"
              />
            </div>
            <Button variant="secondary" onClick={() => onSearch(patientId)} disabled={isLoading}>
              {isLoading ? 'Loading...' : 'Search'}
            </Button>
            <Button variant="secondary" onClick={() => onSearch('')} disabled={isLoading}>
              Show All
            </Button>
            <Button variant="ghost" className="gap-2" onClick={onBack}>
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-3">
          {isLoading ? (
            <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-8 text-center text-sm text-slate-500">
              Loading reports...
            </div>
          ) : null}

          {errorMessage ? (
            <p className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">{errorMessage}</p>
          ) : null}

          {!isLoading && reports.length === 0 ? (
            <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-8 text-center text-sm text-slate-500">
              No past reports found.
            </div>
          ) : null}

          {reports.map((report) => {
            const reportKey = getReportKey(report)
            return (
              <div key={reportKey} className="rounded-lg border border-slate-200 bg-white p-4">
                <div className="mb-3 flex flex-col gap-2 border-b border-slate-200 pb-3 md:flex-row md:items-start md:justify-between">
                  <div className="min-w-0">
                    <p className="text-xs uppercase tracking-wide text-slate-500">Patient</p>
                    <p className="text-base font-semibold text-slate-900">{report.patientName || 'Unknown'}</p>
                    <p className="mt-1 text-sm text-slate-600">Patient ID: <span className="font-medium text-slate-900">{report.patientId || 'N/A'}</span></p>
                  </div>
                  <div className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700">
                    <p className="mb-1 text-xs uppercase tracking-wide text-slate-500">Report Date</p>
                    <p className="flex items-center gap-1"><CalendarClock className="h-4 w-4" /> {formatDate(report.createdAt)}</p>
                  </div>
                </div>

                <div className="mb-3 grid gap-3 md:grid-cols-2">
                  <div className="rounded-md border border-slate-200 bg-slate-50 p-3">
                    <p className="mb-2 text-xs uppercase tracking-wide text-slate-500">Clinical Summary</p>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <p className="text-xs uppercase tracking-wide text-slate-500">Diagnosis</p>
                        <p className="text-sm font-medium text-slate-900">{report.diagnosis || 'Pending inference'}</p>
                      </div>
                      <div>
                        <p className="text-xs uppercase tracking-wide text-slate-500">Confidence</p>
                        <p className="text-sm font-medium text-slate-900">{report.confidence ?? 0}%</p>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-md border border-slate-200 bg-slate-50 p-3">
                    <p className="mb-2 text-xs uppercase tracking-wide text-slate-500">Patient Details</p>
                    <div className="space-y-1 text-sm text-slate-700">
                      <p>Age/Gender: {report.patientAge || 'N/A'} / {report.patientGender || 'N/A'}</p>
                      <p className="min-w-0 break-all [overflow-wrap:anywhere]">Image: {report.imageFilename || 'N/A'}</p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 border-t border-slate-200 pt-3">
                  <Button variant="secondary" onClick={() => openPreview(report)}>
                    <Eye className="mr-1 h-4 w-4" />
                    View Report
                  </Button>
                  <Badge tone={report.gradcam || report.lime || report.occlusion ? 'success' : 'neutral'}>
                    {report.gradcam || report.lime || report.occlusion ? 'XAI available' : 'XAI pending'}
                  </Badge>
                  <span className="text-xs text-slate-500">Open report for full images</span>
                </div>
              </div>
            )
          })}
        </CardContent>
      </Card>

      {isModalOpen ? <ReportPreviewModal report={selectedReport} onClose={() => setIsModalOpen(false)} /> : null}
    </div>
  )
}

export default PatientHistoryPage
