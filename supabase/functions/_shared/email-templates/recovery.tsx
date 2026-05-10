/// <reference types="npm:@types/react@18.3.1" />

import * as React from 'npm:react@18.3.1'
import {
  Body, Button, Container, Head, Heading, Html, Preview, Section, Text,
} from 'npm:@react-email/components@0.0.22'
import { main, container, card, brand, brandItalic, h1, italic, text, button, footer, tagline } from './_styles.ts'

interface RecoveryEmailProps {
  siteName: string
  confirmationUrl: string
}

export const RecoveryEmail = ({ confirmationUrl }: RecoveryEmailProps) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>Choose a new passphrase for NexoMind.</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={card}>
          <Text style={brand}>nexo<span style={brandItalic}>mind</span></Text>
          <Heading style={h1}>
            Reset your <span style={italic}>passphrase.</span>
          </Heading>
          <Text style={text}>
            We received a request to reset your password. Tap the button below to choose a new one — the link expires shortly.
          </Text>
          <Button style={button} href={confirmationUrl}>Set new password</Button>
          <Text style={footer}>
            If you didn't ask for this, you can safely ignore the email. Your password won't change.
          </Text>
        </Section>
        <Text style={tagline}>( Private by design )</Text>
      </Container>
    </Body>
  </Html>
)

export default RecoveryEmail
