import React from "react";
import { IonButtons, IonHeader, IonTitle, IonToolbar } from '@ionic/react';

export const Header: React.FC = () => {    
    return(
        <IonHeader>
            <IonToolbar color={'dark'}>
                <IonButtons className='mr-4 ml-4'>
                    <IonTitle color={'light'} className="pl-3 cursor-pointer text-lg"
                        onClick={() => {
                            location.href = "/ordens-aberta"
                        }}
                    >{localStorage.getItem("username")?.toUpperCase()}</IonTitle>
                </IonButtons>
            </IonToolbar>
        </IonHeader>
    )
}