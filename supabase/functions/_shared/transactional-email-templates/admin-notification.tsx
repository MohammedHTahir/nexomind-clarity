/// <reference types="npm:@types/react@18.3.1" />
import * as React from 'npm:react@18.3.1'
import {
  Body, Container, Head, Heading, Html, Preview, Section, Text, Hr,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

interface Props {
  event: 'signup' | 'payment'
  email?: string
  name?: string
  amount?: string
  plan?: string
  userId?: string
}

const AdminNotification = ({ event, email, name, amount, plan, userId }: Props) => {
  const isPayment = event === 'payment'
  return (
    <Html lang="en" dir="ltr">
      <Head />
      <Preview>{isPayment ? `New payment: ${email ?? ''}` : `New signup: ${email ?? ''}`}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={card}>
            <Text style={brand}>nexo<span style={brandItalic}>mind</span> · admin</Text>
            <Heading style={h1}>
              {isPayment ? 'New payment 💸' : 'New signup 👋'}
            </Heading>
            <Hr style={hr} />
            {email && <Text style={row}><strong>Email:</strong> {email}</Text>}
            {name && <Text style={row}><strong>Name:</strong> {name}</Text>}
            {plan && <Text style={row}><strong>Plan:</strong> {plan}</Text>}
            {amount && <Text style={row}><strong>Amount:</strong> {amount}</Text>}
            {userId && <Text style={row}><strong>User ID:</strong> {userId}</Text>}
            <Text style={row}><strong>Time:</strong> {new Date().toUTCString()}</Text>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}

export const template = {
  component: AdminNotification,
  subject: (data: Record<string, any>) =>
    data.event === 'payment'
      ? `💸 New NexoMind payment — ${data.email ?? 'unknown'}`
      : `👋 New NexoMind signup — ${data.email ?? 'unknown'}`,
  to: 'lloydjack276@gmail.com',
  displayName: 'Admin notification',
  previewData: { event: 'signup', email: 'new@user.com', name: 'Sam' },
} satisfies TemplateEntry

const main = { backgroundColor: '#ffffff', fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif', margin: 0, padding: 0 }
const container = { maxWidth: '560px', margin: '0 auto', padding: '40px 24px' }
const card = { backgroundColor: '#F3F4ED', borderRadius: '20px', padding: '32px 28px' }
const brand = { fontFamily: 'Georgia, serif', fontSize: '14px', color: '#111', opacity: 0.7, margin: '0 0 16px', letterSpacing: '0.04em' }
const brandItalic = { fontStyle: 'italic' as const, opacity: 0.55 }
const h1 = { fontFamily: 'Georgia, serif', fontSize: '26px', fontWeight: 'normal' as const, color: '#111', margin: '0 0 8px' }
const hr = { borderColor: 'rgba(0,0,0,0.08)', margin: '16px 0' }
const row = { fontSize: '14px', color: '#111', lineHeight: '1.6', margin: '4px 0' }
