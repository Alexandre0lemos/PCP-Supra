import React from "react";
import { OptionBar } from "../components/OptionBar/OptionBar";
import { Edit, Home } from "lucide-react";

export const AsideBar:React.FC = () => {
    return (
        <aside className="hidden sm:flex flex-col h-[calc(100dvh-8dvh)] w-52 border-r border-blue-100 items-center">
            <div className="flex flex-col h-4/12 border-b border-gray-300  w-full justify-evenly">
                <span className="flex items-center text-gray-600 pl-2 gap-2">
                    <img src="./supralogo.png" alt="Supra logo" className="h-8"/>
                    <h1 className="text-lg! text-gray-700!">Paginas</h1>
                </span>
                <ul className="flex flex-col pl-2 pr-2 justify-center gap-4">
                    <li className="flex justify-center"><OptionBar desktop name="Ordens" href="/ordens-aberta" icon={<Home className="h-full w-min"/>}/></li>
                    <li className="flex justify-center"><OptionBar desktop name="Editar" href="/EditarLancamento" icon={<Edit className="h-full w-min"/>} /></li>
                </ul>
            </div>
        </aside>
    )
}