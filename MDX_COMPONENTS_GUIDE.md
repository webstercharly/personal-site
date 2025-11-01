# MDX Components Guide

Complete guide to using the custom MDX components in your blog posts.

---

## Table of Contents

- [Getting Started](#getting-started)
- [Content Enhancement](#content-enhancement)
  - [Callout](#callout)
  - [Quote](#quote)
  - [Image](#image)
- [Data Visualization](#data-visualization)
  - [Metric](#metric)
  - [MetricsGrid](#metricsgrid)
  - [Chart](#chart)
- [Code & Architecture](#code--architecture)
  - [CodeComparison](#codecomparison)
  - [Timeline](#timeline)
  - [Mermaid](#mermaid)

---

## Getting Started

### Using Components in Blog Posts

1. Change your blog post file extension from `.md` to `.mdx`
2. Import the components you need at the top of your post
3. Use the components anywhere in your content

**Example:**

```mdx
---
title: 'My Blog Post'
description: 'A post using MDX components'
pubDate: 2024-11-01
---

import Callout from '../../components/content/Callout.astro';
import Metric from '../../components/content/Metric.astro';

Here's my regular markdown content...

<Callout type="info" title="Important">
This is a callout component!
</Callout>

<Metric value="99.9%" label="Uptime" trend="up" color="green" />
```

---

## Content Enhancement

### Callout

Alert boxes to highlight important information. Perfect for warnings, tips, and notes.

**Types:** `info`, `warning`, `tip`, `danger`, `success`

**Props:**
- `type` (required): The callout type
- `title` (optional): Heading for the callout

**Examples:**

```mdx
<Callout type="info" title="Good to Know">
This is an informational callout with helpful context.
</Callout>

<Callout type="warning">
Without a title, just the content is shown with an icon.
</Callout>

<Callout type="tip" title="Pro Tip">
Share expert advice and best practices here.
</Callout>

<Callout type="danger" title="Warning">
Critical information that needs immediate attention.
</Callout>

<Callout type="success" title="Result">
Celebrate wins and successful outcomes.
</Callout>
```

**Visual Appearance:**
- Blue for `info` (ℹ️)
- Yellow/orange for `warning` (⚠️)
- Green for `tip` (💡)
- Red for `danger` (🚨)
- Green for `success` (✅)

---

### Quote

Beautiful blockquotes with author attribution and optional source links.

**Props:**
- `author` (optional): Quote author name
- `source` (optional): Book, article, or source name
- `url` (optional): Link to source
- `variant` (optional): `default`, `centered`, or `large`

**Examples:**

```mdx
<Quote author="Martin Fowler" source="Refactoring" url="https://martinfowler.com">
Any fool can write code that a computer can understand.
Good programmers write code that humans can understand.
</Quote>

<Quote variant="centered">
A centered quote without attribution.
</Quote>

<Quote author="Kent Beck" variant="large">
Make it work, make it right, make it fast - in that order.
</Quote>
```

**Variants:**
- `default`: Regular size with left alignment
- `centered`: Centered text, great for standalone quotes
- `large`: Big decorative quote mark, perfect for section breaks

---

### Image

Enhanced image component with captions, credits, and optional zoom functionality.

**Props:**
- `src` (required): Image path
- `alt` (required): Alt text for accessibility
- `caption` (optional): Image caption
- `credit` (optional): Photo credit
- `creditUrl` (optional): Link for credit
- `width` (optional): Image width
- `height` (optional): Image height
- `zoomable` (optional): Enable click-to-zoom lightbox
- `priority` (optional): Load immediately (no lazy loading)
- `size` (optional): `sm`, `md`, `lg`, `full`

**Examples:**

```mdx
<Image
  src="/images/architecture.png"
  alt="System architecture diagram"
  caption="Our microservices architecture as of 2024"
  width={800}
  height={600}
/>

<Image
  src="/images/team.jpg"
  alt="Engineering team photo"
  caption="The team that made it happen"
  credit="Sarah Johnson"
  creditUrl="https://example.com/photographer"
  zoomable={true}
  size="lg"
/>

<Image
  src="/images/hero.jpg"
  alt="Hero image"
  priority={true}
  size="full"
/>
```

**Features:**
- Lazy loading by default (unless `priority={true}`)
- Click-to-zoom with lightbox (when `zoomable={true}`)
- Keyboard accessible (Escape to close lightbox)
- Responsive sizing with `size` prop
- Dark mode support

---

## Data Visualization

### Metric

Display key metrics with values, labels, trends, icons, and colors.

**Props:**
- `value` (required): The metric value (e.g., "99.9%", "10x", "$45K")
- `label` (required): Descriptive label
- `description` (optional): Additional context
- `trend` (optional): `up`, `down`, or `neutral`
- `icon` (optional): Emoji or icon
- `color` (optional): `blue`, `green`, `purple`, `orange`

**Examples:**

```mdx
<Metric value="10x" label="Performance Improvement" trend="up" color="green" />

<Metric
  value="99.9%"
  label="Uptime SLA"
  icon="🎯"
  description="Zero-downtime deployments"
/>

<Metric
  value="50ms"
  label="API Response Time"
  trend="down"
  color="blue"
  description="P95 latency improvement"
/>
```

**Trend Icons:**
- `up`: 📈 (use for improvements in speed, performance, uptime)
- `down`: 📉 (use for reductions in cost, latency, errors)
- `neutral`: ➡️ (use for stable metrics)

---

### MetricsGrid

Responsive grid wrapper for displaying multiple Metric components.

**Props:**
- `columns` (optional): `2`, `3`, or `4` (default: 3)
- `title` (optional): Section heading
- `description` (optional): Section description

**Examples:**

```mdx
<MetricsGrid columns={3} title="Performance Improvements">
  <Metric value="10x" label="Speed" trend="up" color="green" />
  <Metric value="99.9%" label="Uptime" color="blue" />
  <Metric value="50ms" label="Latency" trend="down" color="purple" />
</MetricsGrid>

<MetricsGrid
  columns={2}
  title="Cost Analysis"
  description="Monthly infrastructure costs before and after optimization"
>
  <Metric value="$45K" label="Before" color="red" icon="💸" />
  <Metric value="$27K" label="After" color="green" icon="💰" />
</MetricsGrid>
```

**Responsive Behavior:**
- Mobile: Always 1 column
- Tablet (md): 2-3 columns depending on prop
- Desktop (lg): Full column count (for 4-column grids)

---

### Chart

CSS-based horizontal bar charts for visualizing metrics and comparisons.

**Props:**
- `title` (optional): Chart title
- `data` (required): Array of chart data objects
- `unit` (optional): Unit suffix (e.g., "%", "ms", "$")
- `max` (optional): Maximum value for scale (auto-calculated if not provided)
- `height` (optional): Bar height - `sm`, `md`, or `lg`

**Data Object:**
```typescript
{
  label: string;        // Bar label
  value: number;        // Numeric value
  color?: string;       // 'blue' | 'green' | 'purple' | 'orange' | 'red' | 'yellow'
  description?: string; // Additional context below bar
}
```

**Examples:**

```mdx
<Chart
  title="Performance Improvement"
  data={[
    { label: 'Before', value: 450, color: 'red' },
    { label: 'After', value: 45, color: 'green' }
  ]}
  unit="ms"
  max={500}
  height="md"
/>

<Chart
  title="Team Satisfaction (1-10 scale)"
  data={[
    { label: 'Deployment Confidence', value: 4, color: 'red' },
    { label: 'Deployment Confidence (After)', value: 9, color: 'green' },
    { label: 'Code Ownership', value: 5, color: 'red' },
    { label: 'Code Ownership (After)', value: 9, color: 'green' }
  ]}
  max={10}
/>

<Chart
  title="Cost Breakdown"
  data={[
    { label: 'Compute', value: 18000, color: 'blue', description: 'EC2 instances' },
    { label: 'Database', value: 22000, color: 'purple', description: 'RDS + DynamoDB' },
    { label: 'Storage', value: 5000, color: 'orange', description: 'S3 + EBS' }
  ]}
  unit="$"
/>
```

**Features:**
- Animated bar growth on page load
- Responsive width calculation based on max value
- Hover effects
- Accessible with ARIA labels
- Dark mode support

---

## Code & Architecture

### CodeComparison

Side-by-side before/after code comparison for refactoring examples.

**Props:**
- `title` (optional): Comparison title
- `beforeLabel` (optional): Label for left side (default: "Before")
- `afterLabel` (optional): Label for right side (default: "After")
- `layout` (optional): `horizontal` (default) or `vertical`

**Example:**

```mdx
<CodeComparison title="Authentication Refactoring">
  <Fragment slot="before">
```javascript
// Old monolithic approach
function login(email, password) {
  const user = db.users.find(email);
  if (user && user.password === password) {
    sendEmail(user);
    logAction(user);
    trackAnalytics(user);
    return generateToken(user);
  }
}
```
  </Fragment>
  <Fragment slot="after">
```javascript
// New microservice approach
async function login(email, password) {
  const user = await authService.authenticate(email, password);
  if (user) {
    await eventBus.publish('user.logged_in', { userId: user.id });
    return tokenService.generate(user);
  }
}
```
  </Fragment>
</CodeComparison>
```

**Visual Styling:**
- Before section: Red indicator (❌) and red border
- After section: Green indicator (✅) and green border
- Responsive: Stacks vertically on mobile
- Syntax highlighting from your Astro markdown config

---

### Timeline

Visual timeline for project milestones, migration journeys, and career progression.

**Props:**
- `title` (optional): Timeline section title
- `items` (required): Array of timeline items

**Timeline Item Object:**
```typescript
{
  date: string;         // Display date (e.g., "Q1 2024", "January 2024")
  title: string;        // Milestone title
  description?: string; // Detailed description
  icon?: string;        // Emoji or icon
  color?: string;       // 'blue' | 'green' | 'purple' | 'orange' | 'red'
  link?: string;        // Optional link for title
}
```

**Example:**

```mdx
<Timeline
  title="Migration Journey"
  items={[
    {
      date: 'Q1 2023',
      title: 'Planning & Architecture',
      description: 'Identified service boundaries, chose tech stack, set up infrastructure',
      icon: '📋',
      color: 'blue'
    },
    {
      date: 'Q2 2023',
      title: 'First Service: Authentication',
      description: 'Extracted auth logic into standalone service',
      icon: '🔐',
      color: 'purple',
      link: '/blog/auth-service-migration'
    },
    {
      date: 'Q3 2023',
      title: 'User & Profile Services',
      description: 'Separated user data management',
      icon: '👥',
      color: 'green'
    },
    {
      date: 'Q4 2023',
      title: 'Core Business Logic',
      description: 'Migrated order processing and payments',
      icon: '💼',
      color: 'orange'
    },
    {
      date: 'Q1 2024',
      title: 'Migration Complete',
      description: 'All services live, monolith decommissioned',
      icon: '🎉',
      color: 'green'
    }
  ]}
/>
```

**Features:**
- Vertical timeline with connecting line
- Staggered animation on scroll
- Icons or dates in colored circles
- Hover effects on cards
- Clickable titles (when link provided)
- Fully responsive

---

### Mermaid

Render Mermaid diagrams for flowcharts, sequence diagrams, architecture, and more.

**Props:**
- `diagram` (optional): Mermaid diagram code as string
- `caption` (optional): Diagram caption
- `theme` (optional): `default`, `dark`, or `neutral`

**Examples:**

**Architecture Diagram:**
```mdx
<Mermaid caption="Microservices Architecture">
graph TD
    A[API Gateway] --> B[Auth Service]
    A --> C[User Service]
    A --> D[Order Service]
    B --> E[(Auth DB)]
    C --> F[(User DB)]
    D --> G[(Order DB)]
</Mermaid>
```

**Sequence Diagram:**
```mdx
<Mermaid caption="Authentication Flow">
sequenceDiagram
    Client->>API Gateway: Login Request
    API Gateway->>Auth Service: Validate Credentials
    Auth Service->>Database: Query User
    Database-->>Auth Service: User Data
    Auth Service-->>API Gateway: JWT Token
    API Gateway-->>Client: Success Response
</Mermaid>
```

**Flowchart:**
```mdx
<Mermaid caption="Deployment Pipeline">
graph LR
    A[Code Push] --> B{Tests Pass?}
    B -->|Yes| C[Build Docker Image]
    B -->|No| D[Notify Developer]
    C --> E[Push to Registry]
    E --> F[Deploy to Staging]
    F --> G{Manual Approval}
    G -->|Approved| H[Deploy to Production]
    G -->|Rejected| D
</Mermaid>
```

**State Diagram:**
```mdx
<Mermaid caption="Order State Machine">
stateDiagram-v2
    [*] --> Pending
    Pending --> Processing: Payment Confirmed
    Processing --> Shipped: Order Fulfilled
    Shipped --> Delivered: Delivery Confirmed
    Processing --> Cancelled: Customer Request
    Delivered --> [*]
    Cancelled --> [*]
</Mermaid>
```

**Features:**
- Automatic dark mode switching
- CDN-loaded (no build dependencies)
- Interactive and zoomable
- Supports all Mermaid diagram types:
  - Flowcharts (`graph`)
  - Sequence diagrams (`sequenceDiagram`)
  - Class diagrams (`classDiagram`)
  - State diagrams (`stateDiagram`)
  - ER diagrams (`erDiagram`)
  - Gantt charts (`gantt`)
  - Pie charts (`pie`)

**Mermaid Resources:**
- [Official Documentation](https://mermaid.js.org/)
- [Live Editor](https://mermaid.live/)

---

## Complete Example

Here's a complete blog post using multiple components:

```mdx
---
title: 'Database Migration: PostgreSQL to DynamoDB'
description: 'How we migrated our user service database and reduced costs by 40%'
pubDate: 2024-11-01
author: 'Charly Webster'
tags: ['database', 'aws', 'performance']
---

import Callout from '../../components/content/Callout.astro';
import Quote from '../../components/content/Quote.astro';
import MetricsGrid from '../../components/content/MetricsGrid.astro';
import Metric from '../../components/content/Metric.astro';
import Chart from '../../components/content/Chart.astro';
import Timeline from '../../components/content/Timeline.astro';
import Mermaid from '../../components/content/Mermaid.astro';

## Why We Migrated

Our PostgreSQL database was becoming a bottleneck...

<Callout type="info" title="Context">
We had 50M users and 2TB of data growing at 100GB/month.
</Callout>

## Results

<MetricsGrid columns={3} title="Performance Improvements">
  <Metric value="5x" label="Read Speed" trend="up" color="green" />
  <Metric value="40%" label="Cost Reduction" trend="down" color="blue" />
  <Metric value="99.99%" label="Availability" color="purple" icon="🎯" />
</MetricsGrid>

## Cost Comparison

<Chart
  title="Monthly Database Costs"
  data={[
    { label: 'PostgreSQL RDS', value: 8500, color: 'red' },
    { label: 'DynamoDB', value: 5100, color: 'green' }
  ]}
  unit="$"
/>

## Architecture Evolution

<Mermaid caption="New Architecture with DynamoDB">
graph LR
    A[API] --> B[DynamoDB]
    A --> C[ElastiCache]
    B --> D[DynamoDB Streams]
    D --> E[Lambda Analytics]
</Mermaid>

## Migration Timeline

<Timeline
  items={[
    {
      date: 'Week 1-2',
      title: 'Planning',
      description: 'Data modeling and capacity planning',
      icon: '📋',
      color: 'blue'
    },
    {
      date: 'Week 3-4',
      title: 'Dual Write',
      description: 'Write to both databases',
      icon: '✍️',
      color: 'purple'
    },
    {
      date: 'Week 5',
      title: 'Data Backfill',
      description: 'Migrate historical data',
      icon: '📦',
      color: 'orange'
    },
    {
      date: 'Week 6',
      title: 'Cutover',
      description: 'Switch reads to DynamoDB',
      icon: '🚀',
      color: 'green'
    }
  ]}
/>

<Callout type="success" title="Success">
Migration completed with zero downtime!
</Callout>
```

---

## Best Practices

### 1. **Component Combinations**

Combine components to tell a complete story:
- Start with a Callout for context
- Use Metrics/Charts for data
- Show architecture with Mermaid
- Add Timeline for journey
- End with Quote or success Callout

### 2. **Colors and Consistency**

- Use red for "before" metrics or problems
- Use green for "after" metrics or successes
- Use blue for neutral information
- Be consistent throughout the post

### 3. **Performance**

- Use `priority={true}` on Image only for above-the-fold images
- Keep Chart data arrays reasonable (<20 items)
- Use Mermaid sparingly (loads from CDN)

### 4. **Accessibility**

- Always provide `alt` text for images
- Use descriptive labels for metrics
- Add captions to diagrams for context
- Don't rely solely on color to convey meaning

### 5. **Mobile Responsiveness**

All components are responsive, but consider:
- MetricsGrid will stack to 1 column on mobile
- Charts are horizontally scrollable on small screens
- CodeComparison stacks vertically on mobile
- Mermaid diagrams may need horizontal scroll

---

## Component Cheat Sheet

Quick reference for imports:

```mdx
import Callout from '../../components/content/Callout.astro';
import Quote from '../../components/content/Quote.astro';
import Image from '../../components/content/Image.astro';
import Metric from '../../components/content/Metric.astro';
import MetricsGrid from '../../components/content/MetricsGrid.astro';
import Chart from '../../components/content/Chart.astro';
import CodeComparison from '../../components/content/CodeComparison.astro';
import Timeline from '../../components/content/Timeline.astro';
import Mermaid from '../../components/content/Mermaid.astro';
```

---

## Need Help?

- See the demo post: `src/content/blog/mdx-components-showcase.mdx`
- Check component source: `src/components/content/`
- [Astro MDX docs](https://docs.astro.build/en/guides/markdown-content/#mdx-only-features)
- [Mermaid docs](https://mermaid.js.org/)

Happy blogging! 🚀
