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
            'upTo50Units',
            'upTo100Parking',
            'twoAdmins',
            'upTo5Guards',
            'upTo200Visits',
            'upTo50Alerts',
            'upTo20Reports',
            'basicVisitorMgmt',
            'qrAccessControl',
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
            'upTo200Units',
            'upTo400Parking',
            'fiveAdmins',
            'upTo15Guards',
            'upTo1000Visits',
            'upTo200Alerts',
            'upTo100Reports',
            'sosSystem',
            'advancedReports',
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
            'Hasta 500 unidades',
            'Hasta 1000 parqueos',
            '10 Administradores (Monitors)',
            'Hasta 20 Guardias de Seguridad',
            'Hasta 5000 visitas mensuales',
            'Hasta 1000 alertas SOS',
            'Hasta 500 reportes analíticos',
            'Base de datos dedicada (Single Tenant)',
            'Integración LPR (Lectura de Placas)',
            'Personalización de Marca',
            'Integración con Hardware Externo',
        ],
        limits: {
            units: '500',
            parking: '1000',
            monitors: '10',
            security: '20',
        },
        buttonText: 'Elegir Plan Elite',
    },
];
