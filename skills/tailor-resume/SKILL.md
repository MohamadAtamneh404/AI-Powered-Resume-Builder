---
name: tailor-resume
description: Use when building or modifying the "tailor resume to job description" feature — comparing a resume against a job description and generating targeted suggestions.
---

# Tailor Resume to Job Description

## Goal

Compare a user's saved resume against a pasted job description and suggest specific, targeted edits — never auto-apply changes.

## Backend contract

POST /api/tailor
Input: { resumeId: string, jobDescription: string }
Output: [{ section: string, current: string, suggested: string, reason: string }]

## Rules

- Never overwrite resume data directly — always return suggestions for user approval
- Keep LLM prompts token-efficient: send only relevant resume sections, not the whole document, when possible
- Log LLM API failures gracefully; show the user a retry option, never a silent failure
