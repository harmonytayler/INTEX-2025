import { useState } from "react";
import { Movie } from "../../types//Movie";
import { updateMovie } from "../../api/MovieAPI";

interface EditMovieFormProps {
    movie: Movie;
    onSuccess: () => void;
    onCancel: () => void;
}

const EditMovieForm = ({
    movie,
    onSuccess,
    onCancel,
}: EditMovieFormProps) => {
    const [formData, setFormData] = useState<Movie>({...movie});

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type } = e.target;
        setFormData({
            ...formData, 
            [name]: type === 'number' ? parseInt(value) : value
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await updateMovie(formData.showId, formData);
        onSuccess();
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Edit Movie</h2>
            
            <div className="form-group">
                <label className="block text-sm font-medium text-gray-700 mb-1">Show ID</label>
                <div className="px-3 py-2 bg-gray-100 border border-gray-300 rounded-md text-gray-700">
                    {formData.showId}
                </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="form-group">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                    <input 
                        type="text" 
                        name="type" 
                        value={formData.type} 
                        onChange={handleChange} 
                        required 
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    />
                </div>
                
                <div className="form-group">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                    <input 
                        type="text" 
                        name="title" 
                        value={formData.title} 
                        onChange={handleChange} 
                        required 
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    />
                </div>
                
                <div className="form-group">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Director</label>
                    <input 
                        type="text" 
                        name="director" 
                        value={formData.director || ""} 
                        onChange={handleChange} 
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    />
                </div>
                
                <div className="form-group">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Cast</label>
                    <input 
                        type="text" 
                        name="cast" 
                        value={formData.cast || ""} 
                        onChange={handleChange} 
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    />
                </div>
                
                <div className="form-group">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                    <input 
                        type="text" 
                        name="country" 
                        value={formData.country || ""} 
                        onChange={handleChange} 
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    />
                </div>
                
                <div className="form-group">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Release Year</label>
                    <input 
                        type="number" 
                        name="releaseYear" 
                        value={formData.releaseYear} 
                        onChange={handleChange} 
                        required 
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    />
                </div>
                
                <div className="form-group">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Rating</label>
                    <input 
                        type="text" 
                        name="rating" 
                        value={formData.rating || ""} 
                        onChange={handleChange} 
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    />
                </div>
                
                <div className="form-group">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Duration</label>
                    <input 
                        type="text" 
                        name="duration" 
                        value={formData.duration || ""} 
                        onChange={handleChange} 
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    />
                </div>
            </div>
            
            <div className="form-group">
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <input 
                    type="text" 
                    name="description" 
                    value={formData.description || ""} 
                    onChange={handleChange} 
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
            </div>
            
            <div className="flex justify-end space-x-3 pt-4">
                <button 
                    type="button" 
                    onClick={onCancel} 
                    className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                    Cancel
                </button>
                <button 
                    type="submit" 
                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                    Save Changes
                </button>
            </div>
        </form>
    );
};

export default EditMovieForm;