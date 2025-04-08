interface PaginationProps {
    currentPage: number;
    totalPages: number;
    pageSize: number;
    onPageChange: (page: number) => void;
    onPageSizeChange: (size: number) => void;
}

const Pagination = ({
    currentPage,
    totalPages,
    pageSize,
    onPageChange,
    onPageSizeChange,
}: PaginationProps) => {
    // Function to generate page numbers to display
    const getPageNumbers = () => {
        const pages = [];
        const maxVisiblePages = 5; // Number of page buttons to show
        const halfVisible = Math.floor(maxVisiblePages / 2);

        let startPage = Math.max(1, currentPage - halfVisible);
        let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

        // Adjust start page if we're near the end
        if (endPage - startPage + 1 < maxVisiblePages) {
            startPage = Math.max(1, endPage - maxVisiblePages + 1);
        }

        // Always show first page
        if (startPage > 1) {
            pages.push(1);
            if (startPage > 2) {
                pages.push('...');
            }
        }

        // Add pages around current page
        for (let i = startPage; i <= endPage; i++) {
            pages.push(i);
        }

        // Always show last page
        if (endPage < totalPages) {
            if (endPage < totalPages - 1) {
                pages.push('...');
            }
            pages.push(totalPages);
        }

        return pages;
    };

    return (
        <div className="flex justify-center items-center mt-4 gap-2">
            <button 
                className="px-3 py-1 rounded border disabled:opacity-50"
                disabled={currentPage === 1}  
                onClick={() => onPageChange(currentPage - 1)}
            >
                Previous
            </button>

            {getPageNumbers().map((page, index) => (
                page === '...' ? (
                    <span key={`ellipsis-${index}`} className="px-2">...</span>
                ) : (
                    <button
                        key={page}
                        className={`px-3 py-1 rounded border ${
                            currentPage === page ? 'bg-blue-500 text-white' : ''
                        }`}
                        onClick={() => onPageChange(page as number)}
                    >
                        {page}
                    </button>
                )
            ))}

            <button
                className="px-3 py-1 rounded border disabled:opacity-50"
                disabled={currentPage === totalPages}
                onClick={() => onPageChange(currentPage + 1)}
            >
                Next
            </button>

            <div className="ml-4">
                <label className="flex items-center gap-2">
                    Results per page:
                    <select
                        className="border rounded px-2 py-1"
                        value={pageSize}
                        onChange={(e) => {
                            onPageSizeChange(Number(e.target.value));
                            onPageChange(1);
                        }}
                    >
                        <option value="5">5</option>
                        <option value="10">10</option>
                        <option value="20">20</option>
                    </select>
                </label>
            </div>
        </div>
    );
};

export default Pagination;