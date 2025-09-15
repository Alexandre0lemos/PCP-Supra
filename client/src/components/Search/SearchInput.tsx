import { IonButton, IonModal } from "@ionic/react";
import { Search } from "lucide-react";
import React, { useState } from "react";
import "./SearchInput.css"

type PropsSearch = {
  isOpen: boolean;
  onPesquisar?: (value:string) => void;
};

export const SearchInput: React.FC<PropsSearch> = ({onPesquisar = () => {}}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputChange, setInputChange] = useState("");

  return (
    <>
      <button className="h-10" onClick={() => setIsOpen(true)}>
        <Search size={20} />
      </button>

      <IonModal className="backdrop-blur-[1px]" isOpen={isOpen}>
        <div className="flex h-full flex-col gap-2 justify-center items-center">
          <div>
            <input
              id="input"
              className="border rounded  border-gray-400 p-1.5 w-72"
              color={"medium"}
              onInput={(e) => setInputChange((e.target as HTMLInputElement).value)}
            ></input>
          </div>
          <div className="flex justify-center gap-2">
            <IonButton className="w-35" color={"danger"} onClick={() => setIsOpen(false)}>
              Fechar
            </IonButton>
            <IonButton className="w-35" color={"dark"} onClick={() => {
              onPesquisar(inputChange)
              setIsOpen(false)
              setInputChange("")
            }}>
              Pesquisar
            </IonButton>
          </div>
        </div>
      </IonModal>
    </>
  );
};
