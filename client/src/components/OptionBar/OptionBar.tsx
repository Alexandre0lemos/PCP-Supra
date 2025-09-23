import React, { PropsWithChildren, ReactNode} from "react";

type Props = {
    href: string;
    icon: ReactNode;
    name?: string;
}

export const OptionBar: React.FC<PropsWithChildren<Props>> = ({href, icon, name}) => {
    return (
        <a className={`${location.pathname == href ? "text-blue-500!" : "text-gray-700!"} flex flex-col items-center justify-center`} href={href}>
            {icon}
            <span className="text-sm font-semibold">{name}</span>
        </a>
    )
}