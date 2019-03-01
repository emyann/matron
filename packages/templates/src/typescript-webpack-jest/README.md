# Jive Realtime Events SDK

> Parse Realtime messages to feed a Call State Machine

---

- [Jive Realtime Events SDK](#jive-realtime-events-sdk)
  - [Getting started](#getting-started)
    - [Installation](#installation)
    - [Example](#example)
  - [Docs](#docs)
    - [1. State Machine](#1-state-machine)
    - [2. Realtime Manager](#2-realtime-manager)
    - [3. Adapters](#3-adapters)

## Getting started

### Installation

```sh
npm install --save @jive/realtime-events
```

### Example

```typescript
import { ICallEventsAdapter, RealtimeManager, Call } from '@jive/realtime-events';

// Create an adapter to be attached to the State Machine Lifecycle
const adapter: ICallEventsAdapter = {
  startIncomingCall: (call: Call) => {
    console.log('Receiving Incoming Call');
  },
  startIncomingConversation: (call: Call) => {
    console.log('Answered to an incoming call');
  },
  timeoutIncomingCall: (call: Call) => {
    console.log('Does not answer to an incoming call');
  },
  startOutgoingCall: (call: Call) => {
    console.log('Executing an Outgoing call');
  },
  startOutgoingConversation: (call: Call) => {
    console.log('Recipient picked up the call');
  },
  timeoutOutgoingCall: (call: Call) => {
    console.log('Recipient has not picked up the call');
  },
  endConversation: (call: Call) => {
    console.log('The call is ended');
  }
};

// Create a manager by providing the user access token and the custom adapter
const manager = new RealtimeManager(accessToken, adapter);

// Start to listen to Realtime API, and keep-alive events
manager.start();

// Start to listen for a line events
const line = {
  id: '267c0d06-2ff2-4dcb-857b-2b7123467b84',
  number: '1234',
  name: 'Yann Renaudin',
  organizationId: '0127d974-f9f3-0704-2dee-000100420001'
};
manager.addSubscription(line);
```

## Docs

### 1. State Machine

### 2. Realtime Manager

### 3. Adapters
