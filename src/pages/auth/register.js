import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Head from 'next/head';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';

// Validation schema using Yup
const RegisterSchema = Yup.object().shape({
  username: Yup.string()
    .min(3, 'Username must be at least 3 characters')
    .max(20, 'Username must be less than 20 characters')
    .matches(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers and underscore')
    .required('Username is required'),
  email: Yup.string()
    .email('Invalid email address')
    .required('Email is required'),
  password: Yup.string()
    .min(8, 'Password must be at least 8 characters')
    .required('Password is required'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password'), null], 'Passwords must match')
    .required('Confirm Password is required'),
  fullName: Yup.string()
    .min(2, 'Full Name must be at least 2 characters')
});

export default function Register() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const router = useRouter();

  // Check if user is already logged in
  useEffect(() => {
    // Check if user already exists in local storage
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/user');
        if (response.ok) {
          // User is already logged in, redirect to home
          router.push('/');
        }
      } catch (error) {
        // User is not logged in, allow registration
        console.error('Auth check error:', error);
      }
    };

    checkAuth();
  }, [router]);

  // Handle form submission
  const handleSubmit = async (values, { setSubmitting, resetForm }) => {
    setIsSubmitting(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: values.username,
          email: values.email,
          password: values.password,
          fullName: values.fullName || '',
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess('Registration successful! Redirecting to login...');
        resetForm();
        // Redirect to login page after 2 seconds
        setTimeout(() => router.push('/auth/login'), 2000);
      } else {
        setError(data.message || 'Registration failed. Please try again.');
      }
    } catch (error) {
      console.error('Registration error:', error);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setSubmitting(false);
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Head>
        <title>Register | Subscene</title>
        <meta name="description" content="Create a new account on Subscene to upload and manage subtitles" />
      </Head>

      <div className="max-w-md mx-auto my-10 bg-white p-8 rounded-xl shadow-md">
        <h1 className="text-2xl font-bold text-center mb-6">Create Account</h1>
        
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
            username: '',
            email: '',
            password: '',
            confirmPassword: '',
            fullName: '',
          }}
          validationSchema={RegisterSchema}
          onSubmit={handleSubmit}
        >
          {({ isSubmitting, errors, touched }) => (
            <Form>
              <div className="mb-4">
                <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                  Username *
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

              <div className="mb-4">
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email *
                </label>
                <Field
                  id="email"
                  name="email"
                  type="email"
                  className={`w-full px-3 py-2 border ${
                    errors.email && touched.email ? 'border-red-500' : 'border-gray-300'
                  } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500`}
                />
                <ErrorMessage name="email" component="div" className="mt-1 text-sm text-red-600" />
              </div>

              <div className="mb-4">
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  Password *
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

              <div className="mb-4">
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                  Confirm Password *
                </label>
                <Field
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  className={`w-full px-3 py-2 border ${
                    errors.confirmPassword && touched.confirmPassword ? 'border-red-500' : 'border-gray-300'
                  } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500`}
                />
                <ErrorMessage name="confirmPassword" component="div" className="mt-1 text-sm text-red-600" />
              </div>

              <div className="mb-6">
                <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name (Optional)
                </label>
                <Field
                  id="fullName"
                  name="fullName"
                  type="text"
                  className={`w-full px-3 py-2 border ${
                    errors.fullName && touched.fullName ? 'border-red-500' : 'border-gray-300'
                  } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500`}
                />
                <ErrorMessage name="fullName" component="div" className="mt-1 text-sm text-red-600" />
              </div>

              <div className="mb-6">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
                    isSubmitting ? 'opacity-75 cursor-not-allowed' : ''
                  }`}
                >
                  {isSubmitting ? 'Registering...' : 'Register'}
                </button>
              </div>
            </Form>
          )}
        </Formik>

        <div className="text-center mt-4">
          <p className="text-sm text-gray-600">
            Already have an account?{' '}
            <Link href="/auth/login" className="font-medium text-indigo-600 hover:text-indigo-500">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </>
  );
} 