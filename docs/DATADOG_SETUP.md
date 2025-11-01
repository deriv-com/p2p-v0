# Datadog RUM Integration Setup

This document explains how to set up and use Datadog Real User Monitoring (RUM) in the P2P V2 application.

## Overview

Datadog RUM has been integrated to provide:
- Real-time performance monitoring
- Error tracking and debugging
- User session replay
- Custom action tracking
- Resource and API call monitoring

## Environment Variables

To enable Datadog RUM, add the following environment variables to your Vercel project:

### Required Variables

- `NEXT_PUBLIC_DATADOG_APPLICATION_ID` - Your Datadog application ID
- `NEXT_PUBLIC_DATADOG_CLIENT_TOKEN` - Your Datadog client token

### Optional Variables

- `NEXT_PUBLIC_DATADOG_SITE` - Datadog site (default: `datadoghq.com`)
  - US1: `datadoghq.com`
  - US3: `us3.datadoghq.com`
  - US5: `us5.datadoghq.com`
  - EU: `datadoghq.eu`
  - AP1: `ap1.datadoghq.com`
  
- `NEXT_PUBLIC_DATADOG_SERVICE` - Service name (default: `p2p-v2`)
- `NEXT_PUBLIC_DATADOG_ENV` - Environment name (default: uses `NEXT_PUBLIC_BRANCH` or `development`)

## Getting Your Datadog Credentials

1. Log in to your Datadog account
2. Navigate to **UX Monitoring** > **RUM Applications**
3. Create a new application or select an existing one
4. Copy the **Application ID** and **Client Token**
5. Add these values to your Vercel project environment variables

## Features

### Automatic Tracking

The integration automatically tracks:
- Page views and navigation
- User interactions (clicks, form submissions)
- JavaScript errors
- Network requests to configured API endpoints
- Long tasks and performance metrics

### Session Replay

Session replay is enabled with a 20% sample rate. This allows you to:
- Watch user sessions to understand behavior
- Debug issues by seeing exactly what users experienced
- Identify UX problems

### Privacy

The integration includes privacy features:
- User input is masked by default
- Sensitive query parameters (token, password, api_key, secret) are redacted
- Only configured API endpoints are tracked

## Usage Examples

### Setting User Context

Track user information for better debugging:

\`\`\`typescript
import { setDatadogUser } from '@/lib/datadog'

// After user logs in
setDatadogUser(
  userId,
  userEmail,
  userName
)
\`\`\`

### Adding Custom Context

Add global context that will be included with all events:

\`\`\`typescript
import { addDatadogContext } from '@/lib/datadog'

addDatadogContext('userType', 'premium')
addDatadogContext('feature', 'p2p-trading')
\`\`\`

### Tracking Custom Actions

Track important user actions:

\`\`\`typescript
import { trackDatadogAction } from '@/lib/datadog'

// Track a button click
trackDatadogAction('order-submitted', {
  orderId: '12345',
  amount: 100,
  currency: 'USD'
})
\`\`\`

### Tracking Custom Errors

Manually track errors with context:

\`\`\`typescript
import { trackDatadogError } from '@/lib/datadog'

try {
  // Some operation
} catch (error) {
  trackDatadogError(error as Error, {
    component: 'OrderSidebar',
    action: 'submitOrder'
  })
}
\`\`\`

## Configuration

The Datadog RUM configuration is located in `lib/datadog.ts`. Key settings include:

- **sessionSampleRate**: 100% (all sessions are tracked)
- **sessionReplaySampleRate**: 20% (20% of sessions are recorded)
- **trackUserInteractions**: Enabled
- **trackResources**: Enabled
- **trackLongTasks**: Enabled
- **defaultPrivacyLevel**: `mask-user-input`

## Monitored API Endpoints

The integration automatically tracks API calls to:
- `NEXT_PUBLIC_BASE_URL`
- `NEXT_PUBLIC_CORE_URL`
- `NEXT_PUBLIC_CASHIER_URL`

## Testing

Comprehensive unit tests are included:
- `__tests__/lib/datadog.test.ts` - Tests for utility functions
- `__tests__/components/datadog-rum-init.test.tsx` - Tests for initialization component

Run tests with:
\`\`\`bash
npm test
\`\`\`

## Troubleshooting

### Datadog Not Initializing

Check the browser console for warnings:
- Missing environment variables will show: `[Datadog RUM] Missing required environment variables`
- Initialization errors will show: `[Datadog RUM] Initialization failed`

### No Data in Datadog Dashboard

1. Verify environment variables are set correctly in Vercel
2. Check that the application ID and client token are valid
3. Ensure the Datadog site matches your account region
4. Check browser console for any errors

### Session Replay Not Working

1. Verify session replay is enabled in your Datadog RUM application settings
2. Check that the sample rate is appropriate (currently 20%)
3. Ensure privacy settings allow the content you want to record

## Best Practices

1. **Set User Context Early**: Call `setDatadogUser()` as soon as user information is available
2. **Track Important Actions**: Use `trackDatadogAction()` for key user flows
3. **Add Relevant Context**: Use `addDatadogContext()` to add business-specific information
4. **Handle Errors Gracefully**: Use `trackDatadogError()` in catch blocks for better error tracking
5. **Monitor Performance**: Regularly check Datadog dashboards for performance issues

## Security Considerations

- Never log sensitive information (passwords, tokens, API keys)
- The integration automatically redacts sensitive query parameters
- User input is masked by default in session replays
- Only track API endpoints you control

## Support

For issues with:
- **Datadog Integration**: Check this documentation and the test files
- **Datadog Platform**: Visit [Datadog Support](https://docs.datadoghq.com/help/)
- **Application Issues**: Contact the development team
