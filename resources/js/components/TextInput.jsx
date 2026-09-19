import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';

export default forwardRef(function TextInput(
    { type = 'text', className = '', isFocused = false, ...props },
    ref,
) {
    const localRef = useRef(null);

    useImperativeHandle(ref, () => ({
        focus: () => localRef.current?.focus(),
    }));

    useEffect(() => {
        if (isFocused) {
            localRef.current?.focus();
        }
    }, [isFocused]);

    return (
        <input
            {...props}
            type={type}
            className={
                'rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white px-3.5 py-2 text-sm shadow-sm transition-all duration-200 focus:border-red-500 focus:ring-2 focus:ring-red-500/20 dark:focus:border-red-400 focus:outline-none placeholder:text-gray-400 dark:placeholder:text-gray-500 ' +
                className
            }
            ref={localRef}
        />
    );
});
