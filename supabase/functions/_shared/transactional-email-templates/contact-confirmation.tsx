/// <reference types="npm:@types/react@18.3.1" />

import * as React from 'npm:react@18.3.1'
import {
  Body, Container, Head, Heading, Html, Preview, Section, Text,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

const SITE_NAME = 'NexoMind'

interface ContactConfirmationProps {
  name?: string
  message?: string
}

const ContactConfirmationEmail = ({ name, message }: ContactConfirmationProps) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>We received your message — thanks for reaching out.</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={card}>
          <Text style={brand}>nexo<span style={brandItalic}>mind</span></Text>
          <Heading style={h1}>
            {name ? <>Thanks, <span style={italic}>{name}.</span></> : <>Message <span style={italic}>received.</span></>}
          </Heading>
          <Text style={text}>
            We got your note and will write back within a day or two. Real human,
            no autoresponder loop.
          </Text>
          {message ? (
            <Section style={quote}>
              <Text style={quoteText}>"{message.slice(0, 600)}"</Text>
            </Section>
          ) : null}
          <Text style={footer}>
            If anything was urgent, just reply to this email — it lands in our inbox.
          </Text>
        </Section>
        <Text style={tagline}>( Private by design )</Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: ContactConfirmationEmail,
  subject: `Thanks for contacting ${SITE_NAME}`,
  displayName: 'Contact confirmation',
  previewData: { name: 'Sam', message: 'Loving the product. Quick question about exporting entries…' },
} satisfies TemplateEntry

const main = {
  backgroundColor: '#ffffff',
  fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
  margin: 0,
  padding: 0,
}
const container = { maxWidth: '560px', margin: '0 auto', padding: '48px 32px 56px' }
const card = { backgroundColor: '#F3F4ED', borderRadius: '20px', padding: '40px 36px' }
const brand = {
  fontFamily: 'Georgia, "Times New Roman", serif',
  fontSize: '24px',
  color: '#111111',
  letterSpacing: '-0.01em',
  margin: '0 0 32px',
}
const brandItalic = { fontStyle: 'italic' as const, color: '#111111', opacity: 0.55 }
const h1 = {
  fontFamily: 'Georgia, "Times New Roman", serif',
  fontSize: '32px',
  fontWeight: 'normal' as const,
  lineHeight: '1.15',
  color: '#111111',
  letterSpacing: '-0.01em',
  margin: '0 0 18px',
}
const italic = { fontStyle: 'italic' as const }
const text = {
  fontSize: '15px',
  color: '#111111',
  opacity: 0.75,
  lineHeight: '1.6',
  margin: '0 0 20px',
}
const quote = {
  backgroundColor: '#ffffff',
  borderRadius: '12px',
  border: '1px solid rgba(0,0,0,0.08)',
  padding: '16px 20px',
  margin: '0 0 24px',
}
const quoteText = {
  fontFamily: 'Georgia, "Times New Roman", serif',
  fontStyle: 'italic' as const,
  fontSize: '14px',
  color: '#111111',
  opacity: 0.7,
  lineHeight: '1.6',
  margin: 0,
}
const footer = {
  fontSize: '12px',
  color: '#111111',
  opacity: 0.4,
  lineHeight: '1.5',
  margin: '24px 0 0',
}
const tagline = {
  fontSize: '11px',
  color: '#111111',
  opacity: 0.45,
  letterSpacing: '0.18em',
  textTransform: 'uppercase' as const,
  margin: '32px 0 0',
  textAlign: 'center' as const,
}
