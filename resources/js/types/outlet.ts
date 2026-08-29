import type { Business } from './business';
import type {
    AreaType,
    OutletType,
    RecordStatus,
} from './enums';

export type Outlet = {
    id: number;
    business_id: number;
    name: string;
    code: string | null;
    mobile: string;
    email: string | null;
    outlet_type: OutletType | null;
    address_line: string | null;
    district: string | null;
    area_type: AreaType | null;
    area_name: string | null;
    postal_code: string | null;
    status: RecordStatus;

    outlet_type_label: string | null;
    area_type_label: string | null;
    status_label: string | null;

    business?: Business;
};
