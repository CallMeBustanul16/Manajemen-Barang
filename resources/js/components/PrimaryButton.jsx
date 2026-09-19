export default function PrimaryButton({
    className = '',
    disabled,
    children,
    ...props
}) {
    return (
        <button
            {...props}
            className={
                `inline-flex items-center justify-center rounded-lg border border-transparent bg-gray-900 dark:bg-white dark:text-gray-900 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-white shadow-sm transition-all duration-200 hover:bg-gray-800 dark:hover:bg-gray-100 hover:shadow-md hover:-translate-y-0.5 active:scale-[0.98] active:translate-y-0 focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-white focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ${
                    disabled && 'opacity-50 pointer-events-none'
                } ` + className
            }
            disabled={disabled}
        >
            {children}
        </button>
    );
}
