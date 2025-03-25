import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '../components/Layout';
import SearchBar from '../components/SearchBar';
import SubtitleList from '../components/SubtitleList';

export default function SearchPage() {
  const router = useRouter();
  const { search, lang, page = 1, limit = 20, sortBy = 'date', sortOrder = 'desc' } = router.query;
  
  const [subtitles, setSubtitles] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Fetch search results when query params change
  useEffect(() => {
    // Skip initial render before router is ready
    if (!router.isReady) return;
    
    async function fetchResults() {
      setLoading(true);
      setError(null);
      
      try {
        // Build the query URL with all parameters
        const params = new URLSearchParams();
        
        if (search) params.append('search', search);
        if (lang) params.append('lang', lang);
        if (page) params.append('page', page);
        if (limit) params.append('limit', limit);
        if (sortBy) params.append('sortBy', sortBy);
        if (sortOrder) params.append('sortOrder', sortOrder);
        
        const response = await fetch(`/api/subtitles?${params.toString()}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch subtitles');
        }
        
        const data = await response.json();
        setSubtitles(data.data);
        setPagination(data.pagination);
      } catch (err) {
        console.error('Search error:', err);
        setError('Failed to fetch results. Please try again.');
      } finally {
        setLoading(false);
      }
    }
    
    fetchResults();
  }, [router.isReady, search, lang, page, limit, sortBy, sortOrder]);
  
  // Handle search submission from the search bar
  const handleSearch = ({ search: newSearch, lang: newLang }) => {
    const query = {
      ...(newSearch ? { search: newSearch } : {}),
      ...(newLang ? { lang: newLang } : {}),
      page: 1, // Reset to first page on new search
    };
    
    router.push({
      pathname: '/search',
      query,
    });
  };
  
  return (
    <Layout>
      <div className="container py-8">
        <h1 className="text-3xl font-bold mb-6">Search Subtitles</h1>
        
        <div className="bg-white p-6 rounded-lg shadow-md mb-8">
          <SearchBar
            initialSearch={search}
            initialLanguage={lang}
            onSearch={handleSearch}
          />
        </div>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-md mb-6">
            <p className="flex items-center">
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"></path>
              </svg>
              {error}
            </p>
          </div>
        )}
        
        <SubtitleList
          subtitles={subtitles}
          pagination={pagination}
          loading={loading}
        />
      </div>
    </Layout>
  );
} 