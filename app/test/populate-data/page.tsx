'use client'

import { useState } from 'react'

export default function TestPopulateData() {
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleTest = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch('/api/populate-extra-data', {
        method: 'POST',
      })
      
      const data = await response.json()
      setResult(data)
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl mb-4">Test Populate Extra Data</h1>
      
      <button 
        onClick={handleTest}
        disabled={loading}
        className="bg-blue-500 text-white px-4 py-2 rounded disabled:bg-gray-400"
      >
        {loading ? 'Processing...' : 'Run Test'}
      </button>

      {error && (
        <div className="mt-4 p-4 bg-red-100 text-red-700 rounded">
          {error}
        </div>
      )}

      {result && (
        <div className="mt-4">
          <h2 className="text-xl mb-2">Result:</h2>
          <pre className="bg-gray-100 p-4 rounded">
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}
    </div>
  )
} 