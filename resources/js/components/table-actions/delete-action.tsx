import { Trash2 } from 'lucide-react';
import { Action } from './action';
import type { ActionPresetProps } from './action';

export type DeleteActionProps = ActionPresetProps;

export function DeleteAction({ name = 'delete', label = 'Delete', icon = Trash2, color = 'danger', ...props }: DeleteActionProps) {
    return <Action {...props} name={name} label={label} icon={icon} color={color} />;
}
