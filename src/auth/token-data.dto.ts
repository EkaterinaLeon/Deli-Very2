import { TUserRoles } from '../types';

export type TokenDTO = {
    id: number;
    role: TUserRoles;
};
export function isPASTokenDto(data: any): data is TokenDTO {
    return typeof data.id === 'number' && ['restaurant', 'courier'].includes(data.role);
}
