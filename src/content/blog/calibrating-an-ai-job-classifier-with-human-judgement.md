---
title: 'Calibrating an AI Job Classifier with Human Judgement'
description: 'What a small comparison between Jev, an independent LLM judge and my own assessments revealed about job-fit classification.'
pubDate: 2026-09-19
author: 'Charly Webster'
tags: ['ai-agents', 'jev', 'career', 'engineering-leadership']
---

In my last blog post I mentioned needing to verify the scores Jev gave, and there were 2 ways I thought this could be done, manually or via an LLM. Given the dataset is small, it was a reasonable size for me to do manually, at the same time I could use existing LLM subscriptions to run it past them as a judge.

I got Hermes to feed me each of the jobs, and I would respond with one of the three ratings; strong fit, possible fit or poor fit.

I used only 14 jobs, so this is not an extensive assessment, so the analysis has to be taken with a pinch of salt until there is more data.

Jev and the LLM (5.6-sol) matched on 64% of the jobs.

On those where they didn’t align, the LLM judge was promoting customer-facing AI delivery and senior technology roles.

Then I personally judged 12 of those jobs, I matched with Jev on 9 and the LLM on 11.

What my own judgement added was the ability to evaluate what career direction I was actually interested in. Generic CTO roles, no mention of AI or those which are hands-on were poor fits, engineering operations are possible fits and Enterprise AI, MLOps, governed production platforms and measurable business use cases were considered strong. These differences are hard distinctions or easy to overlook when the descriptions use broad terms like AI, transformation or platform.

12 jobs is not a lot of data, so I am going to keep Jev in shadow mode and continue doing daily LLM and human evaluations for a few more days.
