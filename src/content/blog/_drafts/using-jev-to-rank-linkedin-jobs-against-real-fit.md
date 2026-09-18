---
title: 'A Job Title Is Not a Job Fit'
description: 'Why I am using Jev as a second-stage reviewer for LinkedIn jobs, comparing adverts with the kind of work I actually want.'
pubDate: 2026-09-18
author: 'Charly Webster'
tags: ['linkedin', 'ai-agents', 'jev', 'career', 'engineering-leadership']
---

A LinkedIn advert can have exactly the right title and still be the wrong job.

That is a problem for a scraper built around senior engineering and technology leadership roles. Head of Engineering, Director of Engineering, VP of Engineering and CTO are useful search terms, but they do not tell me whether the role involves the kind of work I want to do.

The scraper is good at finding and cleaning the adverts. It searches the role taxonomy, keeps UK listings, removes stale and duplicate records, and extracts details such as salary, team size and reporting line. Those rules should stay deterministic. They are easier to inspect and cheaper to run than a model call.

The judgement I want comes afterwards.

## The second-stage question

I have added Jev, TypeSafe AI's typed decision model, as an optional shadow-stage reviewer. Jev does not write a paragraph about each job. It receives the advert state and a set of typed questions, then returns structured decisions with probabilities.

The state now includes a short profile of the work I am looking for: AI Product Engineering leadership, governed model and API platforms, delivery of AI products and business use cases, and meaningful strategic ownership. It also includes the job title, search role, location and up to 4,000 characters of the advert description.

The questions are deliberately narrower than “is this a good job?” Jev scores personal alignment and leadership scope, checks for meaningful AI product-engineering fit, looks for a hands-on mismatch, and chooses a review priority of high, review or low.

That gives the scraper a different job to do. It can find a Director of Engineering role. Jev can ask whether the description supports the kind of leadership and platform work I have experience in and want next.

## Why it stays in shadow mode

A score is not an accuracy measurement. A probability from Jev is a model judgement until it has been compared with labelled examples.

For now, the daily report records how many jobs were evaluated, the average personal-alignment score and the distribution of review priorities. None of those results changes filtering, deduplication, Supabase persistence or the jobs sent in the report.

That separation matters. If Jev is unavailable, the scraper continues. If its judgements are poor, the production path has not been quietly changed underneath me.

The next useful dataset is not a larger prompt. It is a labelled sample. I need to mark enough adverts as strong fit, possible fit or poor fit, then compare those decisions with Jev's outputs. That will show whether it catches the quiet mismatches that a title taxonomy cannot see: a senior-sounding role with narrow hands-on scope, an AI role with no real product ownership, or a platform job whose responsibilities line up closely with my experience.

If it does, Jev earns a place as a ranking and triage layer. If it does not, I will remove it. The integration is deliberately a plugin, not a new dependency in the scraper's core logic.

The point is simple: the title finds the advert. The advert has to earn the fit.
