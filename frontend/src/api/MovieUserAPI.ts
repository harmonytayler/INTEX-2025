import { MovieUser } from '../types/MovieUser'; // Adjust the path if necessary
import { getHeaders } from './MovieAPI';

const API_URL = 'https://localhost:5001/MovieUser';

// Function to add a new movie user
export const addMovieUser = async (newUser: MovieUser): Promise<MovieUser> => {
    try {
        const response = await fetch(`${API_URL}/AddUser`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(newUser),
            credentials: 'include',
        });

        if (!response.ok) {
            if (response.status === 409) {
                throw new Error("A user with this email already exists.");
            }
            throw new Error("Failed to add movie user");
        }

        return await response.json();
    } catch (error) {
        console.error("Error adding movie user:", error);
        throw error;
    }
};

// Function to get a movie user by email
export const getMovieUserByEmail = async (email: string): Promise<MovieUser> => {
    const response = await fetch(`${API_URL}/GetUserByEmail?email=${encodeURIComponent(email)}`, {
        method: 'GET',
        headers: await getHeaders(),
        credentials: 'include',
    });

    if (!response.ok) {
        throw new Error(`Failed to fetch user data: ${response.statusText}`);
    }

    return response.json();
};

// Function to fetch a movie user by ID
export const fetchMovieUserById = async (userId: number): Promise<MovieUser> => {
    const response = await fetch(`${API_URL}/${userId}`, {
        method: 'GET',
        headers: await getHeaders(),
        credentials: 'include',
    });

    if (!response.ok) {
        throw new Error(`Failed to fetch user data: ${response.statusText}`);
    }

    return response.json();
};

// Function to fetch all movie users (with optional filters like search or pagination)
export const fetchMovieUsers = async (pageSize: number, pageNum: number): Promise<{ movieUsers: MovieUser[], totalNumUsers: number }> => {
    try {
        const url = `${API_URL}/AllMovieUsers?pageSize=${pageSize}&pageNum=${pageNum}`;
        const response = await fetch(url, {
            credentials: 'include',
        });

        if (!response.ok) {
            throw new Error("Failed to fetch movie users");
        }

        const data = await response.json();

        // Handle the response data structure (assuming it's wrapped in an object with `movieUsers` and `totalNumUsers`)
        return {
            movieUsers: Array.isArray(data.movieUsers) ? data.movieUsers : [],
            totalNumUsers: data.totalNumUsers || 0,
        };
    } catch (error) {
        console.error("Error fetching movie users:", error);
        return { movieUsers: [], totalNumUsers: 0 };
    }
};

// Function to update movie user data
export const updateMovieUser = async (userId: number, user: MovieUser): Promise<MovieUser> => {
    const response = await fetch(`${API_URL}/Update/${userId}`, {
        method: 'PUT',
        headers: {
            ...(await getHeaders()),
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ...user, userId }),
        credentials: 'include',
    });

    if (!response.ok) {
        throw new Error(`Failed to update user: ${response.statusText}`);
    }

    return response.json();
};

// Function to delete a movie user
export const deleteMovieUser = async (userId: number): Promise<void> => {
    const response = await fetch(`${API_URL}/DeleteUser/${userId}`, {
        method: 'DELETE',
        headers: await getHeaders(),
        credentials: 'include',
    });

    if (!response.ok) {
        throw new Error(`Failed to delete user: ${response.statusText}`);
    }
};
