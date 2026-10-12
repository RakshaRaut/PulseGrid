import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import AuthLayout from '../components/auth/AuthLayout.jsx'
import { Field, Input, Button } from '../components/ui/forms.jsx'
import { useAuth } from '../context/auth.jsx'
import { useToast } from '../context/toast.jsx'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export default function Login() {
  const { login } = useAuth()
  const { notify } = useToast()
  const navigate = useNavigate()
  const location = useLocation()
  const redirectTo = location.state?.from || '/dashboard'

  const [values, setValues] = useState({ email: '', password: '' })
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [serverError, setServerError] = useState(null)
  const [remember, setRemember] = useState(true)

  const validate = (v) => {
    const e = {}
    if (!v.email.trim()) e.email = 'Email is required.'
    else if (!EMAIL_RE.test(v.email.trim())) e.email = 'Enter a valid email address.'
    if (!v.password) e.password = 'Password is required.'
    else if (v.password.length < 6) e.password = 'Password must be at least 6 characters.'
    return e
  }

  const handleChange = (e) => {
    const next = { ...values, [e.target.name]: e.target.value }
    setValues(next)
    setErrors(validate(next))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const validation = validate(values)
    setErrors(validation)
    setServerError(null)
    if (Object.keys(validation).length > 0) return

    setSubmitting(true)
    try {
      await login(values)
      notify(`Welcome back!`, 'success')
      navigate(redirectTo, { replace: true })
    } catch (err) {
      setServerError(err.message)
      notify(err.message, 'error')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AuthLayout
      title="Sign in to PulseGrid"
      subtitle="Enter your credentials to access your device fleet."
      footer={
        <>
          Don&apos;t have an account?{' '}
          <Link to="/register" className="font-semibold text-indigo-300 hover:text-indigo-200">
            Create one
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="mt-6 space-y-4" noValidate>
        {serverError && (
          <div role="alert" className="rounded-xl border border-rose-500/40 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
            {serverError}
            <button type="button" className="mt-1 block text-xs text-rose-300/80 underline" onClick={() => setServerError(null)}>
              dismiss
            </button>
          </div>
        )}
        <Field label="Email" htmlFor="email" error={errors.email}>
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="you@company.com"
            value={values.email}
            onChange={handleChange}
            invalid={!!errors.email}
          />
        </Field>
        <Field label="Password" htmlFor="password" error={errors.password}>
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            placeholder="••••••••"
            value={values.password}
            onChange={handleChange}
            invalid={!!errors.password}
          />
        </Field>
        <div className="flex items-center justify-between gap-4">
          <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-400">
            <input
              type="checkbox"
              checked={remember}
              onChange={(e) => setRemember(e.target.checked)}
              className="h-4 w-4 rounded border-border bg-surface-2 text-accent"
            />
            Remember me
          </label>
          <Link to="/login" className="text-sm font-medium text-indigo-300 hover:text-indigo-200">
            Forgot password?
          </Link>
        </div>
        <Button type="submit" size="lg" className="w-full" loading={submitting}>
          {submitting ? 'Signing in…' : 'Sign in'}
        </Button>
      </form>
      <div className="mt-6 rounded-xl border border-dashed border-border bg-surface-2/60 px-4 py-3 text-xs text-slate-400">
        <p className="font-semibold text-slate-300">Demo credentials</p>
        <p className="mt-1">Email: demo@pulsegrid.io · Password: demo1234</p>
      </div>
    </AuthLayout>
  )
}
