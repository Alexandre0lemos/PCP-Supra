import { IonSelect, IonSelectOption, IonButton } from "@ionic/react";
import {useEffect, useRef, useState } from "react";
import "./ModalForm.css";
import { ItemContent } from "../ItemContent/ItemContent";
import { api } from "../../urlApiConfig";
import { Modal } from "../Modal";


type PropsTypes = {
  codprod: number;
  falta: number;
  num_lote: number;
  num_op: number;
  produto: string;
  qt_produzida: number;
  qt_produzir: number;
  secao: string;
  dt_criacao: string;
  supervisor: string;
  onLancarSucesso: () => void;
  onAlertErro: (e: boolean) => void;
};

type LancamentoData = {
  num_ordem: number;
  num_lote: number;
  cod_produto: number;
  nome_produto: string;
  quantidade_prevista: number;
  lancamento: number;
  falta: number;
  tipo_lancamento: string;
  supervisor: string;
  operador: string;
  observacao: string;
  id_lancamento: string;
};

const gerarIdLancamento = () =>
  `${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 8)}`;

async function lancamento(payload: Partial<LancamentoData>) {
  try {
    const response = await fetch(`${api}/api/lancamento`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    return { ok: response.ok, status: response.status };
  } catch (error) {
    return { ok: false, error };
  }
}

function ModalForm({
  codprod,
  falta,
  num_lote,
  num_op,
  produto,
  qt_produzida,
  qt_produzir,
  secao,
  supervisor,
  dt_criacao,
  onLancarSucesso,
  onAlertErro,
}: PropsTypes) {
  const [mostrarModal, setMostrarModal] = useState(false);
  const [quantidade, setQuantidade] = useState<number | null>(null);
  const [operador, setOperador] = useState("");
  const [tipoLancamento, setTipoLancamento] = useState("");
  const [processando, setProcessando] = useState(false);
  const [erroConexao, setErroConexao] = useState(false);
  const [tentativas, setTentativas] = useState(0);
  const [intervalo, setIntervalo] = useState<NodeJS.Timeout | null>(null);
  const [objetoOperacao, setObjetoOperacao] = useState({})


  const [alertaCampos, setAlertaCampos] = useState(false);
  const [alertaFinalizadoParcial, setAlertaFinalizadoParcial] = useState(false);
  const [alertaErro, setAlertaErro] = useState(false);
  const [alertaMaiorQueFalta, setAlertaMaiorQueFalta] = useState(false);
  const [alertaSucesso, setAlertaSucesso] = useState(false);

  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lancamentoEnviado = useRef(false);

  const resetForm = () => {
    setQuantidade(null);
    setOperador("");
    setTipoLancamento("");
    setMostrarModal(false);
    setProcessando(false);
    lancamentoEnviado.current = false;
    if (intervalo) {
      clearInterval(intervalo);
      setIntervalo(null);
    }
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  };

  useEffect(() => {
    const objeto = {
      CODPROD: codprod,
      DTLANC: dt_criacao,
      FALTA: falta,
      NUMLOTE: num_lote,
      NUMOP: num_op,
      PRODUTO: produto,
      QTPRODUZIDA: qt_produzida,
      QTPRODUZIR: qt_produzir,
      SECAO: secao,
    };

    setObjetoOperacao(objeto)
  },[])

  const restabelecer = async () => {
    const response = await fetch(`${api}`);
    return response;
  };

  const verificar_existencia = async () => {
    try {
      const res = await fetch(`${api}/view/ordens-aberta`);
      if (res.ok) {
        const data: Array<object> = await res.json();
        const sucess = data.some(item => JSON.stringify(item) == JSON.stringify(objetoOperacao));
        return sucess
      } else {
        alert(res)
      }
    } catch (error) {
      alert(error)
      return error
    }
  };

  const handleSubmit = async () => {
    const sucess = await verificar_existencia();
    const datetime = new Date()

    const datetimeNow = datetime.toLocaleString('pt-BR', {
      timeZone: 'America/Sao_Paulo',
    });

    if (!sucess) {
      alert("Os dados foram alterado no banco de dados, não foi possivel completar o lançamento")
      location.href = "/ordens-aberta"
      return;
    }

    if (!quantidade || !tipoLancamento) {
      setAlertaCampos(true);
      setProcessando(false);
      return;
    }

    // if (quantidade > falta) {
    //   setAlertaMaiorQueFalta(true);
    //   setQuantidade(null);
    //   setProcessando(false);
    //   return;
    // }

    if (quantidade >= falta && tipoLancamento === "parcial") {
      setAlertaFinalizadoParcial(true);
      setProcessando(false);
      return;
    }

    if (lancamentoEnviado.current) return;
    lancamentoEnviado.current = true;

    const payload: Partial<LancamentoData> = {
      num_ordem: num_op,
      num_lote,
      cod_produto: codprod,
      nome_produto: produto,
      quantidade_prevista: qt_produzir,
      lancamento: quantidade,
      falta: falta - quantidade,
      tipo_lancamento: tipoLancamento,
      supervisor,
      operador: operador || "não definido",
      observacao: `{Faltava: ${falta}, Data: ${datetimeNow}}`,
      id_lancamento: gerarIdLancamento(),
    };

    let respostaRecebida = false;

    timeoutRef.current = setTimeout(() => {
      if (!respostaRecebida) {
        setMostrarModal(false);
        setErroConexao(true);
        setProcessando(false);
      }
    }, 2000);

    const resultado = await lancamento(payload);

    if (resultado.ok) {
      respostaRecebida = true;
      clearTimeout(timeoutRef.current!);
      resetForm();
      setAlertaSucesso(true);
      onLancarSucesso?.();
    } else {
      respostaRecebida = true;
      clearTimeout(timeoutRef.current!);
      setMostrarModal(false);
      setProcessando(false);
      setErroConexao(true);

      if (!intervalo) {
        const novoIntervalo = setInterval(async () => {
          const tentativa = await restabelecer();
          if (tentativa.ok) {
            onAlertErro(true);
            clearInterval(novoIntervalo);
            setIntervalo(null);
            setErroConexao(false);
            setTentativas(0);
            resetForm();
            setAlertaSucesso(true);
            onLancarSucesso?.();
          } else {
            setTentativas((t) => t + 1);
            if (tentativas >= 10) {
              clearInterval(novoIntervalo);
              setIntervalo(null);
              setTentativas(0);
              setAlertaErro(true);
            }
          }
        }, 1000);
        setIntervalo(novoIntervalo);
      }
    }
  };
  return (
    <>
      <button className="mt-8 w-24 h-8 bg-gray-600 text-white! rounded-sm! font-semibold!" onClick={() => setMostrarModal(true)}>
        Lançar
      </button>

      
        <Modal
        onBlur
        isOpen={mostrarModal}
        transition={500}
        onClose={() => setMostrarModal(false)}
        >
          <div
            className={`bg-white ${screen.width <= 425 && "pt-4"} text-black shadow-2xl  gap-4 flex-col flex border-gray-400 rounded-b-lg w-full p-2 pt-2 pb-4`}
            onClick={(e) => e.stopPropagation()}
          >
            <header className="border-b pb-4 flex-col flex border-gray-400">
              <div className="flex text-sm mt-1.5 text-blue-500 justify-between items-center mb-2">
                <h1>Detalhes da Produção</h1>
                <label>
                  <strong>OP: {num_op}</strong>
                </label>
              </div>
              <div className="text-sm">
                Seção: {secao} | Produto: {produto}
              </div>
            </header>

            <div>
              <div className="border-b pb-4 border-gray-400 flex-col flex gap-4">
                <div>
                  <div className="text-center text-lg font-normal">
                    Resumo da Produção:
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <div>
                      <ItemContent label="Produzir:" value={qt_produzir} />
                    </div>
                  </div>
                  <div>
                    <div>
                      <ItemContent label="Produzido:" value={qt_produzida} />
                    </div>
                  </div>
                  <div>
                    <div>
                      <ItemContent label="Falta:" value={falta} />
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-5">
                <label htmlFor="quantidade" className="block mb-1">
                  Quantidade Produzida:
                </label>
                <input
                  id="quantidade"
                  value={quantidade ?? ""}
                  type="number"
                  onChange={(e) => setQuantidade(Number(e.target.value))}
                  placeholder="Digite a quantidade"
                  className="w-full border-b border-gray-400 rounded px-2 py-1"
                />
              </div>

              <div className="mt-5 border-b border-gray-400">
                <label htmlFor="tipoLancamento" className="block mb-1">
                  Tipo de Lançamento:
                </label>
                <IonSelect
                  id="tipoLancamento"
                  className="pl-2"
                  color={"none"}
                  value={tipoLancamento}
                  onIonChange={(e) => setTipoLancamento(e.detail.value)}
                  placeholder="Selecione"
                  interface="action-sheet"
                >
                  <IonSelectOption value="parcial">Parcial</IonSelectOption>
                  <IonSelectOption value="finalizado">Finalizado</IonSelectOption>
                </IonSelect>
              </div>
            </div>

            <div className="flex justify-between">
              <IonButton color="danger" onClick={async() => {
                setMostrarModal(false)
              }}>
                Cancelar
              </IonButton>
              <IonButton
                expand="block"
                color="primary"
                onClick={() => {
                  if (!processando) {
                    setProcessando(true);
                    handleSubmit();
                  }
                }}
              >
                Lançar Produção
              </IonButton>
            </div>
          </div>
        </Modal>


      {alertaCampos && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
          onClick={() => setAlertaCampos(false)}
        >
          <div
            className="bg-white p-6 rounded shadow max-w-sm"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-lg font-semibold mb-2">Campos obrigatórios</h2>
            <p>Preencha todos os campos obrigatórios antes de lançar.</p>
            <button
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded"
              onClick={() => setAlertaCampos(false)}
            >
              OK
            </button>
          </div>
        </div>
      )}

      {alertaFinalizadoParcial && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
          onClick={() => setAlertaFinalizadoParcial(false)}
        >
          <div
            className="bg-white p-6 rounded shadow max-w-sm"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-lg font-semibold mb-2">Inconsistência</h2>
            <p>
              Um lançamento parcial não pode ser igual à quantidade faltante.
              Verifique se a ordem foi finalizada.
            </p>
            <button
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded"
              onClick={() => setAlertaFinalizadoParcial(false)}
            >
              Entendi
            </button>
          </div>
        </div>
      )}

      {alertaErro && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
          onClick={() => setAlertaErro(false)}
        >
          <div
            className="bg-white p-6 rounded shadow max-w-sm"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-lg font-semibold mb-2">Erro ao lançar</h2>
            <p>Ocorreu um problema ao comunicar com o servidor. Tente novamente.</p>
            <button
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded"
              onClick={() => setAlertaErro(false)}
            >
              OK
            </button>
          </div>
        </div>
      )}

      {alertaMaiorQueFalta && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
          onClick={() => setAlertaMaiorQueFalta(false)}
        >
          <div
            className="bg-white p-6 rounded shadow max-w-sm"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-lg font-semibold mb-2">Atenção</h2>
            <p>A quantidade produzida não pode ser maior do que o restante da ordem.</p>
            <button
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded"
              onClick={() => setAlertaMaiorQueFalta(false)}
            >
              OK
            </button>
          </div>
        </div>
      )}

      {alertaSucesso && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
          onClick={() => setAlertaSucesso(false)}
        >
          <div
            className="bg-white p-6 rounded shadow max-w-sm"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-lg font-semibold mb-2">Sucesso</h2>
            <p>Lançamento realizado com sucesso!</p>
            <button
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded"
              onClick={() => setAlertaSucesso(false)}
            >
              Fechar
            </button>
          </div>
        </div>
      )}

      {erroConexao && (
        <div
          className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black bg-opacity-50 p-5"
          onClick={() => setErroConexao(false)}
        >
          <div className="bg-gray-800 flex flex-col items-center justify-center p-5 rounded text-white max-w-sm">
            <div className="loader mb-4" />
            <p className="text-center">
              Não foi possível conectar ao servidor.
              <br />
              Verifique sua conexão com a internet.
            </p>
          </div>
        </div>
      )}
    </>
  );
}

export default ModalForm;
