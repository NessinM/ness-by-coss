import { CodeBlock } from "@creantly/ui/shared/code-block";
import type { Metadata } from "next";

export const metadata: Metadata = {
  description: "open source is the foundation of all modern software",
  title: "creantly.com payments",
};

export default function Page() {
  const initialization = `import { creantly } from '@creantly';

creantly.payments.init({
  apiKey: process.env.CREANTLY_KEY,
  environment: 'production', // or 'sandbox'
});`;

  const products = `// Create a product
await creantly.payments.products.create({
  name: 'Pro Plan',
  description: 'Access to premium features',
});

// List products
await creantly.payments.products.list();

// Retrieve a product
await creantly.payments.products.retrieve('prod_abc123');

// Update a product
await creantly.payments.products.update('prod_abc123', {
  description: 'Updated description',
});

// Delete a product
await creantly.payments.products.delete('prod_abc123');`;

  const prices = `// Create a price for a product
await creantly.payments.prices.create({
  productId: 'prod_abc123',
  unitAmount: 2000, // in cents
  currency: 'usd',
  recurring: { interval: 'month' },
});

// List prices
await creantly.payments.prices.list();`;

  const customers = `// Create a customer
await creantly.payments.customers.create({
  email: 'jane@example.com',
  name: 'Jane Doe',
});

// Retrieve a customer
await creantly.payments.customers.retrieve('cus_abc123');`;

  const subscriptions = `// Create a subscription
await creantly.payments.subscriptions.create({
  customerId: 'cus_abc123',
  priceId: 'price_abc123',
});

// Retrieve a subscription
await creantly.payments.subscriptions.retrieve('sub_abc123');

// Update a subscription (e.g., upgrade plan)
await creantly.payments.subscriptions.update('sub_abc123', {
  priceId: 'price_def456',
});

// Cancel a subscription
await creantly.payments.subscriptions.cancel('sub_abc123');`;

  const invoices = `// Create an invoice manually
await creantly.payments.invoices.create({
  customerId: 'cus_abc123',
  items: [
    { priceId: 'price_abc123', quantity: 1 },
  ],
});

// Finalize and send the invoice
await creantly.payments.invoices.finalize('inv_abc123');

// Pay an invoice
await creantly.payments.invoices.pay('inv_abc123');`;

  const webhooks = `// Webhook events
creantly.payments.webhooks.on('invoice.paid', (event) => {
  console.log('Invoice paid:', event.data);
});

creantly.payments.webhooks.on('subscription.created', (event) => {
  console.log('Subscription created:', event.data);
});`;

  const utilities = `// Validate webhook signature
const isValid = creantly.payments.utils.verifySignature({
  payload: req.body,
  signature: req.headers['creantly-payments-signature'],
  secret: 'whsec_payments_123',
});`;

  return (
    <main className="container mb-16 w-full flex-1 lg:mb-20">
      <div className="mx-auto mt-12 max-w-2xl text-muted-foreground lg:mt-16 [&_a:not([data-slot='button'])]:text-foreground [&_strong]:text-foreground">
        <h2 className="mt-12 scroll-m-20 font-heading font-semibold text-2xl text-foreground first:mt-0 [&+p]:mt-4! *:[code]:text-2xl">
          Initialization
        </h2>
        <CodeBlock code={initialization} copyButton={false} language="tsx" />
        <h2 className="mt-12 scroll-m-20 font-heading font-semibold text-2xl text-foreground first:mt-0 [&+p]:mt-4! *:[code]:text-2xl">
          Products
        </h2>
        <CodeBlock code={products} copyButton={false} language="tsx" />
        <h2 className="mt-12 scroll-m-20 font-heading font-semibold text-2xl text-foreground first:mt-0 [&+p]:mt-4! *:[code]:text-2xl">
          Prices
        </h2>
        <CodeBlock code={prices} copyButton={false} language="tsx" />
        <h2 className="mt-12 scroll-m-20 font-heading font-semibold text-2xl text-foreground first:mt-0 [&+p]:mt-4! *:[code]:text-2xl">
          Customers
        </h2>
        <CodeBlock code={customers} copyButton={false} language="tsx" />
        <h2 className="mt-12 scroll-m-20 font-heading font-semibold text-2xl text-foreground first:mt-0 [&+p]:mt-4! *:[code]:text-2xl">
          Subscriptions
        </h2>
        <CodeBlock code={subscriptions} copyButton={false} language="tsx" />
        <h2 className="mt-12 scroll-m-20 font-heading font-semibold text-2xl text-foreground first:mt-0 [&+p]:mt-4! *:[code]:text-2xl">
          Invoices
        </h2>
        <CodeBlock code={invoices} copyButton={false} language="tsx" />
        <h2 className="mt-12 scroll-m-20 font-heading font-semibold text-2xl text-foreground first:mt-0 [&+p]:mt-4! *:[code]:text-2xl">
          Webhooks
        </h2>
        <CodeBlock code={webhooks} copyButton={false} language="tsx" />
        <h2 className="mt-12 scroll-m-20 font-heading font-semibold text-2xl text-foreground first:mt-0 [&+p]:mt-4! *:[code]:text-2xl">
          Utilities
        </h2>
        <CodeBlock code={utilities} copyButton={false} language="tsx" />
      </div>
    </main>
  );
}
