'use client';

import { useState, FormEvent } from 'react';

interface ProfileSearchProps {
  onSearch: (username: string) => void;
  loading: boolean;
}

export default function ProfileSearch({
  onSearch,
  loading,
}: ProfileSearchProps) {
  const [username, setUsername] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (username.trim()) {
      onSearch(username.trim());
    }
  };

  return (
    <div className='bg-white p-6 rounded-lg shadow-md'>
      <h2 className='text-xl font-semibold mb-4'>Search GitHub Profile</h2>
      <form onSubmit={handleSubmit} className='flex flex-col sm:flex-row gap-4'>
        <input
          type='text'
          placeholder='Enter GitHub username (e.g., Harshrawat27)'
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className='flex-grow p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
          required
        />
        <button
          type='submit'
          className='bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-lg transition-colors'
          disabled={loading || !username.trim()}
        >
          {loading ? (
            <>
              <span className='inline-block animate-spin mr-2'>⟳</span>
              Loading...
            </>
          ) : (
            'Analyze Profile'
          )}
        </button>
      </form>
    </div>
  );
}
