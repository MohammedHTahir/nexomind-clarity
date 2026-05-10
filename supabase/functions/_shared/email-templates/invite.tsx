/// <reference types="npm:@types/react@18.3.1" />

import * as React from 'npm:react@18.3.1'
import {
  Body, Button, Container, Head, Heading, Html, Preview, Section, Text,
} from 'npm:@react-email/components@0.0.22'
import { main, container, card, brand, brandItalic, h1, italic, text, button, footer, tagline } from './_styles.ts'

interface InviteEmailProps {
  siteName: string
  siteUrl: string
  confirmationUrl: string
}

export const InviteEmail = ({ siteName, confirmationUrl }: InviteEmailProps) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>You've been invited to {siteName}.</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={card}>
          <Text style={brand}>nexo<span style={brandItalic}>mind</span></Text>
          <Heading style={h1}>
            You're <span style={italic}>invited.</span>
          </Heading>
          <Text style={text}>
            Someone invited you to join {siteName} — a quiet space to reflect, write, and think clearly. Accept below to create your account.
          </Text>
          <Button style={button} href={confirmationUrl}>Accept invitation</Button>
          <Text style={footer}>
            If you weren't expecting this, you can safely ignore the email.
          </Text>
        </Section>
        <Text style={tagline}>( Private by design )</Text>
      </Container>
    </Body>
  </Html>
)

export default InviteEmail
