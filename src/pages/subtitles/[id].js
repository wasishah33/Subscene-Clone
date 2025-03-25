import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Head from 'next/head';
import Layout from '../../components/Layout';
import MediaDetails from '../../components/MediaDetails';

// Environment check to control debug visibility
const isDev = process.env.NODE_ENV === 'development';
const SHOW_DEBUG = false; // Set to false to hide debug info even in development

export default function SubtitleDetailPage() {
  const router = useRouter();
  const { id, slug } = router.query;
  
  const [subtitle, setSubtitle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [debugInfo, setDebugInfo] = useState(null);
  
  useEffect(() => {
    if (!id) return;
    
    async function fetchSubtitle() {
      setLoading(true);
      setError(null);
      
      try {
        console.log('SubtitleDetail: Fetching subtitle with ID:', id);
        const response = await fetch(`/api/subtitles/${id}`);
        
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error('Subtitle not found');
          }
          throw new Error('Failed to fetch subtitle details');
        }
        
        const data = await response.json();
        console.log('SubtitleDetail: Subtitle data received:', data);
        setSubtitle(data);
        
        // If we have subtitle data but URL doesn't include a slug, redirect to the URL with slug
        if (data && !slug) {
          const generatedSlug = generateSlug(data.title);
          router.replace(`/subtitles/${id}/${generatedSlug}`, undefined, { shallow: true });
        }
        
        // Set debug info (will not be displayed unless SHOW_DEBUG is true)
        setDebugInfo({
          hasImdbId: !!data.imdb,
          imdbIdValue: data.imdb,
          imdbIdType: typeof data.imdb,
          generatedSlug: generateSlug(data.title)
        });
      } catch (err) {
        console.error('Error fetching subtitle:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    
    fetchSubtitle();
  }, [id, slug, router]);
  
  // Helper function to generate a URL-friendly slug from a title
  const generateSlug = (title) => {
    if (!title) return '';
    return title
      .toLowerCase()
      .replace(/[^\w\s-]/g, '') // Remove special characters
      .replace(/\s+/g, '-')     // Replace spaces with hyphens
      .replace(/--+/g, '-')     // Replace multiple hyphens with a single one
      .trim();
  };
  
  // Prepare meta tags
  const getMetaTags = () => {
    if (!subtitle) return null;
    
    const title = `${subtitle.title} Subtitles in ${subtitle.lang} | Subscene`;
    const description = `Download ${subtitle.title} subtitles in ${subtitle.lang}${subtitle.author_name ? ` by ${subtitle.author_name}` : ''}. High-quality subtitles for movies and TV shows.`;
    
    return (
      <Head>
        <title>{title}</title>
        <meta name="description" content={description} />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={`${process.env.NEXT_PUBLIC_SITE_URL || ''}/subtitles/${id}/${slug}`} />
        {subtitle.imdb && <meta property="og:video:tag" content={subtitle.imdb} />}
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content={title} />
        <meta name="twitter:description" content={description} />
      </Head>
    );
  };
  
  if (loading) {
    return (
      <Layout>
        <Head>
          <title>Loading Subtitle Details | Subscene</title>
        </Head>
        <div className="container py-8 text-center">
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
          <p className="mt-4 text-gray-600">Loading subtitle details...</p>
        </div>
      </Layout>
    );
  }
  
  if (error) {
    return (
      <Layout>
        <Head>
          <title>Error | Subscene</title>
          <meta name="robots" content="noindex" />
        </Head>
        <div className="container py-8">
          <div className="bg-red-100 border border-red-400 text-red-700 px-6 py-4 rounded">
            <h2 className="text-xl font-bold mb-2">Error</h2>
            <p>{error}</p>
            <div className="mt-4">
              <Link href="/search" className="text-blue-600 hover:underline">
                Return to search
              </Link>
            </div>
          </div>
        </div>
      </Layout>
    );
  }
  
  if (!subtitle) return null;
  
  return (
    <Layout>
      {getMetaTags()}
      
      <div className="container py-8">
        <div className="mb-6">
          <Link href="/search" className="text-blue-600 hover:underline flex items-center">
            <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to search
          </Link>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h1 className="text-2xl font-bold text-gray-900">{subtitle.title}</h1>
            {subtitle.imdb && (
              <a 
                href={`https://www.imdb.com/title/${subtitle.imdb}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline mt-1 inline-block"
              >
                {subtitle.imdb}
              </a>
            )}
          </div>
          
          {/* Debug Info - Only shown if explicitly enabled */}
          {isDev && SHOW_DEBUG && debugInfo && (
            <div className="p-4 bg-yellow-50 border-b border-yellow-200">
              <h3 className="text-sm font-medium text-yellow-800 mb-1">Debug Information</h3>
              <pre className="text-xs bg-gray-100 p-2 rounded overflow-auto">
                {JSON.stringify(debugInfo, null, 2)}
              </pre>
            </div>
          )}
          
          {/* Movie/TV Show Details from TMDB */}
          {subtitle.imdb && (
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Media Information</h2>
              <MediaDetails 
                imdbId={subtitle.imdb} 
                title={subtitle.title} 
              />
              
              {/* Fallback message */}
              <div className="mt-4 py-3 px-4 bg-gray-50 text-gray-700 text-sm rounded">
                <p>Unable to load media details? Try viewing the title on:</p>
                <div className="mt-2 space-x-3">
                  <a 
                    href={`https://www.imdb.com/title/${subtitle.imdb}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline text-sm"
                  >
                    IMDb
                  </a>
                  <a 
                    href={`https://www.themoviedb.org/search?query=${encodeURIComponent(subtitle.title)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline text-sm"
                  >
                    TMDB
                  </a>
                </div>
              </div>
            </div>
          )}
          
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h2 className="text-lg font-medium text-gray-900 mb-4">Subtitle Details</h2>
                
                <div className="space-y-3">
                  <div>
                    <span className="text-gray-500">Language:</span>{' '}
                    <span className="font-medium">{subtitle.lang}</span>
                  </div>
                  
                  <div>
                    <span className="text-gray-500">Author:</span>{' '}
                    <span className="font-medium">{subtitle.author_name}</span>
                  </div>
                  
                  <div>
                    <span className="text-gray-500">Date Added:</span>{' '}
                    <span className="font-medium">{new Date(subtitle.date).toLocaleDateString()}</span>
                  </div>
                  
                  {subtitle.releases && (
                    <div>
                      <span className="text-gray-500">Compatible Releases:</span>
                      <div className="mt-1 text-sm">
                        {subtitle.releases.split(',').map((release, index) => (
                          <span 
                            key={index} 
                            className="inline-block bg-gray-100 rounded px-2 py-1 mr-2 mb-2"
                          >
                            {release.trim()}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              <div>
                <h2 className="text-lg font-medium text-gray-900 mb-4">Download</h2>
                
                {subtitle.fileLink ? (
                  <a 
                    href={subtitle.fileLink}
                    className="btn block text-center"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Download Subtitle
                  </a>
                ) : (
                  <div className="text-gray-500 italic">
                    Direct download link not available.
                    {subtitle.subscene_link && (
                      <div className="mt-2">
                        <a 
                          href={subtitle.subscene_link}
                          className="text-blue-600 hover:underline"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          View on original source
                        </a>
                      </div>
                    )}
                  </div>
                )}
                
                {subtitle.comment && (
                  <div className="mt-6">
                    <h3 className="text-md font-medium text-gray-900 mb-2">Notes</h3>
                    <div className="bg-gray-50 p-3 rounded text-sm">
                      {subtitle.comment}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
} 