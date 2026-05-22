/// <reference types="npm:@types/react@18.3.1" />

import * as React from 'npm:react@18.3.1'
import {
  Body, Button, Container, Head, Heading, Html, Preview, Section, Text,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

const SITE_URL = 'https://nexomind.ai'

interface PatternInterruptProps {
  name?: string | null
  dayName?: string
  hour?: number
  themeLabel?: string | null
  sampleSize?: number
}

const formatHour = (h?: number) => {
  if (h == null) return 'this hour'
  const period = h >= 12 ? 'pm' : 'am'
  const hr = ((h + 11) % 12) + 1
  return `${hr}${period}`
}

const PatternInterruptEmail = ({
  name,
  dayName = 'today',
  hour,
  themeLabel,
  sampleSize = 0,
}: PatternInterruptProps) => {
  const greeting = name ? `Hey ${name},` : 'Hey,'
  const themeLine = themeLabel
    ? `Often it circles around ${themeLabel}.`
    : 'Often the same loop comes back.'
  const stat = sampleSize >= 3
    ? `${sampleSize} of your last entries landed around ${dayName} ${formatHour(hour)}.`
    : `This window keeps coming up in your reflections.`

  return (
    <Html lang="en" dir="ltr">
      <Head />
      <Preview>{`A pattern just opened. Want to write it out before it grips?`}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={card}>
            <Text style={brand}>nexo<span style={brandItalic}>mind</span></Text>
            <Text style={kicker}>( Pattern interrupt )</Text>
            <Heading style={h1}>
              A loop usually <span style={italic}>opens</span> here.
            </Heading>
            <Text style={text}>{greeting}</Text>
            <Text style={text}>{stat} {themeLine}</Text>
            <Text style={text}>
              You don't have to spiral with it. Three quiet minutes of writing
              is usually enough to let the air out.
            </Text>
            <Button style={button} href={`${SITE_URL}/app/journal`}>Write it out</Button>
            <Text style={footer}>
              Calm nudges only. Turn these off anytime in Settings.
            </Text>
          </Section>
          <Text style={tagline}>( Notice — don't judge )</Text>
        </Container>
      </Body>
    </Html>
  )
}

export const template = {
  component: PatternInterruptEmail,
  subject: 'A loop usually opens around now — want to write it out?',
  displayName: 'Pattern interrupt',
  previewData: {
    name: 'Sam',
    dayName: 'Sunday',
    hour: 20,
    themeLabel: 'work validation',
    sampleSize: 6,
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
const button = { backgroundColor: '#111111', color: '#ffffff', fontSize: '14px', fontWeight: 500 as const, borderRadius: '999px', padding: '14px 28px', textDecoration: 'none', display: 'inline-block', margin: '20px 0 24px' }
const footer = { fontSize: '12px', color: '#111111', opacity: 0.45, lineHeight: '1.5', margin: '24px 0 0' }
const tagline = { fontSize: '11px', color: '#111111', opacity: 0.45, letterSpacing: '0.18em', textTransform: 'uppercase' as const, margin: '32px 0 0', textAlign: 'center' as const }
