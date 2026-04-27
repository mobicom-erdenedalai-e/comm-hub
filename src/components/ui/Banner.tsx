type Props = { type: 'error' | 'warning'; message: string; action?: { label: string; href: string } }

export default function Banner({ type, message, action }: Props) {
  const bg = type === 'error' ? '#fff0f0' : '#fff8e1'
  const border = type === 'error' ? '#ffb3b3' : '#f5c842'
  return (
    <div style={{ background: bg, border: `1px solid ${border}`, borderRadius: '6px', padding: '10px 14px', fontSize: '13px', marginBottom: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <span>{message}</span>
      {action && <a href={action.href} style={{ color: '#3b4ef8', fontWeight: 600, fontSize: '12px' }}>{action.label}</a>}
    </div>
  )
}
