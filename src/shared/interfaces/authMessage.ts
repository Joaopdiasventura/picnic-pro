import { Message } from './message';
import { User } from '../../core/user/entities/user.entity';

export interface AuthMessage extends Message {
  user: User;
  token: string;
}
