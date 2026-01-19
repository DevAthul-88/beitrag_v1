import { SVGAttributes } from 'react';

export default function AppLogoIcon(props: SVGAttributes<SVGElement>) {
    return (
        <svg
            width={props.width}
            height={props.height}
            viewBox="0 0 64 64"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
        >
            {/* Background squares (light gray) */}
            <rect x="6" y="6" width="14" height="14" rx="3" fill="#D6E4FF" />
            <rect x="22" y="6" width="14" height="14" rx="3" fill="#D6E4FF" />
            <rect x="38" y="6" width="14" height="14" rx="3" fill="#D6E4FF" />

            <rect x="6" y="22" width="14" height="14" rx="3" fill="#D6E4FF" />
            <rect x="22" y="22" width="14" height="14" rx="3" fill="#D6E4FF" />
            <rect x="38" y="22" width="14" height="14" rx="3" fill="#D6E4FF" />

            <rect x="6" y="38" width="14" height="14" rx="3" fill="#D6E4FF" />
            <rect x="22" y="38" width="14" height="14" rx="3" fill="#D6E4FF" />
            <rect x="38" y="38" width="14" height="14" rx="3" fill="#D6E4FF" />

            {/* Active squares (brand gradient) */}
            <rect x="6" y="6" width="14" height="14" rx="3" fill="url(#grad1)" />
            <rect x="22" y="22" width="14" height="14" rx="3" fill="url(#grad1)" />
            <rect x="38" y="38" width="14" height="14" rx="3" fill="url(#grad1)" />

            {/* Gradient definition */}
            <defs>
                <linearGradient
                    id="grad1"
                    x1="0"
                    y1="0"
                    x2="64"
                    y2="64"
                    gradientUnits="userSpaceOnUse"
                >
                    <stop stopColor="#1447e6" />
                    <stop offset="1" stopColor="#66a1ff" />
                </linearGradient>
            </defs>
        </svg>
    );
}