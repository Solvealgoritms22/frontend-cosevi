export interface PricingPlan {
    id: string;
    name: string;
    price: string;
    description: string;
    features: string[];
    isPopular?: boolean;
    buttonText: string;
}

export const pricingPlans: PricingPlan[] = [
    {
        id: 'starter',
        name: 'Starter',
        price: '49',
        description: 'Ideal para condominios pequeños o residenciales en crecimiento.',
        features: [
            'Hasta 50 unidades',
            'Gestión de Visitas Básica',
            'Control de Acceso QR',
            'Soporte Web',
            'App Residente Básica',
        ],
        buttonText: 'Empezar con Starter',
    },
    {
        id: 'premium',
        name: 'Premium',
        price: '129',
        description: 'Todo lo necesario para una gestión de seguridad profesional y eficiente.',
        features: [
            'Hasta 200 unidades',
            'Todas las funciones de Starter',
            'Reportes Avanzados',
            'Sistema SOS y Alertas',
            'Soporte Prioritario 24/7',
        ],
        isPopular: true,
        buttonText: 'Elegir Premium',
    },
    {
        id: 'elite',
        name: 'Elite',
        price: '299',
        description: 'Para grandes complejos que requieren máxima personalización y potencia.',
        features: [
            'Unidades ilimitadas',
            'Base de datos dedicada (Single Tenant)',
            'Integración LPR (Lectura de Placas)',
            'Personalización de Marca',
            'Integración con Hardware Externo',
        ],
        buttonText: 'Contactar Ventas',
    },
];
