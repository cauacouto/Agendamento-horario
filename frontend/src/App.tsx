import { useState, useEffect } from "react";

// ── Types ──────────────────────────────────────────────────────────────────
interface Agendamento {
  id?: number;
  cliente: string;
  servico: string;
  profissional: string;
  dataHoraAgendamento: string;
  HorarioInsercao?: string;
}

interface FormState {
  cliente: string;
  servico: string;
  profissional: string;
}

type ModalType = "novo" | "editar" | "deletar" | null;

// ── Constants ──────────────────────────────────────────────────────────────
const API_BASE = "http://localhost:8081/agendamento";

const SERVICOS: string[] = [
  "Corte", "Barba", "Corte + Barba", "Hidratação",
  "Coloração", "Manicure", "Pedicure", "Outro",
];

const PROFISSIONAIS: string[] = ["Carlos", "Ana", "Lucas", "Fernanda", "Roberto"];
const PROF_COLORS: string[] = ["#c9a84c", "#b87a3d", "#8a6e9a", "#4a8a7a", "#5a7aaa"];
const EMPTY_FORM: FormState = { cliente: "", servico: "", profissional: "" };
const BUSINESS_HOURS: number[] = Array.from({ length: 14 }, (_, i) => i + 7);

// ── API Layer ──────────────────────────────────────────────────────────────
const api = {
  listar: async (date: string): Promise<Agendamento[]> => {
    const res = await fetch(`${API_BASE}?date=${date}`);
    if (!res.ok) throw new Error("Erro ao listar agendamentos");
    return res.json();
  },

  salvar: async (ag: Omit<Agendamento, "id" | "HorarioInsercao">): Promise<Agendamento> => {
    const res = await fetch(API_BASE, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(ag),
    });
    if (!res.ok) throw new Error((await res.text()) || "Erro ao salvar");
    return res.json();
  },

  alterar: async (
    ag: Omit<Agendamento, "id" | "HorarioInsercao">,
    cliente: string,
    dataHoraAgendada: string
  ): Promise<Agendamento> => {
    const params = new URLSearchParams({ cliente, dataHoraAgendada });
    const res = await fetch(`${API_BASE}?${params}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(ag),
    });
    if (!res.ok) throw new Error((await res.text()) || "Erro ao alterar");
    return res.json();
  },

  deletar: async (cliente: string, dataHoraAgendamento: string): Promise<void> => {
    const params = new URLSearchParams({ cliente, dataHoraAgendamento });
    const res = await fetch(`${API_BASE}?${params}`, { method: "DELETE" });
    if (!res.ok) throw new Error("Erro ao deletar agendamento");
  },
};

// ── Helpers ────────────────────────────────────────────────────────────────
const formatTime = (dt: string): string =>
  new Date(dt).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });

const formatDateTime = (dt: string): string =>
  new Date(dt).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" });

const toISOLocal = (date: string, time: string): string => `${date}T${time}:00`;

const todayISO = (): string => new Date().toISOString().split("T")[0];

const profColor = (p: string): string => {
  const i = PROFISSIONAIS.indexOf(p);
  return PROF_COLORS[i >= 0 ? i : PROF_COLORS.length - 1];
};

// ── App ────────────────────────────────────────────────────────────────────
export default function App() {
  const [selectedDate, setSelectedDate] = useState<string>(todayISO());
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [modal, setModal] = useState<ModalType>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [formTime, setFormTime] = useState<string>("09:00");
  const [editTarget, setEditTarget] = useState<Agendamento | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Agendamento | null>(null);

  const showSuccess = (msg: string): void => {
    setSuccess(msg);
    setTimeout(() => setSuccess(null), 3500);
  };

  const fetchAgendamentos = async (): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.listar(selectedDate);
      setAgendamentos(data);
    } catch (e) {
      setError((e as Error).message);
      setAgendamentos([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAgendamentos(); }, [selectedDate]);

  // ── Handlers ─────────────────────────────────────────────────────────────
  const handleSalvar = async (): Promise<void> => {
    if (!form.cliente.trim()) return setError("Nome do cliente é obrigatório.");
    if (!form.servico) return setError("Selecione um serviço.");
    setError(null);
    try {
      await api.salvar({
        cliente: form.cliente,
        servico: form.servico,
        profissional: form.profissional,
        dataHoraAgendamento: toISOLocal(selectedDate, formTime),
      });
      showSuccess("Agendamento criado com sucesso!");
      closeModal();
      fetchAgendamentos();
    } catch (e) {
      const msg = (e as Error).message;
      setError(msg.includes("horario ja esta preenchido")
        ? "⚠️ Esse horário já está ocupado para este serviço."
        : msg);
    }
  };

  const handleAlterar = async (): Promise<void> => {
    if (!form.cliente.trim()) return setError("Nome do cliente é obrigatório.");
    if (!form.servico) return setError("Selecione um serviço.");
    if (!editTarget) return;
    setError(null);
    try {
      await api.alterar(
        {
          cliente: form.cliente,
          servico: form.servico,
          profissional: form.profissional,
          dataHoraAgendamento: toISOLocal(selectedDate, formTime),
        },
        editTarget.cliente,
        editTarget.dataHoraAgendamento
      );
      showSuccess("Agendamento atualizado!");
      closeModal();
      fetchAgendamentos();
    } catch (e) {
      setError((e as Error).message);
    }
  };

  const handleDeletar = async (): Promise<void> => {
    if (!deleteTarget) return;
    setError(null);
    try {
      await api.deletar(deleteTarget.cliente, deleteTarget.dataHoraAgendamento);
      showSuccess("Agendamento removido.");
      closeModal();
      fetchAgendamentos();
    } catch (e) {
      setError((e as Error).message);
    }
  };

  // ── Modal helpers ─────────────────────────────────────────────────────────
  const openNovo = (): void => {
    setForm(EMPTY_FORM);
    setFormTime("09:00");
    setModal("novo");
    setError(null);
  };

  const openEditar = (ag: Agendamento): void => {
    const dt = new Date(ag.dataHoraAgendamento);
    setForm({ cliente: ag.cliente, servico: ag.servico, profissional: ag.profissional ?? "" });
    setFormTime(`${String(dt.getHours()).padStart(2, "0")}:${String(dt.getMinutes()).padStart(2, "0")}`);
    setEditTarget(ag);
    setModal("editar");
    setError(null);
  };

  const openDeletar = (ag: Agendamento): void => {
    setDeleteTarget(ag);
    setModal("deletar");
    setError(null);
  };

  const closeModal = (): void => {
    setModal(null);
    setError(null);
    setForm(EMPTY_FORM);
    setEditTarget(null);
    setDeleteTarget(null);
  };

  // ── Derived data ──────────────────────────────────────────────────────────
  const getByHour = (h: number): Agendamento[] =>
    agendamentos
      .filter((ag) => new Date(ag.dataHoraAgendamento).getHours() === h)
      .sort((a, b) => new Date(a.dataHoraAgendamento).getTime() - new Date(b.dataHoraAgendamento).getTime());

  const agora = new Date();
  const proximos: Agendamento[] = agendamentos
    .filter((ag) => new Date(ag.dataHoraAgendamento) > agora)
    .sort((a, b) => new Date(a.dataHoraAgendamento).getTime() - new Date(b.dataHoraAgendamento).getTime());

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        :root {
          --bg: #0c0c0b; --surface: #161614; --surface2: #1e1e1b; --surface3: #252521;
          --border: #2a2a26; --border2: #333330;
          --gold: #c9a84c; --gold-l: #e0c070; --gold-d: #6b5520;
          --text: #eae5d8; --text-dim: #7a7464; --text-muted: #3e3c36;
          --danger: #c05040; --success: #4a8a60;
          --r: 10px; --r-sm: 6px;
        }
        body { font-family: 'DM Sans', sans-serif; background: var(--bg); color: var(--text); min-height: 100vh; }

        .layout { display: grid; grid-template-columns: 260px 1fr; min-height: 100vh; }

        /* Sidebar */
        .sidebar {
          background: var(--surface); border-right: 1px solid var(--border);
          display: flex; flex-direction: column; padding: 24px 18px; gap: 22px;
          position: sticky; top: 0; height: 100vh; overflow-y: auto;
        }
        .logo { padding-bottom: 18px; border-bottom: 1px solid var(--border); }
        .logo-mark {
          width: 34px; height: 34px; background: var(--gold); border-radius: 7px;
          display: flex; align-items: center; justify-content: center;
          font-family: 'Syne', sans-serif; font-weight: 800; font-size: .9rem;
          color: #0c0c0b; margin-bottom: 10px;
        }
        .logo h1 { font-family: 'Syne', sans-serif; font-size: 1rem; font-weight: 700; letter-spacing: -.3px; }
        .logo p { font-size: .68rem; color: var(--text-dim); letter-spacing: .5px; text-transform: uppercase; margin-top: 2px; }

        .field-label { font-size: .68rem; font-weight: 600; letter-spacing: .8px; text-transform: uppercase; color: var(--text-dim); display: block; margin-bottom: 7px; }
        .date-picker {
          width: 100%; background: var(--surface2); border: 1px solid var(--border2);
          border-radius: var(--r-sm); color: var(--text); font-family: 'DM Sans', sans-serif;
          font-size: .875rem; padding: 10px 12px; outline: none; transition: border-color .2s;
        }
        .date-picker:focus { border-color: var(--gold); }

        .btn-new {
          width: 100%; background: var(--gold); color: #0c0c0b;
          font-family: 'Syne', sans-serif; font-weight: 700; font-size: .82rem; letter-spacing: .3px;
          padding: 12px; border: none; border-radius: var(--r-sm); cursor: pointer; transition: all .2s;
        }
        .btn-new:hover { background: var(--gold-l); transform: translateY(-1px); box-shadow: 0 4px 16px rgba(201,168,76,.25); }

        .stat-box { background: var(--surface2); border: 1px solid var(--border); border-radius: var(--r-sm); padding: 14px; }
        .stat-box .s-lbl { font-size: .66rem; text-transform: uppercase; letter-spacing: 1px; color: var(--text-dim); }
        .stat-box .s-val { font-family: 'Syne', sans-serif; font-size: 1.6rem; font-weight: 700; color: var(--gold); margin-top: 2px; }
        .stat-box .s-sub { font-size: .72rem; color: var(--text-dim); margin-top: 2px; }

        .prox-section { display: flex; flex-direction: column; gap: 6px; }
        .prox-lbl { font-size: .68rem; font-weight: 600; letter-spacing: 1px; text-transform: uppercase; color: var(--text-dim); margin-bottom: 2px; }
        .prox-item {
          background: var(--surface2); border: 1px solid var(--border); border-left: 2px solid var(--gold);
          border-radius: var(--r-sm); padding: 9px 12px; cursor: pointer; transition: background .15s;
        }
        .prox-item:hover { background: var(--surface3); }
        .pi-name { font-size: .8rem; font-weight: 500; }
        .pi-sub { font-size: .7rem; color: var(--text-dim); margin-top: 2px; }

        /* Main */
        .main-area { display: flex; flex-direction: column; }
        .topbar {
          padding: 22px 28px 18px; border-bottom: 1px solid var(--border);
          display: flex; align-items: center; justify-content: space-between;
        }
        .topbar-title { font-family: 'Syne', sans-serif; font-size: 1.2rem; font-weight: 700; }
        .topbar-sub { font-size: .78rem; color: var(--text-dim); margin-top: 3px; }
        .badge {
          background: var(--surface2); border: 1px solid var(--border2);
          border-radius: 20px; padding: 6px 14px; font-size: .78rem; color: var(--text-dim);
        }
        .badge span { color: var(--gold); font-weight: 600; }

        /* Timeline */
        .timeline-wrap { flex: 1; padding: 12px 28px 48px; overflow-y: auto; }
        .timeline { display: flex; flex-direction: column; }
        .hour-row { display: grid; grid-template-columns: 52px 1fr; min-height: 58px; position: relative; }
        .hour-row::before {
          content: ''; position: absolute; left: 52px; right: 0; top: 18px;
          height: 1px; background: var(--border); pointer-events: none;
        }
        .hour-lbl { font-size: .7rem; color: var(--text-muted); font-weight: 500; padding-top: 11px; letter-spacing: .5px; user-select: none; }
        .hour-slots { padding: 6px 0 6px 12px; display: flex; flex-wrap: wrap; gap: 8px; align-items: flex-start; min-height: 42px; }

        .ag-card {
          background: var(--surface); border: 1px solid var(--border2); border-radius: var(--r);
          padding: 9px 13px; display: flex; align-items: center; gap: 11px; cursor: pointer;
          transition: all .18s; min-width: 200px; max-width: 310px; position: relative; overflow: hidden;
          animation: cardIn .22s ease;
        }
        .ag-card::before {
          content: ''; position: absolute; left: 0; top: 0; bottom: 0; width: 3px;
          background: var(--c, var(--gold)); border-radius: 3px 0 0 3px;
        }
        .ag-card:hover { background: var(--surface2); transform: translateY(-1px); box-shadow: 0 6px 20px rgba(0,0,0,.4); }
        @keyframes cardIn { from { opacity: 0; transform: translateX(-5px); } to { opacity: 1; transform: translateX(0); } }

        .ag-time { font-family: 'Syne', sans-serif; font-size: .82rem; font-weight: 700; color: var(--text-dim); white-space: nowrap; }
        .ag-info { flex: 1; min-width: 0; }
        .ag-name { font-size: .85rem; font-weight: 500; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .ag-meta { font-size: .7rem; color: var(--text-dim); margin-top: 2px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .ag-prof { font-size: .65rem; font-weight: 700; letter-spacing: .5px; text-transform: uppercase; color: var(--c, var(--gold)); margin-top: 3px; }
        .ag-actions { display: flex; gap: 3px; opacity: 0; transition: opacity .18s; }
        .ag-card:hover .ag-actions { opacity: 1; }
        .icon-btn {
          background: none; border: none; cursor: pointer; padding: 5px;
          border-radius: 5px; font-size: 12px; line-height: 1; transition: all .15s; color: var(--text-dim);
        }
        .icon-btn:hover { background: var(--surface3); color: var(--text); }
        .icon-btn.del:hover { background: rgba(192,80,64,.15); color: var(--danger); }

        /* Loading */
        .loading { display: flex; align-items: center; justify-content: center; padding: 80px; color: var(--text-dim); gap: 12px; font-size: .875rem; }
        .spinner { width: 18px; height: 18px; border: 2px solid var(--border2); border-top-color: var(--gold); border-radius: 50%; animation: spin .7s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }

        /* Toast */
        .toast {
          position: fixed; bottom: 24px; right: 24px; padding: 12px 18px; border-radius: var(--r);
          font-size: .83rem; font-weight: 500; animation: toastIn .3s ease; z-index: 9999;
          box-shadow: 0 8px 32px rgba(0,0,0,.5); max-width: 300px;
        }
        .toast.s { background: var(--success); color: #fff; }
        .toast.e { background: var(--danger); color: #fff; }
        @keyframes toastIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }

        /* Modal */
        .overlay {
          position: fixed; inset: 0; background: rgba(0,0,0,.72); backdrop-filter: blur(6px);
          z-index: 200; display: flex; align-items: center; justify-content: center; padding: 20px;
          animation: fadeIn .2s ease;
        }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        .modal {
          background: var(--surface); border: 1px solid var(--border2); border-radius: 14px;
          padding: 26px 26px 22px; width: 100%; max-width: 470px; animation: modalIn .24s ease;
        }
        @keyframes modalIn { from { opacity: 0; transform: scale(.96) translateY(10px); } to { opacity: 1; transform: scale(1) translateY(0); } }

        .modal-head { display: flex; align-items: center; justify-content: space-between; margin-bottom: 22px; }
        .modal-head h2 { font-family: 'Syne', sans-serif; font-size: 1.15rem; font-weight: 700; }
        .close-btn { background: none; border: none; cursor: pointer; color: var(--text-dim); font-size: 17px; padding: 4px; border-radius: 4px; transition: color .15s; }
        .close-btn:hover { color: var(--text); }

        .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
        .form-group { display: flex; flex-direction: column; gap: 7px; }
        .form-group.full { grid-column: 1 / -1; }
        .form-group label { font-size: .68rem; font-weight: 600; letter-spacing: .8px; text-transform: uppercase; color: var(--text-dim); }
        .form-group input, .form-group select {
          background: var(--surface2); border: 1px solid var(--border2); border-radius: var(--r-sm);
          color: var(--text); font-family: 'DM Sans', sans-serif; font-size: .875rem;
          padding: 11px 12px; outline: none; transition: border-color .2s; width: 100%;
        }
        .form-group select option { background: var(--surface2); }
        .form-group input:focus, .form-group select:focus { border-color: var(--gold); }

        .form-error {
          background: rgba(192,80,64,.1); border: 1px solid rgba(192,80,64,.3);
          border-radius: var(--r-sm); padding: 10px 13px; font-size: .78rem; color: #e08070; margin-top: 6px;
        }

        .modal-footer { display: flex; gap: 10px; justify-content: flex-end; margin-top: 20px; padding-top: 18px; border-top: 1px solid var(--border); }
        .btn { font-family: 'Syne', sans-serif; font-size: .8rem; font-weight: 700; padding: 10px 18px; border-radius: var(--r-sm); border: none; cursor: pointer; transition: all .2s; letter-spacing: .3px; }
        .btn-primary { background: var(--gold); color: #0c0c0b; }
        .btn-primary:hover { background: var(--gold-l); }
        .btn-ghost { background: transparent; color: var(--text-dim); border: 1px solid var(--border2); }
        .btn-ghost:hover { color: var(--text); border-color: var(--text-dim); }
        .btn-danger { background: var(--danger); color: #fff; }
        .btn-danger:hover { background: #d06050; }

        .del-preview { background: var(--surface2); border: 1px solid var(--border2); border-radius: var(--r-sm); padding: 15px; margin-bottom: 14px; display: flex; flex-direction: column; gap: 6px; }
        .dp-row { font-size: .83rem; color: var(--text-dim); display: flex; gap: 8px; }
        .dp-row strong { color: var(--text); }

        @media (max-width: 720px) {
          .layout { grid-template-columns: 1fr; }
          .sidebar { height: auto; position: static; border-right: none; border-bottom: 1px solid var(--border); }
          .form-grid { grid-template-columns: 1fr; }
        }
      `}</style>

      <div className="layout">

        {/* ── SIDEBAR ── */}
        <aside className="sidebar">
          <div className="logo">
            <div className="logo-mark">AG</div>
            <h1>AgendaSystem</h1>
            <p>Gestão de horários</p>
          </div>

          <div>
            <label className="field-label">Data selecionada</label>
            <input
              type="date"
              className="date-picker"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
            />
          </div>

          <button className="btn-new" onClick={openNovo}>+ Novo Agendamento</button>

          <div className="stat-box">
            <div className="s-lbl">Total do dia</div>
            <div className="s-val">{agendamentos.length}</div>
            <div className="s-sub">
              {new Date(selectedDate + "T12:00:00").toLocaleDateString("pt-BR", {
                weekday: "long", day: "2-digit", month: "long",
              })}
            </div>
          </div>

          <div className="stat-box">
            <div className="s-lbl">Próximo horário</div>
            <div className="s-val" style={{ fontSize: "1.1rem", paddingTop: 4 }}>
              {proximos[0] ? formatTime(proximos[0].dataHoraAgendamento) : "—"}
            </div>
            <div className="s-sub">{proximos[0]?.cliente ?? "Nenhum pendente"}</div>
          </div>

          {proximos.length > 0 && (
            <div className="prox-section">
              <div className="prox-lbl">Próximos</div>
              {proximos.slice(0, 4).map((ag, i) => (
                <div key={i} className="prox-item" onClick={() => openEditar(ag)}>
                  <div className="pi-name">{ag.cliente}</div>
                  <div className="pi-sub">{formatTime(ag.dataHoraAgendamento)} · {ag.servico}</div>
                </div>
              ))}
            </div>
          )}
        </aside>

        {/* ── MAIN ── */}
        <div className="main-area">
          <div className="topbar">
            <div>
              <div className="topbar-title">
                {new Date(selectedDate + "T12:00:00").toLocaleDateString("pt-BR", {
                  weekday: "long", day: "2-digit", month: "long", year: "numeric",
                })}
              </div>
              <div className="topbar-sub">Timeline de agendamentos</div>
            </div>
            <div className="badge">
              <span>{agendamentos.length}</span> agendamento{agendamentos.length !== 1 ? "s" : ""}
            </div>
          </div>

          <div className="timeline-wrap">
            {loading ? (
              <div className="loading"><div className="spinner" /> Carregando...</div>
            ) : (
              <div className="timeline">
                {BUSINESS_HOURS.map((h) => {
                  const slots = getByHour(h);
                  return (
                    <div key={h} className="hour-row">
                      <div className="hour-lbl">{String(h).padStart(2, "0")}h</div>
                      <div className="hour-slots">
                        {slots.map((ag, i) => (
                          <div
                            key={i}
                            className="ag-card"
                            style={{ "--c": profColor(ag.profissional) } as React.CSSProperties}
                          >
                            <div className="ag-time">{formatTime(ag.dataHoraAgendamento)}</div>
                            <div className="ag-info">
                              <div className="ag-name">{ag.cliente}</div>
                              <div className="ag-meta">{ag.servico || "Sem serviço"}</div>
                              {ag.profissional && <div className="ag-prof">{ag.profissional}</div>}
                            </div>
                            <div className="ag-actions">
                              <button className="icon-btn" title="Editar" onClick={() => openEditar(ag)}>✏️</button>
                              <button className="icon-btn del" title="Deletar" onClick={() => openDeletar(ag)}>🗑️</button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Toasts ── */}
      {success && <div className="toast s">{success}</div>}
      {error && !modal && <div className="toast e">{error}</div>}

      {/* ── Modal Novo / Editar ── */}
      {(modal === "novo" || modal === "editar") && (
        <div className="overlay" onClick={(e) => e.target === e.currentTarget && closeModal()}>
          <div className="modal">
            <div className="modal-head">
              <h2>{modal === "novo" ? "Novo Agendamento" : "Editar Agendamento"}</h2>
              <button className="close-btn" onClick={closeModal}>✕</button>
            </div>

            <div className="form-grid">
              <div className="form-group full">
                <label>Cliente *</label>
                <input
                  type="text"
                  placeholder="Nome completo"
                  value={form.cliente}
                  onChange={(e) => setForm({ ...form, cliente: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Serviço *</label>
                <select
                  value={form.servico}
                  onChange={(e) => setForm({ ...form, servico: e.target.value })}
                >
                  <option value="">Selecione...</option>
                  {SERVICOS.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>

              <div className="form-group">
                <label>Horário *</label>
                <input
                  type="time"
                  value={formTime}
                  onChange={(e) => setFormTime(e.target.value)}
                />
              </div>

              <div className="form-group full">
                <label>Profissional</label>
                <select
                  value={form.profissional}
                  onChange={(e) => setForm({ ...form, profissional: e.target.value })}
                >
                  <option value="">Selecione...</option>
                  {PROFISSIONAIS.map((p) => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
            </div>

            {error && <div className="form-error">{error}</div>}

            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={closeModal}>Cancelar</button>
              <button
                className="btn btn-primary"
                onClick={modal === "novo" ? handleSalvar : handleAlterar}
              >
                {modal === "novo" ? "Criar Agendamento" : "Salvar Alterações"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal Deletar ── */}
      {modal === "deletar" && deleteTarget && (
        <div className="overlay" onClick={(e) => e.target === e.currentTarget && closeModal()}>
          <div className="modal">
            <div className="modal-head">
              <h2>Remover Agendamento</h2>
              <button className="close-btn" onClick={closeModal}>✕</button>
            </div>

            <div className="del-preview">
              <div className="dp-row"><span>Cliente</span><strong>{deleteTarget.cliente}</strong></div>
              <div className="dp-row"><span>Serviço</span><strong>{deleteTarget.servico || "—"}</strong></div>
              <div className="dp-row"><span>Horário</span><strong>{formatDateTime(deleteTarget.dataHoraAgendamento)}</strong></div>
              {deleteTarget.profissional && (
                <div className="dp-row"><span>Profissional</span><strong>{deleteTarget.profissional}</strong></div>
              )}
            </div>

            <p style={{ fontSize: ".8rem", color: "var(--text-dim)" }}>
              Esta ação não pode ser desfeita.
            </p>

            {error && <div className="form-error" style={{ marginTop: 10 }}>{error}</div>}

            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={closeModal}>Cancelar</button>
              <button className="btn btn-danger" onClick={handleDeletar}>Confirmar Exclusão</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
