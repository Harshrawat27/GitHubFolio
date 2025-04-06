import RateLimitIndicator from '@/components/RateLimitIndicator';

export default function RateLimitCheck() {
  return (
    <div className='min-h-screen flex flex-col items-center justify-center px-4 py-20'>
      {/* GitHub API Rate Limit Indicator */}
      <RateLimitIndicator />
    </div>
  );
}
