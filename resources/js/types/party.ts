import type { Business } from './business';
import type {
    AreaType,
    OpeningBalanceType,
    PartyType,
    RecordStatus,
} from './enums';

export type Party = {
    id: number;
    business_id: number;
    name: string;
    trade_name: string | null;
    mobile: string | null;
    email: string | null;
    party_type: PartyType;
    address_line: string | null;
    district: string | null;
    area_type: AreaType | null;
    area_name: string | null;
    postal_code: string | null;
    opening_balance: string;
    opening_balance_type: OpeningBalanceType;
    credit_limit: string | null;
    status: RecordStatus;

    party_type_label: string | null;
    opening_balance_type_label: string | null;
    area_type_label: string | null;
    status_label: string | null;

    business?: Pick<Business, 'id' | 'name'>;
    contact_persons?: PartyContactPerson[];
};

export type PartyContactPerson = {
    id: number;
    party_id: number;
    name: string;
    designation: string | null;
    mobile: string | null;
    email: string | null;
    is_primary: boolean;
    note: string | null;
    status: RecordStatus;

    status_label: string | null;
};
