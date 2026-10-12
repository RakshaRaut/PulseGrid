import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import AuthLayout from '../components/auth/AuthLayout.jsx'
import { Field, Input, Button } from '../components/ui/forms.jsx'
import { useAuth } from '../context/auth.jsx'
import { useToast } from '../context/toast.jsx'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function passwordStrength(pw) {
  let score = 0
  if (pw.length >= 8) score++
  if (/[a-z]/.test(pw) && /[A-Z]/.test(pw)) score++
  if (/\d/.test(pw)) score++
  if (/[^A-Za-z0-9]/.test(pw)) score++
  return Math.min(score, 4)
}

const STRENGTH_META = [
  { label: 'Too weak', color: 'bg-rose-500', width: 'w-1/4' },
  { label: 'Weak', color: 'bg-orange-500', width: 'w-2/4' },
  { label: 'Good', color: 'bg-amber-400', width: 'w-3/4' },
  { label: 'Strong', color: 'bg-emerald-400', width: 'w-full' },
  { label: 'Excellent', color: 'bg-emerald-500', width: 'w-full' },
]

export default function Register() {
  const { register } = useAuth()
  const { notify } = useToast()
  const navigate = useNavigate()

  const [values, setValues] = useState({ name: '', email: '', password: '', confirm: '' })
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [serverError, setServerError] = useState(null)

  const strength = useMemo(() => passwordStrength(values.password), [values.password])
  const meta = STRENGTH_META[strength]

  const validate = (v) => {
    const e = {}
    if (!v.name.trim()) e.name = 'Name is required.'
    else if (v.name.trim().length < 2) e.name = 'Name must be at least 2 characters.'
    if (!v.email.trim()) e.email = 'Email is required.'
    else if (!EMAIL_RE.test(v.email.trim())) e.email = 'Enter a valid email address.'
    if (!v.password) e.password = 'Password is required.'
    else if (v.password.length < 8) e.password = 'Use at least 8 characters.'
    if (!v.confirm) e.confirm = 'Confirm your password.'
    else if (v.confirm !== v.password) e.confirm = 'Passwords do not match.'
    return e
  }

  const handleChange = (e) => {
    const next = { ...values, [e.target.name]: e.target.value }
    setValues(next)
    setErrors(validate(next))
  }

  const handleSubmit = async (ev) => {
    ev.preventDefault()
    const validation = validate(values)
    setErrors(validation)
    setServerError(null)
    if (Object.keys(validation).length > 0) return
    setSubmitting(true)
    try {
      await register({ name: values.name.trim(), email: values.email.trim(), password: values.password })
      notify('Account created — welcome to PulseGrid!', 'success')
      navigate('/dashboard', { replace: true })
    } catch (err) {
      setServerError(err.message)
      notify(err.message, 'error')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AuthLayout
      title="Create your account"
      subtitle="Set up a workspace to start monitoring your devices."
      footer={
        <>
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-indigo-300 hover:text-indigo-200">
            Sign in
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="mt-6 space-y-4" noValidate>
        {serverError && (
          <div role="alert" className="rounded-xl border border-rose-500/40 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
            {serverError}
          </div>
        )}
        <Field label="Full name" htmlFor="name" error={errors.name}>
          <Input
            id="name"
            name="name"
            autoComplete="name"
            placeholder="Ada Lovelace"
            value={values.name}
            onChange={handleChange}
            invalid={!!errors.name}
          />
        </Field>
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
        <Field label="Password" htmlFor="new-password" error={errors.password}>
          <Input
            id="new-password"
            name="password"
            type="password"
            autoComplete="new-password"
            placeholder="At least 8 characters"
            value={values.password}
            onChange={handleChange}
            invalid={!!errors.password}
          />
          {values.password && (
            <div className="mt-2" aria-live="polite">
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-700/60">
                <div className={`h-full rounded-full transition-all duration-300 ${meta.color} ${meta.width}`} />
              </div>
              <p className="mt-1 text-xs text-slate-400">Strength: {meta.label}</p>
            </div>
          )}
        </Field>
        <Field label="Confirm password" htmlFor="confirm-password" error={errors.confirm}>
          <Input
            id="confirm-password"
            name="confirm"
            type="password"
            autoComplete="new-password"
            placeholder="Re-enter password"
            value={values.confirm}
            onChange={handleChange}
            invalid={!!errors.confirm}
          />
        </Field>
        <label className="flex items-start gap-2 text-xs text-slate-400">
          <input required type="checkbox" className="mt-0.5 h-4 w-4 rounded border-border bg-surface-2 text-accent" />
          I agree to the Terms of Service and Privacy Policy.
        </label>
        <Button type="submit" size="lg" className="w-full" loading={submitting}>
          {submitting ? 'Creating account…' : 'Create account'}
        </Button>
      </form>
    </AuthLayout>
  )
}
