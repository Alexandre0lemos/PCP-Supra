import { Search } from "lucide-react";
import React, { ChangeEvent, useState } from "react";
import "./SearchInput.css"
import { Modal } from "../Modal";

type PropsSearch = {
  onPesquisar: (e: ChangeEvent<HTMLInputElement>) => void;
};

export const SearchInput: React.FC<PropsSearch> = ({onPesquisar}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button className="h-10" onClick={() => setIsOpen(true)}>
        <Search size={20} />
      </button>

      <Modal transition={300} onClose={() => setIsOpen(false)} isOpen={isOpen}>
        <div className="w-10/12 h-20 flex justify-center items-start mt-8">
          <input onChange={onPesquisar} autoFocus placeholder="Nome do Produto" className="border-b-2 rounded-xs placeholder:text-gray-500 shadow-2xl w-full pl-0 p-1.5 border-blue-400 " type="text" />
        </div>
      </Modal>
    </>
  );
};
