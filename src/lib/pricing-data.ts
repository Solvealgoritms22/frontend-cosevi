export interface PricingPlan {
    id: string;
    name: string;
    price: string;
    description: string;
    features: string[];
    isPopular?: boolean;
    buttonText: string;
    limits: {
        units: string;
        parking: string;
        monitors: string;
        security: string;
    };
}

export const pricingPlans: PricingPlan[] = [
    {
        id: 'starter',
        name: 'Starter',
        price: '49',
        description: 'Ideal para condominios pequeños o residenciales en crecimiento.',
        features: [
            'Hasta 50 unidades',
            'Hasta 100 parqueos',
            '2 Administradores (Monitores)',
            'Hasta 5 Guardias de Seguridad',
            'Gestión de Visitas Básica',
            'Control de Acceso QR',
        ],
        limits: {
            units: '50',
            parking: '100',
            monitors: '2',
            security: '5',
        },
        buttonText: 'Empezar con Starter',
    },
    {
        id: 'premium',
        name: 'Premium',
        price: '129',
        description: 'Todo lo necesario para una gestión de seguridad profesional y eficiente.',
        features: [
            'Hasta 200 unidades',
            'Hasta 400 parqueos',
            '5 Administradores (Monitores)',
            'Hasta 15 Guardias de Seguridad',
            'Sistema SOS y Alertas',
            'Reportes Avanzados',
            'Soporte Prioritario 24/7',
        ],
        isPopular: true,
        limits: {
            units: '200',
            parking: '400',
            monitors: '5',
            security: '15',
        },
        buttonText: 'Elegir Premium',
    },
    {
        id: 'elite',
        name: 'Elite',
        price: '299',
        description: 'Para grandes complejos que requieren máxima personalización y potencia.',
        features: [
            'Unidades y Parqueos ilimitados',
            'Administradores ilimitados',
            'Seguridad ilimitada',
            'Base de datos dedicada (Single Tenant)',
            'Integración LPR (Lectura de Placas)',
            'Personalización de Marca',
            'Integración con Hardware Externo',
        ],
        limits: {
            units: 'Ilimitado',
            parking: 'Ilimitado',
            monitors: 'Ilimitado',
            security: 'Ilimitado',
        },
        buttonText: 'Contactar Ventas',
    },
];
