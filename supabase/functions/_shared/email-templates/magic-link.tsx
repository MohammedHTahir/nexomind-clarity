/// <reference types="npm:@types/react@18.3.1" />

import * as React from 'npm:react@18.3.1'
import {
  Body, Button, Container, Head, Heading, Html, Preview, Section, Text,
} from 'npm:@react-email/components@0.0.22'
import { main, container, card, brand, brandItalic, h1, italic, text, button, footer, tagline } from './_styles.ts'

interface MagicLinkEmailProps {
  siteName: string
  confirmationUrl: string
}

export const MagicLinkEmail = ({ confirmationUrl }: MagicLinkEmailProps) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>Your sign-in link for NexoMind.</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={card}>
          <Text style={brand}>nexo<span style={brandItalic}>mind</span></Text>
          <Heading style={h1}>
            Continue your <span style={italic}>reflection.</span>
          </Heading>
          <Text style={text}>
            Tap below to sign in. The link will expire shortly for your safety.
          </Text>
          <Button style={button} href={confirmationUrl}>Sign in</Button>
          <Text style={footer}>
            If you didn't request this link, you can safely ignore this email.
          </Text>
        </Section>
        <Text style={tagline}>( Private by design )</Text>
      </Container>
    </Body>
  </Html>
)

export default MagicLinkEmail
