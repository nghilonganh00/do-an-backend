export enum ChatRole {
  USER = 'user',
  ASSISTANT = 'assistant',
  SYSTEM = 'system',
}

export interface ChatMessage {
  id: number;
  role: ChatRole;
  content: string;
  userId: number;
}

export type ProductVariantRow = {
  id: number;
  price: number;
  stock: number;
  product: {
    metaDescription: string | null;
  } | null;
};
