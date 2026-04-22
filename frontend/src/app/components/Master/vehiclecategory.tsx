'use client';

import { useState } from 'react';

export default function VehicleCategoryForm() {
  const [categoryName, setCategoryName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/vehicle-categories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ categoryName }),
      });

      if (!response.ok) {
        throw new Error('Failed to save category');
      }

      const data = await response.json();
      alert('Category saved successfully!');
      setCategoryName('');
    } catch (error) {
      console.error('Error saving category:', error);
      alert('Failed to save category');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-6 w-[165vh] mx-auto bg-white shadow-xl rounded-lg">
      <h2 className="text-2xl font-bold text-center mb-6">Vehicle Category</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block  text-md font-extrabold   text-gray-700 mb-1">
            Category Name
          </label>
          <input
            type="text"
            value={categoryName}
            onChange={(e) => setCategoryName(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter category name"
            required
          />
        </div>
        <button
          type="submit"
          disabled={isSubmitting}
          className={`w-full px-4 py-2 font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed ${
            isSubmitting
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
        >
          {isSubmitting ? 'Saving...' : 'Save'}
        </button>
      </form>
    </div>
  );
}