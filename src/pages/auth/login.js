import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Head from 'next/head';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';

// Validation schema using Yup
const LoginSchema = Yup.object().shape({
  username: Yup.string()
    .required('Username or email is required'),
  password: Yup.string()
    .required('Password is required'),
});

export default function Login() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const { redirect } = router.query;

  // Check if user is already logged in
  useEffect(() => {
    // Check if user already exists in local storage
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/user');
        if (response.ok) {
          // User is already logged in, redirect to home or requested page
          const redirectPath = redirect || '/';
          router.push(redirectPath);
        }
      } catch (error) {
        // User is not logged in, allow login
        console.error('Auth check error:', error);
      }
    };

    checkAuth();
  }, [router, redirect]);

  // Handle form submission
  const handleSubmit = async (values, { setSubmitting }) => {
    setIsSubmitting(true);
    setError('');

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: values.username,
          password: values.password,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Login successful, redirect to home or requested page
        const redirectPath = redirect || '/';
        router.push(redirectPath);
      } else {
        setError(data.message || 'Login failed. Please try again.');
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setSubmitting(false);
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Head>
        <title>Login | Subscene</title>
        <meta name="description" content="Sign in to your Subscene account" />
      </Head>

      <div className="max-w-md mx-auto my-10 bg-white p-8 rounded-xl shadow-md">
        <h1 className="text-2xl font-bold text-center mb-6">Sign In</h1>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4" role="alert">
            <span className="block sm:inline">{error}</span>
          </div>
        )}

        <Formik
          initialValues={{
            username: '',
            password: '',
          }}
          validationSchema={LoginSchema}
          onSubmit={handleSubmit}
        >
          {({ isSubmitting, errors, touched }) => (
            <Form>
              <div className="mb-4">
                <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                  Username or Email
                </label>
                <Field
                  id="username"
                  name="username"
                  type="text"
                  className={`w-full px-3 py-2 border ${
                    errors.username && touched.username ? 'border-red-500' : 'border-gray-300'
                  } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500`}
                />
                <ErrorMessage name="username" component="div" className="mt-1 text-sm text-red-600" />
              </div>

              <div className="mb-6">
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <Field
                  id="password"
                  name="password"
                  type="password"
                  className={`w-full px-3 py-2 border ${
                    errors.password && touched.password ? 'border-red-500' : 'border-gray-300'
                  } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500`}
                />
                <ErrorMessage name="password" component="div" className="mt-1 text-sm text-red-600" />
              </div>

              <div className="mb-6">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
                    isSubmitting ? 'opacity-75 cursor-not-allowed' : ''
                  }`}
                >
                  {isSubmitting ? 'Signing In...' : 'Sign In'}
                </button>
              </div>
            </Form>
          )}
        </Formik>

        <div className="text-center mt-4">
          <p className="text-sm text-gray-600">
            Don't have an account?{' '}
            <Link href="/auth/register" className="font-medium text-indigo-600 hover:text-indigo-500">
              Register
            </Link>
          </p>
        </div>
      </div>
    </>
  );
} 