import React, { useEffect, useRef, useState } from "react";
import {
  IonButton,
  IonContent,
  IonHeader,
  IonModal,
  IonPage,
  IonSelect,
  IonSelectOption,
  IonToolbar,
  useIonRouter,
  IonCard,
  IonSpinner,
  IonText,
} from "@ionic/react";
import { api } from "../../urlApiConfig";
import "./Lancamentos.css";

interface LancamentoItem {
  cod_produto: number;
  falta: number;
  lancamento: number;
  nome_produto: string;
  num_lote: number;
  num_ordem: number;
  observacao: string;
  operador: string;
  quantidade_prevista: number;
  supervisor: string;
  finalizado: boolean | number;
  id_lancamento: string;
  tipo_lancamento: "parcial" | "finalizado";
}

export const Lancamentos: React.FC = () => {
  const [lancamentos, setLancamentos] = useState<LancamentoItem[]>([]);
  const [modalAtivo, setModalAtivo] = useState(false);
  const [filtroAtual, setFiltroAtual] = useState("pendentes");
  const [ordemSelecionada, setOrdemSelecionada] = useState("");
  const [erroConexao, setErroConexao] = useState(false);
  const [tentativas, setTentativas] = useState(0);
  const router = useIonRouter();

  const intervaloReconexao = useRef<NodeJS.Timeout | null>(null);
  const requisicaoAtiva = useRef(false);
  const filtroRef = useRef(filtroAtual);

  useEffect(() => {
    filtroRef.current = filtroAtual;
  }, [filtroAtual]);

  const verificarAutenticacao = () => {
    const isAdmin: boolean = Number(localStorage.getItem("isAdmin?")) == 1
    
    if (!isAdmin){
      router.push("/login")
    }
  };

  useEffect(() => {
    verificarAutenticacao();
    buscarLancamentos();

    const intervalo = setInterval(() => {
      if (!erroConexao && !requisicaoAtiva.current) {
        buscarLancamentos();
      }
    }, 2000);

    return () => clearInterval(intervalo);
  }, []);

  useEffect(() => {
    buscarLancamentos();
  }, [filtroAtual]);

  const buscarLancamentos = async () => {
    if (requisicaoAtiva.current) return;
    requisicaoAtiva.current = true;

    try {
      const res = await fetch(`${api}/view/lancados`);
      if (!res.ok) throw new Error("Erro na resposta");

      const data = await res.json();
      const filtrados =
        filtroRef.current === "geral"
          ? data
          : data.filter((item: LancamentoItem) =>
              filtroRef.current === "pendentes" ? !item.finalizado : item.finalizado
            );

      setLancamentos(filtrados);
      setErroConexao(false);
      setTentativas(0);
    } catch (error) {
      console.error("Falha na conexão:", error);
      setErroConexao(true);

      if (!intervaloReconexao.current) {
        intervaloReconexao.current = setInterval(async () => {
          try {
            const res = await fetch(`${api}/view/lancados`);
            if (res.ok) {
              const data = await res.json();
              const filtrados =
                filtroRef.current === "geral"
                  ? data
                  : data.filter((item: LancamentoItem) =>
                      filtroRef.current === "pendentes" ? !item.finalizado : item.finalizado
                    );

              setLancamentos(filtrados);
              setErroConexao(false);
              setTentativas(0);
              clearInterval(intervaloReconexao.current!);
              intervaloReconexao.current = null;
            } else {
              setTentativas((prev) => prev + 1);
            }

            if (tentativas >= 10) {
              clearInterval(intervaloReconexao.current!);
              intervaloReconexao.current = null;
            }
          } catch {
            setTentativas((prev) => prev + 1);
          }
        }, 5000);
      }
    } finally {
      requisicaoAtiva.current = false;
    }
  };

  const finalizarOrdem = async (id: string) => {
    try {
      await fetch(`${api}/api/finalizar`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ finalizar: true, num_op: id }),
      });

      setModalAtivo(false);
      setOrdemSelecionada("");
      buscarLancamentos();
    } catch (error) {
      console.error("Erro ao finalizar ordem:", error);
    }
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar color="dark">
          <IonSelect
            value={filtroAtual}
            color="medium"
            onIonChange={(e) => setFiltroAtual(e.detail.value)}
          >
            <IonSelectOption value="geral">Geral</IonSelectOption>
            <IonSelectOption value="pendentes">Pendentes</IonSelectOption>
            <IonSelectOption value="finalizados">Finalizados</IonSelectOption>
          </IonSelect>
        </IonToolbar>
      </IonHeader>

      <IonContent color="dark" style={{ padding: "20px" }}>
        <table className="tabela-lancamentos" cellPadding={8}>
          <thead>
            <tr>
              <th>CodProd</th>
              <th>Produto</th>
              <th>Ordem</th>
              <th>Quantidade</th>
              <th>Lançamento</th>
              <th>Tipo</th>
              <th>Falta</th>
              <th>Supervisor</th>
              <th>Observação</th>
            </tr>
          </thead>
          <tbody>
            {lancamentos.map((item, index) => (
              <tr
                key={index}
                className={`linha${item.finalizado ? " finalizado" : ""}${
                  item.finalizado === 1 ? " finalizado1" : ""
                }`}
                onClick={() => {
                  if (!item.finalizado) {
                    setOrdemSelecionada(item.id_lancamento);
                    setModalAtivo(true);
                  }
                }}
              >
                <td>{item.cod_produto}</td>
                <td>{item.nome_produto}</td>
                <td>{item.num_ordem}</td>
                <td>{item.quantidade_prevista}</td>
                <td>{item.lancamento}</td>
                <td className="uppercase">{item.tipo_lancamento}</td>
                <td>{item.falta}</td>
                <td className="uppercase">{item.supervisor}</td>
                <td>{item.observacao || "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <IonModal isOpen={modalAtivo} className="modal-finalizar">
          <div className="h-full flex items-center justify-center">
            <div className="flex flex-col justify-center items-center text-center">
              <h2 className="text-black">Finalizar ordem?</h2>
              <div className="flex gap-4 mt-2">
                <IonButton
                  size="small"
                  color="success"
                  onClick={() => finalizarOrdem(ordemSelecionada)}
                >
                  Sim
                </IonButton>
                <IonButton
                  size="small"
                  color="medium"
                  onClick={() => {
                    setOrdemSelecionada("");
                    setModalAtivo(false);
                  }}
                >
                  Não
                </IonButton>
              </div>
            </div>
          </div>
        </IonModal>

        <IonModal isOpen={erroConexao}>
          <IonCard className="h-full flex flex-col items-center justify-center p-5" color="dark">
            <IonSpinner name="crescent" style={{ width: "48px", height: "48px" }} />
            <IonText color="light" className="mt-4 text-center">
              Não foi possível conectar ao servidor.
              <br />
              Tentando reconectar automaticamente...
            </IonText>
          </IonCard>
        </IonModal>
      </IonContent>
    </IonPage>
  );
};

export default Lancamentos;