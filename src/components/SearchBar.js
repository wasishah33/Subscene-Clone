import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

export default function SearchBar({ initialSearch = '', initialLanguage = '', onSearch }) {
  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const [language, setLanguage] = useState(initialLanguage);
  const [languages, setLanguages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  // Fetch available languages
  useEffect(() => {
    async function fetchLanguages() {
      try {
        const response = await fetch('/api/languages');
        if (response.ok) {
          const data = await response.json();
          setLanguages(data);
        }
      } catch (error) {
        console.error('Failed to fetch languages:', error);
      }
    }
    
    fetchLanguages();
  }, []);

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // If onSearch prop is provided, call it
    if (onSearch) {
      onSearch({ search: searchTerm, lang: language });
      return;
    }

    // Otherwise, navigate to search page with query params
    const params = new URLSearchParams();
    
    if (searchTerm) {
      params.append('search', searchTerm);
    }
    
    if (language) {
      params.append('lang', language);
    }
    
    router.push(`/search?${params.toString()}`);
  };

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-grow">
          <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">Title or IMDb ID</label>
          <div className="relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
              </svg>
            </div>
            <input
              type="text"
              id="search"
              placeholder="Search by title, IMDb ID, or release info..."
              className="block w-full pl-10 pr-3 py-2.5 text-gray-900 placeholder-gray-500 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        
        <div className="w-full md:w-56">
          <label htmlFor="language" className="block text-sm font-medium text-gray-700 mb-1">Language</label>
          <div className="relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M7 2a1 1 0 011 1v1h3a1 1 0 110 2H9.20l-.31 1.243a1 1 0 01-1.94 0L6.8 6H5a1 1 0 110-2h3V3a1 1 0 011-1zm0 8a1 1 0 011 1v1h8a1 1 0 110 2H8v1a1 1 0 11-2 0v-1H4a1 1 0 110-2h2v-1a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
            </div>
            <select
              id="language"
              className="block w-full pl-10 pr-8 py-2.5 text-gray-900 border border-gray-300 rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
            >
              <option value="">All Languages</option>
              {languages.map((lang) => (
                <option key={lang.lang} value={lang.lang}>
                  {lang.lang}
                </option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
        </div>
        
        <div className="md:self-end mt-2 md:mt-0">
          <button
            type="submit"
            className="w-full md:w-auto flex items-center justify-center px-6 py-2.5 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Searching...
              </>
            ) : (
              <>
                <svg className="mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                </svg>
                Search
              </>
            )}
          </button>
        </div>
      </div>
    </form>
  );
} 