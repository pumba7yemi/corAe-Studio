import { NextResponse } from 'next/server';

export async function GET() {
  const payload = {
    greeting: 'Welcome — I am CAIA, your corridor assistant.',
    how_i_work: 'I compute a 150-logic score from historical runs, watch Cassandra for new patterns, and run a nightly green sweep to self-check.',
    health_status: 'CAIA health is available at /api/caia/health and includes status, score150, mood and cassandra summaries.',
    cassandra_rules: 'Cassandra records forbidden patterns and meta-patterns; CAIA consults those to pause or ask for clarification.',
    how_to_interact: [
      'Use the onboarding to learn the basics.',
      'Perform a daily check-in so CAIA can align with your state.',
      'Review CAIA health and address any misalignment suggestions.'
    ]
  };

  return NextResponse.json(payload);
}
