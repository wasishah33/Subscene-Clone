import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';

// Validation schema using Yup
const UploadSchema = Yup.object().shape({
  title: Yup.string()
    .min(3, 'Title must be at least 3 characters')
    .max(100, 'Title must be less than 100 characters')
    .required('Title is required'),
  imdb: Yup.string()
    .matches(/^tt\d{7,8}$/, 'IMDb ID must be in the format tt1234567')
    .required('IMDb ID is required'),
  lang: Yup.string()
    .required('Language is required'),
  authorName: Yup.string()
    .max(50, 'Author name must be less than 50 characters'),
  releases: Yup.string()
    .max(200, 'Release info must be less than 200 characters'),
  comment: Yup.string()
    .max(500, 'Comment must be less than 500 characters'),
  subtitle: Yup.mixed()
    .required('Subtitle file is required')
    .test(
      'fileType',
      'Only ZIP files are accepted',
      value => value && value.type === 'application/zip' || (value && value.name && value.name.endsWith('.zip'))
    )
    .test(
      'fileSize',
      'File is too large. Maximum size is 10MB',
      value => value && value.size <= 10 * 1024 * 1024
    ),
});

// Language options
const languageOptions = [
  { value: '', label: 'Select a language' },
  { value: 'english', label: 'English' },
  { value: 'spanish', label: 'Spanish' },
  { value: 'french', label: 'French' },
  { value: 'german', label: 'German' },
  { value: 'italian', label: 'Italian' },
  { value: 'portuguese', label: 'Portuguese' },
  { value: 'arabic', label: 'Arabic' },
  { value: 'chinese', label: 'Chinese' },
  { value: 'japanese', label: 'Japanese' },
  { value: 'korean', label: 'Korean' },
  { value: 'russian', label: 'Russian' },
  { value: 'turkish', label: 'Turkish' },
  { value: 'vietnamese', label: 'Vietnamese' },
  { value: 'other', label: 'Other' },
];

export default function UploadSubtitle() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [user, setUser] = useState(null);
  const router = useRouter();

  // Check if user is authenticated
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/user');
        
        if (response.ok) {
          const data = await response.json();
          setIsAuthenticated(true);
          setUser(data.user);
        } else {
          // Not authenticated, redirect to login
          router.push('/auth/login?redirect=/subtitles/upload');
        }
      } catch (error) {
        console.error('Auth check error:', error);
        // Not authenticated or error, redirect to login
        router.push('/auth/login?redirect=/subtitles/upload');
      }
    };

    checkAuth();
  }, [router]);

  // Handle form submission
  const handleSubmit = async (values, { setSubmitting, resetForm }) => {
    setIsSubmitting(true);
    setError('');
    setSuccess('');

    // Create form data
    const formData = new FormData();
    formData.append('title', values.title);
    formData.append('imdb', values.imdb);
    formData.append('lang', values.lang);
    formData.append('authorName', values.authorName || '');
    formData.append('releases', values.releases || '');
    formData.append('comment', values.comment || '');
    formData.append('subtitle', values.subtitle);

    try {
      const response = await fetch('/api/subtitles/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess('Subtitle uploaded successfully!');
        resetForm();
        // Redirect to the uploaded subtitle page after 2 seconds
        setTimeout(() => {
          router.push(`/subtitles/${data.upload.id}`);
        }, 2000);
      } else {
        setError(data.message || 'Upload failed. Please try again.');
      }
    } catch (error) {
      console.error('Upload error:', error);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setSubmitting(false);
      setIsSubmitting(false);
    }
  };

  // Show loading state while checking authentication
  if (!isAuthenticated && !user) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Upload Subtitle | Subscene</title>
        <meta name="description" content="Upload your subtitles to share with the community" />
      </Head>

      <div className="max-w-2xl mx-auto my-10 bg-white p-8 rounded-xl shadow-md">
        <h1 className="text-2xl font-bold text-center mb-6">Upload Subtitle</h1>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4" role="alert">
            <span className="block sm:inline">{error}</span>
          </div>
        )}

        {success && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4" role="alert">
            <span className="block sm:inline">{success}</span>
          </div>
        )}

        <Formik
          initialValues={{
            title: '',
            imdb: '',
            lang: '',
            authorName: user?.fullName || '',
            releases: '',
            comment: '',
            subtitle: null,
          }}
          validationSchema={UploadSchema}
          onSubmit={handleSubmit}
        >
          {({ isSubmitting, errors, touched, setFieldValue }) => (
            <Form>
              <div className="mb-4">
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                  Movie/TV Show Title *
                </label>
                <Field
                  id="title"
                  name="title"
                  type="text"
                  placeholder="e.g. The Matrix (1999)"
                  className={`w-full px-3 py-2 border ${
                    errors.title && touched.title ? 'border-red-500' : 'border-gray-300'
                  } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500`}
                />
                <ErrorMessage name="title" component="div" className="mt-1 text-sm text-red-600" />
              </div>

              <div className="mb-4">
                <label htmlFor="imdb" className="block text-sm font-medium text-gray-700 mb-1">
                  IMDb ID *
                </label>
                <Field
                  id="imdb"
                  name="imdb"
                  type="text"
                  placeholder="e.g. tt0133093"
                  className={`w-full px-3 py-2 border ${
                    errors.imdb && touched.imdb ? 'border-red-500' : 'border-gray-300'
                  } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500`}
                />
                <div className="mt-1 text-xs text-gray-500">
                  Find this in the IMDb URL: imdb.com/title/<span className="font-mono">tt0133093</span>/
                </div>
                <ErrorMessage name="imdb" component="div" className="mt-1 text-sm text-red-600" />
              </div>

              <div className="mb-4">
                <label htmlFor="lang" className="block text-sm font-medium text-gray-700 mb-1">
                  Language *
                </label>
                <Field
                  as="select"
                  id="lang"
                  name="lang"
                  className={`w-full px-3 py-2 border ${
                    errors.lang && touched.lang ? 'border-red-500' : 'border-gray-300'
                  } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500`}
                >
                  {languageOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </Field>
                <ErrorMessage name="lang" component="div" className="mt-1 text-sm text-red-600" />
              </div>

              <div className="mb-4">
                <label htmlFor="authorName" className="block text-sm font-medium text-gray-700 mb-1">
                  Author Name
                </label>
                <Field
                  id="authorName"
                  name="authorName"
                  type="text"
                  className={`w-full px-3 py-2 border ${
                    errors.authorName && touched.authorName ? 'border-red-500' : 'border-gray-300'
                  } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500`}
                />
                <div className="mt-1 text-xs text-gray-500">
                  Leave blank to use your username
                </div>
                <ErrorMessage name="authorName" component="div" className="mt-1 text-sm text-red-600" />
              </div>

              <div className="mb-4">
                <label htmlFor="releases" className="block text-sm font-medium text-gray-700 mb-1">
                  Release Information
                </label>
                <Field
                  id="releases"
                  name="releases"
                  type="text"
                  placeholder="e.g. WEBDL, BluRay, 1080p"
                  className={`w-full px-3 py-2 border ${
                    errors.releases && touched.releases ? 'border-red-500' : 'border-gray-300'
                  } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500`}
                />
                <ErrorMessage name="releases" component="div" className="mt-1 text-sm text-red-600" />
              </div>

              <div className="mb-4">
                <label htmlFor="comment" className="block text-sm font-medium text-gray-700 mb-1">
                  Comments
                </label>
                <Field
                  as="textarea"
                  id="comment"
                  name="comment"
                  rows="3"
                  className={`w-full px-3 py-2 border ${
                    errors.comment && touched.comment ? 'border-red-500' : 'border-gray-300'
                  } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500`}
                />
                <ErrorMessage name="comment" component="div" className="mt-1 text-sm text-red-600" />
              </div>

              <div className="mb-6">
                <label htmlFor="subtitle" className="block text-sm font-medium text-gray-700 mb-1">
                  Subtitle File (ZIP) *
                </label>
                <input
                  id="subtitle"
                  name="subtitle"
                  type="file"
                  accept=".zip"
                  onChange={(event) => {
                    setFieldValue("subtitle", event.currentTarget.files[0]);
                  }}
                  className={`w-full px-3 py-2 border ${
                    errors.subtitle && touched.subtitle ? 'border-red-500' : 'border-gray-300'
                  } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500`}
                />
                <div className="mt-1 text-xs text-gray-500">
                  Only ZIP files up to 10MB are accepted
                </div>
                <ErrorMessage name="subtitle" component="div" className="mt-1 text-sm text-red-600" />
              </div>

              <div className="mb-6">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
                    isSubmitting ? 'opacity-75 cursor-not-allowed' : ''
                  }`}
                >
                  {isSubmitting ? 'Uploading...' : 'Upload Subtitle'}
                </button>
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </>
  );
} 