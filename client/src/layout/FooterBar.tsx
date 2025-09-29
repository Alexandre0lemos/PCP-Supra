import React from "react";
import { OptionBar } from "../components/OptionBar/OptionBar";
import { Edit, Home } from "lucide-react";


export const FooterBar:React.FC = () => {
    return (
        <footer className="flex h-[10dvh] items-center z-10 border-t border-gray-300">
            <div className="grid grid-cols-2 place-items-center w-full">
                <OptionBar name="OPs Aberta" href="/ordens-aberta" icon={<Home />}/>
                <OptionBar name="Editar OPs" href="/EditarLancamento" icon={<Edit />} />
            </div>
        </footer>
    )
}