import React, { PropsWithChildren, ReactNode} from "react";

type Props = {
    href: string;
    icon: ReactNode;
    name?: string;
    desktop?: boolean;
}

export const OptionBar: React.FC<PropsWithChildren<Props>> = ({href, icon, name, desktop}) => {
    if (desktop) {
        return(
            <a className={`${location.pathname == href ? "text-white! bg-gray-600!" : "text-gray-700!"} rounded-sm p-1.5 w-full h-9 flex hover:opacity-80 hover:bg-gray-600! hover:text-white! transition-colors items-center justify-start gap-2`} href={href}>
            <div className="h-6">
                {icon}
            </div>
            <span className="font-medium">{name}</span>
        </a>
        )
    }

    return (
        <a className={`${location.pathname == href ? "text-blue-500!" : "text-gray-700!"} flex flex-col items-center justify-center`} href={href}>
            {icon}
            <span className="text-sm font-semibold">{name}</span>
        </a>
    )
}