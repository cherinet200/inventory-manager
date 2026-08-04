type TdProps = {
    children: React.ReactNode;
    style?: string;
};

export const Th = ({ children }: { children: React.ReactNode }) => {
    return (
        <th className="px-5 py-5 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-500">
            {children}
        </th>
    );
};

export const Td = ({ children, style }: TdProps) => {
    return (
        <td className={`px-5 py-3  text-gray-700 dark:text-gray-400 ${style}`}>
            {children}
        </td>
    );
};
