import { Trash2 } from 'lucide-react';

import { Action } from './action';
import type { ActionPresetProps } from './action';

export function DeleteAction({ name = 'delete', label = 'Delete', icon = Trash2, color = 'danger', ...props }: ActionPresetProps) {
    return <Action {...props} name={name} label={label} icon={icon} color={color} />;
}
