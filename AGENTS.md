# AI Agent Guidelines

This file contains guidelines for any AI agent working on this repository to ensure secure and correct Supabase integration.

## Supabase Environment Variables
* Always use system environment variables for Supabase operations.
* Required variables include: `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, and `SUPABASE_ACCESS_TOKEN`.
* Never hardcode secrets or credentials into code files.

## Targeting Supabase CLI Commands
* Ensure CLI commands target Supabase for repository `nipyu/testvitt`.
* To determine the correct Supabase `project_id`, check the `supabase/config.toml` file or repository-level environment variables.
* Do not use hardcoded logic to look up project IDs based on repository names; rely entirely on the project's configuration and environment variables.
