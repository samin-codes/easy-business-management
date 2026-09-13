import { useId } from 'react';
import type { SVGAttributes } from 'react';

export default function AppLogoIcon(props: SVGAttributes<SVGElement>) {
    const maskId = useId();

    return (
        <svg aria-hidden="true" {...props} viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
            <defs>
                <mask id={maskId} maskUnits="userSpaceOnUse" x="0" y="0" width="512" height="512" style={{ maskType: 'alpha' }}>
                    <image href="/app-logo.png" width="512" height="512" />
                </mask>
            </defs>
            <rect width="512" height="512" fill="currentColor" mask={`url(#${maskId})`} />
        </svg>
    );
}
