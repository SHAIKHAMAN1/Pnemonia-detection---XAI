const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'

function buildFormData(payload) {
  const formData = new FormData()
  formData.append('file', payload.file)
  formData.append('patientName', payload.patientName)
  formData.append('patientId', payload.patientId)
  formData.append('patientAge', String(payload.age))
  formData.append('patientGender', payload.gender)
  return formData
}

async function parseJsonResponse(response) {
  let data = null

  try {
    data = await response.json()
  } catch {
    data = null
  }

  if (!response.ok) {
    const message = data?.error || data?.detail || `Request failed with status ${response.status}`
    throw new Error(message)
  }

  return data
}

export async function predictDiagnosis(payload) {
  const response = await fetch(`${API_BASE_URL}/predict`, {
    method: 'POST',
    body: buildFormData(payload),
  })

  return parseJsonResponse(response)
}

export async function explainDiagnosis(payload) {
  const response = await fetch(`${API_BASE_URL}/explain`, {
    method: 'POST',
    body: buildFormData(payload),
  })

  return parseJsonResponse(response)
}

export async function fetchPatientHistory(patientId = '') {
  const query = new URLSearchParams()
  if (patientId) {
    query.set('patientId', patientId)
  }

  const queryString = query.toString()
  const endpoint = queryString ? `/patients/history?${queryString}` : '/patients/history'
  const response = await fetch(`${API_BASE_URL}${endpoint}`)

  return parseJsonResponse(response)
}
