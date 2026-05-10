// Shared NexoMind email styles
export const main = {
  backgroundColor: '#ffffff',
  fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
  margin: 0,
  padding: 0,
}
export const container = {
  maxWidth: '560px',
  margin: '0 auto',
  padding: '48px 32px 56px',
}
export const card = {
  backgroundColor: '#F3F4ED',
  borderRadius: '20px',
  padding: '40px 36px',
}
export const brand = {
  fontFamily: 'Georgia, "Times New Roman", serif',
  fontSize: '24px',
  color: '#111111',
  letterSpacing: '-0.01em',
  margin: '0 0 32px',
  textAlign: 'left' as const,
}
export const brandItalic = {
  fontStyle: 'italic' as const,
  color: '#111111',
  opacity: 0.55,
}
export const h1 = {
  fontFamily: 'Georgia, "Times New Roman", serif',
  fontSize: '32px',
  fontWeight: 'normal' as const,
  lineHeight: '1.15',
  color: '#111111',
  letterSpacing: '-0.01em',
  margin: '0 0 18px',
}
export const italic = { fontStyle: 'italic' as const }
export const text = {
  fontSize: '15px',
  color: '#111111',
  opacity: 0.75,
  lineHeight: '1.6',
  margin: '0 0 20px',
}
export const link = { color: '#111111', textDecoration: 'underline' }
export const button = {
  backgroundColor: '#111111',
  color: '#ffffff',
  fontSize: '14px',
  fontWeight: 500 as const,
  borderRadius: '999px',
  padding: '14px 28px',
  textDecoration: 'none',
  display: 'inline-block',
  margin: '8px 0 24px',
}
export const codeStyle = {
  fontFamily: '"Courier New", Courier, monospace',
  fontSize: '28px',
  fontWeight: 'bold' as const,
  letterSpacing: '0.2em',
  color: '#111111',
  backgroundColor: '#ffffff',
  border: '1px solid rgba(0,0,0,0.08)',
  borderRadius: '12px',
  padding: '16px 20px',
  textAlign: 'center' as const,
  margin: '0 0 24px',
}
export const footer = {
  fontSize: '12px',
  color: '#111111',
  opacity: 0.4,
  lineHeight: '1.5',
  margin: '24px 0 0',
}
export const tagline = {
  fontSize: '11px',
  color: '#111111',
  opacity: 0.45,
  letterSpacing: '0.18em',
  textTransform: 'uppercase' as const,
  margin: '32px 0 0',
  textAlign: 'center' as const,
}
