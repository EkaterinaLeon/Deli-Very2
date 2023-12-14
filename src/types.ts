export type TWith<T, V> = T & V;

export type TWithRestaurantId<T> = TWith<T, { restaurantId: number }>;

export type TUserRoles = 'restaurant' | 'courier';
export type TWithUserRole<T> = TWith<T, { userRole: TUserRoles }>;
