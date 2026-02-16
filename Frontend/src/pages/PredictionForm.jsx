import { Activity, FileText, ShieldCheck, Sparkles, Upload, X } from 'lucide-react'
import { useState } from 'react'
import { Badge } from '../components/ui/badge'
import { Button } from '../components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import { Select } from '../components/ui/select'
import { cn, useObjectUrl } from '../lib/utils'

const genderOptions = [
  { label: 'Male', value: 'Male' },
  { label: 'Female', value: 'Female' },
  { label: 'Other', value: 'Other' },
]

function PredictionForm({ onRunDiagnosis, isLoading, errorMessage }) {
  const [patientName, setPatientName] = useState('za')
  const [patientId, setPatientId] = useState('PID-111')
  const [age, setAge] = useState('21')
  const [gender, setGender] = useState('Male')
  const [file, setFile] = useState(null)

  const imageUrl = useObjectUrl(file)

  const payload = {
    patientName,
    patientId,
    age: Number(age) || 0,
    gender,
    file,
    fileName: file?.name ?? 'No file uploaded',
    imagePreviewUrl: imageUrl,
  }

  const handleFileChange = (event) => {
    const nextFile = event.target.files?.[0]
    setFile(nextFile ?? null)
  }

  const clearFile = () => setFile(null)
  const canSubmit = Boolean(patientName && patientId && age && gender && file)

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <header className="mb-7 flex flex-col gap-3 border-b border-slate-200 pb-5 md:flex-row md:items-start md:justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-slate-900">Pneumonia Diagnosis Workspace</h1>
          <p className="mt-1 text-sm text-slate-500">Submit patient profile and chest X-ray to run prediction and explainability.</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Badge tone="success" className="gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            Inference online
          </Badge>
          <Badge className="gap-1"><Activity className="h-3 w-3" /> Session Overview</Badge>
          <Badge className="gap-1"><Sparkles className="h-3 w-3" /> Explainable output</Badge>
          <Badge className="gap-1"><ShieldCheck className="h-3 w-3" /> Workflow-safe</Badge>
        </div>
      </header>

      <Card className="mx-auto max-w-2xl">
        <CardHeader>
          <CardTitle>New Patient Analysis</CardTitle>
          <CardDescription>All fields marked with <span className="text-rose-500">*</span> are required.</CardDescription>
        </CardHeader>

        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label htmlFor="patient-name">Patient Name <span className="text-rose-500">*</span></Label>
              <Input id="patient-name" value={patientName} onChange={(e) => setPatientName(e.target.value)} required />
            </div>

            <div>
              <Label htmlFor="patient-id">Patient ID <span className="text-rose-500">*</span></Label>
              <Input id="patient-id" value={patientId} onChange={(e) => setPatientId(e.target.value)} required />
            </div>

            <div>
              <Label htmlFor="age">Age <span className="text-rose-500">*</span></Label>
              <Input id="age" value={age} onChange={(e) => setAge(e.target.value)} type="number" min="0" required />
            </div>

            <div>
              <Label>Gender <span className="text-rose-500">*</span></Label>
              <Select value={gender} onValueChange={setGender} options={genderOptions} placeholder="Select gender" required />
            </div>
          </div>

          <div>
            <Label htmlFor="xray">Upload Chest X-ray <span className="text-rose-500">*</span></Label>
            <label
              htmlFor="xray"
              className={cn(
                'group mt-1 block cursor-pointer overflow-hidden rounded-lg border border-slate-300 bg-slate-100 transition hover:border-sky-400',
                !file && 'border-dashed',
              )}
            >
              <input
                id="xray"
                type="file"
                accept="image/*"
                className="sr-only"
                onChange={handleFileChange}
                required={!file}
              />

              <div className="flex min-h-64 items-center justify-center px-4 py-3">
                {imageUrl ? (
                  <img src={imageUrl} alt="Chest x-ray preview" className="max-h-64 rounded-md object-contain" />
                ) : (
                  <div className="flex flex-col items-center gap-2 text-slate-500">
                    <Upload className="h-7 w-7" />
                    <span className="text-sm">Click to upload X-ray image</span>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between border-t border-slate-300 bg-white px-3 py-2 text-sm text-slate-600">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  <span>{file?.name ?? 'No image selected'}</span>
                </div>
                <button
                  type="button"
                  onClick={clearFile}
                  className="rounded-md p-1 text-slate-500 transition hover:bg-slate-100 hover:text-slate-800"
                  aria-label="Remove image"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </label>
          </div>

          <div className="grid gap-3 pt-1">
            <Button onClick={() => onRunDiagnosis(payload)} disabled={!canSubmit || isLoading}>
              {isLoading ? 'Running...' : 'Run Diagnosis'}
            </Button>
            <p className="text-center text-xs text-slate-500">After prediction, open XAI report from the analysis page.</p>
          </div>

          {errorMessage ? (
            <p className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">{errorMessage}</p>
          ) : null}
        </CardContent>
      </Card>
    </div>
  )
}

export default PredictionForm
