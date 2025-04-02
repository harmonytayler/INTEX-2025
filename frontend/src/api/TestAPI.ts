import { TestItem } from "../types/TestItem";

const API_URL = 'https://intex-2025.azurewebsites.net/Test';

export const fetchTests = async (): Promise<TestItem[]> => {
    try {
        const response = await fetch(`${API_URL}/AllTestItems`);

        if (!response.ok) {throw new Error("Failed to fetch test items");}

        return await response.json();
    } catch (error) {
        console.error("Error fetching test items:", error);
        throw error;
    }
};