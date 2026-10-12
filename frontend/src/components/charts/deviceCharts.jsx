import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  BarChart,
  Bar,
  Cell,
  RadialBarChart,
  RadialBar,
  PolarAngleAxis,
} from 'recharts'

const AXIS_STYLE = { fontSize: 11, fill: '#64748b' }
const GRID_COLOR = '#2a3b5f'

function ChartTooltip({ active, payload, label, unit }) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-lg border border-border bg-surface px-3 py-2 text-xs shadow-xl shadow-black/50">
      <p className="mb-1 font-semibold text-white">{label}</p>
      {payload.map((p) => (
        <p key={p.dataKey} style={{ color: p.color }}>
          {p.name}: <span className="font-semibold">{p.value ?? '—'}</span>
          {p.value != null ? unit : ''}
        </p>
      ))}
    </div>
  )
}

export function TempHumidityChart({ data }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
        <defs>
          <linearGradient id="gradTemp" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#f97316" stopOpacity={0.5} />
            <stop offset="100%" stopColor="#f97316" stopOpacity={0.02} />
          </linearGradient>
          <linearGradient id="gradHum" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#38bdf8" stopOpacity={0.45} />
            <stop offset="100%" stopColor="#38bdf8" stopOpacity={0.02} />
          </linearGradient>
        </defs>
        <CartesianGrid stroke={GRID_COLOR} strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="time" tick={AXIS_STYLE} tickLine={false} axisLine={false} minTickGap={40} />
        <YAxis tick={AXIS_STYLE} tickLine={false} axisLine={false} width={40} />
        <Tooltip content={<ChartTooltip />} />
        <Area
          type="monotone"
          dataKey="temperature"
          name="Temperature"
          unit="°C"
          stroke="#f97316"
          strokeWidth={2}
          fill="url(#gradTemp)"
          connectNulls
          dot={false}
          activeDot={{ r: 4 }}
        />
        <Area
          type="monotone"
          dataKey="humidity"
          name="Humidity"
          unit="%"
          stroke="#38bdf8"
          strokeWidth={2}
          fill="url(#gradHum)"
          connectNulls
          dot={false}
          activeDot={{ r: 4 }}
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}

export function BatteryBarChart({ data }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
        <CartesianGrid stroke={GRID_COLOR} strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="time" tick={AXIS_STYLE} tickLine={false} axisLine={false} minTickGap={40} />
        <YAxis domain={[0, 100]} tick={AXIS_STYLE} tickLine={false} axisLine={false} width={40} unit="%" />
        <Tooltip content={<ChartTooltip unit="%" />} cursor={{ fill: 'rgba(99,102,241,0.08)' }} />
        <Bar dataKey="battery" name="Battery" radius={[4, 4, 0, 0]} maxBarSize={14}>
          {data.map((d, i) => (
            <Cell
              key={i}
              fill={d.battery > 50 ? '#34d399' : d.battery > 20 ? '#fbbf24' : '#f87171'}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}

export function BatteryGauge({ value, size = 140 }) {
  const pct = Math.max(0, Math.min(100, value ?? 0))
  return (
    <ResponsiveContainer width="100%" height={size}>
      <RadialBarChart innerRadius="70%" outerRadius="100%" data={[{ name: 'battery', value: pct }]} startAngle={220} endAngle={-40}>
        <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
        <RadialBar dataKey="value" cornerRadius={8} fill={pct > 50 ? '#34d399' : pct > 20 ? '#fbbf24' : '#f87171'} background={{ fill: '#2a3b5f' }} />
      </RadialBarChart>
    </ResponsiveContainer>
  )
}
