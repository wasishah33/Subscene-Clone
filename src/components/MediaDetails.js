import { useState, useEffect } from 'react';
import { findByImdbId, getMovieDetails, getTvDetails, getImageUrl } from '../api/tmdb';
import styles from '../styles/MediaDetails.module.css';

// Environment check to control debug visibility
const isDev = process.env.NODE_ENV === 'development';
const SHOW_DEBUG = false; // Set to false to hide debug info even in development

/**
 * Component to display media details from TMDB based on IMDb ID
 * @param {Object} props - Component props
 * @param {string} props.imdbId - IMDb ID (with or without 'tt' prefix)
 * @param {string} [props.title] - Optional title for fallback search if IMDb ID not found
 */
export default function MediaDetails({ imdbId, title }) {
  const [mediaDetails, setMediaDetails] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [debugInfo, setDebugInfo] = useState({});

  useEffect(() => {
    const fetchMediaDetails = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        console.log('MediaDetails: Starting to fetch details', { imdbId, title });
        
        // Store debug info about the IMDb ID
        let safeImdbId = imdbId;
        let originalImdbId = imdbId;
        
        // Handle null or undefined IMDb ID
        if (!imdbId && !title) {
          console.warn('MediaDetails: No IMDb ID or title provided');
          setError('No media identifier provided');
          setIsLoading(false);
          
          setDebugInfo({
            error: 'No IMDb ID or title provided',
            imdbId: null,
            title
          });
          return;
        }
        
        // Basic cleanup of IMDb ID if it exists
        if (imdbId) {
          // Convert to string if it's not already
          if (typeof imdbId !== 'string') {
            safeImdbId = String(imdbId).trim();
            console.log('MediaDetails: Converted IMDb ID to string:', safeImdbId);
          } else {
            safeImdbId = imdbId.trim();
          }
          
          // Add 'tt' prefix if missing
          if (safeImdbId && !safeImdbId.startsWith('tt')) {
            safeImdbId = `tt${safeImdbId}`;
            console.log('MediaDetails: Added tt prefix to IMDb ID:', safeImdbId);
          }
        }
        
        // Set detailed debug info
        setDebugInfo({
          originalImdbId: originalImdbId,
          imdbIdType: typeof originalImdbId,
          imdbIdPresent: Boolean(originalImdbId),
          safeImdbId: safeImdbId,
          title
        });
        
        // First, try to find by IMDb ID if available
        if (safeImdbId) {
          console.log('MediaDetails: Searching by IMDb ID:', safeImdbId);
          const mediaByImdbId = await findByImdbId(safeImdbId);
          
          // Update debug info with search results
          setDebugInfo(prev => ({ 
            ...prev, 
            foundByImdbId: Boolean(mediaByImdbId),
            mediaTypeFound: mediaByImdbId?.media_type || null,
            tmdbId: mediaByImdbId?.id || null
          }));
          
          if (mediaByImdbId) {
            // We found something by IMDb ID, now get full details
            console.log(`MediaDetails: Found ${mediaByImdbId.media_type}, fetching full details for ID:`, mediaByImdbId.id);
            
            let fullDetails = null;
            if (mediaByImdbId.media_type === 'movie') {
              fullDetails = await getMovieDetails(mediaByImdbId.id);
            } else if (mediaByImdbId.media_type === 'tv') {
              fullDetails = await getTvDetails(mediaByImdbId.id);
            }
            
            if (fullDetails) {
              console.log('MediaDetails: Successfully retrieved full details');
              setMediaDetails({
                ...fullDetails,
                media_type: mediaByImdbId.media_type
              });
              setIsLoading(false);
              return;
            } else {
              console.error('MediaDetails: Failed to get full details');
              setDebugInfo(prev => ({ 
                ...prev, 
                fullDetailsError: 'Failed to get full details for TMDB ID: ' + mediaByImdbId.id 
              }));
            }
          } else {
            console.log('MediaDetails: No results found by IMDb ID:', safeImdbId);
          }
        }
        
        // If we reach here, we either don't have an IMDb ID or couldn't find anything with it
        // As a fallback, try to search by title if provided
        if (title) {
          console.log('MediaDetails: Attempting to search by title as fallback:', title);
          // This would require additional implementation to search by title
          // and is currently not implemented in this component
          setError('Media not found. Searching by title is not implemented yet.');
        } else if (imdbId) {
          setError(`No media found with IMDb ID: ${imdbId}`);
        }
        
      } catch (err) {
        console.error('MediaDetails: Error fetching media details:', err);
        setError('Error loading media details. Please try again later.');
        
        // Add error info to debug
        setDebugInfo(prev => ({ 
          ...prev, 
          error: err.message 
        }));
      }
      
      setIsLoading(false);
    };

    if (imdbId || title) {
      fetchMediaDetails();
    }
  }, [imdbId, title]);

  if (isLoading) {
    return <div className={styles.loading}>Loading media details...</div>;
  }

  if (error) {
    return (
      <div className={styles.error}>
        <p>{error}</p>
        {isDev && SHOW_DEBUG && (
          <div className={styles.debugInfo}>
            <h4>Debug Info:</h4>
            <pre>{JSON.stringify(debugInfo, null, 2)}</pre>
          </div>
        )}
      </div>
    );
  }

  if (!mediaDetails) {
    return (
      <div className={styles.notFound}>
        <p>No media details available</p>
        {isDev && SHOW_DEBUG && (
          <div className={styles.debugInfo}>
            <h4>Debug Info:</h4>
            <pre>{JSON.stringify(debugInfo, null, 2)}</pre>
          </div>
        )}
      </div>
    );
  }

  // Display the media details
  const {
    poster_path,
    title: movieTitle,
    name: tvTitle,
    release_date,
    first_air_date,
    vote_average,
    genres,
    overview,
    id,
    media_type
  } = mediaDetails;

  const displayTitle = movieTitle || tvTitle;
  const releaseYear = release_date 
    ? new Date(release_date).getFullYear() 
    : first_air_date 
      ? new Date(first_air_date).getFullYear() 
      : '';

  return (
    <div className={styles.mediaCard}>
      <div className={styles.mediaPoster}>
        {poster_path ? (
          <img 
            src={getImageUrl(poster_path)} 
            alt={`${displayTitle} poster`} 
          />
        ) : (
          <div className={styles.noPoster}>No poster available</div>
        )}
      </div>
      
      <div className={styles.mediaInfo}>
        <h2>
          {displayTitle}
          {releaseYear && <span className={styles.year}> ({releaseYear})</span>}
        </h2>
        
        {vote_average > 0 && (
          <div className={styles.rating}>
            Rating: {Math.round(vote_average * 10) / 10}/10
          </div>
        )}
        
        {genres && genres.length > 0 && (
          <div className={styles.genres}>
            {genres.map(genre => genre.name).join(', ')}
          </div>
        )}
        
        {overview && (
          <div className={styles.overview}>
            <h3>Overview</h3>
            <p>{overview}</p>
          </div>
        )}
        
        <div className={styles.externalLinks}>
          <a 
            href={`https://www.themoviedb.org/${media_type}/${id}`} 
            target="_blank" 
            rel="noopener noreferrer"
            className={styles.tmdbLink}
          >
            View on TMDB
          </a>
          
          {imdbId && (
            <a 
              href={`https://www.imdb.com/title/${imdbId.startsWith('tt') ? imdbId : `tt${imdbId}`}`} 
              target="_blank" 
              rel="noopener noreferrer"
              className={styles.imdbLink}
            >
              View on IMDb
            </a>
          )}
        </div>
        
        {isDev && SHOW_DEBUG && (
          <div className={styles.debugInfo}>
            <h4>Debug Info:</h4>
            <pre>{JSON.stringify(debugInfo, null, 2)}</pre>
          </div>
        )}
      </div>
    </div>
  );
} 