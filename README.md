# Her Space

A personal productivity and self-development application built with **React** and **Supabase**.

Her Space brings habits, academic goals and fitness progress into a single application with persistent user data and authentication.

## Features

- Habit and routine tracking
- Thesis / academic progress tracking
- Fitness progress tracking
- User authentication
- Persistent cloud data
- Row Level Security with Supabase
- Automatic deployment through GitHub Pages

## Tech stack

- React
- JavaScript
- Supabase
- PostgreSQL
- Supabase Auth
- GitHub Pages

## Architecture

The frontend is deployed as a static web application while Supabase provides:

- authentication
- database persistence
- row-level authorization
- backend services

Each authenticated user can only access their own data through RLS policies.

## Development

```bash
npm install
npm run dev
```

## Database setup

1. Create a Supabase project.
2. Open **SQL Editor**.
3. Run `supabase/schema.sql`.
4. Configure the application's Site URL and Redirect URLs in **Authentication → URL Configuration**.

## Deployment

Pushes to `main` are deployed automatically to GitHub Pages.
