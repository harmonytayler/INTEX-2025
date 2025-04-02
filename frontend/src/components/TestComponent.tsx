import { useEffect, useState } from "react";
import { fetchTests } from "../api/TestAPI";
import { TestItem } from "../types/TestItem";

function TestComponent() {
    const [testItems, setTestItems] = useState<TestItem[]>([]);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const loadTestItems = async () => {
            try {
                const data = await fetchTests();

                setTestItems(data);
            } catch (error) {
                setError((error as Error).message);
            }
        };

        loadTestItems();
    }, []);

    if (error) return <p>Error: {error}</p>

    return (
        <>
            {testItems.map((t) => {
                return (
                    <div key={t.testItemId}>
                        <h3>{t.testItemId}</h3>
                        <h4>{t.testItemName}</h4>
                    </div>
                )
            })}
        </>
    );
}

export default TestComponent;