/// <reference types="npm:@types/react@18.3.1" />

import * as React from 'npm:react@18.3.1'
import {
  Body, Container, Head, Heading, Html, Preview, Section, Text,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

const SITE_URL = 'https://nexomind.ai'

interface SundayLetterProps {
  body?: string
  weekStartsOn?: string
}

const SundayLetterEmail = ({
  body = '',
  weekStartsOn = '',
}: SundayLetterProps) => {
  // Convert markdown-like content to simple paragraphs for email
  const paragraphs = body.split('\n').filter((line) => line.trim().length > 0)

  return (
    <Html lang="en" dir="ltr">
      <Head />
      <Preview>Your reflection letter is ready</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={card}>
            <Text style={brand}>nexo<span style={brandItalic}>mind</span></Text>
            <Text style={kicker}>( Sunday Letter from Yourself )</Text>
            <Heading style={h1}>
              A letter from <span style={italic}>you.</span>
            </Heading>
            {paragraphs.map((para, i) => (
              <Text key={i} style={text}>{para}</Text>
            ))}
            <Text style={footer}>
              Read the full letter with formatting in your{' '}
              <a href={`${SITE_URL}/app/inbox`} style={link}>NexoMind inbox</a>.
            </Text>
          </Section>
          <Text style={tagline}>( Notice — don't judge )</Text>
        </Container>
      </Body>
    </Html>
  )
}

export const template = {
  component: SundayLetterEmail,
  subject: 'A letter from yourself is waiting',
  displayName: 'Sunday Letter',
  previewData: {
    body: 'This week you noticed a pattern of seeking external validation before trusting your own instincts. Three entries circled back to the same theme: the gap between what you feel and what you say.\n\nYou are learning to pause before reacting. That is progress worth naming.',
    weekStartsOn: '2025-01-06',
  },
} satisfies TemplateEntry

const main = { backgroundColor: '#ffffff', fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif', margin: 0, padding: 0 }
const container = { maxWidth: '560px', margin: '0 auto', padding: '48px 32px 56px' }
const card = { backgroundColor: '#F3F4ED', borderRadius: '20px', padding: '40px 36px' }
const brand = { fontFamily: 'Georgia, "Times New Roman", serif', fontSize: '24px', color: '#111111', letterSpacing: '-0.01em', margin: '0 0 24px' }
const brandItalic = { fontStyle: 'italic' as const, color: '#111111', opacity: 0.55 }
const kicker = { fontSize: '11px', color: '#111111', opacity: 0.5, letterSpacing: '0.2em', textTransform: 'uppercase' as const, margin: '0 0 12px' }
const h1 = { fontFamily: 'Georgia, "Times New Roman", serif', fontSize: '30px', fontWeight: 'normal' as const, lineHeight: '1.15', color: '#111111', letterSpacing: '-0.01em', margin: '0 0 22px' }
const italic = { fontStyle: 'italic' as const }
const text = { fontSize: '15px', color: '#111111', opacity: 0.78, lineHeight: '1.6', margin: '0 0 14px' }
const link = { color: '#111111', textDecoration: 'underline' }
const footer = { fontSize: '12px', color: '#111111', opacity: 0.45, lineHeight: '1.5', margin: '24px 0 0' }
const tagline = { fontSize: '11px', color: '#111111', opacity: 0.45, letterSpacing: '0.18em', textTransform: 'uppercase' as const, margin: '32px 0 0', textAlign: 'center' as const }
