"use strict";
// Canonical source for permissionable features, operations, and built-in profiles.
// Add new modules here first so permissions, navigation, and profile grants can
// propagate from one place instead of drifting across parallel registries.
Object.defineProperty(exports, "__esModule", { value: true });
exports.LEGACY_ROLE_PERMISSION_PROFILE = exports.AUTHORIZATION_PROFILE_CATALOG = exports.AUTHORIZATION_FEATURE_CATALOG = void 0;
exports.buildPermissionIdsFromCatalog = buildPermissionIdsFromCatalog;
exports.buildCatalogIds = buildCatalogIds;
exports.getPermissionId = getPermissionId;
exports.getAuthorizationPermissionEntries = getAuthorizationPermissionEntries;
exports.getProfileGrantPermissionIds = getProfileGrantPermissionIds;
exports.getIndexableAuthorizationFeatures = getIndexableAuthorizationFeatures;
exports.hasFeatureOperation = hasFeatureOperation;
exports.AUTHORIZATION_FEATURE_CATALOG = {
    dashboard: {
        label: 'Dashboard',
        description: 'Resumen operativo y cumplimiento del sistema.',
        navigation: {
            routeId: 'dashboard',
            icon: 'dashboard',
        },
        operations: {
            view: {
                name: 'Ver dashboard',
                description: 'Acceso al resumen operativo principal.',
            },
        },
    },
    machines: {
        label: 'Maquinas',
        description: 'Catalogo operativo de maquinas, procesos y servicios.',
        navigation: {
            routeId: 'machines',
            icon: 'machines',
        },
        operations: {
            view: {
                name: 'Ver maquinas',
                description: 'Acceso al catalogo de maquinas, procesos y servicios.',
            },
            create: {
                name: 'Crear maquinas',
                description: 'Alta de maquinas, procesos y servicios.',
            },
            edit: {
                name: 'Editar maquinas',
                description: 'Edicion del catalogo operativo de maquinas.',
            },
        },
    },
    checklists: {
        label: 'Checklists',
        description: 'Plantillas configurables de procedimientos y pruebas.',
        navigation: {
            routeId: 'checklists',
            icon: 'checklists',
        },
        operations: {
            view: {
                name: 'Ver checklists',
                description: 'Acceso al listado y detalle de checklists.',
            },
            create: {
                name: 'Crear checklists',
                description: 'Creacion de nuevas plantillas de procedimientos.',
            },
            edit: {
                name: 'Editar checklists',
                description: 'Edicion de items, estructura e instrucciones de checklist.',
            },
        },
    },
    executions: {
        label: 'Ejecuciones',
        description: 'Seguimiento de ejecuciones activas, pendientes y finalizadas.',
        navigation: {
            routeId: 'executions',
            icon: 'executions',
        },
        operations: {
            view: {
                name: 'Ver ejecuciones',
                description: 'Acceso al seguimiento de ejecuciones y su detalle.',
            },
            run: {
                name: 'Ejecutar procedimientos',
                description: 'Inicio y captura de ejecuciones operativas.',
            },
        },
    },
    findings: {
        label: 'Hallazgos',
        description: 'Incidencias detectadas y acciones de seguimiento.',
        navigation: {
            routeId: 'findings',
            icon: 'findings',
        },
        operations: {
            view: {
                name: 'Ver hallazgos',
                description: 'Consulta de incidencias y no conformidades.',
            },
            manage: {
                name: 'Gestionar hallazgos',
                description: 'Seguimiento y gestion operativa de hallazgos.',
            },
        },
    },
    admin: {
        label: 'Administracion',
        description: 'Configuracion, usuarios y controles operativos.',
        navigation: {
            routeId: 'admin',
            icon: 'admin',
        },
        operations: {
            view: {
                name: 'Ver administracion',
                description: 'Acceso al modulo administrativo principal.',
            },
        },
    },
    users: {
        label: 'Usuarios',
        description: 'Administracion de usuarios y accesos.',
        operations: {
            manage: {
                name: 'Gestionar usuarios',
                description: 'Administracion de usuarios y accesos.',
            },
        },
    },
    organization: {
        label: 'Organizacion',
        description: 'Configuracion organizacional y controles globales.',
        operations: {
            manage: {
                name: 'Gestionar organizacion',
                description: 'Configuracion de organizacion y controles globales.',
            },
        },
    },
};
exports.AUTHORIZATION_PROFILE_CATALOG = {
    operator_basic: {
        name: 'Operador base',
        description: 'Acceso operativo a vistas nucleares y ejecucion de procedimientos.',
        grants: {
            dashboard: ['view'],
            machines: ['view'],
            checklists: ['view'],
            executions: ['view', 'run'],
            findings: ['view'],
        },
    },
    supervisor_operations: {
        name: 'Supervisor de operaciones',
        description: 'Gestion operativa inmediata: alta y edicion de activos y checklists.',
        grants: {
            dashboard: ['view'],
            machines: ['view', 'create', 'edit'],
            checklists: ['view', 'create', 'edit'],
            executions: ['view', 'run'],
            findings: ['view', 'manage'],
        },
    },
    admin_system: {
        name: 'Administrador del sistema',
        description: 'Control total del sistema, perfiles y configuracion organizacional.',
        grants: {
            dashboard: ['view'],
            machines: ['view', 'create', 'edit'],
            checklists: ['view', 'create', 'edit'],
            executions: ['view', 'run'],
            findings: ['view', 'manage'],
            admin: ['view'],
            users: ['manage'],
            organization: ['manage'],
        },
    },
};
exports.LEGACY_ROLE_PERMISSION_PROFILE = {
    operator: 'operator_basic',
    supervisor: 'supervisor_operations',
    admin: 'admin_system',
};
function buildPermissionIdsFromCatalog(catalog) {
    return Object.entries(catalog).flatMap(([featureId, feature]) => Object.keys(feature.operations).map(operation => `${featureId}.${operation}`));
}
function buildCatalogIds(catalog) {
    return Object.keys(catalog);
}
function getPermissionId(featureId, operation) {
    return `${featureId}.${operation}`;
}
function getAuthorizationPermissionEntries() {
    return Object.entries(exports.AUTHORIZATION_FEATURE_CATALOG).flatMap(([featureId, feature]) => Object.entries(feature.operations).map(([operation, metadata]) => ({
        featureId: featureId,
        operation: operation,
        id: getPermissionId(featureId, operation),
        name: metadata.name,
        description: metadata.description,
    })));
}
function getProfileGrantPermissionIds(profileId) {
    const profile = exports.AUTHORIZATION_PROFILE_CATALOG[profileId];
    return Object.entries(profile.grants).flatMap(([featureId, operations]) => operations.map(operation => getPermissionId(featureId, operation)));
}
function getIndexableAuthorizationFeatures() {
    return Object.entries(exports.AUTHORIZATION_FEATURE_CATALOG).flatMap(([featureId, feature]) => {
        if (!('navigation' in feature)) {
            return [];
        }
        const navigableFeatureId = featureId;
        const navigation = feature.navigation;
        return [
            {
                featureId: navigableFeatureId,
                routeId: navigation.routeId,
                icon: navigation.icon,
                label: feature.label,
                description: feature.description,
                requiredPermission: getPermissionId(navigableFeatureId, 'view'),
            },
        ];
    });
}
function hasFeatureOperation(featureId, operation) {
    return {
        featureId,
        operation,
        permission: getPermissionId(featureId, operation),
    };
}
