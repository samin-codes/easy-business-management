import { Eye } from 'lucide-react';

import { Action } from './action';
import type { ActionPresetProps } from './action';

export function ViewAction({ name = 'view', label = 'View', icon = Eye, color = 'gray', ...props }: ActionPresetProps) {
    return <Action {...props} name={name} label={label} icon={icon} color={color} />;
}
