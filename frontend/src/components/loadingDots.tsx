export default function ({ isLoading }: { isLoading: boolean }) {
    return (
        <div>
            {isLoading && (
                <div className="flex justify-center gap-4">
                    <div className="flex items-center gap-1.5">
                        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-gray-300 [animation-delay:-0.3s] [animation-duration:1s]" />
                        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-gray-300 [animation-delay:-1.5s] [animation-duration:1s]" />
                        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-gray-300 [animation-duration:1s]" />
                    </div>
                </div>
            )}
        </div>
    );
}
