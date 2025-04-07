import { useEffect, useState } from "react";
import { fetchTests } from "../api/TestAPI";
import { TestItem } from "../types/TestItem";

function TestComponent() {
    const [testItems, setTestItems] = useState<TestItem[]>([]);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const loadTests = async () => {
            try {
                const data = await fetchTests();
                setTestItems(data);
            } catch (err) {
                setError((err as Error).message);
            }
        };

        loadTests();
    }, []);

    if (error) {
        return <p className="text-red-500">Error: {error}</p>;
    }

    return (
        <div className="p-6">
            <h3 className="text-2xl font-bold mb-4">Test Items</h3>
            <table className="min-w-full border border-gray-300">
                <thead className="bg-gray-100">
                    <tr>
                        <th className="px-4 py-2 border">ID</th>
                        <th className="px-4 py-2 border">Name</th>
                    </tr>
                </thead>
                <tbody>
                    {testItems.map((item) => (
                        <tr key={item.testItemId}>
                            <td className="px-4 py-2 border text-center">{item.testItemId}</td>
                            <td className="px-4 py-2 border">{item.testItemName}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default TestComponent;
