import React, { useRef, useState } from "react";
import { Modal } from "../Modal";
import { Edit, Save, X } from "lucide-react";
import { api } from "../../urlApiConfig";

type Props = {
  quantidadeLanc: number;
  tipo_lancamento: string;
  id_lancamento: string;
};

export const ModalEditarLancamento: React.FC<Props> = ({ quantidadeLanc, tipo_lancamento, id_lancamento }) => {
  const [quantidade, setQuantidade] = useState<number>(quantidadeLanc);
  const [isOpen, setIsOpen] = useState(false);
  const [tipoLancamento, setTipoLancamento] = useState(tipo_lancamento)
  const lancamentoInicial = useRef(quantidadeLanc)
  const tipoLancamentoInicial = useRef(tipo_lancamento)


  const handleUpdateLaunch = async() => {
    if (tipoLancamento == tipoLancamentoInicial.current && quantidade == lancamentoInicial.current) return false;


    const payload = {
      id_lancamento: id_lancamento,
      lancamento: quantidade,
      tipo_lancamento: tipoLancamento
    }

    try {
      const response = await fetch(`${api}/api/update/lancamento`, {
        method: "POST",
        body: JSON.stringify(payload),
        headers: {
          "Content-Type": "application/json"
        }
      })

      if (response.ok) {
        lancamentoInicial.current = quantidade
        tipoLancamentoInicial.current = tipoLancamento
        alert("Atualizado")
        setIsOpen(false)
      } else {
        alert("erro interno")
      }
    } catch (error) {
      console.log(error)
    }
  }

  return (
    <>
      <div className="absolute right-0 h-full flex items-center -mt-2 mr-4">
        <Edit
          className="text-gray-600 cursor-pointer"
          onClick={() => {
            setIsOpen(true);
          }}
        />
      </div>
      <Modal transition={300} className="h-24" isOpen={isOpen}>
        <div className="w-full border-b-2 border-gray-200 flex justify-center p-2 items-center gap-2 bg-white">
          <div className="m-auto grid gap-1 place-items-center grid-rows-2">
            <div className="flex gap-1">
              <span className="font-semibold whitespace-nowrap ">Quandidade lançada:</span>
              <input
                className="text-center w-15"
                onChange={(e) => {
                  if (Number(e.currentTarget.value) <= 99999)
                    setQuantidade(Number(e.currentTarget.value));
                }}
                value={quantidade ? quantidade : ""}
                placeholder="..."
                type="number"
              />
            </div>
            <select value={tipoLancamento} onChange={(e) => setTipoLancamento(e.currentTarget.value)} className="text-center" name="tipo_lancamento" id="tipo_lancamento">
              <option value={tipo_lancamento}>{tipo_lancamento}</option>
              <option value={tipo_lancamento == "finalizado" ? "parcial" : "finalizado"}>{tipo_lancamento == "finalizado" ? "parcial" : "finalizado"}</option>
            </select>
          </div>
          <aside className="grid place-items-center gap-1.5">
            <button onClick={handleUpdateLaunch} className={`bg-blue-400 p-1.5! text-center flex justify-center rounded-sm! text-white!`}>
                <Save />
            </button>
            <button onClick={() => setIsOpen(false)} className="bg-red-400 p-1.5! text-center flex justify-center rounded-sm! text-white!">
                <X />
            </button>
          </aside>
        </div>
      </Modal>
    </>
  );
};
