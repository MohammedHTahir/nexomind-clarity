/// <reference types="npm:@types/react@18.3.1" />

import * as React from 'npm:react@18.3.1'
import {
  Body, Button, Container, Head, Heading, Html, Link, Preview, Section, Text,
} from 'npm:@react-email/components@0.0.22'
import { main, container, card, brand, brandItalic, h1, italic, text, link, button, footer, tagline } from './_styles.ts'

interface EmailChangeEmailProps {
  siteName: string
  oldEmail: string
  email: string
  newEmail: string
  confirmationUrl: string
}

export const EmailChangeEmail = ({ oldEmail, newEmail, confirmationUrl }: EmailChangeEmailProps) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>Confirm your new email address.</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={card}>
          <Text style={brand}>nexo<span style={brandItalic}>mind</span></Text>
          <Heading style={h1}>
            Confirm your new <span style={italic}>email.</span>
          </Heading>
          <Text style={text}>
            You requested to change your address from{' '}
            <Link href={`mailto:${oldEmail}`} style={link}>{oldEmail}</Link>{' '}to{' '}
            <Link href={`mailto:${newEmail}`} style={link}>{newEmail}</Link>.
          </Text>
          <Button style={button} href={confirmationUrl}>Confirm change</Button>
          <Text style={footer}>
            If you didn't request this, please secure your account immediately.
          </Text>
        </Section>
        <Text style={tagline}>( Private by design )</Text>
      </Container>
    </Body>
  </Html>
)

export default EmailChangeEmail
