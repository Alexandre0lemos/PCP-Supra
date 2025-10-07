import React from "react";
import { OptionBar } from "../components/OptionBar/OptionBar";
import { Edit, File, Github, Home} from "lucide-react";
import { apiConfig } from "../urlApiConfig";

export const AsideBar:React.FC = () => {
    return (
        <aside className="hidden sm:flex flex-col h-[calc(100dvh-8dvh)] w-52 border-r border-blue-100 items-start">
            <section className="flex flex-col h-4/12 border-b border-gray-300  w-full justify-evenly">
                <span className="flex items-center text-gray-600 pl-2 gap-2">
                    <img src="./supralogo.png" alt="Supra logo" className="h-8"/>
                    <h1 className="text-lg! text-gray-700!">PCP-Supra</h1>
                </span>
                <ul className="flex flex-col pl-2 pr-2 justify-center gap-4">
                    <li className="flex justify-center"><OptionBar desktop name="Ordens" href="/ordens-aberta" icon={<Home className="h-full w-min"/>}/></li>
                    <li className="flex justify-center"><OptionBar desktop name="Editar" href="/EditarLancamento" icon={<Edit className="h-full w-min"/>} /></li>
                </ul>
            </section>
            <section className="pl-3 flex flex-col pt-2 p-1 gap-3">
                <p className="font-bold text-gray-700! text-[12px]!">Sobre</p>
                <ul className="flex flex-col gap-3">
                    <li>
                        <a href="https://github.com/Alexandre0lemos/PCP-Supra" target="_blank" className="visited:text-gray-800! text-gray-800! h-5 flex items-center">      
                            <Github className="h-full"/>
                            <h1 className="text-sm! font-medium">Repositório</h1>
                        </a>
                    </li>
                    <li>
                        <a href={`${apiConfig.protocol}//${apiConfig.url}:${5000}`} target="_blank" className="visited:text-gray-800! text-gray-800! h-5 flex items-center">
                            <File className="h-full" />
                            <h1 className="text-sm! font-medium">Lançamentos</h1>
                        </a>
                    </li>
                </ul>
            </section>
            {/* <footer className="m-auto mb-0 border-t border-gray-300 h-12 w-full">
                
            </footer> */}
        </aside>
    )
}