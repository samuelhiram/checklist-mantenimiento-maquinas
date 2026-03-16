-- ============================================================
-- SEED DATA - MaquinaCheck Demo
-- Ejecutar DESPUÉS de 001_schema.sql
-- Nota: crear primero 3 usuarios en Supabase Auth y copiar sus UUIDs
-- ============================================================

-- -------------------------
-- ORGANIZACIÓN DE DEMO
-- -------------------------
INSERT INTO organizations (id, name, slug, plan) VALUES
('11111111-0000-0000-0000-000000000001', 'Industrias Acero Norte S.A.', 'acero-norte', 'pro');

-- -------------------------
-- LOCATIONS (Planta)
-- -------------------------
INSERT INTO locations (id, org_id, name, code, parent_id) VALUES
('22220000-0000-0000-0000-000000000001', '11111111-0000-0000-0000-000000000001', 'Planta Principal',       'PLANTA-01', NULL),
('22220000-0000-0000-0000-000000000002', '11111111-0000-0000-0000-000000000001', 'Línea de Producción A',  'LP-A',      '22220000-0000-0000-0000-000000000001'),
('22220000-0000-0000-0000-000000000003', '11111111-0000-0000-0000-000000000001', 'Línea de Producción B',  'LP-B',      '22220000-0000-0000-0000-000000000001'),
('22220000-0000-0000-0000-000000000004', '11111111-0000-0000-0000-000000000001', 'Sala de Compresores',    'COMP',      '22220000-0000-0000-0000-000000000001'),
('22220000-0000-0000-0000-000000000005', '11111111-0000-0000-0000-000000000001', 'Taller de Mantenimiento','TALLER',    '22220000-0000-0000-0000-000000000001'),
('22220000-0000-0000-0000-000000000006', '11111111-0000-0000-0000-000000000001', 'Cuarto Eléctrico',       'ELEC',      '22220000-0000-0000-0000-000000000001');

-- -------------------------
-- MACHINES (Máquinas, procesos y servicios)
-- -------------------------
INSERT INTO machines (id, org_id, location_id, name, code, type, manufacturer, model, serial_number, status, priority, description, tags) VALUES
-- Línea A
('33330000-0000-0000-0000-000000000001','11111111-0000-0000-0000-000000000001','22220000-0000-0000-0000-000000000002','Prensa Hidráulica PH-200','PH-200','machine','Parker Hydraulics','HydroForce 200','SN-2019-0041','active','critical','Prensa hidráulica de 200 toneladas para conformado de piezas metálicas','{"prensa","hidráulica","línea-a"}'),
('33330000-0000-0000-0000-000000000002','11111111-0000-0000-0000-000000000001','22220000-0000-0000-0000-000000000002','Torno CNC TRN-500','TRN-500','machine','Mazak','Nexus 500-II','SN-2021-0089','active','high','Torno CNC de alta precisión para maquinado de ejes','{"torno","cnc","maquinado"}'),
('33330000-0000-0000-0000-000000000003','11111111-0000-0000-0000-000000000001','22220000-0000-0000-0000-000000000002','Soldadora MIG SW-300','SW-300','machine','Lincoln Electric','Power MIG 300','SN-2020-0152','active','medium','Soldadora MIG para ensamble de estructuras metálicas','{"soldadora","mig","ensamble"}'),

-- Línea B
('33330000-0000-0000-0000-000000000004','11111111-0000-0000-0000-000000000001','22220000-0000-0000-0000-000000000003','Cortadora Laser CL-1000','CL-1000','machine','Trumpf','TruLaser 1030','SN-2022-0018','active','critical','Cortadora laser de fibra para acero inoxidable hasta 20mm','{"laser","corte","línea-b"}'),
('33330000-0000-0000-0000-000000000005','11111111-0000-0000-0000-000000000001','22220000-0000-0000-0000-000000000003','Dobladora CNC DB-250','DB-250','machine','Amada','HFE-M2 250T','SN-2021-0203','maintenance','high','Dobladora CNC de alta precisión 250 toneladas','{"dobladora","cnc","línea-b"}'),

-- Compresores
('33330000-0000-0000-0000-000000000006','11111111-0000-0000-0000-000000000001','22220000-0000-0000-0000-000000000004','Compresor Principal CP-01','CP-01','equipment','Atlas Copco','GA75+','SN-2018-0005','active','critical','Compresor rotativo de tornillo 75kW para red neumática principal','{"compresor","neumático","servicio"}'),
('33330000-0000-0000-0000-000000000007','11111111-0000-0000-0000-000000000001','22220000-0000-0000-0000-000000000004','Compresor Backup CP-02','CP-02','equipment','Atlas Copco','GA55+','SN-2018-0006','active','high','Compresor de respaldo 55kW','{"compresor","neumático","backup"}'),

-- Servicios/Procesos
('33330000-0000-0000-0000-000000000008','11111111-0000-0000-0000-000000000001','22220000-0000-0000-0000-000000000001','Sistema Contra Incendios SCI','SCI-01','service','Tyco','SprinkCAD Pro','SN-2017-0001','active','critical','Sistema sprinkler + CO2 para toda la planta','{"seguridad","incendios","servicio"}'),
('33330000-0000-0000-0000-000000000009','11111111-0000-0000-0000-000000000001','22220000-0000-0000-0000-000000000006','Transformador Principal TR-01','TR-01','equipment','ABB','ONAN 500kVA','SN-2016-0001','active','critical','Transformador de distribución 500kVA 13.2kV/440V','{"eléctrico","transformador","infraestructura"}'),
('33330000-0000-0000-0000-000000000010','11111111-0000-0000-0000-000000000001','22220000-0000-0000-0000-000000000001','Proceso de Tratamiento Térmico','TTH-01','process',NULL,NULL,NULL,'active','high','Proceso de temple y revenido para piezas de acero','{"proceso","térmico","calidad"}');

-- -------------------------
-- CHECKLISTS PLANTILLAS
-- -------------------------
-- Prensa Hidráulica: Inspección Diaria
INSERT INTO checklists (id, org_id, machine_id, name, description, status, priority, frequency, estimated_min, required_role) VALUES
('44440000-0000-0000-0000-000000000001','11111111-0000-0000-0000-000000000001','33330000-0000-0000-0000-000000000001',
 'Inspección Diaria Pre-Turno','Verificación de condiciones básicas antes de iniciar operación','active','high','daily',20,'operator'),

('44440000-0000-0000-0000-000000000002','11111111-0000-0000-0000-000000000001','33330000-0000-0000-0000-000000000001',
 'Mantenimiento Preventivo Mensual','Revisión completa de sistema hidráulico, mecánico y eléctrico','active','critical','monthly',120,'supervisor'),

-- Torno CNC
('44440000-0000-0000-0000-000000000003','11111111-0000-0000-0000-000000000001','33330000-0000-0000-0000-000000000002',
 'Verificación Pre-Operación Torno','Chequeo de parámetros antes de iniciar maquinado','active','high','daily',15,'operator'),

-- Cortadora Laser
('44440000-0000-0000-0000-000000000004','11111111-0000-0000-0000-000000000001','33330000-0000-0000-0000-000000000004',
 'Inspección Diaria Laser','Verificación de óptica, gases y parámetros de corte','active','critical','daily',25,'operator'),

('44440000-0000-0000-0000-000000000005','11111111-0000-0000-0000-000000000001','33330000-0000-0000-0000-000000000004',
 'Calibración Semanal','Calibración de potencia y alineación del haz laser','active','critical','weekly',60,'supervisor'),

-- Compresor Principal
('44440000-0000-0000-0000-000000000006','11111111-0000-0000-0000-000000000001','33330000-0000-0000-0000-000000000006',
 'Ronda Operacional Compresor','Revisión de parámetros operacionales cada turno','active','critical','daily',10,'operator'),

-- Sistema Contra Incendios
('44440000-0000-0000-0000-000000000007','11111111-0000-0000-0000-000000000001','33330000-0000-0000-0000-000000000008',
 'Inspección Mensual SCI','Prueba funcional completa del sistema contra incendios','active','critical','monthly',90,'supervisor'),

-- Tratamiento Térmico
('44440000-0000-0000-0000-000000000008','11111111-0000-0000-0000-000000000001','33330000-0000-0000-0000-000000000010',
 'Control de Proceso Térmico','Registro y verificación de parámetros de tratamiento','active','high','manual',30,'operator');

-- -------------------------
-- CHECKLIST ITEMS - Inspección Diaria Prensa
-- -------------------------
INSERT INTO checklist_items (id, checklist_id, position, item_type, title, description, is_required, is_critical) VALUES
-- Sección: Sistema Hidráulico
('55550000-0000-0000-0001-000000000001','44440000-0000-0000-0000-000000000001',1,'check','Verificar nivel de aceite hidráulico','Nivel debe estar entre marcas MIN y MAX del visor',TRUE,TRUE),
('55550000-0000-0000-0001-000000000002','44440000-0000-0000-0000-000000000001',2,'measure','Presión del sistema hidráulico','Registrar presión en reposo del sistema',TRUE,TRUE),
('55550000-0000-0000-0001-000000000003','44440000-0000-0000-0000-000000000001',3,'check','Inspección visual de mangueras y conexiones','Verificar ausencia de fugas, grietas o desgaste',TRUE,TRUE),
-- Sección: Sistema Eléctrico
('55550000-0000-0000-0001-000000000004','44440000-0000-0000-0000-000000000001',4,'check','Estado de tablero eléctrico','Panel cerrado, sin alarmas activas, luces indicadoras OK',TRUE,TRUE),
('55550000-0000-0000-0001-000000000005','44440000-0000-0000-0000-000000000001',5,'check','Verificar paros de emergencia','Probar funcionamiento de botoneras de paro de emergencia',TRUE,TRUE),
-- Sección: Seguridad
('55550000-0000-0000-0001-000000000006','44440000-0000-0000-0000-000000000001',6,'check','Guardas y protecciones instaladas','Todas las guardas de seguridad en posición correcta',TRUE,TRUE),
('55550000-0000-0000-0001-000000000007','44440000-0000-0000-0000-000000000001',7,'check','Área de trabajo limpia y libre de obstáculos','No deben existir objetos en zona de operación',TRUE,FALSE),
('55550000-0000-0000-0001-000000000008','44440000-0000-0000-0000-000000000001',8,'check','EPP disponible y en buen estado','Guantes, lentes y calzado de seguridad disponibles',TRUE,FALSE),
-- General
('55550000-0000-0000-0001-000000000009','44440000-0000-0000-0000-000000000001',9,'text','Observaciones generales','Reportar cualquier condición anómala observada',FALSE,FALSE);

-- Actualizar unidades para el ítem de medición
UPDATE checklist_items SET unit='PSI', min_value=800, max_value=1200, target_value=1000
WHERE id='55550000-0000-0000-0001-000000000002';

-- -------------------------
-- CHECKLIST ITEMS - Inspección Laser
-- -------------------------
INSERT INTO checklist_items (id, checklist_id, position, item_type, title, description, is_required, is_critical, unit, min_value, max_value) VALUES
('55550000-0000-0000-0004-000000000001','44440000-0000-0000-0000-000000000004',1,'check','Limpiar lente de enfoque','Limpiar con paño especial IPA, verificar sin rayaduras',TRUE,TRUE,NULL,NULL,NULL),
('55550000-0000-0000-0004-000000000002','44440000-0000-0000-0000-000000000004',2,'measure','Presión de Nitrógeno','Verificar presión del gas de corte',TRUE,TRUE,'bar',12,18),
('55550000-0000-0000-0004-000000000003','44440000-0000-0000-0000-000000000004',3,'measure','Presión de Oxígeno','Verificar presión de gas auxiliar',TRUE,FALSE,'bar',5,10),
('55550000-0000-0000-0004-000000000004','44440000-0000-0000-0000-000000000004',4,'check','Alineación del haz','Verificar punto de enfoque en pieza de prueba',TRUE,TRUE,NULL,NULL,NULL),
('55550000-0000-0000-0004-000000000005','44440000-0000-0000-0000-000000000004',5,'measure','Potencia del láser','Medir potencia con medidor de potencia',TRUE,TRUE,'%',95,105),
('55550000-0000-0000-0004-000000000006','44440000-0000-0000-0000-000000000004',6,'check','Verificar sistema de extracción de humos','Filtros en buen estado, flujo adecuado',TRUE,TRUE,NULL,NULL,NULL),
('55550000-0000-0000-0004-000000000007','44440000-0000-0000-0000-000000000004',7,'check','Mesa de trabajo libre de residuos','Limpiar listones y retiro de piezas anteriores',TRUE,FALSE,NULL,NULL,NULL),
('55550000-0000-0000-0004-000000000008','44440000-0000-0000-0000-000000000004',8,'photo','Foto del corte de prueba','Tomar foto del primer corte de verificación',TRUE,FALSE,NULL,NULL,NULL),
('55550000-0000-0000-0004-000000000009','44440000-0000-0000-0000-000000000004',9,'text','Notas de turno','Condiciones especiales, material a procesar hoy',FALSE,FALSE,NULL,NULL,NULL);

-- -------------------------
-- CHECKLIST ITEMS - Compresor
-- -------------------------
INSERT INTO checklist_items (id, checklist_id, position, item_type, title, description, is_required, is_critical, unit, min_value, max_value, target_value) VALUES
('55550000-0000-0000-0006-000000000001','44440000-0000-0000-0000-000000000006',1,'measure','Presión de descarga','Presión en línea principal de distribución',TRUE,TRUE,'PSI',100,120,110),
('55550000-0000-0000-0006-000000000002','44440000-0000-0000-0000-000000000006',2,'measure','Temperatura de descarga','Temperatura del aire a la salida del compresor',TRUE,TRUE,'°C',60,80,70),
('55550000-0000-0000-0006-000000000003','44440000-0000-0000-0000-000000000006',3,'measure','Temperatura del aceite','Temperatura del lubricante en cárter',TRUE,TRUE,'°C',55,75,65),
('55550000-0000-0000-0006-000000000004','44440000-0000-0000-0000-000000000006',4,'check','Indicador de saturación filtro separador','Verde = OK, Rojo = requiere cambio',TRUE,TRUE,NULL,NULL,NULL,NULL),
('55550000-0000-0000-0006-000000000005','44440000-0000-0000-0000-000000000006',5,'check','Drenado de condensados','Abrir válvulas de drenado y verificar salida',TRUE,FALSE,NULL,NULL,NULL,NULL),
('55550000-0000-0000-0006-000000000006','44440000-0000-0000-0000-000000000006',6,'measure','Nivel de aceite','Verificar visor lateral del compresor',TRUE,TRUE,'%',70,100,90),
('55550000-0000-0000-0006-000000000007','44440000-0000-0000-0000-000000000006',7,'check','Ruidos y vibraciones anormales','Escuchar y comparar con operación normal',TRUE,FALSE,NULL,NULL,NULL,NULL),
('55550000-0000-0000-0006-000000000008','44440000-0000-0000-0000-000000000006',8,'select','Estado general del equipo','Evaluación subjetiva del operador',TRUE,FALSE,NULL,NULL,NULL,NULL);

UPDATE checklist_items SET options = '{"Excelente","Bueno","Regular","Requiere atención","Fuera de servicio"}'
WHERE id = '55550000-0000-0000-0006-000000000008';

-- -------------------------
-- EXECUTIONS (historial de ejecuciones)
-- -------------------------
INSERT INTO executions (id, org_id, checklist_id, machine_id, status, priority, scheduled_at, started_at, completed_at, score, notes) VALUES
-- Completadas
('66660000-0000-0000-0000-000000000001','11111111-0000-0000-0000-000000000001','44440000-0000-0000-0000-000000000001','33330000-0000-0000-0000-000000000001','completed','high',NOW()-INTERVAL'1 day',NOW()-INTERVAL'1 day 1 hour',NOW()-INTERVAL'1 day 45 min',100,'Todo en orden, inicio de turno sin novedad'),
('66660000-0000-0000-0000-000000000002','11111111-0000-0000-0000-000000000001','44440000-0000-0000-0000-000000000001','33330000-0000-0000-0000-000000000001','completed','high',NOW()-INTERVAL'2 days',NOW()-INTERVAL'2 days 1 hour',NOW()-INTERVAL'2 days 40 min',88,'Presión hidráulica en límite inferior, notificado supervisor'),
('66660000-0000-0000-0000-000000000003','11111111-0000-0000-0000-000000000001','44440000-0000-0000-0000-000000000006','33330000-0000-0000-0000-000000000006','completed','critical',NOW()-INTERVAL'3 hours',NOW()-INTERVAL'3 hours',NOW()-INTERVAL'2 hours 50 min',100,'Parámetros nominales, sin anomalías'),
-- En progreso
('66660000-0000-0000-0000-000000000004','11111111-0000-0000-0000-000000000001','44440000-0000-0000-0000-000000000004','33330000-0000-0000-0000-000000000004','in_progress','critical',NOW(),NOW(),NULL,NULL,'Iniciando revisión del sistema laser'),
-- Pendientes
('66660000-0000-0000-0000-000000000005','11111111-0000-0000-0000-000000000001','44440000-0000-0000-0000-000000000006','33330000-0000-0000-0000-000000000006','pending','critical',NOW()+INTERVAL'4 hours',NULL,NULL,NULL,NULL),
('66660000-0000-0000-0000-000000000006','11111111-0000-0000-0000-000000000001','44440000-0000-0000-0000-000000000001','33330000-0000-0000-0000-000000000001','pending','high',NOW()+INTERVAL'8 hours',NULL,NULL,NULL,NULL),
-- Fallida con hallazgo
('66660000-0000-0000-0000-000000000007','11111111-0000-0000-0000-000000000001','44440000-0000-0000-0000-000000000002','33330000-0000-0000-0000-000000000002','failed','high',NOW()-INTERVAL'5 days',NOW()-INTERVAL'5 days',NOW()-INTERVAL'4 days 55 min',60,'Falla en sistema de lubricación detectada');

-- -------------------------
-- FINDINGS
-- -------------------------
INSERT INTO findings (id, org_id, machine_id, execution_id, title, description, severity, status) VALUES
('77770000-0000-0000-0000-000000000001','11111111-0000-0000-0000-000000000001','33330000-0000-0000-0000-000000000002','66660000-0000-0000-0000-000000000007',
 'Fuga en bomba de lubricación','Se detectó fuga de aceite en sello de la bomba principal de lubricación del torno CNC. Requiere cambio de sello inmediato.','critical','open'),
('77770000-0000-0000-0000-000000000002','11111111-0000-0000-0000-000000000001','33330000-0000-0000-0000-000000000001','66660000-0000-0000-0000-000000000002',
 'Presión hidráulica baja','Presión registrada en 820 PSI, límite inferior 850 PSI. Revisar bomba hidráulica y filtros.','medium','in_progress'),
('77770000-0000-0000-0000-000000000003','11111111-0000-0000-0000-000000000001','33330000-0000-0000-0000-000000000005',NULL,
 'Dobladora en mantenimiento','Desgaste detectado en cuchillas superiores. Equipo en mantenimiento preventivo programado.','high','in_progress');
