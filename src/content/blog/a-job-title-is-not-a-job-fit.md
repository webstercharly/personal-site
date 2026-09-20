---
title: 'A Job Title Is Not a Job Fit'
description: 'Why I am using Jev as a second-stage reviewer for senior technology roles, comparing opportunities with the kind of work I actually want.'
pubDate: 2026-09-18
author: 'Charly Webster'
tags: ['ai-agents', 'jev', 'career', 'engineering-leadership']
---

In my previous post about what I’ve seen from jobs on LinkedIn, I commented on how responsibilities vary per job posting, even for the same titles.

With the popularity of Jev over the past week, I wanted to give it a go and see how it could fit into some of the workflows I already had set up. That is where I thought about how could Jev help do assessments on some of the jobs I had seen available in the market.

What this discovered is what I had already observed myself but through a more deterministic way, job adverts can have the same title but not be the right fit.

I set Jev up with some background around what I am interested in, describing the sort of role that was I looking for and the profession that I would want in my career. I intentionally excluded titles as they don’t tell me whether the role involves the kind of work I want to do.

## Introducing Jev

For those who don’t know, Jev is a type decision model from TypeSafe AI. I added into my workflow in shadow mode, it takes in the role information and a set of questions and then returns decisions with probabilities.

I gave it a short profile of the work I want to do, which aligns to the job transition I am going through internally at the minute.

“AI Product Engineering leadership, governed model and API platforms, delivery of AI products and business use cases, and meaningful strategic ownership”

In order to get good quality out of Jev, the questions ideally should be targeted rather than ambiguous, so I intentionally tried to make them narrow. Jev scores my personal alignment, the leadership scope of the role and whether the job itself has meaningful AI product-engineering fit.

## Why it stays in shadow mode

It should go without saying, this is a new tool to the market, it hasn’t proven its worth yet and I have no idea how successful it was going to be to determine an alignment, was this actually a suitable use case or was it too abstract.

So the ideal of shadow mode was to do assessments on the background, record the results and see whether these change overtime with optimisation. Additionally I wouldn’t want Jev being unavailable to have an impact to my Workflow as the assessment itself is something that could be run at any point retrospectively Or asynchronous.

An assessment from a deterministic tool wasn’t going to be enough, the ratings need to be assessed themselves for accuracy, this could be either manually by a human or programmatically via an LLM, or perhaps even both. To do that I needed to implement an overall score, for that I am thinking keeping it simple, a 3 rating score, whether a role is a strong fit, possible fit or not a fit.

By having this score it goes beyond whether a title aligns to my interest, it also goes into whether the job role itself matches what I am looking for. A hands on AI role as a founding engineer or CTO is not something I would be interested in for example.

For now I need to give Jev some time to see how it performs and to gather data. I’ve designed it in such a way that it can easily be removed without any impact, given the hype on social media, I am really looking forward to seeing how it performs.
