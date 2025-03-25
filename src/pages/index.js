import { useState } from 'react';
import { useRouter } from 'next/router';
import Layout from '../components/Layout';
import SearchBar from '../components/SearchBar';
import LatestMovies from '../components/LatestMovies';

export default function HomePage() {
  const router = useRouter();
  
  const handleSearch = ({ search, lang }) => {
    const params = new URLSearchParams();
    
    if (search) {
      params.append('search', search);
    }
    
    if (lang) {
      params.append('lang', lang);
    }
    
    router.push(`/search?${params.toString()}`);
  };
  
  return (
    <Layout>
      <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white">
        <div className="container py-16">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl font-bold mb-4">Find the Perfect Subtitles for Your Movies and TV Shows</h1>
            <p className="text-xl mb-8">Search through our database of over 3 million subtitles in multiple languages</p>
            
            <div className="bg-white p-6 rounded-lg shadow-xl">
              <SearchBar onSearch={handleSearch} />
            </div>
          </div>
        </div>
      </section>
      
      {/* Latest Movies Section */}
      <section className="py-12">
        <div className="container">
          <LatestMovies limit={10} />
        </div>
      </section>
      
      <section className="py-12 bg-gray-100">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-sm text-center">
              <div className="text-blue-600 font-bold text-2xl mb-2">3M+</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Subtitles</h3>
              <p className="text-gray-600">Access our vast library of subtitles for movies and TV shows</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm text-center">
              <div className="text-blue-600 font-bold text-2xl mb-2">Multiple</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Languages</h3>
              <p className="text-gray-600">Find subtitles in dozens of languages from around the world</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm text-center">
              <div className="text-blue-600 font-bold text-2xl mb-2">Fast</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Search</h3>
              <p className="text-gray-600">Our optimized search helps you find what you need quickly</p>
            </div>
          </div>
        </div>
      </section>
      
      <section className="py-12">
        <div className="container">
          <h2 className="text-3xl font-bold text-center mb-8">How to Use</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center text-xl font-bold mb-4">1</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Search for a Movie</h3>
              <p className="text-gray-600">Enter the movie title, IMDb ID, or release information in the search box</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center text-xl font-bold mb-4">2</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Filter Results</h3>
              <p className="text-gray-600">Choose your preferred language and narrow down the search results</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center text-xl font-bold mb-4">3</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Download Subtitles</h3>
              <p className="text-gray-600">Click the download button to get the subtitle file you need</p>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
} 