export type RecordStatus = 'active' | 'inactive';

export type AreaType = 'upazila' | 'thana';

export type BusinessType =
    | 'sole_proprietorship'
    | 'partnership'
    | 'private_limited'
    | 'other';

export type OutletType =
    | 'shop'
    | 'office'
    | 'warehouse'
    | 'online';

export type PartyType =
    | 'customer'
    | 'supplier'
    | 'both';

export type OpeningBalanceType =
    | 'none'
    | 'receivable'
    | 'payable';

export type UnitOfMeasurementType =
    | 'count'
    | 'weight'
    | 'length'
    | 'area'
    | 'volume';

export type PurchaseStatus =
    | 'draft'
    | 'confirmed'
    | 'cancelled';

export type PurchasePaymentStatus =
    | 'unpaid'
    | 'partial'
    | 'paid';

export type PaymentMethod =
    | 'cash'
    | 'bank_transfer'
    | 'cheque'
    | 'mobile_banking'
    | 'card'
    | 'other';
