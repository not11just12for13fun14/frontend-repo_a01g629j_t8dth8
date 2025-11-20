import { useEffect, useState } from 'react'

const API_BASE = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'

function PastelBadge({ children, color = 'pink' }) {
  const colorMap = {
    pink: 'bg-pink-100 text-pink-700 ring-pink-200',
    blue: 'bg-blue-100 text-blue-700 ring-blue-200',
    green: 'bg-green-100 text-green-700 ring-green-200',
    purple: 'bg-purple-100 text-purple-700 ring-purple-200',
    orange: 'bg-orange-100 text-orange-700 ring-orange-200',
  }
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ring-1 ring-inset ${colorMap[color]}`}>
      {children}
    </span>
  )
}

function App() {
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [title, setTitle] = useState('')
  const [notes, setNotes] = useState('')
  const [priority, setPriority] = useState('')
  const [error, setError] = useState('')

  async function fetchTasks() {
    try {
      setLoading(true)
      const res = await fetch(`${API_BASE}/api/tasks`)
      const data = await res.json()
      setTasks(data)
    } catch (e) {
      setError('Unable to load tasks')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTasks()
  }, [])

  async function addTask(e) {
    e.preventDefault()
    if (!title.trim()) return
    try {
      const res = await fetch(`${API_BASE}/api/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, notes, priority: priority || null })
      })
      const created = await res.json()
      setTasks((prev) => [created, ...prev])
      setTitle('')
      setNotes('')
      setPriority('')
    } catch (e) {
      setError('Could not add task')
    }
  }

  async function toggleComplete(task) {
    try {
      const res = await fetch(`${API_BASE}/api/tasks/${task.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed: !task.completed })
      })
      const updated = await res.json()
      setTasks((prev) => prev.map(t => t.id === task.id ? updated : t))
    } catch (e) {
      setError('Update failed')
    }
  }

  async function removeTask(task) {
    const prev = tasks
    setTasks(tasks.filter(t => t.id !== task.id))
    try {
      const res = await fetch(`${API_BASE}/api/tasks/${task.id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Delete failed')
    } catch (e) {
      setTasks(prev) // rollback
      setError('Delete failed')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50">
      <div className="absolute inset-0 pointer-events-none opacity-60" aria-hidden>
        <div className="h-full w-full bg-[radial-gradient(ellipse_at_top_left,rgba(255,182,193,0.25),transparent_40%),radial-gradient(ellipse_at_bottom_right,rgba(173,216,230,0.25),transparent_40%)]"></div>
      </div>

      <div className="relative max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <header className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl sm:text-4xl font-semibold text-slate-800 tracking-tight">Pastel Tasks</h1>
            <p className="text-slate-500 mt-1">A simple, professional to-do list in soft pastel hues</p>
          </div>
          <PastelBadge color="purple">v1.0</PastelBadge>
        </header>

        <section className="bg-white/80 backdrop-blur-sm ring-1 ring-slate-200 rounded-2xl p-5 sm:p-6 shadow-sm">
          <form onSubmit={addTask} className="grid grid-cols-1 sm:grid-cols-12 gap-3 sm:gap-4">
            <input
              className="sm:col-span-6 rounded-xl border-slate-200 focus:border-pink-300 focus:ring-4 focus:ring-pink-200/60 px-4 py-3 bg-white placeholder-slate-400 text-slate-800 shadow-xs"
              placeholder="Add a new task..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            <input
              className="sm:col-span-4 rounded-xl border-slate-200 focus:border-blue-300 focus:ring-4 focus:ring-blue-200/60 px-4 py-3 bg-white placeholder-slate-400 text-slate-800 shadow-xs"
              placeholder="Notes (optional)"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
            <select
              className="sm:col-span-2 rounded-xl border-slate-200 focus:border-purple-300 focus:ring-4 focus:ring-purple-200/60 px-3 py-3 bg-white text-slate-700 shadow-xs"
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
            >
              <option value="">Priority</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
            <button
              type="submit"
              className="sm:col-span-12 inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-pink-400 via-purple-400 to-blue-400 text-white font-medium py-3 shadow-sm hover:shadow-md transition-shadow"
            >
              Add Task
            </button>
          </form>
        </section>

        <section className="mt-8">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-slate-700 font-medium">Your Tasks</h2>
            {error && <span className="text-sm text-red-500">{error}</span>}
          </div>

          <div className="space-y-3">
            {loading ? (
              <div className="text-slate-500">Loading...</div>
            ) : tasks.length === 0 ? (
              <div className="text-slate-500">No tasks yet. Add your first one above.</div>
            ) : (
              tasks.map(task => (
                <div key={task.id} className="group flex items-center justify-between bg-white/80 backdrop-blur-sm ring-1 ring-slate-200 rounded-xl p-4 hover:ring-slate-300 transition">
                  <div className="flex items-center gap-3 min-w-0">
                    <button
                      onClick={() => toggleComplete(task)}
                      className={`h-5 w-5 rounded-full border-2 transition-colors ${task.completed ? 'bg-green-400 border-green-400' : 'border-slate-300 hover:border-slate-400'}`}
                      aria-label={task.completed ? 'Mark as incomplete' : 'Mark as complete'}
                    />
                    <div className="min-w-0">
                      <p className={`truncate ${task.completed ? 'line-through text-slate-400' : 'text-slate-800'}`}>{task.title}</p>
                      {task.notes && (
                        <p className="text-sm text-slate-500 truncate">{task.notes}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {task.priority && (
                      <PastelBadge color={task.priority === 'high' ? 'orange' : task.priority === 'medium' ? 'purple' : 'green'}>
                        {task.priority}
                      </PastelBadge>
                    )}
                    <button onClick={() => removeTask(task)} className="text-slate-400 hover:text-red-500 transition">Delete</button>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        <footer className="mt-12 text-center text-slate-400 text-sm">Stay organized in style</footer>
      </div>
    </div>
  )
}

export default App
