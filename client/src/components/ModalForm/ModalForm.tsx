import {
  IonModal,
  IonButton,
  IonInput,
  IonItem,
  IonLabel,
  IonSelect,
  IonSelectOption,
  IonCardContent,
  IonList,
  IonCardHeader,
  IonCard,
  IonCardTitle,
  IonCardSubtitle,
  IonCol,
  IonRow,
  IonGrid,
  IonTitle,
  IonAlert,
  IonSpinner,
  IonText,
} from "@ionic/react";
import { useEffect, useRef, useState } from "react";
import "./ModalForm.css";
import { ItemContent } from "../ItemContent/ItemContent";
import { api } from "../../urlApiConfig";

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

    if (quantidade > falta) {
      setAlertaMaiorQueFalta(true);
      setQuantidade(null);
      setProcessando(false);
      return;
    }

    if (quantidade === falta && tipoLancamento === "parcial") {
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
      observacao: `Faltava: ${falta}`,
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
      <IonButton color="danger" onClick={() => setMostrarModal(true)}>
        Lançar
      </IonButton>

      <IonModal
        id="modal-form"
        isOpen={mostrarModal}
        onDidDismiss={() => setMostrarModal(false)}
      >
        <IonCard className="h-full pt-6" color="light">
          <IonCardHeader className="p-4">
            <div className="flex justify-between mb-2">
              <IonCardTitle>Detalhes da Produção</IonCardTitle>
              <IonLabel>
                <strong>OP: {num_op}</strong>
              </IonLabel>
            </div>
            <IonCardSubtitle>
              Seção: {secao} | Produto: {produto}
            </IonCardSubtitle>
          </IonCardHeader>

          <IonCardContent>
            <IonList>
              <IonCard color="light" className="mb-2">
                <IonItem lines="none">
                  <IonTitle size="large" className="text-center">
                    Resumo da Produção
                  </IonTitle>
                </IonItem>
                <IonGrid>
                  <IonRow>
                    <IonCol>
                      <IonItem lines="none">
                        <ItemContent label="Produzir:" value={qt_produzir} />
                      </IonItem>
                    </IonCol>
                    <IonCol>
                      <IonItem lines="none">
                        <ItemContent label="Produzido:" value={qt_produzida} />
                      </IonItem>
                    </IonCol>
                    <IonCol>
                      <IonItem lines="none">
                        <ItemContent label="Falta:" value={falta} />
                      </IonItem>
                    </IonCol>
                  </IonRow>
                </IonGrid>
              </IonCard>

              <IonItem>
                <IonLabel position="stacked">
                  Quantidade Produzida Agora
                </IonLabel>
                <IonInput
                  value={quantidade ?? ""}
                  type="number"
                  onIonChange={(e) => setQuantidade(Number(e.detail.value))}
                  placeholder="Digite a quantidade"
                />
              </IonItem>

              <IonItem>
                <IonLabel position="stacked">Tipo de Lançamento</IonLabel>
                <IonSelect
                  value={tipoLancamento}
                  onIonChange={(e) => setTipoLancamento(e.detail.value)}
                  placeholder="Selecione"
                  interface="action-sheet"
                >
                  <IonSelectOption value="parcial">Parcial</IonSelectOption>
                  <IonSelectOption value="finalizado">
                    Finalizado
                  </IonSelectOption>
                </IonSelect>
              </IonItem>
            </IonList>

            <div className="flex justify-between mt-3">
              <IonButton color="danger" onClick={() => setMostrarModal(false)}>
                Cancelar
              </IonButton>
              <IonButton
                expand="block"
                color="dark"
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
          </IonCardContent>
        </IonCard>
      </IonModal>

      <IonAlert
        isOpen={alertaCampos}
        onDidDismiss={() => setAlertaCampos(false)}
        header="Campos obrigatórios"
        message="Preencha todos os campos obrigatórios antes de lançar."
        buttons={["OK"]}
      />

      <IonAlert
        isOpen={alertaFinalizadoParcial}
        onDidDismiss={() => setAlertaFinalizadoParcial(false)}
        header="Inconsistência"
        message="Um lançamento parcial não pode ser igual à quantidade faltante. Verifique se a ordem foi finalizada."
        buttons={["Entendi"]}
      />

      <IonAlert
        isOpen={alertaErro}
        onDidDismiss={() => setAlertaErro(false)}
        header="Erro ao lançar"
        message="Ocorreu um problema ao comunicar com o servidor. Tente novamente."
        buttons={["OK"]}
      />

      <IonAlert
        isOpen={alertaMaiorQueFalta}
        onDidDismiss={() => setAlertaMaiorQueFalta(false)}
        header="Atenção"
        message="A quantidade produzida não pode ser maior do que o restante da ordem."
        buttons={["OK"]}
      />

      <IonAlert
        isOpen={alertaSucesso}
        onDidDismiss={() => setAlertaSucesso(false)}
        header="Sucesso"
        message="Lançamento realizado com sucesso!"
        buttons={["Fechar"]}
      />
      <IonModal isOpen={erroConexao}>
        <IonCard
          className="h-full flex flex-col items-center justify-center p-5"
          color="dark"
        >
          <IonSpinner
            name="crescent"
            color={"dark"}
            style={{ width: "48px", height: "48px" }}
          />
          <IonText color={"light"} className=" mt-4 text-center">
            Não foi possível conectar ao servidor.
            <br />
            Verifique sua conexão com a internet.
          </IonText>
        </IonCard>
      </IonModal>
    </>
  );
}

export default ModalForm;
