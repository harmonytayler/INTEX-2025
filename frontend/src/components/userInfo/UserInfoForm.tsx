import { useState, useEffect } from 'react';
import { MovieUser } from '../../types/MovieUser'; // Adjust the path to your types file
import { addMovieUser } from '../../api/MovieUserAPI'; // API call to add a user
import { useLocation, useNavigate } from 'react-router-dom';

const NewUserForm = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const emailFromPreviousPage = location.state?.email || ''; // Retrieve the email from the navigation state
  const [userId, setUserId] = useState<number | null>(null);

  useEffect(() => {
    const fetchUserId = async () => {
      try {
        const response = await fetch(
          'http://localhost:5000/MovieUser/GetNextUserId'
        );
        if (!response.ok) {
          throw new Error('Failed to fetch user ID');
        }
        const data = await response.json();
        setUserId(data); // Or setUserId(data.userId) if the value is nested
      } catch (error) {
        console.error('Error fetching user ID:', error);
      }
    };

    fetchUserId();
  }, []);

  const [formData, setFormData] = useState<MovieUser>({
    userId: 0,
    name: '',
    phone: '',
    email: emailFromPreviousPage, // Use the email passed from the register page
    age: 0,
    gender: '',
    netflix: 0,
    amazonPrime: 0,
    disneyPlus: 0,
    paramountPlus: 0,
    max: 0,
    hulu: 0,
    appleTVPlus: 0,
    peacock: 0,
    city: '',
    state: '',
    zip: 0,
  });

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);

  //   useEffect(() => {
  //     // Fetch the next userId from the server
  //     const fetchNextUserId = async () => {
  //       try {
  //         const response = await fetch('http://localhost:5000/MovieUser/GetNextUserId'); // Assuming the route is "/api/MovieUser/get-next-user-id"
  //         if (response.ok) {
  //           const nextUserId = await response.json();
  //           setFormData((prevData) => ({
  //             ...prevData,
  //             userId: nextUserId, // Set the userId to the returned value
  //           }));
  //         } else {
  //           throw new Error('Failed to fetch next user ID.');
  //         }
  //       } catch (error) {
  //         setError('Error fetching user ID. Please try again.');
  //       }
  //     };

  //     fetchNextUserId();
  //   }, []); // Empty dependency array to run the effect only once

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target as HTMLInputElement;
    const isCheckbox = (e.target as HTMLInputElement).type === 'checkbox';

    if (isCheckbox) {
      setFormData({
        ...formData,
        [name]: (e.target as HTMLInputElement).checked ? 1 : 0, // 1 for checked, 0 for unchecked
      });
    } else {
      setFormData({
        ...formData,
        [name]: type === 'number' ? parseInt(value) : value,
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await addMovieUser(formData); // Send data to API to add the user
      setSuccess(true);
      setError(null); // Clear any previous errors
      setFormData({
        userId: 0,
        name: '',
        phone: '',
        email: '',
        age: 0,
        gender: '',
        netflix: 0,
        amazonPrime: 0,
        disneyPlus: 0,
        paramountPlus: 0,
        max: 0,
        hulu: 0,
        appleTVPlus: 0,
        peacock: 0,
        city: '',
        state: '',
        zip: 0,
      });

      // Redirect to home page after successfully adding the user
      navigate('/'); // Adjust the path if necessary
    } catch (error) {
      setError('Failed to add user. Please try again.');
      setSuccess(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Add New User</h2>
      {userId !== null ? userId : 'Loading...'}
      <label>
        Name:
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
        />
      </label>

      <label>
        Phone:
        <input
          type="text"
          name="phone"
          value={formData.phone}
          onChange={handleChange}
        />
      </label>

      <label>
        Email:
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
        />
      </label>

      <label>
        Age:
        <input
          type="number"
          name="age"
          value={formData.age}
          onChange={handleChange}
        />
      </label>

      {/* Gender Selection */}
      <label>
        Gender:
        <select name="gender" value={formData.gender} onChange={handleChange}>
          <option value="">Select Gender</option>
          <option value="male">Male</option>
          <option value="female">Female</option>
          <option value="other">Other</option>
        </select>
      </label>

      <h3>Select Streaming Services:</h3>
      <label>
        Netflix
        <input
          type="checkbox"
          name="netflix"
          checked={formData.netflix === 1}
          onChange={handleChange}
        />
      </label>

      <label>
        Amazon Prime
        <input
          type="checkbox"
          name="amazonPrime"
          checked={formData.amazonPrime === 1}
          onChange={handleChange}
        />
      </label>

      <label>
        Disney Plus
        <input
          type="checkbox"
          name="disneyPlus"
          checked={formData.disneyPlus === 1}
          onChange={handleChange}
        />
      </label>

      <label>
        Paramount Plus
        <input
          type="checkbox"
          name="paramountPlus"
          checked={formData.paramountPlus === 1}
          onChange={handleChange}
        />
      </label>
      <label>
        Max
        <input
          type="checkbox"
          name="max"
          checked={formData.max === 1}
          onChange={handleChange}
        />
      </label>
      <label>
        Hulu
        <input
          type="checkbox"
          name="hulu"
          checked={formData.hulu === 1}
          onChange={handleChange}
        />
      </label>
      <label>
        Apple TV Plus
        <input
          type="checkbox"
          name="appleTVPlus"
          checked={formData.appleTVPlus === 1}
          onChange={handleChange}
        />
      </label>
      <label>
        Peacock
        <input
          type="checkbox"
          name="peacock"
          checked={formData.peacock === 1}
          onChange={handleChange}
        />
      </label>

      <label>
        City:
        <input
          type="text"
          name="city"
          value={formData.city}
          onChange={handleChange}
        />
      </label>

      <label>
        State:
        <input
          type="text"
          name="state"
          value={formData.state}
          onChange={handleChange}
        />
      </label>

      <label>
        ZIP Code:
        <input
          type="number"
          name="zip"
          value={formData.zip}
          onChange={handleChange}
        />
      </label>

      <button type="submit">Add User</button>

      {success && <div className="success">User added successfully!</div>}
      {error && <div className="error">{error}</div>}
    </form>
  );
};

export default NewUserForm;
