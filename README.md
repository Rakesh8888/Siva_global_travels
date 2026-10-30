# SIVA Multi Services

Mobile-friendly single-page website for SIVA Multi Services.

## Website sections
- Home page and service navigation
- Travel and tour enquiries
- Visa-assistance information
- Flight search and enquiry interface
- Overseas and cruise-career assistance information
- Contact and WhatsApp enquiry links
- AI assistance interface
- English and Telugu content support
- Light and dark appearance options

## Project files
- `index.html`: website interface and client-side behaviour
- `worker.js`: server-side API routes and integrations
- `package.json`: Cloudflare Worker project configuration

## Flight search
The website uses a server-side Cloudflare Worker endpoint for flight-search requests. Live results depend on a valid Duffel live access token being configured as the Worker secret `DUFFEL_ACCESS_TOKEN`. Keep API tokens on the server. Never put private API keys in `index.html`, public repositories, or browser code.

Worker health endpoint:
`/api/health`

Flight search endpoint:
`/api/flights/search`

A search response or enquiry is not a confirmed ticket. Confirm availability, fare rules, passenger details and payment through the authorised booking provider.

## Contact
The existing business phone and WhatsApp contact number shown on the website should be kept in sync with the business owner's approved details.

## Deployment and maintenance
- The website is deployed through the connected Vercel project.
- The API runs through the configured Cloudflare Worker.
- After changing `index.html`, verify the Vercel production deployment.
- After changing `worker.js`, deploy the Worker separately and verify its health endpoint.
- Do not publish passwords, OTPs, payment PINs, or API secrets.

## Customer information
Collect only information needed to respond to an enquiry. Do not ask customers to send passwords, OTPs, bank PINs or other confidential credentials through forms or WhatsApp.
