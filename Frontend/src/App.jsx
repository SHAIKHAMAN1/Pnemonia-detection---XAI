import { useMemo, useState } from 'react'
import AnalysisPage from './pages/AnalysisPage'
import PatientHistoryPage from './pages/PatientHistoryPage'
import PredictionForm from './pages/PredictionForm'
import XaiReportPage from './pages/XaiReportPage'
import { explainDiagnosis, fetchPatientHistory, predictDiagnosis } from './lib/api'

const defaultReport = {
  patientName: 'Unknown',
  patientId: 'N/A',
  age: 0,
  gender: 'Not provided',
  fileName: 'No file uploaded',
  imagePreviewUrl: '',
  diagnosis: 'No prediction yet',
  confidence: 0,
  saliencyFocus: ['No explainability output available'],
  gradcam: '',
  lime: '',
  occlusion: '',
}

function App() {
  const [currentPage, setCurrentPage] = useState('form')
  const [report, setReport] = useState(defaultReport)
  const [isLoading, setIsLoading] = useState(false)
  const [formError, setFormError] = useState('')
  const [lastPayload, setLastPayload] = useState(null)
  const [historyReports, setHistoryReports] = useState([])
  const [historyLoading, setHistoryLoading] = useState(false)
  const [historyError, setHistoryError] = useState('')
  const [historyPatientId, setHistoryPatientId] = useState('')
  const [historyReturnPage, setHistoryReturnPage] = useState('form')

  const generatedAt = useMemo(() => new Date().toLocaleString(), [currentPage])

  const handleDiagnosis = async (payload) => {
    setIsLoading(true)
    setFormError('')

    try {
      const predictResult = await predictDiagnosis(payload)

      setReport({
        patientName: payload.patientName,
        patientId: payload.patientId,
        age: payload.age,
        gender: payload.gender,
        fileName: payload.file?.name ?? 'No file uploaded',
        imagePreviewUrl: payload.imagePreviewUrl ?? '',
        diagnosis: predictResult?.label || 'Unknown',
        confidence: predictResult?.confidence ?? 0,
        saliencyFocus: [
          `Model label: ${predictResult?.label || 'Unknown'}`,
          `Prediction confidence: ${predictResult?.confidence ?? 0}%`,
          'Click Open XAI Report to generate explainability outputs',
        ],
        gradcam: '',
        lime: '',
        occlusion: '',
      })
      setLastPayload(payload)
      setCurrentPage('analysis')
    } catch (error) {
      setFormError(error.message || 'Failed to run diagnosis pipeline')
    } finally {
      setIsLoading(false)
    }
  }

  const handleOpenReport = async () => {
    if (!lastPayload?.file) {
      setFormError('Please run diagnosis first with a valid X-ray file')
      return
    }

    setCurrentPage('xai')
    setIsLoading(true)
    setFormError('')

    try {
      const explainResult = await explainDiagnosis(lastPayload)

      setReport((prev) => ({
        ...prev,
        diagnosis: explainResult?.label || prev.diagnosis,
        confidence: explainResult?.confidence ?? prev.confidence,
        saliencyFocus: [
          `Model label: ${explainResult?.label || 'Unknown'}`,
          `Prediction confidence: ${explainResult?.confidence ?? 0}%`,
          `XAI outputs generated for patient ${prev.patientId}`,
        ],
        gradcam: explainResult?.gradcam || '',
        lime: explainResult?.lime || '',
        occlusion: explainResult?.occlusion || '',
      }))
    } catch (error) {
      setFormError(error.message || 'Failed to generate explanation report')
    } finally {
      setIsLoading(false)
    }
  }

  const handleBack = () => {
    setFormError('')
    setCurrentPage('form')
  }

  const handleBackToPrediction = () => {
    setFormError('')
    setCurrentPage('analysis')
  }

  const handleOpenHistory = async (patientId = '') => {
    if (currentPage !== 'history') {
      setHistoryReturnPage(currentPage)
    }
    setHistoryPatientId(patientId || '')
    setHistoryError('')
    setCurrentPage('history')
    setHistoryLoading(true)

    try {
      const result = await fetchPatientHistory(patientId)
      setHistoryReports(result?.reports || [])
    } catch (error) {
      setHistoryError(error.message || 'Failed to fetch patient history')
      setHistoryReports([])
    } finally {
      setHistoryLoading(false)
    }
  }

  const handleBackFromHistory = () => {
    setHistoryError('')
    setCurrentPage(historyReturnPage === 'history' ? 'form' : historyReturnPage)
  }

  return (
    <main className="min-h-screen bg-slate-100">
      {currentPage === 'form' ? (
        <PredictionForm
          onRunDiagnosis={handleDiagnosis}
          onOpenHistory={handleOpenHistory}
          isLoading={isLoading}
          errorMessage={formError}
        />
      ) : null}

      {currentPage === 'analysis' ? (
        <AnalysisPage
          report={report}
          generatedAt={generatedAt}
          onBack={handleBack}
          onOpenReport={handleOpenReport}
          onOpenHistory={handleOpenHistory}
          isLoading={isLoading}
          errorMessage={formError}
        />
      ) : null}

      {currentPage === 'xai' ? (
        <XaiReportPage
          report={report}
          generatedAt={generatedAt}
          isLoading={isLoading}
          errorMessage={formError}
          onRetry={handleOpenReport}
          onBackToPrediction={handleBackToPrediction}
          onBackToForm={handleBack}
          onOpenHistory={handleOpenHistory}
        />
      ) : null}

      {currentPage === 'history' ? (
        <PatientHistoryPage
          reports={historyReports}
          isLoading={historyLoading}
          errorMessage={historyError}
          initialPatientId={historyPatientId}
          onSearch={handleOpenHistory}
          onBack={handleBackFromHistory}
        />
      ) : null}
    </main>
  )
}

export default App
