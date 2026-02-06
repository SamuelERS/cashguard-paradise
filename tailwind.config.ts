import type { Config } from "tailwindcss";
import tailwindcssAnimate from "tailwindcss-animate";

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx,css}",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px'
			}
		},
		extend: {
			colors: {
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: 'hsl(213, 100%, 52%)', /* iOS 26 Refined Blue */
					foreground: 'hsl(var(--primary-foreground))',
					glow: 'hsl(206, 100%, 70%)'
				},
				secondary: {
					DEFAULT: 'hsl(245, 50%, 72%)', /* iOS 26 Purple */
					foreground: 'hsl(var(--secondary-foreground))',
					glow: 'hsl(245, 50%, 82%)'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))',
					glass: 'hsl(var(--card-glass))'
				},
				success: {
					DEFAULT: 'hsl(var(--success))',
					foreground: 'hsl(var(--success-foreground))'
				},
				warning: {
					DEFAULT: 'hsl(var(--warning))',
					foreground: 'hsl(var(--warning-foreground))'
				},
				'glass-bg': 'var(--glass-bg)',
				'glass-border': 'var(--glass-border)',
				sidebar: {
					DEFAULT: 'hsl(var(--sidebar-background))',
					foreground: 'hsl(var(--sidebar-foreground))',
					primary: 'hsl(var(--sidebar-primary))',
					'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
					accent: 'hsl(var(--sidebar-accent))',
					'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
					border: 'hsl(var(--sidebar-border))',
					ring: 'hsl(var(--sidebar-ring))'
				}
			},
			boxShadow: {
				'glass': 'var(--glass-shadow)',
			},
			backgroundImage: {
				'gradient-aqua': 'var(--gradient-aqua)',
				'gradient-cash': 'var(--gradient-cash)',
				'gradient-orb-1': 'var(--gradient-orb-1)',
				'gradient-orb-2': 'var(--gradient-orb-2)',
				'gradient-orb-3': 'var(--gradient-orb-3)',
			},
			transitionTimingFunction: {
				'smooth': 'var(--transition-smooth)',
				'spring': 'var(--transition-spring)',
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			ringWidth: {
				'3': '3px', // 🤖 [IA] - WCAG 2.4.7: 3px focus ring para accesibilidad
			},
			keyframes: {
				'accordion-down': {
					from: {
						height: '0'
					},
					to: {
						height: 'var(--radix-accordion-content-height)'
					}
				},
				'accordion-up': {
					from: {
						height: 'var(--radix-accordion-content-height)'
					},
					to: {
						height: '0'
					}
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out'
			},
			fontSize: {
				// 🤖 [IA] - FASE 4: FLUIDEZ DOCTRINAL - Sistema Tipográfico Fluido Canónico
				'fluid-xs': ['clamp(0.75rem, 3vw, 0.875rem)', { lineHeight: '1.25rem' }],
				'fluid-sm': ['clamp(0.8rem, 3.2vw, 0.95rem)', { lineHeight: '1.35rem' }],
				'fluid-base': ['clamp(0.875rem, 3.5vw, 1rem)', { lineHeight: '1.5rem' }],
				'fluid-lg': ['clamp(1rem, 4vw, 1.125rem)', { lineHeight: '1.75rem' }],
				'fluid-xl': ['clamp(1.125rem, 4.5vw, 1.5rem)', { lineHeight: '2rem' }],
				'fluid-2xl': ['clamp(1.25rem, 5vw, 1.75rem)', { lineHeight: '2.25rem' }],
				'fluid-3xl': ['clamp(1.5rem, 6vw, 2.25rem)', { lineHeight: '2.5rem' }],
			},
			spacing: {
				// 🤖 [IA] - v1.2.24: Canonical Fluid Spacing System - RESPONSIVE-MARGIN-AUDIT
				'fluid-2xs': 'var(--space-2xs)',
				'fluid-xs': 'var(--space-xs)',
				'fluid-sm': 'var(--space-sm)',
				'fluid-md': 'var(--space-md)',
				'fluid-base': 'var(--space-base)',
				'fluid-lg': 'var(--space-lg)',
				'fluid-xl': 'var(--space-xl)',
				'fluid-2xl': 'var(--space-2xl)',
				'fluid-3xl': 'var(--space-3xl)',
				'fluid-4xl': 'var(--space-4xl)',
			}
		}
	},
	plugins: [tailwindcssAnimate],
} satisfies Config;
