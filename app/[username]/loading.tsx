export default function Loading() {
  return (
    <div className='flex flex-col items-center justify-center min-h-[60vh] py-16'>
      <div className='flex items-center justify-center relative w-24 h-24'>
        <div className='absolute top-0 left-0 w-full h-full border-4 border-[#8976EA] border-t-transparent rounded-full animate-spin'></div>
        <div className='w-5 h-5 bg-[#8976EA] rounded-md'></div>
      </div>
      <h2 className='text-2xl font-bold mt-8 mb-2 font-mono'>
        Creating your portfolio...
      </h2>
      <p className='text-gray-400 max-w-md text-center'>
        We're fetching your GitHub data and crafting a beautiful developer
        portfolio.
      </p>
    </div>
  );
}
