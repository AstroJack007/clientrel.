
# Xeno CRM

A modern, AI-powered customer engagement platform built with Next.js, MongoDB, and Redis.

## Features

- Google sign-in authentication (NextAuth)
- AI-powered audience rule builder (natural language to rules)
- Campaign creation, preview, and launch flows
- Campaign history with delivery stats
- Responsive, clean UI with reusable components (Tailwind CSS)
- MongoDB for data, Redis for fast queueing

## Getting Started

### Prerequisites
- Node.js 18+
- MongoDB instance (local or Atlas)
- Redis instance (local or cloud)
- Google OAuth credentials (for sign-in)

### Setup
1. **Clone the repo:**
	```sh
	git clone <your-repo-url>
	cd xeno-crm-project
	```
2. **Install dependencies:**
	```sh
	npm install
	```
3. **Configure environment:**
	- Copy `.env.example` to `.env` and fill in MongoDB, Redis, and Google credentials.

4. **(Optional) Seed sample data:**
	```sh
	npm run seed-cus
	npm run seed-order
	```

### Running the App
- **Development:**
  ```sh
  npm run dev
  ```
- Visit [http://localhost:3000](http://localhost:3000)

### Scripts
- `npm run dev` — Start development server
- `npm run build` — Build for production
- `npm run start` — Start production server
- `npm run lint` — Lint code
- `npm run consume` — Start Redis consumer
- `npm run seed-cus` — Seed customers
- `npm run seed-order` — Seed orders
- `npm run strip-comments` — Remove comments from all code files


## Project Structure

```
xeno-crm-project/
	.env
	eslint.config.mjs
	jsconfig.json
	next.config.mjs
	package.json
	postcss.config.mjs
	README.md
	components/
		AuthCheck.jsx
		Header.jsx
		ui/
			Button.jsx
			Card.jsx
			EmptyState.jsx
			Input.jsx
			Select.jsx
			Spinner.jsx
	hooks/
		useFetch.js
	libs/
		mongodb.js
		queryBuilder.js
		redis.js
	models/
		communicationLog.js
		customer.js
		orders.js
	pages/
		api/
			ai/generate-rules.js
			audience/preview.js
			auth/[...nextauth].js
			campaigns/Createcampaign.js
			campaigns/deliveryreceipt.js
			campaigns/history.js
			ingest/customer.js
			ingest/order.js
			vendor/send.js
	public/
		*.svg
	scripts/
		clear-redis.js
		redis-consumer.js
	seed/
		seed-customer.js
		seed-order.js
	src/
		app/
			favicon.ico
			globals.css
			layout.js
			page.jsx
			providers.jsx
			campaigns/
				create/
					page.jsx
					launch/
						LaunchForm.jsx
						page.jsx
				history/
					page.jsx
```

## Commands to run (Windows cmd)

```cmd
:: Install dependencies
npm install

:: Start the Next.js dev server
npm run dev

:: Seed sample data (optional)
npm run seed-cus
npm run seed-order

:: Start the Redis consumer (in another terminal)
npm run consume

:: Build for production
npm run build

:: Start production server
npm run start
```
##Architecture 
<img width="3840" height="3173" alt="Untitled diagram _ Mermaid Chart-2025-09-15-141216" src="https://github.com/user-attachments/assets/6259b43e-e372-42cb-8002-bd6f800b93c2" />

## Customization
- UI built with Tailwind CSS (see `globals.css`)
- Easily extend with new campaigns, rules, or integrations

