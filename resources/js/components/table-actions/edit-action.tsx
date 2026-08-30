import { SquarePen } from 'lucide-react';

import { Action } from './action';
import type { ActionPresetProps } from './action';

export function EditAction({ name = 'edit', label = 'Edit', icon = SquarePen, color = 'primary', ...props }: ActionPresetProps) {
    return <Action {...props} name={name} label={label} icon={icon} color={color} />;
}
