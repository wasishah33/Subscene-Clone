import Link from 'next/link';
import { getImageUrl } from '../api/tmdb';

/**
 * Movie card component for displaying a single movie from TMDB
 * @param {Object} props - Component props
 * @param {Object} props.movie - Movie data from TMDB
 */
export default function MovieCard({ movie }) {
  if (!movie) return null;
  
  const {
    id,
    title,
    poster_path,
    release_date,
    vote_average,
    overview
  } = movie;
  
  // Format release date
  const releaseYear = release_date ? new Date(release_date).getFullYear() : null;
  
  // Truncate overview to 120 characters
  const truncatedOverview = overview && overview.length > 120 
    ? `${overview.substring(0, 120).trim()}...` 
    : overview;
  
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden transition-transform hover:shadow-lg hover:scale-[1.02]">
      <div className="relative pb-[150%] overflow-hidden">
        {poster_path ? (
          <img 
            src={getImageUrl(poster_path, 'w500')} 
            alt={`${title} poster`}
            className="absolute inset-0 w-full h-full object-cover" 
          />
        ) : (
          <div className="absolute inset-0 w-full h-full bg-gray-200 flex items-center justify-center text-gray-400">
            No image available
          </div>
        )}
        
        {vote_average > 0 && (
          <div className="absolute top-2 right-2 bg-blue-600 text-white rounded-full w-10 h-10 flex items-center justify-center text-sm font-bold">
            {Math.round(vote_average * 10) / 10}
          </div>
        )}
      </div>
      
      <div className="p-4">
        <h3 className="font-bold text-gray-900 text-lg mb-1 truncate">
          {title}
          {releaseYear && <span className="text-gray-600 font-normal ml-1">({releaseYear})</span>}
        </h3>
        
        {truncatedOverview && (
          <p className="text-gray-600 text-sm mb-3 line-clamp-2">
            {truncatedOverview}
          </p>
        )}
        
        <div className="flex justify-between items-center">
          <a
            href={`https://www.themoviedb.org/movie/${id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline text-sm"
          >
            View on TMDB
          </a>
          
          <Link href={`/search?q=${encodeURIComponent(title)}`} className="text-green-600 hover:underline text-sm">
            Find subtitles
          </Link>
        </div>
      </div>
    </div>
  );
} 