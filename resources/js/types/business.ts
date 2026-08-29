import type {
    AreaType,
    BusinessType,
    RecordStatus,
} from './enums';

export type Business = {
    id: number;
    name: string;
    trade_name: string | null;
    business_type: BusinessType;
    mobile: string;
    email: string | null;
    trade_license_no: string | null;
    tin_no: string | null;
    bin_no: string | null;
    address_line: string | null;
    district: string | null;
    area_type: AreaType | null;
    area_name: string | null;
    postal_code: string | null;
    status: RecordStatus;

    business_type_label: string | null;
    area_type_label: string | null;
    status_label: string | null;
};
