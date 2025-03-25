import Link from 'next/link';
import { useRouter } from 'next/router';

export default function SubtitleList({ subtitles, pagination, loading }) {
  const router = useRouter();
  
  // Helper function to generate a URL-friendly slug from a title
  const generateSlug = (title) => {
    if (!title) return 'subtitle';
    return title
      .toLowerCase()
      .replace(/[^\w\s-]/g, '') // Remove special characters
      .replace(/\s+/g, '-')     // Replace spaces with hyphens
      .replace(/--+/g, '-')     // Replace multiple hyphens with a single one
      .trim();
  };
  
  if (loading) {
    return (
      <div className="my-8 text-center">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
        <p className="mt-2 text-gray-600">Loading results...</p>
      </div>
    );
  }
  
  if (!subtitles || subtitles.length === 0) {
    return (
      <div className="my-8 p-6 bg-white rounded-lg shadow-sm text-center">
        <h3 className="text-lg font-medium text-gray-900">No results found</h3>
        <p className="mt-2 text-gray-600">Try adjusting your search criteria or browse all subtitles</p>
      </div>
    );
  }
  
  // Handle page change
  const handlePageChange = (newPage) => {
    const query = { ...router.query, page: newPage };
    router.push({
      pathname: router.pathname,
      query,
    });
  };
  
  return (
    <div className="my-6">
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Language</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Author</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {subtitles.map((subtitle) => (
                <tr key={subtitle.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      <Link href={`/subtitles/${subtitle.id}/${generateSlug(subtitle.title)}`} className="hover:text-blue-600">
                        {subtitle.title}
                      </Link>
                    </div>
                    {subtitle.imdb && (
                      <div className="text-xs text-gray-500 mt-1">
                        <a 
                          href={`https://www.imdb.com/title/${subtitle.imdb}`} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="hover:text-blue-500"
                        >
                          {subtitle.imdb}
                        </a>
                      </div>
                    )}
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {subtitle.lang}
                    </span>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {subtitle.author_name}
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(subtitle.date).toLocaleDateString()}
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex space-x-3">
                      <Link href={`/subtitles/${subtitle.id}/${generateSlug(subtitle.title)}`} className="text-blue-600 hover:text-blue-900">
                        Details
                      </Link>
                      {subtitle.fileLink && (
                        <a 
                          href={subtitle.fileLink} 
                          className="text-green-600 hover:text-green-900"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          Download
                        </a>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between bg-white px-4 py-3 sm:px-6 mt-4 rounded-lg shadow">
          <div className="flex-1 flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Showing <span className="font-medium">{Math.min((pagination.page - 1) * pagination.limit + 1, pagination.total)}</span> to{' '}
                <span className="font-medium">{Math.min(pagination.page * pagination.limit, pagination.total)}</span> of{' '}
                <span className="font-medium">{pagination.total}</span> results
              </p>
            </div>
            <div>
              <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                <button
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={!pagination.hasPrev}
                  className={`relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:outline-offset-0 ${
                    !pagination.hasPrev ? 'cursor-not-allowed' : 'hover:text-blue-600'
                  }`}
                >
                  <span className="sr-only">Previous</span>
                  <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z" clipRule="evenodd" />
                  </svg>
                </button>
                
                {/* Generate page numbers */}
                {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                  // Logic to show pages around current page
                  let pageNum;
                  if (pagination.totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (pagination.page <= 3) {
                    pageNum = i + 1;
                  } else if (pagination.page >= pagination.totalPages - 2) {
                    pageNum = pagination.totalPages - 4 + i;
                  } else {
                    pageNum = pagination.page - 2 + i;
                  }
                  
                  return (
                    <button
                      key={pageNum}
                      onClick={() => handlePageChange(pageNum)}
                      disabled={pageNum === pagination.page}
                      className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold ${
                        pageNum === pagination.page
                          ? 'z-10 bg-blue-600 text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600'
                          : 'text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:outline-offset-0'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
                
                <button
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={!pagination.hasMore}
                  className={`relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:outline-offset-0 ${
                    !pagination.hasMore ? 'cursor-not-allowed' : 'hover:text-blue-600'
                  }`}
                >
                  <span className="sr-only">Next</span>
                  <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
                  </svg>
                </button>
              </nav>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 