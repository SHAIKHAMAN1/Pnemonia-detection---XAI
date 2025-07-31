import React, { useState } from 'react';

function PredictionForm() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return;

    setLoading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('http://localhost:5000/predict', {
        method: 'POST',
        body: formData
      });

      const data = await res.json();
      setResult(data);
    } catch (err) {
      console.error(err);
      alert("Prediction failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto p-6 bg-white rounded-2xl shadow-lg mt-10">
      <h1 className="text-2xl font-bold text-center mb-4 text-gray-800">Pneumonia Prediction</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="block w-full text-sm text-gray-700
                     file:mr-4 file:py-2 file:px-4
                     file:rounded-full file:border-0
                     file:text-sm file:font-semibold
                     file:bg-blue-50 file:text-blue-700
                     hover:file:bg-blue-100"
        />

        <button
          type="submit"
          disabled={!file || loading}
          className={`w-full py-2 px-4 rounded-md font-semibold text-white ${
            loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          {loading ? 'Predicting...' : 'Predict'}
        </button>
      </form>

      {result && (
        <div className="mt-6 text-center">
          <h2 className="text-xl font-semibold text-gray-700">Result</h2>
          <p className="text-lg mt-2 text-blue-600">
            {result.label} ({result.confidence}% confidence)
          </p>
        </div>
      )}
    </div>
  );
}

export default PredictionForm;
