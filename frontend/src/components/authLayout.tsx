import Logo from "../assets/inventory.png";

type AuthLayoutProps = {
    children: React.ReactNode;
};

type LayoutProps = {
    title: string;
    subtitle: string;
    children: React.ReactNode;
    onSubmit?: (e: React.ChangeEvent<HTMLFormElement>) => Promise<void>;
};

export default function AuthLayout({ children }: AuthLayoutProps) {
    return (
        <>
            <div className="flex justify-center items-center h-screen gap-100 dark:bg-gray-950">
                <div className="w-[20%] h-full hidden justify-center items-center lg:flex">
                    <img src={Logo} alt="Brand" />
                </div>
                {children}
            </div>
        </>
    );
}

export const FormLayout = ({
    title,
    subtitle,
    children,
    onSubmit,
}: LayoutProps) => {
    return (
        <form
            className="h-full w-120 flex justify-center items-center flex-col gap-8"
            onSubmit={onSubmit}
        >
            <div className="flex justify-center items-center flex-col gap-4">
                <img src={Logo} alt="Brand" width="60" height="60" />
                <h1 className="text-4xl font-semibold text-gray-900 dark:text-white">
                    {title}
                </h1>
                <p className="text-lg text-gray-400">{subtitle}</p>
            </div>
            {children}
        </form>
    );
};
