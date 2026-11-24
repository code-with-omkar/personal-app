import { ContactContent } from '../content.models';

// PLACEHOLDER — replace with the Airo copy once captured.
export const CONTACT_CONTENT: ContactContent = {
  seo: { title: 'Contact', description: 'Placeholder contact page description.' },
  heading: 'Contact',
  lead: 'Send a message and you will get a reply soon.',
  email: 'hello@example.com',
  endpoint: null,
  labels: {
    name: 'Name',
    email: 'Email',
    message: 'Message',
    submit: 'Send message',
    sending: 'Sending…',
  },
  messages: {
    success: 'Thanks — your message is on its way.',
    error: 'Something went wrong. Please try again or email directly.',
    required: 'This field is required.',
    invalidEmail: 'Enter a valid email address.',
    messageTooShort: 'Please write at least 10 characters.',
  },
};
