---
title: 'A Job Title Is Not a Job Fit'
description: 'Why I am using Jev as a second-stage reviewer for senior technology roles, comparing opportunities with the kind of work I actually want.'
pubDate: 2026-09-18
author: 'Charly Webster'
tags: ['ai-agents', 'jev', 'career', 'engineering-leadership']
---

A job advert can have exactly the right title and still be the wrong job.

That is a problem for any workflow built around senior engineering and technology leadership roles. Head of Engineering, Director of Engineering, VP of Engineering and CTO are useful starting points, but they do not tell me whether the role involves the kind of work I want to do.

The first part of the workflow is good at finding and organising opportunities. It keeps the search focused, removes stale and duplicate records, and extracts details such as salary, team size and reporting line. Those rules should stay deterministic. They are easier to inspect and cheaper to run than a model call.

The judgement I want comes afterwards.

## The second-stage question

I have added Jev, TypeSafe AI's typed decision model, as an optional shadow-stage reviewer. Jev does not write a paragraph about each opportunity. It receives the available role information and a set of typed questions, then returns structured decisions with probabilities.

The state includes a short profile of the work I am looking for: AI Product Engineering leadership, governed model and API platforms, delivery of AI products and business use cases, and meaningful strategic ownership. It also includes the role title, context and the relevant description.

The questions are deliberately narrower than “is this a good job?” Jev scores personal alignment and leadership scope, checks for meaningful AI product-engineering fit, looks for a hands-on mismatch, and chooses a review priority of high, review or low.

That gives the workflow a different job to do. It can identify a senior engineering role. Jev can ask whether the description supports the kind of leadership and platform work I have experience in and want next.

## Why it stays in shadow mode

A score is not an accuracy measurement. A probability from Jev is a model judgement until it has been compared with labelled examples.

For now, the report records how many opportunities were evaluated, the average personal-alignment score and the distribution of review priorities. None of those results changes the underlying selection process or the opportunities shown to me.

That separation matters. If Jev is unavailable, the workflow continues. If its judgements are poor, the main process has not been quietly changed underneath me.

The next useful dataset is not a larger prompt. It is a labelled sample. I need to mark enough opportunities as strong fit, possible fit or poor fit, then compare those decisions with Jev's outputs. That will show whether it catches the quiet mismatches that a title-based search cannot see: a senior-sounding role with narrow hands-on scope, an AI role with no real product ownership, or a platform job whose responsibilities line up closely with my experience.

If it does, Jev earns a place as a ranking and triage layer. If it does not, I will remove it. The integration is deliberately a plugin, not a new dependency in the core workflow.

The point is simple: the title finds the opportunity. The description has to earn the fit.
