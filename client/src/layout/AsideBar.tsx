import React from "react";
import { OptionBar } from "../components/OptionBar/OptionBar";
import { Edit, Home } from "lucide-react";

export const AsideBar:React.FC = () => {
    return (
        <aside className="hidden sm:flex flex-col h-[100dvh-8dvh] w-20 border-r border-gray-300">
            <ul className="flex flex-col justify-start mt-40 gap-8 flex-1/3">
                <li><OptionBar name="OPs" href="/ordens-aberta" icon={<Home />}/></li>
                <li><OptionBar name="Editar" href="/EditarLancamento" icon={<Edit />} /></li>
            </ul>
        </aside>
    )
}