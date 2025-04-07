const fetchImageUrl = async (filename) => {
    const response = await fetch(`/api/images/${filename}`);
    const url = await response.text(); // Or use .json() if returning JSON
    return url;
};

export default fetchImageUrl;
