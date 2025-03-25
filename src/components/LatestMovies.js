import { useState, useEffect } from 'react';
import MovieCard from './MovieCard';
import { getLatestMovies } from '../api/tmdb';

/**
 * Component to display a grid of latest movies
 * @param {Object} props - Component props
 * @param {number} props.limit - Number of movies to display (default: 10)
 */
export default function LatestMovies({ limit = 10 }) {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    async function fetchLatestMovies() {
      try {
        setLoading(true);
        const latestMovies = await getLatestMovies(1, limit);
        setMovies(latestMovies);
      } catch (err) {
        console.error('Error fetching latest movies:', err);
        setError('Failed to load the latest movies. Please try again later.');
      } finally {
        setLoading(false);
      }
    }
    
    fetchLatestMovies();
  }, [limit]);
  
  if (loading) {
    return (
      <div className="py-10 text-center">
        <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
        <p className="mt-4 text-gray-600">Loading latest movies...</p>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded my-4">
        <p>{error}</p>
      </div>
    );
  }
  
  if (!movies || movies.length === 0) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded my-4">
        <p>No movies found at the moment. Please check back later.</p>
      </div>
    );
  }
  
  return (
    <div className="py-4">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        Latest Movies
        <span className="ml-2 text-sm font-normal text-gray-500">
          Find subtitles for the newest releases
        </span>
      </h2>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
        {movies.map(movie => (
          <MovieCard key={movie.id} movie={movie} />
        ))}
      </div>
    </div>
  );
} 