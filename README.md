# Autohaus dealer workspace

A responsive car-dealership admin demo built with Next.js 16, React 19, TypeScript, and Recharts.

## Run locally

```bash
npm ci
npm run dev
```

Open http://localhost:3000. Use `npm run build` for a production build and `npm start` to serve it.
The development script uses Next.js's supported webpack mode to avoid a Turbopack/Tailwind module-resolution issue observed on this Windows workspace.

## Connected workflows

- **Overview:** current-month revenue, stock, active leads, completed sales, revenue history, inventory breakdown, recent arrivals, and today's schedule.
- **Vehicle inventory:** search, status filters, price sorting, grid/list layouts, pagination, add/edit/delete, and CSV export.
- **Leads and customers:** contact details, source tracking, editable pipeline stages, customer search, and CSV export.
- **Sales:** record a completed deal against a customer and unsold vehicle. Recording a sale marks the vehicle sold and the purchasing lead won; other leads for that vehicle are closed as lost.
- **Appointments:** add/edit test drives, deliveries, and consultations; filter by date; complete/cancel bookings. Duplicate scheduled time slots are rejected.
- **Reports:** revenue periods, lead sources, conversion rate, stock asking value, realized sales, and export.
- **Settings:** dealership/profile details and workspace reminders. Currency is USD for the seed dataset; amounts are never relabelled as another currency without conversion.

## Demo persistence and limitations

The new dealership workspace uses validated browser `localStorage` under `autohaus-dealer-v1`. Seed records are included on first use. Changes survive refreshes and synchronize between tabs on the same origin. Storage errors are surfaced, and invalid stored data is not overwritten.

**This is not a production backend.** No authentication, payments, email/SMS delivery, role-based access control, or multi-user synchronization is connected. Do not enter real customer or financial information. Export data as CSV before clearing browser storage. Use the same hostname and port to return to saved changes.

The original catalog APIs and legacy management routes remain in the source, but are not used by the new local workspace. Their MongoDB, Cloudinary, and messaging configuration is independent of this demo.

Vehicle photos are stored locally in `public/cars`, sourced from Unsplash:
[BMW](https://images.unsplash.com/photo-1555215695-3004980ad54e),
[Mercedes](https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8),
[Porsche](https://images.unsplash.com/photo-1503376780353-7e6692767b70),
[Audi](https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6).

## Validation

```bash
npx tsc --noEmit
npm run build
npm run lint -- components/dealer lib/dealer-store.ts
node --experimental-strip-types --test lib/dealer-store.test.mjs
```

The original catalog and integration code is still present and may require its own environment configuration.
The focused store tests use Node.js 22.6+ native TypeScript stripping (Node.js 24 recommended).
