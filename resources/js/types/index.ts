export type * from './auth';
export type * from './business';
export type * from './enums';
export type * from './inventory';
export type * from './navigation';
export type * from './opening-stock';
export type * from './outlet';
export type * from './pagination';
export type * from './party';
export type * from './product';
export type * from './purchase';
export type * from './sale';
export type * from './stock-adjustment';
export type * from './stock-transfer';
export type * from './ui';

export type Option<TValue extends string | number = string> = {
    label: string;
    value: TValue;
};
