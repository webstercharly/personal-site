---
title: 'My Raspberry Pi Runs the Agent, Not the Model'
description: 'How I use a 4 GB Raspberry Pi as an always-on home for Hermes without asking it to run the language model.'
pubDate: 2026-09-14
author: 'Charly Webster'
tags: ['raspberry-pi', 'hermes-agent', 'arm64', 'automation']
---

So I’ve got a raspberry pi sitting under my desk on top of my gaming PC.

I wanted to be able to run an always on agent but in a cost effective way. This ruled out leaving my Gaming PC on, as that would cost at least £30 a month from past experiences, while a Raspberry Pi that was sitting in a box would be roughly that a year.

Unfortunately the Pi isn’t powerful enough to run any decent models but it can run the harness. I’ve installed Ubuntu with no GUI to keep resource usage to a minimum, running Hermes agent and I communicate with it via Telegram.

Hermes can pull down my repositories, use a headless browser and interact with CLIs. Perfect for my set up as nowadays I get very little time to sit in front of a computer unless I’m working, so my current AI usage is through my mobile or via RDP, so I’m familiar to working this way.

The Pi has roughly 3.7 GB of usable memory with no ability to upgrade, so can run the agent well but struggles with lots of browser interactions, larger language models or too much concurrent execution.

## The limit is memory

Hermes gateway when I last checked was using 520 MB, active Hermes process was using another 260 MB and this was before a browser was even running. As we all know, browsers nowadays are power hungry. I’m always surprised in how much memory Chrome consumes on my Desktop or Mac, so am conscious the Pi has much less resources available.

It became apparent quite quickly that I needed to session manage, only having one bounded Chromium session running at a time, and clean up any left behind processes when a run failed to avoid processes consuming unnecessary memory.

## A few changes before Linux was ready to use

The Ubuntu version I’m running came with older versions of Python and Node compared to what Hermes needed. So I got these installed under my Home directly and pointed those processes to it rather than replacing the systems defaults.

Python I set up isolated environments for Hermes and projects, beneficial for when individual projects need to be upgraded in isolation without impacting the rest.

Chromium needed a small ARM64 change as not all launchers could find it, I set this all up before Chrome released an ARM64 version.

Nothing too complex, setup was straight forward and smooth, biggest challenge for me was setting families with command-lines instead of a GUI, spent more time with command syntax than anything else.

## What the Pi is good at?

A cheap-ish device that can always stay on, most of the time it is nearly idle, executing jobs on a cron or awaiting a message from me on Telegram.

I don’t have a use case right now for anything more powerful, if that becomes a requirement then I’ll invest into a VPS.

Right now I have something I can chat with, integrate with my repositories, can do Internet research while I am out and about, integrating with multiple model providers either via API or using OAuth for subscriptions I already pay for.
