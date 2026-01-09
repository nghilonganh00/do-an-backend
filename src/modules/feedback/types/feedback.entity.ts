export interface Feedback {
  id: number;
  userId: number;
  comment: string;
  rating: number;
  orderItemId: number;
  createdAt: Date;
  updatedAt: Date;
}
