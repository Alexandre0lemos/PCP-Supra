import React from "react";
import { IonButtons, IonHeader, IonImg, IonTitle, IonToolbar } from '@ionic/react';

export const Header: React.FC = () => {    
    return(
        <IonHeader>
            <IonToolbar color={'dark'}>
                <IonButtons className='mr-4 ml-4'>
                    <IonTitle color={'light'} className="cursor-pointer text-lg"
                        onClick={() => {
                            location.href = "/ordens-aberta"
                        }}
                    >{localStorage.getItem("username")?.toUpperCase()}</IonTitle>
                </IonButtons>
            </IonToolbar>
        </IonHeader>
    )
}