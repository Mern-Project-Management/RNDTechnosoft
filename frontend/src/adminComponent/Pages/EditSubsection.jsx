import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

const modules = {
  toolbar: [
    [{ 'font': [] }],
    ['bold', 'italic', 'underline', 'strike', 'blockquote'],
    [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
    [{ 'list': 'ordered' }, { 'list': 'bullet' }, { 'list': 'check' }],
    [{ 'script': 'sub' }, { 'script': 'super' }],
    [{ 'indent': '-1' }, { 'indent': '+1' }],
    ['link', 'image', 'video'],
    [{ 'direction': 'rtl' }],
    [{ 'color': [] }, { 'background': [] }],
    [{ 'align': [] }],
    ['clean']
  ],
  clipboard: {
    matchVisual: false,
  }
};

const EditSubsectionForm = ({ subsection, contentId, onEditCancel, onSubsectionUpdated, index }) => {
  const [formData, setFormData] = useState(subsection);
  const [media, setMedia] = useState(null);
  const [currentMedia, setCurrentMedia] = useState(subsection.photo);
  const [altText, setAltText] = useState(subsection.photoAlt || '');
  const [imgtitle, setImgtitle] = useState(subsection.imgtitle || '');
  
  const [serviceCategories, setServiceCategories] = useState([]);
  const [selectedParentCategory, setSelectedParentCategory] = useState(subsection.serviceparentCategoryId || "");
  const [selectedSubCategory, setSelectedSubCategory] = useState(subsection.servicesubCategoryId || "");
  const [selectedSubSubCategory, setSelectedSubSubCategory] = useState(subsection.servicesubSubCategoryId || "");

  useEffect(() => {
    setFormData(subsection);
    setCurrentMedia(subsection.photo);
    setAltText(subsection.photoAlt || '');
    setImgtitle(subsection.imgtitle || '');
  }, [subsection]);

  useEffect(() => {
    const fetchServiceCategories = async () => {
      try {
        const response = await axios.get('/api/services/getAll', { withCredentials: true });
        setServiceCategories(response.data);
      } catch (error) {
        console.error('Error fetching service categories:', error);
      }
    };
    fetchServiceCategories();
  }, []);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleMediaChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setMedia(file);
    }
  };

  const handleRemoveMedia = () => {
    setMedia(null);
    setCurrentMedia(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formDataToSend = new FormData();
    
    // Append all form data
    formDataToSend.append('title', formData.title);
    formDataToSend.append('description', formData.description);
    formDataToSend.append('photoAlt', altText);
    formDataToSend.append('imgtitle', imgtitle);
    formDataToSend.append('serviceparentCategoryId', selectedParentCategory);
    formDataToSend.append('servicesubCategoryId', selectedSubCategory);
    formDataToSend.append('servicesubSubCategoryId', selectedSubSubCategory);
    
    if (media) {
      formDataToSend.append('photo', media);
    } else if (currentMedia) {
      formDataToSend.append('currentPhoto', currentMedia);
    } else {
      formDataToSend.append('removePhoto', 'true');
    }
  
    try {
      const response = await axios.put(
        `/api/content/subsections/${contentId}/${index}`,
        formDataToSend,
        {
          headers: { 'Content-Type': 'multipart/form-data' },
          withCredentials: true,
        }
      );
  
      // Call the parent's update function with the updated data
      onSubsectionUpdated(response.data); // Make sure this is the updated subsection data
      window.location.reload();
      console.log("Subsection updated successfully");
    } catch (error) {
      console.error("Error updating subsection:", error);
    }
  };

  const renderCategoryOptions = (categories) => {
    return categories.map(category => (
      <option key={category._id} value={category.slug}>
        {category.category}
      </option>
    ));
  };

  const getSubCategories = (categoryId) => {
    const category = serviceCategories.find(cat => cat.slug === categoryId);
    return category?.subCategories || [];
  };

  const getSubSubCategories = (categoryId, subCategoryId) => {
    const category = serviceCategories.find(cat => cat.slug === categoryId);
    const subCategory = category?.subCategories.find(sub => sub.slug === subCategoryId);
    return subCategory?.subSubCategories || [];
  };

  const isVideoFile = (filename) => {
    if (!filename) return false;
    const cleanUrl = filename.split('?')[0].toLowerCase();
    return cleanUrl.endsWith('.webm') || cleanUrl.endsWith('.mp4') || cleanUrl.endsWith('.ogg') || cleanUrl.includes('ik-video') || cleanUrl.includes('.webm') || cleanUrl.includes('.mp4');
  };

  return (
    <div className="mb-4 p-4 border rounded-lg bg-gray-50">
      <h3 className="text-xl font-semibold mb-4 text-gray-800">Edit Subsection</h3>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => handleChange('title', e.target.value)}
            className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
        </div>

     

        {/* Media Upload */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Media (Image or WebM Video)
          </label>
          <div className="flex items-center gap-2">
            <label className="cursor-pointer bg-white text-blue-600 hover:bg-blue-50 px-4 py-2 rounded border border-blue-200">
              Choose File
              <input
                type="file"
                onChange={handleMediaChange}
                accept="image/*,.webm"
                className="hidden"
              />
            </label>
            <span className="text-sm text-gray-500">
              {media ? media.name : currentMedia ? 'Current file selected' : 'No file chosen'}
            </span>
            {(media || currentMedia) && (
              <button
                type="button"
                onClick={handleRemoveMedia}
                className="text-red-500 hover:text-red-700 text-sm"
              >
                Remove
              </button>
            )}
          </div>
          <p className="text-xs text-gray-500">
            Supported formats: JPG, PNG, WebP, WebM. Max size: 50MB
          </p>

          {/* Media Preview */}
          {(media || currentMedia) && (
            <div className="mt-3">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Preview
              </label>
              <div className="bg-white p-3 rounded border">
                {media ? (
                  isVideoFile(media.name) ? (
                    <video
                      src={URL.createObjectURL(media)}
                      controls
                      className="max-w-full h-auto max-h-48 mx-auto"
                    />
                  ) : (
                    <img
                      src={URL.createObjectURL(media)}
                      alt="Preview"
                      className="max-w-full h-auto max-h-48 mx-auto"
                    />
                  )
                ) : currentMedia ? (
                  isVideoFile(currentMedia) ? (
                    <video
                      src={currentMedia.startsWith('http://') || currentMedia.startsWith('https://') ? currentMedia : `/api/image/download/${currentMedia}`}
                      controls
                      className="max-w-full h-auto max-h-48 mx-auto"
                    />
                  ) : (
                    <img
                      src={currentMedia.startsWith('http://') || currentMedia.startsWith('https://') ? currentMedia : `/api/image/download/${currentMedia}`}
                      alt={altText || 'Current media'}
                      className="max-w-full h-auto max-h-48 mx-auto"
                    />
                  )
                ) : null}
              </div>
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Alt Text (for accessibility)
          </label>
          <input
            type="text"
            value={altText}
            onChange={(e) => setAltText(e.target.value)}
            className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Describe this media for accessibility"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Image Title
          </label>
          <input
            type="text"
            value={imgtitle}
            onChange={(e) => setImgtitle(e.target.value)}
            className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter image title"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <div className="min-h-[120px]">
            <ReactQuill
              value={formData.description}
              onChange={(value) => handleChange('description', value)}
              modules={modules}
              style={{ height: '50px', marginBottom: '4rem' }}
            />
          </div>
        </div>
        <div className="flex justify-end space-x-3 pt-4 border-t">
          <button
            type="button"
            onClick={onEditCancel}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Save Changes
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditSubsectionForm;
