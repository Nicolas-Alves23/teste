INSERT INTO fabricantes (nome) VALUES
  ('WEG'),
  ('Siemens'),
  ('Eberle')
ON DUPLICATE KEY UPDATE nome = VALUES(nome);

INSERT INTO motores
  (codigo, modelo, fabricante_id, potencia_cv, tensao, frequencia_hz, polos, rotacao_rpm, carcaca, grau_protecao, preco)
VALUES
  ('WEG-001', 'W22 IR3 Premium',  1, 1.00,  '220/380V', 60, 4, 1720, '71M',  'IP55', 890.00),
  ('WEG-002', 'W22 IR3 Premium',  1, 2.00,  '220/380V', 60, 4, 1730, '80M',  'IP55', 1120.50),
  ('WEG-003', 'W22 IR3 Premium',  1, 5.00,  '220/380V', 60, 4, 1750, '100L', 'IP55', 2340.00),
  ('WEG-004', 'W22 IR3 Premium', 1, 10.00, '220/380V', 60, 2, 3510, '132M', 'IP55', 4870.00),
  ('SIE-001', '1LA7 Standard',    2, 3.00,  '220/380V', 60, 6, 1150, '100L', 'IP55', 1980.00),
  ('SIE-002', '1LA7 Standard',    2, 7.50,  '380/660V', 60, 4, 1745, '132S', 'IP55', 3560.00),
  ('SIE-003', '1LA7 Standard',    2, 15.00, '380/660V', 60, 4, 1765, '160M', 'IP55', 6890.00),
  ('EBE-001', 'Eberle Trifásico', 3, 1.50,  '220/380V', 60, 4, 1715, '80M',  'IP54', 950.00),
  ('EBE-002', 'Eberle Trifásico', 3, 4.00,  '220/380V', 50, 4, 1450, '100L', 'IP54', 2010.00),
  ('EBE-003', 'Eberle Trifásico', 3, 6.00,  '220/380V', 50, 8, 720,  '132M', 'IP54', 2870.00),
  ('EBE-004', 'Eberle Compacto',  3, 0.50,  '220/380V', 60, 4, 1700, '63M',  'IP54', 410.00)
ON DUPLICATE KEY UPDATE modelo = VALUES(modelo);
