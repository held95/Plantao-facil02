'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  Mail, Send, Inbox, Paperclip, X, ChevronDown, ChevronUp,
  Download, Trash2, CheckSquare, LayoutDashboard,
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  useMensagens,
  useMensagensUsuarios,
  useSendMensagem,
  useMarkMensagemAsRead,
  useDeleteMensagens,
} from '@/hooks/useMensagens';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import type { Mensagem } from '@plantao/backend';

function formatData(iso: string) {
  return format(new Date(iso), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });
}

function MensagemItem({
  mensagem,
  tipo,
  modoSelecao,
  selecionada,
  onToggleSelecao,
}: {
  mensagem: Mensagem;
  tipo: 'recebida' | 'enviada';
  modoSelecao: boolean;
  selecionada: boolean;
  onToggleSelecao: (id: string) => void;
}) {
  const [expandida, setExpandida] = useState(false);
  const { mutate: markAsRead } = useMarkMensagemAsRead();

  function handleClick() {
    if (modoSelecao) {
      onToggleSelecao(mensagem.id);
      return;
    }
    if (!expandida && tipo === 'recebida' && !mensagem.lido) {
      markAsRead(mensagem.id);
    }
    setExpandida((prev) => !prev);
  }

  function handleDownload() {
    if (!mensagem.anexo) return;
    const { dados, mimeType, nome } = mensagem.anexo;
    const bytes = Uint8Array.from(atob(dados), (c) => c.charCodeAt(0));
    const blob = new Blob([bytes], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = nome;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div
      className={`border rounded-lg transition-all ${
        selecionada
          ? 'border-slate-500 bg-slate-50'
          : tipo === 'recebida' && !mensagem.lido
          ? 'border-blue-300 bg-blue-50'
          : 'border-gray-200 bg-white'
      }`}
    >
      <button
        type="button"
        className="w-full flex items-center justify-between p-4 text-left"
        onClick={handleClick}
      >
        <div className="flex items-center gap-3 min-w-0">
          {modoSelecao && (
            <div
              className={`flex-shrink-0 h-5 w-5 rounded border-2 flex items-center justify-center transition-colors ${
                selecionada ? 'bg-slate-700 border-slate-700' : 'border-gray-400'
              }`}
            >
              {selecionada && (
                <svg className="h-3 w-3 text-white" viewBox="0 0 12 12" fill="none">
                  <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </div>
          )}
          <div className="flex-shrink-0">
            <div className="h-9 w-9 rounded-full bg-slate-700 flex items-center justify-center text-white text-sm font-medium">
              {(tipo === 'recebida' ? mensagem.fromNome : mensagem.toNome)
                .charAt(0)
                .toUpperCase()}
            </div>
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-900 truncate">
                {tipo === 'recebida' ? mensagem.fromNome : `Para: ${mensagem.toNome}`}
              </span>
              {tipo === 'recebida' && !mensagem.lido && (
                <Badge variant="default" className="text-xs shrink-0">
                  Nova
                </Badge>
              )}
              {mensagem.anexo && (
                <Paperclip className="h-3.5 w-3.5 text-gray-400 shrink-0" />
              )}
            </div>
            <p className="text-sm text-gray-700 font-medium truncate">{mensagem.assunto}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 ml-4 shrink-0">
          <span className="text-xs text-gray-500">{formatData(mensagem.criadoEm)}</span>
          {!modoSelecao && (
            expandida
              ? <ChevronUp className="h-4 w-4 text-gray-400" />
              : <ChevronDown className="h-4 w-4 text-gray-400" />
          )}
        </div>
      </button>

      {!modoSelecao && expandida && (
        <div className="px-4 pb-4 border-t border-gray-100 pt-3">
          <p className="text-sm text-gray-700 whitespace-pre-wrap">{mensagem.corpo}</p>
          {mensagem.anexo && (
            <button
              type="button"
              onClick={handleDownload}
              className="mt-3 flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 font-medium"
            >
              <Download className="h-4 w-4" />
              {mensagem.anexo.nome}{' '}
              <span className="text-gray-400 font-normal">
                ({(mensagem.anexo.tamanhoBytes / 1024).toFixed(0)} KB)
              </span>
            </button>
          )}
        </div>
      )}
    </div>
  );
}

function NovaMensagemDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { data: usuarios = [] } = useMensagensUsuarios();
  const { mutate: sendMensagem, isPending } = useSendMensagem();
  const [toUserId, setToUserId] = useState('');
  const [assunto, setAssunto] = useState('');
  const [corpo, setCorpo] = useState('');
  const [arquivo, setArquivo] = useState<File | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const fd = new FormData();
    fd.set('toUserId', toUserId);
    fd.set('assunto', assunto);
    fd.set('corpo', corpo);
    if (arquivo) fd.set('arquivo', arquivo);
    sendMensagem(fd, {
      onSuccess: () => {
        setToUserId(''); setAssunto(''); setCorpo(''); setArquivo(null);
        onClose();
      },
    });
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="w-full max-w-lg">
        <DialogHeader onClose={onClose}>
          <DialogTitle>Nova Mensagem</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Destinatário <span className="text-red-500">*</span>
            </label>
            <select
              value={toUserId}
              onChange={(e) => setToUserId(e.target.value)}
              required
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-700"
            >
              <option value="">Selecione o destinatário...</option>
              {usuarios.map((u) => (
                <option key={u.id} value={u.id}>{u.nome} ({u.email})</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Assunto <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={assunto}
              onChange={(e) => setAssunto(e.target.value)}
              required
              placeholder="Assunto da mensagem"
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-700"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Mensagem <span className="text-red-500">*</span>
            </label>
            <textarea
              value={corpo}
              onChange={(e) => setCorpo(e.target.value)}
              required
              rows={5}
              placeholder="Escreva sua mensagem..."
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-700 resize-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Anexo (opcional)
            </label>
            {arquivo ? (
              <div className="flex items-center gap-2 text-sm text-gray-700 border border-gray-200 rounded-md p-2">
                <Paperclip className="h-4 w-4 text-gray-400" />
                <span className="truncate flex-1">{arquivo.name}</span>
                <button
                  type="button"
                  onClick={() => { setArquivo(null); if (fileRef.current) fileRef.current.value = ''; }}
                  className="text-gray-400 hover:text-red-500"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <label className="flex items-center gap-2 cursor-pointer border border-dashed border-gray-300 rounded-md p-3 hover:border-slate-500 transition-colors">
                <Paperclip className="h-4 w-4 text-gray-400" />
                <span className="text-sm text-gray-500">Clique para anexar arquivo</span>
                <input ref={fileRef} type="file" className="hidden" onChange={(e) => setArquivo(e.target.files?.[0] ?? null)} />
              </label>
            )}
          </div>
          <DialogFooter>
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50">
              Cancelar
            </button>
            <button type="submit" disabled={isPending} className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-slate-700 rounded-md hover:bg-slate-800 disabled:opacity-60">
              <Send className="h-4 w-4" />
              {isPending ? 'Enviando...' : 'Enviar'}
            </button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default function MensagensPage() {
  const router = useRouter();
  const [aba, setAba] = useState<'recebidas' | 'enviadas'>('recebidas');
  const [dialogAberto, setDialogAberto] = useState(false);
  const [modoSelecao, setModoSelecao] = useState(false);
  const [selecionadas, setSelecionadas] = useState<Set<string>>(new Set());
  const { data, isLoading } = useMensagens();
  const { mutate: deletar, isPending: deletando } = useDeleteMensagens();

  const recebidas = data?.recebidas ?? [];
  const enviadas = data?.enviadas ?? [];
  const naoLidas = recebidas.filter((m) => !m.lido).length;
  const lista = aba === 'recebidas' ? recebidas : enviadas;

  function toggleSelecao(id: string) {
    setSelecionadas((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function cancelarSelecao() {
    setModoSelecao(false);
    setSelecionadas(new Set());
  }

  function handleExcluir() {
    if (selecionadas.size === 0) return;
    deletar(Array.from(selecionadas), {
      onSuccess: () => cancelarSelecao(),
    });
  }

  return (
    <div className="container mx-auto px-6 py-8 max-w-3xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Mail className="h-6 w-6" />
            Mensagens
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Troque mensagens com outros membros da equipe
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Voltar Dashboard */}
          <button
            type="button"
            onClick={() => router.push('/')}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
          >
            <LayoutDashboard className="h-4 w-4" />
            Voltar Dashboard
          </button>

          {modoSelecao ? (
            <>
              {selecionadas.size > 0 && (
                <button
                  type="button"
                  onClick={handleExcluir}
                  disabled={deletando}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 disabled:opacity-60"
                >
                  <Trash2 className="h-4 w-4" />
                  {deletando ? 'Excluindo...' : `Excluir (${selecionadas.size})`}
                </button>
              )}
              <button
                type="button"
                onClick={cancelarSelecao}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                <X className="h-4 w-4" />
                Cancelar
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={() => setModoSelecao(true)}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                <CheckSquare className="h-4 w-4" />
                Selecionar
              </button>
              <button
                type="button"
                onClick={() => setDialogAberto(true)}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-slate-700 rounded-md hover:bg-slate-800"
              >
                <Send className="h-4 w-4" />
                Nova Mensagem
              </button>
            </>
          )}
        </div>
      </div>

      {/* Barra de seleção */}
      {modoSelecao && (
        <div className="flex items-center justify-between bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 mb-4 text-sm text-slate-700">
          <span>
            {selecionadas.size === 0
              ? 'Clique nas mensagens para selecioná-las'
              : `${selecionadas.size} mensagem(ns) selecionada(s)`}
          </span>
          {lista.length > 0 && (
            <button
              type="button"
              onClick={() =>
                setSelecionadas(
                  selecionadas.size === lista.length
                    ? new Set()
                    : new Set(lista.map((m) => m.id))
                )
              }
              className="text-slate-600 hover:text-slate-900 font-medium"
            >
              {selecionadas.size === lista.length ? 'Desmarcar todas' : 'Selecionar todas'}
            </button>
          )}
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-gray-200 mb-4">
        <button
          type="button"
          onClick={() => { setAba('recebidas'); cancelarSelecao(); }}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            aba === 'recebidas' ? 'border-slate-700 text-slate-700' : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <Inbox className="h-4 w-4" />
          Recebidas
          {naoLidas > 0 && (
            <span className="bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5 min-w-[1.25rem] text-center">
              {naoLidas}
            </span>
          )}
        </button>
        <button
          type="button"
          onClick={() => { setAba('enviadas'); cancelarSelecao(); }}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            aba === 'enviadas' ? 'border-slate-700 text-slate-700' : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <Send className="h-4 w-4" />
          Enviadas
        </button>
      </div>

      {/* Lista */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 bg-gray-100 rounded-lg animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {lista.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <Mail className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p className="text-sm">
                {aba === 'recebidas' ? 'Nenhuma mensagem recebida' : 'Nenhuma mensagem enviada'}
              </p>
            </div>
          ) : (
            lista.map((m) => (
              <MensagemItem
                key={m.id}
                mensagem={m}
                tipo={aba === 'recebidas' ? 'recebida' : 'enviada'}
                modoSelecao={modoSelecao}
                selecionada={selecionadas.has(m.id)}
                onToggleSelecao={toggleSelecao}
              />
            ))
          )}
        </div>
      )}

      <NovaMensagemDialog open={dialogAberto} onClose={() => setDialogAberto(false)} />
    </div>
  );
}
