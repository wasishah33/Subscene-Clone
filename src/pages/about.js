import Layout from '../components/Layout';

export default function AboutPage() {
  return (
    <Layout>
      <div className="container py-8">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold mb-6">About Subscene</h1>
          
          <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4">Our Mission</h2>
            <p className="text-gray-700 mb-4">
              At Subscene, our mission is to provide a comprehensive and user-friendly platform for searching and accessing subtitles for movies and TV shows. With over 2 million subtitle entries in our database, we aim to be the go-to resource for subtitle enthusiasts worldwide.
            </p>
            <p className="text-gray-700">
              We believe in making content accessible to everyone, regardless of language barriers. By providing subtitles in multiple languages, we help viewers enjoy media content from around the world.
            </p>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4">Our Database</h2>
            <p className="text-gray-700 mb-4">
              Our subtitle database features:
            </p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2">
              <li>Over 2 million subtitle entries</li>
              <li>Multiple language options</li>
              <li>Subtitles for the latest movies and TV shows</li>
              <li>Community-contributed subtitle files</li>
              <li>Advanced search capabilities by title, IMDb ID, and more</li>
            </ul>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold mb-4">Contact Information</h2>
            <p className="text-gray-700 mb-4">
              We value your feedback and inquiries. If you have any questions or suggestions, please don't hesitate to reach out to us.
            </p>
            <div className="text-gray-700">
              <p className="mb-2">
                <strong>Email:</strong> support@subscene-example.com
              </p>
              <p>
                <strong>Social Media:</strong> Follow us on Twitter @SubsceneExample
              </p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
} 