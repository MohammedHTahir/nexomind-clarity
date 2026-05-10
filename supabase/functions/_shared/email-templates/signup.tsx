/// <reference types="npm:@types/react@18.3.1" />

import * as React from 'npm:react@18.3.1'
import {
  Body, Button, Container, Head, Heading, Html, Link, Preview, Section, Text,
} from 'npm:@react-email/components@0.0.22'
import { main, container, card, brand, brandItalic, h1, italic, text, link, button, footer, tagline } from './_styles.ts'

interface SignupEmailProps {
  siteName: string
  siteUrl: string
  recipient: string
  confirmationUrl: string
}

export const SignupEmail = ({ siteName, recipient, confirmationUrl }: SignupEmailProps) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>Confirm your email to begin your reflection.</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={card}>
          <Text style={brand}>nexo<span style={brandItalic}>mind</span></Text>
          <Heading style={h1}>
            Begin your <span style={italic}>clarity.</span>
          </Heading>
          <Text style={text}>
            Welcome to {siteName}. Confirm your email ({recipient}) to open your private space for reflection.
          </Text>
          <Button style={button} href={confirmationUrl}>Confirm email</Button>
          <Text style={footer}>
            If you didn't create an account, you can safely ignore this email.
          </Text>
        </Section>
        <Text style={tagline}>( Private by design )</Text>
      </Container>
    </Body>
  </Html>
)

export default SignupEmail
