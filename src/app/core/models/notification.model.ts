/* notification.model.ts */
import { User } from './user.model';

export interface Notification {
    _id: string;
    user: User;
    message: string;
    isRead: boolean;
}