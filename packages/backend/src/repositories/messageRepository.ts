import crypto from 'crypto';

export interface MensagemAnexo {
  nome: string;
  tamanhoBytes: number;
  mimeType: string;
  dados: string; // base64 em modo mock
}

export interface Mensagem {
  id: string;
  fromUserId: string;
  fromNome: string;
  toUserId: string;
  toNome: string;
  assunto: string;
  corpo: string;
  anexo?: MensagemAnexo;
  lido: boolean;
  criadoEm: string;
}

// In-memory store para modo mock
const mockMessages = new Map<string, Mensagem>();

export const messageRepository = {
  async create(msg: Omit<Mensagem, 'id' | 'lido' | 'criadoEm'>): Promise<Mensagem> {
    const mensagem: Mensagem = {
      ...msg,
      id: crypto.randomUUID(),
      lido: false,
      criadoEm: new Date().toISOString(),
    };
    mockMessages.set(mensagem.id, mensagem);
    return mensagem;
  },

  async listInbox(userId: string): Promise<Mensagem[]> {
    return Array.from(mockMessages.values())
      .filter((m) => m.toUserId === userId)
      .sort((a, b) => b.criadoEm.localeCompare(a.criadoEm));
  },

  async listSent(userId: string): Promise<Mensagem[]> {
    return Array.from(mockMessages.values())
      .filter((m) => m.fromUserId === userId)
      .sort((a, b) => b.criadoEm.localeCompare(a.criadoEm));
  },

  async getById(id: string): Promise<Mensagem | null> {
    return mockMessages.get(id) ?? null;
  },

  async markAsRead(id: string): Promise<boolean> {
    const msg = mockMessages.get(id);
    if (!msg) return false;
    mockMessages.set(id, { ...msg, lido: true });
    return true;
  },

  async countUnread(userId: string): Promise<number> {
    return Array.from(mockMessages.values()).filter(
      (m) => m.toUserId === userId && !m.lido
    ).length;
  },

  async deleteById(id: string): Promise<boolean> {
    return mockMessages.delete(id);
  },
};
