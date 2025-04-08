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
    onPageSizeChange,}:PaginationProps) => {
        return (
            <div className="flex justify-center items-center mt-4">
                <button  disabled={currentPage === 1}  onClick={() => onPageChange(currentPage - 1)}
                    >
                        Previous
                    </button>
                    {[...Array(totalPages)].map((_, i) => (
                        <button
                            key={i + 1}
                            onClick={() => onPageChange(i + 1)}
                            disabled={currentPage === (i + 1)}
                            >
                                {i + 1}
                        </button>
                    ))}

                <button
                    disabled={currentPage === totalPages}
                    onClick={() => onPageChange(currentPage + 1)}
                >
                    Next
                </button>
                <br />
                <label>
                    Results per page:
                    <select
                        value={pageSize}
                        onChange={(p) => {
                            onPageSizeChange(Number(p.target.value));
                            onPageChange(1);
                        }}
                    >
                        <option value="5">5</option>
                        <option value="10">10</option>
                        <option value="20">20</option>
                    </select>
                </label>{' '}
            </div>
        );
    };
export default Pagination;