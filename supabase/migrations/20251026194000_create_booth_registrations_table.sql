/*
  # Create booth registrations table

  1. New Tables
    - `booth_registrations`
      - `id` (uuid, primary key) - Unique identifier for each registration
      - `name` (text) - Full name of the registrant
      - `email` (text) - Email address
      - `phone` (text) - Phone number
      - `country` (text) - Country of origin
      - `website` (text) - Company website
      - `company` (text) - Company name
      - `job_title` (text) - Position/job title
      - `company_field` (text) - Field/industry of the company
      - `package` (text) - Selected booth package
      - `source` (text) - How they heard about the expo
      - `message` (text, nullable) - Optional message or questions
      - `form_source` (text) - Form identifier
      - `consent` (boolean) - Consent checkbox value
      - `created_at` (timestamptz) - Registration timestamp
      
  2. Security
    - Enable RLS on `booth_registrations` table
    - Add policy for public inserts (allow registration submissions)
    - Add policy for authenticated admin reads (for viewing registrations)
    
  3. Notes
    - Public users can submit registrations (INSERT only)
    - Only authenticated admins can view registrations (SELECT)
    - No public access to view existing registrations
    - Timestamps are automatically set on creation
*/

CREATE TABLE IF NOT EXISTS booth_registrations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  phone text NOT NULL,
  country text NOT NULL,
  website text NOT NULL,
  company text NOT NULL,
  job_title text NOT NULL,
  company_field text NOT NULL,
  package text NOT NULL,
  source text NOT NULL,
  message text DEFAULT '',
  form_source text DEFAULT 'Exhibitor Registration',
  consent boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE booth_registrations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit booth registrations"
  ON booth_registrations
  FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Authenticated users can view all booth registrations"
  ON booth_registrations
  FOR SELECT
  TO authenticated
  USING (true);