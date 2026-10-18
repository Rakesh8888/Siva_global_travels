# Duffel Flight Search Setup (Telugu)

This adds **flight search only** to the existing Siva Global Travels site. It does not create bookings, take payments, issue tickets, or guarantee a fare. The website design and existing repository are retained.

## 1. Create a Duffel test token first

1. Open https://app.duffel.com/ and sign in or create your Duffel account.
2. In the dashboard, switch to **Developer test mode**.
3. Open **More → Developers → Access tokens** (wording may vary).
4. Create a **test** token. It usually starts with `duffel_test_`.
5. Never paste this token into GitHub files, chat messages, or website JavaScript.

Official guide: https://duffel.com/docs/api/overview/test-mode

## 2. Add the token as a Cloudflare Worker secret

1. Open https://dash.cloudflare.com/ on your Android browser and sign in.
2. Open **Workers & Pages**.
3. Select the existing Worker named **siva-global-travels**.
4. Open **Settings → Variables and Secrets** (the menu name may vary).
5. Add a **Secret**:
   - Name: `DUFFEL_ACCESS_TOKEN`
   - Value: paste the test token from Duffel
6. Save the secret.
7. Deploy the new code from the connected GitHub repository after the pull request is merged. If Cloudflare is not connected to this GitHub repository, use its existing deployment workflow; do not create a second production Worker.

Do not add this token to GitHub repository files or a `.env` file committed to Git.

## 3. Test safely

After the branch is merged and Cloudflare has deployed it, open the existing website and try the Flight Search form. It should call `POST /api/flights/search`.

- Test token results are **sample/test-mode offers**, not real bookable prices.
- No ticket is booked by clicking search or WhatsApp.
- The WhatsApp button asks Siva Global Travels to verify the offer.
- If the API returns an error, confirm the secret name is exactly `DUFFEL_ACCESS_TOKEN`, the test token is valid, and the Worker has deployed.

## 4. Before showing real fares to customers

1. Complete Duffel's account activation and any required onboarding.
2. Review Duffel's current fees, commercial terms, airline/content access, and payment requirements.
3. Create a live token only when approved for live mode.
4. Replace the Cloudflare secret value with the live token in Cloudflare Dashboard, never in source code.
5. Test again and confirm the API response indicates live mode before advertising real fares.

The current implementation deliberately does **not** create orders or take payments. Real bookings require a separate, carefully tested checkout, payment handling, passenger-data protection, cancellation/refund handling, and supplier approval.

## What changed

- `worker.js`: secure server-side Duffel offer search endpoint.
- `index.html`: the existing flight enquiry form now calls the endpoint and shows returned offers; WhatsApp remains an enquiry route.
- Existing `Rakesh8888/Siva_global_travels` repository and website design are retained.
