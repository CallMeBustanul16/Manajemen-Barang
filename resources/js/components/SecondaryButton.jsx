export default function SecondaryButton({
    type = 'button',
    className = '',
    disabled,
    children,
    ...props
}) {
    return (
        <button
            {...props}
            type={type}
            className={
                `inline-flex items-center justify-center rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-gray-700 dark:text-gray-200 shadow-sm transition-all duration-200 hover:bg-gray-50 dark:hover:bg-gray-700 hover:shadow hover:-translate-y-0.5 active:scale-[0.98] active:translate-y-0 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ${
                    disabled && 'opacity-50 pointer-events-none'
                } ` + className
            }
            disabled={disabled}
        >
            {children}
        </button>
    );
}
