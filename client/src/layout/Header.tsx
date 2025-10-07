import React from "react";


type Props = {
    title?: string
}

export const Header: React.FC<Props> = ({title}) => {    
    return(
        <header className="sticky top-0 bg-white! z-10">
            <div className="h-[8.5dvh] flex items-center shadow">
                <div className='mr-4 pl-2.5 pt-0.5'>
                    <h1 className="cursor-pointer text-lg font-semibold! text-gray-700! tracking-wide!"
                        onClick={() => {
                            location.href = "/ordens-aberta"
                        }}
                    >{localStorage.getItem("username")?.toUpperCase()}</h1>
                    <h1 className="text-gray-800">{title}</h1>
                </div>
            </div>
        </header>
    )
}