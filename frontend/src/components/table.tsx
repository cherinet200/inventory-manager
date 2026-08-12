type TdProps = {
    children: React.ReactNode;
    style?: string;
    colSpan?: number;
    onClick?: () => void;
};
type ThProps = {
    children: React.ReactNode;
    style?: string;
};

export const Th = ({ children, style }: ThProps) => {
    return (
        <th
            className={`px-5 py-5 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-500 ${style}`}
        >
            {children}
        </th>
    );
};

export const Td = ({ children, colSpan, style, onClick }: TdProps) => {
    return (
        <td
            colSpan={colSpan}
            className={`px-5 py-3  text-gray-700 dark:text-gray-400 ${style}`}
            onClick={onClick}
        >
            {children}
        </td>
    );
};
