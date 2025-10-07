import React, { useEffect, useMemo, useState } from "react";
import { api } from "../../urlApiConfig";
import { ModalEditarLancamento } from "../../components/ModalEditarLancamento/ModalEditarLancamento";
import { FooterBar } from "../../layout/FooterBar";
import { Container } from "../../layout/Container/Index";

interface lancamento {
  cod_produto: number;
  finalizado: number;
  id_lancamento: string;
  nome_produto: string;
  supervisor: string;
  observacao: [];
  lancamento: number;
  num_ordem: number;
  tipo_lancamento: string;
}

export const EditarLancamento: React.FC = () => {
  const [lancados, setLancamento] = useState<lancamento[]>([]);
  const [pendentes, setPendentes] = useState<lancamento[]>([]);

  const handleLancados = async () => {
    try {
      const response = await fetch(`${api}/view/lancados`);

      if (response.ok) {
        const response_json = await response.json();
        setLancamento(response_json);
      } else {
        console.error("Error");
      }
    } catch {
      console.error("Erro de conexão");
    }
  };

  useMemo(() => {
    const pendentes = lancados.filter(
      (lancamento) =>
        lancamento.finalizado == 0 &&
        lancamento.supervisor == localStorage.getItem("username")
    );
    setPendentes(pendentes);
  }, [lancados]);

  useEffect(() => {
    handleLancados();
  }, []);

  if (pendentes.length <= 0) {
    return (
      <div className="pt-6 sm:p-0"> 
      <Container>
        <div className=" flex justify-center items-center h-full">
          <h1>Nenhum lançamento pendente, verifique com a logistica</h1>
        </div>
      </Container>
      <FooterBar />
      </div>
    )
  }

  return (
    <div className="pt-6 sm:pt-0">
      <Container>
        <div className="flex flex-col text-center gap-2 pt-2">
          {pendentes.map((pendente) => (
            <div
              key={pendente.id_lancamento}
              className="relative overflow-hidden border-b h-24 items-center border-gray-300 p-2 flex justify-center"
            >
              <div>
                <div className="flex flex-col">
                  <h1 className="line-clamp-1">
                    {pendente.nome_produto} - {pendente.cod_produto}
                  </h1>
                  <span className="font-semibold text-gray-700 text-sm">
                    Ordem: {String(pendente.num_ordem).toUpperCase()}
                  </span>
                </div>
                <div>
                  {String(pendente.observacao)
                    .split(",")[1]
                    .replace("Data:", "")}{" "}
                  - {String(pendente.observacao).split(",")[2]}
                </div>
              </div>

              <ModalEditarLancamento
                id_lancamento={pendente.id_lancamento}
                tipo_lancamento={pendente.tipo_lancamento}
                quantidadeLanc={pendente.lancamento}
              />
            </div>
          ))}
        </div>
      </Container>
      <FooterBar />
    </div>
  );
};
