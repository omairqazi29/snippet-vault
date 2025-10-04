'use client'

import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism'

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

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [snippets, setSnippets] = useState<Snippet[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [search, setSearch] = useState('')
  const [selectedLanguage, setSelectedLanguage] = useState('')
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    code: '',
    language: 'javascript',
    isPublic: false,
    tags: '' as string,
  })

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    }
  }, [status, router])

  const fetchSnippets = async () => {
    try {
      const params = new URLSearchParams()
      if (search) params.append('search', search)
      if (selectedLanguage) params.append('language', selectedLanguage)

      const response = await fetch(`/api/snippets?${params}`)
      const data = await response.json()
      setSnippets(data)
    } catch {
      console.error('Error fetching snippets')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (session) {
      fetchSnippets()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session, search, selectedLanguage])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await fetch('/api/snippets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean),
        }),
      })

      if (response.ok) {
        setShowForm(false)
        setFormData({
          title: '',
          description: '',
          code: '',
          language: 'javascript',
          isPublic: false,
          tags: '',
        })
        fetchSnippets()
      }
    } catch {
      console.error('Error creating snippet')
    }
  }

  const deleteSnippet = async (id: string) => {
    if (!confirm('Are you sure you want to delete this snippet?')) return

    try {
      const response = await fetch(`/api/snippets/${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        fetchSnippets()
      }
    } catch {
      console.error('Error deleting snippet')
    }
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-gray-900">Snippet Vault</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-700">{session?.user?.email}</span>
              <button
                onClick={() => signOut({ callbackUrl: '/login' })}
                className="text-sm text-gray-700 hover:text-gray-900"
              >
                Sign out
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900">Your Snippets</h2>
          <button
            onClick={() => setShowForm(!showForm)}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            {showForm ? 'Cancel' : 'New Snippet'}
          </button>
        </div>

        {showForm && (
          <div className="mb-8 bg-white p-6 rounded-lg shadow-md">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Title</label>
                <input
                  type="text"
                  required
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <input
                  type="text"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Code</label>
                <textarea
                  required
                  rows={10}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md font-mono text-sm"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Language</label>
                  <select
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                    value={formData.language}
                    onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                  >
                    <option value="javascript">JavaScript</option>
                    <option value="typescript">TypeScript</option>
                    <option value="python">Python</option>
                    <option value="java">Java</option>
                    <option value="go">Go</option>
                    <option value="rust">Rust</option>
                    <option value="bash">Bash</option>
                    <option value="sql">SQL</option>
                    <option value="css">CSS</option>
                    <option value="html">HTML</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Tags (comma-separated)</label>
                  <input
                    type="text"
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                    value={formData.tags}
                    onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                    placeholder="react, hooks, useState"
                  />
                </div>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isPublic"
                  className="h-4 w-4 text-blue-600 rounded"
                  checked={formData.isPublic}
                  onChange={(e) => setFormData({ ...formData, isPublic: e.target.checked })}
                />
                <label htmlFor="isPublic" className="ml-2 text-sm text-gray-700">
                  Make this snippet public
                </label>
              </div>
              <button
                type="submit"
                className="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Save Snippet
              </button>
            </form>
          </div>
        )}

        <div className="mb-6 space-y-4">
          <input
            type="text"
            placeholder="Search snippets..."
            className="w-full px-4 py-2 border border-gray-300 rounded-md"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select
            className="w-full px-4 py-2 border border-gray-300 rounded-md"
            value={selectedLanguage}
            onChange={(e) => setSelectedLanguage(e.target.value)}
          >
            <option value="">All Languages</option>
            <option value="javascript">JavaScript</option>
            <option value="typescript">TypeScript</option>
            <option value="python">Python</option>
            <option value="java">Java</option>
            <option value="go">Go</option>
            <option value="rust">Rust</option>
            <option value="bash">Bash</option>
            <option value="sql">SQL</option>
          </select>
        </div>

        <div className="space-y-6">
          {snippets.length === 0 ? (
            <p className="text-center text-gray-500">No snippets found. Create your first one!</p>
          ) : (
            snippets.map((snippet) => (
              <div key={snippet.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900">{snippet.title}</h3>
                      {snippet.description && (
                        <p className="text-gray-600 mt-1">{snippet.description}</p>
                      )}
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-sm text-gray-500">{snippet.language}</span>
                        {snippet.isPublic && (
                          <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                            Public
                          </span>
                        )}
                      </div>
                      {snippet.tags.length > 0 && (
                        <div className="flex gap-2 mt-2">
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
                    {snippet.user.email === session?.user?.email && (
                      <button
                        onClick={() => deleteSnippet(snippet.id)}
                        className="text-red-600 hover:text-red-800 text-sm"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                  <div className="rounded-md overflow-hidden">
                    <SyntaxHighlighter
                      language={snippet.language}
                      style={vscDarkPlus}
                      customStyle={{ margin: 0 }}
                    >
                      {snippet.code}
                    </SyntaxHighlighter>
                  </div>
                  <div className="mt-4 text-xs text-gray-500">
                    Created {new Date(snippet.createdAt).toLocaleDateString()} by{' '}
                    {snippet.user.name || snippet.user.email}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  )
}
