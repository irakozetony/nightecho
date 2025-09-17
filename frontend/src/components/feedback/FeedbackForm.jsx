import { useState } from 'react';
import { useFeedback } from '../../context/FeedbackContext';
import Button from '../ui/Button';

const CATEGORIES = [
  { value: 'bug', label: '🐛 Bug Report', description: 'Report a problem or issue' },
  { value: 'feature', label: '✨ Feature Request', description: 'Suggest a new feature or enhancement' },
  { value: 'improvement', label: '🚀 Improvement', description: 'Suggest an improvement to existing functionality' },
];

const FeedbackForm = ({ onSuccess, onError }) => {
  const { createFeedback } = useFeedback();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
  });
  
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    } else if (formData.title.trim().length < 3) {
      newErrors.title = 'Title must be at least 3 characters';
    } else if (formData.title.trim().length > 200) {
      newErrors.title = 'Title must be less than 200 characters';
    }
    
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    } else if (formData.description.trim().length < 10) {
      newErrors.description = 'Description must be at least 10 characters';
    } else if (formData.description.trim().length > 2000) {
      newErrors.description = 'Description must be less than 2000 characters';
    }
    
    if (!formData.category) {
      newErrors.category = 'Category is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const result = await createFeedback({
        title: formData.title.trim(),
        description: formData.description.trim(),
        category: formData.category
      });
      
      // Reset form
      setFormData({
        title: '',
        description: '',
        category: '',
      });
      setErrors({});
      
      onSuccess?.(result);
    } catch (error) {
      console.error('Error creating feedback:', error);
      onError?.(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900">Share Your Feedback</h2>
        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
          <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 8h10m0 0V6a2 2 0 00-2-2H9a2 2 0 00-2 2v2m10 0v10a2 2 0 01-2 2H9a2 2 0 01-2-2V8m10 0H7" />
          </svg>
        </div>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Title */}
        <div>
          <label htmlFor="title" className="block text-sm font-semibold text-gray-700 mb-2">
            Title *
          </label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="Brief summary of your feedback"
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
              errors.title ? 'border-red-300 bg-red-50' : 'border-gray-300'
            }`}
            disabled={isSubmitting}
          />
          {errors.title && (
            <p className="mt-1 text-sm text-red-600">{errors.title}</p>
          )}
          <p className="mt-1 text-xs text-gray-500">
            {formData.title.length}/200 characters
          </p>
        </div>

        {/* Category */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-3">
            Category *
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {CATEGORIES.map((cat) => (
              <label
                key={cat.value}
                className={`cursor-pointer p-4 border rounded-lg transition-all hover:bg-gray-50 ${
                  formData.category === cat.value
                    ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200'
                    : 'border-gray-200'
                } ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <input
                  type="radio"
                  name="category"
                  value={cat.value}
                  checked={formData.category === cat.value}
                  onChange={handleChange}
                  className="sr-only"
                  disabled={isSubmitting}
                />
                <div className="font-medium text-gray-900 mb-1">{cat.label}</div>
                <div className="text-xs text-gray-600">{cat.description}</div>
              </label>
            ))}
          </div>
          {errors.category && (
            <p className="mt-2 text-sm text-red-600">{errors.category}</p>
          )}
        </div>

        {/* Description */}
        <div>
          <label htmlFor="description" className="block text-sm font-semibold text-gray-700 mb-2">
            Description *
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Provide detailed information about your feedback..."
            rows={6}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none ${
              errors.description ? 'border-red-300 bg-red-50' : 'border-gray-300'
            }`}
            disabled={isSubmitting}
          />
          {errors.description && (
            <p className="mt-1 text-sm text-red-600">{errors.description}</p>
          )}
          <p className="mt-1 text-xs text-gray-500">
            {formData.description.length}/2000 characters
          </p>
        </div>

        {/* Submit Buttons */}
        <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-100">
          <Button
            type="button"
            variant="ghost"
            onClick={() => {
              setFormData({ title: '', description: '', category: '' });
              setErrors({});
            }}
            disabled={isSubmitting}
          >
            Clear
          </Button>
          
          <Button
            type="submit"
            loading={isSubmitting}
            disabled={isSubmitting}
            className="min-w-[120px]"
          >
            {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default FeedbackForm;