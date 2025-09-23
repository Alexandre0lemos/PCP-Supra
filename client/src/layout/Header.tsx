import React from "react";
import { IonButtons, IonHeader, IonTitle, IonToolbar } from '@ionic/react';


type Props = {
    title?: string
}

export const Header: React.FC<Props> = ({title}) => {    
    return(
        <IonHeader>
            <IonToolbar color={'dark'} className="h-[8.5dvh] flex items-end">
                <IonButtons className='mr-4 ml-4'>
                    <IonTitle color={'light'} className="pl-3 -ml-4 cursor-pointer text-lg"
                        onClick={() => {
                            location.href = "/ordens-aberta"
                        }}
                    >{localStorage.getItem("username")?.toUpperCase()}</IonTitle>
                    <h1 className="text-gray-800">{title}</h1>
                </IonButtons>
            </IonToolbar>
        </IonHeader>
    )
}