/// <reference types="npm:@types/react@18.3.1" />

import * as React from 'npm:react@18.3.1'
import {
  Body, Button, Container, Head, Heading, Html, Preview, Section, Text,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

const SITE_NAME = 'NexoMind'
const SITE_URL = 'https://nexomind.ai'

interface WelcomeEmailProps {
  name?: string
}

const WelcomeEmail = ({ name }: WelcomeEmailProps) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>Welcome to NexoMind — your private space for reflection.</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={card}>
          <Text style={brand}>nexo<span style={brandItalic}>mind</span></Text>
          <Heading style={h1}>
            {name ? <>Welcome, <span style={italic}>{name}.</span></> : <>Welcome <span style={italic}>in.</span></>}
          </Heading>
          <Text style={text}>
            You now have a quiet, private space to think out loud — and a calm
            companion to help untangle the noise.
          </Text>
          <Text style={text}>
            Three gentle ways to start:
          </Text>
          <Text style={listItem}>1. Write what's on your mind — no structure needed.</Text>
          <Text style={listItem}>2. Ask a question you've been circling.</Text>
          <Text style={listItem}>3. Re-read past entries to spot patterns.</Text>
          <Button style={button} href={`${SITE_URL}/app`}>Open NexoMind</Button>
          <Text style={footer}>
            Reply to this email anytime — a real human reads everything.
          </Text>
        </Section>
        <Text style={tagline}>( Private by design )</Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: WelcomeEmail,
  subject: 'Welcome to NexoMind',
  displayName: 'Welcome',
  previewData: { name: 'Sam' },
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
  margin: '0 0 14px',
}
const listItem = {
  fontSize: '15px',
  color: '#111111',
  opacity: 0.8,
  lineHeight: '1.6',
  margin: '0 0 6px',
}
const button = {
  backgroundColor: '#111111',
  color: '#ffffff',
  fontSize: '14px',
  fontWeight: 500 as const,
  borderRadius: '999px',
  padding: '14px 28px',
  textDecoration: 'none',
  display: 'inline-block',
  margin: '20px 0 24px',
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
