import { useState, useEffect } from 'react';
import Link from 'next/link';
import Layout from '../components/Layout';

export default function BrowsePage() {
  const [languages, setLanguages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    async function fetchLanguages() {
      setLoading(true);
      setError(null);
      
      try {
        const response = await fetch('/api/languages');
        
        if (!response.ok) {
          throw new Error('Failed to fetch languages');
        }
        
        const data = await response.json();
        setLanguages(data);
      } catch (err) {
        console.error('Error fetching languages:', err);
        setError('Failed to load language list. Please try again later.');
      } finally {
        setLoading(false);
      }
    }
    
    fetchLanguages();
  }, []);
  
  return (
    <Layout>
      <div className="container py-8">
        <h1 className="text-3xl font-bold mb-8">Browse Subtitles by Language</h1>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}
        
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
            <p className="mt-2 text-gray-600">Loading languages...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {languages.map((language) => (
              <Link
                key={language.lang}
                href={`/search?lang=${encodeURIComponent(language.lang)}`}
                className="bg-white rounded-lg shadow-sm p-6 transition hover:shadow-md hover:border-blue-200 border border-transparent"
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium text-lg">{language.lang}</span>
                  <span className="text-blue-600">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                      <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd"></path>
                    </svg>
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
} 