# Digital Learn 2.0 — Website starter

A responsive, dark-navy-and-teal educational website with a left sidebar on desktop and simplified navigation on mobile.

## Included
- Registration page (name, age group, education level, consent)
- Personal dashboard and learning journey indicator
- DigiLocker, Aadhaar and PAN learning modules
- Three-question knowledge quiz
- FAQ and official quick links
- e-Aadhaar PDF password helper (runs locally; helper inputs are not sent to Sheets)
- Browser-local profile/progress storage
- Optional Google Sheets event logging through Google Apps Script

## Preview locally
Extract this ZIP and open `index.html` in a browser. For a public website, host the HTML file on a static hosting provider using HTTPS.

## Connect the Google Sheet
1. Create a Google Sheet in the account that should own the records.
2. Open **Extensions → Apps Script**.
3. Replace the starter script with `Code.gs`.
4. Replace `PASTE_YOUR_GOOGLE_SHEET_ID_HERE` with the spreadsheet ID in the Sheet URL.
5. Save, select **Deploy → New deployment → Web app**.
6. Select **Execute as: Me**. Choose access settings appropriate to your project. Public access can invite spam/forged submissions.
7. Deploy and copy the URL ending in `/exec`.
8. In `index.html`, change `const SHEET_WEB_APP_URL = "";` to the deployed URL.
9. Upload/redeploy the updated website. Test registration, module completion and quiz submissions. Check that `Registrations`, `Module Progress` and `Quiz Scores` tabs receive rows.

This starter sends POST requests with `no-cors` mode for browser compatibility; it cannot read the Apps Script response. Verify the Sheet manually. The simple endpoint does not authenticate the visitor and should not be treated as production-secure.

## Privacy and production notes
- Do not collect Aadhaar/PAN numbers, OTPs, identity documents or the e-Aadhaar helper inputs.
- Restrict Sheet sharing to people who need access; do not publish the Sheet.
- Explain purpose, access, retention, and contact details in a privacy notice.
- Use appropriate consent, especially if minors may use the site.
- Consider a random learner ID rather than full names, and add backend validation, rate limiting and anti-abuse controls before public launch.
- Browser local storage is not secure account storage and does not sync progress between devices. Real accounts need a proper backend and authentication.
- Digital Learn 2.0 is an independent learning project, not a government portal. Verify all current instructions on official portals.
