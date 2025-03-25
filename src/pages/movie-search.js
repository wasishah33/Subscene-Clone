import { useState } from 'react';
import Layout from '../components/Layout';
import { searchMedia, getImageUrl } from '../api/tmdb';
import Link from 'next/link';

export default function MovieSearchPage() {
  const [query, setQuery] = useState('');
  const [mediaType, setMediaType] = useState('movie');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searched, setSearched] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    
    if (!query.trim()) return;
    
    setLoading(true);
    setError(null);
    setSearched(true);
    
    try {
      const searchResults = await searchMedia(query, mediaType);
      setResults(searchResults);
      
      if (searchResults.length === 0) {
        setError('No results found. Try a different search term.');
      }
    } catch (err) {
      console.error('Search error:', err);
      setError('Failed to fetch results. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="container py-8">
        <h1 className="text-3xl font-bold mb-6">Movie & TV Show Search</h1>
        
        <div className="bg-white p-6 rounded-lg shadow-md mb-8">
          <form onSubmit={handleSearch} className="space-y-5">
            <div>
              <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
                Search Term
              </label>
              <div className="relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                  </svg>
                </div>
                <input
                  type="text"
                  id="search"
                  className="block w-full pl-10 pr-3 py-2.5 text-gray-900 placeholder-gray-500 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter movie or TV show title"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  required
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Media Type
              </label>
              <div className="flex items-center space-x-6">
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    className="form-radio h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                    value="movie"
                    checked={mediaType === 'movie'}
                    onChange={() => setMediaType('movie')}
                  />
                  <span className="ml-2 text-gray-700">Movies</span>
                </label>
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    className="form-radio h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                    value="tv"
                    checked={mediaType === 'tv'}
                    onChange={() => setMediaType('tv')}
                  />
                  <span className="ml-2 text-gray-700">TV Shows</span>
                </label>
              </div>
            </div>
            
            <div>
              <button
                type="submit"
                className="flex items-center justify-center px-6 py-2.5 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all"
                disabled={loading}
              >
                {loading ? (
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
          </form>
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
        
        {loading && (
          <div className="text-center py-12">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
            <p className="mt-2 text-gray-600">Searching...</p>
          </div>
        )}
        
        {searched && !loading && results.length > 0 && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold">
              {results.length} {results.length === 1 ? 'Result' : 'Results'} for "{query}"
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {results.map((item) => (
                <div key={item.id} className="bg-white rounded-lg shadow-sm overflow-hidden">
                  {item.poster_path ? (
                    <img 
                      src={getImageUrl(item.poster_path)}
                      alt={item.title || item.name}
                      className="w-full h-64 object-cover"
                    />
                  ) : (
                    <div className="w-full h-64 bg-gray-200 flex items-center justify-center">
                      <span className="text-gray-500">No image available</span>
                    </div>
                  )}
                  
                  <div className="p-4">
                    <h3 className="text-lg font-medium text-gray-900">
                      {mediaType === 'movie' ? item.title : item.name}
                      {(item.release_date || item.first_air_date) && (
                        <span className="text-gray-500 text-sm ml-2">
                          ({new Date(mediaType === 'movie' ? item.release_date : item.first_air_date).getFullYear()})
                        </span>
                      )}
                    </h3>
                    
                    {item.vote_average > 0 && (
                      <div className="mt-1 mb-2">
                        <span className="inline-block bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full text-xs font-semibold">
                          {item.vote_average.toFixed(1)}/10
                        </span>
                      </div>
                    )}
                    
                    {item.overview && (
                      <p className="text-sm text-gray-700 mt-2 line-clamp-3">
                        {item.overview}
                      </p>
                    )}
                    
                    <div className="mt-4 flex space-x-2">
                      <a 
                        href={`https://www.themoviedb.org/${mediaType}/${item.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline text-sm"
                      >
                        View on TMDB
                      </a>
                      <Link
                        href={`/search?search=${encodeURIComponent(mediaType === 'movie' ? item.title : item.name)}`}
                        className="text-green-600 hover:underline text-sm"
                      >
                        Find Subtitles
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
} 