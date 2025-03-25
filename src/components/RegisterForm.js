import { useState } from 'react';
import { useRouter } from 'next/router';
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

export default function RegisterForm({ onClose, onSwitchToLogin }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const router = useRouter();

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
        setSuccess('Registration successful! Switching to login...');
        resetForm();
        // Switch to login form after 2 seconds
        setTimeout(() => onSwitchToLogin(), 2000);
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
    <div className="w-full">
      <Formik
        initialValues={{
          username: '',
          email: '',
          password: '',
          confirmPassword: '',
          fullName: ''
        }}
        validationSchema={RegisterSchema}
        onSubmit={handleSubmit}
      >
        {({ isSubmitting: formikSubmitting }) => (
          <Form className="space-y-4">
            {error && (
              <div className="p-3 text-sm text-white bg-red-500 rounded-md">
                {error}
              </div>
            )}
            
            {success && (
              <div className="p-3 text-sm text-white bg-green-500 rounded-md">
                {success}
              </div>
            )}
            
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                Username *
              </label>
              <div className="mt-1">
                <Field
                  id="username"
                  name="username"
                  type="text"
                  autoComplete="username"
                  className="block w-full px-3 py-2 placeholder-gray-400 border border-gray-300 rounded-md shadow-sm appearance-none focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
                <ErrorMessage name="username" component="div" className="mt-1 text-sm text-red-600" />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email Address *
              </label>
              <div className="mt-1">
                <Field
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  className="block w-full px-3 py-2 placeholder-gray-400 border border-gray-300 rounded-md shadow-sm appearance-none focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
                <ErrorMessage name="email" component="div" className="mt-1 text-sm text-red-600" />
              </div>
            </div>

            <div>
              <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">
                Full Name (Optional)
              </label>
              <div className="mt-1">
                <Field
                  id="fullName"
                  name="fullName"
                  type="text"
                  autoComplete="name"
                  className="block w-full px-3 py-2 placeholder-gray-400 border border-gray-300 rounded-md shadow-sm appearance-none focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
                <ErrorMessage name="fullName" component="div" className="mt-1 text-sm text-red-600" />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password *
              </label>
              <div className="mt-1">
                <Field
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  className="block w-full px-3 py-2 placeholder-gray-400 border border-gray-300 rounded-md shadow-sm appearance-none focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
                <ErrorMessage name="password" component="div" className="mt-1 text-sm text-red-600" />
              </div>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                Confirm Password *
              </label>
              <div className="mt-1">
                <Field
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  className="block w-full px-3 py-2 placeholder-gray-400 border border-gray-300 rounded-md shadow-sm appearance-none focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
                <ErrorMessage name="confirmPassword" component="div" className="mt-1 text-sm text-red-600" />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isSubmitting || formikSubmitting}
                className="flex justify-center w-full px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {isSubmitting ? 'Registering...' : 'Register'}
              </button>
            </div>
            
            <div className="text-center">
              <p className="text-sm text-gray-600">
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={onSwitchToLogin}
                  className="font-medium text-blue-600 hover:text-blue-500"
                >
                  Sign in
                </button>
              </p>
            </div>
          </Form>
        )}
      </Formik>
    </div>
  );
} 