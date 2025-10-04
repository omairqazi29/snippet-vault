'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism'
import Link from 'next/link'

interface Snippet {
  id: string
  title: string
  description: string | null
  code: string
  language: string
  isPublic: boolean
  tags: string[]
  createdAt: string
  user: {
    name: string | null
    email: string
  }
}

export default function PublicSnippetPage() {
  const params = useParams()
  const [snippet, setSnippet] = useState<Snippet | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)

  const fetchSnippet = async () => {
    try {
      const response = await fetch(`/api/snippets/${params.id}`)
      if (response.ok) {
        const data = await response.json()
        setSnippet(data)
      } else {
        setError('Snippet not found or you do not have access')
      }
    } catch {
      setError('Failed to load snippet')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSnippet()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id])

  const copyToClipboard = () => {
    if (snippet) {
      navigator.clipboard.writeText(snippet.code)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const shareUrl = typeof window !== 'undefined' ? window.location.href : ''

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (error || !snippet) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Snippet Not Found</h1>
          <p className="text-gray-600 mb-4">{error}</p>
          <Link href="/dashboard" className="text-blue-600 hover:text-blue-800">
            Go to Dashboard
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link href="/" className="text-xl font-bold text-gray-900">
                Snippet Vault
              </Link>
            </div>
            <div className="flex items-center">
              <Link href="/dashboard" className="text-sm text-blue-600 hover:text-blue-800">
                Dashboard
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-6">
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{snippet.title}</h1>
              {snippet.description && (
                <p className="text-gray-600 mb-4">{snippet.description}</p>
              )}
              <div className="flex items-center gap-4 mb-4">
                <span className="text-sm font-medium text-gray-700">
                  Language: <span className="text-blue-600">{snippet.language}</span>
                </span>
                {snippet.isPublic && (
                  <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                    Public
                  </span>
                )}
              </div>
              {snippet.tags.length > 0 && (
                <div className="flex gap-2 mb-4">
                  {snippet.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="relative">
              <button
                onClick={copyToClipboard}
                className="absolute top-2 right-2 px-3 py-1 text-sm bg-gray-700 text-white rounded hover:bg-gray-600 z-10"
              >
                {copied ? 'Copied!' : 'Copy'}
              </button>
              <div className="rounded-md overflow-hidden">
                <SyntaxHighlighter
                  language={snippet.language}
                  style={vscDarkPlus}
                  customStyle={{ margin: 0, paddingTop: '2.5rem' }}
                >
                  {snippet.code}
                </SyntaxHighlighter>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="flex justify-between items-center">
                <div className="text-sm text-gray-600">
                  Created {new Date(snippet.createdAt).toLocaleDateString()} by{' '}
                  {snippet.user.name || snippet.user.email}
                </div>
                {snippet.isPublic && (
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(shareUrl)
                      alert('Link copied to clipboard!')
                    }}
                    className="text-sm text-blue-600 hover:text-blue-800"
                  >
                    Share Link
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
